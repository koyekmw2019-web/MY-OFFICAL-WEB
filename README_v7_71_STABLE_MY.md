# YE KUN Official Website v7.71 — Stable Source (မြန်မာ)

**v7.70 ကို အခြေခံပြီး Stable Code / Regression QA အတွက် ပြင်ဆင်ထားတဲ့ Source ဖြစ်ပါတယ်။ Production Live ကို စမ်းသပ်အတည်ပြုပြီးသားလို့ မဆိုလိုပါဘူး။**

- Website မူလ UI၊ Dashboard (Admin/Student/Member)၊ JLPT/Mock Exam၊ Login၊ Payment၊ YKCR Sync၊ Netlify Functions/Database၊ SEO/PWA ကို မဖြုတ်ထားပါ။
- Backend Functions နှင့် Database Migrations ကို v7.70 အတိုင်း byte-for-byte မပြောင်းထားပါ။ Hash စစ်ရန် `QA_v7_71_BACKEND_HASHES.json` ထည့်ထားပါတယ်။
- Dictionary စကားလုံး 8,542 လုံး မပျက်ပါ။ မြန်မာအဓိပ္ပာယ်ပါ 1,234 လုံး (အချို့ draft/unreviewed)၊ ကျန် 7,308 လုံးမှာ မြန်မာဘာသာပြန် မရှိသေးပါ။ 100% ဘာသာပြန်စစ်ဆေးပြီး မဟုတ်ပါ။
- `package.json` version ကို v7.71 ပြင်ပြီး၊ Dictionary နှင့် Stable Regression Test ကို `npm test` ထဲ ထည့်ပါတယ်။
- Login အတွက် `assets/identity.bundle.js` ကို Netlify `npm run build` မှာ ထုတ်ပါတယ်။ **Source ZIP ကို Netlify Drag-and-Drop တိုက်ရိုက်တင်ရင် build မလုပ်တဲ့အတွက် Login မရနိုင်ပါ။** Git-linked Netlify build သုံးပါ၊ သို့မဟုတ် build လုပ်ပြီးသား output ကို deploy လုပ်ပါ။
- PDF အသစ်မထည့်ပါ။ ကျောင်းသား/ငွေပေးချေမှု Database ကို မရွှေ့၊ မဖျက်၊ မပြောင်းပါ။

## Deploy မလုပ်မီ

1. Node.js 22+ ပါတဲ့ Build Environment မှာ `npm install` → `npm test` → `npm run build` လုပ်ပါ။
2. Production အရင်မတင်ဘဲ Staging တွင် Login, 3 Dashboards, Mock Exams (တစ်မျိုးချင်း 1 free), Dictionary, Payment/Admin, YKCR Sync နဲ့ PWA ကို စမ်းပါ။
3. Admin login ဖြင့် `/.netlify/functions/exam-health` → 200 / `ready:true` စစ်ပါ။
4. Database backup နှင့် မူလ Netlify Deploy ကို သိမ်းပြီးမှ Production တင်ပါ။

**စမ်းမပြီးသေးတာ:** Live Netlify Authentication / Payment / YKCR / Database migration / real mobile device full regression. v7.71 မှာ Source-level Stable QA သာဖြစ်ပါတယ်။

English technical details: `README_v7_71_STABLE_TECHNICAL.md`.
