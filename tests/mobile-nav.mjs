import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import vm from 'node:vm';
const code=readFileSync('assets/yk-mobile-nav.js','utf8');
const listeners={};
const links=['home','study','exam','video','account'].map(tab=>({
  dataset:{tab},attrs:{},
  getAttribute(k){return this.attrs[k]??null},hasAttribute(k){return k in this.attrs},
  setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]}
}));
const nav={hidden:false,querySelectorAll:()=>links};
let menu=false,blocked=false,refresh;
const document={
 getElementById:()=>nav,body:{classList:{contains:()=>menu}},
 querySelector:()=>blocked,activeElement:null,
 addEventListener:(k,fn)=>listeners[k]=fn
};
const location={pathname:'/',hash:''};
vm.runInNewContext(code,{document,location,window:{addEventListener:(k,fn)=>listeners[k]=fn},queueMicrotask:fn=>fn(),MutationObserver:class{constructor(fn){refresh=fn}observe(){}}});
function check(path,hash,tab,event='pageshow'){
 location.pathname=path;location.hash=hash;listeners[event]();
 assert.deepEqual(links.filter(l=>l.attrs['aria-current']).map(l=>l.dataset.tab),[tab],path+hash);
}
// Original routes + Netlify Pretty URL alternatives + history navigation.
check('/','','home');
check('/','#home','home','hashchange');
check('/','#study-hub','study','hashchange');
check('/index.html','#yk82Hub','study','hashchange');
check('/','#driving-dictionary','study','hashchange');
check('/study/n2.html','','study');
check('/study/n2','','study');
check('/study/','','study');
check('/mock-exams.html','','exam');
check('/mock-exams','','exam');
check('/mock-exams/','','exam');
check('/exams/truck.html','','exam');
check('/exams/truck','','exam');
check('/video-class.html','','video');
check('/video-class','','video');
check('/video-class/','','video','popstate');
for(const page of ['login','dashboard','student-dashboard','member-dashboard','admin-dashboard','dictionary-reports']){
 check('/'+page+'.html','','account');
 check('/'+page,'','account');
 check('/'+page+'/','','account');
}
check('/random-page','','home','popstate');
blocked=true;refresh();assert.equal(nav.hidden,true);blocked=false;refresh();assert.equal(nav.hidden,false);
menu=true;refresh();assert.equal(nav.hidden,true);menu=false;
document.activeElement={matches:()=>true};listeners.focusin();assert.equal(nav.hidden,true);
document.activeElement=null;listeners.focusout();assert.equal(nav.hidden,false);
document.fullscreenElement={};listeners.fullscreenchange();assert.equal(nav.hidden,true);
document.fullscreenElement=null;listeners.fullscreenchange();assert.equal(nav.hidden,false);
// No backend calls, auth access, storage or navigation redirects.
assert.doesNotMatch(code,/\b(?:fetch|localStorage|sessionStorage|XMLHttpRequest|pushState|replaceState)\b/);
if(process.argv.includes('--release')){
 const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.name.endsWith('.html')?[join(d,e.name)]:[]);
 const pages=walk('dist');assert.ok(pages.length>=22);
 for(const file of pages){
  const html=readFileSync(file,'utf8');assert.equal((html.match(/id="yk-mobile-nav"/g)||[]).length,1,file);
  for(const href of ['/#home','/#study-hub','/mock-exams.html','/video-class.html','/dashboard.html']) assert.ok(html.includes(`href="${href}"`),file);
  assert.match(html,/yk-mobile-nav\.js\?v=2/);assert.match(html,/yk-mobile-nav\.css\?v=2/);
 }
 for(const path of ['index.html','mock-exams.html','video-class.html','dashboard.html','assets/yk-mobile-nav.js','assets/yk-mobile-nav.css']) assert.ok(existsSync(resolve('dist',path)),path);
 assert.match(readFileSync('dist/index.html','utf8'),/id="study-hub"/);
 assert.match(readFileSync('dist/dashboard.html','utf8'),/dashLogout/);
 console.log(`PASS mobile navigation output: ${pages.length} pages, destination files, preserved logout`);
}
console.log('PASS mobile navigation: HTML and clean URL routing, browser history, visibility, no API/session access');
