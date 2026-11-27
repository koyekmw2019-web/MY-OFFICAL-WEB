/** TEMPORARY FIX13 QA ONLY — never merge. Scoped reversible fixtures for one verified synthetic QA member. */
import { createHash,timingSafeEqual } from 'node:crypto';
import { getConnectionString,getDatabase } from '@netlify/database';
import { getUser } from '@netlify/identity';
import type { Context } from '@netlify/functions';
const C=Object.freeze({origin:'https://qa-v7-91-2-dashboard-simplification--yekun-ordinary-second-qa.netlify.app',path:'/.netlify/functions/qa-role-fixture-fix13',site:'56d19e67-cc2c-4bfe-802e-ce3c198494a3',team:'6b00669b8ca1a2a210030417',subject:'a2b62ac64bdedd05b7270022743cc0a47934bfb025d3203bd3537e0011daa39e',proof:'6cc4420d985f0bedb10e3e32296d412dd5db040443575ec20114d1ddb8e03fa2',expires:Date.parse('2026-11-27T10:15:07.346080+00:00'),studentId:-537836568,paidId:-537836569,code:'YKOC-QA-FIX13-537836568',name:'SYNTHETIC QA FIX13'});
const H={'Cache-Control':'private, no-store, max-age=0','Pragma':'no-cache','Referrer-Policy':'same-origin','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','X-Robots-Tag':'noindex, nofollow, noarchive','Content-Security-Policy':"default-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"};
const hash=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const eq=(a:string,b:string)=>/^[a-f0-9]{64}$/.test(a)&&/^[a-f0-9]{64}$/.test(b)&&timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex'));
const reply=(status:number,v:object)=>Response.json(v,{status,headers:H});
export function fingerprint(raw:string){
 const u=new URL(raw);if(!['postgres:','postgresql:'].includes(u.protocol)||u.hash||!/^\/[^/]+$/.test(u.pathname))throw Error('blocked');
 const host=u.hostname.toLowerCase().split('.');host[0]=host[0].replace(/-pooler$/,'');
 const database=decodeURIComponent(u.pathname.slice(1)),role=decodeURIComponent(u.username);
 if(!database||!role||host.length<2)throw Error('blocked');
 return {database,role,endpoint:hash(JSON.stringify(['YKOC-QA-DB-ENDPOINT-v2',host.join('.'),u.port||'5432',database])),roleHash:hash(JSON.stringify(['YKOC-QA-DB-ROLE-v1',role]))};
}
const PAGE='<!doctype html><html lang="en"><meta charset="utf-8"><title>FIX13 isolated QA fixture</title><h1>FIX13 isolated QA fixture</h1><p>Temporary, one approved QA test member only. No production or payments.</p><form method="post" autocomplete="off"><p><label>Operation <select name="action"><option value="preflight">Verify read-only readiness</option><option value="student">Add synthetic student</option><option value="paid">Add synthetic paid entitlement</option><option value="clear">Remove only these synthetic fixtures</option></select></label></p><p><label>Operator proof <input name="proof" type="password" required autocomplete="off"></label></p><p><label>Exact deploy ID <input name="deploy" required autocomplete="off"></label></p><p><label>Expected endpoint fingerprint <input name="endpoint" type="password" autocomplete="off"></label></p><p><label>Expected role fingerprint <input name="role" type="password" autocomplete="off"></label></p><button type="submit">Run scoped operation</button></form></html>';
type Deps={getUser:()=>Promise<any>;getConnectionString:()=>string;getDatabase:()=>any;now:()=>number};
export async function run(req:Request,context:Context,deps:Deps){
 try{
  const url=new URL(req.url);
  if(deps.now()>=C.expires||url.origin!==C.origin||url.pathname!==C.path||url.search||context.site?.id!==C.site||context.account?.id!==C.team||context.deploy?.context!=='branch-deploy'||!context.user?.id)return reply(404,{status:'blocked'});
  const u=await deps.getUser();
  if(!u?.id||!eq(hash('YKOC-FIX13-QA-SUBJECT-v1:'+u.id),C.subject))return reply(403,{status:'blocked'});
  if(req.method==='GET')return new Response(PAGE,{headers:{...H,'Content-Type':'text/html; charset=utf-8'}});
  if(req.method!=='POST'||req.headers.get('origin')!==C.origin||req.headers.get('content-type')?.split(';')[0]!=='application/x-www-form-urlencoded')return reply(403,{status:'blocked'});
  const len=Number(req.headers.get('content-length'));if(len>1024)return reply(400,{status:'blocked'});
  const reader=req.body?.getReader();if(!reader)return reply(400,{status:'blocked'});
  const chunks:Uint8Array[]=[];let bytes=0;
  try{for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>1024){await reader.cancel();return reply(400,{status:'blocked'})}chunks.push(value)}}finally{reader.releaseLock()}
  const p=new URLSearchParams(Buffer.concat(chunks).toString('utf8')),action=p.get('action')||'',proof=p.get('proof')||'',deploy=p.get('deploy')||'',endpoint=p.get('endpoint')||'',role=p.get('role')||'';
  if([...p].length!==5||!['preflight','student','paid','clear'].includes(action)||!/^[a-f0-9]{64}$/.test(proof)||!eq(hash(proof),C.proof)||deploy!==context.deploy.id)return reply(403,{status:'blocked'});
  if(action!=='preflight'&&action!=='clear'&&((u.roles||[]).length>0))return reply(409,{status:'blocked',reason:'not-ordinary-member'});
  const expected=fingerprint(deps.getConnectionString()),db=deps.getDatabase(),meta=fingerprint(db.connectionString);
  if(!eq(expected.endpoint,meta.endpoint)||expected.role!==meta.role)return reply(409,{status:'blocked',reason:'binding-mismatch'});
  if(action!=='preflight'&&(!eq(meta.endpoint,endpoint)||!eq(meta.roleHash,role)))return reply(409,{status:'blocked',reason:'fingerprint-mismatch'});
  const [check]=await db.sql`SELECT current_database() AS db,current_user AS role,session_user AS session_role,
    current_setting('transaction_read_only')='off' AS writable,
    EXISTS(SELECT 1 FROM pg_roles WHERE rolname=current_user AND NOT rolsuper) AS non_super,
    has_table_privilege('public.exam_students','SELECT') AND has_table_privilege('public.exam_students','INSERT') AND has_table_privilege('public.exam_students','DELETE') AND has_table_privilege('public.exam_paid_access','SELECT') AND has_table_privilege('public.exam_paid_access','INSERT') AND has_table_privilege('public.exam_paid_access','DELETE') AS permissions,
    NOT EXISTS(SELECT 1 FROM pg_class WHERE oid IN ('public.exam_students'::regclass,'public.exam_paid_access'::regclass) AND relrowsecurity) AS no_rls`;
  if(check?.db!==meta.database||check.role!==meta.role||check.session_role!==meta.role||check.writable!==true||check.non_super!==true||check.permissions!==true||check.no_rls!==true)return reply(409,{status:'blocked',reason:'runtime-check'});
  const state=async()=>{
    const [s]=await db.sql`SELECT
      (SELECT count(*)::int FROM exam_students WHERE linked_user_id=${u.id}) AS students,
      (SELECT count(*)::int FROM exam_paid_access WHERE user_id=${u.id}) AS paid,
      (SELECT count(*)::int FROM exam_students WHERE id=${C.studentId} AND student_code=${C.code} AND name=${C.name} AND linked_user_id=${u.id}) AS fixture_student,
      (SELECT count(*)::int FROM exam_paid_access WHERE id=${C.paidId} AND user_id=${u.id} AND payment_request_id IS NULL) AS fixture_paid,
      (SELECT count(*)::int FROM exam_students WHERE id=${C.studentId} OR student_code=${C.code}) AS student_key,
      (SELECT count(*)::int FROM exam_paid_access WHERE id=${C.paidId}) AS paid_key,
      (SELECT count(*)::int FROM exam_attempts WHERE user_id=${u.id}) AS attempts,
      (SELECT count(*)::int FROM exam_payment_requests WHERE user_id=${u.id}) AS payment_requests`;
    return s;
  };
  const before=await state();
  const safe=before.students===before.fixture_student&&before.paid===before.fixture_paid&&before.student_key===before.fixture_student&&before.paid_key===before.fixture_paid;
  if(!safe)return reply(409,{status:'blocked',reason:'unrelated-data-present'});
  if(action==='preflight')return reply(200,{status:'verified',endpointFingerprint:meta.endpoint,roleFingerprint:meta.roleHash,ordinaryMember:!(u.roles||[]).length,state:before});
  if(action==='student'||action==='paid'){
   if(before.students!==0||before.paid!==0)return reply(409,{status:'blocked',reason:'clear-fixture-first'});
   if(action==='student'){
    const rows=await db.sql`INSERT INTO exam_students(id,student_code,name,class_name,class_start,expire_date,verification_code_hash,linked_user_id,status)
      SELECT ${C.studentId},${C.code},${C.name},'TRUCK',CURRENT_DATE-1,CURRENT_DATE+2,${hash('not-a-verification-code:'+C.proof)},${u.id},'active'
      WHERE NOT EXISTS(SELECT 1 FROM exam_students WHERE linked_user_id=${u.id} OR id=${C.studentId} OR student_code=${C.code})
      AND NOT EXISTS(SELECT 1 FROM exam_paid_access WHERE user_id=${u.id} OR id=${C.paidId}) RETURNING id`;
    if(rows.length!==1)return reply(409,{status:'blocked',reason:'insert-guard'});
   }else{
    const rows=await db.sql`INSERT INTO exam_paid_access(id,user_id,payment_request_id,starts_at,expires_at)
      SELECT ${C.paidId},${u.id},NULL,NOW()-INTERVAL '1 minute',NOW()+INTERVAL '2 hours'
      WHERE NOT EXISTS(SELECT 1 FROM exam_students WHERE linked_user_id=${u.id} OR id=${C.studentId} OR student_code=${C.code})
      AND NOT EXISTS(SELECT 1 FROM exam_paid_access WHERE user_id=${u.id} OR id=${C.paidId}) RETURNING id`;
    if(rows.length!==1)return reply(409,{status:'blocked',reason:'insert-guard'});
   }
  }else{
   await db.sql`WITH student_removed AS (
    DELETE FROM exam_students WHERE id=${C.studentId} AND student_code=${C.code} AND name=${C.name} AND linked_user_id=${u.id} RETURNING id
   ),paid_removed AS (
    DELETE FROM exam_paid_access WHERE id=${C.paidId} AND user_id=${u.id} AND payment_request_id IS NULL RETURNING id
   ) SELECT (SELECT count(*)::int FROM student_removed) AS students,(SELECT count(*)::int FROM paid_removed) AS paid`;
  }
  const after=await state(),ok=after.attempts===before.attempts&&after.payment_requests===before.payment_requests&&after.students===(action==='student'?1:0)&&after.fixture_student===after.students&&after.paid===(action==='paid'?1:0)&&after.fixture_paid===after.paid;
  return reply(ok?200:503,{status:ok?'verified':'blocked',operation:action,state:after});
 }catch{return reply(503,{status:'blocked',reason:'safe-failure'})}
}
export default (req:Request,context:Context)=>run(req,context,{getUser,getConnectionString,getDatabase,now:Date.now});

