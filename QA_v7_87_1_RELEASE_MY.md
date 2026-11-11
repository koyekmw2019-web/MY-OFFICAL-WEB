# v7.87.1 — Local QA Report (2026-11-11)

## Completed
- Reference image five pages (1–132): 132 data records, unique sequential numbers & IDs.
- All 132 have A/B, readings, Myanmar meaning, original Japanese example, Myanmar translation.
- 96 practice-eligible, 36 caution/review; source mismatches excluded from quiz.
- Browser JS checks: `node --check` both modified/new scripts — PASS.
- Existing full `npm test` suite — PASS (on local source, not Netlify).
- New `tests/v7871-n2-same-meaning.mjs` — 4 PASS.
- Local preview output `node scripts/build-public-v7841.mjs --preview-allow-missing-generated-bundle` + `node scripts/build-v787-exam-pages.mjs` — PASS.
- `node tests/v787-release.mjs` after preview-output generation — PASS, 12 existing mock exam cards retained and homepage route split preserved.
- Chromium headless DOM-injection smoke (not a Netlify live browser test) — 390px mobile and 1280px desktop PASS: initial 12 cards, 132 total, bookmark, learned, filter review 36, practice 10, result.
- No production GitHub writes or Netlify deployments performed.

## Remaining / Caution
- Full `npm run build` was NOT executed; esbuild dependency not available in this local checkout. A preview-allow-missing-generated-bundle build was used instead.
- Real live site login/cloud sync and payment/YKCR regression NOT tested for this release; backend files unchanged.
- Public distribution rights for MC Knowledge Village / Chaw Wint War Naing user-uploaded source need confirmation.
- 36 entries need lexical editorial review (visible in Review filter). Entire 132-pair list has not undergone independent Japanese/Mynamar professional proofreading.
- Browser smoke loaded HTML/CSS/JS in an isolated headless browser because localhost/network browser navigation was blocked by environment; images in smoke screenshots may appear unloaded. Real deployed images refer to existing logo assets.
