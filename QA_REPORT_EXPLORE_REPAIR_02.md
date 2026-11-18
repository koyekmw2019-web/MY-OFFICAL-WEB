# STUDYING WITH YE KUN — Explore Lessons QA Repair 02

**NOT STABLE · QA BRANCH ONLY · NEVER MERGE TO MAIN BEFORE E2E**

- Current GitHub `main` source baseline: `c692f93d2ad84319dfac882c8f1d6cabb4096e8e`.
- Current live Netlify was rolled back to previous built deploy `6afc5b52d6c2e69ac1a4723f` at `09df1bea` (verified read-only).
- The rollback did not solve the reported Explore Lessons problem.
- This patch is a source-level QA candidate, **not** an installed or verified live fix.

## Scope
- Handle only `a.yk821-button-secondary[href="#yk82Title"]` in JLPT Learning Center.
- Attach a **window capture-phase** click listener, which precedes existing document capture listeners; prior QA patch used a document listener with an ordering race.
- Immediately scroll destination into view and account for the sticky header; recheck after animation frames.
- Preserve existing page route, search parameters, all seven tabs, original lesson JS, progress, login, exam, payment, YKCR, and database.
- Continue injecting into `dist/study/jlpt-learning.html` **after** Phase 1 build, with fail-closed checks.

## Limits
- Local synthetic tests can validate handler precedence and the scroll target. They cannot reproduce the user's real browser, Netlify runtime, service-worker cache, or missing lesson content.
- Do not label as fixed or stable until a separate QA Preview is opened and the user confirms click behavior. Previous build Ready does not mean E2E PASS.
- Do not push or merge main; production is locked separately. No database migration.

## Local QA results (2026-11-18)
- Node syntax: all included .js and .mjs checked — PASS.
- Synthetic builder fixture: injection once, duplicate prevention, missing target fails closed — PASS.
- Local Chromium browser simulations at 320, 390, 430, 768, 1200 px: title is scrolled into view below the 72px sticky header — PASS.
- A preinstalled legacy document capture click handler was intentionally tested: early window capture blocked it correctly — PASS.
- Unrelated link click remained functional — PASS.
- Recovery chain baseline check: removing only the appended import produces exact Git blob SHA `004f699fcf473cff1da4350998e685e6d0bbf793` for main commit `c692f93d`.
- Live production and real mobile E2E: NOT TESTED. No GitHub or Netlify mutations done.
