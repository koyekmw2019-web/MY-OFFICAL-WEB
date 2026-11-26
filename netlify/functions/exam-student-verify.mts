import { getDatabase } from "@netlify/database";
import { requireUser, asResponse } from "./_shared/auth.mts";
import { verifyCode } from "./_shared/security.mts";
import { studentText } from "./_shared/student-validation.mts";

const json = (body: unknown, status=200) => Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export default async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const user = await requireUser();
    let body: any;
    try { body = await req.json(); } catch { return json({error:'Invalid request'},400); }
    const studentCode = studentText(body?.studentCode,256);
    const verificationCode = studentText(body?.verificationCode,256);
    if (!studentCode || !verificationCode) return json({error:'Student ID and verification code are required'},400);
    // FIX06-B persistent attempt limiting is intentionally not implemented here.
    const db = getDatabase();
    const rows = await db.sql<any>`SELECT id,student_code,status,verification_code_hash,linked_user_id FROM exam_students WHERE student_code=${studentCode} LIMIT 1`;
    const student = rows[0];
    if (!student || typeof student.verification_code_hash !== 'string' || !/^[0-9a-f]{32}:[0-9a-f]{64}$/i.test(student.verification_code_hash) || !verifyCode(verificationCode,student.verification_code_hash)) return json({error:'Verification failed'},403);
    if (student.status !== 'active') return json({error:'Student access is inactive'},403);
    if (student.linked_user_id && student.linked_user_id !== user.id) return json({error:'This student record is already linked to another account'},409);
    // Recheck ownership, status and credential under the UPDATE's row lock.
    // The database unique linked_user_id constraint still prevents a second record for one account.
    const updated = await db.sql<any>`UPDATE exam_students SET linked_user_id=${user.id}, linked_email=${user.email ?? ''}, updated_at=NOW()
      WHERE id=${student.id} AND (linked_user_id IS NULL OR linked_user_id=${user.id}) AND status='active'
      AND verification_code_hash=${student.verification_code_hash}
      RETURNING student_code,name,class_name,class_start,expire_date`;
    if (!updated.length) return json({error:'Student verification conflict; please retry'},409);
    const linked = updated[0];
    return json({ok:true,student:{studentCode:linked.student_code,name:linked.name,className:linked.class_name,classStart:linked.class_start,expireDate:linked.expire_date}});
  } catch (e: any) {
    if (e instanceof Response) return asResponse(e);
    if (e?.code==='23505' && e?.constraint==='exam_students_linked_user_id_key') return json({error:'This account is already linked to a student record'},409);
    // Never return raw DB errors or credential-bearing diagnostics to a member.
    console.error('Student verification failed internally');
    return json({error:'Student verification unavailable'},500);
  }
};
