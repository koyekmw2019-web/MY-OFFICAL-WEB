// FIX06-C-PREFLIGHT — temporary QA-only, read-only catalog diagnostic.
// No data rows, SQL supplied by visitors, DDL, DML, scheduled tasks or logging.
import { timingSafeEqual } from 'node:crypto';
import { QA, endpointParts, endpointFingerprint } from './qa-db-fingerprint-v7902.mjs';

export const PATH = '/.netlify/functions/qa-db-runtime-preflight';
const DIGEST = /^[a-f0-9]{64}$/;
const MAX_BODY = 160;
const HEADERS = Object.freeze({
  'Cache-Control': 'private, no-store, max-age=0', Pragma: 'no-cache',
  'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY', 'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Content-Security-Policy': "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
});
const response = (status, body) => Response.json(body, {status, headers: HEADERS});
const blocked = () => response(404, {status:'blocked'});
const unavailable = () => response(503, {status:'unverified'});
const FORM = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>YKOC QA runtime preflight</title><h1>Private QA database runtime preflight</h1><p>QA team and application admin only. Use a FIX04 v2 expected fingerprint independently derived from the verified QA dashboard database endpoint, not the runtime response. Never paste a URL, password or role here. This checks metadata only; no application rows are read or changed.</p><form method="post" autocomplete="off"><label>Expected QA fingerprint <input name="fingerprint" type="password" required minlength="64" maxlength="64" pattern="[a-f0-9]{64}" autocomplete="off" spellcheck="false"></label><label>Stage <select name="stage"><option value="before">Before candidate migration</option><option value="after">After candidate migration</option></select></label><button type="submit">Run read-only preflight</button></form><p>Passing does not authorize migration or prove writes. Remove diagnostic before release.</p></html>`;

async function parseExpected(req) {
  if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/x-www-form-urlencoded') return null;
  const declared = req.headers.get('content-length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared)>MAX_BODY)) return null;
  const reader = req.body?.getReader();
  if (!reader) return null;
  let size=0; const chunks=[];
  try {
    while (true) {
      const {done,value}=await reader.read();
      if (done) break;
      size+=value.byteLength;
      if (size>MAX_BODY) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const fields=[...new URLSearchParams(Buffer.concat(chunks).toString('utf8'))];
    if (fields.length!==2) return null;
    const fingerprint=fields.find(([k])=>k==='fingerprint')?.[1];
    const stage=fields.find(([k])=>k==='stage')?.[1];
    return DIGEST.test(fingerprint??'') && ['before','after'].includes(stage) ? {fingerprint,stage} : null;
  } finally { reader.releaseLock(); }
}

// Identity values remain inside this function (never returned, logged or used in SQL text).
export const IDENTITY_SQL = `SELECT current_database()::text AS database_name,
 current_user::text AS effective_role, session_user::text AS login_role,
 current_setting('transaction_read_only')='on' AS read_only,
 current_setting('default_transaction_read_only')='off' AND NOT pg_is_in_recovery() AS writable_server,
 COALESCE((SELECT rolcanlogin AND NOT rolsuper AND NOT rolcreaterole AND NOT rolcreatedb
    AND NOT rolreplication AND NOT rolbypassrls FROM pg_catalog.pg_roles WHERE rolname=current_user),false) AS role_safe,
 has_database_privilege(current_database(),'CONNECT') AS database_connect,
 has_schema_privilege('public','USAGE') AS schema_usage`;

// No SELECT from student, payment, YKCR or rate tables. All object inspection is pg_catalog.
export const BASE_SQL = `WITH s AS (SELECT to_regclass('public.exam_students') AS oid),
 expected(col,typ) AS (VALUES ('id','bigint'),('student_code','text'),('name','text'),
 ('class_name','text'),('class_start','date'),('expire_date','date'),('verification_code_hash','text'),
 ('linked_user_id','text'),('linked_email','text'),('status','text'),('updated_at','timestamp with time zone')),
 uniq(col) AS (VALUES ('id'),('student_code'),('linked_user_id'))
 SELECT
 EXISTS(SELECT 1 FROM pg_catalog.pg_class c WHERE c.oid=s.oid AND c.relkind='r') AS student_table,
 COALESCE(to_regclass('exam_students')=s.oid,false) AS student_resolution,
 NOT EXISTS(SELECT 1 FROM expected e WHERE NOT EXISTS (
   SELECT 1 FROM pg_catalog.pg_attribute a WHERE a.attrelid=s.oid AND a.attnum>0
    AND NOT a.attisdropped AND a.attname=e.col AND format_type(a.atttypid,a.atttypmod)=e.typ)) AS student_columns,
 NOT EXISTS(SELECT 1 FROM uniq u WHERE NOT EXISTS (
   SELECT 1 FROM pg_catalog.pg_constraint c JOIN pg_catalog.pg_attribute a ON a.attrelid=c.conrelid AND a.attname=u.col
   JOIN pg_catalog.pg_index i ON i.indexrelid=c.conindid
   WHERE c.conrelid=s.oid AND c.contype=CASE WHEN u.col='id' THEN 'p'::"char" ELSE 'u'::"char" END
    AND c.convalidated AND NOT c.condeferrable AND c.conkey=ARRAY[a.attnum] AND i.indisvalid AND i.indisready
    AND (u.col<>'linked_user_id' OR c.conname='exam_students_linked_user_id_key'))) AS student_unique,
 COALESCE(has_table_privilege(s.oid,'SELECT') AND has_table_privilege(s.oid,'INSERT')
    AND has_table_privilege(s.oid,'UPDATE'),false) AS student_acl,
 CASE WHEN EXISTS(SELECT 1 FROM pg_catalog.pg_class c WHERE c.oid=s.oid AND c.relkind='r')
    AND EXISTS(SELECT 1 FROM pg_catalog.pg_attribute a WHERE a.attrelid=s.oid AND a.attname='id' AND NOT a.attisdropped)
    THEN COALESCE(has_sequence_privilege(pg_get_serial_sequence('public.exam_students','id'),'USAGE'),false)
    ELSE false END AS student_sequence,
 EXISTS(SELECT 1 FROM pg_catalog.pg_class c WHERE c.oid=s.oid AND NOT c.relrowsecurity AND NOT c.relforcerowsecurity) AS student_no_rls,
 NOT EXISTS(SELECT 1 FROM pg_catalog.pg_trigger t WHERE t.tgrelid=s.oid AND NOT t.tgisinternal AND t.tgenabled<>'D') AS student_no_user_triggers,
 (to_regclass('public.exam_student_verification_failures') IS NULL
    AND to_regtype('public.exam_student_verification_failures') IS NULL
    AND to_regclass('public.exam_student_verification_failures_pkey') IS NULL
    AND to_regclass('public.exam_student_verification_failures_id_seq') IS NULL
    AND to_regclass('public.exam_student_verification_failures_account_time_idx') IS NULL
    AND to_regclass('public.exam_student_verification_failures_retention_idx') IS NULL) AS candidate_absent
 FROM s`;

// A second, post-migration-only stage, stricter than the earlier FIX06-C index/ACL probe.
// UPDATE is required by the existing SELECT FOR UPDATE SKIP LOCKED cleanup path.
export const RATE_SQL = `WITH t AS (SELECT to_regclass('public.exam_student_verification_failures') AS oid)
 SELECT
 EXISTS(SELECT 1 FROM pg_catalog.pg_class c WHERE c.oid=t.oid AND c.relkind='r') AS rate_table,
 (SELECT count(*)=4 AND count(*) FILTER(WHERE a.attnotnull AND
  ((a.attname='id' AND a.atttypid='bigint'::regtype AND a.attidentity='a') OR
   (a.attname IN ('account_key','pair_key') AND a.atttypid='text'::regtype) OR
   (a.attname='recorded_at' AND a.atttypid='timestamptz'::regtype)))=4
  FROM pg_catalog.pg_attribute a WHERE a.attrelid=t.oid AND a.attnum>0 AND NOT a.attisdropped) AS rate_columns,
 EXISTS(SELECT 1 FROM pg_catalog.pg_constraint c JOIN pg_catalog.pg_attribute a ON a.attrelid=t.oid AND a.attname='id'
    JOIN pg_catalog.pg_index i ON i.indexrelid=c.conindid
    WHERE c.conrelid=t.oid AND c.contype='p' AND c.convalidated AND NOT c.condeferrable AND c.conkey=ARRAY[a.attnum]
    AND i.indisvalid AND i.indisready) AS rate_pk,
 (SELECT count(*)=2 AND count(DISTINCT a.attname)=2 FROM pg_catalog.pg_constraint c JOIN pg_catalog.pg_attribute a ON a.attrelid=t.oid AND a.attname IN ('account_key','pair_key')
    WHERE c.conrelid=t.oid AND c.contype='c' AND c.convalidated AND c.conkey=ARRAY[a.attnum]
    AND pg_get_expr(c.conbin,c.conrelid)=format('(%I ~ %L::text)',a.attname,'^[0-9a-f]{64}$')) AS rate_digest_constraints,
 EXISTS(SELECT 1 FROM pg_catalog.pg_index i JOIN pg_catalog.pg_class c ON c.oid=i.indexrelid JOIN pg_catalog.pg_am am ON am.oid=c.relam
    WHERE i.indrelid=t.oid AND c.relname='exam_student_verification_failures_account_time_idx' AND am.amname='btree'
    AND i.indisvalid AND i.indisready AND i.indpred IS NULL AND i.indexprs IS NULL AND i.indnatts=3
    AND pg_get_indexdef(i.indexrelid,1,true)='account_key' AND pg_get_indexdef(i.indexrelid,2,true)='recorded_at'
    AND pg_get_indexdef(i.indexrelid,3,true)='id') AS rate_account_index,
 EXISTS(SELECT 1 FROM pg_catalog.pg_index i JOIN pg_catalog.pg_class c ON c.oid=i.indexrelid JOIN pg_catalog.pg_am am ON am.oid=c.relam
    WHERE i.indrelid=t.oid AND c.relname='exam_student_verification_failures_retention_idx' AND am.amname='btree'
    AND i.indisvalid AND i.indisready AND i.indpred IS NULL AND i.indexprs IS NULL AND i.indnatts=2
    AND pg_get_indexdef(i.indexrelid,1,true)='recorded_at' AND pg_get_indexdef(i.indexrelid,2,true)='id') AS rate_retention_index,
 COALESCE(has_table_privilege(t.oid,'SELECT') AND has_table_privilege(t.oid,'INSERT')
    AND has_table_privilege(t.oid,'DELETE') AND has_table_privilege(t.oid,'UPDATE'),false) AS rate_acl,
 CASE WHEN EXISTS(SELECT 1 FROM pg_catalog.pg_class c WHERE c.oid=t.oid AND c.relkind='r')
    AND EXISTS(SELECT 1 FROM pg_catalog.pg_attribute a WHERE a.attrelid=t.oid AND a.attname='id' AND NOT a.attisdropped)
    THEN COALESCE(has_sequence_privilege(pg_get_serial_sequence('public.exam_student_verification_failures','id'),'USAGE'),false)
    ELSE false END AS rate_sequence,
 EXISTS(SELECT 1 FROM pg_catalog.pg_class c WHERE c.oid=t.oid AND NOT c.relrowsecurity AND NOT c.relforcerowsecurity) AS rate_no_rls,
 NOT EXISTS(SELECT 1 FROM pg_catalog.pg_trigger tr WHERE tr.tgrelid=t.oid AND NOT tr.tgisinternal AND tr.tgenabled<>'D') AS rate_no_user_triggers
 FROM t`;

export const BASE_KEYS=Object.freeze(['student_table','student_resolution','student_columns','student_unique','student_acl','student_sequence','student_no_rls','student_no_user_triggers','candidate_absent']);
export const RATE_KEYS=Object.freeze(['rate_table','rate_columns','rate_pk','rate_digest_constraints','rate_account_index','rate_retention_index','rate_acl','rate_sequence','rate_no_rls','rate_no_user_triggers']);
function onlyRow(result) {
  if (!Array.isArray(result?.rows)||result.rows.length!==1||!result.rows[0]||typeof result.rows[0]!=='object') throw Error('Invalid metadata response');
  return result.rows[0];
}
function strictFlags(row,keys) { return Object.fromEntries(keys.map(k=>[k,row[k]===true])); }

// Use the exact default SDK path used by existing handlers. v2.0.1 exposes connectionString.
// Compare it to the independently verified URL again BEFORE pool.connect().
export async function runCatalog(getDatabase,connectionString,parts,role,stage) {
  const db=getDatabase();
  const pool=db.pool;
  let client,begun=false,discard=false;
  try {
    if (db.connectionString!==connectionString) throw Error('Runtime binding changed');
    client=await pool.connect();
    const begin=await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    begun=true;
    if (begin.command!=='BEGIN') throw Error('Unconfirmed read-only transaction');
    await client.query("SET LOCAL lock_timeout = '2000ms'");
    await client.query("SET LOCAL statement_timeout = '5000ms'");
    await client.query("SET LOCAL idle_in_transaction_session_timeout = '10000ms'");
    const identity=onlyRow(await client.query(IDENTITY_SQL));
    const checks={
      database_match:identity.database_name===parts.database,
      role_match:identity.effective_role===role&&identity.login_role===role,
      ...strictFlags(identity,['read_only','writable_server','role_safe','database_connect','schema_usage'])
    };
    let passed=Object.values(checks).every(Boolean);
    if (passed) {
      Object.assign(checks,strictFlags(onlyRow(await client.query(BASE_SQL)),BASE_KEYS));
      passed=BASE_KEYS.filter(k=>k!=='candidate_absent').every(k=>checks[k]);
      if (stage==='before') passed=passed&&checks.candidate_absent;
      else if (passed&&!checks.candidate_absent) {
        Object.assign(checks,strictFlags(onlyRow(await client.query(RATE_SQL)),RATE_KEYS));
        passed=RATE_KEYS.every(k=>checks[k]);
      } else passed=false;
    }
    const rollback=await client.query('ROLLBACK');
    if (rollback.command!=='ROLLBACK') throw Error('Unconfirmed rollback');
    begun=false;
    return {passed,checks};
  } catch {
    discard=true;
    if (begun&&client) { try {await client.query('ROLLBACK');} catch {/* discard */} }
    throw Error('Catalog verification unavailable');
  } finally {
    // New default SDK pool per call. No database pool remains open on success or failure.
    try {if(client) client.release(discard);} finally {await pool.end();}
  }
}

export function makeRuntimePreflight({getConnectionString,getDatabase,requireAdmin,env}) {
  return async (req,context)=>{
    try {
      const url=new URL(req.url);
      if (url.origin!==QA.origin||url.pathname!==PATH||url.search||url.hash||
          context?.site?.id!==QA.site||context?.account?.id!==QA.team||env?.SITE_ID!==QA.site||
          context?.deploy?.context!=='production'||context?.deploy?.published!==true) return blocked();
      if (!context?.user?.id) return response(403,{status:'blocked'});
      if (!['GET','POST'].includes(req.method)) return response(405,{status:'blocked'});
      if (req.method==='POST'&&req.headers.get('origin')!==QA.origin) return response(403,{status:'blocked'});
      // Exact existing Admin guard on both supported base SHAs; never trust visitor role headers.
      try { const admin=await requireAdmin(); if (!admin?.id) return response(401,{status:'blocked'}); }
      catch(e){return e instanceof Response&&[401,403].includes(e.status)?response(e.status,{status:'blocked'}):unavailable();}
      if (req.method==='GET') return new Response(FORM,{headers:{...HEADERS,'Referrer-Policy':'same-origin','Content-Type':'text/html; charset=utf-8'}});
      const expected=await parseExpected(req);
      if (!expected) return response(400,{status:'invalid_request'});
      if (env?.YKOC_QA_STUDENT_RATE_CLEANUP==='enabled-v1') return response(409,{status:'cleanup_flag_enabled'});
      const raw=await getConnectionString();
      const parts=endpointParts(raw);
      if (!timingSafeEqual(Buffer.from(endpointFingerprint(parts),'hex'),Buffer.from(expected.fingerprint,'hex')))
        return response(409,{status:'endpoint_mismatch',endpointMatch:false,catalogChecked:false});
      const role=decodeURIComponent(new URL(raw.trim()).username);
      if (!role||role.length>128||/[\x00-\x1f\x7f]/.test(role)) return unavailable();
      const report=await runCatalog(getDatabase,raw,parts,role,expected.stage);
      return response(report.passed?200:503,{
        status:report.passed?'catalog_checks_passed':'catalog_checks_failed',
        stage:expected.stage,endpointMatch:true,catalogChecked:true,
        checks:report.checks,writeProven:false,migrationAuthorized:false
      });
    } catch {return unavailable();}
  };
}
