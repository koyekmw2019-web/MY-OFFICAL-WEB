# YE KUN v7.87.5 — Build Fix 01 QA Report

**Cause verified:** current `main` commit `c90320d1` has appended page-transition
steps after theme steps in `package.json` `postbuild` and `posttest`. The old
`tests/ui-preferences.mjs` has two `$` end-of-script assertion anchors that
must be updated to allow later compatible steps. No backend failure was observed.

**Scope:** only `tests/ui-preferences.mjs`, exactly two assertion lines. GitHub
old file SHA-1 verified; current `package.json` verified against main SHA-1.

**Tests:**
- `PASS` — `node --check tests/ui-preferences.mjs`
- `PASS` — `node tests/ui-preferences.mjs`
- `PASS` — `node tests/v7875-page-transitions.mjs`
- `PASS` — `node tests/mobile-ui-polish.mjs`
- `PASS` — `node tests/ui-preferences.runtime.mjs`
- `PASS` — `node tests/ui-preferences.mjs with previous package.json`
- `PASS` — `22-page fixture: node scripts/build-page-transitions-v7875.mjs && node tests/v7875-page-transitions.mjs --release`

**Limits:** This workspace did not contain the complete repository. No full
`npm test`/`npm run build` across the full source, live Netlify Preview, mobile
browser QA or end-to-end Login/Payment/YKCR were completed. A simulated
22-page build check passed, not the actual production build. The failed deploy
remains failed. Current production behavior must be checked separately.
