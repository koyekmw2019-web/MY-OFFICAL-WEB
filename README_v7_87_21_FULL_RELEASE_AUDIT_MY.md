# YE KUN Official Website — v7.87.21
## Full Regression QA · Deploy Preview Readiness · Release Audit

**Status: RELEASE CANDIDATE — NOT VERIFIED PRODUCTION-STABLE**

Boss ကြီးရေ — ဒီ Version မှာ User-facing Feature အသစ်နဲ့ Database Migration အသစ် မထည့်ထားပါဘူး။
နောက်ဆုံး `YEKUN_v7.87.20_Mobile_Speed_PWA_Cache_UI_Fixes_CUMULATIVE.zip` ကို အခြေခံတဲ့ **CUMULATIVE SOURCE PATCH** ပါ။

### 1) တကယ်ပြီးသွားတဲ့ QA

- v7.87.3–v7.87.21 Selected Regression စုစုပေါင်း **41/41 PASS** — `QA_v7_87_21_SELECTED_REGRESSION_STAGED.json` ကိုကြည့်ပါ။
- v7.87.3/v7.87.4 ရဲ့ GitHub မူလ UI ဖိုင်အချို့ကို **Test-only Workspace မှာသာ** ဖြည့်ခဲ့ပါတယ်။ အဲဒီ Original Baseline ဖိုင်တွေကို Cumulative ZIP ထဲ ထပ်မထည့်ပါ။
- Local HTTP **Synthetic Preview 29 Routes PASS** (တကယ့် Website Build မဟုတ်)။
- Mobile **320px / 390px / 1280px Synthetic Browser Test PASS** (တကယ့် Production Network မဟုတ်)။
- Release မအောင်အောင် တားနိုင်တဲ့ Negative Tests: Missing JS/CSS, Stale Cache Query, Plan Price Tampering, Missing Exam Route, Public Private-Backend Leak, Missing Dist — **PASS**။
- **Original v7.87.20 ZIP ရဲ့ 199 File အားလုံး ထိန်းထားပါတယ်**။ မူရင်း Grammar JSON, Exam/Payment/YKCR/CRM Backend, Database Migration, Service Worker Byte-level unchanged။

### 2) မလုပ်ရသေးတာကို တိတိကျကျ ဖော်ပြချက်

- **Full `npm test` / `npm run build` = BLOCKED / NOT RUN**။ ဒီ ZIP က GitHub Repository အပြည့်မဟုတ်လို့ `index.html`, `src/identity-client.js`, original build scripts စတာတွေ မပါပါ။
- **Netlify Deploy Preview = NOT DEPLOYED / NOT LIVE TESTED**။ ဒီအဆင့်မှာ GitHub/Netlify ကို Update မလုပ်ပါ။ Build Credits မသုံးပါ။
- **Live Login / Student Verify / YKCR / Receipt Upload / Payment Approval = NOT TESTED**။ Real Bank Transfer မလုပ်ပါ။
- **Mobile Core Web Vitals (LCP/INP/CLS) = NOT MEASURED**။ Actual image conversion/compression = v7.87.20 ထဲမှာလည်း မလုပ်ထားပါ။
- JLPT Grammar 509 Patterns / 1,018 Examples Data Completion ကို စစ်ထားပေမဲ့ Human Editorial Review 100% ပြီးကြောင်း အာမမခံပါ။

### 3) v7.87.21 အသစ်ထည့်ထားတာ

- `scripts/audit-v78721-release.mjs` — Real `dist` ပြီးမှ 29 Critical Route, JS/CSS Asset, `?ykv=78720`, 12 Exam Pages, Plan Prices, Cache, Backend Source Leak, Grammar Counts, Required Migration တွေကို စစ်ပြီး fail-closed လုပ်မယ်။ Image Size >400KB တွေကို Warning ပြမယ် (မပြင်မချုံ့ပါ)။
- `scripts/smoke-v78721-preview.mjs` — Local Build (`dist`) ကို Local HTTP နဲ့ Test လုပ်မယ်။ `--base` ပေးရင် Netlify Preview URL ကို **read-only GET** နဲ့ စစ်မယ်။ Private API/Bank Account ကို မထိပါ။
- `scripts/run-v78721-full-qa.mjs` — Original Full Repository ထဲမှာ `npm test`, `npm run build`, `npm run verify:release` အစဉ်လိုက် Run မယ်။ Full Checkout Files မရှိရင် **BLOCKED** ထုတ်မယ်။
- `scripts/run-v78721-selected.mjs` — 41 Selected Regression Tests ကို ပြန် run နိုင်မယ်။ ဒါက `npm test` Full Suite ရဲ့ အစားထိုးမဟုတ်ပါ။
- `tests/v78721-source.mjs`, `tests/v78721-fixture.mjs`, `tests/v78721-release.mjs` — Source, Negative Gate, Release Tests။
- `package.json` — `verify:full`, `verify:selected`, `verify:audit`, `verify:preview` Scripts အသစ်။ ရှိပြီးသား Build အဆုံးမှာ Strict Audit/Local HTTP Smoke ကို Gate အဖြစ် ထည့်ထားတယ်။
- Original `service-worker.js` Cache Key က **yk-official-v7-87-20** အတိုင်းပဲ။ ဒီ QA-only Version မှာ Runtime JS/CSS ကို မပြောင်းထားတဲ့အတွက် Cache Key အပိုတစ်ခါ မတိုးပါ။

