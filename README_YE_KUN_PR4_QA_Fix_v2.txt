STUDYING WITH YE KUN — PR #4 QA Fix v2

WHY: Previous YE_KUN_PR4_QA_Fix.mjs stopped at ERR_ASSERTION because
it expected exactly three spaces before new vm.Script(...), while the
actual file uses different whitespace. No source change occurred on failure.

INSTRUCTIONS (QA branch release/v7.88.1-rc1-qa ONLY):
1) Copy YE_KUN_PR4_QA_Fix_v2.mjs beside package.json in MY-OFFICAL-WEB.
2) In Command Prompt at that folder, run:
   node YE_KUN_PR4_QA_Fix_v2.mjs
3) Expected: PATCH_APPLIED tests/v774-release-smoke.mjs
4) Check the GitHub Desktop diff for tests/v774-release-smoke.mjs.
5) If dependencies have been installed, run:
   node tests/v774-release-smoke.mjs --release
   npm run build
6) Do NOT merge main or declare STABLE just because this patch applies.

NOTE: The patch only teaches the legacy QA syntax checker to parse ES
modules correctly, while keeping vm.Script checks for classic scripts.
Other tests may still fail and must be investigated separately.
