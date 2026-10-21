import { getDatabase } from "@netlify/database";
import { requireUser, asResponse } from "./_shared/auth.mts";
import { verifyCode } from "./_shared/security.mts";

export default async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const user = await requireUser();
    const { studentCode, verificationCode } = await req.json();
    if (!studentCode || !verificationCode) return Response.json({ error: "Student ID and verification code are required" }, { status: 400 });
    const db = getDatabase();
    const rows = await db.sql<any>`SELECT * FROM exam_students WHERE student_code=${String(studentCode).trim()} LIMIT 1`;
    const student = rows[0];
    if (!student || !verifyCode(String(verificationCode), student.verification_code_hash)) return Response.json({ error: "Verification failed" }, { status: 403 });
    if (student.linked_user_id && student.linked_user_id !== user.id) return Response.json({ error: "This student record is already linked to another account" }, { status: 409 });
    await db.sql`UPDATE exam_students SET linked_user_id=${user.id}, linked_email=${user.email ?? ""}, updated_at=NOW() WHERE id=${student.id}`;
    return Response.json({ ok: true, student: { studentCode: student.student_code, name: student.name, className: student.class_name, classStart: student.class_start, expireDate: student.expire_date } });
  } catch (e) { return asResponse(e); }
};
