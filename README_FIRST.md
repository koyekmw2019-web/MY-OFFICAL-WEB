# STUDYING WITH YE KUN — v7.88.0 RC1 (QA PACKAGE)

**Status: NOT STABLE. RELEASE NO-GO. Do not deploy to production or expose to students.**

This is an incremental, consolidated source-code QA package. It is **not** a full website ZIP. It replaces the earlier v7.87.7–v7.87.9 grammar QA patches; do not stack earlier grammar ZIPs on top of it. The existing JLPT Card and Grammar Detail UI are retained.

## Baseline and scope
- GitHub: `koyekmw2019-web/MY-OFFICAL-WEB`, read-only baseline `14c74891a620f97060ac4c72a140aaf0636262b6`.
- Expected public build pipeline: original website → existing Fix05.4 chain → v7877 → v7878 → v7879 → v7880 RC1 stage.
- The patch updates grammar data, grammar annotations, and JLPT progress capacity. No schema migration, authentication/payment logic edits, YKCR updates or Exam backend changes.
- A one-time, source-side guarded progress-capacity patch **does edit** the existing `netlify/functions/jlpt-learning-progress.mts` sanitizer and `assets/yk-jlpt-learning-v782-state.js` on the QA branch. The endpoint must be regression-tested before release.

## Applying ONLY on a separate local QA branch
1. Start with the exact expected repository baseline; take a backup and keep `main` and production unchanged.
2. Overlay **this ZIP only** at repository root; do not overlay Batch01/02 or v7.87.9 after it.
3. Run `node scripts/apply-v7880-progress-capacity.mjs`. This guarded source patch MUST run **before** `npm run build`. It refuses double application or mismatched anchors.
4. Run `npm run build`, then `node tests/v7880-built-site-check.mjs`, `node tests/v7878-grammar-complete.mjs`, `node tests/v782-state-isolation.mjs`, and `node tests/v782-api.mock.mjs`.
5. Verify all user flows on an isolated preview: N5–N1 Grammar Card, three example languages, Ruby ON/OFF, correct red underline, selected language, 524 learned/bookmarked IDs without truncation, logged-out/guest/login cloud sync, mobile 320–720 px, service-worker cache, exam/auth/payment stability.
6. Perform independent line-by-line Japanese/Myanmar/English grammar and translation proofreading, plus correct furigana per lesson. Keep an inspectable signed QA ledger.
7. **Do NOT call it stable until all blockers in RELEASE_BLOCKERS.md are closed and the user separately approves a production release.**

## Automated checks available without a full repository
- `node tests/v7880-grammar-rc.test.mjs`: 524-card fixture, 1,572 examples, five targeted editorial fixes, guarded progress repair, duplicate detection, cache-busting; fixture only.
- `node tests/v7878-grammar-source.mjs`: verifies source counts / mapped titles.
- `node tests/v7879-reading-coverage.mjs`: measures ruby coverage, NOT full reading correctness.
- `python tests/v7879-browser-ruby-smoke.py`: isolated Chromium smoke, NOT the real website.

**Important:** the original website source is not bundled or present in this QA workspace. Full `npm run build`, real-phone and Netlify preview could not be verified here. The extra content is original material based on a reference pattern list, not a wholesale copy of the source website.
