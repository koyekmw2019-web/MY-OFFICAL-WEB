# YEKUN Official Website v7.87.6 — JLPT UX + Grammar Detail QA Patch

## Package
- Type: Incremental QA Patch ZIP
- Version: v7.87.6
- Scope: Study Hub JLPT CTA cleanup, JLPT main UX polish, Guest Access copy, compact Exam Plans modal, sticky header scroll offset, Grammar Detail Page

## Included source files
- tools/apply_jlpt_ux_patch.py
- study/jlpt-grammar-detail.html
- assets/yk88-grammar-details.json
- assets/yk88-index-ux.css
- assets/yk88-jlpt-ux.css
- assets/yk88-grammar-detail.js
- tests/yk88-jlpt-ux-qa.mjs
- APPLY_UPDATE_WINDOWS.bat
- READ_ME_FIRST.md

## Static QA checks completed in package
- Patch anchors reviewed against expected existing source: designed to safety-stop if anchors differ
- Grammar detail data records: 30 / 30 present
- Example sentence coverage: minimum 3 examples per grammar card
- Example rendering updated: no MY / EN labels before translations
- Header branding on detail page: STUDYING WITH YE KUN logo + brand header included

## Remaining manual QA before merge
1. Mobile check on Netlify Deploy Preview
2. Language switching check (MY / EN / JP)
3. Guest Access guide rendering for logged-out vs logged-in users
4. Plan selection modal visual check on phone
5. Explore Lessons anchor scrolling check
6. Grammar card → detail page navigation
7. Bookmark / Mark Learned state continuity
8. Full `npm test` and `npm run build`

## Release policy
- Do not merge directly into `main`
- Do not call Stable until Preview QA is complete and approved
