# STUDYING WITH YE KUN — v7.87.6 Auto Build Fix QA

## Root cause
The earlier patch installed `yk88` UI assets but the source files
`index.html`, `study/jlpt-learning.html` and `assets/yk-jlpt-learning-v782-page.js`
remained unchanged. Also, publishing splits the original homepage into
`dist/index.html` and `dist/mock-exams.html` *before* postbuild. A single
source-template patch would not correctly update all published pages.

## Solution
Extend the existing postbuild script (`scripts/build-page-transitions-v7875.mjs`)
with a safe importer (`scripts/build-v7876-jlpt-deploy.mjs`) that applies
all expected UI features directly to **generated** public output, including
13 exam pages (center and 12 individual exams), not just the homepage.

- `dist/index.html`: only one CTA, lower `Open All Lessons`, localized label
- `dist/mock-exams.html`: Guest Access explanation, compact plan modal
- `dist/exams/*.html`: same Guest Access/Plans UI without changing backend
- `dist/study/jlpt-learning.html`: bilingual Explore CTA, hero-image removal
- `dist/assets/yk-jlpt-learning-v782-page.js`: grammar-card detail links
- Brand/grammar detail page: already included in current GitHub source

## Tested now
- Node `--check` on both build files — PASS
- Synthetic 7-route existing transition test — PASS
- Synthetic 13-route exam UI patch + home/JLPT/grammar — PASS (15 assertions)
- New `tests/v7876-deployed-output.mjs` on synthetic dist — PASS
- No server/backend protected paths edited — PASS (scope review)

## Not yet tested
- Full actual website `npm test` and `npm run build`
- Netlify Draft PR Deploy Preview
- Real Android phone visual screenshots / backend integration smoke
- All 30 pattern translations manually proofread by native speakers

## Safety
Stops build if expected original anchors or assets differ.
Does not modify `main`/production automatically or rewrite tracked source HTML.
