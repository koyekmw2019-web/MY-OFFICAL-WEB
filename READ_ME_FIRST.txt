STUDYING WITH YE KUN — v7.87.6 MOBILE JLPT REPAIR 03

Boss ကြီး — ဒီ ZIP က Explore Lessons ဘေးတိုက်ရွေ့ပြီး UI ပျက်တာနဲ့ Grammar Card Detail မပေါ်တာကို ပြင်ဖို့ ဖြစ်ပါတယ်။

**ဒီ ZIP သည် Website အပြည့်အစုံ မဟုတ်ဘဲ Source Code PATCH ဖြစ်ပါတယ်။**
**GitHub main / Production ကို တိုက်ရိုက်မတင်ပါနဲ့။**

လုပ်ရမယ့်အဆင့်များ:
1. GitHub Desktop > MY-OFFICAL-WEB > Fetch/Pull `main`.
2. Create NEW branch `qa/v7.87.6-mobile-repair-03`.
3. ဒီ ZIP Extract လုပ်ပြီး `package.json` ရှိတဲ့ Repository Folder ထဲက
   တူညီတဲ့ Folder တွေမှာ ဖိုင် ၅ ခု Copy ကူးပါ။
4. GitHub Desktop Changes မှာ အောက်ပါ Code ဖိုင်တွေရှိရပါမယ်:
   MODIFIED  scripts/build-page-transitions-v7875.mjs
   ADDED     scripts/build-v7876-jlpt-mobile-repair.mjs
   ADDED     assets/yk88-jlpt-mobile-repair.css
   ADDED     assets/yk88-jlpt-mobile-repair.js
   ADDED     tests/v7876-mobile-repair.mjs
5. Terminal:
   npm test
   npm run build
   node tests/v7876-deployed-output.mjs
   node tests/v7876-mobile-repair.mjs --release
6. PASS အကုန်ဖြစ်မှ Branch ကို Commit + Push Origin လုပ်ပါ။
7. GitHub Draft PR -> Netlify Deploy Preview မှာ **Mobile ဖုန်းအစစ်** နဲ့ စစ်ပါ။
8. Boss ကြီး ခွင့်ပြုမှ main ကို Merge လုပ်ပါ။

QA TEST
- Study > Open All Lessons > Explore Lessons
- Page တစ်ခုလုံး ဘေးတိုက်မရွေ့ရ
- Tabs 7 ခုကို Tabs နေရာတွင်သာ Scroll ရမည်
- Bottom nav Home Study Exam Video Account 5 ခုလုံးပေါ်ရမည်
- Grammar > ～です > Detail Page ကို ဖွင့်ရမည်
- Header STUDYING WITH YE KUN Logo၊ 例文 ၃ကြောင်း၊ JP/MM/EN၊ MY/EN Labels မရှိ၊ underline ရမည်

Note: Browser cache `?v=7876fix03` သုံးထားသည်။ Source Html, Database, SQL,
Identity, YKCR, exam access rules and receipt logic unchanged.
