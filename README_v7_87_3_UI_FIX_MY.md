# YE KUN Official Website — v7.87.3 Education Branding / Mobile Exam UI Patch

**BASE:** latest confirmed GitHub `main` version **v7.87.2** (DO NOT apply to older versions).
**Scope:** deploy-only UI and build transformation. No Netlify backend/DB changes. Production NOT deployed by creating this ZIP.

## Fixes
1. `login.html` (deployed `dist`): removes the invented `YK.` text logo; displays the actual existing `/yk-192.png` symbol and the education wordmark **STUDYING WITH YE KUN**. Same on the login header.
2. Create Account result: the status notification remains inside an enlarged, scrollable visible auth layout. Mobile auth stage grows naturally. Existing Netlify Identity registration/login code remains untouched.
3. `/exams/{type}.html` (12 routes): changes the header/menu branding from `YE KUN` to **STUDYING WITH YE KUN**. Original YK icon remains the existing, approved image asset.
4. Removes unrelated **JLPT N1–N5 直前対策** section and its two practice scripts from ALL 12 standalone exam pages. JLPT drills remain in the normal `/mock-exams.html` center: no content deletion from source.
5. Single-exam CSS: Crimson + black/white styling; fixes legacy `exam-card-top-v742` grid reserving a book-cover column even though the image was hidden, cramped text, cyan glow, and excessive empty card height. Creates legible responsive cards and button spacing.
6. The original exam engine, access server calls, login, payment, student verification, YKCR, timer, auto-save/resume, scoring and result calculation are unchanged.

## Update Steps — GitHub Desktop
1. Open existing `MY-OFFICAL-WEB` repository, select `main`, **Fetch origin → Pull origin**. Check `package.json` version is `7.87.2` before copying.
2. Extract this ZIP and paste its `assets/`, `scripts/`, `tests/`, `package.json`, and README into **repository root**. Choose Replace for matching files. Keep `.git` folder and all other existing files.
3. Safer: create temporary test branch in GitHub Desktop and commit + push to Netlify Deploy Preview, instead of pushing directly to production.
4. Netlify build `npm run build` should run v7.87.2 builder then `build-v7873-ui-fix.mjs` and v7.87.3 release QA.
5. Test login account creation notice, 12 direct exam URLs, Student Verified state, Free Attempt/Payment gate, Timer, Resume, Result, phone layout. Only then merge/test branch into `main`.

## Verification notes
- Check generated `dist/login.html`, `dist/exams/truck.html`, `dist/exams/jlpt_n5.html`; v7.87.3 content is generated at build time, not stored in root source HTML.
- Original v7.87.2 12-page routing structure and source remain intact.
- Do not upload `dist/` or overwrite `netlify/functions`/migrations.
- No PDF added; this ZIP contains patch files only.
- This package has static tests. Full Netlify Build and live end-to-end login/payment/SSW exam tests are NOT claimed until Deploy Preview is checked.
