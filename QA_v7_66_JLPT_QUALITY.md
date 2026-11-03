# QA Report — v7.66

Base: v7.65 Stability ZIP.

Static test coverage:
- Exam Integrity regression: 27 PASS
- v7.65 Stability regression: 12 PASS
- v7.66 JLPT bank & ruby QA: 13 PASS
- Total automated: **52 PASS / 0 FAIL**
- Browser isolated rendering: shared helper present; 直前対策 start, vocabulary protection, furigana toggle ON/OFF; native JLPT start; no JavaScript page errors in synthetic test.
- Previous answer-key regeneration check: unchanged

Question bank count per level: 100 full mock + 20 short practice. Full mock = 500 questions; short practice = 100.

Checks include: unique IDs, 4 different choices, valid answer indices, presence of Japanese and Burmese explanations, reading passage for reading section, script for listening section, public JS/JSON parity, Ruby escaping.

Production status: **Release candidate**, not production-verified. No live Netlify DB or Identity E2E test. No teacher-certified semantic/difficulty review of all 600 items.

Underlying question banks and official scoring backend remain byte-identical to v7.65. No new database migrations or PDFs.
