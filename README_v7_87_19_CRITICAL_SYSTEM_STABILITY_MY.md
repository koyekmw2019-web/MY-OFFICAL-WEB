# YE KUN Official Website — v7.87.19
## Critical System Stability & Integration Safety — Weekly Cumulative Source Patch

**Base:** previous assistant-delivered `YEKUN_v7.87.18_Exam_Access_Plans_UI_CUMULATIVE.zip` (173 entries). **Target:** existing `koyekmw2019-web/MY-OFFICAL-WEB` repository; the most recently confirmed `main` baseline was v7.87.4. This ZIP includes v7.87.5–v7.87.19 cumulative changes and is **NOT** a complete repository or a deployed website.

## ဘာတွေ ပြင်ထားလဲ

1. **Student Verification Race Safety:** `netlify/functions/exam-student-verify.mts` မှာ Student ID/Code မှန်မှန် စစ်ပြီးနောက် `linked_user_id` ကို **PostgreSQL guarded UPDATE** နဲ့ ပြောင်းပါတယ်။ တခြား Account က အရင်ချိတ်သွားရင် 409 ပြန်မယ်။ Record status, Student Code နဲ့ Verification Hash ပြောင်းသွားရင်လည်း stale verification ကို 409 နဲ့ ပိတ်ထားမယ်။ မူလ YKCR/`exam_students` ကိုပဲ ဆက်သုံးထားပြီး Student DB အသစ် မဖန်တီးပါ။
2. **Payment Submission Truthfulness:** `netlify/functions/exam-payment-submit.mts` မှာ Receipt + Payment Request **အောင်မြင်စွာသိမ်းပြီးနောက်** Admin email notification Error ဖြစ်ရင် Payment ကို “မတင်ရသေး” လို့ HTTP 500 မပြတော့ပါ။ `ok:true`, `status:pending`, `adminEmailNotification.sent:false` နဲ့ ပြန်မယ်။ Admin က စာရင်းထဲ Pending Request ကို ဆက်စစ်ရမယ်။ Email notification failure ကို Netlify logs မှာ မှတ်တမ်းတင်မယ်။ Resend မရတာကို ဖြေရှင်းပေးတာ မဟုတ်ပါ။
3. **Payment Data Validation:** `toString` ကဲ့သို့ prototype property ကို Plan Code အဖြစ် မလက်ခံပါ။ Bank Configuration array မမှန်ရင် validation error ပြမယ်။ Name/Bank Key length, Transfer Date format, Receipt max 4.5 MB ကို စစ်မယ်။ Plan Prices၊ Plan Codes၊ Bank Transfer Process မပြောင်းပါ။
4. **Admin Permission:** `netlify/functions/_shared/auth.mts` မှာ `roles` မပါသူ / malformed roles တွေကို 500 မဟုတ်ဘဲ **403 Forbidden** အဖြစ် handle လုပ်မယ်။ Admin မဟုတ်သူဆီ Admin Access မပေးပါ။
5. **Sensitive Status Cache:** `netlify/functions/exam-status.mts` မှာ authenticated user data ကို `Cache-Control: private, no-store` ထည့်ထားပါတယ်။ Exam Type တစ်မျိုးကို အခမဲ့တစ်ကြိမ်ဆိုတဲ့ မူလ Policy ကို မပြောင်းထားပါ။
6. **Admin-only System Health:** `netlify/functions/yk-system-health.mts` အသစ် ထည့်ပါတယ်။ Login/Admin Role စစ်ပြီး DB Table 9 ခု၊ Free-Attempt Index၊ Score Verified Column၊ Bank Configured၊ Admin Email/Resend/YKCR Secret Configured **boolean values** တွေကိုပဲ ပြန်မယ်။ **Bank Account၊ Secret၊ Student Data မပြပါ**။ Read-only Query တွေဖြစ်ပြီး Payment၊ Exam Attempt၊ YKCR ကို မပြောင်းပါ။
7. **Release Gate:** `tests/v78719-release.mjs` က Full Repository Build အပြီး Exam Center + 12 Exam Pages၊ Plan Prices၊ Access UI၊ Published Assets၊ Payment Approval Row Lock/Transaction၊ YKCR HMAC Sync Protection နဲ့ Public Output ထဲ Backend File မပါမှုကို စစ်တယ်။ `tests/v78719-release-fixture.mjs` က Tampered Price / Private Backend Leak negative fixture test ပါ။

## Admin Health Check (Deploy Preview မှာသာ စစ်ပါ)

