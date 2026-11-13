/** v7.87.8 admin-only endpoint runtime, using local mock DB/auth. No Netlify calls. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=mkdtempSync(join(tmpdir(),'yk878-crm-'));
try{
 const fn=join(root,'netlify/functions'),shared=join(fn,'_shared'),pkg=join(root,'node_modules/@netlify/database');
 mkdirSync(shared,{recursive:true});mkdirSync(pkg,{recursive:true});
 writeFileSync(join(root,'package.json'),'{'+'"type":"module"}');
 writeFileSync(join(pkg,'package.json'),'{'+'"name":"@netlify/database","type":"module","exports":"./index.js"}');
 writeFileSync(join(pkg,'index.js'),'export const getDatabase=()=>globalThis.__yk878DB;');
 writeFileSync(join(shared,'auth.mts'),`export const requireAdmin=async()=>{if(!globalThis.__yk878Admin)throw new Response('Forbidden',{status:403})};export const asResponse=e=>e instanceof Response?e:Response.json({error:'Unknown error'},{status:500});`);
 for(const n of ['yk-enrollment-crm.mts'])copyFileSync('netlify/functions/'+n,join(fn,n));
 copyFileSync('netlify/functions/_shared/yk-crm-validation-v7878.mjs',join(shared,'yk-crm-validation-v7878.mjs'));
 const handle=(await import(pathToFileURL(join(fn,'yk-enrollment-crm.mts')).href)).default;
 const calls=[];
 globalThis.__yk878DB={sql:async(strings,...params)=>{
  const q=strings.join('?');calls.push({q,params});
  if(q.includes('SELECT id,prospect_name,contact_channel'))return [{id:7,prospect_name:'Sample Prospect',contact_channel:'messenger',contact_reference:'sample-account',course:'truck',lead_source:'facebook',status:'interested',followup_date:null,notes:'',student_code:null,created_at:'2026-11-12',updated_at:'2026-11-12'}];
  if(q.includes('SELECT status,COUNT(*)'))return [{status:'interested',n:1,due:0}];
  if(q.includes('INSERT INTO yk_enrollment_leads'))return [{id:77}];
  if(q.includes('UPDATE yk_enrollment_leads'))return [{id:77}];
  if(q.includes('DELETE FROM yk_enrollment_leads'))return [{id:77}];
  throw Error('Unexpected SQL '+q.slice(0,70));
 }};
 const host='https://yekun-mryethemenstyle.netlify.app',url=host+'/.netlify/functions/yk-enrollment-crm';
 const h={'Origin':host,'Content-Type':'application/json'};
 const body={name:'Demo',contact:'messenger-name',channel:'messenger',course:'truck',source:'facebook',status:'new',notes:'',followUpDate:null,studentCode:null};
 const req=(method,data,headers=h)=>new Request(url,{method,headers,body:JSON.stringify(data)});
 globalThis.__yk878Admin=false;
 let r=await handle(new Request(url));assert.equal(r.status,403);assert.equal(calls.length,0,'Must reject before DB access');
 r=await handle(req('POST',body));assert.equal(r.status,403);
 globalThis.__yk878Admin=true;
 r=await handle(new Request(url));assert.equal(r.status,200);let data=await r.json();
 assert.equal(data.leads.length,1);assert.equal(data.summary.counts.interested,1);assert.equal(data.listScope,'latest_100_modified');
 assert.equal(r.headers.get('Cache-Control'),'private, no-store');
 r=await handle(req('POST',body,{'Origin':'https://evil.example','Content-Type':'application/json'}));assert.equal(r.status,403);
 r=await handle(req('POST',{...body,course:'admin'}));assert.equal(r.status,400);
 r=await handle(req('POST',{...body,notes:'A'.repeat(1001)}));assert.equal(r.status,400);
 r=await handle(req('POST',body));assert.equal(r.status,201);assert.equal((await r.json()).id,77);
 r=await handle(req('PUT',{...body,id:77,status:'enrolled',studentCode:'YKCR_test_42'}));assert.equal(r.status,200);
 r=await handle(req('DELETE',{id:77}));assert.equal(r.status,200);
 r=await handle(req('DELETE',{id:0}));assert.equal(r.status,400);
 assert(calls.some(x=>x.q.includes('INSERT INTO yk_enrollment_leads')));
 assert(calls.some(x=>x.q.includes('UPDATE yk_enrollment_leads')));
 assert(!calls.some(x=>/exam_students|exam_attempts|exam_payment_requests|yk_growth_manual_entries/i.test(x.q)),
  'CRM must not mutate student, exam, payment, or marketing ledger tables');
 console.log('PASS v7878-crm-api.mock: admin auth, origin guard, input checks, CRUD, no YKCR/payment/Exam mutation');
}finally{delete globalThis.__yk878DB;delete globalThis.__yk878Admin;rmSync(root,{recursive:true,force:true})}
