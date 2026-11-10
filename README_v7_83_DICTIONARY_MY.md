# YE KUN Official Website — v7.83 Dictionary Quality & Examples

**Base:** `YEKUN_v7.82.2_JLPT_Countdown_Reading_Update.zip`  
**Education Brand:** STUDYING WITH YE KUN  
**Release:** v7.83.0 (2026-11-09)

## Update Summary

- မူလ Dictionary Catalog **8,542 entries** ကို အကုန်ထိန်းထားပါတယ်။ Japanese Headwords၊ Readings၊ JLPT Level စတာတွေကို ဖျက်မထားပါ။
- **8,542 entries** အတွက် Automated Audit ကို run ပြီး `DICTIONARY_v7_83_QA_FLAGS.csv` မှာ Quality Flags ထုတ်ထားပါတယ်။ **လူက 8,542 ခုလုံး တစ်ခုချင်း အတည်ပြုပြီးတာ မဟုတ်ပါ**။
- Catalog မှာ အဓိပ္ပာယ်ပြင်ဆင်ချက် **24 ခု** (before/after audit CSV)၊ Legacy Dictionary ပြင်ဆင်ချက် **10 ခု** ရှိပါတယ်။ ပြင်ဆင်ချက်တွေကို *expert verified* လို့ မကြေညာပါ။
- Catalog မှာ Japanese+Myanmar Example **180 ခု** ပါလာပါပြီ (မူလ 42 ခု + အသစ် 138 ခု)။ Legacy terms သီးခြား Example **15 ခု** ထပ်ထည့်ထားပါတယ်။
- Example ရှိတဲ့ စကားလုံးတွေမှာ Sentence Furigana ကို ruby HTML နဲ့ ပြနိုင်ပါတယ်။ Headword အတွက် Kanji+Reading ပါရင် Ruby ကို တတ်နိုင်သမျှ ပြပါတယ်။
- Search၊ Favorite၊ Pronunciation၊ Copy နှင့် Existing Categories မပြောင်းပါ။ မူလ Favorite Keys ကို `v783¦jp¦reading` သို့ အလိုအလျောက် Migration လုပ်ပါတယ်။
- User (Guest အပါအဝင်) က **Report Translation Error** တင်နိုင်ပါတယ်။ Admin က **Dictionary Translation Reports** မှ Approve/Reject/Needs Review လုပ်နိုင်ပါတယ်။ Approve လုပ်တဲ့ အဓိပ္ပာယ်ကို Database Override အဖြစ် Public Dictionary က ပြသပါတယ် (GET cache သက်တမ်း 60s အထိ)။
- Report မပို့နိုင်ရင် Error ပြပါတယ်; မပို့ဘဲ ပို့ပြီးသားလို့ မပြောပါ။

## Dictionary Quality Status

- Catalog 8,542 ခုလုံးမှာ မြန်မာအဓိပ္ပာယ် အလွတ် **0**။
- ယခု `translation_review_status=review_required` **5,776** Entries ကျန်ရှိပါတယ်။ အခြား Draft များလည်း Expert Review မပြီးသေးပါ။
- လက်ရှိ 8,542 ခုလုံးအတွက် Context-correct Translation 100% ကို **အာမမခံနိုင်ပါ**။ Level အလိုက် Expert Review ကို နောက် Update များမှာ ဆက်လုပ်နိုင်ပါတယ်။
- စာကြောင်းနမူနာ မရှိတဲ့ Catalog Entries တွေကို မမှန်ကန်တဲ့ Template Sentence နဲ့ ဖြည့်ထားခြင်း မရှိပါ။
- CSV/JSON: `DICTIONARY_v7_83_FULL_CATALOG.json`, `DICTIONARY_v7_83_CORRECTIONS.csv`, `DICTIONARY_v7_83_QA_FLAGS.csv`, `QA_v7_83_DICTIONARY.json`.

## Deploy Instructions (Boss ကြီး၏ Existing GitHub Repository)

