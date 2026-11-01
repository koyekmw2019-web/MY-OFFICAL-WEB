/** v7.63 isolated QA: Node 22+ --experimental-strip-types. Mock DB (not Netlify). */
import {readFileSync,writeFileSync,unlinkSync, readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {key} from '../netlify/functions/_shared/exam-answer-key-v763.mts';
import {evaluateSnapshot} from '../netlify/functions/_shared/exam-score-v763.mts';
import {EXAM_FREE_POLICY,isFreeUniqueViolation} from '../netlify/functions/_shared/exam-autosave.mts';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
let pass=0, fail=0;
async function test(name,fn){try{await fn(); console.log('PASS '+name);pass++}catch(e){console.error('FAIL '+name+' — '+e.stack);fail++}}
async function handler(name){
 const source=resolve(root,`netlify/functions/${name}.mts`),tmp=resolve(root,`netlify/functions/.v763_test_${name}.mts`);
 let src=readFileSync(source,'utf8');
 src=src.replace(/import \{ getDatabase \} from ['"]@netlify\/database['"];?/, 'const getDatabase=()=>globalThis.__ykDb;')
 .replace(/import \{ requireUser, asResponse \} from ['"]\.\/_shared\/auth\.mts['"];?/, 'const requireUser=async()=>globalThis.__ykUser;const asResponse=e=>e instanceof Response?e:Response.json({error:String(e.message??e)},{status:500});')
 .replace(/from ['"]\.\/_shared\/([^'"]+)['"]/g,(_s,n)=>`from '${pathToFileURL(resolve(root,`netlify/functions/_shared/${n}`)).href}'`);
 writeFileSync(tmp,src);
 try{return (await import(pathToFileURL(tmp).href+'?v763='+Date.now())).default}finally{unlinkSync(tmp)}
}
const req=(o,path='exam-attempt-submit')=>new Request('http://local/.netlify/functions/'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)});
const now=new Date(Date.now()-10_000).toISOString();
const future=new Date(Date.now()+60_000).toISOString();
const late=new Date(Date.now()-61_000).toISOString();
const mkDb=(type='jlpt_n5',snapshot=null,opts={})=>{
 const state={attempt:{id:42,exam_type:type,started_at:now,status:'started',score:null,passed:null,score_verified:false},
   checkpoint:snapshot?{phase_index:snapshot.phase??0,ends_at:future,snapshot,version:2}:null,...opts};
 const sql=async(s,...v)=>{
   const query=s.join('?').replace(/\s+/g,' ').trim();
   if(query.startsWith('SELECT')&&query.includes('FROM exam_attempts')&&query.includes('WHERE id='))return state.attempt?[{...state.attempt}]:[];
   if(query.startsWith('SELECT')&&query.includes('FROM exam_attempt_checkpoints'))return state.checkpoint?[{...state.checkpoint}]:[];
   if(query.startsWith('UPDATE exam_attempts')&&query.includes("status='submitted'")){
     if(!state.checkpoint||state.attempt.status!=='started'||new Date(state.checkpoint.ends_at).getTime()<Date.now()-60_000)return [];
     state.attempt.status='submitted';state.attempt.score=v[0];state.attempt.passed=v[1];state.attempt.score_verified=true;return [{id:42}];
   }
   if(query.startsWith('UPDATE exam_attempts')&&query.includes("status='abandoned'")){state.attempt.status='abandoned';return [{id:42}]}
   if(query.startsWith('DELETE FROM exam_attempt_checkpoints')){state.checkpoint=null;return []}
   if(query.startsWith('INSERT INTO yk_learning_mistakes'))return [];
   if(query.startsWith('UPDATE exam_attempt_checkpoints'))return [];
   throw Error('Unmocked SQL: '+query.slice(0,220));
 };
 return {sql,state};
};
function jlptSnap(level='N5'){
 const q=Object.entries(key.jlpt).filter(([_,v])=>v.level===level).map(([id,v])=>({id,...v}));
 const take=sec=>q.filter(x=>x.section===sec);
 const is2=['N1','N2'].includes(level);
 const groups=is2?[['vocabulary','grammar','reading'],['listening']]:[['vocabulary'],['grammar','reading'],['listening']];
 const stages=groups.map(ss=>ss.flatMap(sec=>take(sec)).map(x=>({id:x.id,order:[0,1,2,3]})));
 const responses=groups.map(ss=>ss.flatMap(sec=>take(sec)).map(x=>x.answer));
 return {version:1,type:'jlpt_'+level.toLowerCase(),engine:'jlpt',phase:groups.length-1,index:19,
   stages,responses,audioDone:Array.from({length:20},(_,i)=>i),played:[],stageHistory:[]};
}
function drivingSnap(type){
 const b=key.driving[type],t=Array.from({length:30},(_,i)=>['t',i]);
 let p=[];
 if(type==='truck')p=[...b.p.map((x,i)=>({...x,i})).filter(x=>x.visual).slice(0,8),
   ...b.p.map((x,i)=>({...x,i})).filter(x=>!x.visual).slice(0,12)].map(x=>['p',x.i]);
 else p=Array.from({length:20},(_,i)=>['p',i]);
 const refs=[...t,...p],answers=refs.map(([k,i])=>k==='t'?b.t[i]:b.p[i].a);
 return {version:1,engine:'driving',type,index:49,refs,answers};
}
function licenseSnap(type){const n=type==='moped'?48:95,b=key.license[type];return {version:1,engine:'license',type,index:n-1,refs:Array.from({length:n},(_,i)=>i),answers:b.slice(0,n).map(x=>x.a)};}
function maintenanceSnap(){const b=key.maintenance,items=[...Object.entries(b.theory).slice(0,30).map(([q,a])=>({q,a,kind:'theory'})),...Object.entries(b.practical).slice(0,15).map(([q,a])=>({q,a,kind:'practical'}))];return {version:1,engine:'maintenance',type:'maintenance',index:44,items,answers:items.map(x=>x.a)};}

globalThis.__ykUser={id:'owner1',email:'test@example.test',roles:[]};
await test('Free policy: one free per exam type and Pg index classifier',()=>{
 assert.equal(EXAM_FREE_POLICY,'ONE_PER_EXAM_TYPE');
 assert(isFreeUniqueViolation({code:'23505',constraint:'exam_one_free_attempt_per_user_type'}));
 assert(!isFreeUniqueViolation({code:'23505',constraint:'other'}));
 const mig=readFileSync(root+'/netlify/database/migrations/20261101150000_v763_free_per_exam_type.sql','utf8');
 assert.match(mig,/DROP INDEX IF EXISTS exam_one_free_attempt_per_user/);
 assert.match(mig,/ON exam_attempts\(user_id,exam_type\)/);
});
for(const type of ['jlpt_n1','jlpt_n2','jlpt_n3','jlpt_n4','jlpt_n5','truck','taxi','bus','car','motorcycle','moped','maintenance']){
 await test('Canonical full-score '+type,()=>{
  const s=type.startsWith('jlpt')?jlptSnap(type.slice(5).toUpperCase()):['truck','taxi','bus'].includes(type)?drivingSnap(type):type==='maintenance'?maintenanceSnap():licenseSnap(type);
  const r=evaluateSnapshot(type,s);assert.equal(r.score, type.startsWith('jlpt')?180:type==='maintenance'?45:['truck','taxi','bus'].includes(type)?50:type==='moped'?48:95);assert(r.passed);
  if(s.engine==='jlpt')s.responses.at(-1).pop();else s.answers.pop();assert.throws(()=>evaluateSnapshot(type,s));
 });
}
await test('JLPT: fake zero-answer 180 rejected by recomputation',()=>{
 const s=jlptSnap('N5');s.responses=s.responses.map(a=>a.map(()=>null));assert.equal(evaluateSnapshot('jlpt_n5',s).score,0);
});
await test('JLPT: duplicate question IDs fail',()=>{
 const s=jlptSnap('N5');s.stages[0][1]=s.stages[0][0];assert.throws(()=>evaluateSnapshot('jlpt_n5',s));
});
await test('Driving: incorrect source index or duplicate fail',()=>{
 const s=drivingSnap('truck');s.refs[1]=s.refs[0];assert.throws(()=>evaluateSnapshot('truck',s));
});
await test('Canonical source bank contains 500 JLPT questions',()=>assert.equal(Object.keys(key.jlpt).length,500));
const submit=await handler('exam-attempt-submit');
await test('Missing checkpoint prevents 180 spoof',async()=>{
 const db=mkDb('jlpt_n5');globalThis.__ykDb=db;
 const res=await submit(req({attemptId:42,score:180,passed:true}));
 assert.equal(res.status,409);assert.equal((await res.json()).error,'missing_checkpoint');
});
await test('Early JLPT phase prevents 180 spoof',async()=>{
 const snap=jlptSnap('N5');snap.phase=0;const db=mkDb('jlpt_n5',snap);globalThis.__ykDb=db;
 const res=await submit(req({attemptId:42,score:180}));
 assert.equal(res.status,409);assert.equal((await res.json()).error,'unfinished_sections');
});
await test('Expired last phase prevents full-score spoof',async()=>{
 const db=mkDb('jlpt_n5',jlptSnap('N5'));
 db.state.checkpoint.ends_at=late;globalThis.__ykDb=db;
 const res=await submit(req({attemptId:42,score:180,passed:true}));
 assert.equal(res.status,409);assert.equal((await res.json()).error,'time_expired');
});
await test('Forged browser 180 cannot overwrite saved 0-score answers',async()=>{
 const s=jlptSnap('N5');s.responses=s.responses.map(a=>a.map(()=>null));
 const db=mkDb('jlpt_n5',s);globalThis.__ykDb=db;
 const res=await submit(req({attemptId:42,score:180,passed:true}));
 assert.equal(res.status,409);assert.equal((await res.json()).error,'score_mismatch');
 assert.equal(db.state.attempt.status,'started');
});
await test('Server recomputes and stores valid checkpoint result; duplicate is idempotent',async()=>{
 const db=mkDb('jlpt_n5',jlptSnap('N5'));globalThis.__ykDb=db;
 const res=await submit(req({attemptId:42,score:180,passed:false}));const data=await res.json();
 assert.equal(res.status,200);assert.equal(data.score,180);assert.equal(data.passed,true);assert.equal(data.scoreVerified,true);
 assert.equal(db.state.attempt.score_verified,true);
 const again=await submit(req({attemptId:42,score:0}));assert.equal((await again.json()).alreadySubmitted,true);
});
await test('Final question not reached prevents early submit',async()=>{
 const s=jlptSnap('N5');s.index=2;const db=mkDb('jlpt_n5',s);globalThis.__ykDb=db;
 const res=await submit(req({attemptId:42,score:180}));assert.equal(res.status,409);assert.equal((await res.json()).error,'exam_not_finished');
});
await test('Last listening audio not played prevents early manual submit',async()=>{
 const s=jlptSnap('N5');s.audioDone=[0,1];const db=mkDb('jlpt_n5',s);globalThis.__ykDb=db;
 const res=await submit(req({attemptId:42,score:180}));assert.equal(res.status,409);assert.equal((await res.json()).error,'listening_not_finished');
});
const checkpoint=await handler('exam-checkpoint');
await test('Checkpoint cannot advance a phase after its grace deadline',async()=>{
 const s=jlptSnap('N5');s.phase=0;
 const db=mkDb('jlpt_n5',s);db.state.checkpoint.ends_at=late;
 globalThis.__ykDb=db;
 const next=jlptSnap('N5');next.phase=1;
 const res=await checkpoint(req({attemptId:42,phase:1,baseVersion:2,snapshot:next},'exam-checkpoint'));
 assert.equal(res.status,409);assert.equal((await res.json()).error,'time_expired');
 assert.equal(db.state.attempt.status,'abandoned');
});
const access=await handler('exam-access');
await test('Per-type free index collision maps to payment_required without bypass',async()=>{
 const queries=[];
 globalThis.__ykDb={sql:async(s,...v)=>{
   const q=s.join('?').replace(/\s+/g,' ').trim();queries.push(q);
   if(q.startsWith('UPDATE exam_attempts AS a'))return [];
   if(q.startsWith('SELECT a.id,a.exam_type,a.access_mode'))return [];
   if(q.includes('FROM exam_students')||q.includes('FROM exam_paid_access'))return [];
   if(q.startsWith('INSERT INTO exam_attempts'))throw Object.assign(Error('duplicate free attempt'),{code:'23505',constraint:'exam_one_free_attempt_per_user_type'});
   if(q.includes("access_mode='free'")&&q.includes("status='started'")&&q.includes('exam_type='))return [];
   throw Error('Unexpected access SQL: '+q.slice(0,130));
 }};
 const res=await access(req({examType:'taxi'},'exam-access'));
 assert.equal(res.status,402);assert.equal((await res.json()).reason,'payment_required');
 assert(queries.some(q=>q.includes("access_mode='free'")&&q.includes('exam_type=')));
});
await test('Migration count + no edited historical migration (10 total)',()=>{
 const n=readdirSync(root+'/netlify/database/migrations').filter(x=>x.endsWith('.sql'));
 assert.equal(n.length,10);
});
console.log(`\nTOTAL ${pass} PASS / ${fail} FAIL (mock DB, not production)`);
if(fail)process.exitCode=1;
