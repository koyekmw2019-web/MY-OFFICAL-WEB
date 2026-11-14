# STUDYING WITH YE KUN — Combined UI Preview v1 QA Report

**Status: PREVIEW CANDIDATE ONLY — NOT Production Stable**  
**Date:** 2026-11-14  
**Baseline:** `koyekmw2019-web/MY-OFFICAL-WEB` `main` at `3d85eba2758031530ddefcd611068d4ba03a2ce7` (independently checked).  
**Current production:** unchanged by this work. GitHub push, PR creation, deploy and merge **not performed**.

## Scope and design intent

- Mobile Home: compact the whitespace between fixed header and first hero card.
- Mobile Exam: compact the whitespace above `#online-mock-exam`, without changing exam engine.
- JLPT Hamburger: fix distant scrolling on mobile while honoring reduced-motion preference; add matching menu press feedback.
- Language selection: wrap original 3 buttons in a dropdown on the home/exam and login header; leave Dashboard's existing dropdown and Video's existing native select intact. **Do not implement a new translation engine.**
- Theme: Dark default. Light is white/light-gray background and white panels, crimson active controls, sun/moon toggle next to language and local preference persistence (`yk_ui_theme`).
- Script and CSS assets are included in all published HTML pages during `postbuild`, preserving the current source HTML files unchanged.

## Baseline and constraints

Verified `main` commit `3d85eba2`. Original source `index.html` and current `scripts/build-public-v7841.mjs` were inspected through GitHub. The latter automatically copies all non-legacy `assets/*` into `dist`, so these new UI assets are included prior to postbuild injection. Existing `postbuild` / `posttest` remain in place, and their new steps are appended.

**Code paths added/changed: 9**. No `netlify/functions/**`, `netlify/database/**`, SQL migrations, login backend, payment backend, YKCR backend, exam scoring, exam access, exam attempts, or original HTML source files are contained in the patch. No changes made to GitHub or Netlify.

## Verification carried out

| Test | Result | What it proves |
|---|---|---|
| JS syntax checking (`node --check`) | PASS | Three newly authored JS files and test scripts have valid syntax |
| Mobile spacing source guards | PASS | Scope is CSS and one exact JLPT scroll signature |
| UI Preferences source guards | PASS | No API/network/auth/backend operations in preference injection |
| Isolated DOM runtime simulation | PASS | Original language options reused; dropdown open/close and theme toggle/storage work in mock DOM |
| CSS parsing with `tinycss2` | PASS | CSS syntax has no parse errors (not a visual contrast test) |
| Synthetic build of 42 HTML pages | PASS | Old nav injection, spacing builder, preference builder and release tests all complete |
| Synthetic built Home / Exam / Video / Login / Dashboard / study pages | PASS | New assets injected once, original nav paths preserved and key DOM signatures retained |
| Existing 5-tab navigation unit and routing test on synthetic fixture | PASS | Existing mobile nav simulated logic remains intact |
| Live full source `npm test` and `npm run build` | **NOT RUN** | Full source archive not locally obtainable |
| Real Chromium / mobile touch / keyboard / screenshots | **NOT VERIFIED** | Browser process did not finish, so no browser PASS claim |
| Netlify Deploy Preview and production | **NOT RUN** | No connected GitHub changes, PR or deployment performed |
| Payment / YKCR / Login / Exam end-to-end | **NOT RUN** | These workflows require separately isolated safe QA |

## Known UI limitations / risk to check

- Theme overrides cover key pages/cards and use existing text/image layouts, but many legacy components use hardcoded dark colors; **light-theme contrast must be checked visually across actual pages**, including exam questions, JLPT study content, receipt dialogs and admin dashboards.
- Existing language translation behavior and persistence are reused; do not assume every legacy page translates every string.
- On mobile, an opening language dropdown must not be hidden under the sticky header, and menus must retain safe-area and keyboard behavior.
- The light theme keeps video-image hero titles white and intentionally leaves high-contrast exam overlays unchanged, instead of overriding the exam engine UI.
- `localStorage` may be blocked by user/privacy settings; in that case theme will safely fall back to Dark.
- If the current `main` or `package.json` differs from baseline, **do not overwrite** without comparing.

## Required acceptance tests before merge

1. Full `npm test` + `npm run build` run on the exact current repository and Netlify Deploy Preview Build success.
2. Real mobile (Android/iOS) 360, 390, 430 and 720px plus desktop: Home/Exam spacing and no overlap with fixed header.
3. Hamburger JLPT, regular menu scroll and reduced motion; verify correct destinations and selected active states.
4. Language selection Myanmar/English/Japanese on Home, Exam and Login, plus Video and Dashboard controls; confirm no login-loop/session break.
5. Dark → Light → navigate across Home, Study, Exam, Video, Account → reload → Dark. Verify button readability and visual contrast throughout.
6. Verify bottom nav, hamburger modal, logout, keyboard, exam panel/fullscreen hidden rules remain unchanged.
7. Isolated/test-only Payment / YKCR / Exam permissions end-to-end where available; no production data writes.
8. Explicit Boss ကြီး approval **after** preview QA, before merge.
