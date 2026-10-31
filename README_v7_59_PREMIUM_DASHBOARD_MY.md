# YE KUN Official Website — v7.59 Premium Menu & Dashboard UI

## ပြင်ဆင်ထားတာ
- Homepage Hamburger Menu ရဲ့ Account Access ကို Premium Graphite Design နဲ့ ခွဲထားပါတယ်။
- Guest: **Login** သာ ပြပါတယ်။ Login ရှိ: **Dashboard** (အပေါ်) နှင့် **Logout** (အောက်) ပြပါတယ်။ Language ဘာရွေးရွေး အဲဒီ button နာမည်တွေကို English လိုပဲ ဖော်ပြပါတယ်။
- Admin, Student, Member, Router Dashboard စာမျက်နှာ ၄ ခုလုံးရဲ့ Header မှာ **Language** dropdown (မြန်မာ / English / 日本語) ထည့်ထားပါတယ်။ Homepage နဲ့ တူညီတဲ့ `yk_lang` setting ကို အသုံးပြုပါတယ်။ အဓိက UI စာသားများကို ဘာသာပြန်ပြပါတယ်။ Account အမည်၊ ID နဲ့ Backend Data တွေကို ဘာသာမပြောင်းပါဘူး။
- Dashboard Page တွေရဲ့ အောက်ဆုံးမှာ Fixed Premium Action Dock: ဘယ်ဘက် **BACK TO HOME**, ညာဘက် **Logout** ထည့်ထားပါတယ်။ Logout က မူလ Identity logout handler ကိုပဲ အသုံးပြုပါတယ်။
- Entrance, card hover, dropdown, bottom dock animation တွေကို ထည့်ထားပြီး `prefers-reduced-motion` ကို လေးစားပါတယ်။
- Mobile မှာ horizontal overflow မဖြစ်အောင် Responsive Design စစ်ဆေးထားပါတယ်။

## မပြောင်းထားတဲ့စနစ်များ
- Existing Netlify Identity / Student YKCR Sync / Role-based access / Payment Approval-Soft Delete / Exam & JLPT Bank / Admin CSV Import တို့ရဲ့ Backend ကို မပြောင်းထားပါဘူး။
- Database အသစ်၊ Migration အသစ်၊ PDF files မထည့်ထားပါဘူး။
- `assets/yk-dashboard-v758.js` ကို 그대로 အသုံးပြုထားပြီး v7.59 JS က Language UI တစ်ပိုင်းအတွက်သာ ဖြစ်ပါတယ်။

## စမ်းသပ်မှုနှင့် ကန့်သတ်ချက်များ
- Desktop 1365px / Mobile 390px မှာ Admin, Student, Member Dashboard ကို Browser isolated tests (mocked Identity + API) 6 မျိုး စမ်းသပ်အောင်မြင်ထားပါတယ်။
- Menu guest/authenticated state, Dashboard Show/Hide, Logout mock flow နှင့် Language 3 မျိုး ပြောင်းလဲမှု စမ်းသပ်ထားပါတယ်။
- **Actual production Netlify Login, user authorization, Payment / YKCR endpoints, Database migrations, mobile physical devices တွေကို ဒီ ZIP အတွက် Live စမ်းသပ်မထားပါဘူး။**
- Source ZIP ဖြစ်ပါတယ်။ Git-connected Netlify Build အတွက် `npm run build` လိုအပ်ပြီး `assets/identity.bundle.js` ကို build အတွင်း ဖန်တီးပါလိမ့်မယ်။ Source ZIP ကို static deploy အဖြစ်သာ တင်ရင် Login မအလုပ်လုပ်နိုင်ပါ။

## အသုံးပြုနည်း
1. ZIP ကို ဖြည်ပြီး v7.58 Repository ကို v7.59 Source ဖိုင်များနဲ့ Update လုပ်ပါ။
2. `package.json`, `index.html`, Dashboard Pages နဲ့ `assets/` ကို Git Commit လုပ်ပါ။
3. Git Push ပြီး Netlify Build/Deploy status ကို စစ်ပါ။
4. Real account ဖြင့် Login → Dashboard → Language → BACK TO HOME → Logout ကို စမ်းသပ်ပါ။ Admin Payment Request / Student Verification ကိုလည်း Verify လုပ်ပါ။
