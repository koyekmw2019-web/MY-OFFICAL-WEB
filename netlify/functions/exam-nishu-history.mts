import { getDatabase } from '@netlify/database';
import { requireUser, asResponse } from './_shared/auth.mts';
/** Own submitted SECOND-CLASS practice results only. No other student data. */
export default async (req: Request) => {
  try {
    if (req.method !== 'GET') return new Response('Method not allowed', {status:405});
    const user = await requireUser();
    const db = getDatabase();
    const rows = await db.sql<any>`SELECT id,score,passed,score_verified,submitted_at
      FROM exam_attempts WHERE user_id=${user.id} AND exam_type='nishu' AND status='submitted'
      ORDER BY submitted_at DESC LIMIT 20`;
    return Response.json({ok:true,results:rows.map((row:any)=>({
      attemptId:row.id,
      score:row.score,
      passed:row.passed,
      verified:row.score_verified===true,
      submittedAt:row.submitted_at
    }))},{headers:{'Cache-Control':'private, no-store'}});
  } catch(e) {return asResponse(e)}
};
