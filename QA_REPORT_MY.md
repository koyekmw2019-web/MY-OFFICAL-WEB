# YE KUN Official Website — PR #4 QA နှင့် Stability Repair

**ဆုံးဖြတ်ချက်: NO_GO / Stable မဟုတ်သေးပါ။ Local automated gates PASS ဖြစ်ပြီး remote update / preview / live E2E က BLOCKED ဖြစ်နေသည်။**

## စစ်ဆေးခဲ့သော source နှင့် environment

- Repository: `koyekmw2019-web/MY-OFFICAL-WEB`
- PR: https://github.com/koyekmw2019-web/MY-OFFICAL-WEB/pull/4 — open, unmerged
- QA branch: `release/v7.88.1-rc1-qa`
- Inspected remote head: `082290577842ad98996c3156c65734e741adeaaf`
- Production/main baseline: `1d5c21cdb234add7ca33c4fd456ea6cd81d0a89a` (v7.87.4)
- Tested LOCAL repair commit: `95df2ae15a3bfa8de82721d7cc13100822cee7e5`
- Candidate package version: `7.88.1-rc.1` — unchanged
- Node: 24.22.1; complete Git checkout, not a cumulative ZIP fixture.
- Full QA completed at `2026-11-13T15:00:20.359Z` (2026-11-14 00:00 JST).
- Remote branch ကို မပြောင်းနိုင်ခဲ့ပါ။ Git CLI တွင် write credentials မရှိသလို GitHub connector ၏ create-tree operation သည် HTTP 403 `Resource not accessible by integration` ပြန်လာသည်။ Local commits ကို GitHub တွင် ရှိနေပြီဟု မယူဆရပါ။

## PASS / FAIL / BLOCKED

| စစ်ဆေးမှု | ရလဒ် | အထောက်အထား / အကန့်အသတ် |
|---|---|---|
| GitHub repository / PR inspection | PASS | 255 changed files; original PR 2 commits; expected branch/base |
| Production baseline | PASS | Published deploy `6af487c28b2e2361db76f8ee`, ready, baseline commit matches |
| Original Netlify Preview | FAIL | Deploy `6af710c67df854879beeda08`, build exit 2, unpublished |
| Original source build/test reproduction | FAIL → repaired locally | Both stopped at ESM `export` parsed as classic script |
| Clean dependency install | PASS | `npm ci --no-audit --no-fund`; new exact lockfile; 71 packages |
| Full `npm test` | PASS | Exit 0; 19.5 s; 92 chained commands including prep scripts (not 92 individual assertions) |
| Full `npm run build` | PASS | Exit 0; 13.9 s; 79 chained commands; real generated `dist` |
| `npm run verify:release` | PASS | Exit 0; 4.5 s; 12 command gates, including final-output negative tests |
| Generated output audit | PASS | 149/149 checks; 44 HTML pages; 588 local JS/CSS references; no missing/stale refs |
| Local HTTP smoke | PASS | 11/11 static route checks; does not execute hosted Functions |
| Backend function syntax/bundle | PASS | All 29 top-level MTS functions bundled by esbuild with external packages; not a Netlify packaging/runtime test |
| Auth / payment / student / status mocks | PASS | 18 v78719 behavior tests, plus existing exam/CRM suites |
| New nishu API mocks | PASS | Actual history/review handlers; auth, method, invalid ID, unfinished result, owner SQL, private no-store |
| Nishu score / output | PASS | 90 written + 5 visual, 100 points, pass 90, 50 minutes, server key private, 12 inherited routes retained |
| Migration execution | PASS — LOCAL ONLY | All 16 SQL files on disposable PGlite embedded PostgreSQL; 13 exam types accepted; invalid type/free duplicate rejected |
| Migration replay preservation | PASS — LOCAL ONLY | Three new migration files replayed; existing 13 sentinel attempt rows identical |
| Patch application | PASS | `git apply --check` on separate untouched checkout of original PR head |
| Mobile browser QA | BLOCKED | Optional Chromium test could not launch: socket operation not permitted / SIGABRT |
| Actual Android/iOS/PWA | BLOCKED | No real-device evidence |
| GitHub QA branch upload | BLOCKED | Write permission 403; no remote commit created or branch moved |
| Repaired Netlify Preview | BLOCKED | No upload means no new automatic preview; original preview URL returned HTTP 404 |
| Netlify test DB isolation / migration | BLOCKED | No verified isolated DB branch; no hosted SQL migration attempted |
| Live Login/Payment/YKCR E2E | BLOCKED | Production-linked services must not be exercised without isolated environment |
| Stable release gate | NO_GO | 5/11 passed; 6 remaining blockers, detailed below |

`npm test` の既存ログには “mobile browser” という文言がありますが、browser opt-in は通常無効です。ဒီ report မှာ အဲဒီစာသားကို browser PASS အထောက်အထားအဖြစ် မသုံးထားပါ။ Optional browser test ကို သီးသန့် run ပြီး environment restriction ကို မှတ်တမ်းတင်ထားပါသည်။

