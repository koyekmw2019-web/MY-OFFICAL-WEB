# YE KUN Official Website — v7.76 JLPT Learning Center

## ဘာပြောင်းထားလဲ

STUDY HUB အတွင်း Screenshot နဲ့ ကိုက်ညီတဲ့ **JLPT Learning Center Panel တစ်ခု** ထည့်ထားပါတယ်။

- N5, N4, N3, N2, N1 Level ကို ရွေးနိုင်ပါတယ်။ Active Level ကို Green Accent နဲ့ ပြပါတယ်။
- Level ကို ပြောင်းလိုက်တာနဲ့ Learning Card ၆ ခုလုံးရဲ့ Level Label နဲ့ သက်ဆိုင်ရာ Link တွေ တစ်ပြိုင်နက် ပြောင်းပါတယ်။
  1. **Vocabulary / 単語** — မူလ Dictionary Bank ကို JLPT Level Filter နဲ့ ဖွင့်ပါတယ်။
  2. **Grammar / 文法** — ရွေးထားတဲ့ Level အတွက် သင်ခန်းစာပြင်ဆင်ဆဲဆိုတဲ့ Notice ပြပါတယ်။
  3. **Kanji / 漢字** — Level-specific lesson notice (စိတ်ကူးယဉ် lesson မထည့်ပါ)။
  4. **Reading / 読解** — Level-specific lesson notice။
  5. **Listening / 聴解** — Level-specific lesson notice။
  6. **Mock Exam / 模擬試験** — ရှိပြီးသား `jlpt_n5` ... `jlpt_n1` Exam Access System ကို ချိတ်ထားပါတယ်။
- Grammar/Kanji/Reading/Listening Card ကို နှိပ်ရင် ပေါ်လာတဲ့ Notice က ရွေးထားတဲ့ Level ကို တိတိကျကျ ပြပါတယ်။ တကယ်ရှိတဲ့ Vocabulary / Mock Exam ကို ဆက်သွားနိုင်တဲ့ Link ပါပါတယ်။
- နောက်ဆုံး ရွေးခဲ့တဲ့ JLPT Level ကို Browser localStorage ထဲမှာ သိမ်းထားပါတယ်။
- 日本語 / English / မြန်မာ UI language switch ကို ထိန်းထားပါတယ်။
- Desktop, Tablet, Mobile Responsive Layout၊ Keyboard Focus၊ Screen Reader Label၊ `aria-pressed` ပါပါတယ်။

## ဘယ်နေရာမှာလဲ

လက်ရှိ `STUDY HUB` ရဲ့ Header အောက်မှာ JLPT Learning Center ကို ပြပြီး၊ အောက်မှာ **Driving & Tokutei Gino** ရှိပြီးသား Card Grid ကို ဆက်ပြပါတယ်။
Truck / Taxi / Bus / 自動車整備 / 普通自動車 / 二輪 / 原付 Card ၇ ခုကို မဖျက်ထားပါ။ `View More` နှိပ်ရင် ထပ်ကြည့်နိုင်ပါတယ်။

v7.75 မှာ ထည့်ခဲ့တဲ့ JLPT Card သီးသန့် ၅ ခုကို Panel တစ်ခုနဲ့ အစားထိုးထားလို့ ထပ်တူထပ်နေခြင်း မရှိတော့ပါ။

## Existing System / Security

- Backend Functions + Netlify Database Migration ဖိုင်များ **မပြောင်းပါ**။
- Login၊ Payment၊ Student Access၊ Free Attempt၊ YKCR Sync နဲ့ Exam Start Authorization ကို မပြောင်းပါ။
- Mock Exam Start က မူလ Server Access Check ကိုပဲ ဖြတ်ပါတယ်။
- JLPT Dictionary အပြည့်အစုံ Translation မပြီးသေးပါ။ Source v7.74 Dictionary Data ကို မပြောင်းပါ (8,542 စကားလုံး / မြန်မာအဓိပ္ပာယ်ပါ 2,350 / Pending 6,192 လုံး)။
- Grammar/Kanji/Reading/Listening သီးသန့် Lesson Content အသစ် မပါသေးပါ။ Level-aware UI နဲ့ Preparing Notice ပဲ ပါပါတယ်။
- PDF အသစ် မထည့်ထားပါ။

## GitHub Desktop / Netlify

လက်ရှိ GitHub Repository ထဲ Source Files တွေကို Replace လုပ်ပါ။ `.git` ကို မဖျက်ပါနဲ့။ `Commit -> Push origin` လုပ်ပါ။

Netlify ထဲမှာ `npm run build` ဆက်သုံးပါ။ `package.json` Version `7.76.0` ဖြစ်ပါတယ်။ Netlify Build မှာ `npm install` ပြီး `esbuild` ကို Dependency ကနေ အသုံးပြုပါမယ်။

Production Push မလုပ်ခင် Deploy Preview မှာ စစ်ရန်: N1–N5 Level Switch, Vocabulary Filter, Mock Exam Login/Payment Gate, Mobile Layout, Auth/Payment/YKCR Sync။

## Test / QA

- `npm test` — all pass, including new v7.76 regression.
- Desktop 900px, Mobile 390px — isolated JLPT UI browser test passes: switch N4, vocabulary `JLPT N4`, mock `jlpt_n4`, grammar detail, Japanese language switch, no horizontal overflow.
- Existing Auth Layer ရဲ့ Mock Button Clone ပြန်ဖန်တီးပြီးနောက် N2 အဆင့်ကို ရွေးကြည့်တဲ့ Test PASS (`jlpt_n2`)။
- Backend files unchanged by SHA256.
- Full live Website Browser Test blocked by environment policy (`ERR_BLOCKED_BY_ADMINISTRATOR`).
- Local `npm run build` cannot complete because `esbuild` is not installed in this execution environment. **Netlify production build not verified**.

`QA_v7_76_JLPT_LEARNING_CENTER.json` မှာ Detailed Results ပါပါတယ်။
