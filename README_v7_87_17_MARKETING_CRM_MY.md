# YE KUN Official Website — v7.87.17 Marketing & Enrollment CRM Improvements

**Release type:** Cumulative source-code PATCH / Local QA Release Candidate  
**Base:** `YEKUN_v7.87.16_Student_Learning_Calendar_Study_Goals_CUMULATIVE.zip` (verified 149/149 previous files preserved, with intentional updates to code/tests).  
**Status:** Local source, mocked API, synthetic Chromium QA passed. **NOT** a verified full Netlify/production build.

## Boss ကြီးအတွက် အဓိက Update

1. **Admin Marketing & Enrollment Insights** — Admin Dashboard ရဲ့ `Enrollment Insights` ကို ဖွင့်မှသာ CRM Analytics API ကို ဖတ်ပါတယ်။ Student/Member/Home/Exam Page မှာ ဒီ Script မတင်ပါဘူး။
2. **CRM Pipeline** — 7 / 30 / 90 ရက် သို့မဟုတ် All Time ရွေးပြီး သတ်မှတ်ကာလအတွင်း **စတင်စာရင်းသွင်းခဲ့သူ** တွေရဲ့ **လက်ရှိ Status** ကို New, Contacted, Interested, Enrolled, Closed အလိုက် ကြည့်နိုင်ပါတယ်။ သမိုင်းကြောင်းအရ Stage Change Count မဟုတ်ပါ။
3. **Course & Source Breakdown** — TRUCK / TAXI / BUS / General နဲ့ Facebook / YouTube / Google / Website / Referral / Manual / Other ကို CRM ထဲက **Admin ရေးထည့်ထားတဲ့ Source** အတိုင်း စုပြပါတယ်။
4. **Follow-up Focus** — Overdue, Due Today, Next 7 Days, No Follow-up Date (status New/Contacted/Interested သာ) ကို **စာရင်းအချိန်ကာလအပြင်ဘက်က Active Leads အားလုံး** ပါတွက်ပါတယ်။ အစောဆုံး Due Lead 20 ယောက်အထိ Admin အတွက်ပဲ နာမည်/ID/သင်တန်း/Source/Date ဖော်ပြပါတယ်။ Contact Reference/Notes မပို့ပါဘူး။
5. **CRM List Filters** — Existing CRM panel ထဲမှာ Status, Course, Source, Name/Contact Search, Due Only, Clear Filters ထည့်ထားပါတယ်။ Form ထဲရေးထားတဲ့ Draft ကို Filter ပြောင်းရုံနဲ့ ဖျက်မပစ်ပါဘူး။ Filter က **လက်ရှိ CRM API ပြန်ပေးတဲ့ နောက်ဆုံး Update 100 Leads အတွင်းမှာသာ** ရှာပေးပါတယ်။ Database တစ်ခုလုံး Full Search လုပ်နိုင်တဲ့ Feature မဟုတ်သေးပါ။
6. **Marketing Clicks (separate)** — Existing `yk-business-growth` endpoint က Website CTA Click Count ကို 7/30/90 နဲ့ ဖတ်ပြပါတယ်။ All Time ကို မတွက်ပါဘူး။ **Clicks != Confirmed Inquiries != Paid Class Enrollments** ဖြစ်လို့ ဒီ Dataset တွေကနေ Campaign Conversion Rate ကို မတွက်ပါ။
7. **Language & Mobile** — Myanmar / English / Japanese UI labels၊ Admin CRM Filter Labels၊ Mobile 390px/ Desktop 1280px Layout ကို Local Browser မှာ စစ်ထားပါတယ်။

## Data Truth & Safety

