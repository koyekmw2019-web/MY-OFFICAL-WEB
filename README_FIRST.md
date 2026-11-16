# STUDYING WITH YE KUN — v7.87.6 UI Fix05.2

**QA-only Patch (Fix05.2).** This is a complete replacement of Fix05 / Fix05.1 for the existing v7.87.6 Fix04 baseline, **NOT** a full website ZIP and **NOT** a Production deploy.

## Approved user changes

1. Home mobile: reduce excessive empty space before **View More · Study Hub & JLPT** and between View More and the JLPT Learning Center card; keep the View More button, functionality, hero, student/teacher, countdown and 5-tab bottom navigation.
2. Home JLPT CTA: display only **သင်ခန်းစာအားလုံးဖွင့်ရန်**, no arrow, visually centered with larger bold Myanmar typography. English: `Open All Lessons`; Japanese: `すべてのレッスンを開く`. Preserve the existing destination `/study/jlpt-learning.html`.
3. Keep Fix05.1's UI enhancements for the separate JLPT Learning and Grammar Detail pages. All original bookmarks, progress state and back navigation stay untouched.

## Why a replacement was necessary

The previous CSS attempted to center a direct text node in a grid. The user's Samsung screenshot after Fix05.1 showed the correct arrow-free text **but still visibly left-aligned**, and excess top spacing. The Fix05.2 injector now wraps the CTA's original text node in a dedicated `<span class="yk88-cta-label">` so that it spans the full button width and has explicit `text-align:center`. It also adds a short **critical CSS fallback** directly to generated `dist/index.html` (as well as the versioned stylesheet) to protect the CTA and mobile spacing from missing/stale CSS requests. The global translation engine still works on the span's text node. No runtime translation engine or user data is changed.

The reduced space is caused by stacked original CSS (`.study-hub-v7` padding/margin; `.study-hub-more-wrap` margin; grid row gap; `#yk82Hub.yk82-panel` top margin). Fix05.2 reduces those values for **width <=640px** only; it does **not** hide View More or remove content.

## Exact baseline and installation

- Repo: `koyekmw2019-web/MY-OFFICAL-WEB`
- Verified reference commit: `010fe4d6c5f108654c17826551ba648092dca96d` (v7.87.6 Fix04)
- Fix04 builder blob: `660804e12c526830d682873bac74f9a34d65bc94`
- Create a **separate local QA branch** in GitHub Desktop. **Do not copy directly to main**.
- If Fix05 or Fix05.1 files exist in the QA branch, overwrite their corresponding files using this ZIP rather than adding a second import. Fix05.2 is a replacement.
- Extract into repository root containing `package.json`, retaining folder paths. The main builder keeps exactly one import for `build-v7876-jlpt-ui-fix05.mjs`, executed after Fix04.
- Source HTML, backend, database, payment, login, exam and YKCR code are not modified. The injection changes **generated dist/ HTML only** after the normal local build.

### Changed files

- `scripts/build-page-transitions-v7875.mjs` — 1 import remains, comment updated
- `scripts/build-v7876-jlpt-ui-fix05.mjs` — validated output-only injection, protected text wrapper, CSS fallback
- `assets/yk88-jlpt-ui-fix05.css` — stronger CTA centering, mobile spacing, existing learning/detail styles
- `assets/yk88-jlpt-ui-fix05.js` — unchanged Grammar Detail UI helper
- `tests/v7876-ui-fix05.mjs` — fixture-based tests
- `tests/v7876-ui-fix05-browser-smoke.py` — optional synthetic Chromium QA

## Local QA (not Production)

```bash
node --check scripts/build-page-transitions-v7875.mjs
node --check scripts/build-v7876-jlpt-ui-fix05.mjs
node --check assets/yk88-jlpt-ui-fix05.js
node tests/v7876-ui-fix05.mjs
npm test
npm run build
node tests/v7876-tabs-fix04.mjs --release
node tests/v7876-ui-fix05.mjs --release
```

**Mobile checks:** 320/360/390/430px. Open Home → Study. Look at View More top/bottom space, CTA exact label/center/size and arrow absence, theme & 5-tab nav. Check language switching MY/EN/JP. Check JLPT Learning hero and 7 tabs; Grammar details, Bookmark, Learned and Back. Use **real phone and authorized Deploy Preview** before stable approval.

**QA limitation:** Synthetic Chromium/browser and fixture checks are not complete-site/Netlify QA. No real-device screenshot or authenticated flow was validated in this package. **NO-GO for Production** until full repository build, tests, real-mobile QA, separate explicit release approval.

## Approval boundary

File creation is authorized by user request. No GitHub commit, push, PR, merge, Netlify Deploy, SQL migration, payment or student-data change was made. Request approval separately for each stage. To roll back from this QA branch, restore the Fix04 builder and remove the added Fix05 assets/helper; keep Production unchanged.