## ရှာတွေ့ခဲ့သော failure နှင့် ပြင်ဆင်မှု

1. **ES module parser mismatch.** `tests/v774-release-smoke.mjs` က `yk-v78714-engine.js` စသည့် ES modules ကို `vm.Script` ဖြင့်စစ်နေသည်။ `export` မှာ syntax error တက်သည်။ Modules ကို Node syntax-only check ဖြင့်စစ်ပြီး classic scripts ကို classic parser ဖြင့် ဆက်စစ်ထားသည်။ Browser code ကို execution မလုပ်ပါ။
2. **Patch helper spacing mismatch.** ရှိပြီးသား `patch-v7881-v774-esm-check.mjs` က whitespace anchor မကိုက်၍ refuse ဖြစ်သည်။ Original source spacing နှင့် ပြင်ပြီးသား checker ကို recognize လုပ်နိုင်အောင် ပြင်ထားသည်။
3. **Stale release/SW checks.** Historical version lists ကို exact RC1 version ပါဝင်အောင် update လုပ်ထားသည်။ လက်ရှိ worker epoch `yk-official-v7-87-20` ကို စစ်သည်။ `response?.ok` spelling နှင့် bounded-image fixture ကို လက်ရှိ behavior အတိုင်း စစ်သည်။ Private-route bypass, cache size, MIME, auth/cookie bypass, stale asset rejection checks မဖယ်ထားပါ။
4. **Existing homepage budget incorrectly excluded RC1.** Menu budget 8,000 bytes ကို stable historical versions အတွက်သာ အသုံးပြုနေသည်။ RC1 တွင်လည်း အတူတူ budget ကို အသုံးပြုသည်။ Size limit မတိုးထားပါ။ UI source မပြောင်းပါ။
5. **Backend old fingerprints.** v7.70 hashes ကို အားလုံးအသစ်ပြန်ရေးခြင်း မလုပ်ပါ။ Review လုပ်ထားသော file 9 ခုအတွက် exact SHA-256 + reason ကို `tests/backend-reviewed-v7881.json` တွင် ထည့်ထားသည်။ ကျန် protected files/migrations က အဟောင်း hash ဆက်လိုအပ်သည်။ `exam-attempt-submit` ၏ optional coach evidence ကိုသာ normalize ပြီး legacy hash ဆက်စစ်သည်။ မည်သည့် future backend edit မဆို fingerprint review လိုအပ်နေဆဲဖြစ်သည်။
6. **12 versus 13 exam checks.** Nishu timer/score entries ကို explicit စစ်သည်။ Reviewed additive nishu lines သုံးခုကိုသာ normalization လုပ်ပြီး အရင် 12 exam timer/scoring fingerprints ကို ဆက်စစ်သည်။ Free quota policy ကို မပြောင်းပါ။
7. **CRM build-chain incompatibility.** v7.87.12 build step က admin script query `v=78712` သို့ refresh လုပ်ထားသော်လည်း v7.87.17 က `v=7877/7878` ပဲမျှော်လင့်နေသည်။ Real script tag ၏ pathname နှင့် ခွင့်ပြုထားသော query versions နှစ်မျိုးကို စစ်အောင်ပြင်သည်။ Missing script/duplicate/role isolation checks ဆက်ရှိသည်။
8. **Final checkout accessibility vs stale test.** v7.87.20 က click နှင့် Enter/Space handler ထည့်ပြီးနောက် release test က အဟောင်း one-line handler ပဲမျှော်လင့်နေသည်။ Legacy/final binding နှစ်မျိုးကို actual function execution ဖြင့်စစ်ပြီး plan လေးမျိုး၏ click, Enter, Space ရွေးချယ်မှုနှင့် Escape no-op ကို စစ်ထားသည်။ Checkout production UI မပြောင်းပါ။
9. **Nishu final asset epoch.** Final page က `ykv=7881` သုံးသော်လည်း အဟောင်း final audit က `78720` ပဲလက်ခံသည်။ Nishu page ၏ exact JS/CSS URLs သုံးခုအတွက်သာ `7881` ကိုခွင့်ပြုထားသည်။ အခြား assets အားလုံးအတွက် `78720` ဆက်လိုအပ်သည်။ Stale nishu epoch ကိုပြောင်းလဲပြီး audit FAIL ဖြစ်ကြောင်း negative test ထည့်ထားသည်။
10. **No dependency lockfile.** `package-lock.json` ကို generate လုပ်ပြီး clean `npm ci` ဖြင့် validate လုပ်ထားသည်။ Direct dependency versions မပြောင်းပါ။

Netlify metadata က original build-stage failure ကို အတည်ပြုသည်။ Full hosted build-log text ကို မရရှိခဲ့ပါ။ အထက်ပါ concrete errors တွေက original repository head နှင့် real full local pipeline မှ ပြန်ဖော်ထုတ်ထားခြင်းဖြစ်သည်။

## Backend review — security checks ထိန်းသိမ်းထားပုံ

