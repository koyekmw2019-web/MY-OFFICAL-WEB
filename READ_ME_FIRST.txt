STUDYING WITH YE KUN — v7.87.5 Build Fix 01

WHY BUILD FAILED
Old tests/ui-preferences.mjs asserted the language/theme commands must be the FINAL
commands in postbuild and posttest. v7.87.5 appended Page Transition tests after
them, so the tests failed with ERR_ASSERTION even when language/theme worked.

WHAT THIS PATCH CHANGES
One file ONLY: tests/ui-preferences.mjs
Two regex lines accept the same exact language/theme command followed by either
" && " or the end of script. Existing safety and source assertions are intact.

HOW TO APPLY
1. In GitHub Desktop, Fetch Origin. The failed main commit is c90320d1...
2. Create a new branch FROM current main: fix/v7875-ui-preferences-test-guard
3. Copy tests/ui-preferences.mjs into the existing repo/tests/ directory.
4. In GitHub Desktop Changes verify EXACTLY 1 modified code file.
5. Run npm test and npm run build from the full repo. Both must PASS.
6. Push the FIX branch and create a Draft PR; run Netlify Deploy Preview.
7. Do not Merge to main or touch production until QA is approved.

IMPORTANT
This is an incremental patch, NOT the full website ZIP.
Do not delete or overwrite other folders. Do not replace package.json.
The localized/source/22-page tests were run; the full website build and real
Netlify deploy have NOT yet been executed for this fix.
