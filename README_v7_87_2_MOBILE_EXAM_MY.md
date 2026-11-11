# YE KUN Official Website v7.87.2 — Separate Exam Pages & Mobile Speed

**Base:** GitHub `koyekmw2019-web/MY-OFFICAL-WEB`, `main` at v7.87.1 (checked commit `85cbbcb5e4a71062f5e58a30ce0f03f423e55525` on 2026-11-11).

**Brand:** STUDYING WITH YE KUN · Myanmar / Japanese / English · Black / White / Crimson Red.

**Package type:** **SOURCE PATCH ZIP (overlay), not the entire source repository.**

## ဘာတွေပြင်ထားလဲ

1. Study Hub ထဲက Truck/Taxi/Bus/Driving/JLPT Exam Button တွေ၊ Exam Center ထဲက Exam Start Cards တွေကို နှိပ်တဲ့အခါ အရင်လို တစ်မျက်နှာတည်း အောက်ကို Scroll မလုပ်တော့ဘဲ **သက်ဆိုင်ရာ URL သီးသန့်** ကို သွားပါမယ်။
2. Netlify Build အချိန်မှာ `dist/exams/truck.html`, `taxi.html`, `bus.html`, `maintenance.html`, `car.html`, `motorcycle.html`, `moped.html`, `jlpt_n5.html` မှ `jlpt_n1.html` အထိ 12 Pages ကို Generate လုပ်ပါမယ်။ `/mock-exams.html` က 12 Cards စုစည်းထားတဲ့ directory အဖြစ် ကျန်ပါမယ်။
3. Each Page မှာ သက်ဆိုင်ရာ Exam Card တစ်ခုတည်းကိုပဲ ထားပြီး၊ မလိုအပ်တဲ့ Homepage Content၊ တခြား Exam Cards နဲ့ Dictionary lazy loader ကို ဖယ်ထားတာကြောင့် HTML/DOM/Images ပိုနည်းပါတယ်။ တကယ့်ဖုန်း Speed Improvement ကို Production ပေါ်မှာတော့ မတိုင်းရသေးပါ။
4. Start Exam ကို နှိပ်ပြီး အမှန်တကယ် Exam Panel ပေါ်လာတဲ့အခါ အပေါ်က Card/Intro ကို ဖျောက်ပြီး မေးခွန်းဖြေတဲ့ Panel ကို နေရာပေးပါမယ်။ **စာမျက်နှာဖွင့်ရုံနဲ့ Free Attempt ကို မသုံးပါဘူး။**
5. Existing Server-side Exam Access, student ID/verification, auto-save/resume, timer, scoring, payment, dashboard, YKCR Sync and DB remain unchanged.
6. v7.87.1 Router Asset ကို Cache Bust `?v=7872` လုပ်ထားပြီး Browser/Service Worker old cache ကိုရှောင်ပါမယ်။ Relative asset URLs ကို `/exams/` Pages အတွက် Root Paths အဖြစ်ပြင်ထားပါတယ်။

## Update တင်နည်း (GitHub Desktop)

1. `MY-OFFICAL-WEB` ရဲ့ **latest main** ကို GitHub Desktop မှာ Fetch/Pull လုပ်ပါ။ နောက်ဆုံး Main မှာ version `7.87.1` ဖြစ်နေရပါမယ်။
2. ဒီ ZIP ကို Extract လုပ်ပြီး၊ အတွင်းက **`assets`, `scripts`, `tests`, `package.json`, README ဖိုင်တွေ** ကို GitHub Repository Root ထဲ Copy/Paste လုပ်ပါ။ Windows က Replace မေးရင် Replace လုပ်ပါ။ `.git` Folder ကို မဖျက်ပါနဲ့။
3. GitHub Desktop မှာ Modified Files ကိုစစ်ပါ။ Commit message: `v7.87.2 Separate Mobile Exam Pages`.
4. Commit → Push. GitHub `main` ကို Push လုပ်ထားရင် Netlify က Auto Deploy လုပ်ပါမယ်။ Risk လျှော့ချချင်ရင် အရင် Branch/Deploy Preview မှာစမ်းပြီးမှ Merge လုပ်ပါ။ New Repository မဖန်တီးပါနဲ့။
5. Deploy Build အောင်မြင်ပြီးမှ `/exams/truck.html`, `/exams/jlpt_n5.html`, `/mock-exams.html`, Homepage Study Hub ကို Mobile နဲ့စမ်းပါ။

## QA နှင့်အရေးကြီးသောကန့်သတ်ချက်

- Source-level Routing Logic, 12-Card Isolation, Relative Asset URL Transform, ZIP Integrity, Basic Build Fixture QA ကို စစ်ပြီးပါပြီ။
- **Full Netlify Build / Real Browser Speed Measurement / Live Login-Payment-YKCR Tests မလုပ်ရသေးပါ။** Repository ရဲ့ GitHub Connector က read-only ဖြစ်တာကြောင့် GitHub Branch/PR ကို အလိုအလျောက် မတင်နိုင်ခဲ့ပါ။ Production ကို မပြောင်းထားပါ။
- `package.json` ကို `7.87.2` ပြောင်းထားပြီး Legacy QA Test တွေမှာ version allowlist တင်းကျပ်ထားတာကြောင့် `scripts/v7872-qa-version-guards.mjs` ကို Build/Test အစမှာ သုံးပါတယ်။ ဒီ Script က **tests/*.mjs အတွင်း 7.87.2 ကို အဟောင်း version allowlist များမှာ ထပ်ထည့်ရုံသာ** လုပ်ပါတယ်။ Other assertions, backend, production functionality မပြောင်းပါ။ Local `npm test`/`npm run build` လုပ်ရင် အဟောင်း Test Files တွေမှာ ဒီ version-only diffs ပေါ်လာနိုင်ပါတယ်။
- Server-side free attempt lock, ongoing exam resume, Student/Member/Admin role, bank payment approval, JLPT progress, 12 exams all need live smoke testing before declaring production fully tested.
- New PDF **မပါပါ**။ `dist/` ကို Zip ထဲမထည့်ထားပါ။ Build အချိန်မှာ Generate လုပ်မှာပါ။

## Mobile Testing Checklist

- Truck Card → `/exams/truck.html`၊ Start Exam → Truck Questions ပဲပေါ်ရမည်
- N5 Card → `/exams/jlpt_n5.html`၊ Start Exam → JLPT N5 Questions ပဲပေါ်ရမည်
- Browser Back → Previous Page မှန်ကန်ရမည်၊ Auto-Save/Resume မပျက်ရ
- Free 1 attempt / Paid/Student access မပြောင်းရ၊ Login Return မပျက်ရ
- Furigana/Timer/Images/Listening/Result/Bookmark/Navigation မှန်ရ
- 360px, 390px, 412px Mobile Width များမှာ Horizontal Overflow မရှိရ

**ကျေးဇူးပြု၍ Mobile Live Test အောင်မြင်မှ v7.87.2 ကို Stable/Confirmed လို့ သတ်မှတ်ပါ။**
