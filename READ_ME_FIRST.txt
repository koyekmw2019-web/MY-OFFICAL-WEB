STUDYING WITH YE KUN OFFICIAL WEBSITE
v7.87.6 — AUTO BUILD ACTIVATION FIX

WHAT WENT WRONG
The previous ZIP added new CSS/JS files but did not actually modify published
HTML and lesson-page navigation. The site therefore continued to show both
"Open All Lessons" and "Start Learning".

HOW THIS ZIP WORKS
Two files in scripts/ are sufficient. During the EXISTING Netlify npm run build,
postbuild automatically modifies the GENERATED dist/ content on 15 HTML pages
and the published JLPT lesson JS. It does NOT require Python or a .bat file.

EXACT INSTALL STEPS
1. GitHub Desktop: Fetch/Pull main; make NEW QA branch:
   qa/v7.87.6-auto-build-fix
2. Extract ZIP and COPY these into matching folders in your repo:
   scripts/build-page-transitions-v7875.mjs  (REPLACE existing file)
   scripts/build-v7876-jlpt-deploy.mjs      (ADD new file)
   tests/v7876-deployed-output.mjs         (ADD QA test)
3. GitHub Desktop Changes should show exactly 1 modified script, 1 new script,
   and 1 new test. Documentation files can stay outside your repo.
4. In repo terminal run:
   npm test
   npm run build
   node tests/v7876-deployed-output.mjs
5. All must PASS. Commit on QA branch and Push Origin.
6. Create Draft PR into main to get Netlify Deploy Preview. DO NOT merge yet.
7. On Preview check Home -> Study, Guest Access, Plans, N5 Grammar Detail,
   Language selector, and mobile tabs. The old production homepage will NOT
   change until you explicitly merge approved code to main.

IMPORTANT
- Do NOT run the older START_HERE_APPLY_V7876.bat for this update.
- Do NOT copy the old one-click ZIP on top of this ZIP.
- Do NOT manually edit the 577K source index.html: build updates dist automatically.
- If your GitHub 'main' already includes this fix, do not overwrite newer code.
- This is a QA candidate: full production build and live mobile verification pending.
- No source DB/SQL/Identity/YKCR/exam scoring/payment access logic modified.
- Compatible with main source audited at Git commit:
  686c595d401aadfec57f367c72d7c74ebbb5fb8e

EXPECTED COMMIT SUMMARY
Fix v7.87.6 JLPT UI auto-activation during Netlify build
