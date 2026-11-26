// FIX06-A synthetic regression harness. Executes actual handler/helper source.
// Database/Identity/CSV parser are deterministic in-memory mocks; no network or SQL server.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../netlify/functions/'+p,import.meta.url),'utf8');
const strip=p=>stripTypeScriptTypes(read(p),{mode:'strip'}).replace(/^import .*;$/gm,'');
const helpers=['admin-role','auth','student-validation','security','exam-autosave'].map(n=>strip('_shared/'+n+'.mts').replace(/^export /gm,'')).join('\n');
const rateHelpers=['student-rate-policy','student-rate-postgres','student-verification-handler'].map(n=>read('_shared/'+n+'.mjs').replace(/^import .*;$/gm,'').replace(/^export /gm,'')).join('\n');
const names=['exam-student-verify','exam-admin-import-students','exam-access','exam-status','exam-admin-overview','exam-admin-analytics'];
const handlers=names.map((n,i)=>`const h${i}=(()=>{${strip(n+'.mts').replace('export default async','return async')}\n})();`).join('\n');
const source=helpers+'\n'+rateHelpers+'\n'+handlers+'\nglobalThis.api={h0,h1,h2,h3,h4,h5,studentDate,studentDateRange,hasAdminRole,hashVerificationCode,verifyCode,requireAdmin,sectionDurations};';
const als=new AsyncLocalStorage();
const A={id:'A',email:'a@example.invalid',roles:[]},B={id:'B',roles:[]},ADMIN={id:'ADMIN',roles:['admin']};
const fixtureTime='2026-11-26T03:00:00Z';
const code='synthetic-only';
const fakeHash=()=>{const salt='00112233445566778899aabbccddeeff';return salt+':'+createHash('sha256').update(salt+':'+code).digest('hex')};
const row=(over={})=>({id:1,student_code:'QA-X',name:'Synthetic',class_name:'TRUCK',class_start:'2026-11-01',expire_date:'2026-12-31',status:'active',linked_user_id:null,linked_email:null,verification_code_hash:fakeHash(),...over});
const csvRow=(over={})=>({student_code:'QA-X',name:'Synthetic',class_name:'TRUCK',class_start:'2026-11-01',expire_date:'2026-12-31',...over});
const body=(verificationCode=code,studentCode='QA-X')=>({studentCode,verificationCode});
const jst=ms=>new Date(ms+9*3600000).toISOString().slice(0,10);
const eligible=(r,id,ms)=>r.linked_user_id===id&&r.status==='active'&&r.class_start<=jst(ms)&&jst(ms)<=r.expire_date;
const modeBody=async(r,mode,resumed=false)=>{assert.equal(r.status,200);const b=await r.json();assert.equal(b.mode,mode);assert.equal(b.resumed,resumed);return b};
function fixture(opts={}){
 let records=structuredClone(opts.rows??[]),attempts=structuredClone(opts.attempts??[]),clock=Date.parse(opts.now??fixtureTime),csv=opts.csv??[];
 const calls=[],txCalls=[];let dbCalls=0,selects=0,releaseBarrier,staged=null,insertCount=0,lookupCount=0;
 const barrier=new Promise(r=>releaseBarrier=r);
 const fail=(constraint)=>Object.assign(Error('synthetic DB error'),{code:'23505',constraint});
 const state=(r)=>r.status!=='active'?'inactive':jst(clock)<r.class_start?'scheduled':jst(clock)>r.expire_date?'expired':'active';
 const active=(id)=>records.filter(r=>eligible(r,id,clock));
 const deadline=a=>a.ends_at?Date.parse(a.ends_at):Date.parse(a.started_at)+(api.sectionDurations[a.exam_type]?.[0]??80)*60000;
 const rateEvents=[];
 const db={sql:async(parts,...p)=>{
  const q=parts.join('?').replace(/\s+/g,' ').trim();calls.push({q,p});
  if(q.startsWith('SELECT id,student_code,status,verification_code_hash,linked_user_id FROM exam_students')){
   const rows=records.filter(x=>x.student_code===p[0]).map(x=>({...x}));lookupCount++;
   if(opts.race&&++selects<=2){if(selects===2)releaseBarrier();await barrier;}
   if(opts.onRead)opts.onRead(records);
   return rows;
  }
  if(q.startsWith('UPDATE exam_students SET linked_user_id')){
   assert.match(q,/WHERE id=\? AND \(linked_user_id IS NULL OR linked_user_id=\?\) AND status='active' AND verification_code_hash=\? RETURNING/);
   const [u,email,id,sameOwner,hash]=p;assert.equal(u,sameOwner);
   if(opts.verifyDbError)throw Error('private DB error should never be disclosed');
   const r=records.find(x=>x.id===id&&(x.linked_user_id===null||x.linked_user_id===u)&&x.status==='active'&&x.verification_code_hash===hash);
   if(!r)return [];
   if(records.some(x=>x.id!==id&&x.linked_user_id===u))throw fail('exam_students_linked_user_id_key');
   r.linked_user_id=u;r.linked_email=email;return [{...r}];
  }
  if(q.startsWith('UPDATE exam_attempts AS a SET status=')){
   if(opts.missingCheckpoint)throw Object.assign(Error('exam_attempt_checkpoints missing'),{code:'42P01'});
   const out=[];for(const a of attempts)if(a.user_id===p[0]&&a.status==='started'&&clock>deadline(a)+60000){a.status='abandoned';out.push({id:a.id});}
   if(opts.advanceAfterCleanup)clock+=opts.advanceAfterCleanup;
   return out;
  }
  if(q.startsWith('SELECT a.id,a.exam_type,a.access_mode,c.saved_at')){
   assert.match(q,/a.user_id=\?/);assert.match(q,/a.access_mode<>'admin' OR \?/);assert.match(q,/NOW\(\) <= COALESCE\(c.ends_at/);assert.match(q,/INTERVAL '60 seconds'/);
   const [uid,type,admin]=p;
   return attempts.filter(a=>a.user_id===uid&&a.status==='started'&&(a.saved_at||a.access_mode==='free'||(a.access_mode==='student'&&a.exam_type===type))&&(a.access_mode!=='admin'||admin)&&clock<=deadline(a)+60000).sort((a,b)=>Number(!!b.saved_at)-Number(!!a.saved_at)||Date.parse(b.started_at)-Date.parse(a.started_at)).slice(0,1).map(a=>({...a}));
  }
  if(q.startsWith('SELECT id,exam_type,access_mode,NULL::timestamptz'))return attempts.filter(a=>a.user_id===p[0]&&a.status==='started'&&a.access_mode==='free').slice(0,1);
  if(q.startsWith("UPDATE exam_attempts SET status='abandoned'")){const a=attempts.find(a=>a.id===p[0]&&a.user_id===p[1]);if(a&&clock>deadline(a)+60000){a.status='abandoned';return [{id:a.id}];}return [];}
  if(q.startsWith('SELECT 1 FROM exam_students')){assert.match(q,/\(CURRENT_TIMESTAMP AT TIME ZONE 'Asia\/Tokyo'\)::date BETWEEN class_start AND expire_date/);const r=active(p[0]);if(opts.advanceAfterEligibility)clock+=opts.advanceAfterEligibility;return r;}
  if(q.startsWith('SELECT 1 FROM exam_paid_access'))return opts.paid?[{one:1}]:[];
  if(q.startsWith('INSERT INTO exam_attempts')){
   let [uid,type,mode]=p;
   if(q.includes('WHERE EXISTS')){assert.match(q,/Asia\/Tokyo/);assert.equal(uid,p[2]);if(!active(uid).length)return [];mode='student';}
   if(mode==='free'&&(opts.freeUsed||attempts.some(a=>a.user_id===uid&&a.exam_type===type&&a.access_mode==='free')))throw fail('exam_one_free_attempt_per_user_type');
   if(opts.accessDbError)throw Error('mock insert failed');
   const id=100+attempts.length;attempts.push({id,user_id:uid,exam_type:type,access_mode:mode,status:'started',started_at:new Date(clock).toISOString()});return [{id}];
  }
  if(q.startsWith('SELECT id,exam_type FROM exam_attempts'))return attempts.filter(a=>a.user_id===p[0]&&a.exam_type===p[1]&&a.access_mode==='free'&&a.status==='started').slice(0,1);
  if(q.startsWith('SELECT student_code,name,class_name,class_start,expire_date FROM exam_students')){assert.match(q,/Asia\/Tokyo/);return active(p[0]).slice(0,1);}
  if(q.startsWith('SELECT student_code,name,class_name,class_start,expire_date,status,')){assert.match(q,/Asia\/Tokyo/);return records.filter(x=>x.linked_user_id===p[0]).slice(0,1).map(x=>({...x,access_state:state(x)}));}
  if(q.includes('FROM exam_students')&&q.startsWith('SELECT COUNT(*)')){assert.match(q,/Asia\/Tokyo/);assert(!q.includes('CURRENT_DATE'));return [{total:records.length,active:records.filter(x=>state(x)==='active').length,inactive_or_expired:records.filter(x=>['inactive','expired'].includes(state(x))).length,upcoming:records.filter(x=>state(x)==='scheduled').length}];}
  if(q.startsWith('SELECT'))return []; // all other summary/status SELECTs; no side effects
  throw Error('unexpected query '+q);
 },pool:{connect:async()=>{let rate=false,stagedEvents=[],saved=false;return {query:async(q,p=[])=>{
   if(q==='BEGIN ISOLATION LEVEL READ COMMITTED'){rate=true;return {rows:[]};}
   if(rate){
    const norm=q.replace(/\s+/g,' ').trim();
    if(q==='COMMIT'){rateEvents.push(...stagedEvents);return {rows:[],command:'COMMIT'};}
    if(q==='ROLLBACK'){stagedEvents=[];return {rows:[]};}
    if(q.startsWith('SET LOCAL')||q.startsWith('SELECT pg_advisory_xact_lock'))return {rows:[]};
    if(q.includes('clock_timestamp()'))return {rows:[{ms:String(clock)}]};
    if(norm.startsWith('SELECT pair_key'))return {rows:rateEvents.filter(x=>x.account===p[0]&&x.at>p[1]).map(x=>({pair_key:x.pair,ms:String(x.at)}))};
    if(norm.startsWith('INSERT INTO public.exam_student_verification_failures')){stagedEvents.push({account:p[0],pair:p[1],at:p[2]});return {rows:[{id:1}]};}
    if(norm.startsWith('WITH expired AS'))return {rows:[]};
    if(q.startsWith('SAVEPOINT')){saved=true;return {rows:[]};}
    if(q.startsWith('ROLLBACK TO SAVEPOINT')||q.startsWith('RELEASE SAVEPOINT')){assert(saved);return {rows:[]};}
    // Execute the original verification SQL mock and retain its assertions.
    const vals=[];const parts=q.replace(/\$(\d+)/g,(_,n)=>{vals.push(p[Number(n)-1]);return '\u0001';}).split('\u0001');
    return {rows:await db.sql(parts,...vals)};
   }

   txCalls.push(q);if(q==='BEGIN'){assert.equal(staged,null);staged=structuredClone(records);return {rows:[]};}
   if(q==='COMMIT'){assert(staged);records=staged;staged=null;return {rows:[]};}
   if(q==='ROLLBACK'){staged=null;return {rows:[]};}
   assert(staged);assert.match(q,/ON CONFLICT\(student_code\) DO NOTHING RETURNING student_code/);assert(!q.includes('DO UPDATE'));
   const [student_code,name,class_name,class_start,expire_date,verification_code_hash]=p;
   if(opts.failInsertAt&&++insertCount===opts.failInsertAt)throw Error('private mock import error');
   if(staged.some(x=>x.student_code===student_code))return {rows:[]};
   staged.push({id:100+staged.length,student_code,name,class_name,class_start,expire_date,verification_code_hash,status:'active',linked_user_id:null,linked_email:null});return {rows:[{student_code}]};
 },release:()=>{if(!rate)txCalls.push('RELEASE');}};}}};
 const ctx=vm.createContext({Response,Request,URL,File,FormData,Buffer,createHash,randomBytes,timingSafeEqual,console:{error(){}},getUser:async()=>als.getStore(),getDatabase:()=>{dbCalls++;return db;},parse:()=>{if(opts.badCsv)throw Error('synthetic parser error');return structuredClone(csv);}});
 vm.runInContext(source,ctx);const api=ctx.api;
 const invoke=(i,user,payload={},method=i>=3?'GET':'POST')=>als.run(user,()=>api['h'+i](i===1?{method,formData:async()=>({get:()=>opts.noFile?null:new File([opts.fileContent??'synthetic'],'test.csv')})}:new Request('https://qa.example.invalid/',{method,...(method==='GET'?{}:{body:typeof payload==='string'?payload:JSON.stringify(payload)})})));
 return {api,invoke,calls,txCalls,get records(){return records},get attempts(){return attempts},get dbCalls(){return dbCalls},get lookupCount(){return lookupCount}};
}
const verifyCases=[['unauthenticated',null,body(),row(),401],['missing code',A,{studentCode:'QA-X'},row(),400],['wrong code',A,body('bad'),row(),403],['unknown ID',A,body(code,'other'),row(),403],['inactive',A,body(),row({status:'inactive'}),403],['already linked elsewhere',B,body(),row({linked_user_id:'A'}),409],['object ID',A,body(code,{}),row(),400],['numeric code',A,body(123),row(),400],['malformed JSON',A,'{',row(),400],['oversize ID',A,body(code,'x'.repeat(257)),row(),400],['malformed stored hash',A,body(),row({verification_code_hash:null}),403]];
for(const [name,user,payload,record,status] of verifyCases)test('verify '+name,async()=>{const f=fixture({rows:[record]});const r=await f.invoke(0,user,payload);assert.equal(r.status,status);assert.equal(f.calls.filter(x=>x.q.startsWith('UPDATE')).length,0);if(status===400||status===401)assert.equal(f.dbCalls,0);});
test('valid link and same-account retry preserve ownership and hide hash',async()=>{const f=fixture({rows:[row()]});for(let i=0;i<2;i++){const r=await f.invoke(0,A,body());assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');const b=await r.json();assert.equal(b.student.studentCode,'QA-X');assert(!JSON.stringify(b).includes(fakeHash()));}assert.equal(f.records[0].linked_user_id,'A');});
test('concurrent linking: exactly one winner, second conflict',async()=>{const f=fixture({rows:[row()],race:true});const r=await Promise.all([f.invoke(0,A,body()),f.invoke(0,B,body())]);assert.deepEqual(r.map(x=>x.status).sort(),[200,409]);assert.equal(f.records[0].linked_user_id,r[0].status===200?'A':'B');});
test('concurrent credential rotation blocks stale verification',async()=>{const f=fixture({rows:[row()],onRead:rs=>rs[0].verification_code_hash='changed'});assert.equal((await f.invoke(0,A,body())).status,409);assert.equal(f.records[0].linked_user_id,null);});
test('concurrent deactivation blocks stale verification',async()=>{const f=fixture({rows:[row()],onRead:rs=>rs[0].status='inactive'});assert.equal((await f.invoke(0,A,body())).status,409);assert.equal(f.records[0].linked_user_id,null);});
test('second record for same identity returns controlled 409',async()=>{const f=fixture({rows:[row({linked_user_id:'A'}),row({id:2,student_code:'QA-Y'})]});assert.equal((await f.invoke(0,A,body(code,'QA-Y'))).status,409);assert.equal(f.records[1].linked_user_id,null);});
test('unexpected DB error does not leak internals',async()=>{const f=fixture({rows:[row()],verifyDbError:true});const r=await f.invoke(0,A,body());assert.equal(r.status,503);assert.equal(r.headers.get('retry-after'),'5');assert(!((await r.text()).includes('private DB')));});
for(const d of ['2026-02-30','2026-13-01','2026-00-00','1900-02-29','0000-01-01','2026-04-31','bad'])test('calendar rejects '+d,()=>assert.throws(()=>fixture().api.studentDate(d)));
test('valid leap and slash dates',()=>{const {api}=fixture();assert.equal(api.studentDate('2000-2-29'),'2000-02-29');assert.equal(api.studentDate('2026/2/3'),'2026-02-03');assert.equal(api.studentDateRange('2026-2-3','2026-02-03').expireDate,'2026-02-03');});
test('reversed class dates rejected',async()=>{const f=fixture({csv:[csvRow({class_start:'2026-12-31',expire_date:'2026-11-01'})]});assert.equal((await f.invoke(1,ADMIN)).status,400);assert.equal(f.dbCalls,0);});
test('non-admin import is forbidden before DB',async()=>{const f=fixture({csv:[csvRow()]});assert.equal((await f.invoke(1,A)).status,403);assert.equal(f.dbCalls,0);});
test('malformed admin roles forbidden before CSV DB',async()=>{const f=fixture({csv:[csvRow()]});assert.equal((await f.invoke(1,{...ADMIN,roles:['admin',null]})).status,403);assert.equal(f.dbCalls,0);});
test('valid CSV commits new records only',async()=>{const f=fixture({csv:[csvRow(),csvRow({student_code:'QA-Y',verification_code:'synthetic-provided'})]});const r=await f.invoke(1,ADMIN);assert.equal(r.status,200);const b=await r.json();assert.equal(b.imported,2);assert.equal(b.skipped,0);assert.equal(b.credentials.length,2);assert.equal(f.records.length,2);assert(f.api.verifyCode(b.credentials[1].verificationCode,f.records[1].verification_code_hash));assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(f.txCalls[0],'BEGIN');assert.deepEqual(f.txCalls.slice(-2),['COMMIT','RELEASE']);});
test('existing duplicate skipped without changes or credential disclosure',async()=>{const old=row({linked_user_id:'A',linked_email:'a@example.invalid',status:'inactive'});const f=fixture({rows:[old],csv:[csvRow({name:'Changed',class_name:'BUS',verification_code:'replace'})]});const r=await f.invoke(1,ADMIN);const b=await r.json();assert.equal(r.status,200);assert.equal(b.imported,0);assert.equal(b.skipped,1);assert.equal(b.credentials.length,0);assert.deepEqual(f.records,[old]);});
test('all duplicates in same CSV skipped; unrelated new row imported',async()=>{const f=fixture({csv:[csvRow(),csvRow({name:'Other'}),csvRow({student_code:'QA-Y'})]});const b=await (await f.invoke(1,ADMIN)).json();assert.equal(b.imported,1);assert.equal(b.skipped,2);assert.equal(f.records[0].student_code,'QA-Y');});
test('later invalid row rejected before transaction',async()=>{const f=fixture({csv:[csvRow(),csvRow({student_code:'QA-Y',name:''})]});assert.equal((await f.invoke(1,ADMIN)).status,400);assert.equal(f.dbCalls,0);assert.equal(f.records.length,0);});
test('DB failure on second insert rolls back and releases client',async()=>{const old=row({student_code:'QA-OLD'});const f=fixture({rows:[old],csv:[csvRow(),csvRow({student_code:'QA-Y'})],failInsertAt:2});const r=await f.invoke(1,ADMIN);assert.equal(r.status,500);assert(!((await r.text()).includes('private mock')));assert.deepEqual(f.records,[old]);assert.deepEqual(f.txCalls.slice(-2),['ROLLBACK','RELEASE']);});
test('blank student ID creates generated ID and code',async()=>{const f=fixture({csv:[csvRow({student_code:''})]});const b=await (await f.invoke(1,ADMIN)).json();assert.equal(b.imported,1);assert.match(b.credentials[0].studentCode,/^YKST-[0-9A-F]{8}$/);assert.match(b.credentials[0].verificationCode,/^YK-[0-9A-F]{8}$/);});
for(const [name,options,status] of [['parser error',{badCsv:true},400],['missing file',{noFile:true},400],['oversized file',{fileContent:'x'.repeat(1500001)},413],['empty CSV',{},400]])test('import '+name,async()=>{const f=fixture(options);assert.equal((await f.invoke(1,ADMIN)).status,status);assert.equal(f.dbCalls,0);});
for(const [label,roles,mode] of [['member',[],'free'],['undefined',undefined,'free'],['string','admin','free'],['valid admin',['admin'],'admin'],['malformed',['admin',null],'free'],['sparse',[,'admin'],'free']])test('exam roles '+label,async()=>{const f=fixture();await modeBody(await f.invoke(2,{...A,roles},{examType:'truck'}),mode);});
for(const [label,over,mode] of [['active',{},'student'],['future',{class_start:'2026-12-01'},'free'],['expired',{expire_date:'2026-11-25'},'free'],['inactive',{status:'inactive'},'free'],['start boundary',{class_start:'2026-11-26'},'student'],['end boundary',{expire_date:'2026-11-26'},'student']])test('student entitlement '+label,async()=>{const f=fixture({rows:[row({linked_user_id:'A',...over})]});await modeBody(await f.invoke(2,A,{examType:'truck'}),mode);});
for(const [label,now,mode] of [['one ms before JST midnight','2026-11-25T14:59:59.999Z','free'],['exact JST start','2026-11-25T15:00:00Z','student'],['last ms of JST expiry','2026-11-26T14:59:59.999Z','student'],['exact next JST midnight','2026-11-26T15:00:00Z','free']])test('JST '+label,async()=>{const f=fixture({now,rows:[row({linked_user_id:'A',class_start:'2026-11-26',expire_date:'2026-11-26'})]});await modeBody(await f.invoke(2,A,{examType:'truck'}),mode);});
test('expiry between eligibility SELECT and INSERT does not grant student mode',async()=>{const f=fixture({now:'2026-11-26T14:59:59.999Z',advanceAfterEligibility:1,rows:[row({linked_user_id:'A',expire_date:'2026-11-26'})]});await modeBody(await f.invoke(2,A,{examType:'truck'}),'free');assert.equal(f.attempts.length,1);});
test('expired linking allowed but new student entitlement denied',async()=>{const f=fixture({rows:[row({expire_date:'2026-11-25'})]});assert.equal((await f.invoke(0,A,body())).status,200);await modeBody(await f.invoke(2,A,{examType:'truck'}),'free');});
const oldAttempt=(over={})=>({id:7,user_id:'A',exam_type:'truck',access_mode:'student',status:'started',started_at:'2026-11-25T14:30:00Z',...over});
test('expired student can resume existing in-time checkpoint, no new attempt',async()=>{const f=fixture({now:'2026-11-25T15:00:00Z',rows:[row({linked_user_id:'A',expire_date:'2026-11-25'})],attempts:[oldAttempt({saved_at:'2026-11-25T14:50:00Z',ends_at:'2026-11-25T15:50:00Z'})]});const b=await modeBody(await f.invoke(2,A,{examType:'truck'}),'student',true);assert.equal(b.attemptId,7);assert.equal(f.attempts.length,1);});
test('expired student can resume existing no-checkpoint attempt before initial deadline',async()=>{const f=fixture({now:'2026-11-25T15:00:00Z',rows:[row({linked_user_id:'A',expire_date:'2026-11-25'})],attempts:[oldAttempt()]});const b=await modeBody(await f.invoke(2,A,{examType:'truck'}),'student',true);assert.equal(b.attemptId,7);assert.equal(f.attempts.length,1);});
test('expired deadline never resurrects student attempt',async()=>{const f=fixture({now:'2026-11-25T15:51:00.001Z',rows:[row({linked_user_id:'A',expire_date:'2026-11-25'})],attempts:[oldAttempt()]});await modeBody(await f.invoke(2,A,{examType:'truck'}),'free');assert.equal(f.attempts[0].status,'abandoned');});
test('deadline crossing after cleanup still does not return old attempt',async()=>{const f=fixture({now:'2026-11-25T15:50:59.999Z',advanceAfterCleanup:2,rows:[row({linked_user_id:'A',expire_date:'2026-11-25'})],attempts:[oldAttempt()]});await modeBody(await f.invoke(2,A,{examType:'truck'}),'free');});
test('existing admin attempt cannot be resumed by malformed admin claims',async()=>{const f=fixture({now:'2026-11-25T15:00:00Z',attempts:[oldAttempt({access_mode:'admin',saved_at:'2026-11-25T14:40:00Z'})]});await modeBody(await f.invoke(2,{...A,roles:['admin',null]},{examType:'truck'}),'free');});
test('free quota fallback remains 402',async()=>{const f=fixture({freeUsed:true});assert.equal((await f.invoke(2,A,{examType:'truck'})).status,402);});
test('paid fallback unchanged after student expiry',async()=>{const f=fixture({paid:true,rows:[row({linked_user_id:'A',expire_date:'2026-11-25'})]});await modeBody(await f.invoke(2,A,{examType:'truck'}),'paid');});
test('legacy checkpoint absence still does not restore free quota',async()=>{const f=fixture({missingCheckpoint:true,freeUsed:true});assert.equal((await f.invoke(2,A,{examType:'truck'})).status,402);});
test('status role normalization and JST eligibility',async()=>{const f=fixture({now:'2026-11-26T15:00:00Z',rows:[row({linked_user_id:'A',expire_date:'2026-11-26'})]});const r=await f.invoke(3,{...A,roles:['admin',null]});const b=await r.json();assert.equal(r.status,200);assert.deepEqual(b.roles,[]);assert.equal(b.student,null);assert.equal(b.linkedStudent.access_state,'expired');assert(f.calls.every(c=>c.q.startsWith('SELECT')));});
test('admin overview and analytics use JST and read-only queries',async()=>{const f=fixture({now:'2026-11-26T15:00:00Z',rows:[row({expire_date:'2026-11-26'})]});for(const i of [4,5]){const r=await f.invoke(i,ADMIN);assert.equal(r.status,200);assert.equal((await r.json()).students.active,0);}assert(f.calls.every(c=>c.q.startsWith('SELECT')));});
// FIX06-A legacy assertions preserved; rate limit and adapter tested separately.
