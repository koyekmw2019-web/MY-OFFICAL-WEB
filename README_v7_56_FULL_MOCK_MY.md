# YE KUN Official Website v7.56 — JLPT Full-Duration Original Mock

## အဓိကပြင်ဆင်ချက်

- JLPT Exam Card ၅ ခုရဲ့ HTML/CSS design, Book Cover, Reflection မပြောင်းထားပါ။ Card တွင် **80 Text + 20 Listening = 100 Original Questions** ကို ပြသရန် အဟောင်းဂဏန်းများကို JavaScript ဖြင့် အလိုအလျောက် ကိုက်ညီအောင် ပြင်ထားပါသည်။
- Level တစ်ခုလျှင် **100 ခု** (文字・語彙 36 + 文法 24 + 読解 20 + 聴解 20)၊ N1–N5 စုစုပေါင်း **500 ခု**။
- မူရင်း YE KUN Native Mock / 直前対策 မေးခွန်းအချို့ကို Full Mock Bank ထဲ၌ ပြန်သုံးထားပြီး အသစ်လည်း ထပ်ရေးထားပါသည်။ `直前対策` သီးခြားလေ့ကျင့်ရေးကို မဖယ်ရှားထားပါ။
- PDF viewer၊ PDF စာမျက်နှာပုံများ မပါဝင်ပါ။

## JLPT တရားဝင်ပြဋ္ဌာန်းထားသော Exam Section ဖြေချိန်ကို အခြေခံထားခြင်း

| Level | Section 1 | Section 2 | Section 3 | စုစုပေါင်း ဖြေချိန် |
|---|---|---|---|---|
| N1 | 語彙・文法・読解 110 မိနစ် | 聴解 55 မိနစ် | — | 165 မိနစ် |
| N2 | 語彙・文法・読解 105 မိနစ် | 聴解 50 မိနစ် | — | 155 မိနစ် |
| N3 | 語彙 30 မိနစ် | 文法・読解 70 မိနစ် | 聴解 40 မိနစ် | 140 မိနစ် |
| N4 | 語彙 25 မိနစ် | 文法・読解 55 မိနစ် | 聴解 35 မိနစ် | 115 မိနစ် |
| N5 | 語彙 20 မိနစ် | 文法・読解 40 မိနစ် | 聴解 30 မိနစ် | 90 မိနစ် |

Section တစ်ခုမှာ အချိန်ပြည့်သွားလျှင် နောက် Section ကို အလိုအလျောက် ပြောင်းပြီး အရင် Section ကို ပြန်မဖြေနိုင်တော့ပါ။ ဖြေဆိုသူကလည်း Section ကို အချိန်မပြည့်ခင် အဆုံးသတ်နိုင်သည်။ Listening ကို Level အားလုံး၏ နောက်ဆုံးအပိုင်းတွင် ဖြေရမည်။

## Mock 180-point score (တရားဝင် scaled score မဟုတ်)

- N1 / N2 / N3: Language 60 + Reading 60 + Listening 60။ အပိုင်းတိုင်း အနည်းဆုံး 19/60။ Overall passing thresholds N1=100, N2=90, N3=95။
- N4 / N5: Language + Reading 120 + Listening 60။ အနည်းဆုံး 38/120 နှင့် 19/60။ Overall passing thresholds N4=90, N5=80။
- **အမှတ်များကို Correct-answer Percentage မှ 180 Point Format သို့ ခန့်မှန်းပြောင်းတွက်ထားပါသည်။** တရားဝင် JLPT စာမေးပွဲမှာ သုံးသည့် IRT/Scaled Score စနစ်ကို ပြန်လည်ထုတ်လုပ်၍ မရပါ။ Mock ရမှတ်ဖြင့် တရားဝင် JLPT အောင်/မအောင်ကို အတည်မပြုနိုင်ပါ။

## Listening Audio ကန့်သတ်ချက်

Listening ကို Browser Japanese Speech Synthesis ဖြင့် ဖွင့်ပါသည်။ **တကယ့် JLPT စာမေးပွဲ၏ အသံသွင်းထားသော Audio မဟုတ်ပါ**။ စက်/Browser ပေါ်မူတည်ပြီး အသံအရည်အသွေး၊ speaker voice၊ အသံအရှိန် ကွဲနိုင်ပါသည်။ Audio ကို တစ်ကြိမ်နားထောင်ရန် Design လုပ်ထားပြီး Playback မအောင်မြင်ပါက ပြန်ဖွင့်နိုင်သည်။ တကယ့်ဖုန်းက Japanese Voice တွင် အလုပ်လုပ်ခြင်းကို Live စမ်းသပ်ရမည်။ Audio Clip အရှည်သည် တရားဝင် JLPT ရဲ့ Listening အစီအစဉ်တစ်ခုလုံးနဲ့ အတိအကျ မတူသေးပါ။

## မပြောင်းထားသော အပိုင်းများ

- `index.html` နှင့် JLPT Premium Card visual assets မပြောင်းထားပါ။
- Netlify Functions, Database migrations, Admin, Login, Payment, YKCR, Driving Exam မပြောင်းထားပါ။
- Live Netlify Login/Student Access/Payment ကို ဒီ Local QA မှာ မစမ်းသပ်နိုင်ပါ။ မူလ Backend အတိုင်း အသုံးပြုပါသည်။

## QA နှင့် အကြောင်းပြချက်

- N1–N5 Bank: Level တစ်ခုချင်းစီ 100 ခု၊ Unique ID၊ Four options၊ Answer index နှင့် Japanese/Myanmar explanations ရှိ/မရှိ ကို စစ်ထားပါသည်။
- Chromium isolated simulated Desktop/Mobile: N1–N5 Section Flow, Timers, Listening 20 Items, Submit 0/180, Score Sections ကို စမ်းသပ်ထားပါသည်။ Speech playback ကို Browser Mock သုံးခဲ့ပြီး **တကယ့်အသံကို End-to-End စမ်းသပ်ခြင်း မဟုတ်ပါ**။
- 180/180 စမ်းသပ်မှုနှင့် အပိုင်းလိုက် အနည်းဆုံးရမှတ်မပြည့်ဘဲ စုစုပေါင်းရမှတ်မြင့်နေသည့် Fail ဖြစ်ရမည့် စမ်းသပ်မှုများ Passed။
- ဂျပန်စာဆရာ/စာမေးပွဲကျွမ်းကျင်သူ တစ်ဦးက မေးခွန်း 500 ခုလုံးကို သီးခြားသုံးသပ်ပြီး အတည်ပြုထားခြင်း မရှိသေးပါ။ အသေးစိတ် ပညာရေးဆိုင်ရာ Quality Review လိုအပ်ပါသည်။

## တရားဝင် JLPT ကိုးကားချက်

- Exam Times & Item Types: https://www.jlpt.jp/e/guideline/testsections.html
- 180-point Score Sections & Pass Thresholds: https://www.jlpt.jp/e/guideline/results.html

## Deployment

`netlify.toml`, `package.json`, `netlify/functions/`, `netlify/database/` ပါဝင်သည့် Source ZIP ဖြစ်သည်။ မူလ Git-Connected Netlify Build workflow ဖြင့် Deploy လုပ်ပါ။ GitHub/Netlify Live မပြောင်းရသေးပါ။
