# YE KUN Official Website v7.87.7 — Business Growth & Marketing Analytics

**Delivery:** WEEKLY CUMULATIVE SOURCE PATCH (NOT a fully built website ZIP). Base is **the previously delivered v7.87.6 Smart Learning CUMULATIVE PATCH ZIP**, itself based on GitHub `main` v7.87.4 + v7.87.5. **Keep all previous v7.87.5 and v7.87.6 files**; this ZIP contains the additive changes from all three versions. Do **not** reapply the old patches separately.

**Education brand:** STUDYING WITH YE KUN. **Theme:** Black / White / Crimson Red. **No PDF.**

## New in v7.87.7

1. **Admin-only Business Growth panel** on `admin-dashboard.html`, alongside—not replacing—current Admin Dashboard. Period picker 7/30/90 days, data source breakdown and small-screen responsive layout.
2. **Class inquiry CTA** on the three *existing* public guide pages `/study/ssw-truck.html`, `/study/ssw-taxi.html`, `/study/ssw-bus.html`, plus measurement of the existing Video Course consultation link. Contact URL was verified in the current website's `video-class.html`: `https://www.facebook.com/share/19kc6Vk9XM/`. This is a **Facebook contact page/link, not a guaranteed direct Messenger chat**. Original Mock Exam CTA remains.
3. **UTM Campaign Link Builder** on Admin Dashboard: Facebook, YouTube, Google etc. Generates official site `study/ssw-{truck,taxi,bus}.html?utm_source=...&utm_medium=...&utm_campaign=...` links. Campaign parameters are held **only in the current browser session**; no user identifier cookie.
4. **Anonymized CTA click counts only**: POST `/.netlify/functions/yk-growth-event` triggers **on the deliberate Facebook class-contact CTA click** (no automatic pageviews, no names, email, student IDs, IPs, User-Agent, or referrer URLs in the app's marketing tables). Click tracking failures never stop external contact. Repeated or bot clicks may inflate counts; this is **not the count of unique visitors, enquiries or enrollments**.
5. **Owner-entered business ledger**: Admin can add **confirmed-inquiries**, **class enrollment revenue**, **marketing expense** as separate dated records (without student PII). Recent records can be deleted by Admin after confirmation; no integration with exam payment or YKCR student tables. Class revenue = manual ledger only. `revenue - recorded marketing costs` is **not net profit**, since taxes, labor, rent and other costs aren't included.
6. **Quality-controlled funnel**: website visitor count shows `Not measured`; class CTA clicks, owner-entered confirmed inquiries and owner-entered enrollments are **different datasets** without cohort linkage. Conversion percentage must not be invented. Existing active/total Student counts are displayed separately and are **not treated as attributed class conversions**.
7. **Exam access payments** from existing database are **shown separately**, not added to class revenue.

## Files added in v7.87.7

- `assets/yk-v7877-growth.js`, `assets/yk-v7877-growth.css`: Admin UI only.
- `assets/yk-v7877-cta.js`, `assets/yk-v7877-cta.css`: course CTAs and anonymous click measurement.
- `scripts/build-v7877-business-growth.mjs`: post-build public HTML wiring, called *after* v7.87.5 and v7.87.6 builders.
- `tests/v7877-source.mjs`, `tests/v7877-runtime.mjs`, `tests/v7877-release.mjs`: regression QA, source and mocked APIs.
- `netlify/database/migrations/20261112090000_yk_growth_analytics.sql`: **two new, isolated non-PII tables**. Old exam/students/payments/YKCR tables are unchanged.
- `netlify/functions/yk-business-growth.mts`: admin-only aggregate API and manual entry management.
- `netlify/functions/yk-growth-event.mts`: same-origin public click-event endpoint.
- `package.json` and test version compatibility files; public static cache version changed to include v7.87.7.

## VERY IMPORTANT — New database migration

v7.87.7 is **not a UI-only patch**. It introduces **two new database tables** (`yk_growth_click_events`, `yk_growth_manual_entries`) and two new Netlify functions. Confirm your Netlify Database migration was applied before the Admin panel is expected to show live data. If migration is not applied, the new Admin Growth panel shows an error, but existing Admin Dashboard / Exam Center continue to work. **Do not claim production data works based on local source tests alone.**

No extra database/provider, Google Analytics ID, tracking cookie, payment gateway or secret is required. A public same-origin event endpoint can be spoofed despite validation; click figures are directional, not audited. Public records contain course, UTM slug, page path and time only.

## Weekly upload workflow (important)

User uploads to GitHub **only once a week** to save Netlify build credits. **Do not upload individual v7.87.5, v7.87.6 and v7.87.7 patches one by one.**

1. Download and extract **this latest cumulative v7.87.7 ZIP**. It includes the previous changes.
2. In existing GitHub Desktop repo `koyekmw2019-web/MY-OFFICAL-WEB`, Fetch/Pull the branch with the matching **v7.87.4** baseline. Check `package.json` before applying; this patch is targeted at v7.87.4 (`main` as checked on Nov 12, 2026) plus no newer conflicting work.
3. Copy **the extracted ZIP's files and folders** into existing repository **root**, replacing the named files only. Do not delete `.git`, do not copy `dist/` and do not create a new GitHub repo. Verify the `netlify/database/migrations` and `netlify/functions` new files are included.
4. On the weekly upload day, ideally commit to a test branch and deploy preview first; after QA, merge and push `main` **once**. Example commit: `v7.87.7 weekly cumulative growth analytics`.
5. Verify Netlify deploy READY, DB migrations applied and new functions deployed. Test with Admin Login (non-admin must get 403), then create a manual test entry and delete it. Visit `/study/ssw-truck.html` with an UTM test campaign and click Facebook inquiry; check click count in Admin after refresh.
6. Test old flows after deployment: all 12 exam starts / one-free-attempt limit / timer / auto-save / student YKCR verification / private data / bank transfer approval / JLPT Dashboard.

## QA scope (honest limitations)

- PASS: v7.87.7 JS syntax, source contract checks, mocked API operations (GET, POST, DELETE), admin authentication guard, invalid event rejection, safe same-origin UTM, data aggregation, 'no fake visitors', source fixture injection and static 12-exam preservation.
- PASS: old v7.87.5/7.87.6 source files preserved in cumulative ZIP; no prior patch has been replaced with an outdated GitHub version.
- **NOT RUN:** full repository Netlify `npm run build`, database migration execution against production, live Identity Login, live YKCR sync/payment endpoints, conversion attribution with real traffic, real mobile/browser UI end-to-end test. Local browser navigation was blocked by the runtime and must be checked during Deploy Preview.
- Existing exams and accounting tables remain unchanged **by the new v7.87.7 builder**, but live regression is necessary to make a production stability claim.

**No GitHub push, Netlify deploy, Database migration, or user business data mutation was performed by this packaging work.**
