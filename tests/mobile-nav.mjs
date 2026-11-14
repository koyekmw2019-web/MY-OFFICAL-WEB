import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {join, resolve} from 'node:path';
import vm from 'node:vm';
const code=readFileSync('assets/yk-mobile-nav.js','utf8');
const listeners={};
const links=['home','study','exam','video','account'].map(tab=>({dataset:{tab},attrs:{},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]}}));
const nav={hidden:false,querySelectorAll:()=>links};
let menu=false, blocked=false, refresh;
const document={getElementById:()=>nav,body:{classList:{contains:()=>menu}},querySelector:()=>blocked,activeElement:null,addEventListener:(k,fn)=>listeners[k]=fn};
const location={pathname:'/',hash:''};
vm.runInNewContext(code,{document,location,window:{addEventListener:(k,fn)=>listeners[k]=fn},queueMicrotask:fn=>fn(),MutationObserver:class{constructor(fn){refresh=fn}observe(){}}});
function check(path,hash,tab){location.pathname=path;location.hash=hash;listeners.hashchange();assert.deepEqual(links.filter(l=>l.attrs['aria-current']).map(l=>l.dataset.tab),[tab]);}
check('/','', 'home');check('/','#study-hub','study');check('/index.html','#yk82Hub','study');check('/study/n2.html','','study');check('/mock-exams.html','','exam');check('/exams/truck.html','','exam');check('/video-class.html','','video');
for(const page of ['login','dashboard','student-dashboard','member-dashboard','admin-dashboard'])check('/'+page+'.html','','account');
blocked=true;refresh();assert.equal(nav.hidden,true);blocked=false;refresh();assert.equal(nav.hidden,false);
menu=true;refresh();assert.equal(nav.hidden,true);menu=false;
document.activeElement={matches:()=>true};listeners.focusin();assert.equal(nav.hidden,true);
document.activeElement=null;listeners.focusout();assert.equal(nav.hidden,false);
document.fullscreenElement={};listeners.fullscreenchange();assert.equal(nav.hidden,true);
document.fullscreenElement=null;listeners.fullscreenchange();assert.equal(nav.hidden,false);
// Any accidental API/storage access would throw in this sandbox (none are provided).
assert.doesNotMatch(code,/\b(?:fetch|localStorage|sessionStorage|XMLHttpRequest)\b/);
if(process.argv.includes('--release')){
 const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.name.endsWith('.html')?[join(d,e.name)]:[]);
 const pages=walk('dist');assert.ok(pages.length>=22);
 for(const file of pages){
  const html=readFileSync(file,'utf8');assert.equal((html.match(/id="yk-mobile-nav"/g)||[]).length,1,file);
  for(const href of ['/#home','/#study-hub','/mock-exams.html','/video-class.html','/dashboard.html'])assert.ok(html.includes(`href="${href}"`),file);
 }
 for(const path of ['index.html','mock-exams.html','video-class.html','dashboard.html','assets/yk-mobile-nav.js','assets/yk-mobile-nav.css'])assert.ok(existsSync(resolve('dist',path)),path);
 assert.match(readFileSync('dist/index.html','utf8'),/id="study-hub"/);
 assert.match(readFileSync('dist/dashboard.html','utf8'),/dashLogout/);
 console.log(`PASS mobile navigation output: ${pages.length} pages, destination files, preserved logout`);
}
console.log('PASS mobile navigation: 12 routing scenarios, exam/menu/input/fullscreen visibility, no API or session access');
