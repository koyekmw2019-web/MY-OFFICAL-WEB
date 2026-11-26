import test from 'node:test';
import assert from 'node:assert/strict';
import {QA,endpointParts,endpointFingerprint} from '../../netlify/functions/_shared/qa-db-fingerprint-v7902.mjs';
import {PATH,IDENTITY_SQL,BASE_SQL,RATE_SQL,BASE_KEYS,RATE_KEYS,makeRuntimePreflight} from '../../netlify/functions/_shared/qa-db-runtime-preflight.mjs';

const raw='postgresql://qa_fixture_runtime:synthetic-only-password@qa-fixture-pooler.example.test/qa_fixture?sslmode=require';
const independent='postgresql://dashboard_fixture:fake@qa-fixture.example.test/qa_fixture';
const fingerprint=endpointFingerprint(endpointParts(independent));
const context=()=>({site:{id:QA.site},account:{id:QA.team},deploy:{context:'production',published:true},user:{id:'synthetic-team-user'}});
const url=QA.origin+PATH;
const request=(o={})=>new Request(o.url??url,{
  method:o.method??'POST',headers:o.headers??{'origin':QA.origin,'content-type':'application/x-www-form-urlencoded'},
  ...((o.method??'POST')==='POST'?{body:o.body??new URLSearchParams({fingerprint,stage:o.stage??'before'}).toString()}: {})
});
const flags=(keys,value=true)=>Object.fromEntries(keys.map(k=>[k,value]));
const goodIdentity={database_name:'qa_fixture',effective_role:'qa_fixture_runtime',login_role:'qa_fixture_runtime',
 read_only:true,writable_server:true,role_safe:true,database_connect:true,schema_usage:true};
