# STUDYING WITH YE KUN — v7.87.5-rc1 QA Report

**Status:** PREVIEW CANDIDATE — NOT STABLE  
**Date:** 2026-11-14  
**Baseline:** `koyekmw2019-web/MY-OFFICAL-WEB` `main` at `bf359245609c015d331d3a3715fb030d144ccf57` (verified twice).  
**Previous Source ZIP:** `YEKUN_Main_UI_Refresh_Language_Theme_Preview_v1.zip` (SHA256 `a00fa4b785ecee3ca91e8fa93ce1da6adebc062eabc0c4519b634b911f0b5a66`).

## Exact source comparison — Previous ZIP vs current GitHub

Nine previous ZIP code paths were compared by their Git object blob SHA with the current `main`:
`package.json`, `assets/yk-mobile-nav.css`, `assets/yk-ui-preferences.css`,
`assets/yk-ui-preferences.js`, `scripts/build-mobile-ui-polish.mjs`,
`scripts/build-ui-preferences.mjs`, `tests/mobile-ui-polish.mjs`,
`tests/ui-preferences.mjs`, `tests/ui-preferences.runtime.mjs`.

**9/9 MATCH.** The production `main` and the previous patch's code files are identical.
GitHub `main` was independently checked to remain `bf359245609c015d331d3a3715fb030d144ccf57` before packaging.
No source SHA conflict was found for these nine files. This comparison is not a full repository audit.

## Root cause analysis

1. **Home/Exam space:** The old stylesheet only subtracted 14px / reduced one section margin; the real vertical gap also included wrapper padding, section padding and fixed header offset. In the new patch, mobile-only CSS removes duplicate top padding without altering the header safe-area, and a small JS helper measures the final rendered header-to-content gap and limits the trim to 130px. Target visible gap: about **14px**.
2. **JLPT tap feedback:** The legacy mobile click handler immediately scrolled to the destination. Red menu feedback using `:hover/:active` was not reliably visible on touch. A capturing handler now adds a temporary class and delays the **original click handler** by 170ms only for normal mobile JLPT clicks. It does not change the link destination. Reduced-motion users bypass the delay.
3. **Cache concern:** Previous `yk-mobile-nav.css?v=2` could remain cached despite edits. The new assets have unique names with `?v=7875rc1` and are injected once per built page.

## Files delivered

| Path | Operation | Reason |
|---|---|---|
| `scripts/build-mobile-ui-polish.mjs` | MODIFY | Preserve v1 scroll replacement and inject new versioned CSS/JS into dist HTML |
| `assets/yk-v7875-rc1-ui.css` | ADD | Mobile spacing, touch-highlight CSS, reduced-motion and light theme treatment |
| `assets/yk-v7875-rc1-ui.js` | ADD | Actual element gap measurement, original JLPT click replay |
| `tests/v7875-mobile-fix.mjs` | ADD | Source and generated HTML QA |
| `tests/v7875-runtime.mjs` | ADD | Isolated click/spacing/accessibility QA |
| `tests/v7875-browser-smoke.py` | ADD | Optional local headless Chromium smoke tests |

`package.json`, old Mobile Nav CSS/JS and Language/Theme implementation are **not modified**. No backend, migrations, login, payment, YKCR or exam engine files are included.

## QA results

| Test | Result | Scope |
|---|---|---|
| Previous ZIP vs GitHub file-hash comparison | PASS | 9/9 code paths match |
| Previous source posttest | PASS | Mobile nav, UI polish, Language Dropdown / Theme |
| New JS syntax (`node --check`) | PASS | New builder, interaction JS and tests |
| New CSS parser (`tinycss2`) | PASS | Syntactic integrity (not design quality) |
| 42-page synthetic build | PASS | Old nav build + new builder + UI preferences builder |
| Legacy release fixture tests | PASS | Mobile Nav, JLPT, Exam DOM, Language and Theme retained |
| New release source tests | PASS | New assets once per built page; original paths present |
| Isolated runtime | PASS | 14px target, tap feedback, original click replay, reduced-motion |
| **Real local Chromium 360/390/430/720px** | **PASS** | Simulated Home/Exam layout, 14px gap, JLPT touch animation |
| Real local Chromium 721px | PASS | Desktop not changed |
| Real local Chromium reduced-motion | PASS | No delayed click |
| Full original repository `npm test` / `npm run build` | **NOT RUN** | Full repository archive not locally available |
| Netlify Deploy Preview (new RC) | **NOT RUN** | No push/PR/deploy performed |
| Real Android/iOS devices, production login/payment/YKCR | **NOT RUN** | Explicitly requires Preview QA / isolated backend testing |

The 42-page fixture is **synthetic**, not a full original-site build. The Chromium layout is an isolated local test page using the new CSS/JS; this does not prove the exact production layout, mobile touch/browser caching or every light-theme contrast case.

## Compatibility / release caution

- `scripts/build-public-v7841.mjs` copies new assets from the normal `assets/` tree into `dist`; the existing `postbuild` already runs `build-mobile-ui-polish.mjs` and `build-ui-preferences.mjs` afterward.
- The existing source test asserts `package.json` version `7.87.4`; **this RC's version is recorded in `PATCH_MANIFEST.json`**, and package.json is intentionally untouched. Package version bump requires separately updating pre-existing version assertions and complete regression QA.
- No existing navigation destination is modified. Only standard primary JLPT taps on mobile receive the 170ms visual feedback, using a re-fired native link click. Test in real mobile browsers before merge.
- Header trim is scoped to first-screen Home and dedicated Exam pages, skips off-screen scrolled content / active exams; visible #home anchors can be trimmed and viewport <=720px only. The JS trim is capped and avoids changes when scrolled down.
- Light Theme still needs inspection on Login, Admin/Student/Member Dashboards, Exam dialogs and learning sections.
- Because prior ZIP/GitHub mismatch would invalidate compatibility, **stop if `main` changed beyond `bf359245609c015d331d3a3715fb030d144ccf57`** before applying the files.
- This version was **not pushed or deployed**. No Stable designation until full build + Deploy Preview + real-device QA and Boss approval.

## Test evidence

See `QA_TEST_LOG.txt` and `BROWSER_QA_LOG.txt` in this ZIP. Browser smoke needs local Chromium + Python Playwright and is optional; ordinary `npm test` and `npm run build` need only the original project dependencies.
