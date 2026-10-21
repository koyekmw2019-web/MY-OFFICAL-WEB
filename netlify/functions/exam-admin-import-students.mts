import { getDatabase } from "@netlify/database";
import { parse } from "csv-parse/sync";
import { requireAdmin, asResponse } from "./_shared/auth.mts";
import { generatedCode, hashVerificationCode, normalizeDate } from "./_shared/security.mts";

const val = (row: any, ...keys: string[]) => { for (const k of keys) if (row[k] != null && String(row[k]).trim() !== "") return String(row[k]).trim(); return ""; };

export default async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    await requireAdmin();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "CSV file is required" }, { status: 400 });
    const rows = parse(await file.text(), { columns: true, skip_empty_lines: true, bom: true, trim: true });
    if (!Array.isArray(rows) || !rows.length) return Response.json({ error: "CSV is empty" }, { status: 400 });
    if (rows.length > 5000) return Response.json({ error: "Maximum 5,000 students per upload" }, { status: 413 });
    const db = getDatabase();
    const generated: any[] = [];
    let imported = 0;
    for (const row of rows) {
      const name = val(row,"name","Name","Student Name","学生名","名前");
      const className = val(row,"class_name","Class","CLASS","クラス");
      const start = val(row,"class_start","Start Date","StartDate","開始日");
      const expire = val(row,"expire_date","Expire Date","ExpireDate","終了日","有効期限");
      if (!name || !start || !expire) throw new Error(`Missing name/start/expire for row ${imported+2}`);
      let studentCode = val(row,"student_code","Student ID","StudentID","ID");
      let verificationCode = val(row,"verification_code","Verification Code","Access Code","Code");
      if (!studentCode) studentCode = generatedCode("YKST");
      if (!verificationCode) verificationCode = generatedCode("YK");
      const hash = hashVerificationCode(verificationCode);
      await db.sql`INSERT INTO exam_students(student_code,name,class_name,class_start,expire_date,verification_code_hash) VALUES(${studentCode},${name},${className || null},${normalizeDate(start)},${normalizeDate(expire)},${hash}) ON CONFLICT(student_code) DO UPDATE SET name=EXCLUDED.name,class_name=EXCLUDED.class_name,class_start=EXCLUDED.class_start,expire_date=EXCLUDED.expire_date,verification_code_hash=EXCLUDED.verification_code_hash,updated_at=NOW()`;
      generated.push({ studentCode, verificationCode, name, className, classStart: normalizeDate(start), expireDate: normalizeDate(expire) });
      imported++;
    }
    return Response.json({ ok: true, imported, credentials: generated });
  } catch (e) { return asResponse(e); }
};
