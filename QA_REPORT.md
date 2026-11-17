# v7.88.0 RC1 — Audit and Correction Report

**STUDYING WITH YE KUN** · 2026-11-17 · **NOT STABLE / RELEASE NO-GO**

## Starting point
Previous consolidated **v7.87.9** contained an inventory-mapped 524 Grammar cards and 1,572 three-language example rows, including 30 legacy cards and 494 authored additions. The prior audit expressly did not claim semantic accuracy or full ruby coverage.

## Verified defects and changes
1. `assets/yk-jlpt-learning-v782-state.js` on current GitHub main limits completed/bookmarked IDs to 500 (and cloud merge completed to 500). `netlify/functions/jlpt-learning-progress.mts` independently caps sanitization/merge to 500, making 524+ learned/bookmarked items unreliably persistent. The new guarded preparatory script changes exactly three client and three server anchors to **2,000**. This requires source-side application BEFORE the website build and subsequent end-to-end test. Payload upper bound for 2,000 grammar-like IDs + 2,000 bookmark timestamps is approximately 74k JSON chars, within existing 120k server request cap; actual max values and additional fields still require live verification.
2. N1 `〜んがために`: invalid `真実を知んがために` changed to `真実を知らんがために`, with original Myanmar/English context clarified. Explanation explicitly notes `する→せん`.
3. N1 `〜だの〜だの`: formation changed from N-only to noun/plain-form inclusion, matching its adjective/verb examples.
4. N3 `〜にしても〜にしても`: formation now includes verb and adjective forms in addition to nouns.
5. N4 `〜ようになる`: formation now includes potential verbs, matching its ability-change examples.
6. N2 `〜ものだから`: revised a stilted Japanese example and corresponding MY/EN translations.

All five content edits use an exact existing level/title check; their original Grammar IDs are unchanged. The previous six v7.87.9 targeted repairs remain in the consolidated patch.

## Tests run on local files (evidence)
- JavaScript syntax checks across `scripts/*.mjs` and `tests/*.mjs`: **PASS**.
- `node tests/v7880-grammar-rc.test.mjs`: **PASS**. Synthetic 524-card fixture with original data for 494 authored records but placeholders for legacy 30 records; five content fixes, 2,000-capacity guard and one-time application, full example field/count validation, asset cache keys.
- `node tests/v7878-grammar-source.mjs`: **PASS**. Source counts / coverage schema.
- `node tests/v7879-reading-coverage.mjs`: **PASS** as a measurement, not full ruby quality review; still identifies **55** authored N2/N1 examples containing Kanji but no ruby.
- `python tests/v7879-browser-ruby-smoke.py`: **PASS** isolated 320/390/720 px Chromium layout (21 render checks); this did not load an actual full website.
- ZIP integrity/checksums: checked at packaging.

## NOT verified
- Full repository `npm run build` and production-like integration: **NOT RUN** (no full source checkout present; repository network unavailable in local container).
- All translations, conjugations, JLPT classifications and furigana: **NOT FULLY REVIEWED**.
- Real Samsung device / Netlify deploy preview / cloud login & progress regression: **NOT RUN**.
- Main, production, database and student records: **UNCHANGED**.

**Release decision: NO-GO.** A stable label would be misleading. This package is a QA release candidate intended to remove documented release blockers, not a certificate of teaching-content correctness.
