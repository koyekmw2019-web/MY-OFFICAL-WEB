import { getDatabase } from '@netlify/database';
import { requireUser,asResponse } from './_shared/auth.mts';
import {readManifest,gradeSecond,EXAM_TYPE} from './_shared/ordinary-second-engine.mts';
export default async(req:Request)=>{
 try{
  if(req.method!=='GET')return new Response('Method not allowed',{status:405});
  const user=await requireUser(),id=Number(new URL(req.url).searchParams.get('attemptId'));
  if(!Number.isSafeInteger(id)||id<=0)return Response.json({error:'invalid_attempt'},{status:400});
  const db=getDatabase();
  const {rows}=await db.pool.query(
    'SELECT a.id,a.exam_type,a.status,a.score,a.passed,c.snapshot,m.bank_version,m.question_ids,m.illustration_ids,m.statement_orders FROM exam_attempts a JOIN exam_attempt_question_sets m ON m.attempt_id=a.id LEFT JOIN exam_attempt_checkpoints c ON c.attempt_id=a.id AND c.user_id=a.user_id WHERE a.id=$1 AND a.user_id=$2',
    [id,user.id]);
  const a=rows[0];
  if(!a||a.exam_type!==EXAM_TYPE)return Response.json({error:'not_found'},{status:404});
  if(a.status!=='submitted')return Response.json({error:'not_submitted'},{status:409});
  if(!a.snapshot)return Response.json({error:'review_unavailable'},{status:409});
  const result=gradeSecond(a.snapshot,readManifest(a));
  return Response.json({ok:true,attemptId:id,score:a.score,passed:a.passed,max:100,
    wrong:result.wrong},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return asResponse(e);}
};
