import { getDatabase } from "@netlify/database";
import { verifyRequestOrigin } from "@netlify/identity";
import { requireAdmin, asResponse } from "./_shared/auth.mts";
import { PLAN_DAYS } from "./_shared/security.mts";

/** Uses the existing exam_payment_requests table. A delete hides the request
 * without erasing financial history or revoking granted paid access. */
export default async (req: Request) => {
  try {
    const admin = await requireAdmin();
    const db = getDatabase();
    if (req.method === "GET") {
      const rows = await db.sql<any>`SELECT id,user_email,payer_name,plan_code,amount_yen,bank_key,transfer_date,status,submitted_at,approved_at,rejected_at,admin_note FROM exam_payment_requests WHERE deleted_at IS NULL ORDER BY submitted_at DESC LIMIT 200`;
      return Response.json({ payments: rows }, { headers: { "Cache-Control": "private, no-store" } });
    }
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    verifyRequestOrigin(req);
    const body = await req.json();
    const paymentId = Number(body.paymentId);
    const action = String(body.action || "");
    const note = String(body.note || "").trim().slice(0, 500);
    if (!Number.isSafeInteger(paymentId) || paymentId <= 0) return Response.json({ error: "Invalid payment ID" }, { status: 400 });
    if (!["approve", "reject", "delete"].includes(action)) return Response.json({ error: "Invalid action" }, { status: 400 });
    // Require a deliberate, typed confirmation token; not just one click.
    if (action === "delete" && body.confirmation !== `DELETE ${paymentId}`) return Response.json({ error: `Please confirm with DELETE ${paymentId}` }, { status: 400 });
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const locked = await client.query("SELECT * FROM exam_payment_requests WHERE id=$1 AND deleted_at IS NULL FOR UPDATE", [paymentId]);
      const p = locked.rows[0];
      if (!p) { await client.query("ROLLBACK"); return Response.json({ error: "Payment not found or removed" }, { status: 404 }); }
      if (action === "delete") {
        // No cascading delete; approved subscriptions remain active and auditable.
        await client.query("UPDATE exam_payment_requests SET deleted_at=NOW(),deleted_by=$1,delete_reason=$2 WHERE id=$3", [admin.email ?? admin.id, note, paymentId]);
        await client.query("COMMIT");
        return Response.json({ ok: true, status: "deleted", accessPreserved: true });
      }
      if (p.status !== "pending") { await client.query("ROLLBACK"); return Response.json({ error: "Payment is already reviewed" }, { status: 409 }); }
      if (action === "reject") {
        await client.query("UPDATE exam_payment_requests SET status='rejected',rejected_at=NOW(),reviewed_by=$1,admin_note=$2 WHERE id=$3", [admin.email ?? admin.id, note, paymentId]);
        await client.query("COMMIT");
        return Response.json({ ok: true, status: "rejected" });
      }
      const days = PLAN_DAYS[p.plan_code];
      if (!days) throw new Error("Invalid plan code on payment request");
      const approved = await client.query("UPDATE exam_payment_requests SET status='approved',approved_at=NOW(),reviewed_by=$1,admin_note=$2 WHERE id=$3 RETURNING approved_at", [admin.email ?? admin.id, note, paymentId]);
      const starts = approved.rows[0].approved_at;
      const expires = new Date(new Date(starts).getTime() + days * 86400000).toISOString();
      await client.query("INSERT INTO exam_paid_access(user_id,payment_request_id,starts_at,expires_at) VALUES($1,$2,$3,$4)", [p.user_id, p.id, starts, expires]);
      await client.query("COMMIT");
      return Response.json({ ok: true, status: "approved", startsAt: starts, expiresAt: expires });
    } catch (e) {
      try { await client.query("ROLLBACK"); } catch {}
      throw e;
    } finally { client.release(); }
  } catch (e) { return asResponse(e); }
};
