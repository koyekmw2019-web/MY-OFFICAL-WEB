# STUDYING WITH YE KUN — JLPT UI Phase 1 (QA ONLY, NOT STABLE)

**Baseline:** GitHub `koyekmw2019-web/MY-OFFICAL-WEB`, `main` exact SHA `09df1bea6f8780872c68a97b072de983ccad744d` as checked on Nov 18, 2026.
**Patch type:** Source patch ZIP for a local GitHub Desktop copy. NOT a full website. No GitHub commit/push, Netlify deploy or database actions were performed.
**Scope:** Phase 1 only — cleaner JLPT Learning Center hero, level buttons, progress cards, study-mode tabs, typography and spacing; Black/White/Crimson Red; mobile safe-area. The **current Grammar List/Detail and all runtime JavaScript are untouched**. Other screens (detail redesign and Focus Mode) are deferred phases.

## Included paths (copy/merge into exact repository root)
1. `assets/yk88-jlpt-phase1.css` — NEW; scoped Learning Center CSS, excludes `.yk88-detail-page`.
2. `scripts/build-v7880-jlpt-ui-phase1.mjs` — NEW; guarded `dist/study/jlpt-learning.html` stylesheet injection after earlier build stages.
3. `scripts/build-page-transitions-v7875.mjs` — REPLACEMENT of this exact original source only; adds ONE import at end to run the new builder. Original source Git blob: `2e797d262ec96bf32c468c6536d9c718544bc2d0`.
4. `tests/v7880-jlpt-ui-phase1.test.mjs` — NEW local validation.

## Do not apply automatically to current Production
1. Back up the repository and verify `git rev-parse HEAD` equals `09df1bea6f8780872c68a97b072de983ccad744d` before merging files. STOP if SHA differs or local file content differs. This patch has not been QA-tested against later versions.
2. Copy the four paths into a separate local working copy or a QA-only branch. No changes to `package.json` or Netlify settings.
3. Run `node tests/v7880-jlpt-ui-phase1.test.mjs` (focused self-contained fixture test).
4. Run the project's **existing** `npm test` and `npm run build` in the full repo with dependencies installed. New injection runs at end of existing `postbuild` pipeline; no manual `.cmd` needed.
5. Check built `dist/study/jlpt-learning.html` includes `yk88-jlpt-phase1.css?v=7880p1qa01` exactly once.
6. Browser QA at 320/360/390/430/768/desktop widths, portrait and landscape, light/dark, 5 levels, 7 tabs, clickable Grammar Cards, Bookmark, Mark Learned, Daily Practice, login/cloud progress, mobile nav and countdown. Confirm previous Home `Open All Lessons` CTA remains full-width.
7. Seek separate approval for a QA branch push, then separate approval for Production release after review. **Not stable until real E2E checks pass.**

## What stays unchanged
- `assets/yk-jlpt-learning-v782-page.js`; `assets/yk88-grammar-detail.js`; Grammar Data and 524 IDs / 1,572 examples.
- Progress and Bookmarks client/server sync; Identity login; YKCR; payments; exam engine; Netlify Functions/database; Service Worker; backend schema.
- Main Home CTA Fix05.4, seven tab handlers, existing bottom app nav, standalone Grammar Detail routes.

## Known limitations
- Full production source could not be cloned into this workspace because container network access to GitHub is unavailable. Baseline main HEAD, original build-runner Git blob, and current source files were inspected via connected GitHub read-only tools. Focused build/guard tests run locally; full `npm run build`, production-like browser E2E, account/cloud sync and phone testing remain pending. Do not mark Stable.
- Mock design board is a visual goal, not proof that the full four-screen redesign has been implemented. **This ZIP implements Phase 1 only.**

## Rollback
- Remove the final import of `./build-v7880-jlpt-ui-phase1.mjs` from `scripts/build-page-transitions-v7875.mjs` (or restore the original file from GitHub commit above); remove the new CSS, new builder, and test file. Rebuild from a clean `dist/`. No database rollback needed because this patch does not change data.
