# YE KUN Official Website — v7.51 JLPT Listening Integrated (Original Practice)

## အဓိကပြင်ဆင်ချက်
- JLPT N1–N5 Mock Exam တစ်ခုစီတွင် စာသားမေးခွန်း 20 → 聴解 (Listening) 5 → အမှတ်တွက်ချက်မှု ဟူသော အစီအစဉ်ဖြစ်သည်။
- စာသား (文字・語彙 8, 文法 8, 読解 4) 25 မိနစ်၊ Listening 5 မေးခွန်းအတွက် 8 မိနစ်။ Level တစ်ခုစီမှာ 25 မေးခွန်း၊ စုစုပေါင်း Native Mock 125 မေးခွန်းဖြစ်သည်။
- Original 直前対策 မေးခွန်း 100 ခု (20 per level) သီးခြားဆက်ရှိသည်။ စုစုပေါင်း original questions 225 ခု။
- Listening ကို မဖြေပြီးဘဲ Result မပြပါ။ Listening Result ကို Mock အမှတ်တွင် ထည့်တွက်ထားသည်။ Final result တွင် 文字・語彙 / 文法 / 読解 / 聴解 အုပ်စုတိုင်းအတွက် correct count ပြထားသည်။
- Listening 25 မေးခွန်းကို YE KUN အတွက် အသစ်ရေးသားထားပြီး answer/explanation Japanese+Myanmar ပါဝင်သည်။
- Listening အသံသည် JavaScript Web Speech API (Browser TTS) ဖြင့် လူအသံဖမ်းထားသော MP3 မဟုတ်ဘဲ စာသားကို Browser က ဂျပန်အသံဖြင့် ဖတ်ပြခြင်းဖြစ်သည်။ Chrome/Edge စသော compatible browser နဲ့ Japanese voice installed/configured ရှိရန်လိုသည်။ အင်တာနက်/စက်အလိုက် Japanese voice ကွာခြားနိုင်သည်။
- Browser မှာ Speech Synthesis မရှိလျှင် Free Attempt ကို မစတင်မီ UI က စစ်ပြီး ပြောပြပေးသည်။ Japanese voice မရှိခြင်း သို့မဟုတ် အသံချို့ယွင်းခြင်းကို Browser compatibility စမ်းသပ်မှုတစ်ခုတည်းဖြင့် အပြည့်အဝ မကာကွယ်နိုင်သေးပါ။ **Live Deploy မလုပ်မီ တကယ့် Android/Windows စက်မှာ နားထောင်စမ်းပါ။**
- ကစားနိုင်သော Listening audio button သည် Exam အတွင်းမှာပဲ ပြသည်; သီးခြား Listening Sample audio card မရှိတော့ပါ။
- PDF ဖိုင် 0၊ PDF-derived JPG စာမျက်နှာ 0၊ အသုံးမလိုတော့သည့် listening MP3 0 ဖြစ်သည်။ Cover images 5 ခုသာ ထားသည်။
- YKCR / Payment / Identity / Admin / Driving Exam / Netlify Functions / Database migrations ကို မပြောင်းထားပါ။

## Official JLPT နှင့် ကွာခြားချက်
ဒီ Test သည် YE KUN ရဲ့ **မူရင်းလေ့ကျင့်ရေး Mock** ဖြစ်သည်။ Official JLPT format ကို section-order အတွက်သာ ကိုးကားထားသည်။ မေးခွန်းအရေအတွက်/စမ်းသပ်ချိန်/Browser TTS/ရမှတ်ကို Official JLPT အတိုင်း မဟုတ်ပါ။ Real official test တွင် Listening ကို နောက်ဆုံးဖြေဆိုသည်။
Official Listening duration: N1 55m, N2 50m, N3 40m, N4 35m, N5 30m (https://www.jlpt.jp/guideline/testsections.html)
JLPT scaled score ပုံစံကို မဟန်ဆောင်ထားဘဲ mock 正答率 (%) ကိုသာ ပြသည်။ 60% practice threshold သည် Official pass mark မဟုတ်ပါ။
ဒီ practice answer bank ကို Japanese teacher ဖြင့် သီးခြား အတည်ပြုစစ်ဆေးရန် လိုပါသည်။

## Deployment
1. Netlify Project ၏ Environment Variables / Netlify Identity / Database settings ကို မဖျက်ပါနှင့်။
2. ZIP ကို extract လုပ်ပြီး **GitHub နဲ့ ချိတ်ထားသော မူလ Netlify Project** ထဲမှာ Commit/Push လုပ်ပါ။ npm install + npm run build ဖြင့် identity bundle ကို ဖန်တီးနိုင်ရမည်။ Build မလုပ်ရသေးသော source ZIP ကို Static Upload မလုပ်ပါနှင့်။
3. Netlify live site ပေါ်တွင် Role access, Student verification, Free Attempt, Payment, Admin Unlimited, Driving Exam, N1–N5 Listening playback on Mobile, Result submission ကို စမ်းသပ်ပါ။
4. Live Netlify server integration / real Japanese TTS voices ကို ဒီ container အတွင်း အတည်မပြုနိုင်သေးပါ။ Browser automated tests တွင် SpeechSynthesis mock voice သုံးထားသည်။

## Source files
- `assets/jlpt-native-mock-bank-v750.js` — 100 native mock text questions (unchanged)
- `assets/jlpt-listening-bank-v751.js` — 25 new authored Listening questions
- `assets/jlpt-native-v750.js` — updated integrated two-phase exam UI (filename kept for backward compatibility)
- `assets/jlpt-chokuzen-bank-v750.js` — 100 last-minute study questions (unchanged)
- `JLPT_LISTENING_25_ORIGINAL_ANSWER_BANK_v7_51.csv` — editable answer review
- `QA_v7_51_LISTENING.json` — QA summary
