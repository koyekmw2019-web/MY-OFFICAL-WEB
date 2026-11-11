# YE KUN Official Website v7.87 — Crimson Brand & Dedicated Exams

## ထည့်သွင်းထားသည့် Update
- Existing YK Black / White / Crimson ကို အသုံးပြုပြီး UI Theme ညှိထားသည်။
- Hero တွင် CSS + SVG Red Trails ပါဝင်သည်; reduced-motion နှင့် Mobile လျှော့ချမှု ပါဝင်သည်။
- Hamburger JLPT Menu ကို အမြဲနီနေခြင်းမှ Current-page Highlight အဖြစ် ပြောင်းသည်။
- Exam Cards ၁၂ ခု၊ Exam Engine၊ Backend Access, Payment, Identity, YKCR, Auto Save, Personal Coach အတိုင်းထားသည်။
- Build အချိန်တွင် Home Page မှ Exam Engine/UI အကြီးကို ခွဲပြီး /mock-exams.html သို့ ရွှေ့သည်။
- Homepage မှာ Card အသစ် မထည့်ပါ။ ရှိပြီးသား Study Hub Card ၏ 'Mock Exam' ကို နှိပ်လျှင် /mock-exams.html?exam=truck ကဲ့သို့ Exam Page သို့ သွားသည်။
- သီးသန့် Exam Page တွင် သက်ဆိုင်ရာ Card သို့ တိုက်ရိုက် Scroll ဖြစ်သည်။ Free Attempt မကုန်စေဖို့ Card ရဲ့ Start Button ကို ထပ်နှိပ်မှ စတင်မည်။
- Homepage Google Search Title မပြောင်းပါ; sitemap တွင် Exam Page အသစ်ထည့်သည်။

## Build Contract
`npm install && npm test && npm run build` / Netlify Publish Directory = `dist`
`index.html` တွင် Legacy Exam Source ကို Source Compatibility အတွက် ထိန်းထားပြီး `scripts/build-v787-exam-pages.mjs` က `dist/index.html` နှင့် `dist/mock-exams.html` ကို ခွဲဖန်တီးသည်။ Source HTML ကို တိုက်ရိုက် ဖွင့်ကြည့်လျှင် Build ပြီးသော Production Output နှင့် မတူနိုင်ပါ။

## Production မတင်မီ
- Staging Branch / Netlify Deploy Preview တွင် All 12 Exams routing, Login, Free 1 Attempt, Student Unlimited, Paid Access, Auto Save & Resume, Verified Score, Coach, YKCR, Payment Regression လုပ်ပါ။
- Admin/Payment Mutation ကို Production Test အတွက် မသုံးပါနှင့်။
- Production Merge ကို Boss အတည်ပြုမှသာ ပြုလုပ်ပါ။
