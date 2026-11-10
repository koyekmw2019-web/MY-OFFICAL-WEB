import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await import('../assets/yk-dashboard-pro-v784-engine.js');
const engine=globalThis.YKDashboardProEngineV784;
let tests=0;
const check=(label,fn)=>{fn();tests++;console.log(`PASS v784 ${label}`)};
const attempt=(type,score,verified=true,passed=false)=>({status:'submitted',exam_type:type,score,score_verified:verified,passed});
check('engine loaded',()=>assert.equal(typeof engine.recommendations,'function'));
check('normalizes truck practice score',()=>assert.equal(engine.verifiedScore(attempt('truck',30)),60));
check('normalizes JLPT 180 point score',()=>assert.equal(engine.verifiedScore(attempt('jlpt_n4',90)),50));
check('unverified scores excluded',()=>assert.equal(engine.verifiedScore(attempt('truck',50,false,true)),null));
check('started results excluded',()=>assert.equal(engine.verifiedScore({...attempt('truck',50),status:'started'}),null));
check('out-of-range scores excluded',()=>assert.equal(engine.verifiedScore(attempt('bus',51)),null));
check('null scores excluded',()=>assert.equal(engine.verifiedScore(attempt('bus',null)),null));
check('exam weakness requires >=2 verified attempts',()=>{
 const data=[attempt('truck',25,true,false),attempt('truck',20,true,false),attempt('bus',1,true,false),attempt('taxi',10,false,false)];
 assert.deepEqual(engine.examWeakness(data).map(x=>x.type),['truck']);
});
check('scores by exam never combine scales',()=>{
 const by=engine.examSummary([attempt('jlpt_n1',180,true,true),attempt('truck',25,true,false)]);
 assert.equal(by.find(x=>x.type==='jlpt_n1').average,100);assert.equal(by.find(x=>x.type==='truck').average,50);
});
check('lesson completion is NOT called weak exam score',()=>{
 const content={levels:{N5:{vocabulary:[{id:'N5-v-1'},{id:'N5-v-2'}],grammar:[{id:'N5-g-1'}],reading:[{id:'N5-r-1'}]}}};
 const r=engine.recommendations({state:{lastLevel:'N5',completed:['N5-v-1'],dailyRuns:[]},content});
 assert.equal(r.weakExams.length,0);assert.equal(r.coverage.find(x=>x.section==='vocabulary').percent,50);
 assert.ok(r.focus.some(x=>x.kind==='coverage'&&x.href.includes('section=')));
});
check('prioritize previously missed questions',()=>{
 const r=engine.recommendations({mistakes:[{exam_type:'truck',question_text:'Q',missed_count:4}],mistakesAvailable:true});
 assert.equal(r.focus[0].kind,'mistakes');assert.equal(r.focus[0].examType,'truck');
});
check('do not invent weak subjects from no data',()=>{
 const r=engine.recommendations({progressAvailable:false,mistakesAvailable:false});
 assert.equal(r.focus.length,0);assert.equal(r.practiceAccuracy,null);assert.equal(r.weakExams.length,0);
});
check('JLPT Daily Practice accuracy requires real denominator',()=>{
 const r=engine.recommendations({state:{dailyRuns:[{day:'2026-11-08',count:10,correct:6}]}});
 assert.equal(r.practiceAccuracy,60);
});
check('date chart zero-fills from backend only',()=>{
 const s=engine.series([{day:'2026-11-09',verified:4}], 'verified',3,new Date('2026-11-09T10:00:00Z'));
 assert.deepEqual(s.map(x=>x.day),['2026-11-07','2026-11-08','2026-11-09']);
 assert.deepEqual(s.map(x=>x.value),[0,0,4]);
});
check('backend is admin-only and read-only',()=>{
 const t=fs.readFileSync(path.join(root,'netlify/functions/exam-admin-analytics.mts'),'utf8');
 assert.match(t,/await requireAdmin\(\)/);assert.match(t,/req.method !== 'GET'/);
 assert.doesNotMatch(t,/\b(?:INSERT|UPDATE|DELETE)\s+(?:INTO|FROM|exam_|ykcr_)/i);
 assert.match(t,/score_verified=TRUE/);assert.match(t,/passed IS NOT NULL/);assert.match(t,/queueStatus:'unknown'/);
 assert.doesNotMatch(t,/SELECT\s+\*/i);
});
check('dashboard only modifies admin and student pages',()=>{
 for(const page of ['admin-dashboard.html','student-dashboard.html']){
  const t=fs.readFileSync(path.join(root,page),'utf8');
  assert.match(t,/yk-dashboard-pro-v784\.css/);assert.match(t,/yk-dashboard-pro-v784-engine\.js/);assert.match(t,/yk-dashboard-pro-v784\.js/);
  assert.match(t,/yk-dashboard-v758\.js/);
 }
 assert.doesNotMatch(fs.readFileSync(path.join(root,'member-dashboard.html'),'utf8'),/dashboard-pro-v784/);
});
check('original character assets intact',()=>{
 for(const n of ['student-v7821.webp','teacher-v7821.webp'])assert.ok(fs.statSync(path.join(root,'assets/characters',n)).size>1000);
});
check('student recommendations account scoped and no attempt consumption',()=>{
 const t=fs.readFileSync(path.join(root,'assets/yk-dashboard-pro-v784.js'),'utf8');
 assert.match(t,/exam-my-activity/);assert.match(t,/yk-learning/);assert.match(t,/jlpt-learning-progress/);
 assert.doesNotMatch(t,/exam-attempt-submit|exam-access\?|exam-checkpoint/);
});
console.log(`v784 dashboard tests: ${tests} PASS`);
