# YE KUN Official Website v7.84.0 — Admin & Student Dashboard Pro

**Base:** `YEKUN_v7.83_Dictionary_Quality_Examples_Update.zip` (2026-11-09)

STUDYING WITH YE KUN Education Platform ကို လက်ရှိ Design၊ Login၊ Student Verification၊ Payment၊ YKCR Sync၊ Exam Rules နှင့် Dictionary ကို မပြောင်းဘဲ Admin / Student Dashboards အတွက် **ထပ်ဖြည့်ထားသော Update** ဖြစ်ပါတယ်။

## Admin Dashboard Pro

- Active Students = ရှိပြီးသား `exam_students` ၏ `status='active'` နှင့် သင်တန်းစတင်/ကုန်ဆုံးရက်အတွင်း Active ဖြစ်သူများ။
- Pending Payments = `exam_payment_requests` ရှိ `deleted_at IS NULL` နှင့် `status='pending'` Count။ Payment Approve/Reject Backend အဟောင်းအတိုင်း။
- Exam Pass Rate = **Server-verified, submitted Mock Exams** များသာ။ `score_verified=TRUE` နှင့် `passed IS NOT NULL` ဖြစ်သူအရေအတွက်အပေါ် တွက်ချက်ထားပါတယ်။ Legacy/Unverified Score မပါပါ။ 0 အရေအတွက်ဆို `—` ပြပါတယ်။ ဂျပန် Official Exam Pass Rate မဟုတ်ပါ။
- Exam Pass Rate by Type = Truck/Taxi/Bus/JLPT စသည့် Exam Type တစ်မျိုးချင်း Performance ကို ခွဲပြထားပါတယ်။
- Graph = 7 / 30 / 90 Days နှင့် Japanese local calendar dates (Asia/Tokyo)။ Verified Exam Submission နဲ့ Learning Daily Practice Sessions ကို စစ်မှန်တဲ့ Aggregates နဲ့သာ ဖော်ပြပါတယ်။
- Learning Progress = Existing `yk_jlpt_learning_progress` မှ Account Count၊ Complete Lessons စုစုပေါင်း၊ recent account updates နှင့် Daily Practice sessions။ **Completed Lesson count က လက်ရှိစုစုပေါင်းသာ၊ Daily Completed Lessons History မဟုတ်ပါ။**
- YKCR Sync = Website Receiver မှ `ykcr_sync_events` Received Count၊ Past 24 hours / 7 days Count၊ Last Received Date။ **YKCR Source-side Pending/Failed Delivery Queue Status ကို ယခု Website Receiver က မဖတ်နိုင်သေးလို့ Unknown / Not connected ဟု ပြထားပါတယ်။** Received events 0 ဖြစ်တာကို Sync Error လို့ မသတ်မှတ်ပါ။
- Admin API: `GET /.netlify/functions/exam-admin-analytics?days=7|30|90`. **Netlify Identity Admin only**, private no-store၊ Aggregated Data only၊ DB Read-only။

## Student Dashboard Pro

- Current logged-in account ရဲ့ **latest 50 exam attempts** (`exam-my-activity`) ထဲက `score_verified===true` submissions အပေါ် Verified Score Summary / Low Scoring Exam Areas ပြပါတယ်။ Mock Exam Exam Type တစ်မျိုးအတွင်း 2 ကြိမ်နှင့်အထက် Verified Result ရှိပြီး Average Score 70% အောက်ဖြစ်မှ `Exam Areas to Review` ပြပါတယ်။
- `yk-learning` က **last 50 saved wrong answers** ရဲ့ missed_count ကို အခြေခံပြီး Wrong Answer Review ကို ဦးစားပေးထားပါတယ်။
- `jlpt-learning-progress` ထဲက `completed` + Original Lesson Data/Reading Supplement ကို သုံးပြီး JLPT Level / Subject အလိုက် **Study Coverage (မပြီးသေးသော Lessons)** ပြပါတယ်။ ဒါကို အမှန်တကယ် စာမေးပွဲဘာသာရပ် အားနည်းချက် (subject-level wrong-answer percentage) လို့ မခေါ်ပါဘူး။ လက်ရှိ Backend မှာ Verified subject-level test scores မသိမ်းသေးလို့ပါ။
- Next Practice = (1) Wrong Answers → ရှိပြီးသား Smart Learning Dashboard section, (2) Low scoring mock exam type → Exam Center, (3) Incomplete JLPT subjects → သက်ဆိုင်ရာ JLPT Level+Section ကို တိုက်ရိုက် Link။
- Verified Score မရှိရင် False Weakness မကြေညာဘဲ Data Insufficient လို့ ပြပါတယ်။
- Recommendation က Free Attempt ကို မသုံးဘူး၊ Payment / Exam Access Rule မပြောင်းဘူး။

