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
