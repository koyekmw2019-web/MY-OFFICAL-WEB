# STUDYING WITH YE KUN — v7.89.0 production integration workspace

This release branch started from the last confirmed production main commit
`c654b68bdc361e9f3cea224c771b9d58cfd7e359`.

## Planned official release
- Approved UI: Menu V2.1, bottom tabs, exam access screen and Nov 23 micro polish.
- 普通第二種免許: 95 questions per attempt (90 true/false + 5 illustrated scenarios), 50 minutes, maximum 100 points, pass >= 90.
- Server-authoritative user access, 1 free attempt per exam type, Student and Paid entitlements, checkpoint, result and mistake review.

## Current state: NOT READY TO DEPLOY
The source files from the existing draft PR #7 are copied into this branch solely
as integration inputs. The QA HTML contains a LOCAL SIMULATOR and is NOT the
release-ready exam. The public repository cannot store a private canonical
answer bank. The QA-only UI build script must not be mistaken for a production
build step.

The SQL is intentionally STAGED at
`release/v7890/staged-migrations/20261124154000_v7890_ordinary_second.sql`.
Netlify automatically applies migrations from `netlify/database/migrations`
when publishing; moving the file there BEFORE completing and reviewing the
real Netlify Functions and database state risks a partially enabled exam.
Never apply this schema without production DB metadata review and a verified
backout plan.

## Explicit remaining release gates
1. Build the ordinary_second server-backed question manifest and score API.
2. Keep canonical answers server-only and not in the publicly served dist or GitHub.
3. Wire Identity, checkpoint, user-owned attempts, student/paid/free and review.
4. Integrate approved menu V2.1 and Nov 23 polish into the actual build pipeline.
5. Run full npm build, regression, and hosted authentication/backend tests.
6. Preflight the real Production DB schema/constraints/indexes, then enable the migration.
7. Merge/publish only once the complete site can run, with rollback documented.

No QA/production Netlify site, database, payment or YKCR has been changed by
creating this branch. DO NOT merge the existing QA PR #7 wholesale:
it contains hundreds of generated dist-menu-qa files.
