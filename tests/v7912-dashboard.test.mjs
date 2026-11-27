import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=(p)=>readFileSync(p,'utf8');
let count=0;function check(name,fn){fn();console.log('PASS v7912 '+name);count++;}
const main=read('assets/yk-dashboard-v758.js'),pro=read('assets/yk-dashboard-pro-v784.js'),review=read('assets/yk-learning-v760.js'),jlpt=read('assets/yk-jlpt-learning-v782-dashboard.js');
check('Student and member use identical personal shells with role-specific URL compatibility',()=>{
  assert.equal(read('student-dashboard.html').replace('data-dashboard="student"','data-dashboard="member"'),read('member-dashboard.html'));
  for(const f of ['dashboard.html','student-dashboard.html','member-dashboard.html','admin-dashboard.html'])assert(read(f).includes('noindex,nofollow'));
});
check('Server-confirmed identity before rendering any management or personal UI',()=>{
  assert.match(main,/if\(!user\)\{go\('\/login\.html\?return='/);
  assert.match(main,/me=await api\('exam-status'\);if\(me.authenticated!==true\|\|!Array.isArray\(me.roles\)\)throw/);
  assert.match(main,/if\(kind!==role\)\{go\(targets\[role\]/);
  assert.match(main,/const management=role==='admin'&&!wantsPersonal/);
  assert.match(main,/if\(management\)await showAdmin\(\);else await showMember\(role\)/);
});
check('Admin role and active student/paid access take precedence without changing backend grants',()=>{
  assert.match(main,/const access=admin\?'Admin Access':active\?'Unlimited Exam Access':paid\?'Paid Access'/);
  assert.match(main,/const needVerify=!admin&&!student/);
  assert(!main.includes('localStorage'));
});
check('One management overview, one review panel, one shared activity request',()=>{
  assert.match(main,/Promise.all\(\[loadAdminStats\(\),loadPayments\(false\)\]\)/);
  assert.match(main,/window.YKDashboardActivityPromiseV7863=shared/);
  assert.match(pro,/window.YKDashboardActivityPromiseV7863/);
  assert.match(pro,/yk7912AdminChartHost/);
  assert.match(pro,/data-yk7912-review-type/);
  assert(!main.includes('yk767LoadReview'));
  assert(!pro.includes('yk863Mistakes'));
  assert.match(review,/if\(data\)return Promise.resolve\(data\);if\(loading\)return loading/);
});
check('Detailed review and JLPT/coach lazy until requested',()=>{
  for(const token of ['explanation_ja','explanation_my','Daily Practice (5 / 10 / 20)','yk7912MistakeType','yk760AnnForm'])assert(review.includes(token),token);
  assert.match(jlpt,/if\(d.open\)load\(\)/);
  assert.match(read('assets/yk-exam-coach-v7865.js'),/dataset.dashboardView!=='personal'/);
  assert(!review.includes('exam-access?'));
});
check('One selected tile with inaccessible hidden sections and owner-approved navigation',()=>{
  assert.match(main,/el.hidden=!active;el.open=active/);
  assert.match(main,/aria-current/);
  assert.match(read('assets/yk-dashboard-v7912.css'),/\.yk7912-section\[hidden\]\{display:none!important\}/);
  assert.match(read('qa/menu-slidein-pr7/drawer.html'),/href="\/dashboard.html\?view=personal#yk7912Results"/);
});
check('Generated public dashboard pages and cache-busted UI assets',()=>{
  for(const f of ['admin-dashboard.html','student-dashboard.html','member-dashboard.html','dashboard.html']){
    assert(existsSync('dist/'+f));assert.match(read('dist/'+f),/yk-dashboard-v758\.js\?v=7912/);
  }
  for(const f of ['yk-dashboard-v7912.css','yk-dashboard-v758.js','yk-dashboard-pro-v784.js','yk-learning-v760.js'])assert(existsSync('dist/assets/'+f),f);
  assert.match(read('service-worker.js'),/v7912-dashboard/);
});
console.log('TOTAL v7.91.2 targeted: '+count+' PASS / 0 FAIL');
