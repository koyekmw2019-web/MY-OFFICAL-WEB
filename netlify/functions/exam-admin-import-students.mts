import { getDatabase } from "@netlify/database";
import { parse } from "csv-parse/sync";
import { requireAdmin, asResponse } from "./_shared/auth.mts";
import { generatedCode, hashVerificationCode } from "./_shared/security.mts";
import { studentDateRange, studentText } from "./_shared/student-validation.mts";

const val = (row: any, ...keys: string[]) => { for (const k of keys) if (row[k] != null && String(row[k]).trim() !== "") return String(row[k]).trim(); return ""; };
const json = (body: unknown, status=200) => Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export default async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    await requireAdmin();
    let file: FormDataEntryValue | null;
    try { file = (await req.formData()).get('file'); } catch { return json({error:'Invalid CSV request'},400); }
    if (!(file instanceof File)) return json({error:'CSV file is required'},400);
    if (file.size > 1500000) return json({error:'CSV file too large'},413);
    let rows: any[];
    try { rows = parse(await file.text(),{columns:true,skip_empty_lines:true,bom:true,trim:true}); } catch { return json({error:'Invalid CSV'},400); }
    if (!Array.isArray(rows) || !rows.length) return json({error:'CSV is empty'},400);
    if (rows.length > 5000) return json({error:'Maximum 5,000 students per upload'},413);
    // Validate every row before opening a transaction. Do not echo supplied codes or row data.
    const prepared = [];
    const counts = new Map<string,number>();
    for (const [i,row] of rows.entries()) {
      try {
        const name = studentText(val(row,'name','Name','Student Name','学生名','名前'),512);
        const cls = val(row,'class_name','Class','CLASS','クラス');
        const id = val(row,'student_code','Student ID','StudentID','ID');
        const code = val(row,'verification_code','Verification Code','Access Code','Code');
        const className = cls ? studentText(cls,256) : '';
        const studentCode = id ? studentText(id,256) : '';
        const verificationCode = code ? studentText(code,256) : '';
        if (!name || className===null || studentCode===null || verificationCode===null) throw Error('Invalid fields');
        const {classStart,expireDate} = studentDateRange(val(row,'class_start','Start Date','StartDate','開始日'),val(row,'expire_date','Expire Date','ExpireDate','終了日','有効期限'));
        if (studentCode) counts.set(studentCode,(counts.get(studentCode)??0)+1);
        prepared.push({studentCode,verificationCode,name,className,classStart,expireDate,row:i+2});
      } catch { return json({error:`Invalid student fields or date range at row ${i+2}`},400); }
    }
    const credentials: any[] = [], skipped: any[] = [];
    const client = await getDatabase().pool.connect();
    try {
      await client.query('BEGIN');
      for (const row of prepared) {
        // Skip all occurrences of a repeated explicit ID, not first/last-wins.
        if (row.studentCode && (counts.get(row.studentCode)??0)>1) {
          skipped.push({row:row.row,studentCode:row.studentCode,reason:'duplicate_in_csv'}); continue;
        }
        const code = row.verificationCode || generatedCode('YK');
        const hash = hashVerificationCode(code);
        let studentCode = row.studentCode;
        let inserted = false;
        for (let i=0;i<5;i++) {
          if (!row.studentCode) {
            studentCode=generatedCode('YKST');
            if (counts.has(studentCode)) continue; // do not occupy a later explicit ID
          }
          const result=await client.query('INSERT INTO exam_students(student_code,name,class_name,class_start,expire_date,verification_code_hash) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(student_code) DO NOTHING RETURNING student_code',[studentCode,row.name,row.className||null,row.classStart,row.expireDate,hash]);
          if (result.rows.length) { inserted=true; break; }
          if (row.studentCode) break;
        }
        if (!inserted) {
          if (!row.studentCode) throw Error('Unable to allocate unique student ID');
          skipped.push({row:row.row,studentCode,reason:'existing_id'}); continue;
        }
        credentials.push({studentCode,verificationCode:code,verificationCodeState:row.verificationCode?'provided':'generated',name:row.name,className:row.className,classStart:row.classStart,expireDate:row.expireDate});
      }
      await client.query('COMMIT');
    } catch(e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
    return json({ok:true,imported:credentials.length,skipped:skipped.length,skippedRows:skipped,credentials});
  } catch(e) {
    if (e instanceof Response) return asResponse(e);
    console.error('Student CSV import failed internally');
    return json({error:'Student import failed'},500);
  }
};
