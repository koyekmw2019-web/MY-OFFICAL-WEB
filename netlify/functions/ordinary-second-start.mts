import { getDatabase } from '@netlify/database';
import { requireUser, asResponse } from './_shared/auth.mts';
import { generateManifest,readManifest,publicQuestions,EXAM_TYPE } from './_shared/ordinary-second-engine.mts';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export default async (req:Request)=>{
  try{
    if(req.method!=='POST')return json({error:'method_not_allowed'},405);
    const user=await requireUser();
    const body=await req.json();
    const id=Number(body?.attemptId);
    if(!Number.isSafeInteger(id)||id<=0)return json({error:'invalid_attempt'},400);
    const db=getDatabase();
    const client=await db.pool.connect();
    let manifest:any,startedAt:any;
    try{
      await client.query('BEGIN');
      const {rows}=await client.query(
        'SELECT id,exam_type,status,started_at FROM exam_attempts WHERE id=$1 AND user_id=$2 FOR UPDATE',
        [id,user.id]);
      const attempt=rows[0];
      if(!attempt||attempt.exam_type!==EXAM_TYPE)throw new Response('Not found',{status:404});
      if(attempt.status!=='started')throw new Response('Attempt not active',{status:409});
      startedAt=attempt.started_at;
      if(Date.now()>new Date(startedAt).getTime()+50*60000+60000)
        throw new Response('Attempt expired',{status:409});
      let result=await client.query(
        'SELECT bank_version,question_ids,illustration_ids,statement_orders FROM exam_attempt_question_sets WHERE attempt_id=$1',
        [id]);
      if(!result.rows.length){
        const generated=generateManifest();
        await client.query('INSERT INTO exam_attempt_question_sets(attempt_id,bank_version,question_ids,illustration_ids,statement_orders) VALUES ($1,$2,$3::jsonb,$4::jsonb,$5::jsonb)',
          [id,generated.bankVersion,JSON.stringify(generated.questionIds),
           JSON.stringify(generated.illustrationIds),JSON.stringify(generated.statementOrders)]);
        result=await client.query(
          'SELECT bank_version,question_ids,illustration_ids,statement_orders FROM exam_attempt_question_sets WHERE attempt_id=$1',
          [id]);
      }
      manifest=readManifest(result.rows[0]);
      await client.query('COMMIT');
    }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
    return json({ok:true,attemptId:id,endsAt:new Date(new Date(startedAt).getTime()+50*60000).toISOString(),
      ...publicQuestions(manifest)});
  }catch(e){return e instanceof Response?e:asResponse(e)}
};
