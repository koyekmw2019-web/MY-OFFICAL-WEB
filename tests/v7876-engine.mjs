/** v7.87.6 pure trusted-score learner fixture; never contacts private APIs. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const sandbox={};sandbox.globalThis=sandbox;vm.createContext(sandbox);
// The actual pre-existing v7.86.3 catalog is included by the repository at deploy.
// Use an isolated fixture here because the update ZIP intentionally excludes old files.
const max={truck:50,taxi:50,bus:50,maintenance:45,car:95,motorcycle:95,moped:48,
 jlpt_n5:180,jlpt_n4:180,jlpt_n3:180,jlpt_n2:180,jlpt_n1:180};
const catalog=Object.keys(max).map(type=>({type,short:type.toUpperCase(),max:max[type]}));
const verified=a=>!!a&&a.status==='submitted'&&a.score_verified===true&&
 a.score!==null&&Number.isFinite(Number(a.score))&&Number(a.score)>=0&&Number(a.score)<=max[a.exam_type];
const summarize=(rows,type)=>{const valid=rows.filter(a=>a.exam_type===type&&verified(a));const avg=valid.length?Math.round(valid.reduce((s,a)=>s+Number(a.score),0)/valid.length/max[type]*1000)/10:null;
 return {verified:valid.length,averagePercent:avg};};
sandbox.YKAllExamsV7863={catalog,verified,summarize};
vm.runInContext(read('assets/yk-v7876-journey-engine.js'),sandbox);
const E=sandbox.YKSmartJourneyV7876, A=sandbox.YKAllExamsV7863;
assert.equal(E.types.length,12,'12 supported mock exam types');
assert.equal(E.lesson('truck'),'/study/ssw-truck.html');
assert.equal(E.lesson('taxi'),'/study/ssw-taxi.html');
assert.equal(E.lesson('bus'),'/study/ssw-bus.html');
assert.equal(E.lesson('maintenance'),'/study/ssw-auto-maintenance.html');
assert.equal(E.lesson('jlpt_n5'),'/study/jlpt-learning.html?level=N5&section=daily');
assert.equal(E.examUrl('jlpt_n1'),'/exams/jlpt_n1.html');
assert.equal(E.lesson('../admin'),null);
assert.equal(E.examUrl('../../admin'),'/mock-exams.html');
const make=(exam_type,score,date,verified=true)=>({exam_type,score,status:'submitted',score_verified:verified,passed:false,submitted_at:date});
const attempts=[
 make('truck',25,'2026-11-01T10:00:00Z'),make('truck',30,'2026-11-02T10:00:00Z'),
 make('truck',45,'2026-11-03T10:00:00Z'),make('truck',49,'2026-11-04T10:00:00Z',false),
 make('taxi',10,'2026-11-05T10:00:00Z'),make('truck',20,'2026-11-05T10:00:00Z'),
 make('truck',18,'2026-11-06T10:00:00Z'),make('truck',10,'2026-11-07T10:00:00Z'),
 make('truck',50,'invalid'),make('truck',-5,'2026-11-08T10:00:00Z'),
 make('truck',1000,'2026-11-08T10:00:00Z'),
];
const m=E.model(attempts,'truck',A);
assert(m);
assert.equal(m.summary.verified,7,'original verified calculation, including dated unknown allowed');
assert.equal(m.summary.averagePercent,56.6,'50-point scale not mixed with taxi');
assert.equal(m.guidance,'review','>=2 verified under 70%');
assert.equal(m.points.length,5,'last five correctly dated verified results only');
assert.equal(m.points.at(-1).score,10);
assert.equal(m.points[0].score,30);
assert.equal(m.points[0].percent,60);
assert(m.points.every(p=>p.percent>=0&&p.percent<=100));
const empty=E.model(attempts,'jlpt_n2',A);
assert.equal(empty.guidance,'first');
assert.equal(empty.points.length,0);
assert.equal(E.model([], 'nope', A),null);
// The UI only displays user-account data returned from the existing shared promise.
const ui=read('assets/yk-v7876-journey.js');
assert(ui.includes('YKDashboardActivityPromiseV7863'));
assert(!ui.includes('fetch('));
assert(!ui.includes('localStorage')&&!ui.includes('indexedDB'));
for(const forbidden of ['exam-attempt-submit','payment_requests','/.netlify/functions/','studentCode','verificationCode'])assert(!ui.includes(forbidden),forbidden);
new vm.Script(ui,{filename:'yk-v7876-journey.js'});
console.log('PASS v7876-engine: 12 subject routes, scoped verified history, date filtering, trusted per-exam scores, no new APIs');
