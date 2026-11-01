# YE KUN Official Website v7.63 — Exam Integrity & Free Attempt Fix

**Status: Development / Staging QA required. Production-ready လို့ မသတ်မှတ်ရသေးပါ။**

## ဘာတွေ Update လုပ်ထားသလဲ

1. **Free 1 ကြိမ် / Exam Type:** Account တစ်ခုက Truck, Taxi, Bus, Car, Motorcycle, Moped, Maintenance, JLPT N1–N5 အမျိုးအစားတစ်ခုစီကို ပထမတစ်ကြိမ် Free ဖြေနိုင်ပါတယ်။ အဲဒီ Exam Type ကို ထပ်ဖြေချင်ရင် Paid Access သို့မဟုတ် Active Student Access လိုပါတယ်။ Free Attempt တစ်ခုကို Start လုပ်ပြီး အချိန်ကုန်လို့ abandoned ဖြစ်သွားရင်လည်း အမျိုးအစားအလိုက် Free Quota သုံးပြီးသားဖြစ်ပါမယ်။
2. **Server-side Practice Score Recalculation:** Browser ပို့တဲ့ `score` နဲ့ `passed` ကို ယုံပြီးမသိမ်းတော့ပါ။ Server မှာ သီးသန့်သိမ်းထားတဲ့ Original Question Bank mapping ကို အသုံးပြုပြီး Saved Checkpoint တွေကနေ Score၊ Section Score နဲ့ Practice Pass/Fail ကို ပြန်တွက်ပေးပါတယ်။ Client Score မတူရင် ပယ်ချပါတယ်။ `score_verified=true` က *server က practice score ပြန်တွက်ထားတာ* ကိုပဲ ဆိုလိုပြီး JLPT တရားဝင် Scale Score၊ Exam anti-cheat/proctored ဆိုလိုခြင်း မဟုတ်ပါ။
3. **Submit Protection:** Server-side Checkpoint မရှိ၊ Final JLPT Section မရောက်သေး၊ Deadline + 60 seconds ကျော်၊ Final Question မရောက်ဘဲ အချိန်မကုန်သေး၊ နောက်ဆုံး Listening Audio မပြီးသေး၊ Score မကိုက်ရင် `409`/`422` error နဲ့ ပယ်ချပါမယ်။ Error ဖြစ်ရင် Result Page မှာ Retry Server Submission ပြန်လုပ်နိုင်ပါတယ်။
4. **Auto Save / Resume:** အရင် v7.61/62 Server-owned Timer၊ Checkpoint Revision / Tab Guard ကို ထိန်းထားပါတယ်။ Section Deadline + 60s ကျော်သွားရင် အပိုင်းအသစ်သို့ နောက်ကျပြီး ကူးဖို့ မခွင့်ပြုတော့ဘဲ Attempt ကို abandoned လို့ သတ်မှတ်ပါတယ်။ Offline အချိန်ရှည်ခဲ့ရင် အရင်လို Timer extension မပေးတော့ပါ။
5. **Dashboard/Student History:** Exam History မှာ Verified Practice Score နဲ့ Legacy Unverified ကို ခွဲပြနိုင်ပါတယ်။ Existing Admin Dashboard၊ Payment Management၊ YKCR၊ JLPT Card UI တို့ကို ဖျက်/အစားမထိုးထားပါဘူး။

## မပြောင်းထားတာများ

- Existing DB attempts, Student Records, YKCR Sync Data, Payment Requests, Paid Access, CSV Import, Login, Dashboard, PWA, JLPT visuals.
- PDF အသစ် မထည့်ပါ။ Student Database အသစ် မတည်ဆောက်ပါ။

## အသစ်ပါဝင်တဲ့ Database Migration

`netlify/database/migrations/20261101150000_v763_free_per_exam_type.sql`

ဒီ Migration မှာ အရင် Free Index `exam_one_free_attempt_per_user` ကို Drop လုပ်ပြီး `exam_one_free_attempt_per_user_type` (user_id, exam_type) ကို Create လုပ်ပါတယ်။ **Data Row တွေကို မဖျက်ပါဘူး။** အရင် Migration 9 ခုကို မပြင်ရပါ။ Production DB backup / staging database clone လိုပါတယ်။

## QA စစ်ဆေးရန်

Local mock/unit tests: `npm test` (Node.js 22+) — 27 PASS / 0 FAIL as of v7.63 packaging.

**အရေးကြီးတဲ့ Limitations**

- Real Netlify Database, Identity, Payment Approval, YKCR Integration, iOS/Android browser end-to-end မစမ်းသပ်နိုင်သေးပါ။
- မေးခွန်း/အဖြေတွေက Public Browser Source ထဲမှာလည်း ရှိနေပါသေးတယ်။ Server က အမှတ်အတုကို တိုက်စစ်နိုင်ပေမယ့် Browser မှာ Question Set ရွေးချယ်တာကို သီးသန့် Server က ထုတ်ပေးထားတာ မဟုတ်ပါ။ Cheat-proof ဖြစ်ကြောင်း မဆိုနိုင်ပါ။ Official JLPT score လည်း မဟုတ်ပါ။
- Source Question Bank တွေ ပြောင်းတိုင်း `npm run regen-answers` လုပ်၊ Difference ကို Review လုပ်၊ `npm test` နဲ့ စစ်ဖို့လိုပါတယ်။
- Database Index Policy ပြောင်းထားတာကြောင့် v7.62 ကိုသာ Code Rollback လုပ်လို့ DB Index အဟောင်း အလိုအလျောက် ပြန်မလာပါ။ Database Schema နဲ့ Frontend Version ကို ကိုက်ညီအောင် စီစဉ်ပါ။ Data ကို မဖျက်ပါနဲ့။

**Recommended staging tests:** Free 1/use per type, same-type repeat -> payment required; student unlimited; paid; admin; Login/Logout; autosave -> refresh -> resume -> submit; all 12 exam families; server score spoofing; late submit; multiple tabs; migration status `exam-health` Admin 200; Payment Approve/Reject/Delete; YKCR student linking. Staging စမ်းသပ်ပြီးမှ Live တင်ပါ။
