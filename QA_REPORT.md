# QA REPORT — STUDYING WITH YE KUN UI Fix05.3

**Package:** v7.87.6 UI Fix05.3 · Replacement patch, QA only  
**Reference baseline:** GitHub Fix04 main SHA `010fe4d6c5f108654c17826551ba648092dca96d`  
**Release decision:** **NO-GO** pending full repository build and real-phone authorized Preview.

## Regression / user screenshots

1. Fix05.2 CTA became a narrow vertical button aligned to the right of the student/teacher images: previous `width:100%` did not overcome mobile `.yk821-hub-open {flex:1}`.
2. Dedicated Exam page shows an unnecessary long subtitle above Guest Access, pushing the Access card below the first mobile screen.

## Implemented corrections

- Change mobile CTA flex-item layout to `flex:0 0 100% !important; order:3` within the original wrapped flex container; center the original link's label; enforce single-line no arrow with responsive font size. Keep navigation destination and text mappings for MY/EN/JP.
- Retain compact gap between View More and JLPT card from Fix05.2; no removal of View More.
- In **generated `dist/mock-exams.html` only**, remove one verified `exam-v728-subtitle` paragraph directly above `.exam-hub`. Keep Access guide, Student Verify, Login/View Plans and exams intact; adjust container spacing via scoped CSS.
- Preserve earlier Fix05 Learning and Grammar Detail styles and non-invasive action-bar script.
- Versions of CSS and detail JS cache-busted to `v=7876ui053`. Critical CSS embedded in generated Home as a failsafe against stale linked CSS.

## Tests executed in isolated QA working folder

- `node --check` on the modified build scripts and UI JS: **PASS**.
- `node tests/v7876-ui-fix05.mjs`: **PASS**. Four-route injection, localized labels, title/Access control preservation, duplicate-injection guard, unexpected Home/Exam anchor change guards; no partial file writes after failed validation.
- `python tests/v7876-ui-fix05-browser-smoke.py`: **PASS** on synthetic Chromium fixture, at **320, 360, 390, 430, 720 px**. Three languages for CTA at each width: text exactly one line, visually centered, no overflow. Original mobile `flex:1` competition reproduced in fixture. Exam Access directly under title, controls retained; Grammar action bar same row.
- Package CRC and SHA-256 manifest: check on ZIP creation.

## NOT performed / limitations

No full original repository checkout available in this working directory. Thus **no complete-site `npm test`, `npm run build`, Netlify preview, Samsung phone screenshot/interaction, login, student-verification, exam attempt, payment, database, or YKCR E2E checks** were performed. All such tests are required before calling it stable.

## Change boundary

No GitHub branch/push/commit, merge, live deploy, database migrations, exam logic, payment logic, authorization, YKCR, or student records were modified. This ZIP only prepares local source patch files.
