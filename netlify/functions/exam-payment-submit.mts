import { getDatabase } from "@netlify/database";
import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import { requireUser, asResponse } from "./_shared/auth.mts";
import { PLAN_PRICE } from "./_shared/security.mts";
import { sendAdminPaymentEmail } from "./_shared/notify.mts";

export default async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const user = await requireUser();
    const form = await req.formData();
    const plan = String(form.get("plan") || "");
    const name = String(form.get("name") || "").trim();
    const bankKey = String(form.get("bank") || "").trim();
    const transferDate = String(form.get("transferDate") || "").trim();
    const receipt = form.get("receipt");
    if (!(plan in PLAN_PRICE) || !name || !(receipt instanceof File) || receipt.size === 0) return Response.json({ error: "Missing or invalid payment fields" }, { status: 400 });
    if (receipt.size > 4_500_000) return Response.json({ error: "Receipt file is too large (max about 4.5 MB)" }, { status: 413 });
    if (!receipt.type.startsWith("image/") && receipt.type !== "application/pdf") return Response.json({ error: "Receipt must be an image or PDF" }, { status: 400 });
    const safeName = receipt.name.replace(/[^a-zA-Z0-9._-]/g,"_");
    const key = `${user.id}/${randomUUID()}-${safeName}`;
    const store = getStore({ name: "payment-receipts", consistency: "strong" });
    await store.set(key, receipt, { metadata: { userId: user.id, plan, uploadedAt: Date.now() } });
    const db = getDatabase();
    const [row] = await db.sql<any>`INSERT INTO exam_payment_requests(user_id,user_email,payer_name,plan_code,amount_yen,bank_key,transfer_date,receipt_blob_key) VALUES(${user.id},${user.email ?? ""},${name},${plan},${PLAN_PRICE[plan]},${bankKey || null},${transferDate || null},${key}) RETURNING id,submitted_at`;
    const email = await sendAdminPaymentEmail({ id: row.id, name, email: user.email ?? "", plan, amount: PLAN_PRICE[plan], transferDate });
    return Response.json({ ok: true, paymentId: row.id, status: "pending", adminEmailNotification: email });
  } catch (e) { return asResponse(e); }
};
