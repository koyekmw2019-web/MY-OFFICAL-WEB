// Native PostgreSQL 16.16 single-user backend, disposable disk cluster, stdin only.
// Actual SQL runs on PostgreSQL; handler transport is a metadata-result adapter, not a network driver.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {QA,endpointFingerprint,endpointParts} from '../../netlify/functions/_shared/qa-db-fingerprint-v7902.mjs';
import {PATH,IDENTITY_SQL,BASE_SQL,RATE_SQL,makeRuntimePreflight} from '../../netlify/functions/_shared/qa-db-runtime-preflight.mjs';

const fixtureRole='qa_fixture_runtime';
const context={site:{id:QA.site},account:{id:QA.team},user:{id:'fixture-team'},deploy:{context:'production',published:true}};
// Only the exam_students schema needed for this diagnostic. No Payment or YKCR tables/data.
const STUDENT_SQL=`CREATE TABLE public.exam_students(
 id BIGSERIAL PRIMARY KEY,student_code TEXT NOT NULL UNIQUE,name TEXT NOT NULL,class_name TEXT,
 class_start DATE NOT NULL,expire_date DATE NOT NULL,verification_code_hash TEXT NOT NULL,
 linked_user_id TEXT UNIQUE,linked_email TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),status TEXT NOT NULL DEFAULT 'active'
 );
 GRANT USAGE ON SCHEMA public TO qa_fixture_runtime;
 GRANT SELECT,INSERT,UPDATE ON public.exam_students TO qa_fixture_runtime;
 GRANT USAGE ON SEQUENCE public.exam_students_id_seq TO qa_fixture_runtime;`;
// Exact approved candidate DDL, copied ONLY into this disposable test fixture.
const RATE_FIXTURE_SQL=`BEGIN;
SET LOCAL lock_timeout = '2000ms';
SET LOCAL statement_timeout = '10000ms';
CREATE TABLE public.exam_student_verification_failures (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_key TEXT NOT NULL CHECK (account_key ~ '^[0-9a-f]{64}$'),
  pair_key TEXT NOT NULL CHECK (pair_key ~ '^[0-9a-f]{64}$'),
  recorded_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX exam_student_verification_failures_account_time_idx
  ON public.exam_student_verification_failures(account_key,recorded_at,id);
CREATE INDEX exam_student_verification_failures_retention_idx
  ON public.exam_student_verification_failures(recorded_at,id);
COMMIT;`;
const GRANTS=`GRANT SELECT,INSERT,DELETE,UPDATE ON public.exam_student_verification_failures TO qa_fixture_runtime;
 GRANT USAGE ON SEQUENCE public.exam_student_verification_failures_id_seq TO qa_fixture_runtime;`;
