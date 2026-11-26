// PostgreSQL adapter: single connection, READ COMMITTED, transaction-scoped lock.
// No raw verification code, name, email or raw identifier enters the failure table.
import { WINDOW_MS } from './student-rate-policy.mjs';
const RETENTION_MS=86_400_000;
const DIGEST=/^[0-9a-f]{64}$/;
const CLOCK_SQL="SELECT floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint::text AS ms";
const millis=v=>{if(typeof v!=='string'||!/^\d+$/.test(v))throw Error('Invalid DB timestamp');const n=Number(v);if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid DB timestamp');return n;};
const digest=v=>{if(typeof v!=='string'||!DIGEST.test(v))throw Error('Invalid rate digest');return v;};
// 64-bit signed advisory lock; a rare collision serializes, never shares counters.
export const studentAccountLockKey=account=>BigInt.asIntN(64,BigInt('0x'+digest(account).slice(0,16))).toString();
export function makePostgresStudentStore(getDatabase){
 return {async atomic(account,work){
  digest(account);
  const client=await getDatabase().pool.connect();
  let destroy=false, started=false;
  try{
   await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');started=true;
   await client.query("SET LOCAL lock_timeout = '2000ms'");
   await client.query("SET LOCAL statement_timeout = '5000ms'");
   await client.query("SET LOCAL idle_in_transaction_session_timeout = '10000ms'");
   await client.query('SELECT pg_advisory_xact_lock($1::bigint)',[studentAccountLockKey(account)]);
   let firstClock;
   const tx={
    async now(){const r=await client.query(CLOCK_SQL);if(r.rows.length!==1)throw Error('Missing DB clock');const n=millis(r.rows[0].ms);if(firstClock===undefined)firstClock=n;return n;},
    async readFailures(cutoff){
     // Bound read size. More than 20 active events is unexpected for this policy;
     // fail closed rather than truncate a potentially corrupt counter history.
     if(firstClock===undefined||cutoff!==firstClock-WINDOW_MS)throw Error('Invalid rate cutoff');
     const r=await client.query(`SELECT pair_key, floor(extract(epoch FROM recorded_at)*1000)::bigint::text AS ms
       FROM public.exam_student_verification_failures WHERE account_key=$1
       AND recorded_at > to_timestamp($2::double precision/1000) ORDER BY recorded_at,id LIMIT 21`,[account,cutoff]);
     if(r.rows.length>20)throw Error('Unexpected rate history');
     return r.rows.map(x=>({pair:digest(x.pair_key),at:millis(x.ms)}));
    },
    async recordFailure({pair,at}){
     if(firstClock===undefined||!Number.isSafeInteger(at)||at<firstClock)throw Error('Invalid failure timestamp');
     const r=await client.query(`INSERT INTO public.exam_student_verification_failures(account_key,pair_key,recorded_at)
       VALUES($1,$2,to_timestamp($3::double precision/1000)) RETURNING id`,[account,digest(pair),at]);
     if(r.rows.length!==1)throw Error('Failure record not inserted');
    },
    async findStudent(studentCode){const r=await client.query('SELECT id,student_code,status,verification_code_hash,linked_user_id FROM exam_students WHERE student_code=$1 LIMIT 1',[studentCode]);return r.rows[0];},
    async linkStudent(student,user){
     // Known uniqueness conflict aborts a PostgreSQL statement; savepoint permits
     // recording the 409 in the same transaction without changing ownership.
     await client.query('SAVEPOINT ykoc_student_link');
     let r;
     try{r=await client.query(`UPDATE exam_students SET linked_user_id=$1, linked_email=$2, updated_at=NOW()
       WHERE id=$3 AND (linked_user_id IS NULL OR linked_user_id=$4) AND status='active'
       AND verification_code_hash=$5 RETURNING student_code,name,class_name,class_start,expire_date`,[user.id,user.email??'',student.id,user.id,student.verification_code_hash]);}
     catch(e){
      if(e?.code!=='23505'||e?.constraint!=='exam_students_linked_user_id_key')throw e;
      await client.query('ROLLBACK TO SAVEPOINT ykoc_student_link');
      await client.query('RELEASE SAVEPOINT ykoc_student_link');
      return {kind:'account-conflict'};
     }
     await client.query('RELEASE SAVEPOINT ykoc_student_link');
     if(r.rows.length>1)throw Error('Unexpected student update');
     return r.rows.length?{kind:'linked',student:r.rows[0]}:{kind:'conflict'};
    }
   };
   const result=await work(tx);
   // Bounded opportunistic deletion, only older than 24h. No active event may
   // be removed. Idle-site hard retention requires a separately approved job.
   if(firstClock===undefined)throw Error('Rate clock not read');
   await client.query(`WITH expired AS (SELECT id FROM public.exam_student_verification_failures
     WHERE recorded_at <= to_timestamp($1::double precision/1000)
     ORDER BY recorded_at,id LIMIT 100 FOR UPDATE SKIP LOCKED)
     DELETE FROM public.exam_student_verification_failures f USING expired WHERE f.id=expired.id`,[firstClock-RETENTION_MS]);
   const committed=await client.query('COMMIT');
   if(committed.command!=='COMMIT')throw Error('Transaction not committed');
   started=false;
   return result;
  }catch(e){
   // A failed/ambiguous COMMIT must not trigger an automatic retry. Destroy
   // the client even if rollback succeeds, avoiding reusing uncertain state.
   destroy=true;
   if(started){try{await client.query('ROLLBACK');}catch{/* discard connection */}}
   throw e;
  }finally{client.release(destroy);}
 }};
}
