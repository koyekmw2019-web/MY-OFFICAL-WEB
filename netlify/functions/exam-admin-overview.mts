import { getDatabase } from "@netlify/database";
import { requireAdmin, asResponse } from "./_shared/auth.mts";

export default async (req: Request) => {
  try {
    if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
    await requireAdmin();
    const db = getDatabase();
    const [students] = await db.sql<any>`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='active' AND CURRENT_DATE BETWEEN class_start AND expire_date)::int AS active FROM exam_students`;
    const [attempts] = await db.sql<any>`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='submitted')::int AS submitted FROM exam_attempts`;
    const [payments] = await db.sql<any>`SELECT COUNT(*) FILTER (WHERE status='pending')::int AS pending, COUNT(*) FILTER (WHERE status='approved')::int AS approved, COUNT(*) FILTER (WHERE status='rejected')::int AS rejected FROM exam_payment_requests WHERE deleted_at IS NULL`;
    const [sync] = await db.sql<any>`SELECT COUNT(*)::int AS received FROM ykcr_sync_events`;
    return Response.json({ students, attempts, payments, ykcr: sync }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) { return asResponse(e); }
};
