# STUDYING WITH YE KUN — v7.88.1-rc.1 第二種免許 学科試験

**အမျိုးအစား:** Cumulative source PATCH / Release Candidate (အတည်ပြုပြီး Stable Release မဟုတ်ပါ)  
**အခြေခံ:** v7.88.0-rc.1 Cumulative PATCH (v7.87.5 မှ အရင် Update အားလုံးပါဝင်)  
**Release decision:** **NO_GO** — Full GitHub Build, Netlify Deploy Preview, real Login/Payment/YKCR/Exam End-to-End မစစ်ရသေးပါ။  
**GitHub/Netlify:** Repository၊ Production၊ Database ကို မပြောင်းထားပါ။

## 1. Boss ကြီး တောင်းဆိုထားတဲ့ UI

* Driving Exam Center `/mock-exams.html` ရဲ့ **普通自動車 Card အောက်မှာ** `普通第二種免許` Card အသစ် ၁ ခု ထည့်ထားပါတယ်။ `普通自動車` ကို အစားမထိုးပါ။ ယခင် 12 Exam Cards ကို ထိန်းထားပါတယ်။
* ပို့ပေးထားတဲ့ **နီရောင် 第二種免許 စာအုပ်ပုံ** ကို Card နဲ့ Exam Intro ရဲ့ **Cover Image** အဖြစ်သာ သုံးထားပါတယ်။ စာအုပ်ထဲက မေးခွန်းတွေကို Copy မလုပ်ထားပါ။ Public Deploy မတင်ခင် Cover Image အသုံးပြုခွင့်/မူပိုင်ခွင့်ကို Boss ကြီးက စစ်ဆေးပါ။
* 新 Exam Route: `/exams/nishu.html`.  သီးခြား Page ဖြစ်ပြီး မူလ 12 Exam ရဲ့ Engine ကို မပြောင်းထားပါ။
* Premium Black / White / Crimson Red, Android 320/390px နဲ့ Desktop Responsive Layout; Myanmar / English / Japanese UI, Japanese question, Myanmar Translation. **ふりがな သည် အဓိက အသုံးများသော စကားလုံးများကိုသာ အကျုံးဝင်ပြီး တစ်လုံးချင်း Kanji အားလုံးကို မလွှမ်းခြုံသေးပါ**။

## 2. မေးခွန်း၊ အချိန်နဲ့ အမှတ်ပေးစနစ်

| အချက် | v7.88.1 Mock Exam |
|---|---|
| 文章問題 | 90 မေးခွန်း × 1 点 |
| イラスト問題 | 5 ပုံ × 2 点 = 10 点 |
| ပုံတစ်ပုံ | ○× ခွဲမေးခွန်း 3 ခုလုံးမှန်မှ 2 点၊ တစ်ခုမှားရင် 0 点 |
| စုစုပေါင်း | 95 問 / 100 点 |
| အချိန် | 50 分 / Server Timer |
| အောင်မှတ် | 90 点 နှင့်အထက် |
| Question Bank | 90 ORIGINAL Japanese written questions + Myanmar translations + 5 ORIGINAL SVG scene diagrams / 15 true-false subquestions; explanations private |

