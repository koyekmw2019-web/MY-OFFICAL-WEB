/** Offline/failed-resource UI and SW regression; no backend or web access. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const ui=readFileSync('assets/yk-v7875-stability.js','utf8');
const controls={};const elems=[];let reloadCount=0;
function element(tag){
 const node={tagName:tag,hidden:false,attributes:{},children:[],className:'',style:{},
 setAttribute(k,v){this.attributes[k]=v},append(...nodes){this.children.push(...nodes)},
 addEventListener(type,cb){this['on'+type]=cb},insertAdjacentElement(place,obj){controls.banner=obj},
 classList:{contains:()=>false}};
 elems.push(node);return node;
}
const top=element('HEADER');const body=element('BODY');
body.classList={contains:cls=>cls==='yk874-education-menu'};
let panelActive=false;let isChild=false;
const panel={classList:{contains:cls=>cls==='active'&&panelActive},get firstElementChild(){return isChild}};
const doc={body,documentElement:{lang:'my'},createElement:element,
 querySelector:q=>q==='.top'?top:null,getElementById:id=>id==='examPanel'?panel:null};
const listeners={};let online=true;
const env={document:doc,navigator:{get onLine(){return online}},
 location:{href:'https://example.test/exams/truck.html',origin:'https://example.test',reload(){reloadCount++}},
 addEventListener(type,cb){listeners[type]=cb},MutationObserver:class{observe(){}},URL};
vm.runInNewContext(ui,env);
const banner=controls.banner;
assert(banner&&banner.hidden===true);const [msg,retry]=banner.children;
assert.equal(typeof listeners.online,'function');
online=false;listeners.offline();
assert.equal(banner.hidden,false);assert(msg.textContent.includes('Timer'));
assert.equal(retry.hidden,true);
online=true;listeners.online();assert.equal(banner.hidden,true);
listeners.error({target:{tagName:'IMG',src:'https://example.test/logo.png'}});
assert.equal(banner.hidden,true,'Decorative image errors cannot lock exam');
listeners.error({target:{tagName:'SCRIPT',src:'https://example.test/assets/identity.bundle.js'}});
assert.equal(banner.hidden,false);assert.equal(retry.hidden,false);
panelActive=true;isChild=true;listeners.online();assert.equal(retry.hidden,true);
retry.onclick?.();assert.equal(reloadCount,0);
panelActive=false;isChild=false;listeners.online();assert.equal(retry.hidden,false);
retry.onclick?.();assert.equal(reloadCount,1,'Explicit reload should be allowed only when no exam is active');
// Resource message is read-only; manual click handler verifies safe restart only before exam.
const events=[];const sw=readFileSync('service-worker.js','utf8');
const handlers={};const deleted=[];
const caches={keys:async()=>['yk-public-static-older','yk-public-static-yk-official-v7-87-5','unrelated-cache'],delete:async x=>{deleted.push(x);return true},open:async()=>({match:async()=>null,put:async()=>{}})};
const self={location:{origin:'https://example.test'},addEventListener:(t,fn)=>handlers[t]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
vm.runInNewContext(sw,{self,caches,fetch:async()=>new Response('ok'),URL,Response});
assert(handlers.fetch&&handlers.activate&&handlers.install);
let activateWait=[];handlers.activate({waitUntil:p=>activateWait.push(p)});await Promise.all(activateWait);
assert.deepEqual(deleted,['yk-public-static-older','yk-public-static-yk-official-v7-87-5']);
for(const path of ['/', '/index.html','/mock-exams.html','/exams/truck.html','/login.html','/student-dashboard.html','/.netlify/functions/exam-access','/api/student','/admin-dashboard.html']){
 let intercepted=false;handlers.fetch({request:{url:'https://example.test'+path,method:'GET',mode:'navigate',headers:{has:()=>false}},respondWith:()=>{intercepted=true}});
 assert(!intercepted,`Protected navigation must bypass SW: ${path}`);
}
console.log('PASS v7875-runtime: offline, critical script failures, no auto retry, versioned SW cache invalidation and private navigation bypass');
