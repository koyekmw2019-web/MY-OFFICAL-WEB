# YE KUN v7.87.5 — Native Smooth Transition Fix 02

**Status: Preview Candidate — NOT production-stable.**

## Why this patch
The previous CSS used horizontal movement on the `root` snapshot and animated the existing
bottom dock. On cross-document navigation, that could make the whole phone screen move
and the tab bar disappear/reappear. The new CSS removes all horizontal movement and
separately snapshots the header and dock, with a subtle opacity-only blend for content.

## Source review
- Repository: `koyekmw2019-web/MY-OFFICAL-WEB`
- Inspected `main` commit: `c842bdde5bb590ac3bb9ad44e87d769b003563c2`
- Compared original `YEKUN_v7.87.5.zip` with GitHub file blob SHAs: **3/3 exact matches**.
- The `tests/ui-preferences.mjs` Build Fix 01 is already present on the inspected `main`.
- No change to `package.json` or to `tests/ui-preferences.mjs`; avoids prior postbuild-test conflict.

## Technical change
1. **CSS** `assets/yk-page-transitions-v7875.css`: opacity-only page blend (135ms out,
   190ms in), separately named and stabilized header and bottom navigation, theme-matched
   overlay background, existing mobile-only/reduced-motion opt-in.
2. **Builder** `scripts/build-page-transitions-v7875.mjs`: cache-bust `?v=7875native2`.
   Same exact seven opt-in pages and same login/exam-detail exclusions.
3. **Test** `tests/v7875-page-transitions.mjs`: new cache-bust expectation and assertions
   for stable header/nav, themed overlay and absence of full-screen transform.

## Local QA evidence
- **PASS** baseline `Git SHA` comparison to previous zip (3/3).
- **PASS** `node --check` for builder + test.
- **PASS** Node source test, 22-page synthetic generated Build Fixture, release test.
- **PASS** previously fixed `tests/ui-preferences.mjs` source test.
- **PASS** Chromium parsed responsive CSS: 360, 390, 430, 720, 721px, light/dark,
  reduced-motion, header and tab bar unique view-transition names, no transform effect.
- **NOT RUN** real cross-document browser navigation: sandbox administrator blocks
  all local/external navigations (`ERR_BLOCKED_BY_ADMINISTRATOR`).
- **NOT RUN** full project `npm test` / `npm run build`: complete repository is not
  available in the runtime; the fixture is only a partial imitation.
- **NOT RUN** Netlify Preview and real mobile-device QA.

## Protected scope
Only **3 CSS/build/test files** differ. No Identity/auth, database, SQL, migrations, YKCR,
Netlify Functions, payment, exam engine, timer, autosave or scoring source changes.
These systems still require regression testing after a complete build.

## Known limitations
Chrome/Safari support varies by browser version and origin; supported same-origin
cross-document navigation can blend softly. Other browsers use the normal page load.
This is not a single-page app conversion, so native Facebook/Instagram equivalence is
not promised. Exact visual outcome must be checked in Netlify Deploy Preview.

## Deployment safety
Do not replace the full repository, deploy directly to production, or merge to main
before the user approves the preview and regression checks pass.

Supporting documentation:
- https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition
