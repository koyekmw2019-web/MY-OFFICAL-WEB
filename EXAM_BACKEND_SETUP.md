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


## v7_34 exam type update
`maintenance` (自動車整備・特定技能1号 Mock Exam) is now an allowed exam type. The included additive migration updates the `exam_attempts.exam_type` constraint.
