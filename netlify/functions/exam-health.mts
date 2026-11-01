import { getDatabase } from '@netlify/database';
import { requireAdmin, asResponse } from './_shared/auth.mts';

/** Admin only. Only schema readiness is reported; no customer data returned. */
export default async(req:Request)=>{
 try {
  if(req.method!=='GET')return new Response('Method not allowed',{status:405});
  await requireAdmin();
  const db=getDatabase();
  const checks:Record<string,boolean>={};
  const tables=['exam_attempts','exam_attempt_checkpoints','exam_students','exam_paid_access','exam_payment_requests','yk_learning_mistakes'];
  const indices=['exam_one_free_attempt_per_user_type','exam_attempts_user_status_idx','exam_checkpoint_user_phase_idx'];
  for(const name of tables){const [r]=await db.sql<any>`SELECT to_regclass(${`public.${name}`}) IS NOT NULL AS exists`;checks[`table:${name}`]=r?.exists===true}
  for(const name of indices){const [r]=await db.sql<any>`SELECT to_regclass(${`public.${name}`}) IS NOT NULL AS exists`;checks[`index:${name}`]=r?.exists===true}
  const [oldIndex]=await db.sql<any>`SELECT to_regclass('public.exam_one_free_attempt_per_user') IS NULL AS absent`;
  checks['index:legacy_global_free_quota_removed']=oldIndex?.absent===true;
  const [col]=await db.sql<any>`SELECT EXISTS(SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='exam_attempts' AND column_name='score_verified') AS exists`;
  checks['column:score_verified']=col?.exists===true;
  const [mode]=await db.sql<any>`SELECT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='exam_attempts_access_mode_check') AS exists`;
  checks['constraint:exam_attempts_access_mode_check']=mode?.exists===true;
  const ready=Object.values(checks).every(Boolean);
  return Response.json({ready,checks,policy:'ONE_PER_EXAM_TYPE',scoreVerification:'SERVER_RECALCULATED_PRACTICE'}, {status:ready?200:503});
 }catch(e){return asResponse(e)}
};
