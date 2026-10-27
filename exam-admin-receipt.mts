import { getDatabase } from "@netlify/database";
import { getStore } from "@netlify/blobs";
import { requireAdmin, asResponse } from "./_shared/auth.mts";
export default async (req: Request) => {
  try {
    await requireAdmin();
    const id = Number(new URL(req.url).searchParams.get("paymentId"));
    const db = getDatabase();
    const rows = await db.sql<any>`SELECT receipt_blob_key FROM exam_payment_requests WHERE id=${id} LIMIT 1`;
    if (!rows.length) return new Response("Not found", { status:404 });
    const store = getStore({ name:"payment-receipts", consistency:"strong" });
    const entry = await store.get(rows[0].receipt_blob_key,{type:"blob"});
    if (!entry) return new Response("Not found",{status:404});
    return new Response(entry,{headers:{"Content-Type":entry.type || "application/octet-stream","Cache-Control":"private, no-store"}});
  } catch(e){ return asResponse(e); }
};
