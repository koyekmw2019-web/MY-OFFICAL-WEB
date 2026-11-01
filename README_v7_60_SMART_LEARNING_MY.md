# YE KUN v7.60 Smart Learning Update

Based on v7.59 (all existing files retained).

## New additions
- My Mistakes: server-side user-scoped wrong answers collected from driving license and auto maintenance result submissions. Existing JLPT native wrong-question system remains unchanged; JLPT server-side sync not yet integrated.
- Learning Progress: completed exam score timeline, separated by exam type; mixed average is raw and not a percentage.
- Daily Practice: review 5/10/20 saved mistakes; not a new mock test and cannot bypass paid/free server-side exam access.
- Announcement Center: admin-only write function and authenticated learner read view.
- Auto Save & Resume: planned but **NOT IMPLEMENTED** in this package. Resume must be server-authoritative to avoid bypassing one-free-attempt access and deadline rules. No false success claim.

## Deploy
1. Back up live site/database.
2. Apply new additive database migration `20261101010000_v760_learning.sql` before deploying functions.
3. Deploy on staging first. Test student/member/admin login, payment review, YKCR sync, all exam types, failed requests, mobile menu, and PWA. Do not deploy directly to production without browser and server integration QA.
4. No new PDF files included.

## Limitations and security
- Server verifies user identity and attempt ownership; result scores and wrong-answer details remain client supplied as in v7.59 and must not be treated as independently verified for high-stakes certification.
- Server-side `exam-access` remains unchanged; existing free-attempt rules preserved.
- Admin announcement endpoint uses `requireAdmin`.
- Legacy JLPT progress data is visible through existing exam history; JLPT question mistakes are still client-local in legacy native UI.
- Auto-resume is not enabled; do not promise progress restoration after closing the browser.
