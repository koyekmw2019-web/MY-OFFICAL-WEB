# YE KUN Official Website — v7.86.4

## JLPT Direct Navigation & Premium Animated Hamburger Menu

Boss ကြီးအတွက် v7.86.3 Latest Source ကို အခြေခံပြီး ပြင်ဆင်ထားတဲ့ Update ဖြစ်ပါတယ်။

### အသစ်ထည့်ထားတာ
1. Hamburger Menu ထဲမှာ JLPT Button ကို Video Course အပေါ်တည့်တည့် ထည့်ထားသည်။
2. JLPT Button ကိုနှိပ်ရင် Menu ပိတ်ပြီး၊ ရှိပြီးသား Study Hub ရဲ့ View More ကို အလိုအလျောက်ဖွင့်ကာ JLPT Learning Center Pro (Student & Teacher Card ပါသော Section) ဆီသို့ Scroll ရောက်သွားမည်။
3. URL `/#yk82Hub` ကနေလည်း JLPT Learning Center Pro သို့ တိုက်ရိုက်ရောက်နိုင်သည်။
4. Menu Navigation Icon 9 ခုကို Modern SVG Icon များဖြင့် ပြောင်းထားသည်။ Icon Library အသစ်မထည့်ပါ။
5. Menu Item Entrance, Hover/Focus, JLPT Arrival Highlight Animation များထည့်ထားသည်။
6. Mobile Performance အတွက် အလွန်အဝေးကနေ Scroll လုပ်ရာတွင် Instant Jump သုံးထားသည်။ Reduced Motion Setting ကို လေးစားသည်။
7. Menu Language my/en/ja၊ Account Dashboard/Login/Logout နှင့် Original Black/White/Red Design ကို ထိန်းသိမ်းထားသည်။

### မပြောင်းထားသောအရာများ
- Netlify Functions, Database Migrations, Authentication, Payment, YKCR Sync, Exam Rules
- Dictionary 8,542 Entries နှင့် Dictionary Search/Favorite/Report Error
- Student / Teacher Character Original Assets နှင့် JLPT Exam/Study Data
- Existing GitHub Repository, Google Search Title

### QA
- `npm test`: 249 PASS (v7.86.4 New Checks 8)
- Offline Chromium Preview: Mobile 320/390px, Desktop 1280px, Reduced Motion, Direct Hash — 5 PASS
- Public Build Preview: `scripts/build-public-v7841.mjs --preview-allow-missing-generated-bundle` စစ်ပြီး။
- Full `npm run build` ကို ဒီ Environment မှာ `esbuild` မရှိတာကြောင့် မအောင်မြင်သေးပါ။
- Live Netlify Auth, Payment, Exam, YKCR ကို မစစ်ရသေးပါ။

### Deploy (Staging ကို အရင်စစ်ပါ)
1. ZIP ကို Extract All လုပ်ပြီး Existing GitHub Repository Folder ထဲ Copy/Replace လုပ်ပါ။ `.git` Folder ကို မဖျက်ပါနဲ့။
2. New Staging Branch မှာ Commit/Push ပြီး Netlify Deploy Preview Build အောင်မြင်ကြောင်း စစ်ပါ။
3. `netlify.toml`: `npm run build`, `publish = "dist"`, `functions = "netlify/functions"` အတိုင်းဖြစ်ရပါမယ်။
4. Netlify Build မှ `esbuild` နဲ့ Identity Bundle Generate လုပ်ပေးရမယ်။ ZIP ထဲ `dist/` မပါပါ; CI Build မှ ထုတ်ပေးမည်။
5. Mobile/Desktop မှာ Hamburger > JLPT Learning Center Pro, View More, N5–N1 Cards, Video Course, Dictionary, Login/Logout, Admin/Student Dashboard စစ်ပါ။
6. Paid Access, Student Verification, Payment, YKCR Sync ကို Staging/Live QA ပြီးမှ Production သို့ Merge လုပ်ပါ။

**သတိပြုရန်:** Source ZIP အဆင်သင့်ဖြစ်တာနဲ့ Live Site မှာ Release ပြီးပြီလို့ မဆိုလိုပါ။

### JLPT Menu Target Correction (2026-11-10)
- User confirmed intended destination is the **JLPT Learning Center Pro panel** with original Student & Teacher images (id=`yk82Hub`), not the N5–N1 exam card grid.
- Menu link and direct hash updated to `#yk82Hub`; Study Hub grid remains collapsed unless user presses View More.
- Scroll-margin accommodates sticky header; reduced-motion aware and all original brand/assets unchanged.
- This is a corrected v7.86.4 ZIP, **not an extra feature release or deployed change**.
