# YE KUN Official Website v7.86.3 — All Exam Learning Dashboard & Mobile Performance

**Base:** v7.86.2 `YEKUN_v7.86.2_Dashboard_Dictionary_Video_Session_Refinement.zip`  
**Release date:** 2026-11-10  
**Education brand:** STUDYING WITH YE KUN  
**Scope:** Source update only. Live Netlify production has not been updated or approved by this ZIP.

## Dashboard Pro (ကျောင်းသား)

- `All Exams / SSW / Driving / JLPT` အလိုက် မြင်နိုင်သည်။ စာမေးပွဲ ၁၂ မျိုး (TRUCK, TAXI, BUS, 自動車整備, 普通自動車, 二輪, 原付, JLPT N5–N1) ကို Card များဖြင့် ရွေးနိုင်သည်။
- Verified exam attempts, pass rate, most recent raw score / full mark၊ ပျမ်းမျှ ရာခိုင်နှုန်းကို စာမေးပွဲ **တစ်မျိုးချင်း** တွက်ထားသည်။ မတူညီသော score scales များကို ပေါင်းမတွက်ပါ။
- Verified records နှစ်ကြိမ်အောက်သာရှိလျှင်၊ သို့မဟုတ် section-level data မရှိလျှင် အားနည်းသောဘာသာရပ်ကို အထောက်အထားမရှိဘဲ မခန့်မှန်းပါ။
- Saved Wrong Answers ကို နှိပ်မှ API မှ Load လုပ်သည်။ JLPT Level ရွေးပြီး “Load JLPT lesson progress” နှိပ်မှ progress + learning content ကို load လုပ်သည်။ Lesson completion သည် Exam Subject Accuracy မဟုတ်ပါ။
- ပထမ Dashboard Load သည် ရှိပြီးသား Identity ရှိသည့်အခြေအနေတွင် Exam Status နဲ့ Exam Activity API တို့ကိုသာ ခေါ်ရန် စီစဉ်ထားသည်။ Test fixture တွင် `exam-my-activity` ကို တစ်ကြိမ်သာ ခေါ်နိုင်ကြောင်း စစ်ထားသည်။ Actual requests depend on other extensions and live role state.
- Exam Access / Free quota စည်းမျဉ်းကို Client UI မှ မပြောင်းဘဲ Server မှ ဆက်ထိန်းသိမ်းသည်။

## Performance

- Netlify `dist/` Build အတွင်း `index.html` Dictionary Inline Runtime (~304.6 KB) ကို JS file အဖြစ် ခွဲထားပြီး၊ Dictionary Section ကို မြင်ရခါနီး သို့မဟုတ် Focus လုပ်မှ Dictionary Data + Runtime ကို Download/Execute လုပ်သည်။ Source `index.html` ကို အသားတင် QA အတွက် မူလအစီအစဉ်အတိုင်းထားထားသည်။
- `dist/index.html` uncompressed: previous v7.86.2 **813,615 bytes** → v7.86.3 **511,127 bytes** (37.2% smaller). Page speed gain အတိအကျ မတိုင်းရသေးပါ။
- Dictionary 8,542 Records ကို Source ထဲမှာ မပြင်ထားပါ။ Deploy-only packed dictionary file **960,760 bytes** ကို Dictionary Section မရောက်ခင် မတောင်းဆိုတော့ပါ။ Service Worker static cache version update လုပ်ထားသည်။
- Dashboard Additional Learning Tools (`yk-learning-v760.js`) ကို ဖွင့်မှ API Load လုပ်သည်။ Old Learning Overview ရဲ့ Saved Mistakes ကိုလည်း Button နှိပ်မှ Fetch လုပ်သည်။
- Mobile/Touch မှာ နောက်ခံ Glow Motion အချို့ကို လျှော့ထားပြီး Original Character WebP နှစ်ခုလုံး မပြောင်းထားပါ။

## QA Results

- `npm test` **241 PASS** (14 v7.86.3 tests included)
- Offline Chromium 390px / 1280px: 12 exam cards, category changes, data, verified scores, lazy JLPT & mistakes, 0px horizontal overflow, no JS errors — PASS.
- Offline Chromium: Dictionary lazy loader loads when scroll-near, search renders — PASS (small UI fixture); all 8,542 dictionary records' byte equivalence is separately validated by automated tests.
- Protected Netlify Functions, YKCR Sync, Exam Access, Payment, Login/Authentication backend, Netlify DB migrations, anime assets — unchanged byte-for-byte from v7.86.2 ZIP.
- `dist/` Preview was built with `--preview-allow-missing-generated-bundle`; this does NOT prove a full Netlify build.
- **Full npm/Netlify Build NOT VERIFIED:** `esbuild` not installed and npm registry access failed (`EAI_AGAIN`). Live Login, Payment, YKCR, Exam and DB tests not run.
- ZIP Integrity / source preservation checked. No PDF added.

## Deploy checklist

1. v7.86.3 ZIP Extract လုပ်ပြီး ရှိပြီးသား GitHub Repository Folder ထဲ Copy/Replace လုပ်ပါ (`.git` မဖျက်ပါနှင့်)။
2. `npm run build` / `dist` / `netlify/functions` ကို `netlify.toml` တွင် သတ်မှတ်ထားပြီးသား။ Netlify Build Dependencies အောင်မြင်စွာ install လုပ်နိုင်ရမည်။
3. Production မဟုတ်သော Staging Branch/Deploy Preview မှာ အရင်စမ်းပါ။
4. Student Login အောက်တွင် 12 Exams/Result/Review/Progress၊ Dictionary Search/Report၊ Mobile Home/Video Class၊ Payment/Exam Access/YKCR/Database ကို အတည်ပြုပါ။
5. Staging အောင်မြင်ပြီးမှ main/Production သို့ Push/Merge လုပ်ပါ။

**No new Database tables, environment variables or backend services are required by v7.86.3.**