function harness(o={}){
 const calls=[];let rollbackCount=0;
 const identity=o.identity??goodIdentity;
 const client={
  async query(sql){calls.push(sql);if(o.queryError===sql)throw Error(raw);
   if(sql.startsWith('BEGIN'))return {command:o.beginCommand??'BEGIN'};
   if(sql==='ROLLBACK'){rollbackCount++;if(o.rollbackError)throw Error(raw);return {command:o.rollbackCommand??'ROLLBACK'};}
   if(sql===IDENTITY_SQL)return {rows:o.identityRows??[identity]};
   if(sql===BASE_SQL)return {rows:o.baseRows??[o.base??flags(BASE_KEYS)]};
   if(sql===RATE_SQL)return {rows:o.rateRows??[o.rate??flags(RATE_KEYS)]};
   if(sql.startsWith('SET LOCAL '))return {command:'SET'};
   throw Error('Unexpected query');
  },
  release(destroy){calls.push(['release',destroy]);if(o.releaseError)throw Error(raw);}
 };
 let handler=makeRuntimePreflight({
  env:{SITE_ID:QA.site,...o.env},
  async requireAdmin(){calls.push('auth');if(o.authError)throw o.authError;return o.admin===undefined?{id:'synthetic-admin'}:o.admin;},
  async getConnectionString(){calls.push('sdk-url');if(o.sdkError)throw Error(raw);return o.raw??raw;},
  getDatabase(...args){calls.push('pool');assert.equal(args.length,0);if(o.poolError)throw Error(raw);return {connectionString:o.dbBinding??o.raw??raw,pool:{async connect(){calls.push('connect');if(o.connectError)throw Error(raw);return client;},async end(){calls.push('end');if(o.endError)throw Error(raw);}}};}
 });
 return {handler,calls,rollbackCount:()=>rollbackCount};
}
async function call(o={},r={},ctx=context()){
 const h=harness(o);const res=await h.handler(request(r),ctx);return {...h,status:res.status,body:await res.json(),headers:res.headers};
}
for(const [name,change] of [
 ['site mismatch',c=>c.site.id='wrong'],['team mismatch',c=>c.account.id='wrong'],
 ['preview context',c=>c.deploy.context='deploy-preview'],['unpublished deploy',c=>c.deploy.published=false],
 ['missing deploy metadata',c=>delete c.deploy],['missing site metadata',c=>delete c.site],
 ['missing team metadata',c=>delete c.account]
]){
 test(name+' blocks before auth and SDK',async()=>{const c=context();change(c);const r=await call({}, {},c);assert.equal(r.status,404);assert.deepEqual(r.calls,[]);});
}
for(const [name,options,expected] of [
 ['wrong environment site',{env:{SITE_ID:'wrong'}},404],
 ['no environment site',{env:{SITE_ID:undefined}},404],
 ['unauthorized admin',{authError:new Response('sensitive',{status:401})},401],
 ['forbidden admin',{authError:new Response('sensitive',{status:403})},403],
 ['missing admin',{admin:null},401],['admin without ID',{admin:{}},401],
 ['auth exception',{authError:Error(raw)},503],
]){
 test(name+' blocks without connection',async()=>{let r=await call(options);assert.equal(r.status,expected);assert(!r.calls.includes('sdk-url'));assert(!r.calls.includes('connect'));assert(!JSON.stringify(r.body).includes('sensitive'));});
}
test('missing team principal fails before auth',async()=>{let c=context();delete c.user;let r=await call({}, {},c);assert.equal(r.status,403);assert.deepEqual(r.calls,[]);});
for(const [name,req,status] of [
 ['wrong origin URL',{url:'https://other.example.test'+PATH},404],
 ['wrong path',{url:QA.origin+'/other'},404],['query string',{url:url+'?x=1'},404],
 ['unsupported method',{method:'PUT'},405],
 ['cross-origin POST',{headers:{origin:'https://wrong.example.test','content-type':'application/x-www-form-urlencoded'}},403],
 ['missing Origin',{headers:{'content-type':'application/x-www-form-urlencoded'}},403],
 ['JSON content type',{headers:{origin:QA.origin,'content-type':'application/json'}},400],
 ['missing fingerprint',{body:'stage=before'},400],['invalid fingerprint',{body:'fingerprint=abc&stage=before'},400],
 ['uppercase digest',{body:'fingerprint='+fingerprint.toUpperCase()+'&stage=before'},400],
 ['duplicate field',{body:'fingerprint='+fingerprint+'&stage=before&stage=after'},400],
 ['unknown field',{body:'fingerprint='+fingerprint+'&extra=before'},400],
 ['invalid stage',{body:'fingerprint='+fingerprint+'&stage=run_sql'},400],
 ['oversized stream',{body:'x'.repeat(1024)},400],
 ['oversized declared content length',{headers:{origin:QA.origin,'content-type':'application/x-www-form-urlencoded','content-length':'9999'}},400],
]){
 test(name+' blocks before SDK',async()=>{let r=await call({},req);assert.equal(r.status,status);assert(!r.calls.includes('sdk-url'));});
}
test('GET form is admin-only, masked, no store and executes no SQL',async()=>{
 let h=harness();let r=await h.handler(request({method:'GET'}),context());assert.equal(r.status,200);
 assert.match(await r.text(),/type="password"/);assert.equal(r.headers.get('referrer-policy'),'same-origin');
 assert.match(r.headers.get('cache-control'),/no-store/);assert.deepEqual(h.calls,['auth']);
});
test('cleanup enabled fails closed before SDK',async()=>{let r=await call({env:{YKOC_QA_STUDENT_RATE_CLEANUP:'enabled-v1'}});assert.equal(r.status,409);assert(!r.calls.includes('sdk-url'));});
test('endpoint mismatch does not acquire pool',async()=>{let r=await call({raw:raw.replace('qa-fixture-pooler','not-qa')});assert.equal(r.status,409);assert.equal(r.body.endpointMatch,false);assert.deepEqual(r.calls,['auth','sdk-url']);});
test('malformed SDK URL stops without pool or raw error',async()=>{let r=await call({raw:'broken secret'});assert.equal(r.status,503);assert.deepEqual(r.calls,['auth','sdk-url']);assert.deepEqual(r.body,{status:'unverified'});});
test('SDK URL without login role fails before pool',async()=>{let r=await call({raw:'postgresql://qa-fixture-pooler.example.test/qa_fixture'});assert.equal(r.status,503);assert.deepEqual(r.calls,['auth','sdk-url']);});
test('direct dashboard and pooler endpoint matches; before checks all true, exact statements and rollback',async()=>{
 let r=await call();assert.equal(r.status,200);assert.equal(r.body.status,'catalog_checks_passed');
 assert.equal(r.body.endpointMatch,true);assert.equal(r.body.writeProven,false);assert.equal(r.body.migrationAuthorized,false);
 assert.equal(r.body.checks.candidate_absent,true);assert.deepEqual(r.calls,['auth','sdk-url','pool','connect',
 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY',"SET LOCAL lock_timeout = '2000ms'","SET LOCAL statement_timeout = '5000ms'",
 "SET LOCAL idle_in_transaction_session_timeout = '10000ms'",IDENTITY_SQL,BASE_SQL,'ROLLBACK',['release',false],'end']);
 assert.match(r.headers.get('cache-control'),/no-store/);assert.equal(r.headers.get('referrer-policy'),'no-referrer');
 for(const secret of [raw,'qa_fixture','qa_fixture_runtime','synthetic-only-password',fingerprint])assert(!JSON.stringify(r.body).includes(secret));
});
for(const [name,change] of [['wrong database',{database_name:'other'}],['effective role mismatch',{effective_role:'other'}],['session role mismatch',{login_role:'other'}],
 ['not read only',{read_only:false}],['default read-only server',{writable_server:false}],['elevated role',{role_safe:false}],
 ['no connect',{database_connect:false}],['no schema usage',{schema_usage:false}],['nonboolean catalog flag',{role_safe:'true'}]]){
 test(name+' stops before application catalogs',async()=>{let r=await call({identity:{...goodIdentity,...change}});assert.equal(r.status,503);assert(!r.calls.includes(BASE_SQL));assert(!r.calls.includes(RATE_SQL));assert.equal(r.rollbackCount(),1);});
}
for(const key of BASE_KEYS){
 test('before gate rejects false '+key,async()=>{let r=await call({base:{...flags(BASE_KEYS),[key]:false}});assert.equal(r.status,503);assert.equal(r.body.checks[key],false);assert(!r.calls.includes(RATE_SQL));});
}
test('after stage with absent table blocks without rate catalog',async()=>{let r=await call({}, {stage:'after'});assert.equal(r.status,503);assert(!r.calls.includes(RATE_SQL));});
test('after stage all checks pass without writes',async()=>{let r=await call({base:{...flags(BASE_KEYS),candidate_absent:false}}, {stage:'after'});assert.equal(r.status,200);assert(r.calls.includes(RATE_SQL));assert.equal(r.body.writeProven,false);assert.equal(r.body.migrationAuthorized,false);});
for(const key of RATE_KEYS){
 test('after gate rejects false '+key,async()=>{let r=await call({base:{...flags(BASE_KEYS),candidate_absent:false},rate:{...flags(RATE_KEYS),[key]:false}}, {stage:'after'});assert.equal(r.status,503);assert.equal(r.body.checks[key],false);});
}
for(const [name,options] of [
 ['SDK throw',{sdkError:true}],['pool throw',{poolError:true}],['connect throw',{connectError:true}],['unconfirmed begin',{beginCommand:'BAD'}],
 ['catalog exception',{queryError:BASE_SQL}],['empty identity row',{identityRows:[]}],['multiple metadata rows',{baseRows:[{},{}]}],
 ['rollback throws',{rollbackError:true}],['rollback unconfirmed',{rollbackCommand:'BAD'}],['release throws',{releaseError:true}],['end throws',{endError:true}]
]){
 test(name+' returns sanitized fail closed',async()=>{let r=await call(options);assert.equal(r.status,503);assert.deepEqual(r.body,{status:'unverified'});if(r.calls.some(x=>Array.isArray(x)&&x[0]==='release')&&!options.releaseError&&!options.endError)assert.deepEqual(r.calls.find(x=>Array.isArray(x)&&x[0]==='release'),['release',true]);});
}
test('catalog SQL contains no application-row reads or mutation statements',()=>{
 for(const sql of [IDENTITY_SQL,BASE_SQL,RATE_SQL]){
  assert(!/\b(?:INSERT\s+INTO|UPDATE\s+public\.|DELETE\s+FROM|CREATE\s+(?:TABLE|INDEX)|DROP\s+TABLE|ALTER\s+TABLE)\b/i.test(sql));
  assert(!/\b(?:FROM|JOIN)\s+(?:public\.)?(?:exam_students|exam_student_verification_failures|exam_payment_requests|ykcr_sync_events)\b/i.test(sql));
 }
});

test('SDK default binding changed: no pool connection, pool closed',async()=>{let r=await call({dbBinding:raw.replace('qa-fixture-pooler','other')});assert.equal(r.status,503);assert.deepEqual(r.calls,['auth','sdk-url','pool','end']);});
