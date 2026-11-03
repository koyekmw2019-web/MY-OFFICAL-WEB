# YE KUN Official Website v7.72 — Dictionary Translation Progress

> **အရေးကြီး:** ဒီ Version က ဘာသာပြန်ပြီးစီးမှု **100% မဟုတ်သေးပါ**။ v7.71 Stable Source ကို အခြေခံထားတဲ့ Dictionary Data Update / Staging Candidate ဖြစ်ပါတယ်။

## ဘာတွေ ပြင်ပြီးလဲ

- JLPT Dictionary source entry **8,542** လုံး၊ `jp`, `reading`, `en`, `level` နဲ့ ရှိပြီးသား Myanmar gloss များကို ထိန်းသိမ်းထားပါတယ်။
- **997** လုံးအတွက် မြန်မာဘာသာပြန် draft အသစ် ဖြည့်ထားပါတယ်။ N5 မှာ မူလလိုအပ်နေတဲ့ **805** လုံးကို ဖြည့်ပြီး N5 source စုစုပေါင်း **1,157 / 1,157** လုံးမှာ Myanmar gloss ပါလာပါတယ်။
- N1/N2/N3 စကားလုံး **192** လုံးကို ထပ်ဖြည့်ထားပါတယ်။ Screenshot ထဲက `恋する`, `恋愛`, `恋しい`, `失恋` နဲ့ `恋`, `恋人` အပါအဝင်ပါ။
- Website Dictionary Search က `assets/yk-dictionary-v772.js` ကို ဖတ်ပါမယ်။ မြန်မာဘာသာပြန်ပါရင် English fallback/Translation pending မပြတော့ပါ။
- Search input ကနေ Favorite ကို ပထမအကြိမ် နှိပ်ချိန် `change` event ကြောင့် ပျောက်သွားနိုင်တဲ့ UI ပြဿနာကို ပြင်ထားပါတယ်။
- Draft translation တွေကို Website မှာ `အဓိပ္ပာယ်ထပ်မံစစ်ဆေးရန်` ဆိုပြီး သတိပေးထားပါတယ်။
- Backend / Netlify Function / Database Migration ဖိုင် **33 ခု** ကို Hash Check စစ်ထားပြီး မပြောင်းထားပါဘူး။ Exam/Payment/Login/YKCR logic ကို မပြောင်းထားပါဘူး။

## Dictionary တိုးတက်မှု (JLPT source)

| Level | စုစုပေါင်း | Myanmar gloss ပါရှိ | မပြီးသေး | ဒီ Version အသစ် |
|---|---:|---:|---:|---:|
| N5 | 1,157 | 1,157 | 0 | 805 |
| N4 | 57 | 57 | 0 | 0 |
| N3 | 1,733 | 383 | 1,350 | 67 |
| N2 | 2,109 | 307 | 1,802 | 65 |
| N1 | 3,486 | 327 | 3,159 | 60 |
| **Total** | **8,542** | **2,231** | **6,311** | **997** |

ဒီဇယားရဲ့ `Myanmar gloss ပါရှိ` ဆိုတာ **စာသားဖြည့်ထားတာ** ကိုဆိုလိုပြီး၊ စကားလုံးအားလုံးကို Professional Translator နဲ့ အပြီးသတ် Proofreading လုပ်ထားတာ မဟုတ်ပါ။ ရှိပြီးသား 1,234 gloss တွေကိုလည်း quality review အပြီးသတ်လို့ မယူဆပါ။

## ဖိုင်များ

- `DICTIONARY_v7_70_FULL_CATALOG.json` — မပြောင်းထားတဲ့ Source Data
- `DICTIONARY_v7_72_FULL_CATALOG.json` — Gloss အသစ်ထည့်ထားတဲ့ Data
- `assets/yk-dictionary-v772.js` — Website မှာ သုံးမယ့် Dictionary Bundle
- `translations/v7_72_curated_glosses.csv` — မြန်မာဘာသာပြန် draft အသစ် 997 လုံး၊ source/provenance ပါ
- `DICTIONARY_v7_72_REMAINING_QUEUE.csv` — **ကျန် 6,311 လုံး** (JP / Reading / English source)
- `DICTIONARY_v7_72_LEVEL_SUMMARY.csv` — Level အလိုက် အရေအတွက်
- `DICTIONARY_v7_72_QA_SUMMARY.json` — Progress & structural checks
- `QA_v7_72_BROWSER.json` — Desktop/Mobile isolated dictionary Browser Checks
- `scripts/apply-v772-dictionary.py` — CSV မှ ပြန် generate လုပ်နိုင်တဲ့ Script
- `tests/v772-dictionary-translation.mjs` — Data Integrity Tests

## သိထားရမယ့် ပြဿနာများ

- မူရင်း English meaning နဲ့ JP/Reading မကိုက်တဲ့ Source အချို့ရှိတယ်။ ဥပမာ `と → door`, `金（きん）→ Friday`, `日（にち）→ Sunday`, `渡りる`, `大家（おおや）` စတဲ့အချက်တွေမှာ `reading_warning` ထည့်ထားတယ်။ JP စကားလုံးကို မှန်းပြီး ပြင်မထားဘူး။
- N1 ရဲ့ `愛憎（あいにく）`, `悪日（あくび）`, `空間（あきま）` စတဲ့ Source mismatches တွေက အတည်ပြုမရမချင်း Pending အဖြစ် ထိန်းထားတယ်။
- Dictionary တစ်ခုလုံးအတွက် remaining **6,311** လုံးကို အဓိပ္ပာယ်မမှန်တဲ့ filler text နဲ့ ဖြည့်မထားဘူး။

## GitHub Desktop / Netlify

လက်ရှိ Repository ကိုပဲ အသုံးပြုပါ။ ZIP Extract လုပ်ပြီး Source Files တွေကို Repository ထဲ Copy လုပ်နိုင်ပါတယ်။ `.git` Folder ကို မဖျက်ပါနဲ့။ `npm test` ကို အရင် Run လုပ်ပြီး Netlify Preview Deploy မှာ UI, Identity, Payment, YKCR Sync ကို စမ်းသပ်ပြီးမှ Production တင်ပါ။

`assets/identity.bundle.js` က ZIP ထဲမှာ **မပါဘူး**။ Netlify က `npm run build` လုပ်ချိန် `esbuild` နဲ့ Generate လုပ်ရပါတယ်။ Repo/Netlify dependency install ကို သေချာစစ်ပါ။ ZIP ကို Netlify မှာ တိုက်ရိုက် drag & drop လုပ်ပြီး Login အလုပ်လုပ်မယ်လို့ မယူဆပါနဲ့။

## Test နဲ့ လက်ကျန် Verification

- `npm test` — **98 PASS**, local static/mocked; not live production
- Desktop 1365px / Mobile 390px — isolated dictionary search `恋`, N5 `えんぴつ`, N5 filter first 200 words, Favorite first click PASS
- Full homepage via local HTTP browser test — local network blocked by test environment; **NOT verified**
- Full Netlify `npm run build`, Identity bundle, User Login, Payment, YKCR sync, Real DB — **NOT verified**
- Full linguistic translation QA — **NOT complete**

> v7.72 အတွက် အဓိကက N5 dictionary ကို draft ဖြည့်ပြီး စမ်းသပ်နိုင်ဖို့ပါ။ N1–N3 translation pending များနဲ့ source mismatches ဆက်လက်လိုအပ်နေပါတယ်။
