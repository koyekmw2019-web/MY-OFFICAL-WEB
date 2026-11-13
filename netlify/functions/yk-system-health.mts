import { getDatabase } from "@netlify/database";
import { requireAdmin, asResponse } from "./_shared/auth.mts";
import { env } from "./_shared/env.mts";

/** v7.87.19 — read-only diagnostic for the existing schema and configured
 * integrations. Admin only; returns booleans, never credentials or PII.
 * A passing schema check does NOT replace live payment or YKCR E2E tests.
 */
export default async (req: Request) => {
  try {
    if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
    await requireAdmin();
    const db = getDatabase();
    const tableNames = [
      "exam_attempts", "exam_attempt_checkpoints", "exam_students",
      "exam_paid_access", "exam_payment_requests", "ykcr_sync_events",
      "yk_growth_click_events", "yk_growth_manual_entries", "yk_enrollment_leads"
    ];
    const checks: Record<string,boolean> = {};
    for (const name of tableNames) {
      const [r] = await db.sql<any>`SELECT to_regclass(${`public.${name}`}) IS NOT NULL AS exists`;
      checks[`table:${name}`] = r?.exists === true;
    }
    const [idx] = await db.sql<any>`SELECT to_regclass('public.exam_one_free_attempt_per_user_type') IS NOT NULL AS exists`;
    checks["index:one_free_per_exam_type"] = idx?.exists === true;
    const [legacy] = await db.sql<any>`SELECT to_regclass('public.exam_one_free_attempt_per_user') IS NULL AS absent`;
    checks["index:legacy_global_quota_absent"] = legacy?.absent === true;
    const [score] = await db.sql<any>`SELECT EXISTS(SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='exam_attempts' AND column_name='score_verified') AS exists`;
    checks["column:score_verified"] = score?.exists === true;
    const config = {
      bankAccountsConfigured: false,
      adminEmailConfigured: !!env("ADMIN_EMAIL"),
      emailProviderConfigured: !!env("RESEND_API_KEY") && !!env("RESEND_FROM_EMAIL"),
      ykcrSyncSecretConfigured: !!env("YKCR_SYNC_SECRET")
    };
    try {
      const banks = JSON.parse(env("EXAM_BANK_ACCOUNTS_JSON") || "[]");
      config.bankAccountsConfigured = Array.isArray(banks) && banks.length > 0;
    } catch { /* report false, never expose bank details */ }
    const schemaReady = Object.values(checks).every(Boolean);
    const configurationReady = Object.values(config).every(Boolean);
    return Response.json({ schemaReady, configurationReady, checks, config,
      note: "Read-only readiness checks; no payment, Identity or YKCR sync was executed." },
      { status: schemaReady && configurationReady ? 200 : 503,
        headers: { "Cache-Control": "private, no-store" } });
  } catch (e) { return asResponse(e); }
};
