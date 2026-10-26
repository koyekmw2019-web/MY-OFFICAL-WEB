import { requireUser, asResponse } from "./_shared/auth.mts";
import { env } from "./_shared/env.mts";

export default async (req: Request) => {
  try {
    if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
    await requireUser();
    const raw = env("EXAM_BANK_ACCOUNTS_JSON");
    if (!raw) return Response.json({ banks: [] });
    try { return Response.json({ banks: JSON.parse(raw) }); }
    catch { return Response.json({ error: "Bank account configuration is invalid" }, { status: 500 }); }
  } catch (e) { return asResponse(e); }
};
