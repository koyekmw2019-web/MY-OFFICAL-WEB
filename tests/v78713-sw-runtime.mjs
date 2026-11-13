/** Browser-service-worker mocked policy QA. No actual browser network. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const sw=readFileSync('service-worker.js','utf8');
const handlers={},saved=new Map(),writes=[],deleted=[];let network=[];
function reply({length=1000,cache='public',cookie=false}={}){
 const headers=new Map([['cache-control',cache]]);
 if(length!==null)headers.set('content-length',String(length));
 if(cookie)headers.set('set-cookie','session=secret');
 return {ok:true,type:'basic',headers:{get:k=>headers.get(k)||null,has:k=>headers.has(k)},clone(){return this}};
}
let next=reply();
const self={location:{origin:'https://localhost.example'},addEventListener:(name,cb)=>handlers[name]=cb,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
const caches={keys:async()=>['yk-public-static-old','other-cache'],delete:async k=>{deleted.push(k);return true},open:async()=>({match:async request=>saved.get(request.url)||null,put:async(request,response)=>{writes.push(request.url);saved.set(request.url,response)}})};
vm.runInNewContext(sw,{self,caches,fetch:async request=>{network.push(request.url);return next},URL});
let activation=null;handlers.activate({waitUntil:p=>activation=p});await activation;
assert.deepEqual(deleted,['yk-public-static-old']);
async function visit(path,{mode='cors',method='GET',cache='default',auth=false,cookie=false,response={}}={}){
 next=reply(response);let result=null,handled=false;const pending=[];
 handlers.fetch({request:{url:'https://localhost.example'+path,mode,method,cache,headers:{has:k=>(k==='authorization'&&auth)||(k==='cookie'&&cookie)}},
 respondWith:p=>{handled=true;result=p},waitUntil:p=>pending.push(p)});
 if(handled){await result;await Promise.all(pending)}return handled;
}
for(const path of ['/','/index.html','/student-dashboard.html','/login.html','/.netlify/functions/exam-access','/api/private'])
 assert.equal(await visit(path,{mode:path.endsWith('.html')||path==='/'?'navigate':'cors'}),false,'No interception: '+path);
assert.equal(await visit('/assets/public.js'),true);
assert.equal(writes.length,1);
assert.equal(await visit('/assets/public.js'),true);
assert.equal(network.length,2,'Second request served from public cache and revalidates unversioned script once in background');
assert.equal(await visit('/assets/yk-v7879-grammar-n2.json'),true);
assert.equal(writes.length,3,'Public level-scoped Grammar JSON cacheable');
assert.equal(await visit('/assets/huge.webp',{response:{length:2500000}}),true);
assert.equal(writes.length,3,'Over-size response not persisted');
assert.equal(await visit('/assets/unknown.jpg',{response:{length:null}}),true);
assert.equal(writes.length,3,'Unknown-size image not persisted');
assert.equal(await visit('/assets/private.css',{response:{cache:'private, max-age=0'}}),true);
assert.equal(writes.length,3,'Private Cache-Control not persisted');
assert.equal(await visit('/assets/no-store.css',{response:{cache:'no-store'}}),true);
assert.equal(writes.length,3,'No-store response not persisted');
assert.equal(await visit('/assets/cookie.js',{response:{cookie:true}}),true);
assert.equal(writes.length,3,'Set-Cookie response not persisted');
assert.equal(await visit('/assets/authorization.js',{auth:true}),false);
assert.equal(await visit('/assets/cookie-header.js',{cookie:true}),false);
assert.equal(await visit('/assets/nonpersistent.css',{cache:'no-store'}),false);
console.log('PASS v78713-sw-runtime: public repeat cache, grammar JSON, max-byte budget, private/no-store/cookie/authorization, no HTML or protected API caching');
