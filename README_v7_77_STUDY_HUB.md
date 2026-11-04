# YE KUN Official Website v7.77 — STUDY HUB Preview & Book Covers

## Base
- v7.75 `YE_KUN_Official_Website_v7_75_Study_Hub_JLPT(1).zip` (the user's preferred layout). v7.76 is NOT used as base.

## Changed
- Collapsed STUDY HUB: **Truck / Taxi / Bus** three cards visible (desktop 3 columns; tablet 2; mobile 1).
- Expanded STUDY HUB: all 12 cards visible, including JLPT N5–N1.
- Toggle: `View More · Study Hub & JLPT ↓` → `View Less · Study Hub & JLPT ↑`.
- Added 12 lightweight local book-cover images in `assets/study-hub-covers/`.
- Book covers are resized versions of the ORIGINAL COVER IMAGES ALREADY EMBEDDED IN v7.75 EXAM CARDS, not generated stock/book images. No outside downloads.
- The existing STUDY HUB and all existing action buttons / Dictionary / Mock Exam links are retained. No new exam or lesson content created.

## What is NOT changed
- Backend, Netlify Functions, database migrations, Payment, Login, YKCR Sync, Exam engine, JLPT mock materials, Dictionary data, SEO/PWA are unchanged.
- Dictionary translation still has pending entries; this release does not attempt translation fixes.

## QA
- `npm test` passed, including v7.77 smoke tests.
- Isolated browser component tested at desktop 1440px and mobile 390px: 3 collapsed → 12 expanded → 3 collapsed, matching covers load, no horizontal overflow, no JS page errors.
- Full website local-file browser navigation was blocked by the environment. Full Netlify build was not verified in this environment because `esbuild` was not installed and package installation timed out. These are test limitations, NOT evidence of a runtime error.
- Production/Netlify is not deployed or tested.

## Deploy
- Extract ZIP into existing GitHub Desktop repository (preserve `.git`), Commit & Push.
- Netlify must install dependencies and run `npm run build`, per original v7.75 build setup. Check Deploy Preview (desktop/mobile, toggle, Login, Mock Exam) before publishing production.
- No new PDF files were added.

Read `QA_v7_77_STUDY_HUB.json` and `QA_v7_77_COVER_MANIFEST.json` for inspectable details.
