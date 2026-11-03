# YE KUN Official Website v7.69 — All-Sourced Vocabulary Dictionary Expansion

## ဒီ Release ရဲ့ အဓိက Update

- v7.68 ZIP ကို အခြေခံထားသည်။
- Source Vocabulary PDFs 8 ဖိုင်နှင့် v7.68 Review Queue ကို ပေါင်းထားသော Dictionary Catalog **8,542 unique Japanese + Kana entries**။
- N1 **3,486**၊ N2 **2,109**၊ N3 **1,733**၊ N4 **57**၊ N5 **1,157** entries (primary source level အလိုက်)။
- v7.68 က **360 ခု** မြန်မာအဓိပ္ပာယ် စစ်ပြီးသား entries ကို ထိန်းထားသည်။
- **8,182 entries** မှာ မြန်မာအဓိပ္ပာယ် မစစ်ပြီးသေးပါ။ အများစု English gloss ကို PDF Source အတိုင်း ပြသပြီး **Translation pending** လို့ label ထားသည်။
- **494 entries** မှာ Source English glossary text မရနိုင်သေး။ ဒီ entries တွေကို Meaning not available in source လို့ ပြသသည်။
- Search၊ JLPT N1–N5 Filters၊ Favorites၊ History၊ Japanese Pronunciation၊ Copy မူလ Functions တည်ရှိနေသည်။
- Filter ပြီး 200 entry စီ ပြပြီး **Load More** နဲ့ Catalog အပြည့် Browse လုပ်နိုင်အောင် ထည့်ထားသည်။

## PDF Source Limitations

- 8 uploaded vocabulary PDFs were processed as structured source material (including N5 Meguro numbered list).
- Older five `直前対策 JLPT N1–N5` scanned practice-exam books were previously inspected as references, but their **entire page contents have not been fully transcribed**, and therefore this release **does not claim exhaustive extraction from those five books**.
- N1 and N2 supplied lists contain a few apparent reading/print inconsistencies. Examples are marked `reading_warning` rather than silently corrected.
- Level numbers describe the source-book grouping, **not an official JLPT vocabulary syllabus**.
- Missing Myanmar translations were **not made up**. A future verified translation pass must supply them before calling the dictionary fully Myanmar-translated.

## မူလ Data မပျက်စေဖို့

- Original Transport/Truck/Taxi/Bus/Car/Maintenance dictionary entries and existing translations were not overwritten.
- Existing Favorites/History localStorage keys remain unchanged. New entries use stable word+reading Favorites IDs.
- Original Netlify Functions/Database migrations, YKCR, Payment, Login, Exams, Analytics files unchanged.
- No PDF pages or PDF attachments are in the ZIP.

## Files

- `assets/yk-dictionary-v769.js`: runtime JS for 8,542 unique entries.
- `DICTIONARY_v7_69_FULL_CATALOG.json`: human/machine inspectable catalog with quality status, source labels.
- `DICTIONARY_v7_69_REVIEW_QUEUE.csv`: entries awaiting Myanmar translation/reading QA.
- `DICTIONARY_v7_69_STATS.json`: source processing metrics.
- `tests/v769-dictionary-bank.mjs`: catalog integrity test.

## Deployment

Staging/Netlify Deploy Preview အရင်လုပ်ပါ။ Browser အစစ်မှာ Dictionary Search / Filters / Favorites / Pronunciation / Mobile/PWA ကို အတည်ပြုပြီးမှ Production တင်ပါ။ Live Website ကို မပြင်ထားပါ။
