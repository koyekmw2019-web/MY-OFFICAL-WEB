# YK Online Exam — Netlify backend setup (v7_29)

This version replaces the Supabase-ready plan with a Netlify-native backend scaffold.

## What is included
- Netlify Database migration for students, exam attempts, payment requests and paid access.
- Netlify Blobs receipt storage (`payment-receipts`).
- Netlify Functions for student verification, one-free-attempt enforcement, payment upload, admin approval/rejection, receipt viewing and live CSV student import.
- Netlify Identity server-side checks. Admin endpoints require the `admin` role.
- `STUDENT_CSV_TEMPLATE.csv` for live imports. Missing Student ID / Verification Code values are generated during import and returned to the Admin.

## Important: old student data
Yes. Existing student data can be imported into Netlify Database as CSV. Required minimum columns are name, class_start and expire_date. Class and Student ID are optional. If Student ID or Verification Code is blank, the import function generates them.

Accepted header examples include:
- `name` / `Name` / `学生名` / `名前`
- `class_name` / `Class` / `CLASS` / `クラス`
- `class_start` / `Start Date` / `StartDate` / `開始日`
- `expire_date` / `Expire Date` / `ExpireDate` / `終了日` / `有効期限`
- `student_code` / `Student ID` / `StudentID` / `ID`
- `verification_code` / `Verification Code` / `Access Code` / `Code`

## Netlify dashboard steps still required
1. Enable Netlify Identity for the site and keep registration settings appropriate for the public exam app.
2. Give the Admin account the `admin` role. Role changes take effect on the next login or token refresh.
3. Ensure Netlify Database is available for the site. The project contains `@netlify/database` and migrations under `netlify/database/migrations/`; deploy applies migrations.
4. Add these environment variables in Netlify Project configuration:
   - `ADMIN_EMAIL` — destination for payment notifications.
   - `EXAM_BANK_ACCOUNTS_JSON` — checkout bank account list as JSON. Do not commit it to source.
   - `RESEND_API_KEY` — optional, required for Admin email notifications.
   - `RESEND_FROM_EMAIL` — verified sender address for notification mail.
5. Deploy v7_29.

## Plan/access rules
- Student: unlimited access while `CURRENT_DATE` is between class_start and expire_date.
- Non-student: one free exam total across Truck / Taxi / Bus / 普通自動車 / 二輪 / 原付.
- After free attempt: active paid access required.
- Plans: 7 days ¥1,000 / 30 days ¥2,000 / 90 days ¥3,000 / 365 days ¥5,000.
- Paid access starts at the Admin approval timestamp.

## Receipt privacy
Receipts are stored in Netlify Blobs and are not exposed as public URLs. The receipt-read function requires an authenticated Admin role.

## Deploy note
Netlify Database requires a Credit-based plan. If the deploy reports `database feature not available for this account`, the site plan must be changed before the database backend can go live.


## v7_35 exam type update
`maintenance` (自動車整備・特定技能1号 Mock Exam) is now an allowed exam type. The included additive migration updates the `exam_attempts.exam_type` constraint.


## v7_35 frontend wiring

- Browser auth is bundled from `src/identity-client.js` using `@netlify/identity`.
- `handleAuthCallback()` runs on page load, so invite, email-confirmation and recovery links are handled on the site.
- Login / Register / Forgot Password / Logout are available from the Online Exam access card.
- Student Verify calls `exam-student-verify` after login.
- Exam start calls `exam-access`; one-free-attempt enforcement is now server-side.
- Result submission calls `exam-attempt-submit`.
- Checkout fetches authenticated bank details and submits receipt to `exam-payment-submit`.
- Admin users with role `admin` can open the Admin Dashboard for CSV import and payment approval/rejection.
- The 3-month plan code is standardized as `3months` on both frontend and backend.
- `exam-bank-details` now requires an authenticated user.
- Payment approval is transactional.
- Re-importing an existing student with a blank verification-code field preserves the existing hash instead of rotating the code.

Git builds must run `npm run build` (configured in `netlify.toml`) so `assets/identity.bundle.js` is generated before publish.

## v7_36 — YKCR master student synchronization

YKCR is now the authoritative student source. This version adds a server-to-server receiver at:

`/.netlify/functions/ykcr-student-sync`

Required Netlify environment variable:

- `YKCR_SYNC_SECRET` — shared HMAC-SHA256 secret. Keep it secret and scope it to Functions/Runtime.

