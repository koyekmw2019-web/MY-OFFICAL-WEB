# STUDYING WITH YE KUN — v7.87.6 UI Fix05 QA Report

**Status: QA candidate only — not deployed, not verified Stable.**

## Baseline

- Repo: `koyekmw2019-web/MY-OFFICAL-WEB`
- Inspected Production Fix04 commit: `010fe4d6c5f108654c17826551ba648092dca96d`
- Existing builder ZIP/GitHub blob: `660804e12c526830d682873bac74f9a34d65bc94` (verified equal)
- Changes prepared locally only; no GitHub, Netlify, SQL, YKCR or user data mutations.

## UI changes implemented

1. Home `yk821-hub-open` CTA: flex center, bigger bold Myanmar text and wrapping at narrow widths; original href and translation bindings unchanged.
2. Learning page: hide only the redundant `.yk82-top-links` visually and tighten hero/main top spacing; brand logo and bottom navigation retained.
3. Grammar Detail: hide redundant `.yk82-top-links` visually but keep its `#yk88BackTop` in DOM, move the already-rendered `.yk88-back` anchor into `.yk88-detail-actions`, shorten display labels and create an equal-width three-column bar. Existing Bookmark and Mark-Learned handlers untouched.

## QA actually run

- `node --check`: PASS on modified build orchestration, new dist injector, and new JS helper.
- Source / synthetic builder tests: PASS, including exact import order, assets injection into exactly three HTML routes, JS only on Detail, duplicate detection, unexpected-anchor refusal with no prior writes.
- Synthetic headless Chromium with widths 320, 360, 390, 430, 720px: PASS 15/15 per-route responsive cases. Detail case verified 3 buttons on same top row, equal calculated width, no horizontal overflow; Bookmark and Learned interaction simulation; existing Back href retained. Learning case verified nav visually hidden and content close to header. Home case verified centered, bold, larger CTA.
- ZIP integrity / checksum: generated and validated after packaging.

## Not run / not claimed

- Full repository `npm test` / `npm run build` (complete site checkout was not supplied in container).
- Real Netlify Deploy Preview, actual Samsung device, service-worker cache refresh.
- Full live authenticated E2E of bookmarks / learning-progress sync, payment, exam, or YKCR.
- Functional Stable / release approval.

## Decision

**NO-GO for Production** until QA checkout + full build/test + mobile Deploy Preview + separate explicit release approval. Keep v7.87.6 Fix04 as current baseline.
