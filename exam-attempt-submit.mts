import { getDatabase } from "@netlify/database";
import { requireUser, asResponse } from "./_shared/auth.mts";
export default async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const user = await requireUser();
    const { attemptId, score, passed } = await req.json();
    const db = getDatabase();
    const rows = await db.sql<any>`UPDATE exam_attempts SET status='submitted', score=${Number(score)}, passed=${!!passed}, submitted_at=NOW() WHERE id=${Number(attemptId)} AND user_id=${user.id} RETURNING id`;
    if (!rows.length) return Response.json({ error: "Attempt not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (e) { return asResponse(e); }
};
