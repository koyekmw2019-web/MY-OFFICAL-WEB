import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getDatabase } from "@netlify/database";
import { env } from "./_shared/env.mts";
import { hashVerificationCode, normalizeDate } from "./_shared/security.mts";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

function safeText(value: unknown, field: string, max = 300) {
  const s = String(value ?? "").trim();
  if (!s) throw new Error(`${field} is required`);
  if (s.length > max) throw new Error(`${field} is too long`);
  return s;
}

function optionalText(value: unknown, max = 300) {
  const s = String(value ?? "").trim();
  if (!s) return null;
  if (s.length > max) throw new Error("Field is too long");
  return s;
}

function parseTimestamp(raw: string) {
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return NaN;
    return n < 1_000_000_000_000 ? n * 1000 : n;
  }
  return Date.parse(raw);
}

function decodeSignature(raw: string) {
  const s = raw.trim().replace(/^sha256=/i, "");
  if (/^[0-9a-f]{64}$/i.test(s)) return Buffer.from(s, "hex");
  try {
    const b64url = s.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64url + "=".repeat((4 - (b64url.length % 4)) % 4);
    const buf = Buffer.from(padded, "base64");
    return buf.length === 32 ? buf : null;
  } catch {
    return null;
  }
}

function signatureMatches(secret: string, timestamp: string, rawBody: string, supplied: string) {
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest();
  const actual = decodeSignature(supplied);
  return !!actual && actual.length === expected.length && timingSafeEqual(actual, expected);
}

function normalizeStatus(value: unknown) {
  const status = String(value ?? "active").trim().toLowerCase();
  if (!status || status.length > 40) throw new Error("Invalid student status");
  return status;
}

