// FIX06-C: QA-only retention and read-only storage readiness. No hosted configuration changes.
const QA_SITE='56d19e67-cc2c-4bfe-802e-ce3c198494a3';
const QA_TEAM='6b00669b8ca1a2a210030417';
export const CLEANUP_LIMIT=1000;
export function qaContext(context,env){
 return context?.site?.id===QA_SITE && context?.account?.id===QA_TEAM && env?.SITE_ID===QA_SITE;
}
export function cleanupEnabled(context,env){
 return qaContext(context,env)&&context?.deploy?.published===true&&context?.deploy?.context==='production'&&env?.YKOC_QA_STUDENT_RATE_CLEANUP==='enabled-v1';
}
// Catalog-only probe, no rows/identifiers from student or rate tables returned.
export const READINESS_SQL=`WITH t AS (SELECT to_regclass('public.exam_student_verification_failures') AS oid),
 checks AS (SELECT
   EXISTS(SELECT 1 FROM pg_class c WHERE c.oid=t.oid AND c.relkind='r') AS table_ok,
   (SELECT count(*)=4 AND count(*) FILTER (WHERE a.attnotnull AND ((a.attname='id' AND a.atttypid='bigint'::regtype AND a.attidentity='a') OR (a.attname IN ('account_key','pair_key') AND a.atttypid='text'::regtype) OR (a.attname='recorded_at' AND a.atttypid='timestamptz'::regtype)))=4 FROM pg_attribute a WHERE a.attrelid=t.oid AND a.attnum>0 AND NOT a.attisdropped) AS columns_ok,
   EXISTS(SELECT 1 FROM pg_constraint c JOIN pg_attribute a ON a.attrelid=t.oid AND a.attname='id' WHERE c.conrelid=t.oid AND c.contype='p' AND c.convalidated AND c.conkey=ARRAY[a.attnum]) AS pk_ok,
   (SELECT count(*)=2 FROM pg_constraint c JOIN pg_attribute a ON a.attrelid=t.oid AND a.attname IN ('account_key','pair_key') WHERE c.conrelid=t.oid AND c.contype='c' AND c.convalidated AND c.conkey=ARRAY[a.attnum]) AS digest_checks_present,
   EXISTS(SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid JOIN pg_am am ON am.oid=c.relam WHERE i.indrelid=t.oid AND c.relname='exam_student_verification_failures_account_time_idx' AND am.amname='btree' AND i.indisvalid AND i.indisready AND i.indpred IS NULL AND i.indexprs IS NULL AND i.indnatts=3 AND pg_get_indexdef(i.indexrelid,1,true)='account_key' AND pg_get_indexdef(i.indexrelid,2,true)='recorded_at' AND pg_get_indexdef(i.indexrelid,3,true)='id') AS account_index_ok,
   EXISTS(SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid JOIN pg_am am ON am.oid=c.relam WHERE i.indrelid=t.oid AND c.relname='exam_student_verification_failures_retention_idx' AND am.amname='btree' AND i.indisvalid AND i.indisready AND i.indpred IS NULL AND i.indexprs IS NULL AND i.indnatts=2 AND pg_get_indexdef(i.indexrelid,1,true)='recorded_at' AND pg_get_indexdef(i.indexrelid,2,true)='id') AS retention_index_ok,
   COALESCE(has_schema_privilege('public','USAGE') AND has_table_privilege(t.oid,'SELECT') AND has_table_privilege(t.oid,'INSERT') AND has_table_privilege(t.oid,'DELETE'),false) AS privileges_ok,
   CASE WHEN EXISTS(SELECT 1 FROM pg_class c WHERE c.oid=t.oid AND c.relkind='r') THEN COALESCE(has_sequence_privilege(pg_get_serial_sequence('public.exam_student_verification_failures','id'),'USAGE'),false) ELSE false END AS sequence_ok
 FROM t) SELECT * FROM checks`;
const readinessKeys=['table_ok','columns_ok','pk_ok','digest_checks_present','account_index_ok','retention_index_ok','privileges_ok','sequence_ok'];
export async function readRateReadiness(getDatabase){
 const result=await getDatabase().pool.query(READINESS_SQL);
 if(result.rows.length!==1)throw Error('Readiness response invalid');
 const checks=Object.fromEntries(readinessKeys.map(k=>[k,result.rows[0][k]===true]));
 return {ready:Object.values(checks).every(Boolean),checks};
}
// Single bounded batch, server-side time, no raw rows in logs or return payload.
export const CLEANUP_SQL=`WITH expired AS (
 SELECT id FROM public.exam_student_verification_failures
 WHERE recorded_at <= statement_timestamp() - INTERVAL '24 hours'
 ORDER BY recorded_at,id LIMIT 1000 FOR UPDATE SKIP LOCKED
), removed AS (
 DELETE FROM public.exam_student_verification_failures f USING expired
 WHERE f.id=expired.id RETURNING 1
) SELECT count(*)::int AS removed FROM removed`;
export async function cleanupExpiredRateFailures(getDatabase){
 const c=await getDatabase().pool.connect();let begun=false,discard=false;
 try{
  await c.query('BEGIN ISOLATION LEVEL READ COMMITTED');begun=true;
  await c.query("SET LOCAL lock_timeout = '2000ms'");
  await c.query("SET LOCAL statement_timeout = '5000ms'");
  await c.query("SET LOCAL idle_in_transaction_session_timeout = '10000ms'");
  const result=await c.query(CLEANUP_SQL);const removed=result.rows[0]?.removed;
  if(result.rows.length!==1||!Number.isInteger(removed)||removed<0||removed>CLEANUP_LIMIT)throw Error('Invalid cleanup count');
  const committed=await c.query('COMMIT');if(committed.command!=='COMMIT')throw Error('Cleanup commit not confirmed');begun=false;
  return {removed,possiblyMore:removed===CLEANUP_LIMIT};
 }catch(e){discard=true;if(begun){try{await c.query('ROLLBACK')}catch{}}throw e;}
 finally{c.release(discard);}
}
const json=(body,status)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export function makeReadinessHandler({getDatabase,requireAdmin,env}){
 return async(req,context)=>{
  if(req.method!=='GET')return json({error:'Method not allowed'},405);
  if(!qaContext(context,env))return json({error:'Not found'},404);
  try{await requireAdmin();}catch(e){return json({error:e instanceof Response&&e.status===401?'Unauthorized':e instanceof Response&&e.status===403?'Forbidden':'Unavailable'},e instanceof Response&&[401,403].includes(e.status)?e.status:503);}
  try{const result=await readRateReadiness(getDatabase);return json({...result,schedulerEligible:cleanupEnabled(context,env)},result.ready?200:503);}
  catch{return json({ready:false,error:'Rate storage readiness unavailable'},503);}
 };
}
export function makeScheduledCleanup({getDatabase,env,log=console}){
 return async(_req,context)=>{
  if(!cleanupEnabled(context,env)){log.info('Student rate cleanup disabled');return;}
  try{const r=await cleanupExpiredRateFailures(getDatabase);log.info('Student rate cleanup complete',r);}
  catch{log.error('Student rate cleanup failed');throw Error('Student rate cleanup failed');}
 };
}
