STUDYING WITH YE KUN — PR #4 / v7.88.1-rc.1
Netlify QA-only proposed repair — 2026-11-13

CAUSE (based on code inspection; exact SyntaxError log preceding line 138 still should be checked):
 tests/v774-release-smoke.mjs line 52 uses vm.Script for EVERY assets/*.js.
 New v7.87.14+ grammar JS are browser ESM modules with import/export.
 vm.Script rejects module syntax even when it is valid.

CONTENTS:
 patch-v7881-v774-esm-check.mjs

APPLY (only on QA branch release/v7.88.1-rc1-qa, not main):
 1. Make a repository backup.
 2. Extract this ZIP OUTSIDE the repository folder.
 3. Copy patch-v7881-v774-esm-check.mjs to the repository ROOT, beside package.json.
 4. In Command Prompt opened at the repository ROOT, with Node.js available, run:
       node patch-v7881-v774-esm-check.mjs
 5. Test:
       node tests/v774-release-smoke.mjs --release
       npm run build
 6. Confirm only the intended QA test is changed (plus the helper script, which you can remove afterward).
 7. Only after reviewing the diff, commit/publish the QA branch and inspect Netlify Preview logs.
 8. DO NOT MERGE PR #4 TO MAIN. Passing this test alone does not certify v7.88.1 as stable.

NOTES:
 - If the initial real log reports a DIFFERENT SyntaxError or different file, stop and review.
 - This script checks ES modules using Node's syntax-only --check, while retaining vm.Script for classic JS.
 - Source code, Payment/YKCR/Identity and production Database are NOT modified by this helper.
 - If another test fails, capture its precise first ERROR line before making further changes.
 - Do not use genuine customer/payment data for testing.
