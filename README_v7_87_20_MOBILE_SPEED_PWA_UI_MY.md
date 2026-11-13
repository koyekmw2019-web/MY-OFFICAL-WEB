# YE KUN Official Website — v7.87.20
## Mobile Speed · PWA Cache · Final UI Bug Fix — Weekly Cumulative Patch

**Base:** နောက်ဆုံး Assistant ထုတ်ပေးထားတဲ့ `YEKUN_v7.87.19_Critical_System_Stability_CUMULATIVE.zip` (186 files)။
**Target:** `koyekmw2019-web/MY-OFFICAL-WEB` Existing Repository (`main` ကို နောက်ဆုံးအတည်ပြုစဉ် v7.87.4)။
**IMPORTANT:** ဒါက v7.87.5–v7.87.20 အထိ ပြင်ဆင်ချက်တွေပါတဲ့ **Source Patch** သာဖြစ်ပြီး Website Repository အပြည့်၊ Netlify Deploy၊ Production Stable Certificate **မဟုတ်ပါ**။ GitHub နဲ့ Netlify ကို မပြောင်းထားပါ။

### v7.87.20 မှာ ပြင်ထားတာတွေ

1. **PWA Cache Version:** `service-worker.js` က `yk-official-v7-87-20` ကို သုံးမယ်။ Cache အဟောင်းတွေ ဖယ်ရှားပေးမယ်။ Login၊ Payment၊ Admin API၊ Student-private responses၊ HTML Navigation တွေကို Public Cache မှာ မသိမ်းပါ။ `private` / `no-store` / `no-cache` / `Set-Cookie` / HTML fallback အမှား/အရွယ်ကြီး asset တွေကို cache မသိမ်းပါ။
2. **First-load Freshness:** Build ပြီးတဲ့ `dist/*.html` ထဲရှိ Same-origin JavaScript/CSS Link တွေမှာ `ykv=78720` သီးခြား Version ထည့်မယ်။ ဖုန်းမှာ PWA Cache အဟောင်းရှိနေလည်း HTML အသစ်က **JS/CSS အဟောင်း URL** ကို မခေါ်စေဖို့ ရည်ရွယ်ပါတယ်။ Source HTML ကို မပြောင်းပါ။ Existing Query String တန်ဖိုးကို ထိန်းပြီး `ykv` သာ ထပ်ထည့်ပါတယ်။
3. **Static Cache Speed:** Version ပါတဲ့ Public JS/CSS ကို Cache-first ပြမယ်။ Version မပါတဲ့ Public JS/CSS/Level Grammar JSON ကို Cached Content အရင်ပြပြီး၊ Background မှာ တစ်ကြိမ် Refresh စစ်နိုင်မယ်။ **Exam ဖြေနေစဉ် Page Auto Reload မလုပ်ပါ**။ Offline ဖြစ်တဲ့အခါ Cache ရှိပြီးသား static file ကို အသုံးပြုနိုင်တယ်။
4. **Homepage Remote Images:** YouTube Profile/Gallery တွေရဲ့ `yt3.ggpht.com`, `i.ytimg.com` ပုံတွေမှာ မူလ `loading` မရှိရင် `loading="lazy"` နဲ့ `decoding="async"` ထည့်မယ်။ အောက်ပိုင်းပုံတွေကို ချက်ချင်းတင်တာ လျှော့ဖို့ပါ။ **Actual Image Compression / WebP Re-encoding မလုပ်ထားပါ**။
5. **Exam Plans UI:** 12 Dedicated Exam Page + Exam Directory အားလုံးမှာ Plan Card ကို **Touch/Click**, Keyboard **Enter/Space** နဲ့ ရွေးလို့ရအောင် ပြင်ထားတယ်။ Plan Card Text, Price, Checkout Function, Bank Transfer Backend မပြောင်းပါ။
6. **Small Mobile Layout:** 320/390px ဖုန်းမှာ Exam Plans Modal Scroll၊ Safe-area၊ Long Myanmar Text wrapping၊ Close Button 44px Touch Target၊ Focus Outline တို့ကို CSS အနည်းငယ် ထည့်ထားတယ်။
7. **Build & Release Safety:** Local JS/CSS URL များ `?ykv=78720` ပါ/မပါ၊ File Missing၊ Plan Price tampering၊ Private Source က Public ထဲမဝင်ကြောင်း Post-build Check တွေကို ထည့်ထားတယ်။ မူလ SW Version အဟောင်းကိုမျှော်လင့်ထားတဲ့ 7.80/7.84/7.86 Test တွေကို သီးသန့် Signature-checked Compatibility Test Step နဲ့ အပ်ဒိတ်လုပ်ပြီး **Test အလုပ်လုပ်နေဆဲ** ဖြစ်စေတယ်။

### ဘာတွေကို မထိထားလဲ

- Exam 12 မျိုး၊ Free Attempt **Exam Type တစ်မျိုးစီအတွက် ၁ ကြိမ်**၊ Timer၊ Auto Save/Resume၊ Score Engine
- Plan Prices: 1 Week ¥1,000 · 1 Month ¥2,000 · 3 Months ¥3,000 · 1 Year ¥5,000
- Login/Identity Backend၊ Bank Transfer/Payment/Approval၊ YKCR Sync၊ Database Migration၊ Admin CRM၊ Marketing Analytics၊ Grammar 509 ခု / 例文 1,018 ခု
- မူရင်း Backend/SQL Source တွေကို Byte-for-byte မပြောင်းထားပါ။ New Library/Package Dependency၊ PDF File၊ Student Database အသစ်လည်း မပါပါ။

