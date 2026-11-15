# STUDYING WITH YE KUN — v7.87.6 JLPT UX + Grammar Detail QA Patch

**This is an incremental QA patch, NOT a complete website ZIP and NOT a production release.**
It is intended to be applied on the existing official website source repository in a **QA branch only**.
Do **not** merge directly into `main` or deploy to production without testing.

## Included approved updates

1. **Study Hub JLPT card**
   - Remove the duplicate upper `Open All Lessons` CTA.
   - Replace the lower `Start Learning` CTA with `Open All Lessons`.
   - Keep it translatable with the existing MY / EN / JP language system.

2. **JLPT Learning main page**
   - Add a visible Myanmar sublabel for `Explore Lessons`.
   - Balance the `Daily Practice` and `Explore Lessons` buttons so they feel visually consistent.
   - Remove the large Student / Teacher hero image block so the countdown becomes visible earlier on mobile.

3. **Exam Guest Access**
   - Add a clear explanation:
     - active STUDYING WITH YE KUN students can use Student Verify for free access,
     - non-students can use the one free attempt and then purchase a plan.
   - Remove the redundant mini Access Plans summary box.
   - Keep the existing server-side access, login, and payment logic unchanged.

4. **Exam Plans modal**
   - Present plans as compact clickable cards on mobile.
   - Explain that users should select a plan, transfer by bank, and wait for Admin approval.
   - Keep the existing `checkout()` flow and backend APIs unchanged.

5. **Explore Lessons anchor / sticky header offset**
   - Preserve the lesson heading and tabs below the sticky header.
   - Prevent the top of the learning content from being hidden behind the mobile sticky UI.

6. **Grammar cards → dedicated detail page**
   - Keep the current grammar card style on the lesson list.
   - Make each grammar card clickable to a new detail page.
   - New page header uses the **STUDYING WITH YE KUN** brand and logo.
   - Show grammar formation, Myanmar explanation, English explanation, and **three example sentences**.
   - Example block format is:
     - これは本です。
     - ဒါက စာအုပ်ဖြစ်ပါတယ်。
     - This is a book.
   - **Do not show MY / EN labels** before the example translations.
   - Underline the grammar pattern in the Japanese sentence with crimson styling.
   - Reuse existing Bookmark / Mark Learned state. No new DB fields.

## Files included in this ZIP

- `APPLY_UPDATE_WINDOWS.bat`
- `READ_ME_FIRST.md`
- `tools/apply_jlpt_ux_patch.py`
- `study/jlpt-grammar-detail.html`
- `assets/yk88-grammar-details.json`
- `assets/yk88-index-ux.css`
- `assets/yk88-grammar-detail.js`
- `assets/yk88-jlpt-ux.css`
- `tests/yk88-jlpt-ux-qa.mjs`

## Safe apply steps

1. In GitHub Desktop, open `MY-OFFICAL-WEB`.
2. **Fetch / Pull `main` first.**
3. Create a new QA branch, for example:
   - `qa/v7.87.6-jlpt-ux-grammar`
4. Extract this ZIP into the cloned repository root (the folder with `index.html` and `package.json`).
5. Run:

```powershell
python tools/apply_jlpt_ux_patch.py --check
python tools/apply_jlpt_ux_patch.py
node tests/yk88-jlpt-ux-qa.mjs
npm test
npm run build
```

6. Push the QA branch.
7. Open a **Draft PR** from the QA branch to `main`.
8. Check the **Netlify Deploy Preview** on a phone.
9. Only after QA approval should a merge be considered.

## Safety boundaries

This patch is UI/content focused only.
It does **not** change:

- SQL / database schema
- Netlify functions
- YKCR sync
- login / auth flow
- payment endpoints / receipt upload flow
- exam attempt rules
- server-side access control

## Status

- Version target: **v7.87.6**
- Release status: **QA Patch / Preview Candidate**
- Stable / Production: **NOT YET**
