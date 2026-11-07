# YE KUN Official Website v7.81 — Advanced SEO & Google Indexing

**Base Source:** `YEKUN_v7.80_Stability_Speed.zip`  
**Date:** 2026-11-07  
**Release:** Source ZIP (not yet deployed, not indexed)

## ပြင်ဆင်ထားသော SEO

1. Homepage Title **`YE KUN Official Website | YE LINN OO`** ကို မပြောင်းထားပါ။ Header, Logo, STUDY HUB Card, Dashboard Design အားလုံးထိန်းသိမ်းထားပါတယ်။
2. Google က Homepage ရဲ့ Section တွေကိုသာ ကြည့်ရတာထက် **Public Content Page အသစ် 16 ခု** ကိုလည်း crawl လုပ်နိုင်အောင် ထည့်ထားပါတယ်။
3. `sitemap.xml` ထဲမှာ **17 URL** (Homepage + Guide 16 ခု) ပါပါတယ်။ `robots.txt` ထဲမှာ Sitemap လမ်းညွှန်ထားပါတယ်။
4. Page တစ်ခုချင်း **unique title, meta description, canonical, Open Graph, BreadcrumbList, WebPage JSON-LD** ပါပါတယ်။
5. ဂျပန်စာနဲ့ မြန်မာစာ နှစ်ဘာသာ ဖတ်လို့ရပြီး၊ မူလ Website ရဲ့ Dictionary / Mock Exam / Textbook Request တွေဆီ Link ချိတ်ထားပါတယ်။
6. Homepage Footer မှာ SEO Guide Link အနည်းငယ် ထပ်ထည့်ထားပါတယ်။ မူလ Homepage Card Design/JS Layout ကို မပြောင်းထားပါ။

## Public Pages (Google ကို Sitemap မှတစ်ဆင့် Discover လုပ်စေမယ့်စာမျက်နှာများ)

- `/study/index.html` — 学習ガイド / Study HUB overview
- `/study/jlpt-n5.html`, `/study/jlpt-n4.html`, `/study/jlpt-n3.html`, `/study/jlpt-n2.html`, `/study/jlpt-n1.html` — JLPT Level အလိုက်
- `/study/jlpt-mock-exams.html` — JLPT Mock Exam နှင့် 直前対策
- `/study/japanese-myanmar-dictionary.html` — 日本語・မြန်မာ Dictionary
- `/study/ssw-transport.html` — 特定技能 自動車運送業
- `/study/ssw-truck.html`, `/study/ssw-taxi.html`, `/study/ssw-bus.html` — Truck / Taxi / Bus
- `/study/transport-textbooks.html` — 運送業テキスト / Textbook Request
- `/study/ssw-mock-exam.html` — SSW Mock Exam
- `/study/ssw-auto-maintenance.html` — 自動車整備
- `/study/driving-license.html` — 普通自動車・二輪・原付

**သတိပြုရန်:** Public Page အသစ်တွေက **Learning Guide** တွေပါ။ Mock Exam အဟောင်းကိုပဲ Link ချိတ်ထားတာ ဖြစ်လို့ Paid/Student Access Lock ကို မဖြတ်ကျော်နိုင်ပါ။ JLPT သင်ခန်းစာအသစ်တွေကို မရှိဘဲ ထည့်ထားသလို မဖော်ပြပါ။ Dictionary ဘာသာပြန်အားလုံး Human Verified မဟုတ်သေးကြောင်းလည်း ဖော်ပြထားပါတယ်။

## Privacy & Source Protection

- Login / Admin / Student / Member / Router Dashboard pages: `noindex` ဆက်ရှိပါတယ်။ Sitemap ထဲ မပါပါ။
- Source comparison: **Netlify Backend, Login, Payment, Student Sync, Dictionary Data, JLPT Question Banks, Service Worker unchanged.**
- v7.80 Image Asset Performance optimization မပျက်ပါ။
- Google Meta Keywords အများကြီး ထည့်ရုံနဲ့ Ranking တက်မယ်လို့ မဖော်ပြပါ။ သက်ဆိုင်ရာ Public Content တွေနဲ့ Crawlable Links ကို အဓိကထားပါတယ်။

## Deploy ပြီးမှ Google Search Console မှာ ဆောင်ရွက်ရန်

1. GitHub Desktop မှာ လက်ရှိ Repository ကို Backup Commit/Branch လုပ်ပြီး ဒီ ZIP Source ကို Copy လုပ်ပါ။ `.git` ကို မဖျက်ပါနဲ့။
2. Commit `v7.81 Advanced SEO and Google Indexing` → Push origin → Netlify Deploy Preview ကို စစ်ပါ။
3. Netlify မှာ `npm run build` အောင်မြင်ကြောင်း စစ်ပါ။ Publish directory က `.`၊ Functions က `netlify/functions` ဖြစ်ပါတယ်။
4. Deploy Preview မှာ `/study/index.html`, `/study/jlpt-n3.html`, `/study/ssw-transport.html`, `/study/japanese-myanmar-dictionary.html` ကို ဖွင့်ကြည့်ပြီး Link / Mobile Layout စစ်ပါ။ အဲဒီအပြင် Login / Dashboard / Mock Exam / Payment / YKCR ကို Regression Check လုပ်ပါ။
5. Production Deploy ပြီးမှ **Google Search Console → Indexing → Sitemaps → `sitemap.xml` → Submit** ကို လုပ်ပါ။ ယခင် Sitemap Submit ပြီးသားဖြစ်ရင် Updated Sitemap ကို Google ဖတ်ပေးဖို့ စောင့်ကြည့်ပါ။
6. **URL Inspection** မှာ `/study/index.html`, `/study/jlpt-n5.html`, `/study/ssw-transport.html`, `/study/transport-textbooks.html` စတာတွေကို သီးခြားစစ်ပြီး `Request Indexing` လုပ်နိုင်ပါတယ်။
7. Search Console → Pages နဲ့ Performance ကို စစ်ဆေးပါ။ Index မဝင်သေးတဲ့ URL တွေရှိရင် Crawl/Canonical/Noindex အခြေအနေကို URL Inspection နဲ့ ပြန်စစ်ပါ။

**Google Index / Ranking အာမခံမရပါ။** Sitemap ပါတာတင်နဲ့ Google Index လုပ်ဖို့ မသေချာပါ။ Google Search Console ထဲကို ဒီ Environment ကနေ အလိုအလျောက် Submit မလုပ်ထားပါ။

## QA & Known Limitations

- `npm test` — **PASS** (v7.81 new 8 checks PASS + previous regression suites PASS)
- `sitemap.xml` — Valid XML, Canonical 17 unique URL, no private URLs.
- Source comparison — Protected files compared and unmodified.
- Full `npm run build` — **မစစ်နိုင်** (Runtime မှာ npm dependencies/esbuild မပါ).
- Real desktop/mobile browser rendering — **မစစ်နိုင်** (Chromium ကို စမ်းသပ်ရာမှာ Environment Time-out).
- Live Netlify / Search Console index status — **မစစ်ရသေး**.

Source-level test result `QA_v7_81_RESULTS.json` ထဲမှာ အသေးစိတ်ပါရှိပါတယ်။
