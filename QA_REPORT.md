# QA Report — Mobile Navigation Preview Candidate

Base: main 1d5c21cdb234add7ca33c4fd456ea6cd81d0a89a (7.87.4)
Local feature commit: 7e35578ef53e494279df08fa475ef3b2c0a034d0
Scope: five mobile navigation destinations, max-width 720px.

| Check | Result | Evidence / limits |
|---|---|---|
| Baseline npm test / npm run build | PASS | Baseline logs retained locally |
| Final full npm test | PASS | Includes all existing tests, plus npm posttest navigation tests |
| Final npm run build | PASS | Original security/build checks unchanged; postbuild injects navigation |
| Output routes | PASS | 39 HTML pages; one nav per page; all destination files exist |
| Runtime navigation | PASS | 12 URL/hash scenarios using isolated Node VM DOM fixture |
| Exam/menu/input/fullscreen hiding | PASS (unit) | Simulated state events; real browser still pending |
| Account delegation / Logout | PASS (source/output) | Links to existing dashboard.html; existing logout retained |
| Backend preservation | PASS | 49 protected files byte-identical to baseline; SHA-256 inventory attached |
| Existing QA/security assertions | PASS | No old test changes shipped; original test/build scripts preserved |
| Real mobile visual / touch / keyboard | NOT RUN | Chromium could not launch in execution environment |
| Netlify preview of this new commit | NOT RUN | No remote push or deployment performed |
| Auth/payment/YKCR live end-to-end | NOT RUN | No authenticated account or database writes performed |
| Production merge/deploy | NOT DONE | Explicit approval required |

Release decision: PREVIEW CANDIDATE ONLY. Not certified Stable.
Remaining blockers: remote Preview build, phone layout/keyboard/fullscreen checks, existing authenticated user flows with isolated test data.

Implementation: ordinary links, scoped CSS, no new runtime dependencies, no API/session/storage access by new navigation. Native browser links remain usable when JavaScript is disabled. Dark rounded bar with crimson active indicator, icons and the five requested English labels. Mobile-only bottom spacer prevents ordinary flowing page content from sitting under the bar. Exam page navigation is hidden while examPanel is active. Existing hamburger and role-based Account routing remain authoritative.

Observed QA compatibility fixes: initial appended test/build commands conflicted with historical exact-suffix checks. Final implementation uses npm posttest/postbuild hooks; original checks were not relaxed. Baseline version-guard script rewrites historical version fixtures when invoked; generated fixture edits were excluded from this patch.

Files shipped: package.json, assets/yk-mobile-nav.css, assets/yk-mobile-nav.js, scripts/build-mobile-nav.mjs, tests/mobile-nav.mjs. No generated identity bundle, node_modules, dist, RC files or SQL migrations included.
