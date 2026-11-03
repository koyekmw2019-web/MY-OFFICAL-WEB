# v7.65 Stability QA — 2026-11-02

## Automated (offline, not production)

- `npm test`: 27 PASS (v7.63 integrity Mock DB) + 12 PASS (v7.65 Furigana / Graph) = 39 PASS, 0 FAIL.
- JavaScript syntax: all standalone `.js` files checked (`node --check`).
- Live browser-rendered Dashboard UI using inline source, Fake Identity, Mock API: Student, Member, Admin × 390px / 1365px = 6 PASS, no runtime JS errors or horizontal overflow.
- Furigana explicit regression: N5 example 時計 (読み方) shows no `<rt>` before answer; all vocabulary questions N1–N5 tested for no Ruby hints; grammar/reading context can still display Furigana; review can display after submission.
- Normalized chart: score maxima and filtering tested; legacy unverified scores not plotted.
- Migration safety: original 10 SQL migration files preserved byte for byte. No Netlify Function or src backend files changed. No PDF files added.

## Remaining limits

- These tests do NOT verify Netlify Production database migrations or real login/payment/YKCR state. Use a private Deploy Preview/Staging and test real end-to-end flows.
- Historic `tests/v762-unit.mjs` predates v7.63 checkpoint/scoring changes and is not included in the current `npm test` script. Standalone invocation shows 11 PASS / 3 FAIL (two outdated expectation tests and 9 vs 10 migration-count assertion). Do not interpret those three as new v7.65 regressions; do not use them as a production acceptance test.
- JLPT N1–N5 Furigana vocabulary completeness and all question-level readings still require expert review.
- Graph is practice-score progress only, not official JLPT scaled score or grading.
- Browser test was run with source injected into browser because local URL navigation is blocked in the QA environment.

## Release status

**Staging / Release Candidate; NOT certified production stable.**
