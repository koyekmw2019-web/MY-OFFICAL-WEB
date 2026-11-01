# QA — YE KUN v7.63 Exam Integrity

## Verified in this container (2026-11-01)
- Source: user-uploaded `YE_KUN_Official_Website_v7_62_Hardening(1).zip`.
- Node 22 `npm test`: **27 PASS / 0 FAIL**, mocked DB and handlers; no live Netlify calls.
- The server-side answer mapping matches all 500 JLPT questions in the existing asset, and driving/license/maintenance banks in the original `index.html`.
- Canonical all-correct sample snapshots for JLPT N1–N5, Truck, Taxi, Bus, Car, Motorcycle, Moped and Maintenance compute the expected raw/practice scores.
- Missing checkpoint, unfinished JLPT phase, expired final deadline, forged `180` client score against zero-response checkpoint, invalid/double IDs, unfinished last question, unplayed final Listening audio all rejected in isolated tests.
- Per-exam-type free index classifier and SQL migration asserted; expired phase transition after deadline+grace rejected in mocked handler.
- Syntax of 13 inline JS scripts, assets JS, test/generator scripts verified by `node --check`.
- New ZIP checked for CRC and no PDF; historical migrations preserved unmodified.

## NOT verified here / Staging mandatory
- Real Netlify Identity sessions and network API authentication; real Postgres transaction concurrency, schema migration on deployed database, rollback under migration.
- Browser E2E on all device sizes, background/airplane mode, clock drift, cross-tab races, graceful retry after network outage.
- Paid member, verified student and Admin access; YKCR sync, payment workflow and roles; real PWA installations.
- Security against users who construct custom checkpoints from the published public answer bank; server-generated question selection and stronger answer secrecy are future work.

## Release decision
**NOT PRODUCTION-READY** until staging checks above pass. Deploy Preview with isolated DB, retain backup. `exam-health` (Admin only) should return `ready:true`, `policy:ONE_PER_EXAM_TYPE`, `scoreVerification:SERVER_RECALCULATED_PRACTICE`.

## Risk note
Changing from a global free index to a per-exam-type index is a deliberate business-rule change. It does not delete previous rows. Old deployments may mislabel quotas if only frontend rolls back; coordinate schema and application versions.
