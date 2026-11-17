# STUDYING WITH YE KUN — v7.88.0 RC1 Netlify Build Repair (QA only)

**Status: QA-only, NOT STABLE. NO PRODUCTION DEPLOY.**

## Root cause verified from Netlify screenshot + GitHub source
At `scripts/build-v7880-grammar-rc.mjs:64`, the build asserts that the JLPT progress client and server source contains `2000`. GitHub's actual main commit `410e2befce3318e6417a8df66c56b1074a3bb5cd` retains old 500-item caps because the required one-time prebuild script was not run before `npm run build`.

This is an **independently identifiable first failure**. It is not proof that all later build steps will succeed.

## Safe instructions (Windows + GitHub Desktop)
1. Open your existing local GitHub repo `koyekmw2019-web/MY-OFFICAL-WEB` in GitHub Desktop. Pull/fetch the latest remote commit, ensuring your files are backed up.
2. From the current code, create and switch to a **new branch named `qa/v7.88.0-progress-build`**. Do NOT edit main.
3. Extract this ZIP directly into the *root of that local repository*. It contains the same guarded source patch script already delivered in v7.88.0 RC1 and a safety-only wrapper.
4. Double-click `FIX_ON_QA_BRANCH_ONLY.cmd` **one time**. It refuses to edit if the active Git branch does not start with `qa/`. If `node` is unavailable in Windows PATH, open a terminal in GitHub Desktop and run `node scripts/fix-v7880-progress-on-qa-only.mjs`.
5. Check GitHub Desktop diff. The only two existing source files that should be changed by the fix are:
   - `assets/yk-jlpt-learning-v782-state.js`
   - `netlify/functions/jlpt-learning-progress.mts`
6. Run `npm run build` on the **QA branch**. If it fails again, inspect and send the new build error before any deploy.
7. Commit only the two modified existing source files to your QA branch after successful local build and inspect. You may keep the helper scripts locally or commit them to the QA branch for reproducibility, but DO NOT merge to main without separately approving production.

## Scope and limits
- The patch changes exactly six textual occurrence anchors, 500 -> 2000, across the two source files, covering completion IDs, bookmark IDs and the client/server merge.
- No Grammar Card UI, 524 Grammar content, payment, student data, exam backend, or YKCR configuration is modified by this repair.
- No remote changes, commits, pushes, deploys, DB migrations, or student data writes are performed by these scripts.
- It is **not idempotent**: run only once on an unpatched checkout. The guard refuses to reapply.
- Previously truncated state values cannot automatically be recovered.
- The wider v7.88.0 remains a QA candidate; complete language proofread, actual build, cloud + phone regression are still required for a stable release.