const require=createRequire(import.meta.url);
const packageEntry=require.resolve('@embedded-postgres/linux-x64');
const nativeDir=join(packageEntry,'..','..','native');
const adminRole='ykoc_fixture_admin';
const env={PATH:process.env.PATH,LANG:'C',LC_ALL:'C'};
function execBin(name,args,input){
 const r=spawnSync(join(nativeDir,'bin',name),args,{encoding:'utf8',input,timeout:30000,env});
 if(r.status!==0||r.error||/\b(?:ERROR|FATAL|PANIC):/.test(r.stderr||'')) throw Error(name+' local fixture failed: '+(r.stderr||r.error?.message||r.stdout).slice(-1000));
 return r.stdout;
}
const flatten=s=>s.replace(/\n/g,' ');
const wrap=(sql,key)=>'SELECT row_to_json(q)::text AS '+key+' FROM ('+flatten(sql)+') q;';
function readResult(text,key){
 const match=text.match(new RegExp('\\b'+key+' = "(.*)"\\t'));
 assert(match,'Missing catalog result '+key);return JSON.parse(match[1]);
}
async function fixture(work){
 const dataDir=mkdtempSync(join(tmpdir(),'ykoc-preflight-single-'));
 try{
  execBin('initdb',['-D',dataDir,'-A','trust','-U',adminRole,'--no-locale','--encoding=UTF8']);
  const exec=(sql)=>execBin('postgres',['--single','-D',dataDir,'postgres'],flatten(sql)+'\n');
  const version=exec('SELECT version();');
  assert.match(version,/PostgreSQL stand-alone backend 16\.16/);
  exec('CREATE ROLE qa_fixture_runtime LOGIN; '+STUDENT_SQL);
  const database='postgres';
  const raw='postgresql://qa_fixture_runtime:synthetic@fixture-pooler.example.test/'+database+'?sslmode=require';
  const digest=endpointFingerprint(endpointParts('postgresql://dashboard:fake@fixture.example.test/'+database));
  const db={exec:async sql=>exec(sql),query:async sql=>{
    const data=readResult(exec(wrap(sql,'fixture_result')),'fixture_result');return {rows:[data]};
  }};
  const run=async(stage='before',role=fixtureRole)=>{
   // Same transaction contains catalog queries; no network/credentials or application-row reads.
   const out=exec('SET SESSION AUTHORIZATION '+role+'; BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY; '
    +"SET LOCAL lock_timeout = '2000ms'; SET LOCAL statement_timeout = '5000ms'; SET LOCAL idle_in_transaction_session_timeout = '10000ms'; "
    +wrap(IDENTITY_SQL,'identity_result')+wrap(BASE_SQL,'base_result')+(stage==='after'?wrap(RATE_SQL,'rate_result'):'')+'ROLLBACK; RESET SESSION AUTHORIZATION;');
   const identity=readResult(out,'identity_result'),base=readResult(out,'base_result'),rate=stage==='after'?readResult(out,'rate_result'):null;
   let released;
   const handler=makeRuntimePreflight({
    env:{SITE_ID:QA.site},requireAdmin:async()=>({id:'fixture-admin'}),
    getConnectionString:()=>raw,
    getDatabase:(...args)=>{assert.equal(args.length,0);return {connectionString:raw,pool:{
     async connect(){return {query:async sql=>{
      if(sql===IDENTITY_SQL)return {rows:[identity]};
      if(sql===BASE_SQL)return {rows:[base]};
      if(sql===RATE_SQL)return {rows:[rate]};
      return {command:sql.startsWith('BEGIN')?'BEGIN':sql==='ROLLBACK'?'ROLLBACK':'SET'};
     },release(discard){released=discard;}};},end:async()=>{}
    }};}
   });
   const req=new Request(QA.origin+PATH,{method:'POST',headers:{origin:QA.origin,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({fingerprint:digest,stage})});
   const r=await handler(req,context);return {status:r.status,body:await r.json(),released};
  };
  await work(db,run);
 } finally {rmSync(dataDir,{recursive:true,force:true});}
}
test('real catalog: pre-migration checks pass and do not create rate storage',()=>fixture(async(db,run)=>{
 const r=await run();assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.checks.candidate_absent,true);
 assert.equal(r.released,false);assert.equal((await db.query("SELECT to_regclass('public.exam_student_verification_failures') AS oid")).rows[0].oid,null);
}));
test('real catalog: missing student table fails without throwing raw error',()=>fixture(async(db,run)=>{
 await db.exec('DROP TABLE public.exam_students');
 const r=await run();assert.equal(r.status,503);assert.equal(r.body.checks.student_table,false);
}));
test('real catalog: missing UPDATE privilege stops before migration',()=>fixture(async(db,run)=>{
 await db.exec('REVOKE UPDATE ON public.exam_students FROM qa_fixture_runtime');
 const r=await run();assert.equal(r.status,503);assert.equal(r.body.checks.student_acl,false);
}));
test('real catalog: missing sequence permission is detected',()=>fixture(async(db,run)=>{
 await db.exec('REVOKE USAGE ON SEQUENCE public.exam_students_id_seq FROM qa_fixture_runtime');
 const r=await run();assert.equal(r.status,503);assert.equal(r.body.checks.student_sequence,false);
}));
test('real catalog: renamed account ownership constraint is detected',()=>fixture(async(db,run)=>{
 await db.exec('ALTER TABLE public.exam_students RENAME CONSTRAINT exam_students_linked_user_id_key TO other_unique');
 const r=await run();assert.equal(r.status,503);assert.equal(r.body.checks.student_unique,false);
}));
test('real catalog: RLS enabled on student table blocks',()=>fixture(async(db,run)=>{
 await db.exec('ALTER TABLE public.exam_students ENABLE ROW LEVEL SECURITY');
 const r=await run();assert.equal(r.status,503);assert.equal(r.body.checks.student_no_rls,false);
}));
test('real catalog: active user trigger on student table blocks',()=>fixture(async(db,run)=>{
 await db.exec("CREATE FUNCTION public.fixture_noop() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RETURN NEW; END$$; CREATE TRIGGER fixture_trigger BEFORE INSERT ON public.exam_students FOR EACH ROW EXECUTE FUNCTION public.fixture_noop()");
 const r=await run();assert.equal(r.status,503);assert.equal(r.body.checks.student_no_user_triggers,false);
}));
test('real catalog: elevated/incorrect session role fails before student inspection',()=>fixture(async(db,run)=>{
 const r=await run('before',adminRole);assert.equal(r.status,503);assert.equal(r.body.checks.role_safe,false);assert.equal(r.body.checks.role_match,false);assert(!('student_table' in r.body.checks));
}));
test('real catalog: candidate name collision causes before-stage rejection',()=>fixture(async(db,run)=>{
 await db.exec('CREATE TYPE public.exam_student_verification_failures AS ENUM (\'fixture\')');
 const r=await run();assert.equal(r.status,503);assert.equal(r.body.checks.candidate_absent,false);
}));
test('real catalog: after-stage clean candidate and ACLs pass, before-stage rejects existing table',()=>fixture(async(db,run)=>{
 await db.exec(RATE_FIXTURE_SQL);await db.exec(GRANTS);
 const before=await run();assert.equal(before.status,503);assert.equal(before.body.checks.candidate_absent,false);
 const after=await run('after');assert.equal(after.status,200,JSON.stringify(after.body));
 assert.equal(after.body.checks.rate_digest_constraints,true);assert.equal(after.body.writeProven,false);
}));
test('real catalog: after-stage missing table rejects',()=>fixture(async(db,run)=>{
 const r=await run('after');assert.equal(r.status,503);assert.equal(r.body.checks.candidate_absent,true);
}));
test('real catalog: missing rate UPDATE privilege required by SKIP LOCKED rejects',()=>fixture(async(db,run)=>{
 await db.exec(RATE_FIXTURE_SQL);await db.exec(GRANTS);
 await db.exec('REVOKE UPDATE ON public.exam_student_verification_failures FROM qa_fixture_runtime');
 const r=await run('after');assert.equal(r.status,503);assert.equal(r.body.checks.rate_acl,false);
}));
test('real catalog: missing retention index rejects',()=>fixture(async(db,run)=>{
 await db.exec(RATE_FIXTURE_SQL);await db.exec(GRANTS);
 await db.exec('DROP INDEX public.exam_student_verification_failures_retention_idx');
 const r=await run('after');assert.equal(r.status,503);assert.equal(r.body.checks.rate_retention_index,false);
}));
test('real catalog: wrong digest constraint rejects (presence alone insufficient)',()=>fixture(async(db,run)=>{
 await db.exec(RATE_FIXTURE_SQL);await db.exec(GRANTS);
 await db.exec("ALTER TABLE public.exam_student_verification_failures DROP CONSTRAINT exam_student_verification_failures_pair_key_check, ADD CHECK (length(pair_key)>0)");
 const r=await run('after');assert.equal(r.status,503);assert.equal(r.body.checks.rate_digest_constraints,false);
}));
