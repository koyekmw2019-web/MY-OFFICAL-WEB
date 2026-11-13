/** Endpoint mock tests: no real Netlify calls or DB writes. Node 22 with --experimental-strip-types. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {pathToFileURL} from 'node:url';
const root=mkdtempSync(join(tmpdir(),'yk817-api-'));
try{
 const fn=join(root,'netlify/functions'),shared=join(fn,'_shared'),pkg=join(root,'node_modules/@netlify/database');
 mkdirSync(shared,{recursive:true});mkdirSync(pkg,{recursive:true});
 writeFileSync(join(root,'package.json'),'{"type":"module"}');
 writeFileSync(join(pkg,'package.json'),'{"name":"@netlify/database","type":"module","exports":"./index.js"}');
 writeFileSync(join(pkg,'index.js'),'export const getDatabase=()=>globalThis.__yk817DB;');
 writeFileSync(join(shared,'auth.mts'),`export const requireAdmin=async()=>{if(!globalThis.__yk817Admin)throw new Response('Forbidden',{status:403})};export const asResponse=e=>e instanceof Response?e:Response.json({error:'Unknown error'},{status:500});`);
 for(const f of ['yk-enrollment-insights.mts'])copyFileSync('netlify/functions/'+f,join(fn,f));
 copyFileSync('netlify/functions/_shared/yk-crm-insights-v78717.mjs',join(shared,'yk-crm-insights-v78717.mjs'));
 const handler=(await import(pathToFileURL(join(fn,'yk-enrollment-insights.mts')).href)).default;
 const calls=[];
 globalThis.__yk817DB={sql:async(strings,...params)=>{
  const q=strings.join('?');calls.push({q,params});
  if(q.includes('GROUP BY course,lead_source,status'))return [
   {status:'new',course:'truck',lead_source:'facebook',n:4},
   {status:'enrolled',course:'truck',lead_source:'facebook',n:2},
   {status:'interested',course:'taxi',lead_source:'youtube',n:3}];
  if(q.includes('COUNT(*) FILTER (WHERE followup_date'))return [{overdue:2,today:1,next_7_days:3,unscheduled:4}];
  if(q.includes('ORDER BY followup_date ASC'))return [{id:7,prospect_name:'Sample Candidate',
    course:'truck',lead_source:'facebook',status:'contacted',followup_date:'2026-11-11',
    contact_reference:'DO_NOT_LEAK',notes:'DO_NOT_LEAK'}];
  throw Error('Unexpected SQL '+q.slice(0,160));
 }};
 const url='https://example.test/.netlify/functions/yk-enrollment-insights';
 globalThis.__yk817Admin=false;
 let r=await handler(new Request(url));assert.equal(r.status,403);assert.equal(calls.length,0);
 globalThis.__yk817Admin=true;
 r=await handler(new Request(url,{method:'POST'}));assert.equal(r.status,405);assert.equal(calls.length,0);
 r=await handler(new Request(url+'?days=1000'));assert.equal(r.status,400);assert.equal(calls.length,0);
 r=await handler(new Request(url+'?days=30'));
 assert.equal(r.status,200);assert.match(r.headers.get('Cache-Control'),/private.*no-store/);
 const d=await r.json();assert.equal(d.cohort.total,9);assert.equal(d.cohort.counts.enrolled,2);
 assert.equal(d.followups.overdue,2);assert.equal(d.followups.today,1);
 assert.equal(d.followups.dueSample.length,1);
 const dumped=JSON.stringify(d);assert(!dumped.includes('DO_NOT_LEAK'),'Do not expose contact or notes on insights API');
 assert.equal(d.visitorCount,undefined);assert.equal(d.periodDays,30);
 assert(calls.some(x=>x.q.includes('created_at AT TIME ZONE')&&x.params.includes(30)));
 assert(calls.every(x=>!/(INSERT|DELETE|UPDATE |exam_students|exam_paid_access|exam_attempts|yk_growth_manual_entries)/i.test(x.q)),
  'Insights endpoint must be read-only and isolated from YKCR/exam/payment/marketing ledger');
 r=await handler(new Request(url+'?days=all'));assert.equal(r.status,200);assert.equal((await r.json()).periodDays,null);
 globalThis.__yk817Admin=false;r=await handler(new Request(url+'?days=7'));assert.equal(r.status,403);
 console.log('PASS v78717-api.mock: read-only admin permissions, period guard, aggregation, no PII contact leak');
}finally{delete globalThis.__yk817DB;delete globalThis.__yk817Admin;rmSync(root,{recursive:true,force:true})}
