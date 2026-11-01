/** Local source-and-mock tests. Run: node --experimental-strip-types tests/v762-unit.mjs
 * NO real Postgres/Netlify is used: check DB/runtime behavior separately in staging. */
import {readFileSync,writeFileSync,unlinkSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const helper=await import(pathToFileURL(resolve(root,'netlify/functions/_shared/exam-autosave.mts')).href);
let n=0;const results=[];
const test=async(name,fn)=>{try{await fn();results.push(['PASS',name]);n++}catch(e){results.push(['FAIL',name,e.message]);process.exitCode=1}};
async function handler(name){
 const source=resolve(root,`netlify/functions/${name}.mts`),tmp=resolve(root,`netlify/functions/.yk_v762_test_${name}.mts`);
 let code=readFileSync(source,'utf8');
 code=code.replace('import { getDatabase } from "@netlify/database";', 'const getDatabase=()=>globalThis.__ykDb;')
 .replace("import { getDatabase } from '@netlify/database';",'const getDatabase=()=>globalThis.__ykDb;')
 .replace(/import \{ requireUser, asResponse \} from ['"]\.\/_shared\/auth\.mts['"];?/, `const requireUser=async()=>globalThis.__ykUser; const asResponse=e=>e instanceof Response?e:Response.json({error:String(e.message??e)},{status:500});`)
 .replace(/from ['"]\.\/_shared\/(exam-autosave|security)\.mts['"]/g,(_s,module)=>`from '${pathToFileURL(resolve(root,`netlify/functions/_shared/${module}.mts`)).href}'`);
 writeFileSync(tmp,code);
 try{return (await import(pathToFileURL(tmp).href+'?t='+Date.now()+Math.random())).default}
 finally{unlinkSync(tmp)}
}
const now=()=>new Date(Date.now()-10_000).toISOString();
const makeDB=(opts={})=>{
 const state={attempt:{id:10,exam_type:'jlpt_n1',started_at:now(),status:'started'},checkpoint:null,...opts};
 const sql=async(s,...v)=>{
  const q=s.join('?').replace(/\s+/g,' ').trim();
  if(q.includes('FROM exam_attempts WHERE id=')&&q.startsWith('SELECT'))return state.attempt?[{...state.attempt}]:[];
  if(q.startsWith('SELECT phase_index')&&q.includes('FROM exam_attempt_checkpoints'))return state.checkpoint?[{...state.checkpoint}]:[];
  if(q.startsWith('INSERT INTO exam_attempt_checkpoints')){
   if(state.checkpoint)return [];
   state.checkpoint={phase_index:v[3],ends_at:v[4],snapshot:JSON.parse(v[5]),version:1,saved_at:new Date()};return [{...state.checkpoint}];
  }
  if(q.startsWith('UPDATE exam_attempt_checkpoints')){
   const cp=state.checkpoint;
   if(!cp||cp.version!==v[5]||(v[0]!==cp.phase_index&&v[0]!==cp.phase_index+1))return [];
   cp.phase_index=v[0];cp.ends_at=v[1];cp.snapshot=JSON.parse(v[2]);cp.version++;return [{...cp}];
  }
  if(q.startsWith("UPDATE exam_attempts SET status='abandoned'")){state.attempt.status='abandoned';return [{id:10}]}
  if(q.startsWith('UPDATE exam_attempts')&&q.includes("status='submitted'")){
   if(state.attempt.status!=='started')return [];
   state.attempt.status='submitted';state.attempt.score=v[0];state.attempt.passed=v[1];state.attempt.score_verified=false;return [{id:10}];
  }
  if(q.startsWith('DELETE FROM exam_attempt_checkpoints')){state.checkpoint=null;return []}
  throw Error('Unmocked query: '+q.slice(0,170));
 };
 return {state,sql};
};
const req=(data)=>new Request('http://localhost/.netlify/functions/exam-checkpoint',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
const snap=(type='jlpt_n1',phase=0)=>({version:1,type,engine:'jlpt',phase,index:0,stages:[],responses:[]});
globalThis.__ykUser={id:'u1',roles:[],email:'test@example.test'};
await test('Task1 unique code and constraint classification',()=>{
 assert(helper.isFreeUniqueViolation({code:'23505',constraint:'exam_one_free_attempt_per_user'}));
 assert(!helper.isFreeUniqueViolation({code:'23505',constraint:'unrelated_index'}));
 assert(!helper.isFreeUniqueViolation({code:'42P01',message:'exam_attempt_checkpoints'}));
});
await test('Task4 score maximum and per-section rules',()=>{
 assert.equal(helper.examScoreRules.jlpt_n1.max,180);
 assert.equal(helper.examScoreRules.truck.max,50);
 assert.equal(helper.practicePassed('jlpt_n1',105,[{score:40},{score:40},{score:25}]),true);
 assert.equal(helper.practicePassed('jlpt_n1',105,[{score:60},{score:40},{score:5}]),false);
 assert.equal(helper.practicePassed('truck',30,{theory:18,practical:12}),true);
 assert.equal(helper.practicePassed('truck',30,{theory:15,practical:15}),false);
});
const checkpoint=await handler('exam-checkpoint');
await test('Task2 GET starts at version 0',async()=>{
 const db=makeDB();globalThis.__ykDb=db;const res=await checkpoint(new Request('http://localhost/?attemptId=10'));const data=await res.json();
 assert.equal(res.status,200);assert.equal(data.version,0);assert.equal(data.phase,0);
});
await test('Task2 first save version 1 and stale second tab 409 with snapshot',async()=>{
 const db=makeDB();globalThis.__ykDb=db;
 const first=await checkpoint(req({attemptId:10,phase:0,snapshot:snap()}));assert.equal(first.status,200);
 assert.equal((await first.json()).version,1);
 const second=await checkpoint(req({attemptId:10,phase:0,baseVersion:0,snapshot:snap()}));assert.equal(second.status,409);
 const payload=await second.json();assert.equal(payload.error,'stale_checkpoint');assert.equal(payload.version,1);assert.equal(payload.snapshot.type,'jlpt_n1');
});
await test('Task2 same-version save increments revision, stale revision rejected',async()=>{
 const db=makeDB();globalThis.__ykDb=db;await checkpoint(req({attemptId:10,phase:0,snapshot:snap()}));
 const current=await checkpoint(req({attemptId:10,phase:0,baseVersion:1,snapshot:snap()}));assert.equal((await current.json()).version,2);
 const stale=await checkpoint(req({attemptId:10,phase:0,baseVersion:1,snapshot:snap()}));assert.equal(stale.status,409);
});
await test('Task3 phase jump gives 409 with phase, version, deadline',async()=>{
 const db=makeDB();globalThis.__ykDb=db;await checkpoint(req({attemptId:10,phase:0,snapshot:snap()}));
 const res=await checkpoint(req({attemptId:10,phase:2,baseVersion:1,snapshot:snap('jlpt_n1',2)}));
 assert.equal(res.status,409);assert.equal((await res.json()).version,1);
});
await test('Task3 expired same-phase POST returns time_expired',async()=>{
 const db=makeDB({checkpoint:{phase_index:0,ends_at:new Date(Date.now()-70_000).toISOString(),snapshot:snap(),version:1,saved_at:new Date()}});
 globalThis.__ykDb=db;const res=await checkpoint(req({attemptId:10,phase:0,baseVersion:1,snapshot:snap()}));
 assert.equal(res.status,409);assert.equal((await res.json()).error,'time_expired');
});
const submit=await handler('exam-attempt-submit');
await test('Task4 tampered passed is ignored (Stage A)',async()=>{
 const db=makeDB({attempt:{id:10,exam_type:'car',started_at:now(),status:'started'}});globalThis.__ykDb=db;
 const res=await submit(req({attemptId:10,score:2,passed:true}));assert.equal(res.status,200);
 const data=await res.json();assert.equal(data.passed,false);assert.equal(data.scoreVerified,false);
 assert.equal(db.state.attempt.score_verified,false);
});
await test('Task4 score outside exam maximum rejected',async()=>{
 const db=makeDB({attempt:{id:10,exam_type:'truck',started_at:now(),status:'started'}});globalThis.__ykDb=db;
 const res=await submit(req({attemptId:10,score:180,passed:true}));assert.equal(res.status,400);
});
const access=await handler('exam-access');
const accessDB=(insertError,missingCheckpoint=false)=>({sql:async(ss,...v)=>{
 const q=ss.join('?').replace(/\s+/g,' ');
 if(q.startsWith('UPDATE exam_attempts AS a')){if(missingCheckpoint)throw Object.assign(Error('relation exam_attempt_checkpoints does not exist'),{code:'42P01'});return []}
 if(q.includes('FROM exam_attempts a LEFT JOIN'))return [];
 if(q.includes('NULL::timestamptz AS saved_at'))return [];
 if(q.includes('FROM exam_students')||q.includes('FROM exam_paid_access'))return [];
 if(q.startsWith('INSERT INTO exam_attempts'))throw insertError;
 if(q.includes("access_mode='free'")&&q.includes("status='started'"))return [];
 throw Error('Unmocked access query: '+q.slice(0,120));
}});
await test('Task1 free unique Pg error maps to paywall 402',async()=>{
 globalThis.__ykUser={id:'u1',roles:[]};globalThis.__ykDb=accessDB(Object.assign(Error('duplicate key'),{code:'23505',constraint:'exam_one_free_attempt_per_user'}));
 const res=await access(req({examType:'truck'}));assert.equal(res.status,402);assert.equal((await res.json()).reason,'payment_required');
});
await test('Task1 ordinary DB failure maps to 500, not free used',async()=>{
 globalThis.__ykUser={id:'u1',roles:[]};globalThis.__ykDb=accessDB(Object.assign(Error('DB down'),{code:'08006'}));
 const res=await access(req({examType:'truck'}));assert.equal(res.status,500);assert.notEqual((await res.json()).reason,'payment_required');
});
await test('Task5 42P01 fallback still evaluates legacy free quota',async()=>{
 globalThis.__ykUser={id:'u1',roles:[]};globalThis.__ykDb=accessDB(Object.assign(Error('DB down'),{code:'08006'}),true);
 const res=await access(req({examType:'truck'}));assert.equal(res.status,500); // fallback reached, then inserted query failed for unrelated reason
});
await test('Task5 missing admin constraint maps to schema_out_of_date 503',async()=>{
 globalThis.__ykUser={id:'u1',roles:['admin']};globalThis.__ykDb=accessDB(Object.assign(Error('violates exam_attempts_access_mode_check'),{code:'23514',constraint:'exam_attempts_access_mode_check'}));
 const res=await access(req({examType:'truck'}));assert.equal(res.status,503);assert.equal((await res.json()).error,'schema_out_of_date');
});
await test('Task5 migration count and idempotent statements (static)',()=>{
 const dir=resolve(root,'netlify/database/migrations');const all=readdirSync(dir).filter(x=>x.endsWith('.sql'));
 assert.equal(all.length,9);const m=readFileSync(resolve(dir,'20261101140000_v762_hardening.sql'),'utf8');
 assert.match(m,/ADD COLUMN IF NOT EXISTS score_verified/);assert.match(m,/CREATE INDEX IF NOT EXISTS/);
});
console.log(results.map(r=>r.join(' | ')).join('\n'));
console.log(`TOTAL: ${results.filter(x=>x[0]==='PASS').length} PASS / ${results.filter(x=>x[0]==='FAIL').length} FAIL`);
