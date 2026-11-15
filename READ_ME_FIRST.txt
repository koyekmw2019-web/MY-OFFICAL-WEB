STUDYING WITH YE KUN — v7.87.6 JLPT Mobile Tabs / Grammar Card Fix 04
=======================================================================

This is a small QA PATCH, not a full website. It is the next patch AFTER
v7.87.6 JLPT Mobile Fix 03. It does not need Python or a .bat file.

WHY THIS PATCH?
The Fix 03 mobile tabs are in a horizontally scrolling row. On narrow phones
Reading gets partly clipped and the native horizontal scrollbar is visible.
This patch uses a compact two-row 4+3 grid instead, so ALL SEVEN tabs show.
It also makes the empty padding area of an already-linked Grammar Card clickable
and adds a visual "Pattern Detail ↗" link indication.

COMPATIBILITY (READ FIRST)
- Verified against GitHub main commit 620dde8982061c82b0baadc482426d68d5b66f1f.
- Exact expected original blob for scripts/build-page-transitions-v7875.mjs:
  f254a0663ab39147c046de5d4e2071ca6694fa74
- Only apply if you still have the Fix 03 scripts and assets present.
- If your GitHub main has changed, compare files and do not blindly replace.

TO APPLY IN GITHUB DESKTOP (QA FIRST)
1. Fetch/Pull main, then CREATE a new QA branch:
   qa/v7.87.6-tabs-fix04
2. Extract this ZIP into the project root (where package.json is).
3. GitHub Desktop Changes MUST show only:
   MODIFIED scripts/build-page-transitions-v7875.mjs
   ADDED    scripts/build-v7876-jlpt-tabs-fix04.mjs
   ADDED    assets/yk88-jlpt-tabs-fix04.css
   ADDED    assets/yk88-jlpt-tabs-fix04.js
   ADDED    tests/v7876-tabs-fix04.mjs
   (README, manifest, QA report are optional docs.)
4. Run the tests:
   npm test
   npm run build
   node tests/v7876-deployed-output.mjs
   node tests/v7876-mobile-repair.mjs --release
   node tests/v7876-tabs-fix04.mjs --release
5. Commit and push QA BRANCH only, open Draft PR to main.
6. Check a Netlify Deploy Preview on a real phone:
   - tabs fully visible; no cropped Reading label / horizontal scrollbar
   - tap every tab, switch Grammar, press Pattern Detail and card padding
   - Bookmark / Mark Learned remain independent
   - check widths 320, 360, 390, 430 pixels, and dark/light settings
   - verify bottom navigation and Explore Lessons anchor position
7. DO NOT merge to main or release to Production until confirmed.

COMMIT SUMMARY
Fix v7.87.6 mobile JLPT tabs and grammar card navigation

No SQL / Netlify functions / YKCR / exam scoring / payments / login changes.
