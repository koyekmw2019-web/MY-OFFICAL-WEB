import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { registerHooks } from 'node:module';
import { pool,asUser } from './adapter.mjs';
const adapter=new URL('./adapter.mjs',import.meta.url).href;
registerHooks({resolve(specifier,ctx,next){if(['@netlify/database','@netlify/identity'].includes(specifier))return {url:adapter,shortCircuit:true};return next(specifier,ctx);}});
const root=new URL('../../',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('./source_blobs.json',import.meta.url),'utf8'));
assert.equal(Object.keys(manifest).length,27);
for(const [path,expected] of Object.entries(manifest)){const b=readFileSync(new URL(path,root));assert.equal(createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),expected,path);}
console.log('SOURCE BLOBS VERIFIED: 27/27');
const fn=async name=>(await import(new URL('netlify/functions/'+name+'.mts',root).href)).default;
const verify=await fn('exam-student-verify'),importCsv=await fn('exam-admin-import-students'),status=await fn('exam-status'),access=await fn('exam-access');
const {hashVerificationCode}=await import(new URL('netlify/functions/_shared/security.mts',root).href);
const query=(s,p=[])=>pool.query(s,p), one=async(s,p=[]) => (await query(s,p)).rows[0];
const member=(id,roles=[])=>({id:'synthetic-'+id,email:'synthetic-'+id+'@example.invalid',roles});
const admin=member('admin',['admin']);const code='SYNTHETIC-QA-CODE';
const post=(name,body)=>new Request('http://fixture.invalid/'+name,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const invoke=(handler,user,req,options)=>asUser(user,()=>handler(req),options);
const link=(u,id,options,pass=code)=>invoke(verify,u,post('verify',{studentCode:id,verificationCode:pass}),options);
const stat=(u,options)=>invoke(status,u,new Request('http://fixture.invalid/status'),options);
const start=(u,type='truck',options)=>invoke(access,u,post('access',{examType:type}),options);
const csv=(s)=>{const form=new FormData();form.append('file',new File([s],'synthetic.csv',{type:'text/csv'}));return new Request('http://fixture.invalid/import',{method:'POST',body:form});};
const header='student_code,name,class_name,class_start,expire_date,verification_code\r\n';
const row=(id,name='Synthetic Student',start='2026-11-01',end='2026-12-31')=>[id,name,'TRUCK',start,end,code].join(',')+'\r\n';
const imp=(s,options,user=admin)=>invoke(importCsv,user,csv(s),options);
const seed=async(id,{user=null,start='2026-11-01',end='2026-12-31',state='active'}={})=>one('INSERT INTO exam_students(student_code,name,class_name,class_start,expire_date,verification_code_hash,linked_user_id,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',[id,'Synthetic Student','TRUCK',start,end,hashVerificationCode(code),user?.id??null,state]);
const record=id=>one('SELECT * FROM exam_students WHERE student_code=$1',[id]);
const exists=async id=>Boolean(await record(id));
const data=async(r,expected=200)=>{assert.equal(r.status,expected);return r.json();};
function barrier(n){let arrived=0,resolve;const ready=new Promise(r=>resolve=r);return async()=>{if(++arrived===n)resolve();let timer;try{await Promise.race([ready,new Promise((_,rej)=>timer=setTimeout(()=>rej(Error('barrier timeout')),5000))]);}finally{clearTimeout(timer);}};}
const at='2026-11-26T14:59:59Z',midnight='2026-11-26T15:00:00Z';
before(async()=>{
 assert.equal(process.env.YKOC_FIX06B_DISPOSABLE_SQL_APPROVED,'yes','Explicit disposable SQL approval required');
 const server=await one('SELECT current_database() db,current_user AS usr,version() v,current_setting(\'TimeZone\') tz');
 assert.equal(server.db,'ykoc_fixture');assert.equal(server.usr,'ykoc_fixture');assert.match(server.v,/PostgreSQL 16\./);assert.equal(server.tz,'UTC');
 assert.equal((await one("SELECT to_regclass('public.exam_students') AS t")).t,null,'Refusing non-empty database');
 console.log('Real DB:',server.v,'Timezone:',server.tz);
 const folder=new URL('netlify/database/migrations/',root);
 const names=readdirSync(folder).filter(n=>n.endsWith('.sql')).sort();assert.equal(names.length,14);
 for(const name of names){await query(readFileSync(new URL(name,folder),'utf8'));console.log('EXISTING MIGRATION OK:',name);}
 assert.equal((await one("SELECT to_regclass('public.exam_student_verification_failures') AS t")).t,null);
 await query(readFileSync(new URL('qa/fix06b/20261126_student_verification_failures.sql.candidate',root),'utf8'));
 console.log('FIX06B CANDIDATE APPLIED IN DISPOSABLE CI ONLY');
});
after(async()=>{await pool.end();});
test('01 valid link, same account reverify, wrong account rejected, no credential leak',async()=>{
 await seed('QA-LINK');const a=member('link-a'),b=member('link-b');const first=await data(await link(a,'QA-LINK'));assert.equal(first.student.studentCode,'QA-LINK');assert.ok(!JSON.stringify(first).includes(code));assert.equal((await link(a,'QA-LINK')).status,200);assert.equal((await link(b,'QA-LINK')).status,409);assert.equal((await record('QA-LINK')).linked_user_id,a.id);
});
test('02 real concurrent linking: both reads see unlinked, only one UPDATE wins (8 repetitions)',async()=>{
 for(let i=0;i<8;i++){const id='QA-RACE-'+i;await seed(id);const wait=barrier(2);const a=member('race-a-'+i),b=member('race-b-'+i);const afterRead=async rows=>{assert.equal(rows[0].linked_user_id,null);await wait();};const results=await Promise.all([link(a,id,{afterRead}),link(b,id,{afterRead})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal((await record(id)).linked_user_id,results[0].status===200?a.id:b.id);}
});
test('03 same account concurrent linking to two records: real unique constraint maps to 409',async()=>{
 await seed('QA-TWO-A');await seed('QA-TWO-B');const u=member('two');const ready=barrier(2);const r=await Promise.all(['QA-TWO-A','QA-TWO-B'].map(async id=>{await ready();return link(u,id);}));assert.deepEqual(r.map(x=>x.status).sort(),[200,409]);assert.equal((await one('SELECT COUNT(*)::int n FROM exam_students WHERE linked_user_id=$1',[u.id])).n,1);
});
test('04 database UNIQUE student_code and linked_user_id constraints present',async()=>{
 const r=await query("SELECT conname FROM pg_constraint WHERE conrelid='exam_students'::regclass AND contype='u'");assert.ok(r.rows.some(x=>x.conname==='exam_students_student_code_key'));assert.ok(r.rows.some(x=>x.conname==='exam_students_linked_user_id_key'));
 await assert.rejects(seed('QA-LINK'),e=>e.code==='23505'&&e.constraint==='exam_students_student_code_key');
});
test('05 ownership guard also rechecks credential and inactive state after read',async()=>{
 for(const change of ['code','status']){const id='QA-CHANGED-'+change;await seed(id);const r=await link(member(change),id,{afterRead:async()=>{if(change==='code')await query('UPDATE exam_students SET verification_code_hash=$1 WHERE student_code=$2',[hashVerificationCode('new synthetic code'),id]);else await query("UPDATE exam_students SET status='inactive' WHERE student_code=$1",[id]);}});assert.equal(r.status,409);assert.equal((await record(id)).linked_user_id,null);}
});
test('06 wrong/missing ID, wrong code, inactive, unauthorized do not link',async()=>{
 await seed('QA-BAD');await seed('QA-INACTIVE',{state:'inactive'});const u=member('bad');assert.equal((await link(u,'QA-BAD',{},'wrong')).status,403);assert.equal((await link(u,'QA-NOT-FOUND')).status,403);assert.equal((await link(u,'')).status,400);assert.equal((await link(u,'QA-INACTIVE')).status,403);assert.equal((await link(null,'QA-BAD')).status,401);assert.equal((await record('QA-BAD')).linked_user_id,null);
});
test('07 real CSV parser: BOM, quoted comma, escaped quote, CRLF, Unicode',async()=>{
 const r=await data(await imp('\ufeff'+header+row('QA-CSV','"Synthetic, ""テスト"""')));assert.equal(r.imported,1);assert.equal((await record('QA-CSV')).name,'Synthetic, "テスト"');assert.ok((await record('QA-CSV')).verification_code_hash!==code);
});
test('08 duplicate existing ID preserves name/hash/linked account/timestamps',async()=>{
 const prior=await record('QA-LINK');const r=await data(await imp(header+row('QA-LINK','Replacement')));assert.equal(r.imported,0);assert.equal(r.skipped,1);assert.deepEqual(r.credentials,[]);assert.deepEqual(await record('QA-LINK'),prior);
});
test('09 repeated explicit CSV ID skips both, unique row imported',async()=>{
 const r=await data(await imp(header+row('QA-DUP','First')+row('QA-DUP','Second')+row('QA-UNIQUE')));assert.equal(r.skipped,2);assert.equal(r.imported,1);assert.equal(await exists('QA-DUP'),false);assert.equal(await exists('QA-UNIQUE'),true);
});
test('10 simultaneous CSV imports of one new ID: one insert, one skip',async()=>{
 const r=await Promise.all([imp(header+row('QA-IMPORT-RACE','First')),imp(header+row('QA-IMPORT-RACE','Second'))]);const x=await Promise.all(r.map(y=>data(y)));assert.deepEqual(x.map(y=>y.imported).sort(),[0,1]);assert.deepEqual(x.map(y=>y.skipped).sort(),[0,1]);assert.equal((await one("SELECT COUNT(*)::int n FROM exam_students WHERE student_code='QA-IMPORT-RACE'")).n,1);
});
test('11 transaction rollback on actual second-row PostgreSQL constraint error',async()=>{
 const rollbackEvidence={};const r=await imp(header+row('QA-ROLLBACK-FIRST')+row('QA-ROLLBACK-SECOND'),{injectSecondInsertFailure:true,firstId:'QA-ROLLBACK-FIRST',rollbackEvidence});assert.equal(r.status,500);assert.equal(rollbackEvidence.code,'23502');assert.equal(await exists('QA-ROLLBACK-FIRST'),false);assert.equal(await exists('QA-ROLLBACK-SECOND'),false);
});
test('12 invalid dates, reversed dates and malformed CSV leave no partial insert',async()=>{
 for(const [i,bad] of ['2026-02-30','2026-13-01','2027-01-01'].entries()){const id='QA-INVALID-FIRST-'+i;assert.equal((await imp(header+row(id)+row('QA-INVALID-'+i,'Invalid',bad))).status,400);assert.equal(await exists(id),false);}
 assert.equal((await imp(header+'"unclosed')).status,400);
});
test('13 leap day valid, empty CSV rejected, non-admin denied before import',async()=>{
 assert.equal((await imp(header)).status,400);assert.equal((await imp(header+row('QA-NONADMIN'),{},member('not-admin',['admin',null]))).status,403);assert.equal(await exists('QA-NONADMIN'),false);assert.equal((await imp(header+row('QA-LEAP','Leap','2028-02-29','2028-02-29'))).status,200);
});
test('14 real PostgreSQL timezone arithmetic across JST midnight while DB timezone UTC',async()=>{
 const r=await one("SELECT ($1::timestamptz AT TIME ZONE 'Asia/Tokyo')::date::text a,($2::timestamptz AT TIME ZONE 'Asia/Tokyo')::date::text b",[at,midnight]);assert.deepEqual(r,{a:'2026-11-26',b:'2026-11-27'});
});
test('15 status handler: start/expiry inclusive, midnight transition, inactive',async()=>{
 const u=member('date');await seed('QA-DATE',{user:u,start:'2026-11-26',end:'2026-11-26'});
 for(const [clock,state,eligible] of [['2026-11-25T14:59:59Z','scheduled',false],['2026-11-25T15:00:00Z','active',true],[at,'active',true],[midnight,'expired',false]]){const x=await data(await stat(u,{clock}));assert.equal(x.linkedStudent.access_state,state);assert.equal(Boolean(x.student),eligible);}
 await query("UPDATE exam_students SET status='inactive' WHERE student_code='QA-DATE'");assert.equal((await data(await stat(u,{clock:at}))).linkedStudent.access_state,'inactive');
});
test('16 native current timestamp path, no clock substitution',async()=>{
 const u=member('native');const today=(await one("SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo')::date::text AS d")).d;await seed('QA-NATIVE',{user:u,start:today,end:today});assert.ok((await data(await stat(u))).student);const r=await data(await start(u));assert.equal(r.mode,'student');assert.equal(r.resumed,false);
});
test('17 active student starts; after midnight resumes same attempt, no reset; new type free',async()=>{
 const u=member('resume');await seed('QA-RESUME',{user:u,start:'2026-11-26',end:'2026-11-26'});
 const a=await one("INSERT INTO exam_attempts(user_id,exam_type,access_mode,started_at) VALUES($1,'truck','student',$2) RETURNING id,started_at",[u.id,'2026-11-26T14:55:00Z']);
 const first=await data(await start(u,'truck',{clock:at}));assert.equal(String(first.attemptId),a.id);assert.equal(first.resumed,true);
 const r=await data(await start(u,'truck',{clock:midnight}));assert.equal(r.mode,'student');assert.equal(String(r.attemptId),a.id);assert.equal(r.resumed,true);assert.deepEqual((await one('SELECT started_at FROM exam_attempts WHERE id=$1',[a.id])).started_at,a.started_at);
 const next=await data(await start(u,'taxi',{clock:midnight}));assert.equal(next.mode,'free');assert.equal(next.resumed,false);
});
test('18 checkpoint resume deadline/version preserved, expired beyond grace abandoned',async()=>{
 const u=member('checkpoint');await seed('QA-CHECKPOINT',{user:u,start:'2026-11-26',end:'2026-11-26'});const a=await one("INSERT INTO exam_attempts(user_id,exam_type,access_mode,started_at) VALUES($1,'truck','student',$2) RETURNING id",[u.id,'2026-11-26T14:00:00Z']);
 await query("INSERT INTO exam_attempt_checkpoints(attempt_id,user_id,exam_type,ends_at,version,snapshot,saved_at) VALUES($1,$2,'truck',$3,3,'{}',$4)",[a.id,u.id,'2026-11-26T15:20:00Z','2026-11-26T14:59:00Z']);
 const before=await one('SELECT * FROM exam_attempt_checkpoints WHERE attempt_id=$1',[a.id]);const r=await data(await start(u,'truck',{clock:midnight}));assert.equal(r.resumed,true);assert.equal(String(r.attemptId),a.id);assert.deepEqual(await one('SELECT * FROM exam_attempt_checkpoints WHERE attempt_id=$1',[a.id]),before);
 const other=await start(u,'bus',{clock:midnight});assert.equal(other.status,409);
 const later=await data(await start(u,'truck',{clock:'2026-11-26T15:21:01Z'}));assert.equal(later.mode,'free');assert.equal(later.resumed,false);assert.equal((await one('SELECT status FROM exam_attempts WHERE id=$1',[a.id])).status,'abandoned');
});
test('19 strict roles and per-exam free quota remain enforced by real DB',async()=>{
 const u=member('quota',['admin',null]);const a=await data(await start(u,'truck'));assert.equal(a.mode,'free');await query("UPDATE exam_attempts SET status='submitted' WHERE id=$1",[a.attemptId]);assert.equal((await start(u,'truck')).status,402);assert.equal((await data(await start(u,'taxi'))).mode,'free');
});
test('20 payment/YKCR fixture tables remain empty',async()=>{
 for(const table of ['exam_payment_requests','exam_paid_access','ykcr_sync_events'])assert.equal((await one('SELECT COUNT(*)::int n FROM '+table)).n,0,table);
});

import { registerRateTests } from './fix06b-cases.mjs';
registerRateTests({pool,query,one,member,seed,record,link,verify,invoke,post,code});
