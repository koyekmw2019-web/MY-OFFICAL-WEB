# STUDYING WITH YE KUN — v7.87.6 UI Fix 05

**QA-only patch for the already-deployed v7.87.6 Fix04. Not a full website, not a release, and not a Production change.**

## ပြင်ဆင်ထားတဲ့ UI

1. **Home / Study Hub** — `သင်ခန်းစာအားလုံး ဖွင့်ရန် ↗` CTA ကို button အလယ်တည့်တည့်ထားပြီး font size ပိုကြီး၊ bold လုပ်ထားပါတယ်။ မူရင်း Language Translation နဲ့ link မပြောင်းပါ။
2. **JLPT Learning Center** — Logo အောက်က `Study Hub / Dictionary / Mock Exam` pill bar ကို မျက်နှာပြင်ပေါ်မှာဖျောက်ပြီး Hero Card ကို အပေါ်တင်ထားပါတယ်။
3. **Grammar Detail** — Logo အောက်က `Grammar / Study Hub / Mock Exam` pill bar ကို မျက်နှာပြင်ပေါ်မှာဖျောက်ထားပါတယ်။ အောက်မှာ `☆ Bookmark | ✓ လေ့လာပြီး | ← Grammar သို့` ဆိုပြီး Button ၃ ခုကို တစ်တန်းထဲ ညီညီညာညာ ထားပါတယ်။ Existing Bookmark/Mark learned event handlers, states, stored learning progress, and original Back link URL are preserved.

**Important:** `#yk88BackTop` stays in the DOM (hidden visually), because the original Grammar Detail JavaScript updates its URL. We do not delete it. The original bottom Back anchor is moved into the 3-button bar after rendering. The visible labels are shortened, while accessibility labels and underlying state callbacks are retained.

## Compatibility and QA workflow (GitHub Desktop)

- Repository: `koyekmw2019-web/MY-OFFICAL-WEB`
- Exact inspected Fix04 commit: `010fe4d6c5f108654c17826551ba648092dca96d`
- Original `scripts/build-page-transitions-v7875.mjs` blob SHA: `660804e12c526830d682873bac74f9a34d65bc94`
- If the current branch has moved or the build script differs, STOP and review instead of blindly overwriting.

**Before extraction:** Use GitHub Desktop to inspect/pull the correct baseline, then create a **LOCAL QA BRANCH**, e.g. `qa/v7.87.6-ui-fix05`. Do not extract directly over `main`.

Unzip into the existing repository ROOT (`package.json` location). There are 5 code changes:

- MODIFIED `scripts/build-page-transitions-v7875.mjs` — one import after Fix04
- ADDED `scripts/build-v7876-jlpt-ui-fix05.mjs` — guarded public `dist/` HTML injection
- ADDED `assets/yk88-jlpt-ui-fix05.css` — scope-specific CSS
- ADDED `assets/yk88-jlpt-ui-fix05.js` — Grammar Detail presentation-only enhancement
- ADDED `tests/v7876-ui-fix05.mjs` — source / fixture regression checks

Optional extra browser smoke script: `tests/v7876-ui-fix05-browser-smoke.py` (Python + Playwright + Chromium; NOT needed for normal builds).

## Local QA commands

```sh
node --check scripts/build-page-transitions-v7875.mjs
node --check scripts/build-v7876-jlpt-ui-fix05.mjs
node --check assets/yk88-jlpt-ui-fix05.js
node tests/v7876-ui-fix05.mjs
npm test
npm run build
node tests/v7876-deployed-output.mjs
node tests/v7876-mobile-repair.mjs --release
node tests/v7876-tabs-fix04.mjs --release
node tests/v7876-ui-fix05.mjs --release
```

`npm run build` must be run on the **local QA branch checkout**, not on a live server. The build copies the new `assets/` files to `dist/`, then this patch injects its CSS into exactly the home, JLPT Learning and Grammar Detail pages. Only the Grammar Detail page loads the new UI JS.

No external Python/BAT script or manual source-HTML changes required to apply.

## Preview checklist before further approval

- Test 320 / 360 / 390 / 430 px and desktop.
- Home CTA centered, visibly bold, link still opens Learning Center; language switching English/Myanmar/Japanese keeps correct text.
- JLPT Learning logo remains; top pill bar gone; hero card higher; Daily Practice / Explore Lessons and Fix04 7 tabs work.
- Grammar Detail example text still loads; 3 equal-height, equal-width buttons in ONE ROW without horizontal overflow; Bookmark toggle and learned-status update work separately; Back returns to same level's Grammar list.
- Preserve existing 5-tab bottom navigation, dark/light modes where supported, login, payment, exam, and YKCR behavior.
- Run real-device QA + Netlify Deploy Preview **only with separate approval for GitHub push / preview actions**.
- Separate explicit approval is mandatory before commit, push, merge, Netlify Production, SQL/DB, or student data changes.

## Rollback

On the QA branch, restore `scripts/build-page-transitions-v7875.mjs` to the Fix04 version and remove the three new runtime/source files and Fix05 test. Because this patch only adds a build step and two new assets, the original v7.87.6 Fix04 navigation/logic remains available. For Production rollback, require separate approval and a tested plan.

**Honesty:** Full `npm test`, full `npm run build`, deployed Netlify preview and actual mobile E2E were NOT run in the preparation environment; only syntax, synthetic builder and synthetic Chromium responsive/browser checks were run.
