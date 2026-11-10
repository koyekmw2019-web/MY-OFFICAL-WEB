# YE KUN Official Website — v7.82 JLPT Learning Center Pro

**Base Source:** v7.81 Advanced SEO & Google Indexing  
**Brand:** STUDYING WITH YE KUN (educational content)  
**Homepage SEO title:** `YE KUN Official Website | YE LINN OO` (unchanged)

## Update အကြောင်းအရာ

STUDY HUB ထဲမှာ JLPT N5–N1 Level Selector နဲ့ Vocabulary / Grammar / Kanji / Reading / Listening / Mock Exam Card ၆ ခု ထည့်ထားပါတယ်။ Level ရွေးလိုက်တာနဲ့ အဲဒီ Level ရဲ့ Lesson Link တွေ ပြောင်းပါမယ်။ အရင်ကရှိတဲ့ SSW Truck / Taxi / Bus preview ၃ ခု၊ View More / View Less၊ Book Covers နဲ့ Exam Card တွေကို မဖျက်ထားပါဘူး။

သင်ခန်းစာ Page: `/study/jlpt-learning.html` — မူရင်းသင်ခန်းစာ **152 ခု**

| Section | N5 | N4 | N3 | N2 | N1 | Total |
|---|---:|---:|---:|---:|---:|---:|
| Vocabulary | 12 | 12 | 12 | 12 | 12 | 60 |
| Grammar | 6 | 6 | 6 | 6 | 6 | 30 |
| Kanji | 8 | 8 | 8 | 8 | 8 | 40 |
| Reading | 3 | 2 | 2 | 2 | 2 | 11 |
| Listening | 3 | 2 | 2 | 2 | 2 | 11 |
| **Total** | **32** | **30** | **30** | **30** | **30** | **152** |

**အကန့်အသတ်:** ဒီ 152 ခုဟာ စတင်လေ့လာရန် မူရင်းသင်ခန်းစာစုစည်းမှု ဖြစ်ပြီး JLPT အဆင့်တိုင်းရဲ့ သင်ရိုးတစ်ခုလုံး မဟုတ်ပါဘူး။ မူလ Dictionary Bank 8,542 လုံးကို မပြောင်းဘဲ Level Filter သို့ Link ချိတ်ထားပါတယ်။ Official JLPT Problem/Scoring System မဟုတ်ပါ။

## Feature များ

- **Level Tabs:** N5–N1 တစ်ခုရွေးပြီး Vocabulary/Grammar/Kanji/Reading/Listening ကို ပြောင်းလဲလေ့လာနိုင်ပါမယ်။
- **Vocab:** စကားလုံး၊ ဖတ်ပုံ၊ မြန်မာအဓိပ္ပာယ်၊ မူရင်းဥပမာစာကြောင်း၊ မြန်မာပြန် ပါဝင်ပါတယ်။ Full Dictionary Level Filter သို့လည်း သွားနိုင်ပါတယ်။
- **Grammar:** Pattern၊ မြန်မာရှင်းပြချက်၊ ဥပမာစာကြောင်း၊ Usage Note ပါဝင်ပါတယ်။
- **Kanji:** Kanji၊ ဖတ်ပုံ၊ မြန်မာအဓိပ္ပာယ်၊ ဥပမာဝေါဟာရ ၂ ခု ပါဝင်ပါတယ်။
- **Reading:** အဆင့်လိုက်ရေးထားတဲ့ မူရင်း Reading Passage နဲ့ လေးခုရွေး မေးခွန်း၊ မြန်မာရှင်းပြချက် ပါဝင်ပါတယ်။
- **Listening:** Browser ရဲ့ Japanese Text-to-Speech (TTS) နဲ့ ပြောပြပေးပါတယ်။ မူရင်း Recorded Audio မဟုတ်ပါ။ Device မှာ Japanese TTS မရှိရင် Transcript ကို ဖတ်နိုင်ပါတယ်။
- **Bookmarks:** Lesson တစ်ခုချင်း ⭐ သိမ်းနိုင်ပါတယ်။
- **Mark learned:** လေ့လာပြီးတဲ့ Lesson ကို အမှတ်အသားထားပြီး Level Progress (count/%) တွက်ပါတယ်။
- **Daily Practice:** N5–N1 တစ်ခုချင်း 5/10/20 Questions၊ မှန်/မှားရလဒ်၊ အကြောင်းရင်း၊ ပြီးဆုံးမှုမှတ်တမ်း ပါရှိပါတယ်။ Mock Exam Access/Free Attempt/Payment ကို မသုံးပါ။
- **Dashboard:** Admin, Student, Member Dashboard တွေမှာ *ကိုယ့် account* ရဲ့ Learning Progress ကို ကြည့်နိုင်ပါတယ်။

