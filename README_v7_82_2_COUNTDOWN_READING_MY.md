# STUDYING WITH YE KUN — v7.82.2 Reading Update

**Base**: v7.82.2 Teacher Visibility Fix (existing version). This is a revised build of the **same `7.82.2` version**, not v7.82.3. Distinguish the new ZIP by its `Countdown_Reading` filename.

## အသစ်ထည့်ထားတာ

1. **JLPT Exam Countdown** — Japan Time (`Asia/Tokyo`) အတိုင်း 2026-12-06 (တနင်္ဂနွေ) အထိ ရက်ကျန်ကို အလိုအလျောက်တွက်ပြပါတယ်။ နောက်ဆုံး ၃၀ ရက် Review Window အတွင်း Progress Bar ပြပါတယ်။ 2026-12-06 ကျော်သွားလျှင် နောက်စာမေးပွဲနေ့ကို **ခန့်မှန်းမပြ** ဘဲ Official JLPT Website ကို ညွှန်ပေးပါတယ်။ ရက်စွဲအရင်းအမြစ်: https://www.jlpt.jp/e/faq/ နှင့် https://info.jees-jlpt.jp/info/2026-2jisshiannnai.html
2. **Reading Technique** — N5 / N4 / N3 / N2 / N1 အလိုက် Reading Category နဲ့ မြန်မာလို လေ့လာနည်း Tips ကို ရွေးကြည့်နိုင်ပါတယ်။ Category တစ်ခုနှိပ်ပြီး အဲဒီအမျိုးအစားရဲ့ မူရင်း Reading Passage တွေကိုပဲ Filter လုပ်ဖတ်နိုင်ပါတယ်။
3. **Original Reading Practice 20 ခု** — N5 (3)၊ N4 (3)၊ N3 (4)၊ N2 (5)၊ N1 (5) စုစုပေါင်း **20 ခု** အသစ်ဖြည့်ထားပါတယ်။ Passage၊ Multiple-choice Question၊ Myanmar Explanation ပါပါတယ်။ အရင် **152 Lessons** မပျက်ဘဲ **172 Learning Items** ဖြစ်သွားပါတယ်။
4. **Old Question Reading** — Official JLPT Sample Questions Page ကို **အပြင် Link** ချိတ်ထားပါတယ်။ တရားဝင် မေးခွန်းဟောင်းတွေကို Webpage ထဲမှာ Copy မလုပ်ထားပါ။ ပညာရေး Brand အားလုံးက `STUDYING WITH YE KUN` အတိုင်းပါ။
5. **Bookmark / Daily Practice / Learning Progress** — Reading Passage အသစ်တွေက မူလ JLPT Learning State System နဲ့ အသုံးပြုနိုင်ပါတယ်။ မူလ Progress/Bookmark Records ကို မဖျက်ပါ။ Learning Item စုစုပေါင်းများလာတဲ့အတွက် Level Progress % ကို 172 item အပေါ် ပြန်တွက်ပါတယ်။ Bookmark/Mark Learned ခလုတ်နှိပ်ပြီးစာသား မပြောင်းသေးတဲ့ ပြဿနာကိုပါ ပြင်ထားပါတယ်။
6. **Premium Black / White / Red UI** — မူလ Anime Student နဲ့ Teacher ပုံနှစ်ပုံကို ပြန်အသုံးပြုထားပါတယ်။ စာမျက်နှာအသစ်မဆောက်ဘဲ STUDY HUB နဲ့ `/study/jlpt-learning.html` ကို အခြေခံထားပါတယ်။

## Source Files

- `assets/jlpt-reading-v7822-upgrade.json` — Reading Techniques + 20 original practices
- `assets/yk-jlpt-reading-v7822.css` — Responsive UI
- `assets/yk-jlpt-reading-v7822.js` — JST countdown
- `study/jlpt-learning.html` — Learning Page UI integration
- `assets/yk-jlpt-learning-v782-page.js` — Reading filter, data merge, Bookmark UI refresh
- `index.html` / `assets/yk-jlpt-learning-v782-hub.js` — Home STUDY HUB Countdown & Level-specific Reading Link
- `service-worker.js` — Public Cache Version Bump + new static JSON; **NO private response caching**
- `tests/v7822-reading-update.mjs` — Additional automated QA

## မပြောင်းထားတာ

- `YE KUN Official Website | YE LINN OO` Homepage Title
- Dictionary Bank 8,542 Entries
- `STUDYING WITH YE KUN` Education Brand
- Mock Exam, Exam Attempt Rules, Payment, Login, Netlify Functions, Database Migrations, YKCR Sync Backend
- Approved Student / Teacher WebP artwork (same bytes)
- Sitemap, Public SEO Guide Page URLs and 2026 Official Exam Access Rules

## Deploy / QA

1. GitHub Desktop မှာ လက်ရှိ Repository ကို **Backup Commit** လုပ်ပြီး ZIP ထဲက Source Files နဲ့ Update လုပ်ပါ။
2. Netlify Deploy Preview မှာ `npm run build` အောင်မြင်မှုကို အရင်စစ်ပါ။ Local Environment မှာ `esbuild` မရှိလို့ Full Build မစစ်နိုင်ခဲ့ပါ။
3. STUDY HUB ကို View More ဖွင့်ပြီး Countdown၊ N5–N1 Reading Link ကို နှိပ်စစ်ပါ။
4. JLPT Learning Center → Reading → N2 → `統合理解` ကို ရွေးပြီး စာပိုဒ်/မေးခွန်း/မြန်မာရှင်းလင်းချက်ကို စစ်ပါ။
5. Bookmark / Mark Learned / Daily Practice (5, 10, 20) ကို စမ်းပါ။ Login/Student/Member Cloud Sync ကို Production အကောင့်နဲ့ သီးခြားစစ်ပါ။
6. Existing Login, Payment, YKCR Sync, Mock Exam Access ကို Smoke Test လုပ်ပြီးမှ Production Deploy လုပ်ပါ။

**အရေးကြီး:** အသစ်ထည့်ထားတဲ့ Reading Passages တွေက STUDYING WITH YE KUN အတွက် မူရင်းရေးထားတဲ့ လေ့ကျင့်ခန်းများဖြစ်ပြီး Official JLPT Exam Questions / Scaled Scores မဟုတ်ပါ။ JLPT မေးခွန်းအရေအတွက်၊ စာပိုဒ်အရှည်ကို တရားဝင်စာမေးပွဲအတိုင်း အတိအကျ အာမမခံပါ။