Receiver behavior:

- Requires `X-YKCR-Timestamp`, `X-YKCR-Signature`, and `X-YKCR-Event-ID`.
- Verifies HMAC over `timestamp + "." + exactRawJsonBody`.
- Enforces a 5-minute timestamp window.
- Records event IDs without storing the plaintext Verification Code, making retries idempotent.
- Matches students by YKCR stable student ID, then Student ID, then a single exact legacy match on name + class + start date + expire date.
- Hashes any received Verification Code immediately and stores only the hash in the Official Website database.
- Adds YKCR student status and blocks inactive students from Student verification/exam access.
- Preserves existing linked Website accounts during YKCR migration.

The legacy CSV importer remains available as an Admin fallback, but YKCR should be treated as the primary source after synchronization is enabled.

## v7.62 — Staging deployment checklist (do NOT skip)

1. **Do not overwrite production yet.** Deploy to Netlify Deploy Preview using a separate/branch Netlify Database, not production data.
2. Apply **all nine migrations** in timestamp order, first on an empty database and then on a separate sanitized **copy of production data**. Confirm existing students, paid access, payment history, and checkpoints remain unchanged (except expired attempts intentionally becoming `abandoned`).
3. With an authenticated Admin, GET `/.netlify/functions/exam-health`; require HTTP 200 and `ready: true`. Non-admin must receive 403. If 503, fix schema before continuing.
4. Follow the matrix in `QA_v7_62_HARDENING.md`: free/student/paid/admin × exam families, two tabs, offline flow, wrong-score payload, expired free and migration failure injections. Log PASS / FAIL / NOT RUN and real evidence.
5. Verify every result and access mode on Android, iOS Safari, and desktop, including login, logout, YKCR sync, bank-transfer payment approval and PWA. Only then promote the reviewed deploy to production.
6. **Rollback:** keep a tested copy of v7.61 and deployment ID. If release fails, roll back the frontend/functions deployment; the new migration is additive and is left in place. **Do not** delete existing DB tables, checkpoints, attempts, or remove columns. Never revert by dropping customer data. The schema must remain backwards-compatible. Restore data only from an explicitly verified backup in a supervised recovery.

**Free policy:** `TOTAL_ONE` (owner-selected; one free attempt total across exam types).
**Score Verification:** STAGE A ONLY; `score_verified=false` for all new submissions. `passed` is server-derived from client-supplied (unverified) score and section totals. Question/answer keys are still published in `assets/`, so full server-side recomputation is **NOT** available; do not certify results.
**Dependency lock:** v7.62 pins direct dependencies exactly in package.json. The development environment cannot reach npm registry, so a trusted full transitive `package-lock.json` could not be generated; on a networked staging build run `npm install --package-lock-only --ignore-scripts`, inspect the output, commit that generated lockfile, then `npm ci`. **Do not run `npm ci` before this step.**


## v7.63 — Exam Integrity update (staging first)

**Important: v7.62 notes above remain historical.** The new current policy is one free
attempt **per exam type** (`ONE_PER_EXAM_TYPE`), not `TOTAL_ONE`. A new migration
`20261101150000_v763_free_per_exam_type.sql` drops only the old global unique
index and creates a new per-type partial unique index. It preserves all attempt rows.
Do not edit or remove previously deployed migrations.

Results now require a persisted final-phase checkpoint, a valid server deadline,
and are recomputed with a server-only copy of the exact bundled original answer
keys (`netlify/functions/_shared/exam-answer-key-v763.mts`). The server ignores
the caller's `passed` boolean and rejects mismatched reported scores. It sets
`score_verified=true` **only for a successfully recomputed practice score**.
The questions and key choices are still visible in the public client script; this
is *not* proctoring or a cheat-proof official assessment. Any change to public
question banks MUST regenerate this server-side answer mapping and run regression
tests before deploying.

Run `npm test` in Node.js 22+ (mock DB). Staging must also verify real Netlify
Identity, database migration index, payment approvals, YKCR student linkage,
refresh-resume-submit across JLPT N1–N5 and all driving/license exam types, expired
phase, offline recovery, and different account/other-tab restrictions. `exam-health`
(Admin only) must return `ready: true` and `ONE_PER_EXAM_TYPE`.

**Rollback caution:** the database migration changes a unique index. Rolling back
only the site deploy to v7.62 will not restore the old global unique constraint;
treat schema/client rollback as a coordinated operation. Never delete user data.
