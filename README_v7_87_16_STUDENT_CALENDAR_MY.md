# YE KUN Official Website — v7.87.16
## Student Learning Calendar & Study Goals (Weekly Cumulative Source Patch)

**Status:** Local Source/Engine/Chromium Synthetic QA PASS. **Full Netlify build & production workflow NOT verified.**

### ✅ ဘာတွေ ထည့်ထားလဲ
- `/study/jlpt-study-calendar.html` — Calendar အသစ်။ လအလိုက် နေ့ 42 ခုကို mobile-friendly grid ဖြင့် ကြည့်နိုင်ပါတယ်။
- Grammar Practice ပြီးဆုံးထားတဲ့ sessions ကနေ တစ်နေ့ ဖြေပြီးတဲ့ မေးခွန်းအရေအတွက်ကို အလိုအလျောက် တွက်ပါတယ်။ **အဖြေတစ်ခုချင်းမဟုတ်၊ ပြီးဆုံးထားတဲ့ sessions သာ** ရေတွက်ပါတယ်။
- Daily Grammar Goal: 5, 10, 20 questions per day; Weekly Study Days Goal: 1–7 days per week (တစ်နေ့တစ်ကြိမ်သာ ရေတွက်)။
- စီစဉ်ထားတဲ့ နေ့တစ်နေ့စီအတွက် N5–N1 Level၊ Grammar/Vocabulary/Kanji/Reading/Listening/Review focus နဲ့ 140-character note ကို သိမ်းနိုင်ပါတယ်။
- Grammar အပြင် အခြားလေ့လာမှုတွေအတွက် ကိုယ်တိုင် “သင်ယူပြီးပြီ” ဟု check-in လုပ်နိုင်ပါတယ်။ **Self-report** ကို အလိုအလျောက် Grammar question count လို့ မယူဆပါ။ အနာဂတ်နေ့ကို ပြီးစီးအဖြစ် မမှတ်နိုင်ပါ။
- Weekly Study Days၊ Grammar Questions၊ Study Streak၊ Personal Target Date Countdown; target date is NOT official JLPT exam date.
- Student Dashboard ထဲမှာ Calendar Goal Summary Card; Admin/Member Dashboard မထည့်။ Grammar Practice / JLPT Learning Center မှာ calendar link တွေ ပါပါတယ်။
- Myanmar / English / Japanese interface switch; selected language ကို `yk_lang` ဖြင့် မှတ်သားပါတယ်။

### ⚠️ သိထားသင့်တဲ့ ကန့်သတ်ချက်များ
- **Local browser storage only**: `yk_study_calendar_v78716_v1` နှင့် Grammar Practice `yk_grammar_mastery_v78714_v1` ကို ဒီ Browser မှာသာ အသုံးပြုပါတယ်။ Account-scoped Cloud Sync မပါ။ Browser တူ/Device တူမျှသုံးရင် Study Plans ပေါင်းနိုင်ပါတယ်။
- Grammar Practice sessions မှတ်တမ်းက v7.87.14 အတိုင်း နောက်ဆုံး **180 sessions** ကိုသာ သိမ်းထားနိုင်ပါတယ်။ အလွန်ဟောင်းတဲ့အရာတွေ Calendar မှာ မမြင်ရနိုင်ပါ။
- Vocabulary/Reading/Listening တို့မှာ session completion auto-tracking မရှိသေးပါ။ Manual completion ကို Self-report အဖြစ်သာ ပြပါတယ်။
- Calendar ဟာ **အလိုအလျောက် Reminder, Push Notification, Google Calendar Sync မဟုတ်ပါ**။
- Daily Grammar Goal ပြည့်/မပြည့်ကို Manual Check-in ဖြင့် မပြောင်းနိုင်ပါ။ Calendar data က Official JLPT Score / Verified Exam Attempt မဟုတ်ပါ။
- Student Dashboard widget ကို student role မှာသာ ထည့်ထားသည်။ Calendar web page ကို URL သိသူက ဖွင့်နိုင်သည်။ အဲဒီ Page က အကောင့်ဆိုင်ရာ confidential data မဖတ်ပါ။
- **Full GitHub checkout မရှိသေးလို့ `npm run build`, live Login/Payment/YKCR/Netlify deploy, production browser performance စစ်မရသေးပါ**။

### 🔐 မပြောင်းထားတာ
- `netlify/functions/*`, database migrations, Identity, Exam Access, Payment, YKCR/student records, Admin CRM, Exam Timer/Score/Free Attempt.
- JLPT Grammar 509 records and existing practice grading/insights unchanged.

### ✅ Local QA
- 26/26 Source/Runtime/Fixture regression jobs PASS (`QA_v7_87_16_TEST_LOG.txt`).
- v7.87.14, v7.87.15, v7.87.16 Chromium synthetic UI checks PASS at 390px / 1280px, role isolation and input preservation.
- Calendar Engine: calendar dates, invalid day rejection, DST-safe date arithmetic, 5/10/20 goals, weekly counts, auto sessions vs self-report, no future check-in, localStorage cap/limit.
- Synthetic release gate: Missing new assets block output. It is NOT the actual production build.
- ZIP integrity and 132 original v7.87.15 files included; backend and Grammar JSON byte-identical.

### Weekly GitHub Upload လုပ်နည်း (မတင်ရသေး)
1. **နောက်ဆုံး v7.87.15 ZIP ကို သီးသန့်တင်စရာမလိုပါ**။ v7.87.16 Cumulative ZIP ထဲမှာ ယခင် patch အားလုံး ပါပါတယ်။
2. GitHub Desktop မှာ မူလ existing repository `koyekmw2019-web/MY-OFFICAL-WEB` ကို pull လုပ်ပြီး latest `main` version ကိုကြည့်ပါ။ Target base `7.87.4`; main မှာ နောက်ထပ် Update ရှိရင် Conflict စစ်ပြီးမှ ပေါင်းပါ။
3. Backup/branch တစ်ခုမှာ ZIP ထဲက files ကို repository root ပေါ် copy/replace လုပ်ပါ။ **`dist/` က ZIP မပါပါ**။ Git source ရှိတဲ့ မူလ files, `.git` ဖိုင်တွေနဲ့ server code ကို မဖျက်ပါ။
4. `npm install` (လိုမှ), `npm test`, `npm run build`, `npm run verify:release` လုပ်ပါ။ Fail ဖြစ်ရင် Production မတင်ပါနဲ့။
5. Netlify Deploy Preview နဲ့ signed-in Student dashboard, planner, grammar session, role isolation, live payment/YKCR/Exam flow ကိုစစ်ပါ။ Previous v7.87.7/v7.87.8 migration requirements ဆက်ရှိပါသည်။
6. အောင်မြင်မှ Weekly Upload/Deploy အဖြစ် တင်ပါ။ ZIP ထုတ်ခြင်းသည် GitHub/Netlify/Database သို့ upload/deploy လုပ်ခြင်း မဟုတ်ပါ။

### Files new in 7.87.16
- `study/jlpt-study-calendar.html`
- `assets/yk-v78716-calendar-engine.js`, `assets/yk-v78716-calendar.js`, `assets/yk-v78716-calendar.css`
- `assets/yk-v78716-student.js`, `assets/yk-v78716-student.css`, `assets/yk-v78716-link.css`
- `scripts/build-v78716-study-calendar.mjs`
- `tests/v78716-engine.mjs`, `tests/v78716-source.mjs`, `tests/v78716-release.mjs`, `tests/v78716-build-fixture.mjs`, `tests/v78716-browser-qa.py`
- `QA_v7_87_16_STUDENT_CALENDAR.json` + test log + cumulative manifest.
