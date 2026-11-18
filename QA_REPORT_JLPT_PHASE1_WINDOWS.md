# STUDYING WITH YE KUN — QA report (Phase 1 + Windows compatibility)

- Baseline `main` SHA (read-only connector): `09df1bea6f8780872c68a97b072de983ccad744d`.
- QA Branch in screenshots: `qa/jlpt-ui-phase1-7880`. No remote modification by this package.
- Phase 1 layer: exact same CSS, builder, build-chain import and focused test from the existing earlier Phase 1 QA ZIP.
- Fixed Windows `tests/v774-release-smoke.mjs`: replaced `root+'/'` with `root+sep`, imported `sep` from `node:path`. The repository boundary guard is **not removed**.
- Fixed Windows `package.json`: removed the POSIX-only `mkdir -p assets && ` from `scripts.build`; project already versions an `assets/` folder. Other package fields/scripts remain byte-for-byte semantically identical; exact Git blob baseline reconstructed before changing.
- Existing `scripts/v7872-qa-version-guards.mjs` changes 14 historical test allowlists to accept `7.87.4`; those existing local changes are **not bundled or discarded**.

## Passed locally in sandbox

1. `node tests/v7880-jlpt-ui-phase1.test.mjs` synthetic fixture — PASS.
2. `node --check` for all four supplied JS modules — PASS.
3. Static assertions: Windows-native path separator, unchanged backend hash guard, no POSIX `mkdir -p` in npm build, and required build order — PASS.
4. Reconstruction of unmodified baseline `package.json` = Git blob `0363dd290f10ead308115bbe9ef571f1d36758f4` — PASS.
5. Reconstruction of unmodified baseline `tests/v774-release-smoke.mjs` = Git blob `cf60d69c134816b4218075a4f47c84365ee8983c` — PASS.

## Not verified (release blockers)

- Full real repository npm test / npm run build on Windows or Netlify.
- Functionality on actual devices, paid exam/auth/progress/identity/cloud data, PWA and mobile UX E2E.
- All earlier 14 version-guard edits reviewed as a complete diff, since the user's local working tree is not directly accessible.

**RELEASE: NO-GO (QA ONLY).** Do not call stable; no code has been committed, pushed or deployed by this package.