### Installation — Weekly GitHub Upload လုပ်မယ့်နေ့မှသာ

1. GitHub Desktop ရဲ့ Existing Repository ကို Fetch လုပ်ပြီး **Backup Branch/Commit** ထားပါ။ `main` မှာ မမျှော်လင့်တဲ့ Update ရှိ/မရှိ စစ်ပါ။
2. ZIP ကို သီးခြား Extract လုပ်ပါ။ Extract ထဲက Folder Structure ကို Repository Root နဲ့ တူအောင် **Copy/Replace** လုပ်ပါ။ **`.git` ကို မဖျက်ပါနဲ့။ ZIP ကို Netlify မှာ တိုက်ရိုက် Deploy မလုပ်ပါနဲ့။**
3. Existing Full Repository ထဲမှာ Node 22+ ဖြင့် `npm ci` (lockfile coherent ဖြစ်မှ), `npm test`, `npm run build`, `npm run verify:release` ကို Run ပါ။ Browser-specific Manual Test က Local Playwright/Chromium ရှိရင် `npm run verify:mobile:browser` (Netlify Build မှာ မလိုပါ)။
4. **Netlify Deploy Preview** မှာ Android Chrome + Installed PWA ကို အသုံးပြုပြီး Home → Exam Directory → 12 Exam Pages → View Plans → Plan Selection → Login/Payment (Test Account) → Student Verify/YKCR (Test Data) စမ်းပါ။ Admin Account မှ `/.netlify/functions/yk-system-health` ကို GET ဖြင့် Schema/Config Bool စစ်ပါ။
5. **Language** မြန်မာ → English → 日本語 → မြန်မာပြန်၊ 320/390px Mobile Plan Popup Scroll၊ Button Click၊ Keyboard Enter/Space၊ Offline/Online ပြန်ဖွင့်ခြင်း စမ်းပါ။ Exam ဖြေနေချိန် Site Data Clear/Reload မလုပ်ပါနဲ့။
6. v7.87.7 Growth နဲ့ v7.87.8 CRM Migration တွေက Cumulative Patch ထဲမှာ ပါပြီး မူလတစ်ခါ Deploy/Apply ပြီး/မပြီးကို စစ်ပါ။ **v7.87.20 က Migration အသစ်မထည့်ပါ**။
7. Preview နဲ့ Real-device QA အောင်ပြီးမှ Production ကို Merge/Deploy လုပ်ပါ။ Failure ဖြစ်ရင် ယခင် Stable Commit/Netlify Deploy ကို ပြန်သွားနိုင်အောင် Commit ID သိမ်းထားပါ။ SQL Migration ကို အလိုအလျောက် Rollback မလုပ်ပါနဲ့။

### PWA Mobile အတွက် သတိပြုရန်

- PWA Update ဟောင်းက Cache ထဲရှိနေသေးရင် Browser/PWA ကို **စာမေးပွဲမဖြေနေတဲ့အချိန်မှာသာ** ပိတ်ပြီး ပြန်ဖွင့်ပါ။ Data မပျောက်အောင် **Clear Site Data / Clear Storage မလုပ်ပါနဲ့**။ Student Grammar/Calendar Progress အချို့က Browser Local Storage ထဲမှာ ရှိပါတယ်။
- `?ykv=78720` က Release ရဲ့ Cache Version ကို ပြောင်းတာဖြစ်လို့ **ပထမအကြိမ် Page ဖွင့်ရာမှာ JS/CSS အသစ် Download လုပ်ဖို့လို** ပါမယ်။ အဲဒါကြောင့် First Load က ပိုမြန်ကြောင်း မဆိုနိုင်သေးပါ။ နောက်တစ်ကြိမ် Cache သုံးတာနဲ့ Script Freshness ကို ဦးစားပေးထားပါတယ်။
- Actual Device LCP/INP/CLS၊ Compressed Transfer Bytes၊ Real Network Timing မတိုင်းရသေးပါ။

### တကယ်စမ်းပြီးတဲ့ QA Scope

- v7.87.19 ZIP 186 Files အားလုံး Preservation: **PASS** (158 original file bytes unchanged; 28 touched primarily build/cache/version-test compatibility).
- Selected Regression Tests: **37/39 PASS** on cumulative patch alone; 2 missing original v7.87.3/v7.87.4 files expected in Existing Repository. Those original UI files were staged only into a **test-only folder**, then **39/39 PASS**. Test-only files are not included in final ZIP.
- v7.87.20 Browser/UI: Android-size 320/390px + Desktop 1280px, Modal Overflow, Plan Keyboard/Click, Language Control: **PASS** (synthetic local Chromium fixture).
- v7.87.20 SW Behavior: Cache Version, Private Endpoint bypass, Cache-Control/MIME/Max size, Offline fallback, stale JS/CSS Refresh: **PASS** with Mock Browser CacheStorage.
- Negative release tests: intentionally stale JS version, tampered Plan Price, public private-backend leak -> correctly blocked **PASS**.
- Old Test Compatibility Guard: exact three legacy SW assertions updated once/idempotent, not disabled **PASS**.
- **NOT DONE**: Full Original GitHub checkout `npm test` / `npm run build`; Live Netlify Deploy Preview; Real Student Account, Bank Transfer, YKCR End-to-End; Real-phone Core Web Vitals.

**Release Status: LOCAL QA PASS / PRODUCTION STABLE NOT CONFIRMED.**