function safeUpdatedAt(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const ms = Date.parse(raw);
  if (!Number.isFinite(ms)) throw new Error("Invalid updated_at");
  return new Date(ms).toISOString();
}

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = env("YKCR_SYNC_SECRET");
  if (!secret) return Response.json({ error: "Sync receiver is not configured" }, { status: 503 });

  const timestamp = req.headers.get("x-ykcr-timestamp")?.trim() ?? "";
  const signature = req.headers.get("x-ykcr-signature")?.trim() ?? "";
  const eventHeader = req.headers.get("x-ykcr-event-id")?.trim() ?? "";
  if (!timestamp || !signature || !eventHeader) {
    return Response.json({ error: "Missing sync authentication headers" }, { status: 401 });
  }

  const ts = parseTimestamp(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_CLOCK_SKEW_MS) {
    return Response.json({ error: "Expired or invalid sync timestamp" }, { status: 401 });
  }

  const rawBody = await req.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }
  if (!signatureMatches(secret, timestamp, rawBody, signature)) {
    return Response.json({ error: "Invalid sync signature" }, { status: 401 });
  }

  let body: any;
  try { body = JSON.parse(rawBody); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const eventId = safeText(body?.event_id ?? eventHeader, "event_id", 200);
  if (eventId !== eventHeader) return Response.json({ error: "Event ID mismatch" }, { status: 400 });
  const eventType = safeText(body?.event, "event", 100);
  if (!/^student\.[a-z0-9_.-]+$/i.test(eventType)) {
    return Response.json({ error: "Unsupported sync event" }, { status: 400 });
  }

  const student = body?.student;
  if (!student || typeof student !== "object") return Response.json({ error: "student payload is required" }, { status: 400 });

  let ykcrStudentId: string, studentCode: string, name: string, className: string | null;
  let classStart: string, expireDate: string, status: string, updatedAt: string | null;
  let verificationCode: string | null;
  try {
    ykcrStudentId = safeText(student.student_id, "student_id", 200);
    studentCode = safeText(student.student_code, "student_code", 100);
    name = safeText(student.name, "name", 300);
    className = optionalText(student.class_name, 80);
    classStart = normalizeDate(student.class_start);
    expireDate = normalizeDate(student.expire_date);
    status = normalizeStatus(student.status);
    updatedAt = safeUpdatedAt(student.updated_at);
    verificationCode = optionalText(student.verification_code, 200);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Invalid student payload" }, { status: 400 });
  }

  const payloadHash = createHash("sha256").update(rawBody).digest("hex");
  const db = getDatabase();
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    const prior = await client.query(
      "SELECT event_id,payload_hash FROM ykcr_sync_events WHERE event_id=$1 FOR UPDATE",
      [eventId]
    );
    if (prior.rows[0]) {
      await client.query("ROLLBACK");
      if (prior.rows[0].payload_hash === payloadHash) {
        return Response.json({ ok: true, duplicate: true, eventId });
      }
      return Response.json({ error: "Event ID was already used with a different payload" }, { status: 409 });
    }

    let target: any = null;
    let matchMode = "";

    const byYkcr = await client.query(
      "SELECT * FROM exam_students WHERE ykcr_student_id=$1 LIMIT 1 FOR UPDATE",
      [ykcrStudentId]
    );
    if (byYkcr.rows[0]) {
      target = byYkcr.rows[0];
      matchMode = "ykcr_student_id";
    }

    if (!target) {
      const byCode = await client.query(
        "SELECT * FROM exam_students WHERE student_code=$1 LIMIT 1 FOR UPDATE",
        [studentCode]
      );
      if (byCode.rows[0]) {
        target = byCode.rows[0];
        matchMode = "student_code";
      }
    }

    if (!target) {
      const legacy = await client.query(
        `SELECT * FROM exam_students
         WHERE ykcr_student_id IS NULL
           AND name=$1
           AND COALESCE(class_name,'')=COALESCE($2,'')
           AND class_start=$3::date
           AND expire_date=$4::date
         ORDER BY id
         FOR UPDATE`,
        [name, className, classStart, expireDate]
      );
      if (legacy.rows.length > 1) {
        await client.query("ROLLBACK");
        return Response.json({ error: "Ambiguous legacy student match; manual reconciliation is required" }, { status: 409 });
      }
      if (legacy.rows[0]) {
        target = legacy.rows[0];
        matchMode = "exact_legacy_match";
      }
    }

    if (!target && !verificationCode) {
      await client.query("ROLLBACK");
      return Response.json({ error: "verification_code is required for a new student" }, { status: 400 });
    }

    const nextHash = verificationCode
      ? hashVerificationCode(verificationCode)
      : target?.verification_code_hash;

    let row: any;
    if (target) {
      const updated = await client.query(
        `UPDATE exam_students
         SET ykcr_student_id=$1,
             student_code=$2,
             name=$3,
             class_name=$4,
             class_start=$5::date,
             expire_date=$6::date,
             verification_code_hash=$7,
             status=$8,
             ykcr_updated_at=COALESCE($9::timestamptz, NOW()),
             updated_at=NOW()
         WHERE id=$10
         RETURNING id,student_code,name,class_name,class_start,expire_date,status,ykcr_student_id,linked_user_id`,
        [ykcrStudentId, studentCode, name, className, classStart, expireDate, nextHash, status, updatedAt, target.id]
      );
      row = updated.rows[0];
    } else {
      const inserted = await client.query(
        `INSERT INTO exam_students
          (ykcr_student_id,student_code,name,class_name,class_start,expire_date,verification_code_hash,status,ykcr_updated_at)
         VALUES($1,$2,$3,$4,$5::date,$6::date,$7,$8,COALESCE($9::timestamptz,NOW()))
         RETURNING id,student_code,name,class_name,class_start,expire_date,status,ykcr_student_id,linked_user_id`,
        [ykcrStudentId, studentCode, name, className, classStart, expireDate, nextHash, status, updatedAt]
      );
      row = inserted.rows[0];
      matchMode = "inserted";
    }

    await client.query(
      `INSERT INTO ykcr_sync_events(event_id,event_type,ykcr_student_id,student_code,payload_hash)
       VALUES($1,$2,$3,$4,$5)`,
      [eventId, eventType, ykcrStudentId, studentCode, payloadHash]
    );

    await client.query("COMMIT");
    return Response.json({
      ok: true,
      eventId,
      matchMode,
      student: {
        studentCode: row.student_code,
        ykcrStudentId: row.ykcr_student_id,
        status: row.status
      }
    });
  } catch (e: any) {
    try { await client.query("ROLLBACK"); } catch {}
    if (e?.code === "23505") {
      return Response.json({ error: "Student synchronization conflict" }, { status: 409 });
    }
    console.error("YKCR sync receiver error", e instanceof Error ? e.message : "unknown error");
    return Response.json({ error: "Synchronization failed" }, { status: 500 });
  } finally {
    client.release();
  }
};
