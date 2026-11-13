# STUDYING WITH YE KUN — v7.87.8 Admin Dashboard Cleanup & Enrollment CRM

**Release type:** Weekly **CUMULATIVE SOURCE PATCH**, not a standalone full website. 
**Base:** GitHub `main` v7.87.4 + previously delivered v7.87.5, v7.87.6 and **v7.87.7** cumulative patches. This v7.87.8 ZIP *already includes* those patches. Previous patches do **not** need uploading separately.
**Code is not deployed** by creating this ZIP. GitHub, Netlify Production and existing DB have not been changed.

## ပြင်ဆင်ချက် (What's changed)

1. **Admin Dashboard Cleanup:** The deploy builder removes the *Admin-only load* of `yk-jlpt-learning-v782-state.js`, `yk-jlpt-learning-v782-dashboard.js` and `yk-learning-v760.js` (plus their four dedicated style sheets). These were inserting a personal JLPT N5–N1 lesson progress, Bookmark, Daily Practice and My Mistakes card onto the Admin management screen. **Student/Member Dashboard scripts and personal JLPT tools remain unmodified.** No original source HTML is deleted; the changes are limited to the public generated `dist/admin-dashboard.html`.
2. **Keep useful Admin reporting:** Aggregate verified Exam Analytics (including JLPT Exam Result figures) remains available. The JLPT student activity graph is folded under **JLPT Student Activity Analytics** in Admin, clearly labelled **aggregate**, not personal progress.
3. **Preserve Announcement Publishing:** Because the old `yk-learning-v760.js` combined personal study and Admin announcement publishing, its Admin-only announcement action is replaced with a small **Announcement Management** pane. Uses existing `yk-announcement-admin` Netlify function. Student/Member existing Learning Tools continue without change.
4. **Admin Enrollment CRM:** Admin can manually add, edit, delete and filter class inquiries by Truck / Taxi / Bus / General, status New / Contacted / Interested / Enrolled / Closed, source, contact channel and next follow-up date. Counts and overdue follow-ups displayed. The last 100 updated records are shown, while status totals count all records. Optional existing YKCR Student ID is a **manual unverified reference**, *not* YKCR sync and does not create students.
5. **Admin-only & privacy:** New `yk-enrollment-crm` endpoint requires authenticated Netlify Identity **admin** for read and writes. Writes are same-origin JSON, data validated. Responses use `private, no-store`. No public lead list, no auto-DM or scraping Messenger, no public visitor data collection. Save only details from people who contacted you or consented to follow-up.
6. **Growth data separated:** The CRM status `Enrolled` is not automatically added to v7.87.7 manual income ledger or YKCR. CRM status counts ≠ paid enrollment invoices. Avoid duplicate counting; record real revenue only in existing Business Growth bookkeeping.
7. **Performance:** CRM and Announcement data are loaded **only when Admin opens their sections**. No new request on Student/Member Dashboard or the public Website.

## New files in this release

- `assets/yk-v7878-admin.js`, `.css`
- `scripts/build-v7878-admin-crm.mjs`
- `netlify/functions/yk-enrollment-crm.mts`
- `netlify/functions/_shared/yk-crm-validation-v7878.mjs`
- `netlify/database/migrations/20261112140000_yk_enrollment_crm.sql`
- `tests/v7878-source.mjs`, `v7878-release.mjs`, `v7878-crm.mjs`, `v7878-crm-api.mock.mjs`
- Updated `package.json`, version-guard and earlier source QA checks to recognize **7.87.8**.

## Database migration (important)

The ZIP includes both previous v7.87.7 `20261112090000_yk_growth_analytics.sql` and new **v7.87.8** `20261112140000_yk_enrollment_crm.sql`. The latter creates the **lead/prospect** table `yk_enrollment_leads` (not a new Student database). Check that both migrations have been successfully applied in the Netlify Database environment before testing CRM. No changes to `exam_students`, `exam_attempts`, `exam_payment_requests`, YKCR tables or Identity.

The new table stores personal contact details. Use Admin permissions, access restriction, reasonable retention, and deletion for no-longer-needed records. Avoid storing passwords, residence cards, sensitive details, IDs for identity verification, etc.

## Weekly upload — GitHub Desktop

1. Keep current `main` stable. When your weekly upload day arrives, **Fetch/Pull** first; use a temporary test branch and keep a backup of current repo.
2. Extract **ONLY the final v7.87.8 ZIP**. Copy its **contents**, preserving the `assets/`, `scripts/`, `tests/`, `netlify/functions/`, `netlify/database/migrations/` paths and replacing `package.json`, `service-worker.js`, existing version-guard and QA files in the existing repository root. **Do not replace `.git`, remove unrelated source, or copy local `dist` fixtures.**
3. Run `npm test` and `npm run build` locally or in a staging/preview workflow. Both may require the dependencies and the full original source tree. Verify 12 exam pages and Student/Member Dashboard remain the same.
4. Commit `v7.87.8 Admin Cleanup and Enrollment CRM` → Push branch → Netlify Deploy Preview → verify DB migration, role access, Create/Edit/Delete lead and announcements, Mobile (390px), Payment/YKCR login and exam autosave. Merge to `main` **only after preview succeeds**.
5. If the repository has advanced beyond the known v7.87.4 base, inspect/conflict-merge; do not blindly replace newer files.

## QA scope (honest limits)

- ✅ ZIP CRC and SHA integrity can be checked offline. ✅ JS syntax check, v7.87.5 runtime, v7.87.6 engine, v7.87.7 mock runtime and v7.87.8 CRM auth/input tests.
- ✅ Generated-fixture Admin cleanup and unchanged Student/Member/12 Exam SHA-256 regression.
- ✅ Chromium UI test (390px phone + 1280px desktop) with a mocked Netlify API, no full production account.
- ⚠️ **Full production repository Build, Netlify deploy, live Database migration, real Identity/Login, Payment and YKCR are NOT verified by these fixtures.** No production changes were made.

**Education Brand:** STUDYING WITH YE KUN · **Theme:** Premium Black / White / Crimson Red · **Languages:** existing Myanmar / English / Japanese Dashboard framework left intact.