### 4) Weekly GitHub Upload / Netlify Preview ကို တကယ်လုပ်မယ့်နေ့

1. GitHub Desktop မှာ **Existing Repository `koyekmw2019-web/MY-OFFICAL-WEB`** ကို Fetch လုပ်ပြီး `main` Backup/Commit SHA သိမ်းပါ။ နောက်ဆုံးစစ်ချိန် `main` package version = **7.87.4**။ GitHub မှာ မမျှော်လင့်တဲ့ Changes ရှိရင် အရင် reconcile လုပ်ပါ။
2. `release/v7.87.21-preview` လို **သီးခြား Branch** တစ်ခု ဖန်တီးပါ။ `main` ကို ချက်ချင်းမပြောင်းပါနဲ့။
3. ZIP Extract လုပ်ပြီး **Full Repository Root အပေါ် Copy/Replace** လုပ်ပါ။ `.git` မဖျက်ပါနဲ့။ ZIP ကို Netlify မှာ တိုက်ရိုက် Deploy မလုပ်ပါနဲ့။
4. Full Checkout ထဲမှာ Node 22+ နဲ့ `npm ci` (lockfile လိုက်ဖက်တဲ့အခါ) ပြီး **`npm run verify:full`** ကို Run ပါ။ ဒါက Full Test → Full Build → Release Audit/Local HTTP Smoke ဖြစ်ပါတယ်။
5. Full Tests PASS ဖြစ်ပြီးမှ Preview Branch/PR ကို GitHub မှာ Push/ဖန်တီးပါ။ Netlify Site ရဲ့ Deploy Preview Setting က အဲဒီ Branch/PR ကို Preview ပေးနိုင်သလား စစ်ပါ။ (အလိုအလျောက် Preview ရှိကြောင်း မယူဆပါနဲ့။)
6. Preview URL ရပြီဆိုရင် **`npm run verify:preview -- --base https://<actual-preview-url>`** ကို Run ပါ။ Netlify non-production SSO ကာထားရင် Logged-in Browser နဲ့ လက်တွေ့စစ်ပါ။
7. Test-only Account / Test-only Student & Data သုံးပြီး Login → Verify → Exam Free Attempt / Resume → Payment Request → Admin Approval → Expiration စမ်းပါ။ **Preview က Production Database ကို ချိတ်ထားရင် Write Test မလုပ်ပါနဲ့**။ သီးခြား Test Database ပေါ်မှာသာ စမ်းပါ။
8. `/.netlify/functions/yk-system-health` ကို **Admin Account ဖြင့်သာ** GET စစ်ပါ။ `v7.87.7` Growth နဲ့ `v7.87.8` Enrollment CRM Migration အောင်မြင်ကြောင်း စစ်ပါ။
9. 320px/390px Android / iPhone Real Device မှာ PWA, Online/Offline, Myanmar–English–Japanese, Payment Modal, 12 Exam Pages, Grammar/Calendar, Dashboard Roles စစ်ပါ။ Exam ဖြေနေချိန် Site Data Clear/Auto Reload မလုပ်ပါနဲ့။
10. Preview & Core Flows PASS ပြီး၊ Rollback Commit/Deploy သိမ်းပြီးမှ Production Merge စဉ်းစားပါ။ **Database Migration ကို မစစ်ဘဲ Auto Rollback မလုပ်ပါနဲ့။**

### 5) Release Gate & Decision

- **Local Selected Regression: PASS (41/41)**
- **Local Synthetic HTTP Preview: PASS (29 routes)**
- **Original Full Repository Tests: BLOCKED / NOT RUN**
- **Actual Netlify Deploy Preview: NOT DEPLOYED / NOT RUN**
- **Live Authentication/Payments/YKCR: NOT RUN**
- **Production Promotion: NOT APPROVED YET**

ဒီ Release ZIP မှာ အရင် v7.87.5–v7.87.20 Update တွေပါပြီး GitHub/Netlify/Database ကို ကိုယ်တိုင် မပြောင်းထားပါ။