- **Admin entered `enrolled` status** က YKCR Verified Student သို့မဟုတ် ပေးချေပြီးကြောင်း အထောက်အထား မဟုတ်ပါ။
- CRM က Customer ကို Message/Email အလိုအလျောက် **မပို့ပါ**။ No automatic reminders; follow-up lists are visible only when Admin opens the panel.
- Existing CRM Table `yk_enrollment_leads` (v7.87.8 migration) ကို read-only aggregate query နဲ့ အသုံးပြုထားပါတယ်။ **New DB migrations = 0**။
- Netlify Functions အသစ် `yk-enrollment-insights.mts` မှာ `requireAdmin()` သုံးပြီး Unauthorized Access ကို ပိတ်ထားပါတယ်၊ `Cache-Control: private, no-store` ပါဝင်ပါတယ်။
- Existing Exam/Payment/YKCR/student tables ကို Query, Insert, Update, Delete မလုပ်ပါ။ Existing Backend Functions မပြောင်းပါ။
- Browser local Study Calendar/Grammar progress, Exam rules, free attempts, paid exam approval unaffected.
- CRM မှာ User ကိုယ်တိုင် ဆက်သွယ်လာသူ (သို့) follow-up သဘောတူထားသူ၏ contact သာ သိမ်းပါ။ မလိုအပ်တဲ့ Personal Data မစုဆောင်းပါနှင့်။

## Code Changes (important)

- `netlify/functions/yk-enrollment-insights.mts` — new **Admin-only read-only** endpoint.
- `netlify/functions/_shared/yk-crm-insights-v78717.mjs` — constrained period validation & pure owner-entered stage aggregation.
- `assets/yk-v78717-admin.js`, `assets/yk-v78717-admin.css` — new Insights UI (lazy request only when opened).
- `assets/yk-v7878-admin.js`, `assets/yk-v7878-admin.css` — **intentionally modified** prior CRM UI for non-destructive filters.
- `scripts/build-v78717-marketing-crm.mjs` — injected **after** v7.87.16 build into `dist/admin-dashboard.html` only.
- `tests/v78717-engine.mjs`, `tests/v78717-api.mock.mjs`, `tests/v78717-source.mjs`, `tests/v78717-release.mjs`, `tests/v78717-build-fixture.mjs`, `tests/v78717-browser-qa.py` — QA.
- `package.json` — v7.87.17 cumulative build/test/release chain.
- Previous version allowlists, preflight and earlier tests adjusted to accept v7.87.17 **without deleting old regression assertions**.

## Weekly GitHub Desktop Update

**GitHub main was v7.87.4 when checked on Nov 12, 2026**. This ZIP is a cumulative patch from v7.87.5 through v7.87.17, **not the entire website repository**. Previous patch ZIPs are not required when its base is unchanged.

1. In GitHub Desktop open existing `koyekmw2019-web/MY-OFFICAL-WEB` repository. Confirm the branch is the expected source base (v7.87.4); **do not overwrite newer unreviewed commits**.
2. Backup the working tree / create a branch and copy all ZIP file paths over corresponding files inside this existing repo. **Keep `.git`, existing public HTML, `src/`, `netlify.toml` and historical migration files. Do not replace repo with the ZIP folder alone.**
3. Run `npm ci` (with existing lockfile unchanged) or install dependencies as appropriate, then `npm test`, `npm run build`, `npm run verify:release` from the full repo directory. The preflight intentionally refuses incomplete checkouts.
4. Validate `dist/admin-dashboard.html` contains `/assets/yk-v78717-admin.js?v=78717` and corresponding CSS; Student/Member/Home/Exam Pages must not load the admin script.
5. Deploy to a **Netlify Deploy Preview** first, apply/verify the **already required** v7.87.7 & v7.87.8 migrations before testing Admin CRM, then check Admin Login, permissions, CRUD, dates/JST, Marketing clicks, payment/Exam/YKCR regression, mobile and language switch.
6. Check error logs and normal operation before weekly production deploy. Keep prior deploy for rollback.

## Verified vs. Not Verified

✅ Local Node source tests / admin API mock / pure math / synthetic fixture / Chromium 390px + 1280px / role isolation / HTML injection safety / draft preservation / ZIP CRC.  
⏳ Full intact-repository `npm test` and `npm run build`, real migration and Netlify preview, live identity/paid exam/YKCR, production performance, true conversion measurement. **Not performed** in this patch-only environment.  

**No GitHub pushes, Netlify deployments, Database mutations, notifications, or Messenger sends performed by this update.**
