/** v7.86.2: scoped UI / admin tools / video identity / learning-metric safety checks.
 * Real Netlify session and deployment checks are separate staging tasks. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const rd=p=>readFileSync(join(root,p),'utf8');
const check=(name,fn)=>{fn();console.log('PASS v7862 '+name)};
check('version, build, no new DB or protected core changes required',()=>{
 const p=JSON.parse(rd('package.json'));
 assert(['7.86.2','7.86.3','7.86.4','7.86.5','7.87.0','7.87.1','7.88.0-rc.1','7.88.1-rc.1'].includes(p.version));
 assert(p.scripts.test.includes('v7862-ui-session-stability.mjs'));
 assert(p.scripts.build.includes('v7862-ui-session-stability.mjs'));
 assert(["version:'7.86.2'","version:'7.86.3'","version:'7.86.4'","version:'7.86.5'"].some(x=>rd('scripts/build-public-v7841.mjs').includes(x)));
 assert(rd('netlify.toml').includes('publish = "dist"'));
});
check('mobile dashboard action footer is in document flow not fixed',()=>{
 const css=rd('assets/yk-dashboard-v759.css');
 assert(css.includes('@media(max-width:720px)'));
 assert(css.includes('.yk-dash-dock{position:relative;'));
 assert(css.includes('env(safe-area-inset-bottom)'));
 for(const page of ['admin-dashboard.html','student-dashboard.html','member-dashboard.html','dashboard.html'])assert(rd(page).includes('yk-dashboard-v759.css?v=7862'));
});
check('administrator report link gated inside admin-only role-specific panel',()=>{
 const js=rd('assets/yk-dashboard-v758.js');
 assert(js.includes('async function showAdmin()'));
 assert(js.includes('Admin Management Tools'));
 assert(js.includes('/dictionary-reports.html'));
 const html=rd('admin-dashboard.html');
 assert(!html.includes('href="/dictionary-reports.html"'));
 assert(rd('dictionary-reports.html').includes('noindex,nofollow'));
});
check('dictionary source data unchanged while reporting is behind More options',()=>{
 const html=rd('index.html');
 assert(html.includes('<details class="dict-more-v7862">'));
 assert(html.includes('data-action="report"'));
 assert(html.includes('dict-v783-report'));
 assert(!html.includes('Existing glossary meaning · further review pending'));
 assert(html.includes('Translation draft · Review pending'));
 assert(html.includes('Source details: '));
 assert(html.includes('function openDictionaryReport(t)'));
});
check('Video Course uses education logo and Identity session client',()=>{
 const html=rd('video-class.html');
 assert(html.includes('yk-horizontal-white-v778.webp'));
 assert(!html.includes('YK YE KUN'));
 assert(html.includes('id="vcAccountLink"'));
 assert(html.includes('identity.bundle.js'));
 assert(html.includes('yk-video-account-v7862.js'));
 const code=rd('assets/yk-video-account-v7862.js');
 assert(code.includes('window.YKIdentity.getUser()'));
 assert(code.includes('account.href=\'/dashboard.html\''));
 assert(code.includes('account.href=\'/login.html\''));
 new vm.Script(code);
});
check('Video Course identity account state for signed-in, guest and errors',async()=>{});
// Avoid mocking the Netlify SDK itself: verify account renderer using a fake DOM + promise-driven check.
{
 const code=rd('assets/yk-video-account-v7862.js');
 async function runFor(user,throws=false){
  const listeners={};
  const account={dataset:{},setAttribute(k,v){this[k]=v;},textContent:'',href:''};
  const select={addEventListener(n,fn){listeners['lang'+n]=fn;}};
  const document={documentElement:{lang:'my'},hidden:false,getElementById:k=>k==='vcAccountLink'?account:k==='vcLanguage'?select:null,addEventListener(n,fn){listeners[n]=fn;}};
  const window={YKIdentity:{getUser:async()=>{if(throws)throw Error('expired');return user;}},addEventListener(n,fn){listeners[n]=fn;}};
  const context={window,document,console,Boolean};
  vm.createContext(context);vm.runInContext(code,context);
  await new Promise(r=>setTimeout(r,5));
  return account;
 }
 const a=await runFor({id:'student-123'});assert.equal(a.textContent,'Dashboard');assert.equal(a.href,'/dashboard.html');
 const b=await runFor(null);assert.equal(b.textContent,'Login');assert.equal(b.href,'/login.html');
 const c=await runFor(null,true);assert.equal(c.textContent,'Login');
 console.log('PASS v7862 auth UI mocked session/guest/expired behavior');
}
check('saved learning metrics avoid mixed-scale averages while retaining features',()=>{
 const js=rd('assets/yk-learning-v760.js');
 assert(!js.includes('Average Score (raw)'));
 assert(!js.includes('Smart Learning · v7.60'));
 assert(js.includes('Additional Learning Tools'));
 assert(js.includes('A zero saved-mistakes count does not prove zero wrong answers.'));
 assert(js.includes('const grouped=new Map()'));
 for(const feature of ['Wrong Answer Review','Daily Practice (5 / 10 / 20)','Announcements','Publish Announcement (Admin)'])assert(js.includes(feature));
 new vm.Script(js);
});
console.log('v7.86.2 scoped checks completed');
