STUDYING WITH YE KUN — Official Website
Update Version: v7.87.5 — Mobile Page Transition (PREVIEW CANDIDATE)

Boss ကြီး၊ ဒီ ZIP က Website တစ်ခုလုံးမဟုတ်ဘဲ UI-only PATCH ဖြစ်ပါတယ်။
Do NOT delete or replace your whole repository. Do NOT deploy directly to production.

BASE SOURCE
- GitHub repository: koyekmw2019-web/MY-OFFICAL-WEB
- Verified main HEAD: edf4dd91b89c3908e15338e369d5ea1324ba75d6
- Previous ZIP: YEKUN_Official_Website_v7.87.5-rc1_Mobile_UI_Fix.zip
- Previous archive and current GitHub files cross-checked (7/7 paths matched).
- This ZIP's release label: 7.87.5. package.json's existing core version remains
  7.87.4 because several old repository source tests explicitly assert that value.
  The release version is recorded in PATCH_MANIFEST.json.

CHANGED / ADDED CODE FILES (exactly 5)
  package.json                                [MODIFY - postbuild & posttest only]
  assets/yk-page-transitions-v7875.css       [ADD]
  scripts/build-page-transitions-v7875.mjs   [ADD]
  tests/v7875-page-transitions.mjs           [ADD]
  tests/v7875-browser-smoke.py              [ADD - optional local browser QA]

WHAT THIS PATCH DOES
- Add 170–250 ms native CSS View Transitions for same-origin navigation
  Home ↔ Exam Center ↔ Video Course ↔ Account/Dashboards on mobile <=720px.
- Keep the bottom menu steady while a new page loads.
- Use original <a href> navigation; never intercept or delay clicks.
- Existing Home/Study same-page scroll remains unchanged.
- Exclude login form and individual timed exam pages from cross-page transition.
- Disable effects for prefers-reduced-motion and desktop.
- Unsupported browsers keep normal, usable page navigation.

GITHUB DESKTOP WORKFLOW (NO PRODUCTION MERGE)
1. GitHub Desktop: select main, Fetch origin; confirm HEAD SHA above.
   If main HEAD changed, stop and compare changes before replacing package.json.
2. Create branch: feature/mobile-page-transition-v7875
3. Extract ZIP. Copy the 5 code files into the matching repo paths.
   DO NOT copy these README/QA files over any critical project files.
4. GitHub Desktop should show 1 modified (package.json), 4 added code files.
5. Run npm test and npm run build from the COMPLETE ORIGINAL REPOSITORY.
6. Commit, push feature branch and open a NEW Draft Pull Request.
7. Open Netlify Deploy Preview and manually test the phone navigation.
8. Only consider merge after successful Preview, Login/Payment/YKCR isolation checks,
   and Boss approval. Never use this ZIP alone as a complete Netlify deploy.

IMPORTANT
- This workspace could NOT clone the entire GitHub repository: internet git
  access was blocked; full npm test/build were not run here.
- The local Chromium browser was blocked from localhost by enterprise policy:
  full visual transition was NOT validated and needs Netlify Preview/mobile QA.
- This patch does NOT touch auth, payments, Netlify Functions, YKCR,
  SQL migrations, exam attempts, timer, scoring, or active exam sessions.
