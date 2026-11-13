# YE KUN Official Website — v7.87.9 JLPT Grammar Library (Phase 1)

**Education brand:** STUDYING WITH YE KUN  
**Source base:** The previously delivered `YEKUN_v7.87.8_Admin_Cleanup_Enrollment_CRM_CUMULATIVE.zip` (verified locally).  
**Patch type:** CUMULATIVE source patch for the user's existing GitHub repository, based on `main` **v7.87.4**.  
**GitHub/Netlify production deployment:** Not performed. Upload only once weekly according to the project workflow.

## ဒီ Update မှာ အမှန်တကယ် ပြီးစီးထားတာ

- `/study/jlpt-grammar-library.html?level=N5` ဆိုတဲ့ JLPT Grammar Library page အသစ် ထည့်ထားပါတယ်။ N5/N4/N3/N2/N1 button, grammar search, status filter, mobile card UI ပါပါတယ်။
- Grammar pattern index စုစုပေါင်း **509 entries**: N5=35 / N4=75 / N3=135 / N2=137 / N1=127. Reference index က 508 unique link entries လောက်ဖြစ်ပေမဲ့ N3 `〜かわりに` ရဲ့ နှစ်မျိုးအသုံးပြုပုံကို သီးခြားခွဲသတ်မှတ်ထားတာကြောင့် 509 လို့ တွက်ထားပါတယ်။ ဒီစာရင်းက Official JLPT စာရင်းမဟုတ်ပါ။
- **55 entries ONLY** မှာ Japanese meaning, Myanmar meaning, English meaning, grammatical formation, and **2 original example sentences** with Myanmar/English translations ပါပါတယ်။ These are *draft lessons*, not expert-approved/fully proofread content. Per level draft: N5=15, N4=10, N3=10, N2=10, N1=10.
- ကျန် **454 entries** က Pattern title/index ရှိပြီး Japanese/Myanmar/English explanation, 例文 မပြင်ရသေးပါ။ Fake Translation/Incorrect Example မဖြစ်အောင် UI မှာ **Review Needed** အဖြစ် ဖော်ပြထားပါတယ်။ User request for every lesson to be completed has NOT yet been fully satisfied. Content generation remains a substantial follow-up editorial effort.
- Draft lesson 例文 မှာ သက်ဆိုင်ရာ grammar segment ကို **red underline** ဖြင့် တစ်ပိုင်းချင်း Highlight လုပ်ထားပါတယ်။ Sentence တစ်ခုလုံး highlight မလုပ်ပါ။
- **Furigana:** `Auto by Level`, `Show Known`, `Hide` သုံးမျိုး ရွေးနိုင်ပါတယ်။ Auto rules N5 များများ → N1 ရှားပါးစာလုံးများကိုသာ ruby ပြပါမယ်။ Accurate reading အတည်ပြုထားတဲ့ token တွေမှာပဲ Furigana ပြတဲ့အတွက် Kanji အားလုံးအတွက် Ruby 100% မဟုတ်ပါ။ JLPT တရားဝင် Kanji grade စာရင်းမဟုတ်ပါ။
- **Mobile loading:** Data ကို N5/N4/N3/N2/N1 ရွေးမှ သက်ဆိုင်ရာ JSON (17–29 KB raw each, before gzip) ကိုပဲ fetch လုပ်ပြီး cache ကနေ ပြန်သုံးနိုင်ပါတယ်။ ဒါက overall production Loading Time ကို တိုင်းထားတာ မဟုတ်ပါ။
- ရှိပြီးသား JLPT Learning Center `Grammar` tab ကိုနှိပ်ရင် level ကို ယူပြီး Library အသစ်ကို သွားမယ်။ `?legacy=1` mode မှာ အရင် v7.82 grammar 30 lessons ကို ပြန်ဖွင့်နိုင်ပါတယ်။ Original Progress/Bookmarks Cloud Sync မဖျက်၊ ID မပြောင်းပါ။
- New Grammar Library ရဲ့ Bookmark / Learned button များက **browser-local storage ONLY** ဖြစ်တယ်။ YKCR/Identity/JLPT Cloud API ကို မပြောင်းထားဘူး၊ New Grammar Library marks ကို Cloud Sync မလုပ်သေးပါ။

## မပြောင်းထားတာ / Preservation

- Original JLPT vocabulary, reading, listening, kanji, N2 same-meaning lessons, legacy grammar 30 မဖျက်ပါ။
- Admin/Student/Member Dashboard, Netlify Functions, Student/Payment/YKCR DB, Exam 12 types, exam timer/save/resume/score/access, and previous versions v7.87.5–v7.87.8 are retained.
- v7.87.7–v7.87.8 cumulative migration files are included **as previously delivered**; those require checking on staging before production.
- **Known separate issue:** Existing production `exam-access` HTTP 500 error from a wrapped unique free-attempt DB violation remains not fixed by this grammar-only update. Do not mistake this patch for an Exam Access repair.

## Weekly GitHub Desktop Upload

1. Existing repository `koyekmw2019-web/MY-OFFICAL-WEB` ကို GitHub Desktop ကနေ ဖွင့်ပါ။ Deploy ကို မတင်မီ `main` နဲ့ Local Version ကို စစ်ပါ။
2. ဒီ ZIP **is a PATCH, NOT a full site**. Existing repository **v7.87.4** baseline ပေါ်မှာ Extract contents (`assets/`, `scripts/`, `tests/`, `study/`, `netlify/`, `package.json` etc.) ကို copy/replace လုပ်ပါ။ `.git` ကို မဖျက်ပါနဲ့။ `dist/` ကို repo ထဲ Copy မလုပ်ပါနဲ့။
3. **Recommended:** Separate test branch → `npm install` → `npm test` → `npm run build` → Netlify Deploy Preview. Full build is not verified by this patch artifact alone.
4. QA PASS + UI/Backend smoke PASS ဖြစ်ပြီး Weekly Upload Day ရောက်မှ latest cumulative patch ကို `main` သို့ တစ်ခါတည်း Merge လုပ်ပါ။
5. At next production deploy verify database migration, admin login/payment, 12 mock exams, N5/N1 grammar page, mobile overflow, menu URL, and Cloud/Guest progress. Do not skip database checks for v7.87.7/v7.87.8.

## QA scope (performed locally)

- ZIP integrity + Node JS syntax + source-level invariants.
- 509 indexed patterns, 55 trilingual draft lessons with exactly 2 highlighted sentences, 454 incomplete openly labeled.
- Chromium 390px and 1280px DOM fixture: level changes, only 2 JSON fetches, furigana auto/show/hide, red underline, 2 trilingual examples, pending safety, no mobile overflow.
- 30 legacy lessons preserved via browser navigation test using `?legacy=1`.
- v7.87.9 synthetic build fixture PASS; **not** full actual repository Netlify build or real production mobile Core Web Vitals measurement.
- No unnecessary PDF files. No update to GitHub, Netlify, live database, or connected business data.

## Content authoring for future batches

- Pattern source: `scripts/grammar-v7879/catalog_source.py`
- Original trilingual drafts: `scripts/grammar-v7879/curated_grammar.py`
- Generation: `python scripts/grammar-v7879/build_grammar_assets.py` from repository root.
- QA: `node tests/v7879-data.mjs` and `python tests/v7879-browser-qa.py` (requires Playwright + Chromium).

## Reference

Source of *grammar index ideas*: https://nihongokyoshi-net.com/jlpt-grammars/  
Japanese/Myanmar/English explanations and example sentences are newly authored, not copied from linked pages. Grammar labels are functional Japanese patterns. Editorial review should check meaning/nuance and licensing before broad release.
