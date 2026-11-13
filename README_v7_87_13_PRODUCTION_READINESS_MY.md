# YE KUN Official Website v7.87.13 — Production Readiness & Performance Optimization

**အခြေအနေ: Local QA PASS / Production Deployment မအတည်ပြုရသေး။**

**Source:** Previous delivered `YEKUN_v7.87.12_Multilingual_UI_Consistency_CUMULATIVE.zip` ကို အခြေခံပြီး အစဉ်လိုက် Update ထည့်ထားသော **Weekly Cumulative Source PATCH** ဖြစ်သည်။ **Full GitHub repository မဟုတ်ပါ။** အရင် v7.87.5–v7.87.12 ပြင်ဆင်ချက်များ ပါဝင်ပါသည်။ GitHub `main` version သည် စစ်ဆေးချိန် (2026-11-12) တွင် `7.87.4` ဖြစ်သည်။

## ယခု Version ပြင်ဆင်ထားသောအချက်များ

1. **Mobile Image Layout Stability** — `scripts/build-v78713-performance.mjs` သည် Build ပြီးသော Public HTML ရှိ `<img>` tag များကို သီးခြားစစ်ပြီး `decoding="async"` ထည့်သည်။ Existing width/height မရှိသော local PNG/JPEG/GIF/WebP ပုံများအတွက် ဖိုင်ထဲက အမှန်တကယ် dimensions ကို ဖတ်ပြီး `width` နှင့် `height` ထည့်သွင်းသည်။ CSS/အရင်ရေးထားသော width/height နှင့်ပုံအကြောင်းအရာမပြောင်း။ Inline `<script>` အတွင်းရှိ HTML template များကို မထိပါ။ **ပုံ byte-size ကို မချုံ့သေးပါ**၊ အမြန်နှုန်းတိုးမှုမတိုင်းရသေးပါ။ 
2. **PWA Cache Safety & Mobile Storage** — Public Service Worker Cache Version ကို `yk-official-v7-87-13` သို့ပြောင်းပြီး အဟောင်း public cache များကို ဖယ်ရှားသည်။ Public JLPT Level JSON ကို repeat visit အတွက် cache လုပ်နိုင်သည်။ Authentication/API/HTML navigation, Authorization/Cookie request, no-store/private response, Set-Cookie response ကို မသိမ်း။ File size သိရှိပြီး 1.25MB ထက်ကျော်သော asset မသိမ်း; Content-Length မသိသော image ကို cache မလုပ်။ **Free Exam/Payment/Student Private Response မသိမ်း**။
3. **Full Checkout Preflight** — `scripts/preflight-v78713.mjs` ကို `npm test` နဲ့ `npm run build` အစတွင် Run သည်။ Full GitHub Repo မဟုတ်လျှင် / မူလ source files မပြည့်လျှင် တိတိကျကျ FAIL ပြပြီး Patch တစ်ခုတည်းကို အလွဲသုံးမိခြင်း ကာကွယ်သည်။ v7.87.7/v7.87.8 Migration File မပါလျှင်လည်း Block လုပ်သည်။
4. **Public Release Gate** — Build ပြီးနောက် `tests/v78713-release.mjs` သည် အရေးကြီး Public Page 24 ခု၊ Exam 12 မျိုး၊ Admin/Student ခွဲခြားထားမှု၊ Grammar/Language Assets၊ HTML ရှိ local JS/CSS Reference များ၏ ဖိုင်ရှိမှု၊ Private Backend ကို `dist` ထဲ မတင်ထားမှုနှင့် Versioned SW ကို စစ်သည်။ **Critical JS/CSS ပျောက်လျှင် Build FAIL**။
5. **Legacy QA Compatibility** — Cache Version 7.87.13 ပြောင်းပြီးနောက် v7.87.5/v7.87.6 Tests နှင့် Builder တွင် version အသစ်/အဟောင်းကို ဆက်လက်လက်ခံအောင် ပြင်ဆင်ထားသည်။ Script/Test အဆင့်မှသာ ပြင်ထားပြီး Exam Timer, Scoring, Login, Payment, YKCR, CRM Function, Database schema ကို ထပ်မပြောင်းပါ။

### မပြောင်းထားသောအရာများ

- 509 Grammar Lessons / 1,018 Example Sentences နှင့် User Bookmark/Progress logic.
- Mock Exams 12 မျိုး၊ Score/Free Attempt Rule၊ Payment Approval၊ YKCR student sync။
- Admin-only CRM/Growth API Permission; Student/Member Dashboards.
- v7.87.12 Language Switcher/UI Text စည်းကမ်း။
- Netlify Database Migrations/Server Functions (v7.87.11 Exam Error Classifier ကို ထိန်းထားသည်)။

