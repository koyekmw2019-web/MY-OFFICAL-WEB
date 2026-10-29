# YE KUN Official Website v7.50 Preview — JLPT 直前対策 Add-on

## What was added / 追加した内容 / ထည့်သွင်းထားသည့်အကြောင်းအရာ

100 original, unofficial JLPT study questions with answer keys and Japanese + Myanmar explanations.

- N5: 20 / N4: 20 / N3: 20 / N2: 20 / N1: 20
- Each level: 8 vocabulary/kanji, 8 grammar, 4 reading-comprehension items
- Four distinct options per item; randomized order of items and choices during each practice
- 15-minute practice timer, question navigation, score and detailed explanations
- Native website text UI for **the newly authored 直前対策 questions only**
- Accessible in Online Exam Center, below the existing JLPT cards

## Source files

- `assets/jlpt-chokuzen-bank-v750.json`: inspectable question and answer bank
- `assets/jlpt-chokuzen-bank-v750.js`: browser-ready copy of the same bank
- `assets/jlpt-chokuzen-v750.js`: interactive frontend logic
- `JLPT_CHOKUZEN_ANSWER_BANK_v7_50.csv`: Excel-friendly answer key and explanations
- `index.html`: one new independent section with scoped CSS and script tags

## IMPORTANT / ご注意 / သတိပြုရန်

These are **YE KUN-created, unofficial practice questions**. They are not official JLPT exam questions, official answer keys, or scaled scores. Independent review by a qualified Japanese-language instructor is recommended before publication as a verified teaching resource.

Listening is **not** included in the new 100 questions. The existing JLPT audio and sample mock exams are preserved.

This is a separate **study drill**, NOT a new paid/graded mock-exam attempt. It is freely viewable without calling backend exam access endpoints, so it does not consume or change existing one-free-attempt limits. `Netlify Identity`, YKCR synchronization, payment approval, admin access and driving exams are unchanged.

The original N1–N5 page-image viewer mock exams **have NOT been fully converted** into native text. This is a v7.50 **PREVIEW ADD-ON**, **NOT v7.50 Final**.

## QA performed

- 100 questions, 100 unique IDs
- Each level = 20 items: 8 Vocabulary, 8 Grammar, 4 Reading
- Four unique answer choices, exactly one keyed correct answer per item
- N1, N2, N3, N4, N5: simulated full run with correct selections = 20/20 each
- Interactive levels, review and retry tested at desktop and mobile sizes in isolated browser test
- Duplicate IDs in entire `index.html` = 0
- JS syntax check passed
- ZIP integrity check performed after packaging

## Deployment

Deploy this full project folder via your existing Netlify deployment workflow. For a normal Git build Netlify invokes `npm run build` based on existing `netlify.toml`. Existing Netlify secrets / identity settings are not included in this ZIP and should remain configured in Netlify.


**RC3 update:** PDF-derived sample page images and legacy page-image viewer have been removed from the distributable ZIP. Native text Mock Exams and optional sample listening audio remain.
