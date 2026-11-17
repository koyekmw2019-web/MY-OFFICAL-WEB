# v7.88.0 — Stable Release Gate (NO-GO)

This is a **candidate**, not an approved stable release. All checks below must be satisfied before production.

## Completed in this session (limited scope)
- [x] Inspected the actual v7.87.9 QA ZIP and the current GitHub main source via read-only connector.
- [x] Verified the 500-item progress truncation in BOTH client and server source code.
- [x] Built a guarded 500→2000 source patch for BOTH sides, including cloud merge and bookmark sanitizers.
- [x] Repaired N1 `真実を知んがために` → `真実を知らんがために` and its explanatory formation.
- [x] Corrected N1 〜だの〜だの, N3 〜にしても〜にしても and N4 〜ようになる formation descriptions.
- [x] Rephrased an unnatural N2 〜ものだから example and the linked MY/EN translations.
- [x] Passed a synthetic 524-card, 1,572-trilingual-example integration test, duplicate guards, syntax checks.
- [x] Retained all old Grammar IDs and the existing UI in generated patch logic.

## Mandatory release blockers
- [ ] Independent content proofread: all 524 grammar explanations (JP/MY/EN), all 1,572 Japanese examples, and BOTH translations per example checked for semantics, level, conjugation and naturalness. The present data validation only proves fields exist and focus substrings match.
- [ ] Complete reading review and ruby tokens: prior conservative renderer has 55 authored N2/N1 examples with Kanji but no ruby; many other sentences have only partial ruby coverage. The 15 spot-check reading cases are not exhaustive.
- [ ] Actual, complete GitHub repository `npm run build` and affected core release tests pass. The source tree was unavailable in this container.
- [ ] Actual Netlify Deploy Preview or an equivalent real built-site preview tested on Samsung/other mobile and desktop; no CSS/JS cache regression.
- [ ] Cloud API test with 524+ completed IDs and 524+ bookmarks under an authenticated account, including merge, logout/login, tombstones, and offline re-entry. Do not mutate actual student data during QA.
- [ ] Accessibility/mobile usability and all previously protected Login, Exam, Payment, Student Verify, YKCR surfaces/regression tests.
- [ ] User explicitly approves production deployment, main-branch integration, and public stable release separately.

No proof of these incomplete checks exists in the current workspace. Do not turn them into PASS by renaming the ZIP or committing to main. Data that was already truncated to 500 in previously saved states cannot necessarily be recovered automatically.
