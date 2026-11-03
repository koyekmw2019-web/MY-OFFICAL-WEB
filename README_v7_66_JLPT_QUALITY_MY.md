# STUDYING WITH YE KUN — v7.66 JLPT Quality & Furigana Update

## ပြောင်းလဲချက်များ
- JLPT Full Mock (N1–N5, 500 questions) နဲ့ 直前対策 (N1–N5, 100 questions) မှာ common Furigana Renderer ချိတ်ဆက်ထားပါတယ်။
- Curated Furigana Dictionary 329 entries ထည့်သွင်းထားပါတယ်။ စာလုံးအားလုံးအတွက် Furigana အပြည့်အစုံ မဟုတ်ပါ။
- Grammar/Reading မှာ `ふりがな ON/OFF` ခလုတ် ရှိပါတယ်။ Reading ကို အကူအညီလိုတဲ့အခါ ဖွင့်နိုင်ပါတယ်။ Preference ကို Local Storage ထဲမှာ သိမ်းပါတယ်။
- 文字・語彙 Section နှင့် 読み方 မေးခွန်းတွေမှာ **ဖြေနေချိန်အတွင်း** အဖြေကိုဖော်ပြနိုင်တဲ့ Furigana မပေါ်စေရပါ။ Result/Review မှာမှ Reading ကိုဖော်ပြပါတယ်။
- HTML escaping ပါဝင်ပြီး Kanji Ruby Rendering ကို Safe Markup အဖြစ် သုံးပါတယ်။
- Existing mock exams, answer indexes, content database, exam scoring, autosave/resume, login, YKCR, payment, dashboard, Netlify migrations **မပြောင်းထားပါ**။

## QA
- Full Mock 500 / 直前対策 100 data records တွေမှာ ID, Level, Section, 4 options, Answer index, Explanation, Reading/Listening content presence ကို အလိုအလျောက် စစ်ထားပါတယ်။
- Public JS bank နဲ့ JSON bank မတူညီတာမရှိကြောင်း စစ်ထားပါတယ်။
- Existing Exam Integrity tests + v7.65 Stability tests + v7.66 tests ကို ဆက် run လုပ်ထားပါတယ်။

## အရေးကြီးတဲ့ ကန့်သတ်ချက်များ
- **ဂျပန်စာဝေါဟာရ/သဒ္ဒါ/読解အဓိပ္ပာယ် 600 ခုလုံးကို Japanese Teacher နဲ့ Manual Review မလုပ်ရသေးပါ**။ Tests တွေက Data Structure / Code Logic ကိုသာ အဓိကစစ်ပါတယ်။
- Japanese JLPT Official Exam ၏ တိကျတဲ့ difficulty, question length, official scaled score အတိုင်းဖြစ်တယ်လို့ မဆိုနိုင်ပါ။ ဘရောက်ဇာ Japanese Voice ကို Listening Practice အဖြစ် သုံးပါတယ်။
- Browser UI ကို isolated mock environment မှာ စမ်းထားပြီး Netlify Live Login / Exam Results / Payment / YKCR End-to-End ကို မစမ်းထားပါ။
- Existing production deployment ကနေ Preview/Staging ပထမ စမ်းပါ။ မူလ v7.65 ZIP ကို Rollback အတွက် သိမ်းထားပါ။

## QA Instructions
1. Netlify Deploy Preview မှာ Login/Logout / Dashboard Role စစ်ပါ။
2. JLPT N5 / N3 / N1 တစ်ခုစီမှာ Vocabulary (reading hints hidden) နှင့် Grammar/Reading (Furigana toggle) ကို စစ်ပါ။
3. 直前対策 Grammar/Reading မှာ toggle ON/OFF စမ်းပါ။
4. Exam Auto Save → Refresh → Resume → Submit / Free Attempt / Payment / YKCR Sync ကို Staging Account တွေနဲ့ စစ်ပါ။
5. Server graded results မပြောင်းလဲကြောင်း အတည်ပြုပါ။

## Branding
YE KUN Official Website ဟာ Official Site ဖြစ်ပြီး Study/Exam Features အတွက် STUDYING WITH YE KUN Brand ကို ဆက်သုံးထားပါတယ်။
