# v7.67 QA Report — Learning Progress Analytics 2.0

## Summary
- Source: v7.66 ZIP (no data migrated)
- Automated tests: **76 PASS / 0 FAIL** (v7.63 27 + v7.65 12 + v7.66 13 + v7.67 24)
- Browser mock checks: **7 PASS** (Student desktop/mobile, Member desktop/mobile, Admin desktop/mobile, Member empty-history mobile)
- JavaScript files changed: Syntax checked with Node `--check`.
- All original Netlify Functions and SQL migrations: byte-for-byte unchanged.
- No PDF files added, no DB schema changes.

## New tested cases
- All / 7 / 30 / 90-day period filters
- Exam type selection and zero-data state
- Server-verified score-only normalization (JLPT 180, Truck/Taxi 50, etc.)
- No mixed-exam score-change calculation; same-type 3 vs previous 3 only
- No invented values for missing data
- High-frequency saved mistake review ranking
- Desktop and mobile responsiveness
- Admin CSV and Payment UI still renders (mocked)

## Known limits
- Browser tests use mock identity and API responses, **not the real Netlify environment**.
- The `exam-my-activity` API provides the latest **50** attempts; analytics reflect available history only.
- The `yk-learning` API provides latest **150** saved mistakes; review priorities are not a full lifetime analysis.
- Mixing exam types by normalized percentage does not mean the tests have equivalent difficulty.
- Official JLPT scaled-score/IRT calculations are **not** claimed.
- Performance, Payment, YKCR and Exam End-to-End testing on Staging remains required before production release.
