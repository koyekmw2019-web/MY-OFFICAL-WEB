# YE KUN Official Website — v7.88.0-rc.1
## Stable Release Gate Preparation · NO-GO until every check passes

**Status: RELEASE CANDIDATE ONLY — NOT v7.88.0 PRODUCTION STABLE.**

Boss ကြီးရေ ❤️ v7.88.0 ကို Stable လို့ ကြေညာမယ့်အခါ `npm test`, `npm run build`, တကယ့် Netlify Deploy Preview, Login/Student Verify/Payment/YKCR End-to-End, Android/iOS/PWA, Rollback အားလုံး အောင်ရပါမယ်။ ဒါကြောင့် ဒီ Package မှာ `7.88.0-rc.1` လို့ပဲ Version သတ်မှတ်ထားပါတယ်။

## Repository အခြေအနေ (2026-11-13)
- Existing GitHub `koyekmw2019-web/MY-OFFICAL-WEB` **main v7.87.4**, latest verified branch commit `1d5c21cdb234add7ca33c4fd456ea6cd81d0a89a`.
- v7.87.21 cumulative Patch ZIP 211 source/report files; **Full GitHub Checkout မဟုတ်**။
- GitHub main root မှာ `package-lock.json` မရှိသေးပါ။ `npm ci` ကို တိုက်ရိုက် Run လုပ်လို့ မရပါ။ `npm install --package-lock-only` ဖြင့် Lockfile ကို အရင်ထုတ်၊ Review/Commit လုပ်ပြီးမှ `npm ci` Run ပါ။ ပထမ Lockfile ထုတ်တာက Network Package Metadata လိုပါတယ်။
- ဤ Workspace မှာ GitHub source archive ကို ကူးယူဖို့ Network Access မရခဲ့ပါ။ **Full npm test, Full Build, Actual Netlify Preview, Real Login/Payment/YKCR, Android/iOS Core Web Vitals = NOT TESTED**။
- Cumulative ZIP ကို Netlify မှာ တိုက်ရိုက် Deploy မလုပ်ပါနဲ့။ `main` ကို မပြောင်းခင် အရင် QA Branch ထဲမှာ Merge ပါ။

## v7.88.0-rc.1 ထည့်ထားတာ
- `scripts/v7880-readiness.mjs`: Full Checkout Prerequisite Check; Missing Files/Lockfile ကို BLOCK.
- `scripts/evaluate-v7880-stable.mjs`: Full QA Report, Generated Dist Audit, Remote Deploy Preview Smoke, isolated E2E, Real Android/iOS Device, Rollback & Reviewer Evidence အားလုံး မပြည့်လျှင် `NO_GO` ထုတ်မယ်။
- `tests/v7880-gate.mjs`: Synthetic Preview၊ လွဲမှားတဲ့ Evidence Flag နဲ့ Incomplete Checkout တွေကို Stable အဖြစ် သတ်မှတ်လို့ မရကြောင်း Negative Tests.
- `tests/v7880-source.mjs`: RC/price/cache policy ကို စစ်ပြီး ယခင် Security Controls မပျောက်ကြောင်း စစ်.
- `QA_v7_88_0_MANUAL_EVIDENCE_TEMPLATE.json`: Manual E2E/Real Device/Rollback Test Record Blank Template — **မစစ်ရသေးတဲ့ Field အားလုံး false**။
- `npm run verify:stable:gate` / `npm run verify:stable` (fail-closed; Live evidence မရှိလျှင် Exit Code 2).

