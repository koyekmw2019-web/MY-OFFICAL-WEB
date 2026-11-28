import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
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
check('FIX13 Home uses actual pending skeleton on PC and mobile; no forced entrance line',()=>{
  const filename='yk-v7912-fix08-mobile-home.css',link=filename+'?v=7912-fix13';
  const pages=readdirSync('dist',{recursive:true}).filter(p=>p.endsWith('.html'));
  for(const page of pages)assert.equal(read('dist/'+page).split(link).length-1,page==='index.html'?1:0,page);
  const home=read('dist/index.html'),css=read('dist/assets/'+filename);
  assert.equal(css,read('assets/'+filename));
  assert.equal(home.split('id="yk7913HomeSkeleton"').length,2);
  assert.match(home,/<div id="yk7913HomeSkeleton" role="status" aria-live="polite">/);
  assert.match(home,/DOMContentLoaded",done,\{once:true\}/);
  assert.ok(home.includes('yk-v7900-mobile-home.js?v=7901qa-ui7911-fix13'));
  assert.ok(css.includes('html[data-yk7913-home-boot="true"]'));
  assert.ok(css.includes('#yk790MobileHome[data-yk-home-loading="true"]'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.doesNotMatch(css,/yk08HomeArrival|yk08HomePending|linear-gradient\(90deg|animation-delay/);
  assert.ok(css.includes('pointer-events:none'));
  const source=read('dist/assets/yk-v7900-mobile-home.js');
  assert.match(source,/watchdog=setTimeout/);assert.match(source,/clearTimeout\(watchdog\)/);
});
check('FIX13 all 13 legacy Exam pages have identical real pending skeleton and fail-closed access display',()=>{
  const pages=readdirSync('dist',{recursive:true}).filter(p=>p==='mock-exams.html'||p.startsWith('exams/')&&p.endsWith('.html'));
  assert.equal(pages.length,13);
  for(const p of pages){
    const html=read('dist/'+p);
    assert.equal(html.split('yk791-exam-skeleton').length,2,p);
    assert.match(html,/data-yk-access-state="loading" aria-busy="true"/,p);
    assert.match(html,/yk791PresentAccess\('loading'\)/,p);
    assert.match(html,/yk791PresentAccess\('error'\)/,p);
    assert.match(html,/const roles=s\?\.authenticated===true/,p);
    assert.equal(html.split('id="yk791AccessRetry"').length,2,p);
  }
});
check('FIX09 exactly 13 Exam pages use verified role, pending state, retry, logout and fresh Admin navigation',()=>{
  const pages=readdirSync('dist',{recursive:true}).filter(p=>p.endsWith('.html')).map(p=>p.replaceAll('\\','/'));
  let n=0;
  for(const p of pages){
    const html=read('dist/'+p),expected=p==='mock-exams.html'||p.startsWith('exams/');
    assert.equal(html.split('async function yk09VerifiedAccount(user)').length-1,expected?1:0,p);
    if(!expected)continue;
    n++;
    const account=html.slice(html.indexOf("  if(mode==='account'){"),html.indexOf('function fmtDateV739'));
    assert(account.includes("await yk09VerifiedAccount(user)"));
    assert(account.includes("verified.roles.includes('admin')"));
    assert(account.includes("()=>verify(true)"));
    assert(account.includes("yk09AccountRetry"));
    assert(account.includes("sequence++"));
    assert(account.includes("sequence!==seq"));
    assert(!account.includes('user.roles'));
    assert(html.includes("async function adminDashboard(){const user=await currentUser();try{if(!(await yk09VerifiedAccount(user)).roles.includes('admin'))"));
  }
  assert.equal(n,13);
});
const roleHtml=read('dist/mock-exams.html');
const verifier=roleHtml.slice(roleHtml.indexOf('async function yk09VerifiedAccount(user)'),roleHtml.indexOf('function yk09InvalidateAccountModal'));
const initial={id:'fixture-1',email:'qa@example.invalid',roles:['admin']};
let response,principal,requests;
const roleCtx=vm.createContext({api:async(name,options)=>{requests.push([name,options.cache]);return response;},currentUser:async()=>principal});
vm.runInContext(verifier,roleCtx);
for(const [name,server,status,now,expected] of [
  ['client Admin, server member',{authenticated:true,email:initial.email,roles:[]},200,initial,[]],
  ['server Admin overrides client member',{authenticated:true,email:initial.email,roles:['admin']},200,{...initial,roles:[]},['admin']],
  ['verified email normalization',{authenticated:true,email:'QA@EXAMPLE.INVALID',roles:['admin']},200,initial,['admin']],
  ['HTTP failure',{authenticated:true,email:initial.email,roles:['admin']},503,initial,null],
  ['not authenticated',{authenticated:false,email:initial.email,roles:['admin']},200,initial,null],
  ['different server principal',{authenticated:true,email:'other@example.invalid',roles:['admin']},200,initial,null],
  ['malformed roles',{authenticated:true,email:initial.email,roles:'admin'},200,initial,null],
  ['account changed mid-request',{authenticated:true,email:initial.email,roles:['admin']},200,{...initial,id:'fixture-2'},null],
  ['logout mid-request',{authenticated:true,email:initial.email,roles:['admin']},200,null,null],
]){
  requests=[];principal=now;response={res:{ok:status===200},data:server};roleCtx.user=initial;
  if(expected===null)await assert.rejects(vm.runInContext('yk09VerifiedAccount(user)',roleCtx),/Role verification unavailable/);
  else{const verified=await vm.runInContext('yk09VerifiedAccount(user)',roleCtx);assert.deepEqual(Array.from(verified.roles),expected);}
  assert.deepEqual(requests,[['exam-status','no-store']]);
  console.log('PASS v7912 FIX09 '+name);count++;
}
check('FIX11 guest free-attempt copy matches existing per-exam policy in MY, EN and JA on all 14 pages',()=>{
  const key='Login / Register required · One free attempt per exam type.';
  const my='အကောင့်ဝင်ရန် / စာရင်းသွင်းရန် လိုအပ်ပါတယ် · စာမေးပွဲအမျိုးအစားတစ်ခုစီအတွက် အခမဲ့ 1 ကြိမ် ဖြေဆိုနိုင်ပါတယ်။';
  const ja='ログイン / 登録が必要です。試験の種類ごとに初回1回無料で受験できます。';
  const pages=readdirSync('dist',{recursive:true}).filter(p=>p.endsWith('.html')).map(p=>p.replaceAll('\\','/'));
  let total=0;
  for(const page of pages){
    const html=read('dist/'+page);
    assert(!html.includes('အကောင့်တစ်ခုလျှင် အခမဲ့စာမေးပွဲ စုစုပေါင်း 1 ကြိမ် ရရှိပါတယ်။'),page);
    assert(!html.includes('1アカウントにつき無料試験は合計1回利用できます。'),page);
    if(page!=='index.html'&&page!=='mock-exams.html'&&!page.startsWith('exams/'))continue;
    const start=html.indexOf('const V737_TEXT = {'),end=html.indexOf('const V737_ORIGINAL_ATTR',start);
    assert(start>=0&&end>start,page);
    const context=vm.createContext({key});vm.runInContext(html.slice(start,end),context);
    assert.equal(vm.runInContext('V737_TEXT.my[key]',context),my,page);
    assert.equal(vm.runInContext('V737_TEXT.ja[key]',context),ja,page);
    if(page!=='index.html'){
      assert(html.includes("x:'"+key+"'"),page);
      assert(html.includes('Login is required so your one free attempt per exam type and paid/student access can be securely tracked.'),page);
      assert(!html.includes('Login is required so your one free exam and paid/student access can be securely tracked.'),page);
    }
    total++;
  }
  assert.equal(total,14);
  // No changes to the actual server-side quota or uniqueness constraint.
  assert(read('netlify/functions/exam-status.mts').includes('freeAttemptLimitPerExamType: 1'));
  assert(read('netlify/database/migrations/20261101150000_v763_free_per_exam_type.sql').includes('ON exam_attempts(user_id,exam_type)'));
});
check('FIX11 preserves every dictionary base record and ID except the approved one-word Myanmar gloss',()=>{
  const terms=s=>JSON.parse(s.match(/const terms = (\[[^\n]*\]);/)[1]);
  const original=terms(read('index.html'));
  const corrected=terms(read('dist/assets/yk-dictionary-runtime-v7863.js'));
  const matches=original.filter(t=>t.jp==='フットブレーキ'&&t.reading===''&&t.mm==='ခြေးဘရိတ်'&&t.sources?.includes('TRUCK CH1'));
  assert.equal(matches.length,1);
  const expected=original.map(t=>t===matches[0]?{...t,mm:'ခြေနင်းဘရိတ်'}:t);
  assert.deepEqual(corrected,expected);
  assert(read('dist/index.html').includes('yk-dictionary-runtime-v7863.js?v=7863-v7911-fix11'));
});
check('FIX11 real generated dictionary runtime renders the corrected gloss with actual merged data',()=>{
  const ids=['dictionarySearch','dictionaryResults','dictionaryEmpty','dictionaryToolsV7','dictFavMode','dictRecentV7','dictCountV7','dictionaryLoadMore','dictionaryReportModal','dictionaryReportForm','dictReportStatus','dictReportSend','dictReportWord','dictReportCurrent','dictReportCancel'];
  const elems=new Map(ids.map(id=>[id,{value:'',innerHTML:'',textContent:'',hidden:false,disabled:false,dataset:{},style:{},classList:{toggle(){}},addEventListener(){},querySelectorAll(){return []}}]));
  const window={location:{hash:'#driving-dictionary',search:'?yk_dictionary_q='+encodeURIComponent('フットブレーキ')}};
  const context=vm.createContext({window,document:{getElementById:id=>elems.get(id)||null,querySelectorAll:()=>[]},localStorage:{getItem:()=>null,setItem(){}},fetch:async()=>({ok:true,json:async()=>({overrides:[]})}),URLSearchParams,console,setTimeout(){},clearTimeout(){},navigator:{},SpeechSynthesisUtterance:function(){}});
  for(const file of ['yk-dictionary-v778-complete-draft.js','yk-dictionary-v783-overlay.js','yk-dictionary-runtime-v7863.js'])vm.runInContext(read('dist/assets/'+file),context);
  assert.equal(elems.get('dictionarySearch').value,'フットブレーキ');
  const result=elems.get('dictionaryResults').innerHTML;
  assert(result.includes('フットブレーキ'));
  assert(result.includes('ခြေနင်းဘရိတ်'));
  assert(!result.includes('ခြေးဘရိတ်'));
});
check('FIX14 invite links route to existing password setup without affecting other Home navigation',()=>{
  const cases=[
    ['#invite_token=synthetic', '/login.html#invite_token=synthetic'],
    ['#invite_token=abc%2Bdef%2Fghi', '/login.html#invite_token=abc%2Bdef%2Fghi'],
    ['#invite_token=synthetic&other=1', '/login.html#invite_token=synthetic'],
    ['#invite_token=',null],['#home',null],['#yk82Hub',null],['#driving-dictionary',null],
    ['#recovery_token=synthetic',null],['#confirmation_token=synthetic',null],
    ['#email_change_token=synthetic',null],['',null],['#not_invite_token=synthetic',null]
  ];
  for(const path of ['index.html','dist/index.html']){
    const html=read(path);
    const script=html.match(/<script id="yk-identity-invite-landing">([\s\S]+?)<\/script>/);
    assert(script,path);
    assert(html.indexOf(script[0])<html.indexOf('/assets/identity.bundle.js'),path);
    for(const [hash,expected] of cases){
      let actual=null;
      vm.runInNewContext(script[1],{location:{hash,replace(value){actual=value;}},URLSearchParams,encodeURIComponent});
      assert.equal(actual,expected,path+' '+hash.split('=')[0]);
    }
  }
  assert(read('dist/login.html').includes('id="viewNewPassword"'));
  assert(read('dist/assets/yk-login-v757.js').includes('id.acceptInvite(inviteToken,pass)'));
});
console.log('TOTAL v7.91.2 targeted: '+count+' PASS / 0 FAIL');
