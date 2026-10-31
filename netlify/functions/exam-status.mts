import { getDatabase } from "@netlify/database";
import { requireUser, asResponse } from "./_shared/auth.mts";

export default async (req: Request) => {
  try {
    if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
    const user = await requireUser();
    const db = getDatabase();
    const students = await db.sql<any>`SELECT student_code,name,class_name,class_start,expire_date FROM exam_students WHERE linked_user_id=${user.id} AND status='active' AND CURRENT_DATE BETWEEN class_start AND expire_date LIMIT 1`;
    const linkedStudents = await db.sql<any>`SELECT student_code,name,class_name,class_start,expire_date,status, CASE WHEN LOWER(COALESCE(status,'active')) <> 'active' THEN 'inactive' WHEN CURRENT_DATE < class_start THEN 'scheduled' WHEN CURRENT_DATE > expire_date THEN 'expired' ELSE 'active' END AS access_state FROM exam_students WHERE linked_user_id=${user.id} ORDER BY updated_at DESC LIMIT 1`;
    const paid = await db.sql<any>`SELECT starts_at,expires_at FROM exam_paid_access WHERE user_id=${user.id} AND starts_at<=NOW() AND expires_at>NOW() ORDER BY expires_at DESC LIMIT 1`;
    const pendingPayments = await db.sql<any>`SELECT id,plan_code,submitted_at FROM exam_payment_requests WHERE user_id=${user.id} AND status='pending' AND deleted_at IS NULL ORDER BY submitted_at DESC LIMIT 1`;
    const free = await db.sql<any>`SELECT id,exam_type,started_at,status FROM exam_attempts WHERE user_id=${user.id} AND access_mode='free' LIMIT 1`;
    return Response.json({
      authenticated: true,
      email: user.email ?? "",
      roles: user.roles ?? [],
      student: students[0] ?? null,
      linkedStudent: linkedStudents[0] ?? null,
      paid: paid[0] ?? null,
      pendingPayment: pendingPayments[0] ?? null,
      freeUsed: !!free.length,
      freeAttempt: free[0] ?? null
    });
  } catch (e) { return asResponse(e); }
};
