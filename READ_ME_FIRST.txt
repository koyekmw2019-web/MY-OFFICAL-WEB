STUDYING WITH YE KUN - v7.87.6 JLPT UX + GRAMMAR DETAIL
=========================================================
IMPORTANT: THIS VERSION FIXES THE PREVIOUS ZIP THAT DID NOT CHANGE THE UI.

WHY NOTHING CHANGED BEFORE:
  The previous ZIP copied new CSS / JS / JSON files, but did NOT edit the 3
  existing pages. The apply script was not run. Netlify therefore kept showing
  the old website even though its build succeeded.

THIS ZIP REQUIRES ONE DOUBLE-CLICK. NO MANUAL COMMANDS TO APPLY THE PATCH.

Step 1: Open GitHub Desktop. Fetch/Pull main FIRST.
Step 2: Create NEW branch from main:
        qa/v7.87.6-jlpt-oneclick
        (DO NOT work on main.)
Step 3: Extract this ZIP INTO YOUR REPOSITORY ROOT (same folder as index.html
        and package.json). Keep folder structure. Do NOT extract into a nested
        YEKUN_v... subfolder.
Step 4: Double-click:
        START_HERE_APPLY_V7876.bat
Step 5: The window MUST show:
        UPDATED: index.html
        UPDATED: study/jlpt-learning.html
        UPDATED: assets/yk-jlpt-learning-v782-page.js
        PASS: UI patch applied.
        PASS QA: ... 30 detail lessons, 90 trilingual examples
Step 6: Before commit, run from your repository terminal:
        npm test
        npm run build
Step 7: On PASS, commit/push QA branch; open Draft PR and check Netlify Deploy
        Preview on a real mobile device. DO NOT MERGE TO MAIN UNTIL APPROVED.

Features: one learning CTA, Myanmar sublabels, remove hero images at top of JLPT
page, guest instructions and one free attempt, compact plans, proper scroll
anchor and horizontal mobile lesson tabs, Grammar card -> dedicated detail page, 3 examples each in Japanese,
Myanmar, English without MY/EN labels. Uses existing STUDYING WITH YE KUN logo.

Notes:
- If the batch file says you are on main, this is protection, not an error.
  Switch to QA branch, then double-click again.
- If it says index.html is missing, you extracted into the wrong folder.
- If Python is missing, install Python 3, then double-click again.
- Existing Grammar translation content is an editorial draft. QA browser and
  human Japanese/Myanmar proofread are still required.
- No SQL, payment endpoints, backend functions, YKCR logic, exam attempts or
  Netlify Identity files are modified by the patch script.
- package.json version remains 7.87.4 for compatibility with legacy build tests;
  this UI release is labeled v7.87.6 in the ZIP and QA Report.
- This is a PATCH, not an entire website. The patch needs existing source.
