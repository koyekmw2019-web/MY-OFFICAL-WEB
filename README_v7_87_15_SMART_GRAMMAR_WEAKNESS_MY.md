# YE KUN Official Website — v7.87.15 Smart Grammar Weakness Analysis

**Release status:** Cumulative SOURCE PATCH / Local & Synthetic Browser QA PASS / Full Production Build မစစ်ရသေးပါ။
**Base:** `YEKUN_v7.87.14_Grammar_Mastery_CUMULATIVE.zip` (115 files)။ GitHub `main` မှ Version အဟောင်းကို ပြန်မစပါ။

## အဓိကလုပ်ဆောင်ချက်များ

- **Smart Grammar Insights:** `/study/jlpt-grammar-insights.html` — N5–N1 Level အလိုက် လေ့ကျင့်ထားတဲ့ Result ပေါ်မူတည်ပြီး ပြန်လေ့လာရန် Grammar ကို အကြံပြုမယ်။
- **Repeated mistakes:** အနည်းဆုံး ၂ ကြိမ်မှားထားပြီး နောက်ဆုံးအဖြေလည်း မှားနေတဲ့ Pattern ကို ဦးစားပေးမယ်။ တစ်ကြိမ်သာ မှားဖူးသူကို သက်သေမလုံလောက်သေးကြောင်း ဖော်ပြမယ်။
- **Recovery / Spaced reminder:** နောက်ဆုံးမှန်လာရင် လက်ရှိထပ်မှားနေတဲ့ အခြေအနေကနေ ခွဲမယ်။ ၁/၃/၇ ရက် Review Interval ဟာ ရိုးရှင်းတဲ့ အကြံပြုချက်သာဖြစ်ပြီး မှတ်ဉာဏ်/အောင်နိုင်ခြေ ခန့်မှန်းချက်မဟုတ်ပါ။
- **7-day activity:** v7.87.15 ကစပြီး Practice အဖြေတစ်ခုချင်းစီရဲ့ ရက်စွဲ၊ စစ်ဆေးနည်း (typed answer, curated MCQ, self-rated recall) ကို Browser အတွင်း သီးခြားသိမ်းပြီး နောက်ဆုံး ၇ ရက် Trend အဖြစ်ပြမယ်။ **v7.87.14 အဟောင်းမှာ ဒီအသေးစိတ် မရှိတဲ့အတွက် အတိတ် 7-day Trend ကို ပြန်မတီထွင်ထားပါ။**
- **Student Dashboard:** အကျဉ်းချုပ် Card + Insights Page Link ကို Student မှာသာ ထည့်ထားတယ်။ Admin/Member Dashboard မှာ မထည့်ထားပါ။
- **Mobile:** Insight အကြံပြုချက်ရှိတဲ့ Level ရဲ့ Grammar JSON ကိုသာ လိုအပ်မှ Load လုပ်မယ်။ Responsive UI ကို 390px / 1280px Synthetic Chromium နဲ့ စစ်ထားတယ်။
- **Myanmar / English / 日本語:** အလုပ်လုပ်တဲ့ UI နှင့် Status စာသားတွေကို သုံးဘာသာပံ့ပိုးပြီး Japanese Grammar Titles/例文 တွေ မပြောင်းဘူး။
- **PWA stale-cache guard:** v7.87.14 Practice Script ကို ပြင်ထားလို့ Publish Output မှာ Script URL ကို `?v=78715` ပြောင်းမယ်။ Browser Cache အဟောင်းကြောင့် Insight Event Recording မလုပ်နိုင်တာကို ကာကွယ်တာပါ။

## Data ဘယ်လိုအသုံးပြုသလဲ?

- Source of truth = ရှိပြီးသား v7.87.14 Browser-local Grammar Mastery (`yk_grammar_mastery_v78714_v1`)။ မူလ Bookmark, Completed Grammar, Exam Attempt, Paid Access, YKCR မပြောင်းပါ။
- အသစ်သိမ်းတဲ့ event queue = `yk_grammar_insights_v78715_v1` — အများဆုံး 1,200 answers; `id,correct,method,mode,at` သာ သိမ်းတယ်။ User name/email/Student ID/answer text မသိမ်းပါ၊ Server/API သို့ မပို့ပါ။
- **အကန့်အသတ်:** တူညီတဲ့ Browser ကို Account များစွာ မျှသုံးရင် Grammar Practice Record တွေ ရောနိုင်တယ်။ Device ကြား Sync မရှိသေးပါ။ Recall Result တချို့က Self-rating ဖြစ်ပြီး Verified Exam Score မဟုတ်ပါ။ Auto-check ဟာ exact-match grammar answer ဖြစ်တဲ့အတွက် အဓိပ္ပာယ်တူ အသုံးအနှုန်းအားလုံးကို မမှန်နိုင်ပါ။
- **Privacy:** Browser localStorage ပိတ်ထားရင် Insight ရဲ့ နောက်ဆုံး Activity မှတ်တမ်းကို မသိမ်းနိုင်ပါ။ အဲဒီအခြေအနေမှာ Original Practice ကို ဆက်သုံးနိုင်မယ်။

