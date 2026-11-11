# YE KUN Official Website — v7.87.4 Education Menu Navigation Fix

**BASE:** Current GitHub `main` source version **v7.87.3**. **Apply this patch only to that baseline.**
**Education brand:** STUDYING WITH YE KUN
**Scope:** Build-time public UI/navigation patch for `/mock-exams.html` and all 12 `/exams/{type}.html` pages.

## ပြင်ဆင်ချက်များ

1. **Exam Center နဲ့ Exam 12 မျိုးလုံး:** Menu ထဲက Home Page, About/Profile, YE KUN Portal, Study Hub, JLPT, Study Resources, Dictionary ကို သီးသန့် Exam Page အတွင်းက မရှိတဲ့ `#section` ကို မရှာတော့ဘဲ **Homepage (`/#...`) သို့ မှန်ကန်စွာ ပြန်ပို့မည်**။
2. **JLPT Menu:** အရင်က Exam Page ထဲမှာ hidden/absent `#yk82Hub` ကို scroll လုပ်ရန် ကြိုးစားသော legacy click handler ကို navigation သာအတွက် capture-phase interception နဲ့ ရှောင်ပြီး `/#yk82Hub` သို့ ပြန်သွားမည်။ Homepage ၏ ရှိပြီးသား JLPT arrival animation ကို ဆက်လက်အသုံးပြုမည်။
3. **Menu Animation:** JLPT link ကို အခြား Menu link တွေနဲ့ တူညီတဲ့ hover/focus effect နှင့် menu opening animation ရနိုင်အောင် CSS priority ညှိထားသည်။ Reduce-motion preference ကို လေးစားထားသည်။
4. **Education Branding:** Online Exam Center Header/Logo ဘေးမှာ `STUDYING WITH YE KUN` ကိုပြသမည်။ Original `/yk-192.png` logo ကိုသာသုံးမည်။ 12 individual exam pages မှာ v7.87.3 ရဲ့ education brand မပြောင်းပါ။
5. **Other Menu Destinations:** `/video-class.html`, `/mock-exams.html`, Dashboard/Login URLs မပြောင်းပါ။ Header logo ကိုနှိပ်လည်း Homepage ကို ပြန်သွားမည်။
6. **Backends:** Login, exam 1-free-attempt gating, Payment, Student Verification, YKCR, Result, Timer, Auto Save/Resume and Netlify Functions/DB untouched.

## How to Upload — GitHub Desktop

1. Existing GitHub Desktop repository `koyekmw2019-web/MY-OFFICAL-WEB` ရဲ့ **main** ကို Fetch origin / Pull origin လုပ်ပါ။ `package.json` ထဲမှာ version `7.87.3` ဖြစ်ကြောင်း စစ်ပါ။
2. ZIP ကို Extract လုပ်ပြီး `assets/`, `scripts/`, `tests/`, `package.json` နှင့် ဒီ README ကို **ရှိပြီးသား repository root** ထဲ Copy/Replace လုပ်ပါ။ `.git` Folder မဖျက်ပါနှင့်။ `dist/` ကို Copy မလုပ်ပါနှင့်။
3. အကြံပြုချက်: GitHub Desktop မှာ စမ်းသပ်ရန် Branch တစ်ခုခွဲပြီး Commit → Push → Netlify Deploy Preview စမ်းသပ်ပါ။ Preview OK ဖြစ်မှ `main` သို့ Merge လုပ်ပါ။ GitHub repository အသစ် မလုပ်ပါနှင့်။
4. Netlify ရဲ့ `npm run build` စဉ်မှာ v7.87.3 builder ပြီးနောက် `build-v7874-menu-nav.mjs` က public HTML 13 pages (Exam Center + 12 exam types) ကို Update လုပ်ပါမည်။

## Testing Checklist

- `/mock-exams.html` → Menu ရှိ Home / About / Portal / Study Hub / JLPT / Study Resources တို့ကို နှိပ်ပြီး Homepage ၏ သက်ဆိုင်ရာ Section ကို ရောက်မရောက် စစ်ပါ။
- `/exams/truck.html`, `/exams/jlpt_n5.html` နှင့် အခြား 10 exams → Menu Navigation ကို စစ်ပါ။
- JLPT Menu ကို နှိပ်ပါ။ Homepage JLPT Learning Center ကို သွားပြီး arrival motion ရှိမရှိ စစ်ပါ။ Browser/System က Reduce Motion ON ဖြစ်ရင် animation မပြသတာက မှန်ကန်သော behavior ဖြစ်ပါသည်။
- Education Header က `/yk-192.png` logo + `STUDYING WITH YE KUN` ဖြစ်မဖြစ် စစ်ပါ။
- Exam စတင်ပြီး Timer/Auto Save/Resume/Result, Role access, Student Verification, Payment ကို Preview မှာ စစ်ပါ။

## QA Scope

Static source and generated fixture tests can verify 7 routes, 13 HTML outputs and existing exam engine markers. **Actual full Netlify Build, browser speed, production login/payment/API behavior require staging/deploy preview verification.** The patch does not change production until you explicitly upload/merge.

**No unnecessary PDF files, no new GitHub repository, no new database or environment variables.**
