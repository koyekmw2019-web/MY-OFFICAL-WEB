# YE KUN Official Website — v7.57 Animated Login + Menu Repair

## ပြင်ဆင်ထားသည့်အပိုင်း

- Homepage နှင့်ကိုက်ညီသော Premium Black/White `login.html` Page အသစ်
- Desktop တွင် Sign In / Create Account Sliding Animation; Mobile တွင် Responsive Form Switch
- မြန်မာ / English / 日本語 Language Switcher (`yk_lang` ကို ဆက်သုံးထားသည်)
- Sign In / Create Account / Forgot Password / Invite / Recovery callbacks
- Login အောင်မြင်သည့်အခါ Homepage `/#home` သို့ ပြန်သွားခြင်း
- Hamburger Menu ထဲက Featured YouTube menu item နေရာတွင် Login / Logout dynamic item
- Menu heading ကို Header အောက်တွင်မဖုံးတော့အောင်၊ Menu Scroll ကို သီးခြားဖြစ်အောင် ပြင်ဆင်ခြင်း
- Account မဝင်ထားရင် Exam Start လုပ်သောအခါ `login.html` သို့ သွားခြင်း
- Homepage ကို Guest ကြည့်ရှုခွင့် ဆက်ထားခြင်း
- Netlify Identity Auth၊ YKCR Student Verification၊ Student Access/Payment/Admin/Exam စည်းကမ်းတို့ကို မပြောင်းခြင်း

## Authentication Architecture

- Login / Signup / Logout: `src/identity-client.js` နှင့် `@netlify/identity` (ရှိပြီးသား Auth System)
- Login Page တွင် `/assets/identity.bundle.js` ကို Netlify Build (`npm run build`) ဖြင့် ဖန်တီးရမည်။ `identity.bundle.js` ကို သီးသန့် ZIP ထဲတွင် ထည့်ထားခြင်းမဟုတ်။
- Student ID + Verification Code: Homepage Existing Student Verify workflow (`exam-student-verify` function / YKCR sync)
- အသစ်သော Student Database, Credential Database, server-side auth endpoint မရှိပါ။
- Login ပြီးတိုင်း Student Verified ဖြစ်မသွားပါ။ YKCR မှ အတည်ပြုထားသော active students သာ unlimited access ရသည်။

## Deploy

1. Git repo သို့ Project Source update/push လုပ်ပါ။ `login.html` နှင့် JS/CSS အသစ်များ ပါရမည်။
2. Netlify Git-connected Build အတိုင်း npm run build ဖြင့် deployment လုပ်ပါ။ Root directory ကို publish လုပ်ပါသည်။
3. Netlify Identity ၏ Account Registration, email confirmation, recovery URL, and site settings ကို စစ်ဆေးပါ။ Open Registration မဟုတ်ရင် Sign Up အောင်မြင်မည် မဟုတ်ပါ။
4. တကယ့် account test အတွက် Login → Home, Logout, Sign Up email confirmation, Forgot Password, YKCR Verification, Guest exam block, Paid/Free/Student Exam permission ကို Deploy URL ပေါ်မှာ စမ်းသပ်ပါ။

## စစ်ဆေးမှုအခြေအနေ

- `login.html` Desktop/Mobile UI form switching / forgot link: automated browser DOM tests passed.
- Mobile horizontal overflow: fixed and retested.
- Menu Auth Login ↔ Logout label: mocked Identity tests passed.
- Signup / Forgot Password method wiring: mocked SDK calls passed.
- Netlify Functions, DB migrations, existing JLPT Assets: identical to v7.56.
- ZIP integrity checks: run before delivery.

**သတိ:** Real Netlify Identity authentication, email delivery, payment, admin, database and live-site E2E have NOT been tested. Site NOT deployed. No claims of live success.
