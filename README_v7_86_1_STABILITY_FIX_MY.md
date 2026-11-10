# YE KUN Official Website v7.86.1 — Stability Fix

အခြေခံ Source: `YEKUN_v7.86_Premium_Animation_Character_Experience_Update.zip` (v7.86.0)

## ပြင်ဆင်ချက်များ

1. **Admin Dashboard Pro — PostgreSQL Syntax Error 42601**
   - `netlify/functions/exam-admin-analytics.mts` ထဲက `day` SQL Alias ကို `AS day_key` အဖြစ် ပြင်ထားသည်။
   - Exam Trend နှင့် JLPT Daily Practice Query နှစ်ခုလုံး ပြင်ထားပြီး API Output ကို မူလ `day` Key ဖြင့်ပဲ ပို့သည်။
   - Database Error ဖြစ်လျှင် SQL Query အရှည်ကြီးကို Browser မှာ မပြဘဲ အထွေထွေ Error Message သာ ပြမည်။ တကယ့် Error Details ကို Server Log မှာ စစ်နိုင်သည်။
   - Netlify Database Migration အသစ် **မလိုပါ**။
2. **JLPT Learning Center — Mobile Navigation**
   - 620px အောက်/အထိ Screen တွင် Logo အပေါ်၊ `← Study Hub` / `Dictionary` / `Mock Exam` အောက်တစ်တန်းဖြင့် 3-column Grid ပြသည်။
   - Desktop Header Layout မပြောင်းထား။
3. **Login — Manual Button Only**
   - Email/Password ဖြည့်ပြီး `Enter` / Browser Form Auto-submit ဖြစ်ခြင်းက Login API ကို မခေါ်တော့ပါ။
   - `Login` Button ကို နှိပ်မှ Netlify Identity Login Request ပို့သည်။
   - Existing signed-in session ကို အလိုအလျောက် Logout မလုပ်ပါ။ Browser မှာ လက်ရှိ Session ရှိပြီးသားဆိုရင် Logged-in အဖြစ် ပြနေနိုင်သည်။
   - Signup, Recovery, Invitation, Existing Login/Auth/Exam Access Rules မပြောင်းထား။
4. **Caching**
   - Changed Login/Navigation/Admin UI File တွေမှာ Cache-bust Query ထည့်ထားပြီး Service Worker Public Cache Version အသစ်သတ်မှတ်ထားသည်။

## QA Summary

- `npm test`: **219 PASS**, 0 FAIL (v7.86.1 Regression Checks 8 ခု ပါသည်)
- `node --check`: Login, Admin Dashboard JS, Analytics Function TypeScript Syntax PASS
- Offline Browser Rendering: Navigation 320px, 360px, 390px, 620px, 768px, 1280px — 6/6 PASS (တစ်တန်းတည်း၊ Horizontal Overflow မရှိ)
- Offline Login Browser Mock: 390px / 1280px — Enter/requestSubmit = 0 Login Calls၊ Button Click = 1 Login Call — 2/2 PASS
- Admin API Fake Database Test: Dates/Pass Rates/Permissions/Error Sanitization PASS
- Existing v7.86 Source Files 356 ခု အားလုံးထိန်းသိမ်းထားသည်။ Original Character Images, Dictionary Content, Payment/YKCR/Exam Functions နှင့် Database Migrations မပြောင်းထား။
- Full `npm run build` **မအောင်မြင်သေး** — Local Environment မှာ `esbuild` မရှိ (`sh: esbuild: not found`)။ Netlify Staging Build ကို ဆက်စစ်ရမည်။
- PostgreSQL နဲ့ Live Authentication အပြည့်အစုံ **မစစ်ရသေး**။ DB Mock Tests သာ ဖြစ်သည်။

## Deploy

1. GitHub Desktop ရဲ့ ရှိပြီးသား Repository မှာ Staging Branch အသစ်လုပ်ပြီး ZIP Extract လုပ်ထားတဲ့ Files အားလုံး Copy/Replace လုပ်ပါ။ `.git` Folder ကို မဖျက်ပါနှင့်။
2. `package.json` Version `7.86.1` ဖြစ်ကြောင်းနှင့် `netlify.toml` Build `npm run build`, Publish `dist` ဖြစ်ကြောင်း စစ်ပါ။
3. Commit/Push → Netlify Deploy Preview တွင် Build Success စစ်ပါ။ Node.js 22/24 လိုအပ်ပြီး Build မှာ esbuild ကို npm dependencies က install လုပ်ရမည်။
4. Admin Login ဝင်ပြီး 7/30/90 Days Analytics တွေ Load အောင်မြင်ကြောင်း၊ Raw SQL မပေါ်ကြောင်း စစ်ပါ။
5. Mobile 320–390px တွင် JLPT Navigation 3 Links တစ်တန်းတည်း ဖြစ်ကြောင်း စစ်ပါ။
6. Incognito/Private Window မှာ Auto-fill, Enter နဲ့ Manual Login Click ကို စမ်းပါ။ Existing Session Restore ကို Login အသစ်နှင့် မရောသင့်ပါ။
7. Login, Signup, Recovery, Student/Admin Role Separation, Payment, YKCR Sync, Exam Access, Dictionary, YouTube Video Course ကို Staging မှာ တစ်ကြိမ် Regression စစ်ပါ။ အောင်မြင်မှ Production ကို Merge/Deploy လုပ်ပါ။

**အရေးကြီး:** ZIP သည် Source Build ဖြစ်ပြီး Production Website ကို မပြောင်းလဲထားပါ။ ZIP ထဲတွင် Generated `dist/` မပါပါ။ Full Netlify Build ကို Netlify ပေါ်မှာသာ အတည်ပြုရပါမယ်။