မေးခွန်းတွေက ယေဘုယျ交通ルール၊ 旅客安全၊ 危険予測 စတာတွေကို ကိုယ်တိုင်ရေးထားပြီး **ရဲတပ်ဖွဲ့ထုတ်တဲ့ တကယ့် Exam Questions မဟုတ်ပါ**။ မေးခွန်းဖွဲ့စည်းပုံ အခြေခံတဲ့ Official Reference: 2026 Fukushima Police Exam Standard (https://www.police.pref.fukushima.jp/03.tetuduki/-jyouhoukoukai/reiki_int/reiki_honbun/u244RG00003530.html).  မူရင်းပုံစံနဲ့ နီးစပ်အောင်ရေးထားပေမဲ့ Japanese legal/linguistic **အပြည့်အဝ လူစစ် proofreading မပြီးသေးပါ**။ စာမေးပွဲအောင်နိုင်မယ်လို့ အာမခံမပေးပါ။

### Written bank (90) topic distribution

* 共通の心得 13
* 運転前の心得 6
* 運転の方法 30
* 危険な場所・悪天候 9
* 高速道路 8
* 旅客自動車の心得 20
* 事故・故障・災害 3
* 車の所有者・使用者 1

ပုံမေးခွန်း ၅ ခု: 横断歩道၊ タクシー乗降၊ バス停、雨天、見通しの悪い交差点 (မူရင်း SVG Illustration အသစ်များ)။

## 3. Login, Free Attempt, Score History, Payment

* အသစ်တိုးတဲ့ Backend `exam_type`: `nishu`. ယခင် 12 types ထိန်းထားပါတယ်။ **nishu ကို သီးခြား free-1-per-exam-type quota** နဲ့တွက်ပါတယ်။ အကောင့်ထဲ Free Attempt ၁ ကြိမ် စတင်သုံးပြီး မပြီးဆုံးလည်း Free Quota ကုန်နိုင်တာကို UI မှာ ရှင်းပြထားပါတယ်။
* Active Student, Paid Plan, Admin Access စည်းကမ်းများကို မူလ `exam-access` ကနေ အတည်ပြုပါတယ်။ **မူလ Payment/Student Data အသစ်မထပ်ဖန်တီးပါ**။
* Autosave Server Checkpoint, countdown 50min, Score ကို Private Answer Key ဖြင့် Server ကပဲတွက်ပါတယ်။ 90/100 PASS; 89/100 FAIL ကို Test စစ်ထားပြီး ပုံတစ်ပုံမှာ 3/3 မှန်မှ 2 点 ရပါတယ်။ Browser ပေးပို့တဲ့ Score ကို မယုံကြည်ပါ။
* Submit ပြီးနောက် ကိုယ်ပိုင် မေးခွန်းမှားရာ Review; ရလဒ်မှတ်တမ်းကို ကိုယ်ပိုင် `exam-nishu-history` API က read-only ပြပါတယ်။ User ID ဖြင့် Database Query ကို စစ်ထားပြီး `Cache-Control: private, no-store` ထည့်ထားပါတယ်။
* Live Database/Identity/Payment ဖြင့် End-to-End မစစ်ရသေးတဲ့အတွက် အထက်ပါအချက်များသည် **Local Test / Code Design** အဆင့်ဖြစ်ပါတယ်။

## 4. အဓိက Source Files

| File | ရည်ရွယ်ချက် |
|---|---|
| `scripts/nishu-author-bank-v7881.json` | မူရင်းမေးခွန်း 90 + ပုံ 5 x 3 + အဖြေ/ရှင်းလင်းချက် (developer-only source) |
| `scripts/generate-v7881-nishu.mjs` | Public Question Text နဲ့ Private Key ကို သီးသန့်ခွဲထုတ်ခြင်း |
| `assets/yk-v7881-nishu-questions.json` | Public Questions; **အဖြေမပါ** |
| `netlify/functions/_shared/nishu-key-v7881.mts` | Private Server Answer Key; **dist ထဲ မထည့်ရ** |
| `netlify/functions/_shared/nishu-scoring-v7881.mjs` | Server-side Grade/Tamper Validation |
| `netlify/functions/exam-nishu-review.mts` | စစ်ပြီးသား ကိုယ့် Exam Review API |
| `netlify/functions/exam-nishu-history.mts` | ကိုယ့် Result History 20 ခု Read-only |
| `assets/yk-v7881-nishu.js / .css` | Standalone Exam Engine, Multilingual UI, Mobile |
| `scripts/yk-v7881-nishu-page.html` | Standalone Exam Page Template |
| `scripts/build-v7881-second-exam.mjs` | နောက်ဆုံး Build Stage မှာ 普通自動車 အောက် Card နဲ့ `/exams/nishu.html` ထည့်ခြင်း |
| `scripts/patch-v7881-nishu-backend.mjs` | မူလ Full Repo Backend တွေကို guarded/idempotent အဖြစ် ချိတ်ဆက်ခြင်း |
| `netlify/database/migrations/20261113090000_v7881_nishu_exam_type.sql` | Non-destructive CHECK Constraint Extension, **Database မတင်ရသေး** |
| `assets/yk-v7881-nishu-book-cover.jpg` | Boss ကြီးပို့ထားတဲ့ Cover Image တစ်ခုတည်း |
| `assets/yk-v7881-scene-*.svg` | အသစ်ဆွဲထားတဲ့ မူရင်း Scene Diagram 5 ခု |

## 5. GitHub Desktop မှာ Test Branch အတွက် Install လုပ်နည်း

**သတိ:** ဒီ ZIP သည် FULL WEBSITE မဟုတ်ပါ။ ပထမဆုံး GitHub `koyekmw2019-web/MY-OFFICAL-WEB` မူရင်း **Full Repository** ကို GitHub Desktop မှာ Checkout လုပ်ထားရပါမယ် (`main` base v7.87.4 checked at build prep time). `main` ကို တိုက်ရိုက်မပြောင်းဘဲ **QA Branch** ဖန်တီးပါ။

1. GitHub Desktop → repository `MY-OFFICAL-WEB` → **New Branch** ဥပမာ `v7.88.1-rc1-nishu-testing`. Netlify auto-deploy / build credit ကို သတိပြုပါ။
2. Cumulative ZIP ထဲက Source အားလုံးကို **Full GitHub Repository Folder အပေါ် ပေါင်းထည့်ပါ**။ Git ရှိပြီးသား `.git` Folder၊ Original Source တွေကို မဖျက်ပါနဲ့။ Cumulative အဖြစ် v7.87.5 မှ Update အားလုံးပါပါတယ်။
3. CLI Terminal မှာ repository folder ထဲ ဝင်ပြီး အောက်ပါ Command များ run ပါ။ `scripts/patch-v7881-nishu-backend.mjs` က Backend 5 Files ကို ပြင်နိုင်ပြီး **Git Diff ကို Commit မလုပ်ခင် Review** လုပ်ပါ။

```bash
node scripts/generate-v7881-nishu.mjs
node scripts/patch-v7881-nishu-backend.mjs
node --experimental-strip-types tests/v7881-score.mjs
node tests/v7881-source.mjs
node tests/v7881-patcher.mjs
node tests/v7881-build-fixture.mjs
```

4. GitHub `main` မှာ `package-lock.json` မရှိလို့ `npm ci` တိုက်ရိုက် မလုပ်နိုင်ပါ။ Dependencies တွေကို မူလ `package.json` နဲ့ Lockfile ပြန်စစ်ပြီး `npm install --package-lock-only` / `npm install` ဖြင့် Lockfile ပြုလုပ်ပါ။ Netlify Build နဲ့ Local Runtime Version ကို တူအောင် ချိန်ပါ။
5. **Full** `npm test` / `npm run build` ကို **မူရင်း Source ပြည့်စုံတဲ့ Repository** မှာသာ run ပါ။ လက်ရှိ ZIP-only Folder မှာ Preflight က ရပ်ပါလိမ့်မယ်။

```bash
npm test
npm run build
node tests/v7881-release.mjs
```

6. **Preview Database သီးသန့်** မှာ `20261113090000_v7881_nishu_exam_type.sql` အတွက် Migration ကို Backup/Review ပြီး လိုအပ်သလို Apply လုပ်ပါ။ **Production Database Migration မလုပ်ရသေးပါ**။ `exam_attempts` က ယခင် Type 12 ခုနဲ့ `nishu` Type အသစ်ကို လက်ခံဖို့ လိုပါတယ်။
7. Testing Branch / Netlify Deploy Preview ထုတ်ပြီး Browser, Identity Login, Student Verify, Paid Plan, Free Attempt, 50min Auto Save, Submit, Private Score, Review, History, Mobile 320–390px, old 12 Exams ကို **test account/test database** ဖြင့် E2E စစ်ပါ။ Bank Transfer/Customer Data အစစ်နဲ့ Test မလုပ်ပါနဲ့။
8. No actual Preview, Full Build, E2E result ကို `PASS` အဖြစ် မဆိုပါနဲ့။ ရလဒ်အားလုံး အောင်မြင်ပြီး Legal Question/Book Cover Review လည်းပြီးမှ `main`/Production Release ဆုံးဖြတ်ပါ။

## 6. QA အခြေအနေ

**PASS (Local Mock/Fixture only):** new 95-question bank generation; 90+5 composition; official-style 100-point grading; 12 private scoring/tamper assertions; guarded patcher idempotence; build-fixture Card order; 320/390/1280px synthetic Browser start/answer/next/lang/furigana/history; selected staged regression **41/41**.

**BLOCKED / NOT TESTED:** Full original repo `npm test`/`npm run build` (Patch-only Preflight blocked), real Netlify Deploy Preview, Migration on isolated DB, real Identity/Payment/Student Verify/Exam Submission E2E, visual/content proofreading by qualified Japanese examiner, copyright cover rights.

**Stable Status:** `v7.88.1-rc.1` / **NO_GO** pending evidence. **This does NOT certify v7.88.0 Stable.**
