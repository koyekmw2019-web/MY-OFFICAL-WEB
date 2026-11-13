import { getDatabase } from '@netlify/database';
import { requireUser, asResponse } from './_shared/auth.mts';
import { nishuAnswers } from './_shared/nishu-key-v7881.mts';
/** Authorized, read-only review. Only a submitted SECOND-CLASS attempt is eligible. */
export default async (req: Request) => {
  try {
    if(req.method!=='GET')return new Response('Method not allowed',{status:405});
    const user=await requireUser();
    const id=Number(new URL(req.url).searchParams.get('attemptId'));
    if(!Number.isSafeInteger(id)||id<1)return Response.json({error:'Invalid attempt'}, {status:400});
    const db=getDatabase();
    const [attempt]=await db.sql<any>`SELECT id,score,passed,status FROM exam_attempts
      WHERE id=${id} AND user_id=${user.id} AND exam_type='nishu' LIMIT 1`;
    if(!attempt)return Response.json({error:'Attempt not found'}, {status:404});
    if(attempt.status!=='submitted')return Response.json({error:'Attempt not finished'}, {status:409});
    return Response.json({ok:true,score:attempt.score,passed:attempt.passed,
      text:nishuAnswers.text,visual:nishuAnswers.visual},
      {headers:{'Cache-Control':'private, no-store'}});
  }catch(e){return asResponse(e)}
};