## Weekly GitHub Upload လုပ်မယ့်နေ့
1. GitHub Desktop → Existing Repo → Fetch → **Backup** → QA Branch အသစ် `release/v7.88.0-rc1` ဖန်တီးပါ။ `main` ကို မထိပါနဲ့။
2. ဒီ Cumulative ZIP ကို GitHub Repo Root ထဲ **Merge/Overwrite** လုပ်ပါ။ `.git` နဲ့ အရင် Base Source ကို မဖျက်ပါနဲ့။
3. `node scripts/v7880-readiness.mjs` ကို Run ပါ။ `package-lock.json` မရှိကြောင်းပြရင် `npm install --package-lock-only` (နောက်ဆုံး dependency versions/lock contents စစ်) → `npm ci` ပြီးမှ ဆက်လုပ်ပါ။
4. `npm run verify:full` (Full Test + Full Build + Dist Audit + Local HTTP Smoke)။ Result ကို **QA_v7_88_0_FULL_REPO.json** အမည်နဲ့ သိမ်းပါ (အောက်က command လို Run ပါ)။
5. `node scripts/audit-v78721-release.mjs --report QA_v7_88_0_RELEASE_AUDIT.json` — Actual Built `dist` ဖြစ်မှ PASS ဖြစ်ရမယ်။ Synthetic Fixture မဟုတ်ရပါ။
6. Full Pass ပြီးမှ သီးခြား QA Branch/PR ကနေ **Netlify Deploy Preview** Create ပါ။ Production `main` မပြောင်းပါနဲ့။ Live Preview URL ရမှ `node scripts/smoke-v78721-preview.mjs --base https://deploy-preview-N--YOUR-SITE.netlify.app --report QA_v7_88_0_PREVIEW.json`။ (ဒီ Script က Read-only GET ပါ။)
7. Preview က **Production Database ကို ချိတ်ထားရင် Payment/Student/Exam Write Test မလုပ်ပါနဲ့။** Isolated Preview Database နဲ့ Test-only Accounts/Receipts အသုံးပြုပြီး Login/Logout → Student Verify/YKCR → Free Attempt per Type → Resume/Submit/Score → Receipt → Admin Approve/Reject → Paid Expiry & Role Permission စမ်းပါ။
8. Android/iPhone Real Device မှာ Mobile 320/390/1280px Layout၊ Myanmar/English/Japanese၊ PWA Cache Update၊ Offline၊ LCP/INP/CLS စစ်ပါ။ Auto Reload ပြီး Exam Answers မပျက်ရပါ။
9. `QA_v7_88_0_MANUAL_EVIDENCE_TEMPLATE.json` ကို ကူးပြီး `QA_v7_88_0_MANUAL_EVIDENCE.json` အမည်နဲ့ **စစ်ပြီးတဲ့အချက်များသာ** မှန်ကြောင်း ဖြည့်ပါ။ `sourceCommit` နဲ့ `previewSourceCommit` က တကယ် Test လုပ်ခဲ့တဲ့ **အတူတူ Git Commit SHA** ဖြစ်ရပါမယ်။ Real Device၊ Rollback Previous Commit/Deploy ID နဲ့ Human Reviewer ရှိရပါမယ်။
10. `node scripts/evaluate-v7880-stable.mjs --report QA_v7_88_0_RELEASE_DECISION.json` သို့မဟုတ် `npm run verify:stable:gate` Run ပါ။ **NO_GO ဖြစ်ရင် Stable မထုတ်ပါနဲ့**။ အားလုံး PASS လျှင် `GO_ELIGIBLE_FOR_FINAL_HUMAN_APPROVAL` — ဒါက Production Auto-Deploy Permission မဟုတ်ပါ။ Manual Approval/Controlled Merge/Rollback Decision သီးခြား လိုပါတယ်။

### Copy/Paste Commands (Full Checkout & Lockfile ပြီးမှ)
```
node scripts/v7880-readiness.mjs
npm ci
node scripts/run-v78721-full-qa.mjs --report QA_v7_88_0_FULL_REPO.json
node scripts/audit-v78721-release.mjs --report QA_v7_88_0_RELEASE_AUDIT.json
# Preview URL ရပြီးမှ, actual URL ဖြင့် အစားထိုးပါ
node scripts/smoke-v78721-preview.mjs --base https://deploy-preview-N--YOUR-SITE.netlify.app --report QA_v7_88_0_PREVIEW.json
# Test-only E2E & Real Device & Rollback Evidence အမှန်တကယ် ပြီးမှ
npm run verify:stable:gate
```

## ဒါတွေကို လုံးဝ မလုပ်ထားပါ
- GitHub Push/PR/Production Merge၊ Netlify Deploy/Build Credits အသုံးပြုခြင်း၊ Production Database Change၊ Bank Transfer/Receipt Upload မလုပ်ထားပါ။
- အရင် Exam Attempt Per-Type စည်းကမ်း၊ Plan Prices ¥1,000/¥2,000/¥3,000/¥5,000၊ YKCR Sync, PWA Cache Runtime, Grammar 509 / 例文 1,018 JSON မပြောင်းပါ။

## Release Decision
**v7.88.0 Stable: BLOCKED** — Full Repository Build, Live Deploy Preview, Test-only Auth/Payment/YKCR, Real Device QA and Rollback Verification မပြီးသေး။

Boss ကြီးရေ — Stable ဆိုတဲ့နာမည်ကို Test အားလုံးအောင်မှပဲ သုံးမယ်။
