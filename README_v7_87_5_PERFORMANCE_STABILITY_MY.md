# YE KUN Official Website — v7.87.5 Performance & Stability

**Base:** GitHub `koyekmw2019-web/MY-OFFICAL-WEB` `main`, package `7.87.4`, commit `1d5c21cdb234add7ca33c4fd456ea6cd81d0a89a` (checked on 2026-11-12 JST).  
**Education Brand:** STUDYING WITH YE KUN.  
**Delivery:** Minimal source patch ZIP — NOT a complete repository, NOT a deployed website.

## ပြင်ဆင်ချက်များ

1. **Mobile Speed (Exam 7 မျိုး):** Truck / Taxi / Bus / Auto Maintenance / Car / Motorcycle / Moped တို့ရဲ့ `/exams/*.html` မှာ မသက်ဆိုင်တဲ့ JLPT Full Mock Bank (`jlpt-native-mock-bank-v752.js`), JLPT Scoring, JLPT Native Engine, JLPT-only CSS တို့ကို Deploy Build အဆင့်မှာ ဖယ်ထားပါတယ်။ ရှိပြီးသား SSW/Driving Exam Engine, Access Control, Timer, Auto Save, Score/Result နဲ့ Furigana ကို ဆက်ထိန်းထားပါတယ်။ **JLPT N5–N1 ၅ မျိုးမှာ JLPT Bank/Scoring/Native Engine အားလုံး ဆက်ပါပါတယ်။**
2. **Exam Center Rendering:** Narrow-screen Exam Center မှာ Offscreen Card များကို Browser က နောက်မှ Render လုပ်နိုင်အောင် `content-visibility:auto` ကို Support ရတဲ့ Browser များအတွက် သုံးထားပါတယ်။ Exam ဖြေတဲ့ single pages မှာ မသုံးပါ။ Mobile Decoration Animation ကို လျှော့ထားပါတယ်။
3. **PWA Cache:** `service-worker.js` Public Cache Version ကို `yk-official-v7-87-5` အဖြစ်ပြောင်းထားပါတယ်။ Activation အချိန်မှာ ယခင် `yk-public-static-*` Cache တွေကို ရှင်းပါတယ်။ Login/Payment/API, HTML Navigation, Personal Data ကို Cache မလုပ်ပါ။
4. **Error Handling:** Exam Center + Exam 12 Pages တွင် အင်တာနက်ပြတ်ခြင်းနှင့် လိုအပ်တဲ့ Public JS မရခြင်းကို အသိပေးတဲ့ Myanmar/English/Japanese Message ထည့်ထားပါတယ်။ Exam ဖြေနေစဉ် **Auto Reload လုံးဝ မလုပ်ပါ**။ အင်တာနက်ပြတ်ရင် Timer ဆက်သွားနိုင်ကြောင်း သတိပေးပါတယ်။ Resource Error ဖြစ်ပြီး Exam မဖြေနေတော့မှ Manual Reload ကို ပြမယ်။ Warning က အဖြေများ Server သို့ Save အောင်မြင်တယ်လို့ မဆိုလိုပါ။
5. **Regression Tests:** Exam Type 12 မျိုး၊ Exam Center၊ အပြန်အလှန် Menu 7 Destinations၊ Engine Script မပြောင်းခြင်း၊ JLPT Content ကိုသာ JLPT Pages မှာထားခြင်း၊ PWA Cache Safe Scope နဲ့ Offline Warning အတွက် စမ်းသပ်ချက်အသစ်များ ထည့်ထားပါတယ်။

## Technical Change List

- Updated: `package.json`, `service-worker.js`, `scripts/v7872-qa-version-guards.mjs`, `tests/v7873-source.mjs`, `tests/v7874-source.mjs`
- New: `scripts/build-v7875-performance.mjs`, `assets/yk-v7875-stability.css`, `assets/yk-v7875-stability.js`, `tests/v7875-source.mjs`, `tests/v7875-runtime.mjs`, `tests/v7875-release.mjs`
- Added: This README + `QA_v7_87_5_PERFORMANCE_STABILITY.json`
- Unchanged: `netlify/functions/`, Database Migrations, Identity source, Payment, YKCR Student Sync, Exam Banks, Exam Result Logic, Homepage Source, original JLPT Lessons.

