# STUDYING WITH YE KUN — Explore Lessons Hotfix 02 (QA Only)

Boss ကြီး ❤️ အရင် Production Rollback လုပ်ပြီးနောက်에도 Explore Lessons မရတာကြောင့် QA Patch ကို ပိုပြီး ခံနိုင်ရည်ရှိအောင် ပြင်ထားပါတယ်။

**QA ONLY — Production မတင်ရပါ။** GitHub main မပြောင်းပါနှင့်။ Netlify Auto Publishing Locked ဆက်ထားပါ။

## ပြင်ဆင်ထားတာ

- `Explore Lessons` ကိုနှိပ်ရင် JLPT Page ထဲက `#yk82Title` Lesson Section ဆီ Scroll လုပ်မယ့် Guard အသစ်။
- အရင် Mobile Click Handler ထက် အရင်အလုပ်လုပ်နိုင်ဖို့ `window capture` နည်း အသုံးပြုထားပါတယ်။
- Sticky Header ရဲ့ အမြင့်ကို အလိုအလျောက်တွက်ပြီး Title မဖုံးအောင် Scroll ထိန်းပါတယ်။
- Grammar / Bookmark / Student State / Login / Exam / Payment / YKCR / Database ကို မပြောင်းပါ။

## QA Branch အတွက်သာ

1. Current GitHub main `c692f93d` ကိုအခြေခံပြီး QA Branch တစ်ခုကို အသုံးပြုပါ။ Production Branch `main` ကို မသုံးပါနှင့်။
2. ZIP ထဲက `assets/`, `scripts/`, `tests/` ကို Repository Root ဆီ Merge လုပ်နိုင်ပါတယ်။ `scripts/build-page-transitions-v7875.mjs` တစ်ဖိုင် Replace ဖြစ်ပါတယ်။ Code တစ်ကြောင်းချင်း ပြင်စရာမလိုပါ။
3. QA Branch မှာပဲ Commit/Publish လုပ်ပါ။ Netlify Preview QA နဲ့ Mobile Function Test မအောင်ခင် main Merge မလုပ်ပါနှင့်။

အခု Deploy မလုပ်သေးပါက လက်ရှိ Website မှာ Fix မမြင်ရတာ ပုံမှန်ပါပဲ။ ဒီ ZIP ကို ဒေါင်းလုဒ်လုပ်ရုံနဲ့ Website မပြောင်းပါ။

### Local QA
Automated Chromium fixture မှာ Desktop / Mobile Width ၅ မျိုး PASS ဖြစ်ပေမဲ့ **Boss ကြီးရဲ့ Live Website အတွက် Fix အောင်မြင်ကြောင်း မအတည်ပြုရသေးပါ**။ ဒီ ZIP ကို QA Preview မှာ စမ်းသပ်ပြီးမှ လက်ခံပါ။
