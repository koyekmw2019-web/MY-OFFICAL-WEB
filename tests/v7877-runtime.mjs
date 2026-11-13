/** v7.87.7 runtime mocks for both new Netlify endpoints. No real DB/network. */
import assert from 'node:assert/strict';
import {readFileSync,copyFileSync,mkdirSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';
const root=mkdtempSync(join(tmpdir(),'yk-growth-fixture-'));
try{
 const functions=join(root,'netlify/functions'),shared=join(functions,'_shared'),pkg=join(root,'node_modules/@netlify/database');
 mkdirSync(shared,{recursive:true});mkdirSync(pkg,{recursive:true});
 writeFileSync(join(root,'package.json'),'{"type":"module"}');
 writeFileSync(join(pkg,'package.json'),'{"name":"@netlify/database","type":"module","exports":"./index.js"}');
 writeFileSync(join(pkg,'index.js'),'export const getDatabase=()=>globalThis.__yk877DB;');
 writeFileSync(join(shared,'auth.mts'),`export const requireAdmin=async()=>{if(!globalThis.__yk877Admin)throw new Response('Forbidden',{status:403})};export const asResponse=e=>e instanceof Response?e:Response.json({error:'Unknown error'},{status:500});`);
 for(const n of ['yk-business-growth.mts','yk-growth-event.mts'])copyFileSync('netlify/functions/'+n,join(functions,n));
 const business=(await import(pathToFileURL(join(functions,'yk-business-growth.mts')).href)).default;
 const click=(await import(pathToFileURL(join(functions,'yk-growth-event.mts')).href)).default;
 let calls=[],inserted=[];
 const fake={sql:async(strings,...params)=>{
  const text=strings.join('?');calls.push({text,params});
  if(text.includes('INSERT INTO yk_growth_click_events')){inserted.push(params);return []}
  if(text.includes('INSERT INTO yk_growth_manual_entries'))return [];
  if(text.includes('DELETE FROM yk_growth_manual_entries'))return [{id:params[0]}];
  if(text.includes('SELECT course,event_source,COUNT(*)'))return [{course:'truck',event_source:'facebook',clicks:15}];
  if(text.includes('SELECT entry_type,course,event_source,SUM(units)'))return [{entry_type:'enrollment_revenue',course:'truck',event_source:'facebook',units:2,amount_yen:20000}];
  if(text.includes('SELECT COUNT(*)::int total FROM yk_growth_click_events'))return [{total:15}];
  if(text.includes('SELECT entry_type,SUM(units)'))return [
   {entry_type:'confirmed_inquiries',units:3,amount_yen:0},
   {entry_type:'enrollment_revenue',units:2,amount_yen:20000},
   {entry_type:'marketing_expense',units:1,amount_yen:5000}];
  if(text.includes('SELECT id,entry_type,course,event_source,units,amount_yen'))return [];
  if(text.includes('FROM exam_students'))return [{total:40,active:25}];
  if(text.includes('FROM exam_payment_requests'))return [{approved_count:6,approved_amount_yen:12000}];
  throw new Error('Mock has no SQL: '+text.slice(0,170));
 }};
 globalThis.__yk877DB=fake;
 const host='https://yekun-mryethemenstyle.netlify.app';
 const headers={'Origin':host,'Content-Type':'application/json','Sec-Fetch-Site':'same-origin'};
 let res=await click(new Request(host+'/.netlify/functions/yk-growth-event',{method:'POST',headers,body:JSON.stringify({event:'class_cta_click',course:'truck',page:'/study/ssw-truck.html',source:'facebook',medium:'social',campaign:'japan_2026'})}));
 assert.equal(res.status,204);assert.equal(inserted.length,1);assert.equal(inserted[0][0],'truck');
 res=await click(new Request(host+'/.netlify/functions/yk-growth-event',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://evil.example'},body:'{}'}));assert.equal(res.status,403);
 res=await click(new Request(host+'/.netlify/functions/yk-growth-event',{method:'POST',headers,body:JSON.stringify({event:'class_cta_click',course:'jlpt_n5',page:'/study/ssw-truck.html'})}));assert.equal(res.status,400);
 res=await click(new Request(host+'/.netlify/functions/yk-growth-event',{method:'POST',headers,body:JSON.stringify({event:'class_cta_click',course:'taxi',page:'/study/ssw-taxi.html',source:'me@example.com'})}));assert.equal(res.status,204);assert.equal(inserted[1][1],'direct','PII-looking UTM must be discarded');
 globalThis.__yk877Admin=false;
 res=await business(new Request(host+'/.netlify/functions/yk-business-growth?days=30'));
 assert.equal(res.status,403,'non-admin never receives metrics');
 globalThis.__yk877Admin=true;
 res=await business(new Request(host+'/.netlify/functions/yk-business-growth?days=30'));
 assert.equal(res.status,200);
 const data=await res.json();
 assert.equal(data.clicks.total,15);assert.equal(data.manual.inquiries,3);assert.equal(data.manual.enrollments,2);
 assert.equal(data.manual.revenueYen,20000);assert.equal(data.manual.marketingExpenseYen,5000);
 assert.equal(data.manual.afterRecordedMarketingYen,15000);assert.equal(data.visitorCount,null);
 assert.equal(data.examAccessPayments.includedInClassRevenue,false);
 res=await business(new Request(host+'/.netlify/functions/yk-business-growth?days=300'));
 assert.equal(res.status,400);
 res=await business(new Request(host+'/.netlify/functions/yk-business-growth',{method:'POST',headers,
  body:JSON.stringify({entryType:'confirmed_inquiries',course:'truck',source:'facebook',units:2,amountYen:0,entryDay:'2026-11-11'})}));
 assert.equal(res.status,200);
 res=await business(new Request(host+'/.netlify/functions/yk-business-growth',{method:'POST',headers,
  body:JSON.stringify({entryType:'enrollment_revenue',course:'taxi',source:'youtube',units:1,amountYen:10000,entryDay:'2026-11-11'})}));
 assert.equal(res.status,200);
 res=await business(new Request(host+'/.netlify/functions/yk-business-growth',{method:'POST',headers,
  body:JSON.stringify({entryType:'enrollment_revenue',course:'taxi',units:1,amountYen:10000,entryDay:'9999-99-99'})}));
 assert.equal(res.status,400,'invalid dates must be validation errors');
 res=await business(new Request(host+'/.netlify/functions/yk-business-growth',{method:'DELETE',headers,body:JSON.stringify({id:42})}));assert.equal(res.status,200);
 // Browser event capture: only true click on allowlisted link, never prevent navigation.
 const script=readFileSync('assets/yk-v7877-cta.js','utf8');
 const listeners={},events=[],saved=new Map();
 const sessionStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};
 const document={addEventListener:(k,fn)=>listeners[k]=fn};
 const location={search:'?utm_source=Facebook&utm_medium=social&utm_campaign=truck_2026',pathname:'/study/ssw-truck.html',href:host+'/study/ssw-truck.html'};
 const context={document,location,URL,URLSearchParams,sessionStorage,fetch:(url,opts)=>{events.push({url,opts});return Promise.resolve({status:204})}};
 vm.runInNewContext(script,context,{filename:'yk-v7877-cta.js'});
 let prevented=false;
 const anchor={dataset:{yk877Course:'truck'},href:'https://www.facebook.com/share/19kc6Vk9XM/'};
 listeners.click({isTrusted:true,target:{closest:()=>anchor},preventDefault:()=>{prevented=true}});
 assert.equal(events.length,1);assert.equal(prevented,false);
 assert.equal(JSON.parse(events[0].opts.body).source,'facebook');
 assert.equal(JSON.parse(events[0].opts.body).campaign,'truck_2026');
 listeners.click({isTrusted:false,target:{closest:()=>anchor}});assert.equal(events.length,1);
 console.log('PASS v7877-runtime: click-only UTM, same-origin, admin auth, manual entries, arithmetic, no fake visitors');
}finally{rmSync(root,{recursive:true,force:true})}