1. Existing Repository ကို Weekly GitHub Desktop Workflow နဲ့ Backup/Feature Branch လုပ်ပါ။ Latest Cumulative ZIP ကို Repository root ထဲ **relative path အတိုင်း** copy/replace လုပ်ပါ။ `.git` ကို မဖျက်ပါနဲ့။ ZIP အပြည့်ကို Netlify တင်ခြင်း မလုပ်ပါနဲ့။
2. Repository အပြည့်ထဲမှာ `npm install` (lockfile diff ကိုစစ်), `npm test`, `npm run build`, `npm run verify:release` ကို run လုပ်ပြီး အောင်မြင်ရပါမယ်။ Netlify Deploy Preview ကို Production မတိုင်ခင် စမ်းပါ။
3. Admin Account ဖြင့် Authenticate လုပ်ပြီး `/.netlify/functions/yk-system-health` ကို **Preview Site** မှာ GET လုပ်ပါ။ `schemaReady: true` နဲ့ Config Bool ၄ ခုကို ကြည့်ပါ။ `false` ရှိရင် အဲဒီ Config/Migration ကို စစ်ပါ။ Health Check က Read-only ဖြစ်ပြီး Bank Account Info, Email Key, YKCR Secret တို့ကို မဖော်ပြပါ။
4. Test Account များဖြင့် Login/Logout, Student Verify (အကောင့် ၂ ခု conflict), 12 Exam Types, one free attempt **per exam type**, Auto Save/Resume, Free→Paid, Pending Receipt→Admin Review→Approved Access, Approval Duplicate/Reject/Expire, YKCR signed sync and Mobile UI ကို စမ်းပါ။ **တကယ့်အသုံးပြုသူရဲ့ Student/Payment Data ကို Test မလုပ်ပါနဲ့**။
5. v7.87.7 Growth, v7.87.8 CRM အပါအဝင် Netlify Database Migration အားလုံး apply လုပ်ပြီးသားလား စစ်ပါ။ v7.87.19 မှာ **Migration အသစ် မပါပါ**။
6. Production ထဲ တင်ပြီး Health Check/Logs မအောင်ရင် GitHub/Netlify မှာ နောက်ဆုံး Working Deploy ကို Restore လုပ်နိုင်ဖို့ Commit/Deploy ID ကို ကြိုတင်သိမ်းထားပါ။ Data Migration ကို rollback အလိုအလျောက် မလုပ်ပါနဲ့။

## ဘာတွေ **မပြောင်း** သလဲ

- 12 Mock Exam Scoring, Timer, Free Attempt Quotas, Access Plan Prices (¥1,000/¥2,000/¥3,000/¥5,000), Admin Approval Transaction Logic, Identity Login UI, YKCR HMAC receiver, Grammar 509/例文 1,018, Student Calendar, Smart Weakness, Admin CRM, Marketing Analytics
- No new Student DB, no new SQL Migration, no existing rows deleted, no GitHub/Netlify production write, no actual bank transfer

## QA အမှန်တကယ် စမ်းထားတဲ့ Scope

- `tests/v78719-backend.mock.mjs`: **18 behavior assertions PASS** with fake Identity, fake DB, fake Blob Store and fake Email Provider. Covers 403 role, student verification race, plan validation, email-outage-after-insert, no-store and health checks. **Not an actual Netlify E2E test.**
- Previous selected regression suites: **34/36 PASS on v7.87.19 cumulative patch alone**; 2 old source tests required 4 UI assets/build files present in original GitHub baseline. With corresponding original v7.87.3/v7.87.4 patch assets staged in a **test-only workspace**, both also PASS. Those older assets **are not added** to this cumulative ZIP, because they're already expected in GitHub main.
- `tests/v78719-release-fixture.mjs`: PASS for 13 synthetic Exam routes, rejects tampered plan price and accidental publishing of backend code.
- Source/ZIP integrity and previous 173 cumulative entries preservation checked independently.
- **NOT DONE:** complete `npm test`/`npm run build` using actual GitHub checkout, Netlify Preview, live Identity/Payment/YKCR, phone LCP/INP/CLS, full manual Grammar linguistic verification. Do not label this patch Production Stable until those pass.

## Important operational notes

- Notification failure no longer falsely tells users their payment submission failed, but it **does not retry/resend Admin Email automatically**. Admin must check Payment Requests and Netlify logs. Duplicate submissions remain possible if clients resend requests; no new payment idempotency schema is introduced.
- An Admin Health Check returning `200`/`schemaReady:true` is **not** proof that Bank Transfer, SMTP, YKCR sync or Login works end-to-end.
- Do not upload/merge/auto-deploy multiple cumulative ZIPs separately; use this latest patch once on Weekly Upload Day.
