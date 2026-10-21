import { env } from "./_shared/env.mts";
export default async () => {
  const raw = env("EXAM_BANK_ACCOUNTS_JSON");
  if (!raw) return Response.json({ banks: [] });
  try { return Response.json({ banks: JSON.parse(raw) }); }
  catch { return Response.json({ error: "Bank account configuration is invalid" }, { status: 500 }); }
};
