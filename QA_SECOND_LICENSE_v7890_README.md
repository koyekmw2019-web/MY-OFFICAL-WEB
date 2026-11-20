# STUDYING WITH YE KUN — 普通第二種免許 v7.89.0-rc.1 QA

## Baseline and scope
- Base Production SHA: `c654b68bdc361e9f3cea224c771b9d58cfd7e359` (v7.88.1).
- QA branch only; Production, main, Identity, Payment, Database and YKCR untouched.
- In the current three-column Driving Card grid, clone the original 普通自動車 style and insert a 普通第二種免許 card immediately after it.
- Preserve equal-height white CTA; clicking opens the separate `/mock-second-license-qa.html` practice preview page.
- QA-only question bank: 102 original Japanese/Myanmar text questions and 10 original illustrated hazard scenarios, sampling 90 + 5 for a 95-question / 50-minute / 100-point / pass-90 exercise. Book cover only; no book questions copied.

## Restrictions
- **NOT PRODUCTION READY.** The new QA page is local practice only and does NOT use server exam access, identity, student verification, payment, YKCR, official scoring records, or the one-free-attempt rules.
- Current backend `EXAM_TYPES` and SQL constraints do not permit a new second-type exam identifier; these MUST NOT be changed without separately approved backend/database scope.
- Cover publication rights and original JP/MM question accuracy need review.

## Tests and open gates
- Local JS syntax / QA source bank / scoring arithmetic / fixture page injection: PASS.
- Local Chromium static rendering at 1600×900 and 390×844: first question starts; no horizontal overflow or JavaScript errors.
- Localhost browser click-through: NOT VERIFIED (browser sandbox blocked navigation).
- **Full source build, Netlify Deploy Preview, real mobile QA and hosted E2E: NOT RUN.**
- Do not claim Stable/Ready without full build and hosted QA. No Draft PR created.
- Future work must separately approve backend isolation/migration, main merge, Production release, and rollback.

## Rollback
No Production changes; simply do not merge the QA branch. Netlify Production Auto Publishing remains LOCKED.
