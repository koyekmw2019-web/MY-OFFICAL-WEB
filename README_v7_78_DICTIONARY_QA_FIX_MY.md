# YE KUN Official Website — v7.78 Dictionary QA Fix (2026-11-05)

**ဒီ package မှာ v7.78 နံပါတ်ကို မပြောင်းထားပါ။** User တောင်းဆိုခဲ့တဲ့ Dictionary QA ပြင်ဆင်မှုကို v7.78 Source ပေါ်မှာသာ လုပ်ထားပါတယ်။

## ပြင်ဆင်မှုအကျဉ်းချုပ်
- Original v7.78 Website Source ကို Base အဖြစ် အသုံးပြုထားသည်။
- `YEKUN_Dictionary_QA_Priority_Fixes_2026-11-05.csv` မှ **56 entries** ကို စစ်ပြီး Source JSON နဲ့ Browser JS ထဲ **Targeted corrections** ပြုလုပ်ထားသည်။
- Japanese စာလုံး/ဖတ်ပုံ ပြင်ဆင်မှု **10**, English source gloss ပြင်ဆင်မှု **10**, Myanmar meaning ပြင်ဆင်မှု **55** (တူညီသော Entry တစ်ခုမှာ ပြင်ဆင်မှုများစွာ ရှိနိုင်သည်)။
- စကားလုံးစုစုပေါင်း **8,542** — မြန်မာအဓိပ္ပာယ် အလွတ် **0**။
- မူရင်း Browser Data `assets/yk-dictionary-v778-complete-draft.js` နဲ့ `DICTIONARY_v7_78_FULL_CATALOG.json` ကို အမြဲတူညီအောင် Sync လုပ်ထားသည်။
- Browser cache မမှားအောင် Dictionary asset URL query ကို `?v=778qa20261105` ဟု ပြင်ထားသည်။
- `index.html` ၏ Script URL မှလွဲ၍ Website layout, Exam, Login, Payment, YKCR, Backend, Dashboard, PWA brand ပိုင်းကို မပြောင်းထားပါ။

## အမှားပြင်ထားသော ဥပမာ
| Japanese | Reading | မြန်မာအဓိပ္ပာယ် |
| --- | --- | --- |
| 薬指 | くすりゆび | လက်သူကြွယ် |
| 利子 | りし | ငွေချေးခြင်းမှ ရရှိသော အတိုးငွေ |
| 助詞 | じょし | ဂျပန်ဝါကျတွင် သုံးသော ဝိဘတ်၊ ပုဒ်ဆက် |
| 亡くす | なくす | ချစ်ခင်သူတစ်ဦး သေဆုံးသွား၍ ဆုံးရှုံးရသည် |
| 許可 | きょか | ခွင့်ပြုချက်၊ ခွင့်ပြုခြင်း |
| 直 | じき | မကြာမီ၊ ခဏအတွင်း၊ တိုက်ရိုက် |
| 留まる | とまる | တစ်နေရာတည်းတွင် နေသည်၊ ဆက်လက်တည်ရှိသည် |
| 通す | とおす | ဖြတ်သန်းခွင့်ပေးသည်၊ တစ်လျှောက်လုံးဆက်လုပ်သည် |

**အရေးကြီး:** `空間（あきま）`၊ `明白（あからさま）`၊ `悪日（あくび）` သည် ရှားပါးသော်လည်း ဂျပန်အဘိဓာန်တွင် တကယ်ရှိသော ဖတ်ပုံများ ဖြစ်သည်။ မမှန်ဟု ထင်ပြီး မပြောင်းထားပါ။

## QA Files
- `DICTIONARY_v7_78_QA_CORRECTIONS_2026-11-05.csv` — 56 ခု၏ ပြင်မီ/ပြင်ပြီး Japanese၊ Reading၊ English၊ Myanmar၊ QA Note အပြည့်အစုံ။
- `QA_v7_78_TARGETED_CORRECTIONS.json` — QA count နဲ့ Scope။
- `tests/v778-dictionary-qa-corrections.mjs` — JSON/JS consistency, corrected samples, 0 blanks, unchanged entries စစ်ခြင်း။
- `QA_v7_78_DICTIONARY.json` — မူလ Translation Completion Report နှင့် QA Addendum။

## အကန့်အသတ်
- **56 entry စာရင်းကို စစ်ပြီးပြင်ထားတာသာ ဖြစ်သည်။** ကျန်တဲ့ စကားလုံးအားလုံးကို ဘာသာပြန်ကျွမ်းကျင်သူက 100% စစ်ပြီးဖြစ်သည်ဟု မဆိုလိုပါ။
- Google Translate Draft အသားပေးဖြည့်ခဲ့တဲ့ အခြားစကားလုံးများတွင် အဓိပ္ပာယ်မှားနိုင်ပါသေးသည်။
- Automated Test သာ စစ်ပြီးဖြစ်နိုင်သဖြင့် **Netlify Production / Login / Paid Exam Live Test** မလုပ်ရသေးပါ။
- GitHub သို့ တင်မီ လက်ရှိ Repo ကို Backup/Commit ပြီး Netlify Deploy Preview တွင် Dictionary Search၊ Favorite၊ Level Filter၊ Login ကို စစ်ရန် အကြံပြုသည်။

## စစ်ဆေးရန် command

```bash
npm ci
npm test
npm run build
```

ZIP Source မှာ Environment Secret မထည့်ပါ။ PDF အသစ်မထည့်ပါ။
