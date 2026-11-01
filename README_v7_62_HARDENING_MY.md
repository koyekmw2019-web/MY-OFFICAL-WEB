# YE KUN Official Website — v7.62 Hardening (Development Build)

**ဒီ ZIP ကို Live Website မှာ ချက်ချင်း Deploy မလုပ်ပါနဲ့။ Staging QA မပြီးသေးပါ။**

## ပြင်ဆင်ထားသောအပိုင်းများ

1. **Free Exam Rule:** Owner သတ်မှတ်ထားတဲ့ `TOTAL_ONE` — Account တစ်ခုအတွက် Exam အမျိုးအစားအားလုံးပေါင်း Free ၁ ကြိမ်ကို မပြောင်းပါ။ Free unique-index error (`23505`) ကိုသာ Paywall ပြပေးမယ်။ DB Error အခြားအမျိုးအစားကို မမှန်မကန် Free Used လို့ မပြတော့ပါ။ Final Deadline ကျော်တဲ့ Attempt ကို `abandoned` လို့ သတ်မှတ်ပေမဲ့ Free Quota ကို ပြန်မရပါ။
2. **Multiple Tabs:** Checkpoint `version` ကို Server ကစစ်ပြီး နောက်ကျတဲ့ Save ကို `409` နဲ့ပယ်မယ်။ Browser Tab တစ်ခုတည်းကပဲ ဖြေဆိုခွင့်ရအောင် Web Locks နဲ့ BroadcastChannel fallback ထည့်ထားတယ်။
3. **Offline / Timer:** Exam Phase နဲ့ Deadline ကို Server က သတ်မှတ်တယ်။ JLPT Section အသစ်ပြောင်းခါနီး Server POST အောင်မြင်မှ ပြောင်းမယ်။ Offline ဆိုရင် အဆင့်ကူးမရပါ။
4. **Score:** Stage A အဆင့်ပဲဖြစ်ပါတယ်။ Browser ကပို့တဲ့ `passed` ကို မယုံဘဲ Server က စည်းကမ်းနှုန်းထားနဲ့တွက်တယ်။ Exam တစ်မျိုးစီ Max Score စစ်တယ်။ **Browser မှပို့တဲ့ Score နဲ့ Section Score ကိုတော့ ပြန်လည်အတည်ပြုမနိုင်သေးပါ။ `score_verified=false` ပဲ သိမ်းထားတယ်။** Full Stage B အတွက် Answer Keys ကို Private Server-only နေရာသို့ ပြောင်းပြီး Result / Review UI တစ်ခုလုံးကို ပြင်ဖို့လိုတယ်။
5. **Deploy Safety:** Migration အသစ်တစ်ဖိုင်သာ ထည့်ထားတယ်။ Admin-only `exam-health` နဲ့ Database readiness ကြည့်နိုင်တယ်။ Old migration 8 ဖိုင်ကို မထိပါ။

## အရေးကြီးသော ကန့်သတ်ချက်များ

- Netlify Database Migration၊ Real Identity/Login၊ YKCR Sync၊ Payment Approvals၊ Android/iOS Browser စမ်းသပ်မှုတွေ **မလုပ်ရသေးပါ**။
- Local offline Browser အသုံးပြုမှု၊ အဖြေကူးသိမ်းမှုနဲ့ Two-tab Behavior ကို တကယ့် Browser နှစ်ခုမှာ အပြည့်မစမ်းသပ်ရသေးပါ။
- Public Bank ထဲက Answer Keys တွေကို Browser မှာ ထုတ်ပေးထားတဲ့အတွက် Stage B Secure Scoring မပြီးသေးပါ။
- Direct npm versions တွေ Pin လုပ်ထားပေမဲ့ npm Registry ကို ဒီ Environment က မချိတ်နိုင်လို့ Full Dependency Lockfile မထုတ်နိုင်သေးပါ။ Network ရတဲ့ Staging မှာ `npm install --package-lock-only --ignore-scripts` လုပ်ပြီး Lockfile Commit လုပ်ရန်။
- `QA_v7_62_HARDENING.md` မှာ စစ်ဆေးထားတာ / မစစ်ရသေးတာတွေကို သီးသန့်ဖော်ပြထားပါတယ်။

## Production မတင်ခင်

1. Staging Database သီးခြားဖန်တီးပြီး Migration 9 ခုစစ်ပါ။
2. Admin `exam-health` က 200/ready ဖြစ်ရပါမယ်။
3. QA Checklist အားလုံး ပြီးမှ Live Promote လုပ်ပါ။
4. v7.61 Backup ကို မဖျက်ပါနဲ့။
