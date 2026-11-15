STUDYING WITH YE KUN — v7.87.5 Native Smooth Transition Fix 02
==============================================================
IMPORTANT: PATCH ZIP, NOT A FULL WEBSITE ZIP.
Base GitHub main: c842bdde5bb590ac3bb9ad44e87d769b003563c2
Base release label: v7.87.5. Core package.json still 7.87.4 due legacy compatibility assertions.

WHAT CHANGED
- Removes horizontal movement of entire screen when navigating to Exam / Video / Account.
- Separately snapshots the existing header and five-tab bottom nav so they stay visually anchored.
- Soft content fade; dark/light-color canvas prevents a white/black flash behind transitions.
- Supports reduced-motion fallback, default browser navigation on unsupported browsers.
- CSS cache bust: ?v=7875native2.

GITHUB DESKTOP (DO NOT CHANGE PRODUCTION WITHOUT APPROVAL)
1. Fetch Origin. Confirm main baseline matches the SHA shown above before replacing files.
2. Create NEW branch: fix/v7875-native-transition-02
3. Extract ZIP; overwrite ONLY these THREE code files, preserving folders:
   assets/yk-page-transitions-v7875.css
   scripts/build-page-transitions-v7875.mjs
   tests/v7875-page-transitions.mjs
   Other files in the ZIP are documentation only.
4. In GitHub Desktop Changes confirm 3 modified code files. Do not replace project folder.
5. Run locally from complete repository:
   npm test
   npm run build
   If either fails, DO NOT MERGE, and share the first full error in the log.
6. Commit to the new branch, Push Origin, open DRAFT Pull Request.
7. On Netlify Deploy Preview, test Home -> Exam -> Video -> Account -> Home
   at 360px and 390px, black and white themes; check Android Chrome / Samsung Internet.
   Check hamburger-menu navigation, screen flashing, five-tab bar, Login, Exam Start,
   Back button, existing exam auto-save, and motion-reduced setting.
8. Merge to main/production ONLY after explicit approval and full QA.

BUILD FIX 01
GitHub main already contains the Build Fix 01 change to tests/ui-preferences.mjs.
This ZIP does NOT revert or replace that file or change package.json scripts.

KNOWN LIMITATION
Cross-document View Transitions are not available in all browsers. Without support,
normal links work with standard navigation; this patch cannot guarantee a native SPA transition.

No backend, Netlify Functions, database migrations, SQL, YKCR, payment, login, exam timer,
or scoring logic files are changed by this patch.