## QA မှာ အောင်မြင်ခဲ့တာ

- Node `--check`: New JS/Build/Test syntax PASS.
- Mock Build Fixture: Exam Center + 12 Exam Routes (13 generated HTML files) PASS.
- v7.87.5 Release Contract: 7 Non-JLPT Routes lose four unrelated JLPT assets; 5 JLPT Routes keep them. PASS.
- Original Engine Inline Script: v7.87.5 Build Transform အရှေ့နဲ့အနောက် **byte-for-byte same** ဆိုတာ Build Script မှာ Assert ထည့်ထားပါတယ်။
- Service Worker Simulation: Versioned Cache cleanup, No HTML/API caching, Protected URLs bypass PASS.
- Offline UI Simulation: Active Exam အတွင်း Reload မလုပ်ခြင်း၊ Critical Asset Load Error၊ Connection Notice PASS.
- Offline Chromium (HTML fixture only): 390px + 1280px Online/Offline Banner Visibility PASS.
- ZIP Integrity: `zipfile.testzip()` PASS.

**မပြီးသေးတဲ့ QA:** မူရင်း GitHub Repository အပြည့်အစုံနဲ့ `npm ci && npm test && npm run build` ကို ဒီ offline environment မှာ မ run နိုင်ခဲ့ပါ။ Netlify Live Login/Payment/YKCR/Auto Save End-to-End စမ်းသပ်မှု၊ Live Mobile Speed/Network Timing မစစ်ရသေးပါ။ Synthetic Fixture ထဲက JS asset size များသည် **စမ်းသပ်ရန် ထည့်ထားတဲ့ Sample Data** ဖြစ်ပြီး Live Speed Improvement ဟု မယူဆပါနှင့်။

## Upload — GitHub Desktop Workflow

1. GitHub Desktop မှာ **ရှိပြီးသား** Repository `MY-OFFICAL-WEB` → `main` → **Fetch origin** / **Pull origin** လုပ်ပါ။ `package.json` Version **7.87.4** ဖြစ်ကြောင်းစစ်ပါ။ အခြား Version ဖြစ်ရင် ဒီ Patch ကို တိုက်ရိုက် မထည့်ပါနဲ့။
2. ZIP ကို Extract လုပ်ပါ။ ZIP ထဲက `assets/`, `scripts/`, `tests/`, `package.json`, `service-worker.js`, README နဲ့ QA JSON ကို Repository Root ထဲ Copy/Replace ပါ။ `.git` မဖျက်ပါနှင့်။ `dist/` / PDF အသစ် မပါပါ။
3. အကောင်းဆုံးက Test Branch မှာ Commit/Push → Netlify Deploy Preview Test ပြီးမှ `main` သို့ Merge ပါ။ လက်ရှိ GitHub Desktop Main Workflow ကို အသုံးပြုနိုင်ပါတယ်။ Repository အသစ် မဖန်တီးပါနှင့်။
4. Commit Message: `v7.87.5 Performance Stability Cache and Exam Regression`
5. Netlify Build (`npm run build`) Ready ဖြစ်ကြောင်း စစ်ပြီး `/mock-exams.html`, `/exams/truck.html`, `/exams/jlpt_n5.html` နဲ့ ကျန် Exam 10 မျိုးကိုစစ်ပါ။
6. Student Login၊ Guest First Attempt၊ Paid Attempt၊ Auto Save/Resume၊ Timer၊ Score/Result၊ YKCR Verification၊ Payment Admin Approval၊ Navigation၊ Offline Warning ကို Test Account များဖြင့်စစ်ပါ။ **Production မှာ တကယ့် Exam Attempt ကို မလိုအပ်ဘဲ မကုန်ဆုံးစေပါနှင့်။**
7. PWA Cache မှာ အဟောင်းကျန်ခဲ့ရင် Site ကို တစ်ခါပိတ်ဖွင့်ပြီး Refresh လုပ်ပါ။ Active Exam ဖြေနေစဉ်တော့ Reload မလုပ်ပါနှင့်။

**အရေးကြီး:** ZIP ကို ဒီ Chat ကနေ GitHub / Netlify Production သို့ မတင်ထားပါ။ User ကိုယ်တိုင် Deploy လုပ်ချိန်မှသာ Production ပြောင်းလဲပါမယ်။
