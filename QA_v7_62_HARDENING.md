# YE KUN Official Website v7.62 — QA / Hardening Report
**Date:** 2026-11-01 · **Source:** user-provided v7.61 ZIP · **Release decision:** HOLD / NOT PRODUCTION READY

## Scope and decision
- Owner-selected free policy: **TOTAL_ONE** — one free attempt total across all exam types. This intentionally differs from an older QA recommendation of one per exam type.
- Stage A for scoring is implemented. Stage B is **NOT IMPLEMENTED**; private server-only question banks and server recomputation are not available.
- No live Netlify Database/Identity environment, Postgres, browser automation, or npm registry was accessible in this workspace. **Do not interpret mocked tests as deployment proof.**

## Changes by task — exactly which files and why

| Task | Changed files | What changed |
|---|---|---|
| 1 Free | `netlify/functions/_shared/exam-autosave.mts`, `netlify/functions/exam-access.mts` | Idempotent-style lazy expiry to `abandoned` for past-final-deadline started attempts; free quota remains used; `23505` correct unique index only means paywall; other errors go to 500. Missing checkpoint-table `42P01` falls back to legacy lookup; `23514` missing admin CHECK responds 503. `exam-status.mts` unchanged for TOTAL_ONE. |
| 2 Concurrent tabs | `netlify/functions/exam-checkpoint.mts`, `assets/yk-exam-autosave-v761.js` | `version` in GET/POST, compare-and-swap UPDATE, first INSERT conflict; 409 includes snapshot/version/phase/deadline. Client backs up version, adopts remote on 409 without blind retry; Web Locks exclusive attempt guard and BroadcastChannel best-effort fallback. |
| 3 Offline/timer | `netlify/functions/exam-checkpoint.mts`, `assets/yk-exam-autosave-v761.js`, `assets/jlpt-native-v750.js`, `index.html` | Server rejects expired same-section save; bounded single-step phase changes, deadline never extended after expiration. Local phase cannot override server phase. JLPT advance awaits successful server save. Conflict messages prompt recovery; timer derives from server deadline. |
| 4 Score | `netlify/functions/_shared/exam-autosave.mts`, `netlify/functions/exam-attempt-submit.mts`, `assets/jlpt-native-v750.js`, `index.html` | Per-type integer score maxima and provisional pass thresholds, client `passed` ignored, minimum elapsed 5 seconds; cannot claim verified score. Section totals sent by updated frontend. Restrict optional mistake records to checkpoint-matching known IDs for maintenance/JLPT; skip unsupported keys rather than accepting arbitrary strings. |
| 5 Deploy | `netlify/database/migrations/20261101140000_v762_hardening.sql` (NEW), `netlify/functions/exam-health.mts` (NEW), `EXAM_BACKEND_SETUP.md`, `package.json`, `README_v7_62_HARDENING_MY.md`, `service-worker.js` | Add `score_verified=false` + lookup indexes; admin health endpoint; staging checklist and source version 7.62.0; direct dependency versions pinned; SW version label refreshed. No original migration changed. |
| QA | `tests/v762-unit.mjs` (NEW), this report | Runnable Node 22 mocked API / helper regression tests and manual staging acceptance matrix. |

## Tests actually run

| Check | Result | Evidence / limitation |
|---|---|---|
| v7.61 original migration files preserved bit-for-bit | **PASS** | SHA-256 checked for all 8 pre-existing SQL migrations |
| Exactly one new migration, total 9 | **PASS** | File listing/structural assertions |
| No old files removed, no PDFs added | **PASS** | Compare source list to v7.61 and recursively count `.pdf` files |
| `node --check` all 14 external `.js` files | **PASS** | Static syntax check |
| `node --check` 13 inline executable scripts from `index.html` | **PASS** | Extracted inline scripts + syntax check |
| Node TypeScript syntax for modified `.mts` modules | **PASS** | `node --experimental-strip-types --check` for modified modules; local import test |
| `netlify/functions/_shared/env.mts` syntax with `node --check` | **NOT RUN** | Unchanged source contains `declare const`, which this Node syntax checker does not accept; actual Netlify esbuild compilation not available |
| 14 local helper/backend mock assertions | **PASS** | `node --experimental-strip-types tests/v762-unit.mjs` => 14 PASS / 0 FAIL; mock SQL is NOT Postgres |
| Real PostgreSQL transactions/CAS atomicity | **NOT RUN** | No Postgres / Netlify DB available |
| Empty database migrations 1–9 | **NOT RUN** | No DB and CLI migrations |
| Migrations on sanitized production copy | **NOT RUN** | Production data inaccessible |
| `exam-health` authenticated Admin GET 200 or 503 | **NOT RUN** | Live Netlify preview unavailable |
| Direct dependency install, full package-lock, `npm ci` / build | **NOT RUN** | npm Registry unavailable (EAI_AGAIN); versions pinned in package.json only, package-lock is not faked |

