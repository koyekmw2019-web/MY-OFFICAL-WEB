# YE KUN Official Website v7.70 — Dictionary Meaning QA Build

## အရေးကြီးသော အခြေအနေ

**တောင်းဆိုထားသော စကားလုံး 8,182 ခု၏ မြန်မာပြန်ကို 100% လူဖြင့်စစ်ဆေးပြီး မဟုတ်သေးပါ။**
ဤ Build သည် Dictionary စာလုံး/အရင်းအမြစ်များကို ထိန်းသိမ်းပြီး မြန်မာအဓိပ္ပာယ်ကို တဖြည်းဖြည်းတိုးချဲ့ထားသည့် **Staging QA Build** ဖြစ်ပါသည်။ Production Stable ဟု မသတ်မှတ်ရသေးပါ။

## အတိအကျအရေအတွက်

- Original JLPT catalog: **8,542** unique (Japanese + Kana) entries — no entries were dropped.
- v7.68 အရင်က စစ်ထားဟု သတ်မှတ်ထားတဲ့ Myanmar meaning: **360** (old data not rewritten).
- v7.70 newly curated Burmese *drafts*: **491** (not independently linguist-verified).
- Original site Burmese gloss reuse: **383** (not independently linguist-verified).
- JLPT entries with Burmese gloss: **1234**.
- JLPT entries still without Burmese gloss: **7308**.
- Known source reading / gloss warning: **9**; original source not silently rewritten.

## Level breakdown

| Level | Total | Has Myanmar | Missing Myanmar |
|---|---:|---:|---:|
| N5 | 1157 | 352 | 805 |
| N4 | 57 | 57 | 0 |
| N3 | 1733 | 316 | 1417 |
| N2 | 2109 | 242 | 1867 |
| N1 | 3486 | 267 | 3219 |

## File descriptions

- `DICTIONARY_v7_70_FULL_CATALOG.json`: current full structured catalog with provenance/quality flags.
- `DICTIONARY_v7_70_REVIEW_QUEUE.csv`: all records needing language expert review, with English source and current draft.
- `DICTIONARY_v7_70_LEVEL_SUMMARY.csv`: counts by level.
- `DICTIONARY_v7_70_QA_SUMMARY.json`: automated QA results and restrictions.
- `DICTIONARY_v7_70_GLOSSARY_DRAFT.txt`: manually curated draft mapping reference.
- `assets/yk-dictionary-v770.js`: current Dictionary JS data loaded in website.
- `tests/v770-dictionary-translation.mjs`: integrity checks.

## Stability / security

- All Netlify functions/migrations are byte-identical to v7.69.
- Existing Favorites key `yekun_dictionary_favorites_v7` and old entries preserved.
- Search, Level Filter and Load More remain unchanged; isolated Browser QA completed.
- No source PDFs included in ZIP.
- Live Netlify Account/Payment/YKCR and database have NOT been tested.
- Do not claim all 8,182 Burmese translations are verified.
- Recommended deploy procedure: staging backup, login/role, payment and mock exam regression, dictionary search/favorites on Android + iOS, publish only after passing.

### Source warning examples

- `愛憎 / あいにく`: printed reading does not match expected `あいぞう`.
- `悪日 / あくび`: source reading conflicts with term.
- `空間 / あきま`: written term and reading conflict.
- `と / と` with English `door`: maybe missing the kanji 戸; needs expert inspection.

## Rights

Original scanned PDF pages are not embedded. This package includes short vocabulary entries/glosses extracted from user-provided learning materials. Verify content licensing and intended reuse rights before public distribution.
