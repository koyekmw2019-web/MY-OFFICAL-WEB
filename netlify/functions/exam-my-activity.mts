import { getDatabase } from "@netlify/database";
import { requireUser, asResponse } from "./_shared/auth.mts";

export default async (req: Request) => {
  try {
    if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
    const user = await requireUser();
    const db = getDatabase();
    const attempts = await db.sql<any>`SELECT id,exam_type,access_mode,status,score,passed,started_at,submitted_at FROM exam_attempts WHERE user_id=${user.id} ORDER BY started_at DESC LIMIT 50`;
    const payments = await db.sql<any>`SELECT id,plan_code,amount_yen,status,submitted_at,approved_at,rejected_at,admin_note FROM exam_payment_requests WHERE user_id=${user.id} AND deleted_at IS NULL ORDER BY submitted_at DESC LIMIT 30`;
    return Response.json({ attempts, payments }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) { return asResponse(e); }
};
