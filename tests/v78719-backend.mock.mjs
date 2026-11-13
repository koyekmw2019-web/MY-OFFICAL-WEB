/** v7.87.19: isolated backend behavior tests with mock Identity, Neon SQL,
 * Netlify Blobs and email provider. NO live payments/accounts are touched. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

let pass=0;
async function check(name,fn) { await fn(); console.log('PASS '+name); pass++; }
const globalUser = () => globalThis.__ykUser;
const globals=`
const getDatabase=()=>globalThis.__ykDb;
const getStore=()=>globalThis.__ykStore;
const randomUUID=()=> 'deterministic-test-uuid';
const requireUser=async()=>{if(!globalThis.__ykUser)throw new Response('Unauthorized',{status:401});return globalThis.__ykUser;};
const requireAdmin=async()=>{const u=await requireUser();if(!Array.isArray(u.roles)||!u.roles.includes('admin'))throw new Response('Forbidden',{status:403});return u;};
const asResponse=(e)=>e instanceof Response?e:Response.json({error:String(e?.message??e)},{status:500});
const PLAN_PRICE={week:1000,month:2000,'3months':3000,year:5000};
const env=name=>globalThis.__ykEnv?.[name];
const sendAdminPaymentEmail=async (...args)=>globalThis.__ykSendEmail(...args);
const verifyCode=(input,hash)=>globalThis.__ykVerify(input,hash);
`;
let serial=0;
async function mockModule(sourcePath){
  const p=resolve(sourcePath),tmp=p.replace(/\.mts$/,`.v78719mock${serial++}.mts`);
  const source=readFileSync(p,'utf8');
  const stripped=source.replace(/^import\s+.*?;\s*$/gm,'');
  assert(!/^import /m.test(stripped),'Unexpected new multi-line import: '+sourcePath);
  writeFileSync(tmp,globals+'\n'+stripped);
  try {return (await import(pathToFileURL(tmp).href+'?mock='+serial)).default;}
  finally {unlinkSync(tmp);}
}
const postJson=(body)=>new Request('https://example.test/.netlify/functions/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const postForm=(values)=>{const f=new FormData();for(const [k,v] of Object.entries(values))f.append(k,v);return new Request('https://example.test/.netlify/functions/pay',{method:'POST',body:f});};
const receipt=()=>new File([new Uint8Array([0xff,0xd8,0xff,0xd9])],'receipt.jpg',{type:'image/jpeg'});

// Test the REAL shared role guard with its only external dependency stubbed.
{
 const original=readFileSync('netlify/functions/_shared/auth.mts','utf8');
 const file=resolve('netlify/functions/_shared/.v78719_auth_mock.mts');
 writeFileSync(file,original.replace('import { getUser } from "@netlify/identity";','const getUser=async()=>globalThis.__ykUser;'));
 try{
  const auth=await import(pathToFileURL(file).href);
  await check('No user -> 401',async()=>{globalThis.__ykUser=null;await assert.rejects(auth.requireAdmin(),e=>e.status===401);});
  await check('Absent roles -> 403, not 500',async()=>{globalThis.__ykUser={id:'guest'};await assert.rejects(auth.requireAdmin(),e=>e.status===403);});
  await check('Malformed roles -> 403',async()=>{globalThis.__ykUser={id:'guest',roles:'admin'};await assert.rejects(auth.requireAdmin(),e=>e.status===403);});
  await check('Real admin allowed',async()=>{globalThis.__ykUser={id:'admin',roles:['admin']};assert.equal((await auth.requireAdmin()).id,'admin');});
 }finally{unlinkSync(file)}
}

const verify=await mockModule('netlify/functions/exam-student-verify.mts');
const baseStudent={id:21,student_code:'YK-100',verification_code_hash:'hashed',status:'active',linked_user_id:null};
function verificationDb(record=baseStudent,mode='claim'){
 const queries=[];
 return {queries,sql:async(ss,...args)=>{const q=ss.join('?');queries.push({q,args});
  if(q.includes('SELECT * FROM exam_students'))return record?[record]:[];
  if(q.includes('UPDATE exam_students')){
   if(mode==='race')return [];
   return [{student_code:'YK-100',name:'Sample Student',class_name:'TRUCK',class_start:'2026-01-01',expire_date:'2026-12-31'}];
  }
  throw Error('Unmocked SQL '+q);
 }};
}
await check('Student verify: missing/invalid JSON -> 400',async()=>{
 globalThis.__ykUser={id:'A',roles:[]};globalThis.__ykVerify=()=>true;
 const r=await verify(postJson({studentCode:'YK-100'}));assert.equal(r.status,400);
});
await check('Student verify: wrong code -> 403; no UPDATE',async()=>{
 globalThis.__ykVerify=()=>false;const db=verificationDb();globalThis.__ykDb=db;
 const r=await verify(postJson({studentCode:'YK-100',verificationCode:'bad'}));assert.equal(r.status,403);
 assert.equal(db.queries.filter(x=>x.q.includes('UPDATE')).length,0);
});
await check('Student verify: already linked to another account -> 409',async()=>{
 globalThis.__ykVerify=()=>true;const db=verificationDb({...baseStudent,linked_user_id:'OTHER'});globalThis.__ykDb=db;
 const r=await verify(postJson({studentCode:'YK-100',verificationCode:'valid'}));assert.equal(r.status,409);
});
await check('Student verify: concurrent takeover is blocked by guarded UPDATE',async()=>{
 globalThis.__ykVerify=()=>true;const db=verificationDb(baseStudent,'race');globalThis.__ykDb=db;
 const r=await verify(postJson({studentCode:'YK-100',verificationCode:'valid'}));assert.equal(r.status,409);
 const u=db.queries.find(x=>x.q.includes('UPDATE exam_students'));
 assert(u&&u.q.includes('linked_user_id IS NULL OR linked_user_id='));
 assert(u.q.includes('verification_code_hash='));assert(u.q.includes('student_code='));assert(u.q.includes("COALESCE(status,'active')"));
});
await check('Student verify: valid claim -> 200, response no-store',async()=>{
 globalThis.__ykVerify=()=>true;globalThis.__ykDb=verificationDb();
 const r=await verify(postJson({studentCode:'YK-100',verificationCode:'valid'}));assert.equal(r.status,200);
 assert.equal((await r.json()).student.studentCode,'YK-100');assert.equal(r.headers.get('Cache-Control'),'no-store');
});

const pay=await mockModule('netlify/functions/exam-payment-submit.mts');
let stored=0,inserted=0,emailed=0;
globalThis.__ykUser={id:'account-1',email:'test@example.test',roles:[]};
globalThis.__ykEnv={EXAM_BANK_ACCOUNTS_JSON:JSON.stringify([{bank:'BANK_A'}])};
globalThis.__ykStore={set:async()=>{stored++;}};
globalThis.__ykDb={sql:async(s,...args)=>{inserted++;return [{id:55,submitted_at:'2026-11-13T00:00:00Z'}]}};
await check('Payment: prototype plan is rejected before storage',async()=>{
 const r=await pay(postForm({plan:'toString',name:'Payer',bank:'BANK_A',receipt:receipt()}));
 assert.equal(r.status,400);assert.equal(stored,0);assert.equal(inserted,0);
});
await check('Payment: bad bank choice rejected before storage',async()=>{
 const r=await pay(postForm({plan:'week',name:'Payer',bank:'UNKNOWN',receipt:receipt()}));
 assert.equal(r.status,400);assert.equal(stored,0);
});
await check('Payment: email outage AFTER DB insert returns success pending',async()=>{
 globalThis.__ykSendEmail=async()=>{emailed++;throw Error('Resend unavailable')};
 const before=inserted;const r=await pay(postForm({plan:'week',name:'Payer',bank:'BANK_A',transferDate:'2026-11-13',receipt:receipt()}));
 assert.equal(r.status,200);const j=await r.json();assert.equal(j.ok,true);assert.equal(j.paymentId,55);
 assert.equal(j.status,'pending');assert.equal(j.adminEmailNotification.sent,false);
 assert.equal(inserted,before+1);assert.equal(r.headers.get('Cache-Control'),'no-store');
});
await check('Payment: healthy email and valid plan -> success pending',async()=>{
 globalThis.__ykSendEmail=async()=>({sent:true});
 const r=await pay(postForm({plan:'3months',name:'Payer',bank:'BANK_A',receipt:receipt()}));
 assert.equal(r.status,200);assert.equal((await r.json()).adminEmailNotification.sent,true);
});
await check('Payment: invalid bank JSON -> failure before storage',async()=>{
 globalThis.__ykEnv.EXAM_BANK_ACCOUNTS_JSON='{"not":"array"}';const before=stored;
 const r=await pay(postForm({plan:'week',name:'Payer',bank:'BANK_A',receipt:receipt()}));assert.equal(r.status,500);assert.equal(stored,before);
 globalThis.__ykEnv.EXAM_BANK_ACCOUNTS_JSON=JSON.stringify([{bank:'BANK_A'}]);
});

const status=await mockModule('netlify/functions/exam-status.mts');
await check('Exam status: authenticated response is private, no-store; per exam type',async()=>{
 globalThis.__ykDb={sql:async(ss,...args)=>{const q=ss.join('?');return q.includes("access_mode='free'")?[{id:3,exam_type:'jlpt_n3'},{id:4,exam_type:'taxi'}]:[];}};
 const r=await status(new Request('https://example.test/.netlify/functions/exam-status',{method:'GET'}));
 assert.equal(r.status,200);assert.equal(r.headers.get('Cache-Control'),'private, no-store');
 assert.deepEqual((await r.json()).freeUsedTypes,['jlpt_n3','taxi']);
});

const health=await mockModule('netlify/functions/yk-system-health.mts');
await check('Health: non-admin forbidden',async()=>{
 globalThis.__ykUser={id:'member',roles:[]};
 const r=await health(new Request('https://example.test/.netlify/functions/yk-system-health'));assert.equal(r.status,403);
});
await check('Health: full schema/config, no secrets in output',async()=>{
 globalThis.__ykUser={id:'admin',roles:['admin']};
 globalThis.__ykEnv={ADMIN_EMAIL:'admin@example.test',RESEND_API_KEY:'secret-api',RESEND_FROM_EMAIL:'no-reply@example.test',YKCR_SYNC_SECRET:'secret-sync',EXAM_BANK_ACCOUNTS_JSON:JSON.stringify([{bank:'BANK_A',accountNumber:'do-not-expose'}])};
 globalThis.__ykDb={sql:async(ss,...args)=>[{exists:true,absent:true}]};
 const r=await health(new Request('https://example.test/.netlify/functions/yk-system-health'));assert.equal(r.status,200);
 const raw=await r.text(),j=JSON.parse(raw);assert.equal(j.schemaReady,true);assert.equal(j.configurationReady,true);
 for(const secret of ['secret-api','secret-sync','do-not-expose'])assert(!raw.includes(secret));
});
await check('Health: missing table yields 503 without writing DB',async()=>{
 let queries=0;globalThis.__ykDb={sql:async(ss,...args)=>{queries++;return [{exists:!String(args[0]).includes('yk_enrollment_leads'),absent:true}]}};
 const r=await health(new Request('https://example.test/.netlify/functions/yk-system-health'));assert.equal(r.status,503);assert.equal((await r.json()).schemaReady,false);assert(queries>=10);
});

console.log(`PASS v78719-backend mock tests (${pass}) — no live Netlify calls, no real student or payment mutations`);
