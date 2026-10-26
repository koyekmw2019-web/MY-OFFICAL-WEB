import { getDatabase } from "@netlify/database";
import { requireAdmin, asResponse } from "./_shared/auth.mts";
import { PLAN_DAYS } from "./_shared/security.mts";

export default async (req: Request) => {
  try {
    const admin = await requireAdmin();
    const db = getDatabase();
    if (req.method === "GET") {
      const rows = await db.sql<any>`SELECT id,user_email,payer_name,plan_code,amount_yen,bank_key,transfer_date,status,submitted_at,approved_at,rejected_at,admin_note FROM exam_payment_requests ORDER BY submitted_at DESC LIMIT 200`;
      return Response.json({ payments: rows });
    }
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const { paymentId, action, note } = await req.json();
    if (!['approve','reject'].includes(action)) return Response.json({ error: "Invalid action" }, { status: 400 });
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const locked = await client.query("SELECT * FROM exam_payment_requests WHERE id=$1 FOR UPDATE", [Number(paymentId)]);
      const p = locked.rows[0];
      if (!p) { await client.query("ROLLBACK"); return Response.json({ error: "Payment not found" }, { status: 404 }); }
      if (p.status !== 'pending') { await client.query("ROLLBACK"); return Response.json({ error: "Payment is already reviewed" }, { status: 409 }); }
      if (action === 'reject') {
        await client.query("UPDATE exam_payment_requests SET status='rejected',rejected_at=NOW(),reviewed_by=$1,admin_note=$2 WHERE id=$3", [admin.email ?? admin.id, String(note||""), p.id]);
        await client.query("COMMIT");
        return Response.json({ ok:true,status:'rejected' });
      }
      const days = PLAN_DAYS[p.plan_code];
      if (!days) throw new Error("Invalid plan code on payment request");
      const approved = await client.query("UPDATE exam_payment_requests SET status='approved',approved_at=NOW(),reviewed_by=$1,admin_note=$2 WHERE id=$3 RETURNING approved_at", [admin.email ?? admin.id, String(note||""), p.id]);
      const starts = approved.rows[0].approved_at;
      const expires = new Date(new Date(starts).getTime() + days*86400000).toISOString();
      await client.query("INSERT INTO exam_paid_access(user_id,payment_request_id,starts_at,expires_at) VALUES($1,$2,$3,$4)", [p.user_id,p.id,starts,expires]);
      await client.query("COMMIT");
      return Response.json({ ok:true,status:'approved',startsAt:starts,expiresAt:expires });
    } catch (e) {
      try { await client.query("ROLLBACK"); } catch {}
      throw e;
    } finally { client.release(); }
  } catch (e) { return asResponse(e); }
};