## ထည့်ထားတဲ့ Source Files

- `study/jlpt-grammar-insights.html`
- `assets/yk-v78715-insights-engine.js`, `assets/yk-v78715-insights.js`, `assets/yk-v78715-insights.css`
- `assets/yk-v78715-tracker.js` (existing practice script နဲ့ ချိတ်ထားသည်)
- `assets/yk-v78715-student.js`, `assets/yk-v78715-student.css`, `assets/yk-v78715-link.css`
- `scripts/build-v78715-smart-weakness.mjs`
- `tests/v78715-{engine,source,release,build-fixture}.mjs`, `tests/v78715-browser-qa.py`
- Existing `assets/yk-v78714-practice.js` ရဲ့ Result Recording အပိုင်းကိုသာ သေးငယ်စွာတိုးထားတယ်။ `package.json` Version/Build/Test Chain နဲ့ QA Allowlist တွေကို လိုအပ်သလောက် ပြင်ထားတယ်။ **Database Migration အသစ် မရှိပါ။**

## QA စစ်ဆေးမှု

- v7.87.15 Engine: zero data, one wrong/low evidence, repeated mistakes, recovering, review interval, prioritization, 7-day stats, self-rated vs auto-checked, invalid event sanitize, 1,200-event cap, 5-Level isolation PASS။
- v7.87.15 Build Fixture + Release Gate: new pages, links, Student-only widget, missing JS negative test, cache-bust guard PASS။
- Synthetic Chromium (390px / 1280px): grammar recommendation, empty data, language cycle, no horizontal overflow PASS။ Browser-local new event recording and Student/Admin/Member role UI PASS။
- v7.87.14 Regression: 509 Grammar / 1,018 examples / 40 curated MCQ, self-rating, Bookmarks safety PASS။ Previous source/backend migration file hashes preserved။
- Older runtime regression: CRM, Business Analytics, Free-Exam handling, Service Worker privacy, mock exam subject logic PASS။
- **မစစ်နိုင်သေးသောအချက်:** ZIP တစ်ခုတည်းဟာ Full GitHub Repo မဟုတ်လို့ Full `npm run build`, `npm test`, Netlify Deploy Preview, Live Login, Payment, YKCR၊ Mobile Real-user LCP/INP/CLS မစစ်ရသေးပါ။ PDF မထည့်ပါ။

## Weekly GitHub Upload အတွက်

1. Existing `koyekmw2019-web/MY-OFFICAL-WEB` Repository ကို GitHub Desktop နဲ့ Local Backup/Branch ပြုလုပ်ပါ။
2. **ဒီ v7.87.15 Cumulative ZIP တစ်ခုတည်း** ကို Repository Root ထဲ ဖိုင်လမ်းကြောင်းအတိုင်း Copy/Replace လုပ်ပါ။ `.git` မဖျက်ပါနဲ့။ v7.87.5–v7.87.14 ZIP အဟောင်းတွေ သီးခြား Copy မလိုပါ။
3. Full Repository မှာ `npm ci`, `npm test`, `npm run build` အောင်အောင် စစ်ပါ။ Preflight က အဟောင်း/မပြည့်စုံသော Repository ကို ရည်ရွယ်ချက်ရှိရှိ Block လုပ်ပါမယ်။
4. Netlify Deploy Preview မှာ Grammar Insights, Practice, Student Dashboard, Language, 12 Exams, Free Access, Login, Payment, YKCR, Existing Database Migrations စစ်ပါ။
5. PASS ဖြစ်မှ Weekly Production Upload/Deploy လုပ်ပါ။ **ဒီ ZIP ထုတ်တဲ့အချိန်မှာ GitHub/Netlify/Database ကို မပြောင်းထားပါ။**

**အခြေအနေ: v7.87.15 Local-QA-tested Cumulative PATCH; NOT verified Production Stable.**
