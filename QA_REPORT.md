# STUDYING WITH YE KUN — v7.87.5 Page Transition QA

**Status: PREVIEW CANDIDATE, NOT STABLE**  
**Scope:** Mobile app-like cross-document animations between the 7 listed public/role-router pages.  
**Production:** No GitHub push, merge or Netlify deploy performed by this patch.  
**Baseline:** `main` `edf4dd91b89c3908e15338e369d5ea1324ba75d6`.

## Root cause and solution

The current `assets/yk-mobile-nav.js` updates the active tab from the URL but uses native links when travelling to separate HTML documents. Those documents are loaded as full pages, so their transition looks abrupt even though `/#home` → `/#study-hub` in-page scrolling looks smooth.

The v7.87.5 change uses modern CSS cross-document View Transitions. Both pages must opt-in, stay on the same origin, and be supported by the user's browser. It animates the root with a short 170ms outgoing / 250ms incoming fade-and-slide and keeps the 5-tab bar as a named transition element. There are **no JS route interceptors or artificial loading delays**. Original navigation is the fallback in older browsers.

### Pages included

`index.html`, `mock-exams.html`, `video-class.html`, `dashboard.html`, `admin-dashboard.html`, `student-dashboard.html`, `member-dashboard.html`. All others, including `login.html` and individual timed `exams/*.html`, remain outside the transition set.

### Before/after details

- Home/Study in-page scroll: **unchanged**.
- Home ↔ Exam Center / Video / Account: **opt-in to animated same-origin navigation** on mobile (720px or less) when the browser supports the API.
- Bottom tabbar: named transition snapshot for continuity; all 5 links untouched.
- Desktop / prefers-reduced-motion: no effect.
- Light/dark theme: existing prepaint theme init and CSS remain unchanged.
- Login / Payment / YKCR / Exam logic and migrations: no modifications included.

## Previous ZIP ↔ GitHub comparison

Previous reference: `YEKUN_Official_Website_v7.87.5-rc1_Mobile_UI_Fix.zip` + older `YEKUN_Main_UI_Refresh_Language_Theme_Preview_v1.zip` for package.json. Checked against GitHub `main` on November 15, 2026:

**7/7 byte-level Git blob SHA matches** — 6 RC1 code paths (`scripts/build-mobile-ui-polish.mjs`, `assets/yk-v7875-rc1-ui.css`, `assets/yk-v7875-rc1-ui.js`, `tests/v7875-mobile-fix.mjs`, `tests/v7875-runtime.mjs`, `tests/v7875-browser-smoke.py`) + the older ZIP's `package.json`.

The previous release's injected spacing fixes, JLPT animation, language dropdown and theme remain in the repository; this additive patch does not overwrite them.

## Tests performed

| Test | Result |
|---|---|
| Previous ZIP versus GitHub main SHA comparison | **PASS (7/7)** |
| JavaScript syntax (`node --check`) | **PASS** |
| New source guard test (`node tests/v7875-page-transitions.mjs`) | **PASS** |
| CSS parse using tinycss2 | **PASS** |
| Generated fixture injection into seven expected pages | **PASS** |
| Generated fixture HTML, route and preservation tests (`--release`) | **PASS** |
| Real Chrome transitions | **NOT TESTED** — local Chromium blocked localhost via managed `URLBlocklist` policy |
| Full ORIGINAL repository `npm test`, `npm run build` | **NOT TESTED** — full repository source unavailable in container |
| Netlify Deploy Preview, Android/iOS UX | **NOT TESTED** — needs feature-branch deployment and user QA |
| Production Login / Payment / YKCR E2E | **NOT TESTED** — avoid live data writes |

The locally generated HTML files were deliberately **synthetic fixtures, not the full original repository output**. Source injection tests cannot certify the full production build or browser experience.

## Compatibility warnings

1. **`package.json` core version remains `7.87.4`**; repository legacy tests explicitly pin it (including `tests/v7874-source.mjs` and earlier v7.87 tests). The **update release** is named `7.87.5` in the filename and `PATCH_MANIFEST.json`. Avoid changing the legacy package version without updating all pinned tests.
2. The `postbuild` chain appends the new injection after `build-ui-preferences.mjs`; this preserves the earlier RC1 spacing and JLPT patch, and the language/theme builder. One source file is updated (`package.json`) and 4 are added.
3. **Cross-document transition support is browser dependent**. The browser skips transitions when navigating to an excluded route, crossing origins, navigating via browser UI, handling redirects, or loading too slowly. The underlying links still work normally.
4. The bottom menu is hidden while an exam is active or a modal is open by existing code. This patch does not change the hiding logic.
5. Recheck the verified GitHub base SHA before applying the package; do not blindly overwrite `package.json` if main changed.

## Manual QA before merge

- From mobile Home: tap **Exam**, then **Video**, then **Home**; observe fade-and-slide without blank flashes.
- From Video: tap **Study** (home section), **Account**, then back; active highlights and URLs correct.
- Check both Dark and Light themes, especially switching then navigating to another page.
- Check 360/390/430/720px phones and desktop >720px.
- Check Android Chrome/Samsung Internet and iPhone Safari if possible; verify `prefers-reduced-motion` disables the effect.
- Enter an exam only with a safe test account/environment; ensure active exam timer, answer progress, resume and payments are unaffected.
- Keep the PR in Draft until full npm test/build, Netlify Preview and user acceptance succeed.

Reference: [MDN `@view-transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition) and [Chrome cross-document View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document).
