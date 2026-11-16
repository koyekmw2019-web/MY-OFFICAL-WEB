# STUDYING WITH YE KUN — v7.87.6 UI Fix05.4

**QA-only minimal correction of the Home JLPT CTA text alignment. Not a full website. No Production approval or release.**

## Proven observations

- The user-provided Samsung screenshot shows `သင်ခန်းစာအားလုံးဖွင့်ရန်` aligned to the left within the wide CTA button after Fix05.3.
- A read-only Netlify deployment check showed Fix05.3 deployed from `main` at Git commit `982da776ed2f5eab16e6eb73145f927baf541a50` on November 16, 2026. Deploy `ready` **does not** imply functional correctness.
- Fix05.3's code contains flex justification and a nested text `<span>`, but without runtime access to the connected Samsung browser, the **exact live computed CSS / source of conflict is not independently proven**.
- The previous synthetic tests did **not** test the full website and must not be used to assert that Production UI is stable.

## Only required code change

Replace one existing repo file: `scripts/build-v7876-jlpt-ui-fix05.mjs`. It is based on the **exact prior Git blob SHA** `6c8bdba5b392156dc3801b0107e9e07e3f46e05d`. Stop if current source differs.

Instead of `<a ...><span class="yk88-cta-label">Open All Lessons</span></a>`, the generated CTA is now **a simple block link containing its text directly**. Its inline declarations are:

`style="display:block!important;text-align:center!important;white-space:nowrap!important;box-sizing:border-box!important"`

This removes dependence on flex `justify-content` and the extra span; inline `!important` takes precedence over competing author stylesheet rules. The previously supplied Fix05.3 mobile full-row `flex-basis:100%` CSS remains untouched. The translation map is retained:

- MY: `သင်ခန်းစာအားလုံးဖွင့်ရန်`
- EN: `Open All Lessons`
- JA: `すべてのレッスンを開く`

There is no arrow. Clicking the button still opens `/study/jlpt-learning.html`. Existing Exam intro removal, Access card, Login, Student Verify, View Plans, bottom tab bar, JLPT and Grammar are **not modified by this patch**. The generated UI assets' URL query version changes to `v=7876ui054` to avoid reusing prior CSS cache entries.

## Safe local QA procedure

1. Use a separate **local QA branch** from the matching Fix05.3 commit. **Do not modify `main` or Production without separate approval.**
2. Copy `scripts/build-v7876-jlpt-ui-fix05.mjs` from this ZIP to the repository, preserving paths. The `tests/` files are optional but recommended. **Do not reapply older Fix04, Fix05.1, Fix05.2, Fix05.3 ZIPs on top of this patch.** Existing Fix05.3 assets and other scripts must remain in the full repo.
3. From the repo root, run:

```bash
node --check scripts/build-v7876-jlpt-ui-fix05.mjs
node tests/v7876-ui-fix05.mjs
python tests/v7876-ui-fix054-center-browser.py
npm test
npm run build
python tests/v7876-ui-fix054-built-site.py
```

Python UI tests need `playwright` and Chromium (`python -m playwright install chromium`). The built-site test uses the **actual generated `dist/index.html`**, unlike the earlier mocked tests; it must pass before any QA approval. If any command fails, stop and investigate. The complete repository is not contained in this ZIP, so this test could not be run here.

4. Finally, inspect **an authorized non-production Preview on the actual Samsung phone**, with MY/EN/JA labels, no vertical stacking/sideways scroll, and no unintended changes to Guest Access, student verification, exam/pricing, and other routes.

## Safety

This file is not a release. No commit/push, main merge, Netlify Deploy, database migration, payment/exam API changes, or YKCR mutations were made by this preparation. Retain Fix05.3 as the rollback reference until a better verified stable baseline is established.