1. ဒီ ZIP ကို GitHub Desktop သုံးနေတဲ့ Existing Repo အတွက် Code Source အဖြစ် Update လုပ်ပါ။ **Repo အသစ်မဖန်တီးပါနဲ့။**
2. Netlify Deploy Preview (Staging) မှာ အရင် Test လုပ်ပါ။ `package.json` version `7.83.0`, Netlify `npm run build` က `esbuild` နဲ့ `assets/identity.bundle.js` ကို Generate လုပ်မယ်။
3. Netlify Database Migration `netlify/database/migrations/20261109150000_v783_dictionary_reports.sql` ကို Netlify Database Staging မှာ အရင် Apply ဖြစ်ကြောင်း အတည်ပြုပါ။ `yk_dictionary_reports` / `yk_dictionary_overrides` ဆိုတဲ့ **Table အသစ် 2 ခုသာ** ဖန်တီးပါတယ်။ Student/Exam/Payment/YKCR Tables မပြောင်းပါ။
4. `.netlify/functions/dictionary-report` (same-origin POST), `.netlify/functions/dictionary-reports-admin` (Admin only) နဲ့ `.netlify/functions/dictionary-overrides` (public GET) တွေ အလုပ်လုပ်ကြောင်း စစ်ပါ။
5. User က စကားလုံးရှာ → Report Error → Details ဖြည့် → Send → Admin Dashboard → Dictionary Translation Reports → Approved Meaning ဖြည့်ပြီး Approve → Dictionary ပြန်ရှာပြီး ပြောင်းသွားခြင်းကို စစ်ပါ။
6. Existing Login, Student Verification / YKCR Sync, Mock Exam Free Attempt, Paid Access, Payment Approval, JLPT Learning, Characters, Search/Favorite, PWA/SEO ကို Staging မှာ ပြန်စစ်ပြီးမှ Production သို့ Promote လုပ်ပါ။

### Recommended Environment Variable

`DICTIONARY_REPORT_SALT` — Random server secret for report request pseudonymous hash. Netlify `NETLIFY_SITE_ID` ကို fallback အသုံးပြုနိုင်ပေမဲ့ Production မှာ သီးခြား Secret တစ်ခုထားပါ။ Frontend ထဲ မထည့်ပါနဲ့။

## QA လုပ်ထားသည့်အရာ

- `npm test` (legacy + new source checks) — PASS.
- `tests/v783-dictionary-runtime.mock.mjs` — PASS (Search, Meaning, Ruby, Example, Legacy Favorites Migration, Report Form Submit Event).
- Backend `.mts` Syntax via Node experimental type stripping — PASS.
- Old Backend source file hashes compared with v7.82.2 ZIP — UNCHANGED.
- **Full `npm run build`: BLOCKED.** ဒီ Runtime က External npm packages download မရဖြစ်ပြီး `esbuild` ကို install မလုပ်နိုင်သေးပါ (`esbuild: not found`)။ GitHub/Netlify Networked Build မှာ ပြန် run ရပါမယ်။
- **Desktop/Mobile Live Browser Tests: NOT RUN**. ဒီ Runtime က Local HTTP နှင့် `file://` Browser Navigation ကို Administrator Policy ဖြင့် Block လုပ်ထားပါတယ်။ Runtime Mock Tests က အစားထိုးစစ်ထားပေမဲ့ Actual Browser စစ်ပြီးတယ်လို့ မဆိုလိုပါ။
- **Live Netlify, Database migration, Permission, Report Delivery / Admin Approval, Production Regression: NOT RUN.**

## အခြားအရေးကြီးချက်များ

- Existing SEO Homepage Title: `YE KUN Official Website | YE LINN OO` — မပြောင်းပါ။
- Student Girl / Teacher Boy Character Assets — မပြောင်းပါ။
- No PDFs added.
- Report Approval က Database Override ဖြစ်တာကြောင့် နောက် Release တစ်ခု ထုတ်တဲ့အခါ Approved Overrides ကို Export/Sync လုပ်မှ Static Catalog Source နဲ့ အမြဲတမ်း ကိုက်ညီနေမှာပါ။
