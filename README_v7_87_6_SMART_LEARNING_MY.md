# YE KUN Official Website v7.87.6 — Smart Learning Experience

**Baseline policy:** GitHub `main` (checked version 7.87.4) + **the last assistant-delivered v7.87.5 Performance & Stability PATCH ZIP**. This release is a **cumulative patch** covering **v7.87.5 + v7.87.6**. It does not depend on the user having already pushed v7.87.5 to GitHub.

**Education brand:** STUDYING WITH YE KUN | **Languages:** Myanmar / English / Japanese | **Theme:** Premium Black / White / Crimson Red

## ဦးစားပေး Feature (v7.87.6)

- **Student Dashboard** ကိုသာ `My Study Journey` လေ့လာရေးအပိုင်းအသစ် ထည့်ထားသည်။ Original Admin/Member Dashboard, Login, Payment, YKCR, Exam Question Bank, Scoring, Attempt Limits, Auto Save, Result UI မပြောင်းပါ။
- ရှိပြီးသား Exam 12 မျိုးထဲက Card ရွေးပြီး **သက်ဆိုင်ရာ Exam တစ်မျိုးချင်းစီ** ရဲ့ Server-verified အမှတ်၊ ပျမ်းမျှ၊ ရက်စွဲမှန်ကန်တဲ့ **နောက်ဆုံး ၅ ကြိမ်** ရလဒ်ကို Bar Chart နဲ့ ကြည့်နိုင်သည်။ **မတူညီတဲ့ Exam အမှတ်စကေးများ မပေါင်းတွက်ပါ။**
- Verified Result >=2 + Average <70% ဖြစ်မှသာ “ဒီ Exam ကို Review လုပ်သင့်” ဆိုတဲ့ **အထောက်အထားရှိတဲ့ Recommendation** ကိုပြမည်။ Topic အလိုက် အားနည်းချက်တွေကို အထောက်အထားမရှိဘဲ မဖန်တီးပါ။ အသေးစိတ် Topic Analysis က ရှိပြီးသား **Personal Exam Coach** ကနေသာ ရမည်။
- **Today’s 20-minute Routine** — Saved Wrong Answers (5 min) → Related Lesson (10 min) → Personal Exam Coach / Mock Exam (5 min)။ Checkbox 3 ခုသည် ဒီ Browser Tab ရှိနေချိန်အတွက်သာဖြစ်ပြီး Database/Cloud Progress အဖြစ် မသိမ်းပါ။ လက်ရှိ Existing Learning Progress, Daily Practice နဲ့ မထပ်အောင် လုပ်ထားသည်။
- **Recommended Next Lesson** က Exam ရွေးထားမှုကို အခြေခံပြီး ရှိပြီးသား Lesson Page ကို ချိတ်မည်။ Truck/Taxi/Bus/Auto Maintenance/Driving/JLPT N1–N5 အလိုက် link ခွဲထားသည်။
- **Myanmar / English / Japanese** Dashboard language ခလုတ်နှင့် အတူလိုက်ပြောင်းသည်။ မူရင်း Dashboard Logo ကို ဆက်သုံးထားသည်။
- `YKDashboardActivityPromiseV7863` ကို **ပြန်အသုံးပြုထားသောကြောင့် Exam History API အသစ် မတိုးပါ**။ Private account scope မပြောင်းပါ။

## v7.87.5 ကိုပါ စုထည့်ထားခြင်း

- Non-JLPT Exam 7 မျိုးပေါ်မှာ မလိုအပ်တဲ့ JLPT Engine/Bank files မတင်တော့စေရန် optimization
- `service-worker.js` public-static-only cache Version v7.87.5, HTML/Private API မသိမ်းခြင်း
- Exam Center နှင့် 12 Exam Pages regression tests, offline/critical-resource warning UI
- ထပ်တိုး Database Table, Environment Variable, PDF မရှိပါ။

## GitHub / Netlify Credit ချွေတာဖို့ အလုပ်လုပ်ပုံ

**Upload တစ်ပတ်တစ်ကြိမ်သာ လုပ်မည်။** နေ့စဉ် Update Request အလိုက် အနောက်ဆုံးပေးထားတဲ့ ZIP ကနေ ဆက် Update ပြုလုပ်မည်။ GitHub `main` ကို baseline comparison အတွက်သာ စစ်မည်။ နောက်တစ်ပတ် GitHub Desktop မှာ **နောက်ဆုံး CUMULATIVE ZIP တစ်ခုတည်း** တင်ရမည်။ အဆင့်အလိုက် ZIP အားလုံးကို သီးခြား Push မလုပ်ရပါ။

အခု GitHub `main` က 7.87.4 ဖြစ်နေရင် ဒီ Cumulative ZIP ကို Extract → files/folders အားလုံးကို မူလ repository root ထဲ **Copy/Replace** လုပ်နိုင်သည်။ `dist/` ကို Copy မလုပ်ပါနှင့်။ `.git` ကို မဖျက်ပါနှင့်။ `main` Latest Fetch/Pull ပြီး Build/Test အောင်မြင်မှု စစ်ပါ။ Production Safety အတွက် အကြံပြု: Testing Branch → Netlify Deploy Preview → main Merge ကို Weekly Upload Day တစ်ရက်တည်းတွင် စုပြုလုပ်ပါ။ ဒီမှာ ရှိပြီးသား GitHub Repository ကိုပဲ သုံးမည်။

**Commit example:** `v7.87.6 cumulative Performance Stability and Smart Learning`

## QA / Verification

- Pure-source JS Syntax / `v7875` Offline-Service Worker Runtime / `v7876` Smart Journey Pure Engine / Source contract tests
- Generated fixture: Student Dashboard injection (Existing Dashboard scripts retained), 12 original Exam Panel markers and no new scripts in Admin/Member/Login
- Original Netlify full build (`npm run build`) ကို local fixture မှာ အပြည့်မလုပ်နိုင်သေး; GitHub/Netlify မှာ နောက်တစ်ပတ် Deploy Preview စစ်ပါ။
- **Live QA required:** verified/unverified exam histories; Student Account data isolation; error when network down; coach/lesson links; 390px/desktop; language buttons; Payment/Exam attempts/Auto Save regression.
- Code နှင့် ZIP QA PASS ဖြစ်သည်ဆိုခြင်းသည် Production Login/Payment/YKCR Test PASS ဖြစ်ကြောင်း မဆိုလိုပါ။

**No automatic GitHub push or Netlify production deploy has been performed.**
