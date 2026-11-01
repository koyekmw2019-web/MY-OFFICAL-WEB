# YE KUN Official Website — v7.61 Exam Auto Save & Resume

## လုပ်ဆောင်ပြီးသောအချက်များ
- v7.60 Smart Learning ကို အခြေခံထားပြီး Dashboard, Login, Premium Menu, Exam Cards, YKCR, Payment, Question Banks မပြောင်းထားပါ။
- Login ဝင်ထားတဲ့ User က Exam စတင်ရင် Netlify `exam-access` မှာ Attempt ID တစ်ခုထုတ်ပေးပြီး၊ မပြီးသေးတဲ့ Attempt ID ကို **ထပ်မဖန်တီးဘဲ ပြန်သုံး** ပါမယ်။ Free Attempt 1 ကြိမ်စည်းကမ်းကို ထိန်းထားပါတယ်။
- New Netlify `exam-checkpoint` Function + `exam_attempt_checkpoints` Table မှာ User ID / Attempt ID / Exam Type / Answers / Question Order / Current Position / JLPT Phase / Deadline ကို သိမ်းပါတယ်။
- အဖြေရွေးခြင်း၊ မေးခွန်းပြောင်းခြင်း၊ JLPT Section ပြောင်းခြင်းနဲ့ Listening နားထောင်ပြီးခြင်းမှာ Auto Save လုပ်ပါမယ်။ Browser Local Backup လည်း ရှိပါတယ်။
- Refresh / Browser ပြန်ဖွင့်ပြီး **အရင် Exam အမျိုးအစားရဲ့ Start Button** ကို နှိပ်ရင် Resume လုပ်နိုင်ပါတယ်။ Resume ချိန်မှာ Login + Attempt Ownership ကို Server မှာ စစ်ပါတယ်။
- **Timer က ပိတ်ထားချိန်မှာပါ ဆက်လက်တွက်ပါတယ်**။ အချိန်ကုန်သွားရင် Auto Next Section / Auto Submit စည်းကမ်းအတိုင်း ဆောင်ရွက်ပါတယ်။
- Supports JLPT N1–N5, Truck / Taxi / Bus, Car / Motorcycle / Moped, Automotive Maintenance. JLPT listening question order and completed audio state are preserved; mid-play interruption allows playback again.
- Submit အောင်မြင်မှ Checkpoint ကို ဖျက်ပါမယ်။ Result Submission မအောင်မြင်ရင် Local Backup ကို ဆက်ထိန်းပါတယ်။
- No extra student database, no PDF/page images, and no change to Exam access pricing.

## Deployment: အရေးကြီး
1. Live Website / Database ကို Backup လုပ်ပါ။
2. GitHub မှာ Source Package ကို Update လုပ်ပြီး Commit → Push လုပ်ပါ။ `netlify/database/migrations/20261101130000_exam_autosave.sql` ကို **မဖယ်ရှားပါနဲ့**။
3. Netlify Database Migration က Production/Preview Deploy မှာ Apply ဖြစ်မယ်။ Deploy Log မှာ Migration Success ကိုစစ်ပါ။ Migration မအောင်မြင်ရင် New Exam ကို မစမ်းပါနဲ့။
4. Staging/Deploy Preview မှာ Account အစစ်နဲ့ `Start → Answer → Refresh → Resume → Submit` ကိုစစ်ပါ။ **Free Account 1 ကြိမ်**၊ YKCR Student Unlimited၊ Paid Plan၊ Admin ကို သီးခြားစစ်ပါ။
5. Desktop, iPhone Safari PWA, Android, Offline→Online, JLPT Listening, timeouts, Password/Login, Dashboard, Payment Approval နဲ့ တပြိုင်နက် Tab နှစ်ခုကို စမ်းပါ။
6. Staging မပြီးဘဲ Production ကို မတင်သင့်ပါဘူး။ ZIP က Source ဖြစ်ပြီး Netlify Login/DB ကို Local Browser မှာ အစစ်မစမ်းနိုင်ပါ။

## လက်ရှိ Limitations
- Browser Close/Network ပြတ်တဲ့အချိန်မှာ Last Auto Save မပို့ရသေးရင် Browser Local Copy ကိုသာ အားကိုးရနိုင်ပါတယ်။ Network ပြန်ရမှ Server Sync ပြီးပါမယ်။ App Badge မှာ Save Error ကို ပြပါတယ်။
- Free Attempt မှာ Browser ပိတ်ထားလည်း Timer မရပ်ပါဘူး။ အချိန်ကုန်ရင် Auto Submit ဖြစ်နိုင်ပါတယ်။ နောက် Exam အသစ်မစခင် Active Exam ကို အရင် Resume/Submit လုပ်ရပါတယ်။
- အရင် v7.60 မှာ Auto Save မရှိခဲ့တဲ့ဟောင်း Attempts တွေရဲ့ မေးခွန်း/အဖြေတွေကို နောက်ကြောင်းပြန် Restore မလုပ်နိုင်ပါ။
- LocalStorage ဆိုင်ရာ privacy: Browser တစ်ခုထဲမှာ Login ရှိတဲ့အကောင့်အလိုက် သိမ်းထားပါတယ်။ Shared Computer တွေမှာ သတိထားပါ။ Server API ကို Auth + Attempt Ownership ဖြင့် ကာကွယ်ထားပါတယ်။
- 180 point scaled scores remain unofficial estimates; exam scoring is still submitted from the browser and not independently grade-verified by server.
- **QA:** Native JLPT N5 autosave/close/resume isolated browser test passed. JavaScript syntax checks passed. Other exam types: static code and data path inspection completed; full live Netlify Identity/Database end-to-end testing **NOT completed**. Do not report production QA as passed.
