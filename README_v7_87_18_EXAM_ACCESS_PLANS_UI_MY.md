# YE KUN Official Website — v7.87.18
## Exam Access & Plans UI Copy — Weekly Cumulative Source Patch

**Source:** last assistant-delivered `YEKUN_v7.87.17_Marketing_Enrollment_CRM_Improvements_CUMULATIVE.zip` (163 entries). **Target repository:** `koyekmw2019-web/MY-OFFICAL-WEB`, whose GitHub `main` last verified as v7.87.4. This release contains previous cumulative files from v7.87.5 through v7.87.17, plus v7.87.18.

### Boss ကြီး ရဲ့ Screenshot အပေါ်အခြေခံထားတဲ့ ပြင်ဆင်မှု

- Guest Access ခေါင်းစဉ်ကို **ဧည့်သည်အသုံးပြုခွင့်** လို့ ပြင်ထားပါတယ်။
- Guest အတွက် **Login / Register** လိုအပ်မှု၊ **STUDYING WITH YE KUN** ကျောင်းသားများ **Student Verify** ပြုနိုင်မှု၊ Paid Plan ဝယ်ယူဖို့ **View Plans** ကိုနှိပ်ရမယ့်အကြောင်း ရှင်းလင်းထားပါတယ်။
- **အရေးကြီး:** Server policy အမှန်က **အကောင့်တစ်ခုလျှင် စာမေးပွဲအမျိုးအစားတစ်ခုစီကို အခမဲ့ ၁ ကြိမ်** ဖြစ်ပါတယ်။ စာမေးပွဲအားလုံး စုစုပေါင်း ၁ ကြိမ် မဟုတ်ပါ။ UI ရဲ့ Myanmar/English/Japanese စာသားကို အဲဒီစည်းကမ်းနဲ့ ကိုက်ညီအောင် ပြင်ထားပါတယ်။
- Plan ရွေးချယ်ရန် modal မှာ “မိမိနှစ်သက်ရာ Plan ကို နှိပ်ပြီး ဆက်လုပ်ပါ။” လမ်းညွှန်စာ ထည့်ထားပါတယ်။
- စျေးနှုန်းနှင့် Plans: **၁ ပတ် ¥1,000 / ၁ လ ¥2,000 / ၃ လ ¥3,000 / ၁ နှစ် ¥5,000** — မပြောင်းထားပါ။
- Plan Card မှာ **Admin အတည်ပြုပြီးသည့်အချိန်မှ Access စတင်အသုံးပြုနိုင်ပါသည်။** လို့ ပြန်ရေးထားပါတယ်။ Bank Transfer, receipt / screenshot upload နဲ့ Admin approval ကို modal အောက်မှာ ရှင်းပြထားပါတယ်။
- **Mobile 390px အောက်တွင်** Guest icon / description ကို ဒေါင်လိုက်စီပြီး မြန်မာစာရှည်လည်း ဖတ်ရလွယ်အောင် CSS ပြင်ထားပါတယ်။
- **Myanmar / English / Japanese** အတွက် မူလ `yk_lang` language system ကို အသုံးပြုထားပါတယ်။ Exam Engine / UI state / selected plan / payment request flow ကို မပြောင်းထားပါ။

### Source additions

- `scripts/build-v78718-exam-access-copy.mjs` — full build အပြီး `dist/mock-exams.html` နှင့် `dist/exams/{12 exams}.html` ကိုပဲ Safe Copy Update လုပ်မယ်။ `V737_TEXT` တွေရဲ့ exact-key copy ကို override လုပ်ခြင်း၊ Plan Mini price label ကို Language အလိုက်ပြောင်းခြင်း၊ UI hint ထည့်ခြင်း။
- `assets/yk-v78718-exam-access.css` — Mobile text wrapping and spacing. Static `assets/` အဖြစ် Full public builder က copy လုပ်ပေးမယ်။
- `tests/v78718-source.mjs`, `tests/v78718-release.mjs`, `tests/v78718-build-fixture.mjs` — source & synthetic 13-exam-page Build/Copy/Checkout/Price regression.
- `package.json` — v7.87.18 + cumulative test/build/release chain.

**No new DB migration. No changes to student database, exam quotas, exam scoring, YKCR, bank account information, payment APIs or admin permissions.**

### Installation / QA

1. Weekly Update Day တွင် Existing Repository ကို GitHub Desktop နဲ့ Fetch/Backup လုပ်ပြီး `main` မှာ unexpected changes မရှိကြောင်း စစ်ပါ။
2. ZIP ကို သီးခြား extract လုပ်ပါ။ Extract ထဲက files များကို existing repository **root** ထဲသို့ relative path တူအောင် copy/replace လုပ်ပါ။ `.git` ဖိုလ်ဒါကို မဖျက်ပါနဲ့။ `dist` သို့မဟုတ် ZIP ကိုပဲ Netlify တင်ခြင်း မလုပ်ပါနဲ့။
3. Repository အပြည့်ထဲမှာ `npm install`, `npm test`, `npm run build` နှင့် `npm run verify:release` လုပ်ပြီးမှ Preview Deployment ကိုစမ်းပါ။ (`npm install` က `package-lock.json` ကို ပြောင်းနိုင်လို့ diff ကို ပြန်ကြည့်ပါ။)
4. Mobile Exam Center: Guest → View Plans → ၄ မျိုး Price → Plan ရွေး → Login/Checkout → Payment Receipt Upload → Admin approval flow ကို **Test Environment** မှာ တကယ်စမ်းပါ။ Myanmar/English/日本語 switch စမ်းပါ။ Free Attempt ကို **per exam type** ဖြစ်ကြောင်းလည်း Test User နဲ့ စမ်းပါ။
5. Database migrations v7.87.7 Growth / v7.87.8 CRM ကို ရှေ့က deploy မလုပ်ရသေးလျှင် Full deploy run မှာ verify လုပ်ရပါမယ် (v7.87.18 ကိုယ်တိုင် migration အသစ် မထည့်ထားပါ။)
6. Build/Preview အောင်ပြီးမှသာ Production Deploy လုပ်ပါ။ GitHub/Netlify ကို Chat ထဲကနေ **မပြောင်းထားပါ**။

### QA scope / remaining risks

- Local Selected Regression: **25 PASS / 0 FAIL**. Synthetic fixture test covers 13 routes, price/click-handler preservation, language map, and malformed or repeated build rejection.
- These tests use a minimal synthetic HTML fixture and source assertions, **not** a complete repository build. This patch alone correctly fails Full Repository Preflight. Live payment receipt, authenticated server, real users, mobile performance and Netlify Preview are **NOT tested**. “Production stable” claim is not warranted yet.
- If existing repository differs from `main v7.87.4` or has other patches, review diffs before merging. Backend quota rules are unchanged.
