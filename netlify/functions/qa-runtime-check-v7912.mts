/** TEMPORARY QA-only diagnostic; never merge to main. No credentials, identifiers,
 * hashes, customer rows, error details, mutations or schedules are returned. */
import { createHash, timingSafeEqual } from 'node:crypto';
import { getConnectionString, getDatabase } from '@netlify/database';
import type { Context } from '@netlify/functions';
const QA = Object.freeze({
  origin: 'https://qa-v7-91-2-dashboard-simplification--yekun-ordinary-second-qa.netlify.app',
  path: '/.netlify/functions/qa-runtime-check-v7912',
  site: '56d19e67-cc2c-4bfe-802e-ce3c198494a3',
  team: '6b00669b8ca1a2a210030417',
});
const headers = {
  'Cache-Control': 'private, no-store, max-age=0', 'Pragma': 'no-cache',
  'Referrer-Policy': 'same-origin', 'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY', 'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Content-Security-Policy': "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
};
const reply = (status:number, result:object) => Response.json(result,{status,headers});
const FORM = '<!doctype html><html lang="en"><meta charset="utf-8"><title>YKOC QA runtime diagnostic</title><h1>QA runtime diagnostic</h1><p>Team login only. Submit independently derived comparison fingerprints, never the database URL or password. A matched endpoint is required before read-only catalog checks.</p><form method="post" autocomplete="off"><p><label>Expected endpoint fingerprint <input name="endpoint" type="password" pattern="[a-f0-9]{64}" required autocomplete="off"></label></p><p><label>Expected write-role fingerprint <input name="role" type="password" pattern="[a-f0-9]{64}" required autocomplete="off"></label></p><p><label>Expected branch deploy ID <input name="deploy" pattern="[a-f0-9]{24}" required autocomplete="off"></label></p><button type="submit">Verify QA runtime</button></form></html>';
const sha = (parts:string[]) => createHash('sha256').update(JSON.stringify(parts),'utf8').digest('hex');
const match = (a:string,b:string) => /^[a-f0-9]{64}$/.test(a) && /^[a-f0-9]{64}$/.test(b) && timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex'));
const roleHash=(role:string)=>sha(['YKOC-QA-DB-ROLE-v1',role]);
export function connectionMetadata(raw:string) {
  if(typeof raw!=='string'||raw.length>8192)throw Error('invalid');
  const u=new URL(raw.trim());
  if(!['postgres:','postgresql:'].includes(u.protocol)||u.hash||!/^\/[^/]+$/.test(u.pathname))throw Error('invalid');
  for(const k of u.searchParams.keys())if(!['sslmode','channel_binding','connect_timeout','application_name'].includes(k))throw Error('invalid');
  const labels=u.hostname.toLowerCase().split('.');
  const valid=(s:string)=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(s);
  if(labels.length<2||!labels.every(valid))throw Error('invalid');
  labels[0]=labels[0].replace(/-pooler$/,'');
  const database=decodeURIComponent(u.pathname.slice(1)), role=decodeURIComponent(u.username);
  if(!valid(labels[0])||!database||!role||/[\x00-\x1f\x7f/]/.test(database)||/[\x00-\x1f\x7f/]/.test(role))throw Error('invalid');
  return {fingerprint:sha(['YKOC-QA-DB-ENDPOINT-v2',labels.join('.'),u.port||'5432',database]),database,role};
}
async function readExpected(req:Request){
  if(req.headers.get('content-type')?.split(';')[0].trim()!=='application/x-www-form-urlencoded')return null;
  const reader=req.body?.getReader();if(!reader)return null;
  const chunks=[];let bytes=0;
  try{
    while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>256){await reader.cancel();return null}chunks.push(value)}
    const p=new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
    const e=p.get('endpoint'),r=p.get('role'),d=p.get('deploy');
    return [...p].length===3&&e&&r&&d&&/^[a-f0-9]{64}$/.test(e)&&/^[a-f0-9]{64}$/.test(r)&&/^[a-f0-9]{24}$/.test(d)?{e,r,d}:null;
  }finally{reader.releaseLock()}
}
type Deps={getConnectionString:()=>string,getDatabase:()=>{connectionString:string,sql:any}};
export async function runDiagnostic(req:Request,context:Context,deps:Deps){
  try{
    const url=new URL(req.url);
    if(url.origin!==QA.origin||url.pathname!==QA.path||url.search||url.hash||context.site?.id!==QA.site||context.account?.id!==QA.team||context.deploy?.context!=='branch-deploy')return reply(404,{status:'blocked'});
    if(!context.user?.id)return reply(403,{status:'blocked'});
    if(req.method==='GET')return new Response(FORM,{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
    if(req.method!=='POST')return reply(405,{status:'blocked'});
    if(req.headers.get('origin')!==QA.origin)return reply(403,{status:'blocked'});
    const expected=await readExpected(req);
    if(!expected||expected.d!==context.deploy.id)return reply(400,{status:'deploy_or_input_mismatch',selectExecuted:false});
    const runtime=connectionMetadata(deps.getConnectionString());
    if(!match(runtime.fingerprint,expected.e))return reply(409,{status:'endpoint_mismatch',selectExecuted:false});
    // Same automatic SDK path used by existing exam Functions; no override.
    const db=deps.getDatabase(), actual=connectionMetadata(db.connectionString);
    if(!match(actual.fingerprint,expected.e)||actual.role!==runtime.role)return reply(409,{status:'sdk_binding_mismatch',selectExecuted:false});
    // One SELECT from PostgreSQL catalog metadata only. Catalog booleans are
    // reported; role names, database name, grants to other roles and rows aren't.
    const [r]=await db.sql`SELECT
      current_database() AS database_name, current_user AS effective_role, session_user AS session_role,
      current_setting('transaction_read_only')='off' AS writable_session,
      EXISTS(SELECT 1 FROM pg_roles WHERE rolname=current_user AND NOT rolsuper) AS non_superuser,
      EXISTS(SELECT 1 FROM pg_roles WHERE rolname=current_user AND rolbypassrls) AS bypass_rls,
      EXISTS(SELECT 1 FROM pg_roles WHERE rolname=current_user AND rolcreaterole) AS can_create_role,
      has_database_privilege(current_database(),'CONNECT') AND has_schema_privilege('public','USAGE') AS schema_access,
      COALESCE(has_table_privilege(to_regclass('public.exam_attempts'),'SELECT') AND has_table_privilege(to_regclass('public.exam_attempts'),'INSERT') AND has_table_privilege(to_regclass('public.exam_attempts'),'UPDATE'),false) AS attempts_access,
      COALESCE(has_table_privilege(to_regclass('public.exam_attempt_checkpoints'),'SELECT') AND has_table_privilege(to_regclass('public.exam_attempt_checkpoints'),'INSERT') AND has_table_privilege(to_regclass('public.exam_attempt_checkpoints'),'UPDATE') AND has_table_privilege(to_regclass('public.exam_attempt_checkpoints'),'DELETE'),false) AS checkpoint_access,
      COALESCE(has_table_privilege(to_regclass('public.exam_students'),'SELECT') AND has_table_privilege(to_regclass('public.exam_paid_access'),'SELECT') AND has_table_privilege(to_regclass('public.exam_payment_requests'),'SELECT'),false) AS eligibility_history_read,
      COALESCE(has_table_privilege(to_regclass('public.exam_coach_topic_results'),'SELECT') AND has_table_privilege(to_regclass('public.exam_coach_topic_results'),'INSERT'),false) AS coach_access,
      CASE WHEN to_regclass('public.exam_attempts') IS NOT NULL THEN COALESCE(has_sequence_privilege(to_regclass(pg_get_serial_sequence('public.exam_attempts','id')),'USAGE'),false) ELSE false END AS sequence_access,
      NOT EXISTS(SELECT 1 FROM pg_class WHERE oid IN (to_regclass('public.exam_attempts'),to_regclass('public.exam_attempt_checkpoints'),to_regclass('public.exam_students'),to_regclass('public.exam_paid_access'),to_regclass('public.exam_payment_requests'),to_regclass('public.exam_coach_topic_results')) AND relrowsecurity) AS no_unexpected_rls,
      EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid=to_regclass('public.exam_attempts') AND attname='score_verified' AND NOT attisdropped)
        AND EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid=to_regclass('public.exam_attempt_checkpoints') AND attname='version' AND NOT attisdropped)
        AND EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid=to_regclass('public.exam_payment_requests') AND attname='deleted_at' AND NOT attisdropped)
        AND EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid=to_regclass('public.exam_students') AND attname='status' AND NOT attisdropped) AS required_columns,
      EXISTS(SELECT 1 FROM pg_index i WHERE i.indexrelid=to_regclass('public.exam_one_free_attempt_per_user_type')
        AND i.indrelid=to_regclass('public.exam_attempts') AND i.indisunique AND i.indisvalid AND i.indisready
        AND i.indnkeyatts=2 AND pg_get_indexdef(i.indexrelid,1,true)='user_id' AND pg_get_indexdef(i.indexrelid,2,true)='exam_type'
        AND pg_get_expr(i.indpred,i.indrelid)='(access_mode = ''free''::text)')
        AND to_regclass('public.exam_one_free_attempt_per_user') IS NULL AS quota_index`;
    const checks={
      databaseMatches:r?.database_name===actual.database,
      sdkRoleMatches:r?.effective_role===actual.role&&r?.session_role===actual.role,
      expectedWriteRoleMatches:typeof r?.effective_role==='string'&&match(roleHash(r.effective_role),expected.r),
      writableSession:r?.writable_session===true,nonSuperuser:r?.non_superuser===true,
      schemaAccess:r?.schema_access===true,attemptsAccess:r?.attempts_access===true,
      checkpointAccess:r?.checkpoint_access===true,eligibilityHistoryRead:r?.eligibility_history_read===true,
      coachAccess:r?.coach_access===true,sequenceAccess:r?.sequence_access===true,
      noUnexpectedRls:r?.no_unexpected_rls===true,requiredColumns:r?.required_columns===true,
      quotaIndex:r?.quota_index===true,
    };
    const ready=Object.values(checks).every(Boolean);
    return reply(ready?200:503,{status:ready?'verified':'blocked',endpointMatch:true,deployMatch:true,selectExecuted:true,checks,roleCapabilities:{bypassRls:r?.bypass_rls===true,createRole:r?.can_create_role===true}});
  }catch{return reply(503,{status:'blocked',detail:'Diagnostic failed safely'})}
}
export default (req:Request,context:Context)=>runDiagnostic(req,context,{getConnectionString,getDatabase});
