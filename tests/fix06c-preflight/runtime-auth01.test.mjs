import test from 'node:test';
import assert from 'node:assert/strict';
import {QA,endpointParts,endpointFingerprint} from '../../netlify/functions/_shared/qa-db-fingerprint-v7902.mjs';
import {PATH,makeRuntimePreflight} from '../../netlify/functions/_shared/qa-db-runtime-preflight.mjs';
import {makeQaPreflightAdmin} from '../../netlify/functions/_shared/qa-db-runtime-auth01.mjs';

const TOKEN='syntheticHeader.syntheticPayload.syntheticSignature';
const PROVIDER=QA.origin+'/.netlify/identity/user';
const raw='postgresql://fixture_role:synthetic-db-password@fixture.example.test/fixture_database';
const digest=endpointFingerprint(endpointParts(raw));
const user=roles=>({id:'synthetic-app-admin',app_metadata:{roles},user_metadata:{roles:['admin']},email:'synthetic@example.test'});
const providerJson=(value=user(['admin']),opts={})=>Response.json(value,opts);
const context=(token=TOKEN)=>({
 site:{id:QA.site},account:{id:QA.team},deploy:{context:'production',published:true},
 user:{id:'synthetic-team-id'},cookies:{get(name){assert.equal(name,'nf_jwt');return token;}}
});
function request(options={}){
 const method=options.method??'GET';
 return new Request(options.url??QA.origin+PATH,{
  method,headers:options.headers??{
    cookie:'other=not-forwarded; nf_jwt='+TOKEN+'; nf_refresh=never-forward-this',
    ...(method==='POST'?{'origin':QA.origin,'content-type':'application/x-www-form-urlencoded'}:{})
  },...(method==='POST'?{body:options.body??new URLSearchParams({fingerprint:digest,stage:'before'})}:{})
 });
}
function harness(options={}){
 const calls=[];
 const env={SITE_ID:QA.site,...options.env};
 const guard=makeQaPreflightAdmin({
  env,
  async requireAdmin(){calls.push('sdk');if(options.sdk!==undefined){if(options.sdk instanceof Error||options.sdk instanceof Response)throw options.sdk;return options.sdk;}throw new Response('secret sdk detail',{status:401});},
  async fetchIdentity(url,init){
   calls.push('provider');
   assert.equal(url,PROVIDER);assert.equal(init.method,'GET');assert.equal(init.redirect,'error');assert.equal(init.cache,'no-store');assert.equal(init.credentials,'omit');assert(init.signal instanceof AbortSignal);
   assert.deepEqual(init.headers,{Authorization:'Bearer '+(options.expectedToken??TOKEN),Accept:'application/json'});
   assert.equal(init.body,undefined);
   if(options.providerError)throw options.providerError;
   return options.provider?.()??providerJson();
  }
 });
 const handler=async(req,ctx)=>makeRuntimePreflight({
  env,requireAdmin:()=>guard(req,ctx),
  getConnectionString:()=>{calls.push('sdk-url');return options.runtimeUrl??raw;},
  getDatabase:()=>{calls.push('pool');throw Error('must not connect in auth-only tests');}
 })(req,ctx);
 return {calls,guard,handler};
}
async function run(options={},req=request(),ctx=context()){
 const h=harness(options);const res=await h.handler(req,ctx);const body=await res.text();return {...h,status:res.status,headers:res.headers,body};
}
const noDb=r=>{assert(!r.calls.includes('sdk-url'));assert(!r.calls.includes('pool'));assert(!r.body.includes(TOKEN));assert(!r.body.includes('synthetic-app-admin'));assert(!r.body.includes('synthetic@example.test'));assert(!r.body.includes('secret sdk detail'));assert.match(r.headers.get('cache-control'),/no-store/);};
test('existing SDK admin succeeds without fallback or DB',async()=>{
 const r=await run({sdk:{id:'sdk-admin'}});assert.equal(r.status,200);assert.deepEqual(r.calls,['sdk']);noDb(r);
});
test('observed 401 path repaired locally: provider-validated admin receives protected form',async()=>{
 const r=await run();assert.equal(r.status,200);assert.deepEqual(r.calls,['sdk','provider']);assert.match(r.body,/type="password"/);noDb(r);
});
test('SDK result lacks ID: independent provider verifies real admin',async()=>{
 const r=await run({sdk:{}});assert.equal(r.status,200);assert.deepEqual(r.calls,['sdk','provider']);noDb(r);
});
test('SDK null: independent provider verifies real admin',async()=>{
 const r=await run({sdk:null});assert.equal(r.status,200);assert.deepEqual(r.calls,['sdk','provider']);noDb(r);
});
test('SDK explicit 403 never falls back even if provider would return admin',async()=>{
 let r=await run({sdk:new Response('secret sdk detail',{status:403})});assert.equal(r.status,403);assert.deepEqual(r.calls,['sdk']);noDb(r);
});
test('SDK unexpected error never falls back',async()=>{
 let r=await run({sdk:Error(TOKEN)});assert.equal(r.status,503);assert.deepEqual(r.calls,['sdk']);noDb(r);
});
test('SDK 503 never falls back',async()=>{
 let r=await run({sdk:new Response('secret sdk detail',{status:503})});assert.equal(r.status,503);assert.deepEqual(r.calls,['sdk']);noDb(r);
});
for(const [label,edit,status] of [
 ['wrong site',c=>c.site.id='wrong',404],['wrong team',c=>c.account.id='wrong',404],
 ['preview',c=>c.deploy.context='deploy-preview',404],['unpublished',c=>c.deploy.published=false,404],
 ['missing team user',c=>delete c.user,403],['empty team user',c=>c.user.id='',403],
 ['numeric team user',c=>c.user.id=123,403]
]){
 test(label+' never calls auth, provider or DB',async()=>{
  const c=context();edit(c);const r=await run({},request(),c);assert.equal(r.status,status);assert(!r.calls.includes('provider'));noDb(r);
 });
}
for(const [label,req,status] of [
 ['wrong URL',request({url:'https://official.example.test'+PATH}),404],
 ['wrong path',request({url:QA.origin+'/other'}),404],['query string',request({url:QA.origin+PATH+'?token=x'}),404],
 ['wrong method',request({method:'PUT'}),405],
 ['cross-origin POST',request({method:'POST',headers:{origin:'https://untrusted.example.test'}}),403],
 ['missing origin POST',request({method:'POST',headers:{}}),403]
]){
 test(label+' blocked before Identity',async()=>{const r=await run({},req);assert.equal(r.status,status);assert.deepEqual(r.calls,[]);noDb(r);});
}
test('direct defensive scope guard cannot leak cookie on a foreign URL',async()=>{
 const h=harness();await assert.rejects(h.guard(request({url:'https://untrusted.example.test'+PATH}),context()),e=>e instanceof Response&&e.status===404);assert.deepEqual(h.calls,[]);
});
test('wrong environment site blocks before all calls',async()=>{const r=await run({env:{SITE_ID:'wrong'}});assert.equal(r.status,404);assert.deepEqual(r.calls,[]);noDb(r);});
for(const [label,token] of [
 ['no token',null],['empty token',''],['refresh-like token','not-jwt'],['two segments','a.b'],
 ['four segments','a.b.c.d'],['empty signature','a.b.'],['whitespace','a.b.c '],
 ['invalid character','a.b.c/'],['oversized','a'.repeat(8192)+'.b.c'],['non-string',{}]
]){
 test(label+' fails without provider',async()=>{const r=await run({},request({headers:{}}),context(token));assert.equal(r.status,401);assert.deepEqual(r.calls,['sdk']);noDb(r);});
}
test('cookie parser unavailable fails without provider',async()=>{let c=context();delete c.cookies;const r=await run({},request(),c);assert.equal(r.status,401);assert.deepEqual(r.calls,['sdk']);noDb(r);});
for(const [label,cookie] of [
 ['duplicate cookie','nf_jwt='+TOKEN+'; nf_jwt='+TOKEN],
 ['case-ambiguous cookie','nf_jwt='+TOKEN+'; NF_JWT='+TOKEN],
 ['case variant only','NF_JWT='+TOKEN],
 ['raw/parser disagreement','nf_jwt=a.b.c'],
 ['only unrelated raw cookie','other=value'],
 ['oversized cookie','other='+'x'.repeat(32769)+'; nf_jwt='+TOKEN],
]){
 test(label+' rejected before provider',async()=>{const r=await run({},request({headers:{cookie}}));assert.equal(r.status,401);assert.deepEqual(r.calls,['sdk']);noDb(r);});
}
test('request-scoped platform cookie works even if raw cookie header is not exposed',async()=>{const r=await run({},request({headers:{}}));assert.equal(r.status,200);assert.deepEqual(r.calls,['sdk','provider']);noDb(r);});
test('visitor Authorization and role headers cannot authenticate without platform cookie',async()=>{
 const r=await run({},request({headers:{authorization:'Bearer '+TOKEN,'x-role':'admin','x-user-role':'admin','x-netlify-user':'admin'}}),context(null));
 assert.equal(r.status,401);assert.deepEqual(r.calls,['sdk']);noDb(r);
});
for(const [label,roles] of [
 ['ordinary member',['member']],['missing',undefined],['malformed string','admin'],['malformed object',{0:'admin',length:1}],
 ['null',null],['empty',[]],['mixed',['admin',null]],['nested',[['admin']]],['case variation',['Admin']],['prefix',['superadmin']],['whitespace',[' admin ']]
]){
 test('provider '+label+' role fails closed even when user_metadata claims admin',async()=>{
  const r=await run({provider:()=>providerJson(user(roles))});assert.equal(r.status,403);assert.deepEqual(r.calls,['sdk','provider']);noDb(r);
 });
}
test('top-level or user_metadata admin is not trusted',async()=>{const r=await run({provider:()=>providerJson({id:'synthetic-user',roles:['admin'],user_metadata:{roles:['admin']}})});assert.equal(r.status,403);noDb(r);});
for(const [label,identity] of [['missing ID',{app_metadata:{roles:['admin']}}],['empty ID',{id:'',app_metadata:{roles:['admin']}}],['malformed ID',{id:123,app_metadata:{roles:['admin']}}],['blank ID',{id:' ',app_metadata:{roles:['admin']}}],['array',[]],['null',null]]){
 test('provider '+label+' returns 401',async()=>{const r=await run({provider:()=>providerJson(identity)});assert.equal(r.status,401);noDb(r);});
}
for(const [status,expected] of [[401,401],[403,403],[404,503],[429,503],[500,503],[302,503],[204,503]]){
 test('provider HTTP '+status+' never opens DB',async()=>{const r=await run({provider:()=>new Response(null,{status})});assert.equal(r.status,expected);noDb(r);});
}
for(const [label,provider] of [
 ['non-JSON',()=>new Response('HTML secret',{status:200,headers:{'content-type':'text/html'}})],
 ['invalid JSON',()=>new Response('bad json',{headers:{'content-type':'application/json'}})],
 ['oversized declared response',()=>new Response('{}',{headers:{'content-type':'application/json','content-length':'999999'}})],
 ['oversized streamed response',()=>new Response('x'.repeat(65537),{headers:{'content-type':'application/json'}})],
 ['redirected response',()=>{let r=providerJson();Object.defineProperty(r,'redirected',{value:true});return r;}],
 ['wrong provider response URL',()=>{let r=providerJson();Object.defineProperty(r,'url',{value:'https://wrong.example.test'});return r;}]
]){
 test(label+' blocked and sanitized',async()=>{const r=await run({provider});assert.equal(r.status,503);noDb(r);});
}
test('provider network or timeout error sanitized',async()=>{const r=await run({providerError:Error(TOKEN)});assert.equal(r.status,503);noDb(r);});
test('validated Admin POST still requires expected independent fingerprint',async()=>{
 const r=await run({},request({method:'POST',body:'stage=before'}));assert.equal(r.status,400);assert.deepEqual(r.calls,['sdk','provider']);noDb(r);
});
test('validated Admin POST with mismatched endpoint still avoids pool',async()=>{
 const r=await run({runtimeUrl:raw.replace('fixture.example','other.example')},request({method:'POST'}));assert.equal(r.status,409);assert.deepEqual(r.calls,['sdk','provider','sdk-url']);assert(!r.calls.includes('pool'));assert(!r.body.includes(TOKEN));
});
test('validated Admin POST still cannot run with enabled cleanup flag',async()=>{
 const r=await run({env:{YKOC_QA_STUDENT_RATE_CLEANUP:'enabled-v1'}},request({method:'POST'}));assert.equal(r.status,409);noDb(r);
});
test('non-admin POST cannot reach even SDK connection string',async()=>{
 const r=await run({provider:()=>providerJson(user(['member']))},request({method:'POST'}));assert.equal(r.status,403);noDb(r);
});
test('separate concurrent requests use only their own cookies',async()=>{
 const seen=[];
 const guard=makeQaPreflightAdmin({env:{SITE_ID:QA.site},requireAdmin:async()=>{throw new Response(null,{status:401});},
  fetchIdentity:async(url,init)=>{seen.push(init.headers.Authorization);await new Promise(r=>setImmediate(r));return providerJson({id:init.headers.Authorization.endsWith('one')?'one':'two',app_metadata:{roles:['admin']}});}});
 const a='test.token.one',b='test.token.two';
 const result=await Promise.all([guard(request({headers:{}}),context(a)),guard(request({headers:{}}),context(b))]);
 assert.deepEqual(result,[{id:'one'},{id:'two'}]);assert.deepEqual(seen,['Bearer '+a,'Bearer '+b]);
});

