# YE KUN Official Website — v7.87.12 Multilingual UI Consistency

**Release type:** Weekly Cumulative Source Patch / QA-reviewed, **not production-stable verification**.

## မြန်မာဘာသာ ရှင်းလင်းချက်

ဒီ ZIP က **v7.87.11 Cumulative ZIP ကို ဆက်ပြီး ထည့်ထားတဲ့ v7.87.12 Update** ဖြစ်ပါတယ်။ GitHub ရဲ့ အဟောင်း version ကို ပြန်စတင်ထားတာ မဟုတ်ပါဘူး။ v7.87.5–v7.87.12 ပြင်ဆင်ချက်တွေကို တစ်ခါတည်း စုထားပါတယ်။ Full Repository မဟုတ်ပါ။

### အသစ်ပြင်ထားတာ

- Language ကို မြန်မာ / English / 日本語 ပြောင်းတဲ့အခါ **UI Control Text** တွေကို သီးခြားဘာသာပြန်ပေးတဲ့ `assets/yk-v78712-i18n.js` ထည့်ထားပါတယ်။ အရင် Home / Login / Video / Dashboard Translation Engine တွေကို မဖျက်ပါဘူး။
- Grammar Library နဲ့ JLPT Learning Center Header မှာ မြန်မာ / English / 日本語 Control အသစ် ထည့်ထားပါတယ်။ Language ရွေးချယ်မှုကို existing `yk_lang` Setting နဲ့ အတူသုံးပါတယ်။
- Grammar Library ရဲ့ Search/Filter၊ Furigana Control၊ Loading/Empty/Error/Bookmark/Mark Learned နဲ့ Static Guide Text တွေကို ဘာသာစကားနဲ့ ချိတ်ထားပါတယ်။ **Japanese 例文 / ふりがな / Grammar Formation / Myanmar/English Learning Content ကို မပြောင်းပါ။**
- Student/Admin Dashboard ရဲ့ အချို့ Analytics၊ Loading၊ Empty State / Navigation Control နဲ့ Admin CRM Label/Status/Action တွေကို ဘာသာစကားနဲ့ ချိတ်ထားပါတယ်။
- Admin CRM နဲ့ Business Growth ရဲ့ Owner Confirmation Popup တွေကို မြန်မာ/English/日本語 ပြနိုင်အောင် ပြင်ထားပါတယ်။ **Actual Save/Delete Behavior/Permission မပြောင်းပါ။**
- Login Placeholder/Password Visibility Label နဲ့ အချို့ UI Text တွေကို ပြောင်းနိုင်အောင် ပြင်ထားပါတယ်။ Existing Login/Register Backend ကို မပြောင်းပါ။
- Dynamically rendered UI ကို `MutationObserver` နဲ့ Scope သတ်မှတ်ပြီး ပြန်ဘာသာပြန်ပါတယ်။ `user input`, `student data`, `CRM Prospect Names`, `Japanese Examples`, `exam question/answer content` တွေကို မထိပါ။
- အဟောင်း Burmese Free Exam Label နှစ်ခုမှာ စည်းကမ်းမှားယွင်းဖော်ပြထားရင် Published HTML မှာ **တစ်မျိုးတစ်ကြိမ်** ဆိုတဲ့ စာသားနဲ့ ပြင်ပါတယ်။ **Exam Access Server Policy မပြောင်းပါ။**
- ပြင်ထားတဲ့ CRM/Growth Script တွေကို `?v=78712` နဲ့ Cache-bust လုပ်ပါတယ်။ PWA Service Worker/Bank/Database Schema ကို မပြောင်းပါ။

### QA စစ်ဆေးချက်

- **PASS (Source / Mock):** 509 Grammar Patterns, 1,018 Original Examples, Exam 12 Types Structure, Admin-only CRM API, Growth Click Event & Owner-entry Mock Tests, PWA Runtime Cache Logic, Preserved Backend and 81 Previous Files.
- **PASS (Chromium local fixture):** 390px / 1280px, Myanmar → English → Japanese → Myanmar, Grammar controls, dual-language learning examples unchanged, Bookmark state unchanged, Login-style input placeholder, Admin CRM dynamic fields, owner input & record names unchanged, no mobile horizontal overflow.
- **PASS (Build fixture only):** 24 HTML Routes injected, 12 Exam Routes included, Admin/Student Separation, grammar bridge preserved, no `netlify/functions` copied into public `dist`.
- **NOT VERIFIED:** Complete checked-out repository `npm test` and `npm run build`; authenticated Netlify Deploy Preview; Live Login/Payment/YKCR; real mobile Core Web Vitals. The local `dist` used for Release Test was a **synthetic fixture**, not a complete production build.
- **NOT CLAIMED:** 100% UI string coverage or linguistic proofreading of every existing English sentence. This is a targeted UI Consistency Fix; brand names and study material intentionally remain multilingual.

### Install — တစ်ပတ်တစ်ခါ GitHub Push မလုပ်မီ

1. Existing Repository `koyekmw2019-web/MY-OFFICAL-WEB` ကို GitHub Desktop နဲ့ Update/Fetch လုပ်ပါ။ ဒီ ZIP က **GitHub main v7.87.4 ကို Base လုပ်ထားတဲ့ Cumulative Patch** ဖြစ်တာကြောင့် main က နောက်ထပ်ပြောင်းသွားလျှင် Conflict ကို အရင်စစ်ပါ။
2. ZIP ဖြည်ပြီး **ဖိုင်တွေရဲ့ Relative Path အတိုင်း** Existing Repo ထဲ Copy/Replace လုပ်ပါ။ `.git` folder / Existing Exam Data / Payment Config / Private Secrets မဖျက်ပါနဲ့။ `dist/` ကို Copy မလုပ်ပါနဲ့။
3. `npm install` (dependency မရှိသေးလျှင်) → `npm test` → `npm run build` ကို **Full Original Repository** ထဲမှာ Run ပါ။ Build နဲ့ Test အားလုံး Pass မဖြစ်သေးရင် Production မတင်ပါနဲ့။
4. Netlify Deploy Preview မှာ မြန်မာ/English/日本語 Switch၊ Login Form၊ Admin CRM၊ Student Dashboard၊ Grammar Library၊ 12 Exam Pages၊ Payment/YKCR ကို Test လုပ်ပါ။ v7.87.7/v7.87.8 DB Migrations လည်း Deploy မလုပ်ခင် စစ်ပါ။
5. Test အားလုံးအောင်မှ GitHub Weekly Push / Production Deploy ကို စဉ်းစားပါ။ ဒီ ZIP ထုတ်ချိန်မှာ GitHub/Netlify Production/Database ကို မပြောင်းထားပါ။

### အသစ်ပါဝင်တဲ့ source files

- `assets/yk-v78712-i18n.js`
- `assets/yk-v78712-i18n.css`
- `scripts/build-v78712-i18n.mjs`
- `tests/v78712-source.mjs`
- `tests/v78712-release.mjs`
- `tests/v78712-browser-qa.py`
- `QA_v7_87_12_LANGUAGE.json`

**Updated cumulative files:** `package.json`, `scripts/v7872-qa-version-guards.mjs`, `assets/yk-v7878-admin.js`, `assets/yk-v7877-growth.js`, and legacy Source Test allowlists. **Unmodified:** all 509 grammar JSON, Exam Access Free-Attempt Rule, Netlify Functions, CRM migrations, User Database, 1,018 Japanese/Myanmar/English example sentences, student Bookmark/Progress storage.
