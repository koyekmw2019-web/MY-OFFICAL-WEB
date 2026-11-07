/** v7.80 simulated service-worker behavior: public static assets only, not private routes. */
import {readFileSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const handlers={};
const calls={network:0,cacheWrite:0};
const records=new Map();
const store={
  match:async (r)=>records.get(r.url)?.clone(),
  put:async (r,v)=>{calls.cacheWrite++;records.set(r.url,v.clone())}
};
const caches={
  keys:async()=>['old-unrelated-cache','yk-public-static-yk-official-v7-79-seo-jlpt-cards'],
  delete:async()=>true,
  open:async()=>store
};
const self={location:{origin:'https://site.example'},addEventListener:(type,handler)=>handlers[type]=handler,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
const fetch=async()=>{calls.network++;const response=new Response('public',{status:200});Object.defineProperty(response,'type',{value:'basic'});return response};
vm.runInNewContext(readFileSync(join(root,'service-worker.js'),'utf8'),{self,caches,fetch,Response,URL});
assert(handlers.fetch&&handlers.install&&handlers.activate);
let passes=0;
const check=async (name,run)=>{await run();console.log('PASS '+name);passes++};
function runRequest(path,{mode='no-cors',method='GET',authorization=false}={}){
 const url=(path.startsWith('https:')?path:`https://site.example${path}`);
 let promise;
 const waits=[];
 const e={request:{url,method,mode,headers:{has:(k)=>k==='authorization'&&authorization}},respondWith:(p)=>promise=p,waitUntil:(p)=>waits.push(p)};
 handlers.fetch(e);
 return {response:promise,waits};
}
await check('navigation, login and API calls bypass the cache',async()=>{
 for(const path of ['/','/admin-dashboard.html','/.netlify/functions/exam-access','/api/payment']){
  const result=runRequest(path,{mode:path==='/'?'navigate':'no-cors'});
  assert.equal(result.response,undefined,path);
 }
});
await check('non-GET or bearer-authenticated static asset requests bypass cache',async()=>{
 assert.equal(runRequest('/assets/a.js',{method:'POST'}).response,undefined);
 assert.equal(runRequest('/assets/a.js',{authorization:true}).response,undefined);
 assert.equal(runRequest('https://external.example/assets/a.js').response,undefined);
});
await check('public image fetch caches and reuses successful response',async()=>{
 const a=runRequest('/assets/embedded-v780/image-01-x.jpg');
 assert(a.response);assert.equal((await a.response).status,200);
 await Promise.all(a.waits);
 const b=runRequest('/assets/embedded-v780/image-01-x.jpg');
 assert(b.response);assert.equal((await b.response).status,200);
 assert.equal(calls.network,1);
 assert.equal(calls.cacheWrite,1);
});
await check('HTML and unknown file types never cached',async()=>{
 assert.equal(runRequest('/index.html').response,undefined);
 assert.equal(runRequest('/private.json').response,undefined);
});
console.log(`TOTAL v7.80 SERVICE WORKER: ${passes} PASS / 0 FAIL`);
