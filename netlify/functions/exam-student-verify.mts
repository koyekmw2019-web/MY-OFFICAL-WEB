import { getDatabase } from "@netlify/database";
import { requireUser, asResponse } from "./_shared/auth.mts";
import { verifyCode } from "./_shared/security.mts";

/** v7.87.19: Verify the code, then claim the linked account atomically.
 * An unconditional UPDATE could allow a concurrent verification from another
 * account to overwrite the first account's link. No new student DB is used.
 */
export default async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const user = await requireUser();
    let input: any;
    try { input = await req.json(); }
    catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
    const studentCode = typeof input?.studentCode === "string" ? input.studentCode.trim() : "";
    const verificationCode = typeof input?.verificationCode === "string" ? input.verificationCode : "";
    if (!studentCode || !verificationCode || studentCode.length > 100 || verificationCode.length > 200)
      return Response.json({ error: "Student ID and verification code are required" }, { status: 400 });

    const db = getDatabase();
    const rows = await db.sql<any>`SELECT * FROM exam_students WHERE student_code=${studentCode} LIMIT 1`;
    const student = rows[0];
    if (!student || !verifyCode(verificationCode, student.verification_code_hash))
      return Response.json({ error: "Verification failed" }, { status: 403 });
    if (String(student.status || "active").toLowerCase() !== "active")
      return Response.json({ error: "Student access is inactive" }, { status: 403 });
    if (student.linked_user_id && student.linked_user_id !== user.id)
      return Response.json({ error: "This student record is already linked to another account" }, { status: 409 });

    // This WHERE condition is checked by PostgreSQL during the UPDATE itself;
    // two parallel callers cannot both claim the same row for different users.
    const updated = await db.sql<any>`UPDATE exam_students
      SET linked_user_id=${user.id}, linked_email=${user.email ?? ""}, updated_at=NOW()
      WHERE id=${student.id}
        AND student_code=${studentCode}
        AND verification_code_hash=${student.verification_code_hash}
        AND LOWER(COALESCE(status,'active'))='active'
        AND (linked_user_id IS NULL OR linked_user_id=${user.id})
      RETURNING student_code,name,class_name,class_start,expire_date`;
    if (!updated.length)
      return Response.json({ error: "This student record is no longer available for linking. Refresh and retry." }, { status: 409 });
    const row = updated[0];
    return Response.json({
      ok: true,
      student: { studentCode: row.student_code, name: row.name,
        className: row.class_name, classStart: row.class_start, expireDate: row.expire_date }
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return asResponse(e); }
};
