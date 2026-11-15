# STUDYING WITH YE KUN — JLPT UX / Grammar Detail QA Patch (2026-11-15)

**This is an incremental QA patch, NOT a complete website ZIP and NOT a production release.** The intended source is the existing GitHub `main` website (the checked version when authored was `package.json` 7.87.4). Do not merge or deploy to production without testing.

## Requested changes

1. Study card: remove duplicate upper `Open All Lessons` and rename lower `Start Learning` to `Open All Lessons`; translate that button with the existing MY / EN / JP language switch.
2. JLPT Learning main: translate `Explore Lessons` into a visible Burmese sublabel, balance button dimensions, remove the big Student/Teacher hero image section so the countdown appears earlier.
3. Exam Guest Access: explain eligibility in Myanmar / English / Japanese. Verified, actively enrolled STUDYING WITH YE KUN students have free access; others can choose a paid plan. The redundant Exam Plans mini box is removed. Existing account status and server access logic remain unchanged.
4. Plans: compact, fully clickable 2-column cards on phone. Add explicit instructions to choose a plan, bank transfer, and wait for Admin receipt approval. The existing `checkout` function and payment APIs are left intact.
5/6. Explore Lessons anchor: preserve lesson title / tabs below the sticky header with CSS scroll offset. This avoids the heading disappearing at the top on mobile.
7. Grammar: keep the existing card visual arrangement, make the content clickable to a separate detail page with grammar formation, Japanese/Burmese/English explanation, **three example sentences**, Burmese and English translation, and crimson underlines showing the grammar used. Reuse existing Bookmark / Mark Learned state (no new DB fields).

This patch adds two **new supplementary examples** to each of the **30 currently displayed grammar cards** (6 for each of N5–N1). It does **not** install the separate archived 509-pattern library. Content is editorial draft and should receive native Japanese + Burmese proofread before publishing.

## Apply safely (Windows / GitHub Desktop)

1. Open the existing `MY-OFFICAL-WEB` repository in GitHub Desktop. Before unzipping, **create a new QA branch** from `main` (e.g. `qa/jlpt-ux-grammar-detail`). Do NOT apply directly on production `main`.
2. Extract this ZIP **into the cloned repository root**, the folder with `index.html` and `package.json`. The ZIP contains only new files and the patch script; existing source files will not be replaced merely by unzipping.
3. Double-click `APPLY_UPDATE_WINDOWS.bat` (requires Python 3 available through `py -3`). Or from the repository root run:

```powershell
python tools/apply_jlpt_ux_patch.py --check
python tools/apply_jlpt_ux_patch.py
```

The script refuses to write if expected source anchors differ. It creates backups **next to the repository** (outside GitHub tracking). It modifies only `index.html`, `study/jlpt-learning.html`, `assets/yk-jlpt-learning-v782-page.js`.
4. Run `node tests/yk88-jlpt-ux-qa.mjs` and the existing `npm test`, `npm run build` in the repository. Fix any failure before continuing.
5. Push QA branch, inspect Netlify **Deploy Preview** on mobile, including language switching, login states, all 4 plan selections, payment modal (without paying), switching levels/tabs, grammatical highlighting and Back navigation.
6. Only after approval and QA, consider a PR merge. **Main/production has not been modified by ChatGPT.**

## Safety boundaries

No SQL, migrations, Netlify functions, student identifiers, YKCR, access authorization, exam attempt counts, bank endpoints, receipt upload, or payment processing logic is changed. The guest explanation describes current policy; server permissions remain the source of truth. A manual Japanese/Myanmar copyedit and real browser tests are needed; do not call this patch Stable until verified.

## If a check fails

Do not force the patch or replace unrelated code. The source may have moved since baseline. Keep the current code, and compare changes in GitHub Desktop before proceeding.