## Owner's test matrix (Staging checklist)

`PASS` below applies only to mocks or syntax; every production browser path remains `NOT RUN` until tested on an isolated Netlify preview.

| User / test | Truck / Taxi / Bus | Maintenance | Car / Motorcycle / Moped | JLPT N1–N5 |
|---|---|---|---|---|
| Free start → save → refresh → resume → submit | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Student start → save → refresh → resume → submit | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Paid start → save → refresh → resume → submit | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Admin start → save → refresh → resume → submit | NOT RUN | NOT RUN | NOT RUN | NOT RUN |

| Edge case | Status | Manual steps |
|---|---|---|
| Concurrent first free starts across two exam types (`TOTAL_ONE`) | NOT RUN | Send two simultaneous authorized `exam-access` POSTs; only one should win, losing request receives resume_other or paywall |
| Free expired attempt cannot block other flows | NOT RUN | Start a free exam, pass final deadline +60s, request other type; should see paywall, not permanent resume_other. Quota remains used |
| Non-unique DB insert failure | PASS (mock) | Inject code `08006`; returns 500, never `payment_required` |
| Missing checkpoints table `42P01` | PASS (mock for exam-access) | In staging disable migration in a disposable DB and verify legacy fallback. Full frontend still requires checkpoint service for resume |
| Missing admin-mode check `23514` | PASS (mock) | Returns 503 `schema_out_of_date` |
| Two tabs, different answers, stale tab 409 | PASS (mock CAS); browser NOT RUN | Open same attempt in two browsers; verify second tab read-only and 409 stale response returns actual server snapshot |
| Offline mid-section, answer, reconnect | NOT RUN | Turn off network, edit, reconnect; answers must persist, remaining time based on server |
| Offline phase advance | NOT RUN | Click JLPT Next while offline; must not show next phase until POST succeeds |
| Resume after deadline | PASS (mock 409); browser NOT RUN | Force current `ends_at` 70s past; POST should return time_expired; no time added |
| Older local phase vs newer server phase | NOT RUN | Create divergent local backup; must always open server phase, not local phase |
| Alter `score=180` on truck and `passed=true` with low car score | PASS (mock) | Invalid maximum rejected, `passed` ignored; *plausible fake scores still unverified Stage A* |
| Student verification / YKCR sync | NOT RUN | Import synced student and verify exact linked identity / dates |
| Bank transfer + Admin payment review | NOT RUN | Submit private receipt, approve/reject, verify paid access |
| Android / iOS PWA and page refresh | NOT RUN | Mobile install/open and navigation checks |

## Known limitations / production blockers

1. **Stage B not implemented:** answer keys reside in public site assets; to produce trustworthy scores, move keys to a private server-only source, maintain a server-pinned authorized question sequence, grade from checkpoint answers, and redesign existing client result/review flows. Merely copying public keys server-side while still shipping them in the browser does NOT provide meaningful verification.
2. **No full npm lockfile:** original ZIP has no lockfile and network is unavailable. Direct versions pinned (exact strings), but before shipping, generate and commit a true complete `package-lock.json` with networked npm, run `npm ci`, and compare APIs for major releases.
3. **Migration not deployed/tested:** older Netlify Deploy Preview DBs may not include checkpoint schema; exam-access falls back, but full Auto Save / Resume cannot function without the checkpoint table. Do not promote until all 9 migrations apply and Admin health check passes.
4. **Not yet full browser tested:** Web Locks + BroadcastChannel fallback, JS in-flight responses, stale server conflict re-render, offline reconnection, all exam result flows require browser E2E.
5. **Wrong answer review coverage limited:** server-side mistake keys for the driving/license banks cannot be confidently linked to actual authorized questions using the existing public-only source; the v7.62 submit endpoint conservatively skips those keys rather than accepting arbitrary forged items. Existing local history still works.
6. **Existing source browser exams can be interrupted if server/DB unavailable:** user must be shown a retry path; do not count these as successful exam completions.

**Decision: HOLD / Staging only. Do not publish to live students until blockers are resolved.**
