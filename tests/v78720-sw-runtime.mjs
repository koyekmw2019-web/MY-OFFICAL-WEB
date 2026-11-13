/** v7.87.20 SW behavior, mocked browser CacheStorage/network (not production). */
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const src=readFileSync('service-worker.js','utf8');
const handlers={},stores=new Map(),deleted=[],requests=[];
let responseKind='js',offline=false;
const mime={js:'text/javascript',css:'text/css',json:'application/json',html:'text/html',img:'image/png'};
const makeReply=(kind='js',bytes=1000,cacheControl='public')=>({
  ok:true,type:'basic',headers:{get(k){return ({'content-type':mime[kind]||kind,'cache-control':cacheControl,'content-length':String(bytes)})[k]??null},has(k){return false}},clone(){return this}
});
const self={location:{origin:'https://yk.test'},addEventListener:(k,fn)=>handlers[k]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
const caches={keys:async()=>['yk-public-static-yk-official-v7-87-13','yk-public-static-yk-official-v7-87-5','unrelated'],delete:async key=>{deleted.push(key);return true},open:async key=>({match:async req=>stores.get(key+' '+req.url)||null,put:async(req,res)=>stores.set(key+' '+req.url,res)})};
let current=makeReply();
vm.runInNewContext(src,{self,caches,URL,fetch:async req=>{requests.push(req.url);if(offline)throw new Error('offline');return current}});
let activation;handlers.activate({waitUntil:p=>activation=p});await activation;
assert.equal(deleted.length,2);
async function visit(path,opts={}){
 const waits=[];let promise=null;
 const req={url:'https://yk.test'+path,mode:opts.mode||'cors',method:opts.method||'GET',cache:opts.cache||'default',headers:{has:k=>!!opts[k]}};
 current=makeReply(opts.kind||'js',opts.bytes??1000,opts.cacheControl||'public');
 handlers.fetch({request:req,respondWith:p=>promise=p,waitUntil:p=>waits.push(p)});
 if(!promise)return {handled:false};
 const response=await promise;
 for(let index=0;index<waits.length;index++)await waits[index];
 return {handled:true,response};
}
for(const path of ['/index.html','/mock-exams.html','/.netlify/functions/exam-access','/.netlify/functions/exam-payment-submit','/api/private','/admin-dashboard.html']) {
 const r=await visit(path);assert(!r.handled,'No private/HTML caching: '+path);
}
assert(!(await visit('/assets/main.js',{authorization:true})).handled);
assert(!(await visit('/assets/main.js',{cookie:true})).handled);
assert(!(await visit('/assets/main.js',{cache:'no-store'})).handled);
await visit('/assets/app.js?ykv=78720');
assert.equal(requests.length,1);
await visit('/assets/app.js?ykv=78720');
assert.equal(requests.length,1,'versioned asset cache-first, no extra mobile request');
await visit('/assets/unversioned.css',{kind:'css'});
await visit('/assets/unversioned.css',{kind:'css'});
assert.equal(requests.filter(x=>x.includes('unversioned.css')).length,2,'one background revalidation for unversioned CSS');
await visit('/assets/unversioned.css',{kind:'css'});
assert.equal(requests.filter(x=>x.includes('unversioned.css')).length,2,'background revalidation throttled per worker');
await visit('/assets/yk-v7879-grammar-n2.json',{kind:'json'});
assert([...stores.keys()].some(x=>x.includes('grammar-n2.json')),'public grammar JSON may cache');
const storedCount=stores.size;
await visit('/assets/404.js',{kind:'html'});
await visit('/assets/wrong.json',{kind:'css'});
await visit('/assets/no-store.js',{cacheControl:'private, no-store'});
await visit('/assets/huge.js',{bytes:3500000});
await visit('/assets/unknown.webp',{kind:'img',bytes:5000000});
assert.equal(stores.size,storedCount,'bad MIME, private, oversized response must not enter CacheStorage');
offline=true;
const saved=await visit('/assets/app.js?ykv=78720');
assert(saved.handled&&saved.response,'cached version must work while offline');
const fallback=await visit('/assets/unversioned.css',{kind:'css'});
assert(fallback.response,'cached CSS must remain usable offline');
console.log('PASS v78720-sw-runtime: activation cleanup, private-route bypass, versioned cache speed, unversioned refresh, bad MIME rejection, offline fallback');
