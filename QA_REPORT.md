# STUDYING WITH YE KUN — v7.87.6 Fix 04 QA Report

**Status: QA Candidate; not deployed, not approved as Stable.**

## Root cause / expected improvement

The prior Fix 03 page uses `#yk82Tabs` with `overflow-x:auto` and a visible scrollbar. On a narrow mobile device, `Reading` is partially cropped. The screenshot from the user shows that exact result. The current fix uses a **two-row compact grid** of all 7 tabs (4 on row 1, 3 on row 2) instead of another horizontal scroll strip. It preserves the already-working page width and bottom navigation. The Grammar Card detail link is given an explicit visual cue and a click target across non-interactive card padding; Bookmark and Mark Learned remain independent.

## GitHub baseline

- Repository: `koyekmw2019-web/MY-OFFICAL-WEB`
- `main` at inspection: `620dde8982061c82b0baadc482426d68d5b66f1f`
- `scripts/build-page-transitions-v7875.mjs` old blob: `f254a0663ab39147c046de5d4e2071ca6694fa74`
- Applies after existing `build-v7876-jlpt-mobile-repair.mjs` without modifying Fix 03.

## Scope / diff

- **Modified**: `scripts/build-page-transitions-v7875.mjs` — add one build import after Fix 03.
- **Added**: `scripts/build-v7876-jlpt-tabs-fix04.mjs` — guarded, dist-only HTML asset injection.
- **Added**: `assets/yk88-jlpt-tabs-fix04.css` — all 7 tabs in 2 rows at <=720px.
- **Added**: `assets/yk88-jlpt-tabs-fix04.js` — open Detail from non-interactive Grammar Card padding.
- **Added**: `tests/v7876-tabs-fix04.mjs` — source/output checks.

## Checks actually performed

- `node --check` on both new JS source files and the updated build script: **PASS**.
- Static source test for builder ordering, CSS scope, assets and backend isolation: **PASS**.
- Chromium **synthetic page fixture**, widths **320, 360, 390, 430, 720px**: 2 rows, 7 visible tabs, no page horizontal overflow, all 5 bottom navigation items stay visible — **PASS (5/5)**.
- Chromium synthetic fixture: tapping outside Grammar link but inside Card follows existing link once; Bookmark does not navigate; direct link still works — **PASS**.
- Synthetic dist-only build injection after Fix 03 with unique CSS/JS URLs — **PASS**.
- ZIP CRC/integrity: **PASS**.

## Not yet performed

- Full website `npm test` / `npm run build` (whole source tree is not present locally).
- Deployed Netlify Preview / a real Samsung mobile device.
- Full end-to-end Grammar Detail page, login, server-side learning progress sync and paid checkout behavior.

**Release decision: Do not merge into main until Netlify Deploy Preview mobile QA passes.**
