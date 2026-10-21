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
    if (req.method === "POST") {
      const { paymentId, action, note } = await req.json();
      if (!['approve','reject'].includes(action)) return Response.json({ error: "Invalid action" }, { status: 400 });
      const rows = await db.sql<any>`SELECT * FROM exam_payment_requests WHERE id=${Number(paymentId)} FOR UPDATE`;
      const p = rows[0];
      if (!p) return Response.json({ error: "Payment not found" }, { status: 404 });
      if (p.status !== 'pending') return Response.json({ error: "Payment is already reviewed" }, { status: 409 });
      if (action === 'reject') {
        await db.sql`UPDATE exam_payment_requests SET status='rejected',rejected_at=NOW(),reviewed_by=${admin.email ?? admin.id},admin_note=${String(note||"")} WHERE id=${p.id}`;
        return Response.json({ ok:true,status:'rejected' });
      }
      const days = PLAN_DAYS[p.plan_code];
      const [approved] = await db.sql<any>`UPDATE exam_payment_requests SET status='approved',approved_at=NOW(),reviewed_by=${admin.email ?? admin.id},admin_note=${String(note||"")} WHERE id=${p.id} RETURNING approved_at`;
      const starts = approved.approved_at;
      const expires = new Date(new Date(starts).getTime() + days*86400000).toISOString();
      await db.sql`INSERT INTO exam_paid_access(user_id,payment_request_id,starts_at,expires_at) VALUES(${p.user_id},${p.id},${starts},${expires})`;
      return Response.json({ ok:true,status:'approved',startsAt:starts,expiresAt:expires });
    }
    return new Response("Method not allowed", { status: 405 });
  } catch (e) { return asResponse(e); }
};
