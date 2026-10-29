# YE KUN Official Website v7.52 — Listening Integrated Source (မြန်မာ)

## ပြောင်းလဲမှု
- JLPT N1–N5 Mock Exams တစ်ခုစီမှာ Vocabulary / Grammar / Reading 20 ခု → **Listening 5 ခု** → Result (စုစုပေါင်း 25 ခု) အဖြစ် တစ်ဆက်တည်း ဖြေဆိုရပါမယ်။
- သီးခြား Listening Sample, အမှတ်မတွက်သော Audio Player မရှိပါ။ Listening ဖြေဆိုပြီးမှ အမှတ်ထွက်ပါမယ်။
- Listening မေးခွန်း 25 ခုကို Native Mock Bank ထဲ ပေါင်းထားပြီး `assets/jlpt-native-mock-bank-v752.js` မှာ 125 questions ပါပါတယ်။
- Browser ရဲ့ Japanese Text-to-Speech ကို အသုံးပြုထားပြီး official JLPT voice recording မဟုတ်ပါ။ အသံမဖွင့်နိုင်တဲ့ Browser မှာ Exam မစခင် သတိပေးမယ်။
- Result မှာ 25 ခုအတွက် အဖြေမှန်နှုန်း၊ စာမေးပွဲအပိုင်းအလိုက် အဖြေမှန်အရေအတွက်နဲ့ 0–180 အတိုင်း ရိုးရှင်းတဲ့ **လေ့ကျင့်ရေး ခန့်မှန်းအမှတ်** ပြထားပါတယ်။ ဤရလဒ်သည် JLPT scaled score / 合否 မဟုတ်ပါ။
- Existing Auth / Admin / Payment / Netlify Functions / Driving Exam / YKCR code ကို မပြင်ထားပါ။
- PDF နှင့် PDF စာမျက်နှာပုံများ မထည့်ထားပါ။

## တရားဝင် JLPT စည်းကမ်းနှင့် ကွာခြားချက်
JLPT N1–N5 အားလုံးမှာ Listening က နောက်ဆုံးအပိုင်း ဖြစ်တာကို လိုက်နာထားပါတယ်။ ဒါပေမယ့် ဒီ Mock က 20 + 5 မေးခွန်းသာရှိတဲ့ အတိုချုံး **unofficial practice** ဖြစ်လို့ စာဖြေချိန်က Text 25 မိနစ် + Listening 8 မိနစ်ဖြစ်ပြီး တရားဝင် JLPT အချိန်ပြည့် စမ်းသပ်မှု မဟုတ်ပါ။ တရားဝင် JLPT scoring သည် scaled scores ကိုသုံးတာမို့ 0–180 ခန့်မှန်းအမှတ်ကို တရားဝင်အမှတ်လို မသုံးရပါ။

JLPT official source:
- https://www.jlpt.jp/e/guideline/testsections.html
- https://www.jlpt.jp/e/guideline/results.html

## Deploy
ဒီ ZIP က Netlify Git-connected **source project** ပါ။ ZIP ဖြည်ပြီး existing Git Repository ထဲ update လုပ်ပါ။
```
npm install
npm run build
```
ပြီးရင် Git commit/push လုပ်ပါ။ `netlify.toml` က မူလ config အတိုင်း မပြောင်းပါ။ Live Netlify မှာ Login, Payments, Database, Japanese audio and real Android/iOS ကို ထပ်စစ်ဆေးဖို့ လိုပါတယ်။

## Limitations
- Listening သည် Text-to-Speech ဖြစ်ပြီး native speaker audio files မဟုတ်ပါ။
- Question bank သည် original practice content ဖြစ်ပြီး ဆရာစစ်ဆေးမှု မပြီးပါ။
- Scaled scores နှင့် တရားဝင် pass/fail ကို အတိအကျ တုပမထားပါ။
