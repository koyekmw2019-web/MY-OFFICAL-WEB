# YE KUN Official Website v7.79 — SEO + JLPT Card & Branding

Base: `YEKUN_v7.78_Dictionary_QA_Fix.zip` (latest QA-corrected full-draft Dictionary).
Date: 2026-11-06

## ဒီ Version မှာ ပြင်ထားတာ

1. **SEO Only / Google Search**
   - Main site title ကို **`YE KUN Official Website | YE LINN OO`** အတိုင်း ထိန်းသိမ်းထားသည်။
   - Homepage description / Open Graph / Twitter Description တို့တွင် လက်ရှိ ပညာရေး/မောင်းနှင်ရေး Content ကို သဘာဝကျကျ ဖော်ပြထားသည်။
   - JSON-LD `WebPage` တွင် လက်ရှိရှိသော JLPT N1–N5၊ Japanese Vocabulary/Grammar/Kanji/Reading/Listening၊ Japanese–Myanmar Dictionary၊ SSW/特定技能 自動車運送業၊ 運送業テキスト၊ Truck/Taxi/Bus၊ 自動車整備၊ 運転免許၊ 普通自動車၊ 二輪၊ 原付၊ Career Support အကြောင်းများကို `mentions`, `keywords`, `hasPart` တို့ဖြင့် ဖော်ပြထားသည်။
   - SEO Keyword Mapping ကို `SEO_KEYWORD_MAP_v7_79.json` တွင် သိမ်းထားသည်။
   - Sitemap ၏ Homepage lastmod ကို update လုပ်ပြီး Homepage တစ်ခုတည်းကိုသာ indexable public page အဖြစ် ဖော်ပြထားသည်။
   - Login / private Dashboard များကို index မလုပ်ရန် ရှိပြီးသား noindex meta များကို ထိန်းသိမ်းထားသည်။
   - **Public Page အသစ် မဖန်တီးထား၊ SEO သက်သက်ကြောင့် Layout အသစ် မပြုလုပ်ထားပါ။**

2. **JLPT N5–N1 Exam Cards**
   - JLPT N5, N4, N3, N2, N1 တစ်ခုချင်းစီတွင် သက်ဆိုင်ရာ မြန်မာဘာသာရှင်းလင်းချက် ထပ်ထည့်ထားသည်။ English / Japanese UI ရွေးထားလည်း မြန်မာရှင်းပြချက် ပေါ်နေမည်။
   - မူလ Card Design၊ စာအုပ် Cover၊ 20 Text + 5 Listening + 180 pts နှင့် Exam Router တို့ကို ထိန်းသိမ်းထားသည်။
   - `Start N1 Mock Exam` (သို့မဟုတ် Level အလိုက် Main Text) အောက်တွင် **“စာမေးပွဲ စတင်မည်”** ကို အမြဲပြထားသည်။
   - JLPT 直前対策 (20-question short drill, no Listening) ရဲ့ non-official disclaimer ကို **STUDYING WITH YE KUN** Brand အဖြစ်ပြောင်းထားသည်။
   - JLPT full Mock UI၊ question-bank metadata၊ `ONLINE EXAM CENTER` educational heading တို့ကိုလည်း **STUDYING WITH YE KUN** Brand အဖြစ်ညှိထားသည်။
   - **Official JLPT လို့ မကြေညာ၊ မူလ Exam question/answer စည်းမျဉ်းများကို မပြောင်းပါ။**

## မပြောင်းထားတဲ့အရာတွေ
- YE KUN Official Website Homepage Title / Main Brand
- လက်ရှိ YK Logo / Dashboard White Horizontal Brand Logo
- STUDY HUB 3-card collapsed grid, expanded 12 cards, covers
- Dictionary 8,542 records, v7.78 56 targeted corrections, all-draft Myanmar translations
- Login, Payment, Netlify Functions, YKCR Sync and Paid/Student Access Rules
- Existing JLPT/SSW mock question/answer datasets (only brand text metadata changed)
- PDF အသစ် မထည့်ထားပါ။

## QA
- `npm test`: PASS (အရင် regression suite + v7.79 SEO/JLPT static QA)
- `node tests/v779-seo-jlpt.mjs`: 7 PASS / 0 FAIL
- Browser *isolated JLPT card component* Desktop 1440px, Mobile 390px: PASS (Myanmar/English/Japanese switching & subtitle)
- ZIP file integrity: PASS
- Full local website browser run was blocked by environment restrictions; **Netlify live deployment, login, payment tests not verified**.
- `npm run build` requires `npm install` (including esbuild) in Netlify/GitHub workflow; this environment lacks installed esbuild. Confirm build logs before release.

## Deployment
1. Extract ZIP to current GitHub Desktop repository folder (**do not overwrite the `.git` directory**).
2. Commit the changes; Push origin.
3. Netlify Git build with Node 22/24, `npm run build`, publish directory `.`. Confirm no build errors.
4. In Deploy Preview test language switch, five JLPT cards, `Start Mock Exam`, `直前対策` branding, Search/Dictionary, Login, Student access and Payment (avoid submitting real payment during testing).
5. Once published, Search Console → URL inspection → Request Indexing, then monitor impressions & search queries. Search ranking is **not guaranteed**.

**Translation caveat:** Dictionary စကားလုံး 8,542 လုံးတွင် မြန်မာ gloss Draft တစ်ခုစီ ပါရှိသော်လည်း အားလုံးကို ဘာသာပြန်ပညာရှင်က 100% အတည်ပြုထားခြင်း မဟုတ်ပါ။
