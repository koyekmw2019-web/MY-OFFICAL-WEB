# STUDYING WITH YE KUN — JLPT Phase 1 + Windows QA Compatibility

**QA ONLY · NOT STABLE · NOT PRODUCTION**

**Source baseline:** `koyekmw2019-web/MY-OFFICAL-WEB` at `09df1bea6f8780872c68a97b072de983ccad744d`.
**For existing QA branch:** `qa/jlpt-ui-phase1-7880`.

Boss ကြီးအတွက် အဆင်ပြေဆုံးနည်း — Code ပြင်စရာ၊ Command မရိုက်စရာ မလိုပါ။

1. GitHub Desktop မှာ `qa/jlpt-ui-phase1-7880` QA Branch ဖြစ်နေတာကိုသာ ကြည့်ပါ။ **main မဖြစ်ရပါ။**
2. ဒီ ZIP ကို `Extract All` လုပ်ပြီး ZIP ထဲက **`assets`, `scripts`, `tests`, `package.json`** ကို `MY-OFFICAL-WEB` Repository Root ထဲ Copy/Paste, folder Merge, same-name files Replace လုပ်ပါ။ (ZIP ကိုယ်တိုင် GitHub ထဲ မတင်ပါနဲ့။)
3. အားလုံးတစ်ခါတည်း ကူးပြီးပါက GitHub Desktop မှာ Review လုပ်ရန်ပါ။ **QA မပြီးခင် Commit/Publish/Merge/Production မလုပ်ပါနဲ့။** 

## Ready-to-copy Code — ဖိုင် ၆ ဖိုင်

| Path | Action | Purpose |
|---|---|---|
| `assets/yk88-jlpt-phase1.css` | NEW | JLPT Phase 1 responsive UI |
| `scripts/build-v7880-jlpt-ui-phase1.mjs` | NEW | Build ထဲ Phase 1 CSS ကို safe inject |
| `scripts/build-page-transitions-v7875.mjs` | REPLACE | Existing build chain ပြီးမှ Phase 1 run |
| `tests/v7880-jlpt-ui-phase1.test.mjs` | NEW | QA self-contained fixture |
| `tests/v774-release-smoke.mjs` | REPLACE | Windows path separator bug fix (`path.sep`) |
| `package.json` | REPLACE | Windows CMD နဲ့ မကိုက်တဲ့ `mkdir -p assets` ကိုဖယ် (assets folder already exists) |

**Do not copy `PATCH_MANIFEST.json` from the older Phase 1 ZIP:** this new ZIP uses a uniquely named QA manifest to avoid touching the existing repository manifest.

## Extra changed test files (GitHub Desktop screenshots: 14 files)

The repository already runs `scripts/v7872-qa-version-guards.mjs` automatically before `npm test` and `npm run build`. That script **edits accepted-version test lists** to add `7.87.4`. This explains the extra modified test files in the screenshots. They were not introduced by the Phase 1 CSS. This new package **does not overwrite these 14 local changes**; keep them for separate review. Do not discard unreviewed changes.

## မပြောင်းထားတဲ့ အရာများ

JLPT grammar data, lesson IDs, bookmarks/learning progress, client-server sync, login, payment, YKCR, exam engine, migrations, Netlify configuration, GitHub branches and Netlify Production are unchanged by the supplied code.

## QA status

PASS: original Phase 1 scoped fixture, duplicate-injection and missing-anchor checks; `node --check` on included JS; byte-identical baseline reconstruction of `package.json` and `tests/v774-release-smoke.mjs` before applying the two targeted Windows fixes; static verification of Windows-safe build command.

NOT DONE: Full repository `npm test`, `npm run build`, Netlify preview and real-device E2E. Package is **NOT STABLE** and not approved for Production.

If current package.json or v774-release-smoke.mjs has been edited independently since GitHub baseline, do not overwrite it without comparing, even on QA branch. GitHub Desktop screenshot shows neither file in the 21 local changed-file list as of Nov 18.
