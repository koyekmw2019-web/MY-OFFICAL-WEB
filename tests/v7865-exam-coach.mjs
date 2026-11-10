/** v7.86.5 — account-scoped, single-attempt evidence and dashboard study plan. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import vm from 'node:vm';
import {key} from '../netlify/functions/_shared/exam-answer-key-v763.mts';
import {evaluateSnapshot} from '../netlify/functions/_shared/exam-score-v763.mts';
import {verifiedTopics} from '../netlify/functions/_shared/exam-coach-evidence-v7865.mts';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');const read=p=>readFileSync(join(root,p),'utf8');
let passed=0;async function test(name,fn){await fn();passed++;console.log('PASS v7865 '+name)}
const n5=()=>{
 const qs=Object.entries(key.jlpt).filter(([_,q])=>q.level==='N5');
 const order=[['vocabulary'],['grammar','reading'],['listening']];
 const items=order.map(sections=>sections.flatMap(section=>qs.filter(([_,q])=>q.section===section)));
 return {version:1,type:'jlpt_n5',engine:'jlpt',phase:2,index:19,
  stages:items.map(p=>p.map(([id])=>({id,order:[0,1,2,3]}))),
  responses:items.map(p=>p.map(([_,q])=>q.answer)),audioDone:[19]};
};
const truck=()=>{const b=key.driving.truck;const theory=Array.from({length:30},(_,i)=>['t',i]);
 const visual=b.p.map((x,i)=>({...x,i})).filter(x=>x.visual).slice(0,8).map(x=>['p',x.i]);
 const normal=b.p.map((x,i)=>({...x,i})).filter(x=>!x.visual).slice(0,12).map(x=>['p',x.i]);
 const refs=[...theory,...visual,...normal];return {version:1,type:'truck',engine:'driving',index:49,refs,
 answers:refs.map(([k,i])=>k==='t'?b.t[i]:b.p[i].a)};
};
const license=()=>({version:1,type:'moped',engine:'license',index:47,refs:Array.from({length:48},(_,i)=>i),answers:key.license.moped.slice(0,48).map(x=>x.a)});
await test('JLPT real canonical snapshot yields 4 verified topics from ONE attempt',()=>{
 const s=n5();assert.equal(evaluateSnapshot('jlpt_n5',s).score,180);
 const t=verifiedTopics('jlpt_n5',s);assert.equal(t.length,4);assert.equal(t.reduce((a,b)=>a+b.total,0),100);
 assert.equal(t.find(x=>x.id==='vocabulary').total,36);assert.equal(t.find(x=>x.id==='grammar').total,24);
 assert.equal(t.find(x=>x.id==='reading').total,20);assert.equal(t.find(x=>x.id==='listening').total,20);
 s.responses[0][0]=null;
 assert.equal(verifiedTopics('jlpt_n5',s).find(x=>x.id==='vocabulary').correct,35);
});
await test('TRUCK canonical snapshot yields only theory/practical, no fake topic',()=>{
 const s=truck();assert.equal(evaluateSnapshot('truck',s).score,50);s.answers[0]=null;
 const x=verifiedTopics('truck',s);assert.equal(x.find(t=>t.id==='theory').correct,29);
 assert.equal(x.find(t=>t.id==='practical').total,20);assert.equal(x.length,2);
});
await test('License gets honest overall evidence only',()=>{
 const s=license();assert.equal(evaluateSnapshot('moped',s).score,48);const x=verifiedTopics('moped',s);
 assert.equal(x.length,1);assert.equal(x[0].id,'overall');assert.equal(x[0].total,48);
});
const context={};vm.createContext(context);vm.runInContext(read('assets/yk-exam-coach-v7865-engine.js'),context);
const plan=context.YKExamCoachEngineV7865;
await test('Priorities sorted by lower accuracy, one attempt is enough',()=>{
 const topics=[{id:'grammar',correct:13,total:24},{id:'reading',correct:7,total:20},{id:'vocabulary',correct:35,total:36}];
 const ranked=plan.rank(topics);assert.equal(ranked[0].id,'reading');assert.equal(ranked[0].rate,35);
 assert.equal(plan.studyPlan(topics,null).steps.length,7);
});
await test('Invalid topic metadata not manufactured',()=>{
 const rows=plan.rank([{id:'untrusted',correct:0,total:5},{id:'reading',correct:30,total:20},{id:'overall',correct:1,total:4}]);
 assert.equal(rows.length,1);assert.equal(rows[0].id,'overall');
 assert.equal(plan.studyPlan([],null).evidence,false);
});
await test('Tokyo midnight and user-entered date durations',()=>{
 const a=new Date('2026-11-10T14:59:59Z'),b=new Date('2026-11-10T15:00:01Z');
 assert.equal(plan.todayJst(a),'2026-11-10');assert.equal(plan.todayJst(b),'2026-11-11');
 assert.equal(plan.daysUntil('2026-11-12',a),2);assert.equal(plan.daysUntil('2026-11-12',b),1);
 assert.equal(plan.daysUntil('2026-02-30',b),null);
});
await test('Short 2-day and exam-day plans without false official claim',()=>{
 const t=[{id:'practical',correct:9,total:20}];
 assert.equal(plan.studyPlan(t,'2026-11-12',new Date('2026-11-10T01:00:00Z')).steps.length,2);
 assert.equal(plan.studyPlan(t,'2026-11-10',new Date('2026-11-10T01:00:00Z')).steps.length,1);
 assert.equal(plan.studyPlan(t,'2026-11-10',new Date('2026-11-10T01:00:00Z')).daysRemaining,0);
});
await test('Server uses account-scoped signed-in user for coaching',()=>{
 const s=read('netlify/functions/exam-coach.mts');
 for(const t of ['requireUser()','user_id=${user.id}','score_verified=TRUE',"a.status='submitted'",'private, no-store'])assert(s.includes(t),t);
 assert(!s.includes('SELECT *'));assert(s.includes('LIMIT 1'));
});
await test('Topic evidence saved after server submission, never trusting client scores',()=>{
 const s=read('netlify/functions/exam-attempt-submit.mts');
 assert(s.indexOf('evaluateSnapshot(attempt.exam_type,cp.snapshot)')<s.indexOf('verifiedTopics(attempt.exam_type,cp.snapshot)'));
 assert(s.indexOf('verifiedTopics(attempt.exam_type,cp.snapshot)')<s.indexOf('DELETE FROM exam_attempt_checkpoints'));
 assert(s.includes('ON CONFLICT(attempt_id) DO NOTHING'));
 assert(s.includes('score_mismatch'));assert(s.includes('score_verified=TRUE'));
});
await test('Coach is dashboard only and lazy per selected exam',()=>{
 const s=read('student-dashboard.html'),frontend=read('assets/yk-exam-coach-v7865.js');
 assert(s.includes('yk-exam-coach-v7865.js'));assert(!read('index.html').includes('yk-exam-coach-v7865.js'));
 assert(frontend.includes('data-yk863-type'));assert(frontend.includes('fetchCoach(exam.dataset.yk863Type)'));
 assert(frontend.includes('credentials:\'same-origin\''));assert(frontend.includes('cache:\'no-store\''));
 assert(frontend.includes("dataset.dashboard!=='student'"));assert(!frontend.includes('localStorage'));
});
await test('Migration only adds private coaching tables and no public IDs',()=>{
 const s=read('netlify/database/migrations/20261110190000_v7865_exam_coach.sql');
 assert(s.includes('CREATE TABLE IF NOT EXISTS exam_coach_topic_results'));
 assert(s.includes('CREATE TABLE IF NOT EXISTS exam_coach_target_dates'));
 assert(!s.includes('ALTER TABLE exam_attempts'));
});
await test('UI is responsive, accessible and lightweight',()=>{
 const css=read('assets/yk-exam-coach-v7865.css');assert(css.includes('max-width:590px'));
 assert(css.includes('prefers-reduced-motion'));assert(css.includes(':focus-visible'));
 assert(read('assets/yk-exam-coach-v7865.js').includes('aria-live'));
});
await test('Netlify preserves existing build contract',()=>{
 assert(read('netlify.toml').includes('publish = "dist"'));
 assert(read('service-worker.js').includes('v7865-coach'));
 assert.equal(JSON.parse(read('package.json')).version,'7.86.5');
});
console.log(`v7.86.5 ${passed} PASS / 0 FAIL`);