// End-to-end function adapter with actual pinned SDK import and original auth
// guard. No real HTTP, credentials or SQL: capture fetch before importing.
test('actual pinned SDK: missing global Identity context recovers via per-request cookie',async()=>{
 const priorFetch=globalThis.fetch, priorSite=process.env.SITE_ID;
 const priorIdentity=globalThis.netlifyIdentityContext,priorNetlify=globalThis.Netlify;
 const seen=[];
 try{
  delete globalThis.netlifyIdentityContext;delete globalThis.Netlify;process.env.SITE_ID=QA.site;
  globalThis.fetch=async(url,opts)=>{seen.push([url,opts.method,opts.headers.Authorization]);return providerJson();};
  const {default:handler}=await import('../../netlify/functions/qa-db-runtime-preflight.mts');
  const response=await handler(request(),context());
  assert.equal(response.status,200);assert.match(await response.text(),/Private QA database runtime preflight/);
  assert.deepEqual(seen,[[PROVIDER,'GET','Bearer '+TOKEN]]);
 }finally{
  globalThis.fetch=priorFetch;
  if(priorSite===undefined)delete process.env.SITE_ID;else process.env.SITE_ID=priorSite;
  if(priorIdentity===undefined)delete globalThis.netlifyIdentityContext;else globalThis.netlifyIdentityContext=priorIdentity;
  if(priorNetlify===undefined)delete globalThis.Netlify;else globalThis.Netlify=priorNetlify;
 }
});
