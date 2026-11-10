# YE KUN Official Website v7.84.1 — Safe File Audit & Lightweight Deployment

**Base:** `YEKUN_v7.84_Admin_Student_Dashboard_Pro_Update.zip` (v7.84.0)
**Brand:** YE KUN Official Website; Education pages: STUDYING WITH YE KUN.

## ဘာတွေ Update လုပ်ထားလဲ

1. **Safe `dist/` publish:** Netlify က ယခင် `publish = "."` အစား `publish = "dist"` သုံးပါတယ်။
   - `npm run build` အတွင်း `esbuild` က `assets/identity.bundle.js` ကို Generate လုပ်ပြီး၊ အဟောင်း Tests တွေ အောင်မြင်ပြီးမှ `scripts/build-public-v7841.mjs` က Public Files ကို `dist/` ထဲ Copy လုပ်ပါတယ်။
   - Public HTML pages 24 ခု၊ သက်ဆိုင်ရာ CSS/JS/Image/JSON၊ PWA Icon၊ Sitemap/robots/manifest/service worker တွေပါမယ်။
   - `netlify/functions` က ယခင်အတိုင်း Netlify Functions directory ဖြစ်နေပါတယ်။ Database migrations ကို မပြောင်းထားပါ။
   - Translation QA CSV၊ Source Dictionary Archive၊ README/QA Reports၊ Server-side answer keys၊ `tests/`, `scripts/` တွေကို Web Public Folder မှာ မတင်တော့ပါဘူး။ Source ZIP ထဲမှာတော့ QA/rollback အတွက် ဆက်ထိန်းထားပါတယ်။
2. **Version Archive Assets:** လက်ရှိ Website က မသုံးတဲ့ အဟောင်း Asset 23 ခုကို Source မှာ မဖျက်ဘဲ Public Build ထဲကသာ ဖယ်ထားပါတယ်။ သုံးနေတဲ့ Version/Character Assets အားလုံး ထိန်းထားပါတယ်။
3. **Lossless Dictionary Packing:** Browser က Load လုပ်တဲ့ 8,542-entry `YK_DICTIONARY_V778` Data ကို Deploy အချိန်မှာ ပိုကျစ်လျစ်တဲ့ JavaScript Format ပြောင်းပြီး `dist/assets/yk-dictionary-v778-complete-draft.js` အဖြစ် ထုတ်ပါတယ်။ `jp/reading/mm/en/quality/levels/sources/source_names` နှင့် Example/QA/Review Metadata အားလုံး တိတိကျကျ ပြန်တည်ဆောက်ထားတာပါ။ မူလ Source Asset ကို မပြောင်းပါ။
4. **Cache Refresh:** Service worker cache version အသစ်နဲ့ ထုတ်ပြီး Deploy HTML မှာသာ Dictionary JS ရဲ့ version query ကို `?v=7841packed` ပြောင်းထားပါတယ်။ User Storage/Exam Data/Payment Data ကို SW မသိမ်းပါ။
5. **Existing Rules Retained:** Login, 1-free-exam, students' unlimited access by validity, Bank Transfer, Receipt Approval, YKCR sync, Dictionary Reports, Admin/Student dashboards, JLPT/Furigana, Anime Characters, SEO Title မပြောင်းပါ။

## Actual Measurements (Build Preview)

| Metric | v7.84 | v7.84.1 |
|---|---:|---:|
| Publish directory — uncompressed files | ~40.0 MB (`.` entire source tree) | 6.29 MB (`dist` preview, identity.bundle not yet generated) |
| Dictionary source JavaScript | 2,717,230 bytes | 960,760 bytes |
| Dictionary gzip (level 9, local estimate) | 317,009 bytes | 273,411 bytes |
| Browser Dictionary Entries | 8,542 | 8,542 (all objects identical) |
| Source archive data | All retained | All retained |

**အရေးကြီး:** ZIP Source File size သိသိသာသာ လျော့ဖို့ မဟုတ်ပါဘူး။ Live Netlify Publish Folder နဲ့ Browser Dictionary Script ကိုပဲ ပေါ့အောင်လုပ်တာပါ။ gzip comparison က Local Compression Estimate ဖြစ်ပြီး Live transfer timing မဟုတ်ပါ။

## QA

- Original automated regression tests (`npm test`): **PASS**.
- Added `tests/v7841-performance-safety.mjs`: **5 PASS**.
- 8,542 Dictionary objects fully compared with untouched source (including optional properties): **PASS**.
- Public Pages 24 / HTML local references 448: **0 missing**, except `identity.bundle.js` generated only by esbuild during full build.
- Offline Chromium `page.set_content` smoke at 1280px/390px: Dictionary Search, correct Burmese meaning, Examples/Furigana, no horizontal overflow. Not a live hosted navigation test. Opaque-origin localStorage access is denied in this test fixture.
- Old Netlify Functions, Database migrations, Payment/YKCR/exam/auth backend untouched: byte-for-byte compared with v7.84 source.
- Original Character Assets and Logo unchanged.
- ZIP integrity: check ZIP after packaging with testzip.

## Production Release Checklist — Must Check on Netlify Staging

1. GitHub Desktop မှာ Existing Repository ထဲ `v7.84.1` Source ကို update/push ပါ။ New Repository မလိုပါ။
2. Netlify Build: `npm run build` (Node >=22 <25), Publish `dist` (netlify.toml), Functions `netlify/functions`။ `esbuild` က Dependencies install ပြီးမှ အလုပ်လုပ်ပါမယ်။ `npm test` လည်း PASS ဖြစ်ရပါမယ်။
3. Verify HTML, Dictionary, JLPT/SSW Mock Exams, Admin/Student/Member Dashboard, Anime Characters on Desktop & Mobile.
4. Netlify Identity Login/Logout/Invite/Recovery, YKCR Sync, Bank Transfer/Receipt/Admin Approval, one-free-exam rule, Student Unlimited Validity, Dictionary Error Report/Admin Approval ကို Staging မှာ တကယ်စမ်းပါ။
5. Browser DevTools Network မှာ `/assets/yk-dictionary-v778-complete-draft.js?v=7841packed` (compressed transport) နဲ့ `/assets/identity.bundle.js` HTTP 200 ဖြစ်တာကို စစ်ပါ။
6. Sitemap / Search Console Live URL Check / PWA Service Worker update ကို စစ်ပါ။

**Known limitation:** Local environment မှာ `esbuild` dependency မရှိလို့ Full Netlify Build **NOT verified**. Official Netlify staging deploy/live DB/auth/payment/YKCR tests **NOT performed**. Build Fail ဖြစ်ရင် Production ကို မပြောင်းပါနှင့်။

**Backout:** `v7.84.0` ZIP Source ကို ပြန်သုံးပါ။ DB migration အသစ် မလိုပါ။
