import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
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
check('FIX03 header opener is unique, inside the existing dashboard header, and scoped to the four routes',()=>{
  const files=['dashboard.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html'];
  for(const f of files){
    const html=read('dist/'+f),header=html.match(/<header class="topbar">[\s\S]*?<\/header>/)?.[0];
    assert.equal((html.match(/id="ykDrawerOpen"/g)||[]).length,1,f);
    assert(header?.includes('id="ykDrawerOpen" aria-controls="siteMenu" aria-expanded="false" aria-label="Menu"'),f);
    assert(header.indexOf('id="ykDashboardLangPicker"')<header.indexOf('id="ykDrawerOpen"'),f);
    assert(html.includes('yk-dashboard-header-fix03.css?v=7912-fix03'),f);
  }
  for(const f of readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html')&&!files.includes(f))){
    assert(!read('dist/'+f).includes('yk-dashboard-header-fix03.css'),f);
  }
  assert.equal(read('dist/assets/yk-dashboard-header-fix03.css'),read('qa/menu-slidein-pr7/yk-dashboard-header-fix03.css'));
});
check('FIX04 compact footer preserves logout ID, home logo and single account action',()=>{
  const files=['dashboard.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html'];
  for(const f of files){
    const html=read('dist/'+f);
    assert(!html.includes('<nav class="yk-dash-dock"'),f);
    assert.match(html,/<footer class="yk-dashboard-footer">[\s\S]*?id="dashLogout"[\s\S]*?<\/footer>/);
    assert.equal((html.match(/id="dashLogout"/g)||[]).length,1,f);
    assert.match(html,/class="yk-brand-long-v778" href="\/#home"/);
    assert(html.includes('yk-dashboard-footer-fix04.css?v=7912-fix04'),f);
    assert(html.includes('yk-dashboard-v758.js?v=7912-fix04'),f);
  }
  assert.equal((main.match(/data-yk-dashboard-logout>Logout<\/button>/g)||[]).length,2);
  assert.match(main,/closest\('\[data-yk-dashboard-logout\]'\)\)\{\$\('dashLogout'\)\?\.click\(\)/);
  for(const f of readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html')&&!files.includes(f))){
    assert(!read('dist/'+f).includes('yk-dashboard-footer-fix04.css'),f);
  }
  assert.equal(read('dist/assets/yk-dashboard-footer-fix04.css'),read('qa/menu-slidein-pr7/yk-dashboard-footer-fix04.css'));
});
check('FIX05 all detached menu templates have exactly one in-header opener, with no fallback row',()=>{
  const kinds={auth:1,video:1,reports:1,study:16,jlpt:2,n2:1};
  const counts={};
  const htmlFiles=readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'));
  assert.equal(htmlFiles.length,41);
  for(const f of htmlFiles){
    const html=read('dist/'+f);
    assert.equal((html.match(/id="(?:menuToggle|ykDrawerOpen)"/g)||[]).length,1,f);
    assert(!/<body\b[^>]*>\s*<button[^>]*id="ykDrawerOpen"/.test(html),f);
    const header=html.match(/<header data-yk-header-fix05="([^"]+)"[^>]*>[\s\S]*?<\/header>/);
    if(header){
      counts[header[1]]=(counts[header[1]]||0)+1;
      assert(header[0].includes('id="ykDrawerOpen" aria-controls="siteMenu" aria-expanded="false" aria-label="Menu"'),f);
      assert(header[0].includes('<svg viewBox="0 0 24 24"'),f);
      assert(html.includes('yk-global-header-fix05.css?v=7912-'+(header[1]==='video'?'fix06':'fix05')),f);
      assert(!html.includes('yk-dashboard-header-fix03.css'),f);
    }else assert(!html.includes('yk-global-header-fix05.css'),f);
  }
  assert.deepEqual(counts,kinds);
  assert.equal(read('dist/assets/yk-global-header-fix05.css'),read('qa/menu-slidein-pr7/yk-global-header-fix05.css'));
});
check('FIX06 only Video header hides the redundant account CTA; drawer and original login/account routes stay intact',()=>{
  const html=read('dist/video-class.html'), css=read('dist/assets/yk-global-header-fix05.css');
  assert.match(css,/\[data-yk-header-fix05="video"\] #vcAccountLink\{display:none;\}/);
  assert.equal((html.match(/id="vcAccountLink"/g)||[]).length,1);
  assert(html.includes('data-drawer-label="login" href="/login.html?return=%2F%23home"'));
  assert(html.includes('data-drawer-label="create" href="/login.html?return=%2F%23home"'));
  assert(html.includes('aria-label="Open dashboard" href="/dashboard.html"'));
  assert(html.includes('id="moreLogout"'));
  assert(html.includes('data-tab="account" href="/dashboard.html"'));
});
check('FIX07 motion only in 27 safe browsing routes, real pending UI in 7 routes; sensitive exam/auth navigation unchanged',()=>{
  const motion='yk-v7912-fix07-page-motion.css?v=7912-fix07',loading='yk-v7912-fix07-loading.css?v=7912-fix07';
  const pages=readdirSync('dist',{recursive:true}).filter(p=>p.endsWith('.html')).map(p=>p.replaceAll('\\','/'));
  const dashboards=['dashboard.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html'];
  let m=0,l=0;
  for(const p of pages){
    const html=read('dist/'+p),sensitive=p==='login.html'||p==='mock-second-license.html'||p.startsWith('exams/');
    assert.equal(html.split(motion).length-1,sensitive?0:1,p);
    assert.equal(html.split('id="yk07-motion-entry"').length-1,sensitive?0:1,p);
    assert.equal(html.split(loading).length-1,[...dashboards,'index.html','mock-exams.html','login.html'].includes(p)?1:0,p);
    if(!sensitive)m++;
    if(html.includes(loading))l++;
    if(dashboards.includes(p))assert.match(html,/<section id="dashboardBody" aria-label="Dashboard content"><div class="yk07-skeleton" aria-hidden="true">/,p);
  }
  assert.equal(m,27);assert.equal(l,7);assert.equal(pages.length,41);
  const css=read('dist/assets/yk-v7912-fix07-page-motion.css'), sk=read('dist/assets/yk-v7912-fix07-loading.css');
  assert.match(css,/@media\(prefers-reduced-motion:no-preference\)/);
  assert.match(css,/@view-transition\{navigation:auto;\}/);
  assert.doesNotMatch(css,/translate[XY]|scale[XY]|animation-delay/);
  assert.match(sk,/#dashMessage:not\(\[hidden\]\):not\(\.error\)/);
  assert.match(sk,/\[aria-busy="true"\]/);
  assert.match(sk,/@media\(prefers-reduced-motion:reduce\)/);
  assert.ok(sk.includes('#dictionaryResults > .dictionary-empty[role="status"]:has(> #yk863RetryDictionary){display:block;}'));
  const home=read('dist/index.html');
  assert.match(home,/status\.setAttribute\('aria-busy','true'\)/);
  assert.match(home,/\.finally\(\(\)=>status\?\.removeAttribute\('aria-busy'\)\)/);
  assert.equal(css,read('assets/yk-v7912-fix07-page-motion.css'));
  assert.equal(sk,read('assets/yk-v7912-fix07-loading.css'));
});
console.log('TOTAL v7.91.2 targeted: '+count+' PASS / 0 FAIL');
