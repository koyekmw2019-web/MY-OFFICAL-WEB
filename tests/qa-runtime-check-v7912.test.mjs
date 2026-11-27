import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { runDiagnostic,connectionMetadata } from '../netlify/functions/qa-runtime-check-v7912.mts';
const origin='https://qa-v7-91-2-dashboard-simplification--yekun-ordinary-second-qa.netlify.app';
const url=origin+'/.netlify/functions/qa-runtime-check-v7912';
const deploy='0123456789abcdef01234567';
const ctx={site:{id:'56d19e67-cc2c-4bfe-802e-ce3c198494a3'},account:{id:'6b00669b8ca1a2a210030417'},deploy:{context:'branch-deploy',id:deploy},user:{id:'test-only'}};
const conn='postgresql://qa_writer:synthetic@ep-demo-pooler.example.test/qa_database?sslmode=require';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const endpoint=hash(['YKOC-QA-DB-ENDPOINT-v2','ep-demo.example.test','5432','qa_database']);
const role=hash(['YKOC-QA-DB-ROLE-v1','qa_writer']);
const req=(p={},over={})=>new Request(url,{method:'POST',headers:{origin,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({endpoint,role,deploy,...p}),...over});
const complete={database_name:'qa_database',effective_role:'qa_writer',session_role:'qa_writer',writable_session:true,non_superuser:true,schema_access:true,attempts_access:true,checkpoint_access:true,eligibility_history_read:true,coach_access:true,sequence_access:true,no_unexpected_rls:true,required_columns:true,quota_index:true};
function deps(row=complete,sdk=conn){const calls={url:0,db:0,sql:0};return {calls,getConnectionString(){calls.url++;return conn},getDatabase(){calls.db++;return {connectionString:sdk,async sql(strings){calls.sql++;assert.match(strings[0],/^SELECT/);assert.doesNotMatch(strings[0],/\b(?:INSERT INTO|UPDATE\s+public|DELETE FROM|ALTER TABLE)\b/i);return [row]}}}}}
test('pooler-normalized expected endpoint',()=>assert.equal(connectionMetadata(conn).fingerprint,endpoint));
test('endpoint changes rejected',()=>assert.notEqual(connectionMetadata(conn.replace('ep-demo','ep-other')).fingerprint,endpoint));
test('unsupported options rejected',()=>assert.throws(()=>connectionMetadata(conn+'&options=bad')));
test('correct GET no DB',async()=>{let d=deps();let r=await runDiagnostic(new Request(url),ctx,d);assert.equal(r.status,200);assert.deepEqual(d.calls,{url:0,db:0,sql:0});assert.match(r.headers.get('cache-control'),/no-store/)});
for(const [name,context,request,status] of [
 ['wrong site',{...ctx,site:{id:'official'}},req(),404],['wrong team',{...ctx,account:{id:'official'}},req(),404],['production',{...ctx,deploy:{...ctx.deploy,context:'production'}},req(),404],['preview context',{...ctx,deploy:{...ctx.deploy,context:'deploy-preview'}},req(),404],['unauthenticated',{...ctx,user:undefined},req(),403],['foreign origin',ctx,req({},{headers:{origin:'https://example.com','content-type':'application/x-www-form-urlencoded'}}),403],['wrong path',ctx,new Request(url+'x'),404],['query rejected',ctx,new Request(url+'?x=1'),404],['method rejected',ctx,new Request(url,{method:'PUT'}),405],['wrong deploy',ctx,req({deploy:'000000000000000000000000'}),400],['bad fingerprint',ctx,req({endpoint:'bad'}),400],['extra parameter',ctx,req({another:'a'}),400],['wrong endpoint',ctx,req({endpoint:'0'.repeat(64)}),409]
])test(name,async()=>{const d=deps(),r=await runDiagnostic(request,context,d);assert.equal(r.status,status);assert.equal(d.calls.db,0);assert.equal(d.calls.sql,0)});
test('SDK binding mismatch never queries',async()=>{const d=deps(complete,conn.replace('ep-demo','ep-other'));assert.equal((await runDiagnostic(req(),ctx,d)).status,409);assert.equal(d.calls.sql,0)});
test('success only booleans and status',async()=>{const d=deps(),r=await runDiagnostic(req(),ctx,d);assert.equal(r.status,200);assert.equal(d.calls.sql,1);const body=await r.text();assert.equal(JSON.parse(body).status,'verified');for(const secret of [endpoint,role,'ep-demo','qa_database','qa_writer','synthetic'])assert.ok(!body.includes(secret))});
for(const key of Object.keys(complete))test('fail closed: '+key,async()=>{const d=deps({...complete,[key]:false});const r=await runDiagnostic(req(),ctx,d);assert.equal(r.status,503);assert.equal((await r.json()).status,'blocked')});
test('unexpected dashboard role fail closed',async()=>assert.equal((await runDiagnostic(req({role:'0'.repeat(64)}),ctx,deps())).status,503));
test('error sanitized',async()=>{const d=deps();d.getDatabase=()=>{throw Error(conn)};let r=await runDiagnostic(req(),ctx,d);assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/synthetic|postgresql/)});
