# YE KUN Official Website v7.85.0 — Video Course Learning Center

## Base

- Source အခြေခံ: `YEKUN_v7.84.1_Safe_File_Audit_Lightweight_Update.zip`
- v7.84.1 ရဲ့ `dist` Build System, Dictionary Packed Transport, Dashboard Pro, Dictionary Quality UI, JLPT Learning Center, SEO နဲ့ Anime Characters အားလုံးကို ထိန်းထားပါတယ်။
- ဒီ ZIP က **Source ZIP** သာ ဖြစ်ပါတယ်။ Live Netlify သို့ မတင်ရသေးပါ။

## Feature အသစ်

1. Homepage Hamburger Menu ထဲမှာ `Video Course` ကို ထည့်ထားပါတယ်။ URL: `/video-class.html`။
2. Premium Black/White/Red, Responsive Design၊ Free Sample Card ၃ ခု။
3. YouTube နဲ့ တိုက်ရိုက်ချိတ်ထားပါတယ်။ Video Files ကို Netlify မှာ Upload မလုပ်ထားပါ။
   - TRUCK: `https://youtu.be/Uu9pI35J6Kw`
   - TAXI: `https://youtu.be/sBQRpsDpBis`
   - BUS: `https://youtu.be/-_ZD6orT8b8`
4. Click-to-load Player: စာမျက်နှာ စဖွင့်ချိန် YouTube iframe မဖန်တီးပါ။ Play နှိပ်မှ `www.youtube-nocookie.com/embed/...` ဖွင့်ပြီး Dialog ပိတ်ချိန် iframe ကို ဖယ်ရှားပါတယ်။
5. `ALL / TRUCK / TAXI / BUS` Filter၊ Japanese/Myanmar/English UI အချို့ကို လိုအပ်သလို ပြောင်းလဲနိုင်ပါတယ်။ Language preference ကို Home ရဲ့ `yk_lang` နဲ့ အတူသုံးပါတယ်။
6. Existing `assets/study-hub-covers/{truck,taxi,bus}.webp` Book Covers တွေကို အသုံးပြုထားပါတယ်။ အသစ်ပြန်ဖန်တီးထားတာ မဟုတ်ပါ။
7. Contact Button: `https://www.facebook.com/share/19kc6Vk9XM/` (Boss ကြီးပေးထားတဲ့ သင်တန်းအတွက် Link)။ Existing STUDYING WITH YE KUN Facebook Page ကိုလည်း ထည့်ထားပါတယ်။
8. Public SEO sitemap entry, `CollectionPage` schema၊ canonical။ Homepage title `YE KUN Official Website | YE LINN OO` ကို မပြောင်းပါ။

## အသစ် / ပြင်ထားသော Files

- NEW `video-class.html`
- NEW `assets/yk-video-course-v785.css`
- NEW `assets/yk-video-course-v785.js`
- NEW `tests/v785-video-course.mjs`
- NEW `README_v7_85_VIDEO_COURSE_MY.md`
- NEW `QA_v7_85_RELEASE.json`
- MODIFIED `index.html` — Homepage Hamburger Menu `Video Course` link တစ်ခုသာ ထည့်သည်
- MODIFIED `sitemap.xml` — New Video Course public page
- MODIFIED `scripts/build-public-v7841.mjs` — Video Course Page ကို `dist` ထဲထည့်သည်၊ Report Version ကို Update လုပ်သည်
- MODIFIED `package.json` — Version `7.85.0`၊ QA script နှစ်နေရာတွင် Test ချိတ်သည်
- MODIFIED 5 legacy QA gating tests — Version 7.85 နဲ့ Public Sitemap ထပ်တိုးထားတာကို ခွင့်ပြုရန်သာ

## Netlify / GitHub Deploy

Boss ကြီးရဲ့ GitHub `MY-OFFICAL-WEB` Repo ကို အသုံးပြုပါ။ Repo အသစ် မလိုပါ။ လက်ရှိ GitHub `main` က v7.81 ဖြစ်နေသေးနိုင်တာကြောင့် `netlify.toml` တစ်ဖိုင်တည်းမဟုတ်ဘဲ **v7.85.0 Source အားလုံး** ကို Repository ထဲ Replace လုပ်ရပါမယ်။ `.git` Folder ကို မဖျက်ပါနဲ့။

- Netlify Build Command: `npm run build`
- Publish Directory: `dist`
- Functions Directory: `netlify/functions`
- Node.js: 22 သို့မဟုတ် 24 (Source `package.json` Engines အရ)
- `dist/` ကို GitHub သို့ မတင်ပါ။ Netlify Build မှာ ဖန်တီးပေးရပါမယ်။
- **Staging/Deploy Preview ကို အရင်စမ်းပါ။** Production auto-deploy ရှိတဲ့ `main` ကို တန်း Push မလုပ်ခင် စစ်ပါ။
- v7.85 Video Course Feature ကိုယ်တိုင်အတွက် New DB / New Netlify Functions / New Environment Variables မလိုပါ။ သို့သော် v7.83 Dictionary Report Migration နဲ့ အခြားအရင် Version လုပ်ဆောင်မှုတွေ မပြီးသေးရင် သီးခြားအတည်ပြုရန် လိုပါတယ်။

## QA

- `npm test`: **PASS**, 203 `PASS` log lines (7 new v7.85 checks)။
- Headless Chromium local *document-injection* Desktop 1280px/Mobile 390px: **10 checks PASS** (Layout, Filter, Click Player, Close stops iframe, JA/EN, no JS errors)။ Opaque origin အတွက် `localStorage` persistence နဲ့ actual navigation မစစ်နိုင်ခဲ့ပါ။
- Source Integrity: Existing Backend/Auth/Payment/YKCR/Exam/Migrations/Dictionary/Anime assets unchanged (see QA JSON)။
- Build preview: Public pages 25; `dist` generated in preview mode without the esbuild-generated login bundle, **NOT production-build verified**။
- Full `npm run build`: This Environment မှာ `esbuild` installed မရှိလို့ **blocked** (exit 127)။ Netlify Staging မှာ လိုအပ်တဲ့ dependencies အပြည့်ဖြင့် Build စစ်ရပါမယ်။
- Remote YouTube Streaming/Embedding/YouTube Thumbnail, Facebook external links, Live Netlify Auth/Database/Payment/YKCR/Exam: **မစစ်ရသေးပါ**။ YouTube Channel မှာ Allow embedding လုပ်ထားဖို့ လိုပါတယ်။ Embedded video မပွင့်လျှင် `Watch on YouTube` Link ကို သုံးနိုင်ပါတယ်။

## User Feedback နဲ့ အနာဂတ်

- Current Version က ၃ ခုသော Public/Free Sample Video ကိုသာ ပြပါတယ်။ Fake Paid Lock, Fake Video Progress/Resume, Full Course Count နဲ့ မရှိသေးတဲ့ Fees မပြထားပါ။
- Paid Course ထည့်ချင်ရင် Unlisted YouTube Link ကိုသုံးရုံနဲ့ Paywall လုံခြုံမှု မရပါ။ Secure video access management ထပ်လိုပါမယ်။
