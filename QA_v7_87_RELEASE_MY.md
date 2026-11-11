# v7.87 — Source & QA Report (မြန်မာ)

## Implementation
- Base: v7.86.5 Production-approved Source; Homepage Search Title မပြောင်းထားပါ။
- JLPT / Dashboard / Dictionary / Video Course / Login / Public Study Guide များတွင် YK Crimson / Black / White Theme Override ထည့်ထားသည်။
- Hero တွင် lightweight CSS/SVG Red Lines (prefers-reduced-motion support) ထည့်ထားသည်။
- Hamburger JLPT အမြဲအနီ Highlight ပြဿနာကို active-page-only Highlight အဖြစ် ပြောင်းထားသည်။
- Homepage မှ အဟောင်း Exam Runtime သီးသန့် 3 inline scripts၊ Exam DOM နှင့် Exam-only JS များကို deployed `dist/index.html` မှာ ဖယ်ထားသည်။ Card အသစ်မထည့်ထားပါ။ Study Hub ရှိပြီးသား Card/Button သာ ရှိသည်။
- Build က `dist/mock-exams.html` ကို Exam Engine အဟောင်းနှင့် Original 12 Cards အပြည့်အစုံဖြင့် သီးသန့် ဖန်တီးသည်။ `/mock-exams.html?exam=truck` စသည့် URL တွင် သက်ဆိုင်ရာ Existing Exam Card သို့ သွားသည်။ Free attempt ကို Page ဝင်ရုံဖြင့် မကုန်စေဘဲ Start Button ကို ထပ်နှိပ်ရမည်။
- Dictionary Data, Question Banks, Login, Server-side Exam Access, Payment, YKCR နှင့် Netlify Function / Migration များ မပြောင်းထားပါ။

## Local QA
- `npm test`: **277 PASS outputs, zero failures**.
- Local source integrity: **43 backend files byte-for-byte unchanged**.
- Build output split: **PASS** (preview mode; missing generated Identity bundle ကို အတုမလုပ်ထားပါ).
- Dedicated page: Original 12 Exam Cards + Exam Panel ရှိသည်။ Homepage မှ Exam Panel / exam scripts မပါတော့သည်။
- Deployed Homepage HTML file size: **519,001 bytes → 284,502 bytes** (234,499 bytes / ~45.2% reduction). ဒါက HTML size သာဖြစ်ပြီး Real user load time ကို မတိုင်းတာရသေးပါ။
- No PDF / secrets added to ZIP.

## မစစ်နိုင်သေးသောအချက်
- Full `npm run build` ကို `esbuild`/npm Dependency Install မရသေးလို့ **မစစ်နိုင်**။ Netlify Staging Build လိုအပ်သည်။
- Chromium Desktop/Mobile Browser Visual Test ကို Sandbox Policy ကြောင့် **မလုပ်နိုင်**။ Staging Preview တွင် စမ်းပါ။
- GitHub Push/Netlify Staging/Production Deploy **မလုပ်ရသေးပါ**။
- Login, Free-1/Paid/Student Unlimited, Payment, YKCR Live Sync, Exam Auto Save/Resume, Verified Results ကို Staging Backend မှာ Regression Test ဆက်လုပ်ရန် လိုသည်။

## How to deploy
1. ZIP Extract → လက်ရှိ `MY-OFFICAL-WEB` GitHub Repository Working Directory ထဲ Existing Files ကို အစားထိုးပါ (Project Folder အသစ် မဖန်တီးပါနှင့်)။
2. GitHub Desktop မှာ Changes Check → Feature Branch `v7.87-staging` → Commit → Publish Branch → Pull Request → Netlify Deploy Preview Build ကို စစ်ပါ။
3. Deploy Preview အောင်မြင်ပြီး Real Device QA မှန်မှသာ PR Merge ကို လုပ်ပါ။
4. Netlify Build Command `npm run build`, Publish Directory `dist`, Functions Directory `netlify/functions` ကို ယခင်အတိုင်းထားပါ။
5. `mock-exams.html` သည် `scripts/build-v787-exam-pages.mjs` က `dist` ထဲသို့ Build အချိန်တွင် ဖန်တီးပေးမည်။ Source Root ထဲတွင် Physical File မလိုအပ်ပါ။
