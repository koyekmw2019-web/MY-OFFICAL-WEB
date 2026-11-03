# YE KUN Official Website v7.67 — Learning Progress Analytics 2.0

## ဒီ Version မှာပါဝင်တဲ့ Update

**Student / Member Dashboard** အတွက် Learning Analytics 2.0 UI ကို တိုးချဲ့ထားပါတယ်။

1. **Exam Type + Period Filters** — All exams / Exam Type အလိုက်၊ All time / 7 / 30 / 90 days ဖြင့် ပြောင်းကြည့်နိုင်ပါတယ်။
2. **Practice Score Trend** — မိမိရဲ့ နောက်ဆုံး Server-Verified Exam Result 12 ခုအထိ Line Graph ဖြင့်ပြပါတယ်။ (0–100% Normalize လုပ်ထားပါတယ်။)
3. **KPI 4 ခု** — Average Score၊ Pass Rate၊ Best Score၊ Score Change (တူညီသော Exam Type ၆ ခုရှိမှ Last 3 vs Previous 3, percentage points)။
4. **Performance by Exam** — Exam Type အလိုက် အတည်ပြုထားတဲ့ရမှတ်ပျမ်းမျှနဲ့ ဖြေဆိုမှုအရေအတွက်ကို Bar နဲ့ ပြပါတယ်။
5. **Review Priorities** — ရှိပြီးသား `yk_learning_mistakes` မှ အများဆုံးမှားထားသော မေးခွန်း ၃ ခုကို ပြပါတယ်။ မေးခွန်းအဖြေမှန်ကို ဒီ panel မှာ မဖော်ပြပါ။
6. **No Data State / Mobile Responsive / 3 Languages** — Data မရှိရင် အမှတ်အတု မပြပါဘူး။ မြန်မာ/English/日本語 Dashboard စနစ်နဲ့ လိုက်ဖက်အောင် UI ကိုပြင်ထားပါတယ်။

## Data Source နှင့် အကန့်အသတ်

- Score/Exam History: မူလ `/.netlify/functions/exam-my-activity` (User ပိုင်တဲ့ နောက်ဆုံး 50 Exam Attempts)
- Review Priorities: မူလ `/.netlify/functions/yk-learning` (User ပိုင်တဲ့ နောက်ဆုံး 150 Saved Mistakes)
- **Result Graph နှင့် Score KPIs** မှာ Server-Verified Submitted Attempts ပဲတွက်ပါတယ်။ Unknown Exam Type / old unverified scores / invalid scores မပါပါ။
- Score မတူတဲ့ Exam တွေကို percentage အဖြစ် normalize လုပ်ပေမယ့် Official JLPT Scaled Score မဟုတ်ပါဘူး။
- Review Priorities တွေက မိမိသိမ်းထားတဲ့ မှားထားသောမေးခွန်းများသာဖြစ်ပြီး အချိန်ကာလ Filter နဲ့ မစစ်ဘဲ **All time** လို့ UI မှာ တိကျစွာရေးထားပါတယ်။ Exam Type Filter ကိုတော့ လိုက်နာပါတယ်။
- Score Change က Exam Type တစ်ခုတည်းအတွက် Verified Results 6 ခုရှိမှ ပြပါတယ်။ All exams မှာ Mixed Exam Difficulty ကြောင့် မတွက်ပါ။
- Graph မှာ ရနိုင်တဲ့ Exam History နောက်ဆုံး 50 attempts ကိုသာ မြင်ရပြီး ဒါထက်ဟောင်းတဲ့ Data မပါနိုင်ပါ။

## မပြောင်းထားသောအရာများ

- Netlify Functions (Auth/Payment/YKCR/Exam Scoring/Auto Save)
- မူလ Database Migrations 10 ခု
- Exam Questions / Answers / JLPT Furigana
- Dashboard Menu / Login / Logout / Role Permissions
- PDF files အသစ် မရှိပါ။ Database အသစ် မရှိပါ။

## Deploy မလုပ်ခင်

1. GitHub/Netlify Source နဲ့ Data ကို Backup ယူပါ။
2. ZIP ကို Repository Root မှာ ဖြည်ပြီး `npm test` ကို run လုပ်ပါ။
3. GitHub Branch/Deploy Preview မှာ Student/Member/Admin Role, Exam Result, Payment, YKCR Sync, PWA Cache ကို စစ်ပါ။
4. Live Netlify Database နဲ့ Identity/Payment/YKCR တကယ်အသုံးပြုပြီး End-to-End ကို မစမ်းသပ်ရသေးပါ။ Production Stable လို့ မသတ်မှတ်သေးပါ။
5. အားလုံးအောင်မြင်မှ Production Deployment လုပ်ပါ။
