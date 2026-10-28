import { getDatabase } from "@netlify/database";
import { requireUser, asResponse } from "./_shared/auth.mts";
import { EXAM_TYPES } from "./_shared/security.mts";

export default async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const user = await requireUser();
    const { examType } = await req.json();
    if (!EXAM_TYPES.has(examType)) return Response.json({ error: "Invalid exam type" }, { status: 400 });
    if (Array.isArray(user.roles) && user.roles.includes("admin")) {
      return Response.json({ allowed: true, mode: "admin", attemptId: null });
    }
    const db = getDatabase();
    const students = await db.sql<any>`SELECT 1 FROM exam_students WHERE linked_user_id=${user.id} AND status='active' AND CURRENT_DATE BETWEEN class_start AND expire_date LIMIT 1`;
    if (students.length) {
      const [attempt] = await db.sql<any>`INSERT INTO exam_attempts(user_id,exam_type,access_mode) VALUES(${user.id},${examType},'student') RETURNING id`;
      return Response.json({ allowed: true, mode: "student", attemptId: attempt.id });
    }
    const paid = await db.sql<any>`SELECT expires_at FROM exam_paid_access WHERE user_id=${user.id} AND starts_at<=NOW() AND expires_at>NOW() ORDER BY expires_at DESC LIMIT 1`;
    if (paid.length) {
      const [attempt] = await db.sql<any>`INSERT INTO exam_attempts(user_id,exam_type,access_mode) VALUES(${user.id},${examType},'paid') RETURNING id`;
      return Response.json({ allowed: true, mode: "paid", expiresAt: paid[0].expires_at, attemptId: attempt.id });
    }
    try {
      const [attempt] = await db.sql<any>`INSERT INTO exam_attempts(user_id,exam_type,access_mode) VALUES(${user.id},${examType},'free') RETURNING id`;
      return Response.json({ allowed: true, mode: "free", attemptId: attempt.id });
    } catch {
      return Response.json({ allowed: false, reason: "payment_required" }, { status: 402 });
    }
  } catch (e) { return asResponse(e); }
};