## Local QA

- **18/18 PASS:** Source/Mock Tests — v7.87.5 through v7.87.13; Grammar N5–N1 counts 509; 12 exam rule code; Admin CRM origin/role checks; business analytics math; language source guards.
- **PASS SW Runtime Mock:** Public repeat cache, Level JSON cache; HTTP navigation/API/authorization/cookie/no-store/private/Set-Cookie cache protection; >1.25MB / unknown-size image budget.
- **PASS Public Fixture:** 24 mock public routes, image aspect metadata, inline JS preserved; Release Gate detects deliberately removed CSS and blocks.
- **PASS ZIP Integrity:** File preserved / no PDF / no `dist/` / no secrets.

**အတည်မပြုရသေးသောအရာများ:** Full GitHub Repo ထဲမှာ `npm test`, `npm run build`, Netlify Deploy Preview, Database Migrations အမှန်တကယ် Run ခြင်း, Login/Payment/YKCR/Exam Real E2E, Mobile Core Web Vitals (LCP, INP, CLS), Grammar 509 ခုကို လူကိုယ်တိုင် သုံးဘာသာ Proofread လုပ်ခြင်း။ လက်ရှိ ZIP ကို **Production Stable Verified** လို့ မခေါ်ပါ။

## Weekly GitHub Desktop Installation / QA

1. Existing Repository `koyekmw2019-web/MY-OFFICAL-WEB` ကို Fetch/Pull လုပ်ပြီး **main v7.87.4** ကို Base အဖြစ် နောက်ဆုံးပြောင်းလဲမှု မရှိကြောင်း စစ်ပါ။ Newer changes ရှိလျှင် conflicts ကို အရင် reconcile လုပ်ပါ။
2. ZIP ဖြည်ပြီး **Relative Path မပြောင်းဘဲ** Existing Repo ထဲ Copy/Replace လုပ်ပါ။ `.git`, မူလ `index.html`, `src/`, `assets/`, `netlify/` ကို မဖျက်ပါနဲ့။ ZIP ထဲမှာ `dist/` မပါ။
3. Terminal/Repository Folder ထဲမှာ `npm install` (or existing lockfile စနစ်အရ `npm ci`), `npm run verify:preflight`, `npm test`, `npm run build`, `npm run verify:release` ကို အစဉ်လိုက် စစ်ပါ။ Preflight/Build FAIL ဆို **Production Push မလုပ်ပါနှင့်**။
4. Netlify Deploy Preview/Test Branch မှာ 12 Exam Pages, Free 1 Attempt/Payment, Admin/Student/Member Dashboards, YKCR Verification, CRM/Marketing, Language Switching, Grammar 509, Mobile 390px, Cache after update ကို စမ်းပါ။ Data migrations နှစ်ခု Apply ဖြစ်ကြောင်း စစ်ပါ။ 
5. Image/network loading ကို Real device / PageSpeed Insights / browser performance tools တွင် တိုင်းပါ။ 404/500 logs ကို ထပ်စစ်ပြီး Error မရှိမှ **အပတ်စဉ် GitHub Push** လုပ်ပါ။ ယခင် Production Deploy ကို Rollback လုပ်နိုင်အောင် မှတ်တမ်းထားပါ။

### အရေးကြီးသတိပြုရန်

- `v7.87.13` သည် **Cumulative PATCH** ဖြစ်သည်။ ZIP တစ်ခုတည်းတွင် `npm run build` လုပ်နိုင်သော Full Site မပါ။
- Build တိုင်း `Service Worker` အသစ်မှန်ကန်စွာ Publish ဖြစ်ပြီး အဟောင်း Cache ကို Invalidate လုပ်မည်။
- Homepage ပုံတွေ ပိုသေးသွားခြင်း မဟုတ်။ ရှိပြီးသားပုံရဲ့ Dimension ဖြည့်ပြီး Layout Stability ကို ကူညီခြင်းသာ။ ပုံအရွယ်အစားကျချင်ရင် မူရင်း Image File ထည့်ပြီး သီးခြား Image Compression လိုအပ်သည်။
- Production Netlify, GitHub, Database ကို ယခုဖိုင်ဖန်တီးရာတွင် မပြောင်းထားပါ။

**Detailed Test Evidence:** `QA_v7_87_13_PRODUCTION_READINESS.json`