## Cloud Sync & Privacy

Guest ဖြစ်နေချိန် Progress ကို **ဒီ Browser** ထဲမှာသာ သိမ်းပါတယ်။ Login ဝင်ထားတဲ့ Account အတွက် ကိုယ်ပိုင် Local Storage Key သီးခြား အသုံးပြုပါတယ်။ Netlify Cloud Sync အတွက် additive migration နဲ့ authenticated Function ကို ထည့်ထားပါတယ်။

- Migration: `netlify/database/migrations/20261109090000_v782_jlpt_learning_progress.sql`
- Authenticated Function: `netlify/functions/jlpt-learning-progress.mts`
- Login/Account ID ကို Server မှာ `requireUser()` ဖြင့် စစ်ပါတယ်။ User တစ်ဦး၏ Progress ကို အခြား User မဖတ်နိုင်အောင် Filter လုပ်ပါတယ်။
- Netlify Database Migration မပြီးသေးရင် Browser Local Progress ဆက်အလုပ်လုပ်နိုင်သော်လည်း **Cloud Sync မရနိုင်ပါ**။ Website UI မှာ အခြေအနေပြထားပါတယ်။
- Student Database၊ YKCR Sync Tables၊ Payments၊ Exam Attempts၊ Free 1 Attempt Rules ကို မပြောင်းထားပါဘူး။
- Live Netlify Database ကို ဒီဖိုင်ထုတ်တဲ့အချိန်မှာ မချိတ်ဆက်စမ်းသပ်နိုင်ပါ။ အလုပ်ဖြစ်ကြောင်း Production အတည်မပြုရသေးပါ။

## GitHub Desktop / Netlify Deploy

1. GitHub Desktop ထဲက **ရှိပြီးသား YE KUN Official Website Repository** ကိုပဲ အသုံးပြုပါ။ Repository အသစ် မဖန်တီးပါနဲ့။
2. v7.81 ကို Backup Commit ထားပြီး v7.82 Source Files ကို လက်ရှိ Working Directory ထဲ Copy ပါ (`.git` Folder မဖျက်ပါနဲ့)။
3. Changes → Commit → Push origin လုပ်ပါ။
4. Netlify မှာ dependencies install လုပ်ပြီး `npm run build` အောင်မြင်ကြောင်း၊ Database Migration အသစ် အောင်မြင်ကြောင်း စစ်ပါ။
5. Deploy Preview မှာ STUDY HUB Level Switch၊ Learning Page၊ Bookmark၊ Daily Practice၊ User Login Progress Sync၊ Student/Member Dashboard၊ JLPT Mock Exam၊ Payment၊ YKCR Sync စစ်ပါ။
6. Production မတင်မီ Code မတူညီမှုရှိမရှိ၊ Database Backup / Rollback Plan စစ်ပါ။

**Build Test ကန့်သတ်ချက်:** ဒီစမ်းသပ်ပတ်ဝန်းကျင်မှာ `esbuild` မတပ်ဆင်ထားလို့ `npm run build` အပြည့်အစုံကို စစ်မရသေးပါ။ `npm test` (source/regression tests) နဲ့ Browser ရဲ့ သီးသန့် UI Test အောင်မြင်ပါတယ်။ `assets/identity.bundle.js` ကို Netlify Build က ဖန်တီးပါမယ်။

## SEO

`/study/jlpt-learning.html` ကို Sitemap ထဲ ထည့်ထားလို့ 18 URLs ဖြစ်လာပါတယ်။ `sitemap.xml` ကို Google Search Console မှာ Submit လုပ်ထားပြီးသားဆိုရင် Deploy ပြီးနောက် Google က ပြန်လည်ဖတ်ရှုနိုင်ပါတယ်။ Indexing/Ranking ကို အာမမခံနိုင်ပါ။

## QA

`QA_v7_82_RESULTS.json` ကို ကြည့်ပါ။ ယခင် Version ရဲ့ Dictionary 8,542 Entries/Logo/Exam Question Banks/47 protected files တို့ကို မပြောင်းဘဲ ထိန်းထားပါတယ်။ မူလ Dictionary Draft ဘာသာပြန်အရည်အသွေးကို 100% စစ်ပြီးသားလို့ မဆိုလိုပါ။ PDF အသစ် မပါပါ။
