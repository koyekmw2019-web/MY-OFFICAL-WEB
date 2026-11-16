# STUDYING WITH YE KUN — v7.87.6 UI Fix05.3 (QA Patch)

**Purpose:** Correct the failed Fix05.2 CTA layout and shorten the dedicated Exam page. This is a *replacement incremental patch* for existing v7.87.6 Fix04. It is **not the complete website**, is **not deployed**, and is **not production-approved**.

## Verified baseline and scope

- Repo: `koyekmw2019-web/MY-OFFICAL-WEB`
- Reference main Fix04 commit: `010fe4d6c5f108654c17826551ba648092dca96d`
- Existing Fix04 builder SHA: `660804e12c526830d682873bac74f9a34d65bc94`.
- This package replaces **all Fix05 / Fix05.1 / Fix05.2 files**, retaining previous Fix05 JLPT Learning and Grammar Detail UI additions.

### Home, Study tab (the reported screenshot)

1. Keep View More, JLPT card, student/teacher images, countdown and bottom navigation intact.
2. CTA remains `<a href="/study/jlpt-learning.html">` with no arrow; correct labels:
   - Myanmar: **သင်ခန်းစာအားလုံးဖွင့်ရန်**
   - English: **Open All Lessons**
   - Japanese: **すべてのレッスンを開く**
3. **Root cause fixed:** original mobile `.yk821-hub-open { flex:1 }` narrowed the button next to the student/teacher images despite `width:100%`. Fix05.3 applies `flex:0 0 100%` (whole flex row), then centers and keeps the text on one line. Avoid `overflow-wrap:anywhere` and the previous overly broad normal wrapping.
4. Reduce accumulated mobile gap only at the View More ↔ JLPT card boundary.

### Dedicated Exam page (`mock-exams.html`)

1. Remove the redundant `<p class="exam-v728-subtitle">` directly under `ONLINE EXAM CENTER / STUDYING WITH YE KUN · စာမေးပွဲစင်တာ`.
2. The existing Guest Access card, Student Verify, View Plans, Login, exam controls, and helpful guest guide **remain present and functional by original logic**. No changes to pricing or access rules.
3. Tighten the space above the Access container, especially on mobile.

### Separate JLPT Learning and Grammar Detail pages

Maintain Fix05's hidden redundant top pills, full-width Learning hero placement, and the three equal-width Bookmark / Learned / Back buttons. No JS callback, lesson, saved-state or progress code changed.

## QA installation — NOT on `main`

1. In GitHub Desktop, create or use an isolated QA branch based on **verified Fix04**. Stop if the baseline differs; review the diff first.
2. Unzip this patch to the repository root (`package.json` directory), keeping `scripts/`, `assets/`, `tests/` paths. Overwrite the same filenames from **Fix05 / Fix05.1 / Fix05.2** if they are present. Do not apply multiple Fix05 ZIPs together; this ZIP is a full replacement of those patches.
3. The file `scripts/build-page-transitions-v7875.mjs` imports `build-v7876-jlpt-ui-fix05.mjs` **exactly once**, after Fix04. Generated `dist/` output is rewritten only after the normal rebuild. Never hand-patch already-published files.
4. Local checks (from repo root):

```bash
node --check scripts/build-page-transitions-v7875.mjs
node --check scripts/build-v7876-jlpt-ui-fix05.mjs
node --check assets/yk88-jlpt-ui-fix05.js
node tests/v7876-ui-fix05.mjs
python tests/v7876-ui-fix05-browser-smoke.py  # optional: requires playwright & local Chromium
npm test
npm run build
node tests/v7876-tabs-fix04.mjs --release
node tests/v7876-ui-fix05.mjs --release
```

5. On an **authorized non-production preview**, confirm actual Android/Samsung phone: CTA one full horizontal row and exactly one line in all MY/EN/JP languages, no arrows or side scroll; View More and images intact; Exam page Access visible immediately below title; Student Verify and View Plans links unchanged; Grammar Detail buttons/actions intact.
6. Only with separate explicit approval proceed with GitHub commit, push, merge to `main`, or Netlify Production deploy. **None were performed in this package.**

## Fail-closed baseline guards

The injector refuses to proceed if the expected Fix04 Home CTA, Exam section/Access, JLPT Tabs, Grammar Detail, or existing localization anchors change, or if the patch was already injected. All target HTML pages are validated before any generated HTML is modified. Only `dist/index.html`, `dist/mock-exams.html`, `dist/study/jlpt-learning.html`, and `dist/study/jlpt-grammar-detail.html` are written by the injector.

## Known testing limits and rollback

Source/fixture checks and synthetic Chromium passed at 320/360/390/430/720px; the browser fixture reproduces the original mobile `flex:1` rule. **Full repository tests/build, actual connected site, real phone and authenticated payment/exam flow remain unverified. Release status: NO-GO / QA only.**

If this patch fails QA, restore Fix04 builder file, remove the Fix05 additions from the QA branch, and rebuild clean. Do not modify production or student data to roll back a presentation-only patch.
