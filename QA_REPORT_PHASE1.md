# JLPT Phase 1 — QA Summary (LOCAL FIXTURE ONLY)

**Status:** QA CANDIDATE / NO-GO FOR PRODUCTION. The original v7.88.0 grammar content remains marked NOT STABLE.

**Verified:** GitHub main SHA `09df1bea6f8780872c68a97b072de983ccad744d` (Nov 18, 2026); original `scripts/build-page-transitions-v7875.mjs` Git blob `2e797d262ec96bf32c468c6536d9c718544bc2d0` matches the source included in the handover ZIP.

## PASS (focused, executed locally)
- Node scoped injection script, source HTML integrity (one CSS link only), duplicate-injection refusal, missing-anchor refusal, CSS scope and state/logic protection in synthetic `dist/` fixture.
- CSS syntax parsed with `tinycss2`.
- Headless Chromium synthetic visual fixture at 320 / 390 / 430 / 768 CSS px: no document horizontal overflow; 5 level buttons and 7 study tabs found.
- Baseline build chain inspection: the existing pipeline copies arbitrary `/assets/*` via `scripts/build-public-v7841.mjs`, then runs `scripts/build-page-transitions-v7875.mjs` last in `postbuild`. New import is appended AFTER v7.88.0 RC1 stage.
- Read-only GitHub inspection of actual JLPT source files and existing mobile/CTA fixes.

## NOT YET TESTED
- Full `npm test`, `npm run build` using whole repository source, actual served pages, real devices, real browser logged-in learning flow, Netlify Identity / cloud sync and PWA cache, 524 grammar items, paid Mock Exam E2E. External clone of repository to this environment is unavailable. The local fixture approximates the current UI and is NOT production-site evidence.
- Full editorial proofreading of Japanese / Myanmar / English grammar data remains incomplete in upstream RC1.

## Protected scope
- No changes made to user-authenticated state, JS lesson renderer, grammar-detail code, exam logic, payment, database, YKCR, Netlify Identity, service worker, GitHub branches or deployed site.
- Only layout CSS is injected into generated `study/jlpt-learning.html`; UI preference themes are respected; standalone detail page not changed.
