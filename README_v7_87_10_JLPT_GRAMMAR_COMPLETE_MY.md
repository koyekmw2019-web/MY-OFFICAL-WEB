# YE KUN Official Website — v7.87.10: JLPT Grammar Library N5–N1, All 509 Drafts Authored

**Education brand:** STUDYING WITH YE KUN  
**Version type:** CUMULATIVE PATCH on top of existing GitHub `main` v7.87.4; includes v7.87.5, 7.87.6, 7.87.7, 7.87.8, 7.87.9, and new 7.87.10. **Not a full repository**.  
**GitHub/Netlify production:** Not updated. Weekly Upload workflow unchanged.

## Grammar learning content

| JLPT | Patterns in grammar library | Trilingual authored learning drafts | Japanese examples |
| --- | ---: | ---: | ---: |
| N5 | 35 | 35 | 70 |
| N4 | 75 | 75 | 150 |
| N3 | 135 | 135 | 270 |
| N2 | 137 | 137 | 274 |
| N1 | 127 | 127 | 254 |
| **TOTAL** | **509** | **509** | **1,018** |

**No missing entries:** Each pattern has original Japanese explanation, Myanmar explanation, English explanation, grammar formation and two originally authored Japanese example sentences, each with Myanmar + English translations. All highlight targets are in their actual example sentence. Grammar pattern list is based on the user's reference `https://nihongokyoshi-net.com/jlpt-grammars/`, but explanations and example sentences are independently authored, not scraped/copied. This is **not an official JLPT exhaustive grammar specification**; level placement is reference-based and approximate.

**Editorial limitation:** Completion means all 509 *original drafts are written and automatically validated for completeness and structure*. It does **NOT** mean a professional Japanese native expert has individually copyedited all 509, nor that every linguistic nuance is guaranteed correct. A human teaching/editorial review is recommended before promoting them as expert-certified learning materials. There are no empty “Review Needed” entries, and no made-up placeholder translations.

## UI behavior

- JLPT Learning Center grammar tab -> dedicated Grammar Library, with original 30 lessons still reachable via `?legacy=1` so previous progress/bookmarks are preserved.
- Grammar list/search by level, bookmarks, Mark Learned (browser-local; **not cloud-synced**).
- Japanese / Myanmar / English original explanation, formation and **two original trilingual examples** for every grammar pattern.
- Grammar text in each example has crimson-red underline; automated check ensures highlighted snippet is present in the actual Japanese sentence.
- Furigana: `Auto by Level`, `Show Known`, `Hide`. This is **a conservative pre-defined word reading list** and cannot annotate every Japanese character reliably. Not official level-based furigana rules.
- Level-specific JSON is fetched on demand, avoiding all 509 entries loading on the first visit.
- `?v=78710` cache key for data JSON and JS avoids reusing v7.87.9 pre-completion content.
- None of the login, YKCR, Netlify Functions, database migrations, payment, exam engine, or Student/Member Dashboard systems changed in v7.87.10. Earlier cumulative changes remain.

## How to apply once per week

1. Use **existing** GitHub Desktop repository `koyekmw2019-web/MY-OFFICAL-WEB`. Verify the base `main` is **v7.87.4** unless there were manual changes, in which case review conflicts before copying.
2. Extract the v7.87.10 ZIP and copy its files/folders over the root of your **existing repository**. Preserve `.git/` and do not replace the repo with only these files: this ZIP is a cumulative **PATCH**, not a complete source checkout.
3. Prefer a test branch, run `npm test` and `npm run build` with a full repository, inspect Netlify Deploy Preview first. Only after tests pass, merge/push to `main` on the weekly upload day. Do not upload older v7.87.5–v7.87.9 separately.
4. After deployment, test the **N5/N4/N3/N2/N1** grammar routes, mobile 390px / 1280px, long furigana, question links, bookmark persistence, student login/exam/payment/YKCR. Confirm database migrations from previous cumulative patches.

## QA limitations

- Local authored corpus checks and specific UI/browser fixture checks performed.
- **Full Netlify site build cannot be verified from a patch-only workspace**; the original full GitHub checkout and production environment are required. Do not claim deployment or runtime backend success from a patch QA PASS.
- No PDF files were added.
