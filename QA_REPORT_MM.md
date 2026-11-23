# STUDYING WITH YE KUN — 2026-11-23 Menu V2.1 QA Candidate

## ယနေ့ လုပ်ပြီးသော အလုပ်

- 2026-11-21 Full Local Menu Integration Build (41 HTML files) ကို အခြေခံသည်။
- Nov 22 နောက်ဆုံး Menu V2.1 branded drawer, CSS, JS, Myanmar/English/Japanese i18n, Facebook Follow label fix ကို ထည့်ထားသည်။
- Boss ကြီး အတည်ပြုထားသော bottom navigation ကို **Home · Study · Exam · Video · Account** အဖြစ် 41 pages အားလုံး ပြန်တူညီစေသည်။ Hamburger Menu ကို header/fallback မှ ဖွင့်နိုင်အောင် ဆက်ထားသည်။
- Study `/study/index.html`, Exam `/mock-exams.html`, Video `/video-class.html`, Account `/dashboard.html` သို့ ချိတ်ထားသည်။
- Header drawer, title MENUS, responsive UI, brand assets, original routes preserved.
- Question bank, Identity bundle, original scoring engine, service worker, existing exam pages content outside menu HTML ကို မပြောင်းထားပါ။
- PR #7 GitHub HEAD was `8f80cc04765472fedf7d7eaaa9bf64cc70aa8ea1` at review. Source branch `qa/v7.89.0-rc1-second-license-20261120` remains draft; no GitHub mutation performed.

## Tests

| Check | Status |
|---|---|
| 41-page menu, five labels, exact routes, duplicate IDs, i18n presence | PASS |
| QA Menu route checker, all 41 pages | PASS |
| Node JavaScript syntax (navigation/drawer/i18n/builder) | PASS |
| Identity bundle, autosave engine, all-exams engine, service worker byte equality to earlier QA build | PASS |
| Original QA exam pages unchanged outside updated nav/drawer/i18n | PASS |
| Chromium E2E in this runtime | BLOCKED — `net::ERR_BLOCKED_BY_ADMINISTRATOR` on loopback |
| Hosted Team Login/Identity cookie-free verification | BLOCKED — not exercised |
| Real student/paid entitlement + backend scoring for new second license | NOT IMPLEMENTED / NOT TESTED |
| Production deploy | NOT DONE |

## အရေးကြီးချက်

Local QA candidate သည် **Production Stable** ဟု မဆိုလိုပါ။ Existing second-license simulator does not enforce production server scoring, access entitlement or official results. FIX03 session isolation local PASS is not evidence of hosted compatibility.

## GitHub Desktop လမ်းညွှန်

QA branch `qa/v7.89.0-rc1-second-license-20261120` ကိုပဲ ရွေးပြီး `QA_BRANCH_OVERLAY/` ထဲက path များကို repo ထဲထည့်ပါ။ Main ကို မပြောင်းပါနှင့်။ QA test/preview ကို ပြန်စစ်ပြီးမှ commit/push ခွင့်ပြုပါ။ ဒီ ZIP ကို Production Netlify မှာ upload မလုပ်ပါနှင့်။

## Rollback

GitHub QA branch 4-file overlay မတင်ထားသေးပါ။ မတော်တဆ overlay ကူးမိလျှင် GitHub Desktop မှ discard changes ပြန်လုပ်နိုင်သည်။ Production v7.88.1 untouched.