## New and Changed Files

**New**
- `netlify/functions/exam-admin-analytics.mts`
- `assets/yk-dashboard-pro-v784-engine.js`
- `assets/yk-dashboard-pro-v784.js`
- `assets/yk-dashboard-pro-v784.css`
- `tests/v784-dashboard-pro.mjs`
- `tests/v784-admin-api.mock.mjs`
- `scripts/v784-browser-smoke.py`
- This README, `QA_v7_84_RELEASE.json`

**Changed**
- `admin-dashboard.html`, `student-dashboard.html`: v7.84 assets ထပ်ချိတ်ထား။
- `package.json`: version 7.84.0၊ QA scripts။
- `service-worker.js`: Public Asset Cache version အသစ်။
- Existing regression test ၅ ခု: v7.84 release version allowlist update သာ။

**Unchanged**
- `member-dashboard.html`, `index.html`, `dictionary-reports.html`, original Dictionary JSON/JS/CSS and all Anime Character original assets; previous Auth, Payment, Exam, YKCR Functions and existing DB migrations. **New DB migration not required** for v7.84.

## Deployment & Live QA (existing GitHub Desktop Repository)

1. Current GitHub branch backup/commit သေချာယူပြီး ZIP ကို ရှိပြီးသား Repository အမြစ် (root) ထဲ ဖြည်ပါ။ New Repo မတည်ဆောက်ပါနဲ့။
2. GitHub Desktop မှာ Changes ကို စစ်ဆေးပြီး Existing Repo ကို Commit/Push လုပ်ပါ။ `node_modules`, `.env`, secret keys တို့ မတင်ပါနဲ့။
3. Netlify Staging Deploy Build (`npm run build`) ကို အမှန်တကယ်စစ်ပါ။ ဒီ Build Artifact ကို Local Environment မှာ npm Registry network error ကြောင့် အပြည့်အစုံ Build မစစ်နိုင်ခဲ့ပါ။ v7.83 migration status ကိုလည်း သီးခြားစစ်ပါ။
4. Admin နဲ့ Login ဝင် → `/admin-dashboard.html` → Counts, 7/30/90 Day filters, Exam Pass Rate နှင့် YKCR Receiver Event Counts ကို တကယ့် DB မှာ စစ်ပါ။ `/.netlify/functions/exam-admin-analytics` က Member/Student အတွက် 403 ဖြစ်ရပါမယ်။
5. Verified Student နဲ့ Login → `/student-dashboard.html` → ကိုယ်ပိုင် Exam Results, Mistakes, Lesson Progress / JLPT Level Switch / Recommended Links ကို စစ်ပါ။ User A ရဲ့ Data ကို User B က မမြင်ရကြောင်း စစ်ပါ။
6. Payment Approve/Reject, Student CSV Import, YKCR Signed Sync, Exam One-Free-Attempt Rule, Dictionary Report Admin Approval, Login/Logout ကို Regression Smoke စစ်ပါ။
7. Mobile/Tablet နဲ့ Desktop Live Browser စစ်ပါ။ Site Build ပြဿနာရှိလျှင် production deploy ကို မမြှင့်ပါနဲ့။

## Quality Verification Limitations

- Source static/unit tests and local browser **fixture-based UI** tests are run; **sample figures shown in screenshots are not customer data**.
- Live Netlify Auth/DB/YKCR/Payment/Exam Integration and real live browser flows **not verified** from this local working environment.
- New API's SQL expressions are reviewed and mocked; a real DB query integration test must be performed on Staging.
- `npm install` failed because `registry.npmjs.org` could not resolve (`EAI_AGAIN`), preventing full `npm run build`. Do not mark deploy-ready until Netlify build succeeds.
- No PDFs added.
