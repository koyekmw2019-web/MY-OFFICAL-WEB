# STUDYING WITH YE KUN — v7.87.6 One-Click JLPT UX Correction

## Why this revision exists
The previous ZIP contained new assets and a patch script; copying the ZIP into the GitHub repository **did not modify** three existing source files. The website therefore remained visually unchanged. This new ZIP includes an unmistakable **`START_HERE_APPLY_V7876.bat`** launcher that checks and applies the patch with one double-click.

## Baseline examined
GitHub official repository `koyekmw2019-web/MY-OFFICAL-WEB`, `main` commit `a4fadc2c826079dda80d0ee8a3cbca939fecdae6`.

- New supplementary assets already present in `main`.
- Source files that still needed the patch:
  - `index.html`
  - `study/jlpt-learning.html`
  - `assets/yk-jlpt-learning-v782-page.js`
- Current Netlify production deploy `6af9c01fea9cdd470f17ca21` (ready) was not changed.

## Design scope
- Remove upper duplicate Open All Lessons and replace lower Start Learning with translated Open All Lessons.
- Visible Myanmar Explore Lessons sublabel, aligned with Daily Practice; remove hero Student/Teacher block; show countdown sooner.
- Guest Access copy about verified students and nonstudents' free attempt + paid plans. Remove duplicate mini plan box.
- Compact clickable Exam Plans with bank transfer guidance and existing checkout.
- Sticky-header scroll offset for lesson heading/tabs, compact horizontally scrollable tabs on mobile, and removal of desktop empty second hero column.
- Grammar card links to a new page with **STUDYING WITH YE KUN** logo, descriptions in Myanmar+English, ≥3 JA/MY/EN examples with crimson grammar underline and **no MY/EN labels** in examples.

## Safety
- Launcher prevents applying while on `main`/`master`.
- Script processes existing source anchors before writing and saves pre-apply backups outside the repository.
- Modified existing paths: only `index.html`, `study/jlpt-learning.html`, `assets/yk-jlpt-learning-v782-page.js`.
- No server, Netlify Functions, SQL, authentication or YKCR changes.

## QA status
- ZIP / syntax / static fixture checks: inspect generation log.
- Full `npm test`, `npm run build`, Netlify Deploy Preview, real phone checks: **PENDING**. Must not claim Stable or Production-ready.
- Content editorial proofread: **PENDING**.
