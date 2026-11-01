import { getDatabase } from "@netlify/database";
import { requireUser, asResponse } from "./_shared/auth.mts";
import { EXAM_TYPES } from "./_shared/security.mts";
import { abandonExpiredAttempts, isFreeUniqueViolation, isMissingCheckpointTable } from "./_shared/exam-autosave.mts";

export default async (req: Request) => {
 try {
  if (req.method !== 'POST') return new Response('Method not allowed',{status:405});
  const user=await requireUser();
  const {examType}=await req.json();
  if(!EXAM_TYPES.has(examType))return Response.json({error:'Invalid exam type'},{status:400});
  const db=getDatabase();
  // Degrade gracefully if a new migration has not yet run.
  let unfinished:any[]=[];
  try {
    await abandonExpiredAttempts(db,user.id);
    unfinished=await db.sql<any>`SELECT a.id,a.exam_type,a.access_mode,c.saved_at
      FROM exam_attempts a LEFT JOIN exam_attempt_checkpoints c ON c.attempt_id=a.id
      WHERE a.user_id=${user.id} AND a.status='started' AND (c.attempt_id IS NOT NULL OR a.access_mode='free')
      ORDER BY (c.attempt_id IS NOT NULL) DESC,a.started_at DESC LIMIT 1`;
  } catch(e) {
    if(!isMissingCheckpointTable(e))throw e;
    console.error('v7.63: checkpoints table absent; using legacy free-attempt lookup',e);
    unfinished=await db.sql<any>`SELECT id,exam_type,access_mode,NULL::timestamptz AS saved_at
      FROM exam_attempts WHERE user_id=${user.id} AND status='started' AND access_mode='free'
      ORDER BY started_at DESC LIMIT 1`;
    // Legacy query must not treat old expired attempts as resumable.
    if(unfinished.length) {
      const old=await db.sql<any>`UPDATE exam_attempts SET status='abandoned' WHERE id=${unfinished[0].id}
        AND user_id=${user.id} AND status='started' AND NOW() > started_at +
        (CASE exam_type WHEN 'jlpt_n1' THEN 110 WHEN 'jlpt_n2' THEN 105 WHEN 'jlpt_n3' THEN 30
         WHEN 'jlpt_n4' THEN 25 WHEN 'jlpt_n5' THEN 20 WHEN 'car' THEN 50
         WHEN 'motorcycle' THEN 50 WHEN 'moped' THEN 30 ELSE 80 END * INTERVAL '1 minute')
         + INTERVAL '60 seconds' RETURNING id`;
      if(old.length)unfinished=[];
    }
  }
  if(unfinished.length){
    const a=unfinished[0];
    if(a.exam_type!==examType){
      // Old non-checkpoint student/paid attempts may have been left behind by prior builds.
      // A free attempt is never bypassed; it must be resumed or closed.
      if(a.access_mode==='free'||a.saved_at)return Response.json({allowed:false,reason:'resume_other',resumeType:a.exam_type},{status:409});
    }else return Response.json({allowed:true,mode:a.access_mode,attemptId:a.id,resumed:true});
  }
  const isAdmin=Array.isArray(user.roles)&&user.roles.includes('admin');
  let mode:'admin'|'student'|'paid'|'free'='free';
  if(isAdmin) mode='admin';
  else {
    const students=await db.sql<any>`SELECT 1 FROM exam_students WHERE linked_user_id=${user.id} AND status='active' AND CURRENT_DATE BETWEEN class_start AND expire_date LIMIT 1`;
    if(students.length)mode='student';
    else {
      const paid=await db.sql<any>`SELECT 1 FROM exam_paid_access WHERE user_id=${user.id} AND starts_at<=NOW() AND expires_at>NOW() LIMIT 1`;
      if(paid.length)mode='paid';
    }
  }
  try {
    const [a]=await db.sql<any>`INSERT INTO exam_attempts(user_id,exam_type,access_mode) VALUES(${user.id},${examType},${mode}) RETURNING id`;
    return Response.json({allowed:true,mode,attemptId:a.id,resumed:false});
  } catch(e){
    // Free unique-index violation indicates a consumed attempt, not a generic crash.
    if(mode==='admin' && e?.code==='23514' && /exam_attempts_access_mode_check/.test(String(e?.constraint??e?.message??''))) {
      console.error('v7.63: missing admin access mode migration',e);
      return Response.json({error:'schema_out_of_date'},{status:503});
    }
    if(mode==='free' && isFreeUniqueViolation(e)){
      const active=await db.sql<any>`SELECT id,exam_type FROM exam_attempts WHERE user_id=${user.id} AND access_mode='free' AND status='started' AND exam_type=${examType} LIMIT 1`;
      if(active.length&&active[0].exam_type===examType)return Response.json({allowed:true,mode:'free',attemptId:active[0].id,resumed:true});
      return Response.json({allowed:false,reason:'payment_required'},{status:402});
    }
    console.error('v7.63 exam insert error',e);
    throw e;
  }
 } catch(e){return asResponse(e)}
};