| Files / area | Review finding |
|---|---|
| `_shared/auth.mts` | Identity `getUser()` လိုအပ်သည်။ Absent/malformed roles ကို 403 ဖြင့်ပိတ်သည်; admin role စစ်ဆေးမှု မလျော့ထားပါ။ |
| `exam-payment-submit.mts` | Own-property plan validation, server price, bank validation, file-size/MIME restrictions ဆက်ရှိသည်။ Storage/DB ပြီး email ပျက်လျှင် pending success ပြန်သည်; auto approval မရှိပါ။ |
| `exam-student-verify.mts` | Code verification ပြီး atomic UPDATE တွင် student code/hash/status/linked owner condition ပါသည်။ Competing claim ကို 409 ဖြင့်ပိတ်သည်။ |
| `exam-status.mts` | Signed-in account scoped SQL နှင့် `private, no-store`; one-free-per-type response ဆက်ရှိသည်။ |
| `_shared/exam-autosave.mts` | Structured SQL error/cause checking, cycle/depth bounds; free quota unchanged. Nishu 50-minute/100-point/90-pass additions သာ ထည့်ထားသည်။ |
| `_shared/security.mts` / score / access / checkpoint | Existing guarded nishu patcher ၏ deterministic five-file integration ကို explicit commit ထဲ ထည့်ထားသည်။ Server scoring, owner filtering, checkpoint revisions, authoritative deadlines မဖယ်ထားပါ။ |
| `exam-attempt-submit.mts` | No direct repair edit. Server recalculation, minimum elapsed time, final phase, checkpoint ownership/version, expiry and score mismatch guards reviewed; existing tests retained. |
| Nishu history / review | Own user + nishu type scoped SELECT; review only after submitted; no-store; no writes. Additional actual-handler mocks added. SQL mocks are not a multi-user live DB E2E test. |
| Growth/CRM endpoints | Admin checks before private DB access; parameterized SQL. Anonymous growth click endpoint intentionally collects bounded non-PII click events. No live requests sent. |
| YKCR / approval / paid access | Existing files preserved; no sync, receipt, approval, student or real-payment mutations performed. Live workflow validation remains blocked. |

Runtime files edited by this repair are the five additive nishu integration files already defined by the PR's patcher; authentication/payment/student-verify implementations themselves were reviewed, not weakened or replaced. No HTML, CSS, visual asset or UI layout edits were made. All 12 existing exams plus nishu remain present.

## Netlify / database safety

Original preview: https://deploy-preview-4--yekun-mryethemenstyle.netlify.app/

Failed deploy detail: https://app.netlify.com/projects/yekun-mryethemenstyle/deploys/6af710c67df854879beeda08

- Published production remains the v7.87.4 baseline deploy. No main update, merge, production deploy or production database write was performed.
- Netlify project advertises team-login protection for non-production deploys. It was not disabled.
- Failed preview metadata contains no database branch ID or migration result. This is absence of evidence, not proof that no database exists.
- Preview and production use equal configured values for `RESEND_API_KEY`, `YKCR_SYNC_SECRET`, and `EXAM_BANK_ACCOUNTS_JSON`; admin/from email settings apply to all contexts. No secret values are included in this package.
- No hosted payment upload, notification, student claim, YKCR sync or migration was attempted.
- Local migration tests used PGlite 100% in memory, no connection string and no network database. This verifies SQL and selected constraints, not Neon permissions, production data distribution, concurrency, or Netlify migration lifecycle.
- Existing large-image warning remains: one public image is 541,831 bytes. It was not recompressed because existing UI/assets were to be preserved; no real-device speed claim is made.

## Remaining release blockers

1. Upload this reviewed repair to **QA branch only**; verify the new remote commit. Current integration lacks write permission.
2. A successful Netlify Deploy Preview of that exact uploaded commit, including actual function packaging/runtime and static smoke.
3. Verified isolated test database and test storage/Identity/notification/YKCR configuration; then execute relevant migrations there and capture evidence.
4. Authenticated E2E with test users: register/login/logout, student verification, cross-account denial, YKCR sync, per-type free quota, exam resume/deadline/submit, nishu result/review, receipt upload, admin approve/reject/duplicate handling, paid start/expiry.
5. Actual Android and iOS checks: overflow, languages, install/offline public-only behavior, cache update, performance. Browser launch in this runtime was blocked.
6. Source SHA matched across test/preview/evidence, previous production reference and reviewed recovery procedure, named reviewer signoff. Explicit user approval is still required before merge or production deployment.

Strict release gate: **5 PASS / 6 BLOCKED, NO_GO**. Do not rename version to Stable or treat local PASS as release approval.

## Evidence files

`evidence/full-qa.json`, `generated-dist-audit.json`, `local-http-smoke.json`, `isolated-db.json`, `release-decision.json`, `function-bundle.log`, `mobile-runtime-blocked.log`, original failure logs and clean-install/final-gate logs are included. `PATCH_MANIFEST.json` records exact changed-file hashes and required starting head.
