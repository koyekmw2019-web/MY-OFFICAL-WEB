STUDYING WITH YE KUN — Combined Mobile UI Update / PREVIEW CANDIDATE v1
Date: 2026-11-14 (Asia/Tokyo)
GitHub repository: koyekmw2019-web/MY-OFFICAL-WEB
Verified current MAIN base commit: 3d85eba2758031530ddefcd611068d4ba03a2ce7

Boss ကြီး — ဒီ ZIP က UI Patch ပါ။ Full Website Source ZIP မဟုတ်ပါ။
လက်ရှိ Website folder တစ်ခုလုံးကို ZIP နဲ့ အစားမထိုးပါနဲ့။

FEATURES (combined in this single patch)
1) Mobile Home: reduce whitespace between fixed header and founder hero card.
2) Mobile Exam Center + dedicated exams: reduce excessive top whitespace.
3) Hamburger JLPT: match neighbor menu press/hover feedback; on mobile,
   use smooth scrolling for long-distance JLPT section links unless reduced motion is requested.
4) Header Language: preserve three existing Myanmar/English/Japanese buttons,
   show them as one dropdown on homepage/exam and login routes. Dashboard already
   has a dropdown; Video already has a native language select. Existing language
   translation logic is reused, not replaced.
5) Theme toggle beside Language: Sun (light) / Moon (dark), Dark default;
   opt-in Premium White + Light Gray + Crimson Red theme.
   Theme preference stored in localStorage key yk_ui_theme; no server calls.

EXACT CODE FILES (9)
- package.json
- assets/yk-mobile-nav.css
- assets/yk-ui-preferences.css
- assets/yk-ui-preferences.js
- scripts/build-mobile-ui-polish.mjs
- scripts/build-ui-preferences.mjs
- tests/mobile-ui-polish.mjs
- tests/ui-preferences.mjs
- tests/ui-preferences.runtime.mjs

SAFE INSTALL (GitHub Desktop)
1. Fetch Origin on main; confirm main still 3d85eba2... before applying.
2. Create NEW local branch from main: feature/mobile-ui-theme-lang-v1
3. Copy only the 9 code files above into their matching folders.
   Do NOT delete/replace existing folder, source HTML, functions or SQL files.
4. In Changes, confirm exactly 9 paths from the list above.
   If main changed since the baseline, COMPARE package.json before replacing;
   never overwrite newer scripts blindly.
5. Test on full source tree: npm test && npm run build.
6. Commit to feature branch; Push Origin; open a new DRAFT PR against main.
   Do not reuse PR #5 or RC PR #4.
7. Test Netlify Deploy Preview on a real phone at 360/390/430/720px and desktop.
   Test all 3 languages, theme persistence, page transitions, Exam and Login/Logout.
8. Do not Merge/Deploy to Production before separate approval.

BUILD DESIGN
- npm test/npm run build commands preserved unchanged.
- Appends tests to existing posttest and deploy-only HTML/CSS/JS injection to postbuild.
- Source HTML, database schema, YKCR, Authentication, Payment, Exam Start/scoring
  and current mobile menu routing are NOT changed by this patch.
- Build fails closed if expected JLPT HTML signature changed.

QA CAVEAT
- JS syntax, source checks, 42-page synthetic fixture build/injection,
  isolated DOM runtime simulation and CSS parsing PASS.
- Real full-repository npm test/build, Netlify Deploy Preview, touch/device
  QA and payment/YKCR exam end-to-end remain NOT tested.
- Real Chromium/browser tool did not finish; do NOT call this "browser QA PASS".
- This remains a PREVIEW CANDIDATE; not a verified stable release.
