# YE KUN Official Website — v7.86.4 JLPT Dynamic Countdown Correction

## ဘာတွေပြင်ထားလဲ

- 2026-12-06 နေ့ရက်ကို အမြဲတမ်းပြနေတဲ့ Countdown ကို အလိုအလျောက် နောက် JLPT သို့ပြောင်းမယ့် Logic နဲ့ ပြင်ထားပါတယ်။
- JST (Asia/Tokyo) အတိုင်း Days Left၊ Exam Day၊ 30-day review start/end/progress ကို နေ့တိုင်း Update လုပ်ပါတယ်။ Browser Tab ကို ပြန်ဖွင့်တဲ့အခါလည်း Update လုပ်ပါတယ်။
- 2026-07-05 နဲ့ 2026-12-06 က JLPT/JEES Officially Confirmed Date ဖြစ်ပါတယ်။
- နောက်နှစ်တွေကို July / December ရဲ့ ပထမ Sunday စည်းမျဉ်းနဲ့ **Tentative (အတည်မပြုရသေး)** အဖြစ်တွက်ပါတယ်။ စာမေးပွဲ အတည်ပြုရက်ပြောင်းနိုင်လို့ Official Site ကို စစ်ရပါမယ်။
- အတည်ပြုထားတဲ့ Exam Date အသစ်ကို `assets/yk-jlpt-reading-v7822.js` ရဲ့ `official` Map ထဲ Update လုပ်နိုင်ပါတယ်။ Browser က Official Website ကို အလိုအလျောက် Scrape မလုပ်ပါဘူး။
- Student/Teacher Graphic မပြောင်းပါဘူး။ Backend/Login/Payment/YKCR/Exam Rules မပြောင်းပါဘူး။ New database/environment variables/PDF မလိုပါဘူး။
- Homepage & JLPT Learning Page မှာ တစ်ပြိုင်တည်း အသုံးပြုမယ်။ Service Worker Version / JS CSS Cache Bust ပြောင်းထားပါတယ်။

## နမူနာ

- 2026-11-10 JST → 2026-12-06 (Confirmed): 26 days left, Last 30-day review 11/6–12/6.
- 2026-12-06 JST → Exam Day.
- 2026-12-07 JST → 2027-07-04 (Tentative): Date အလိုအလျောက်ပြောင်း၊ review period 6/4–7/4.
- 2027-07-05 JST → 2027-12-05 (Tentative) သို့ပြောင်း.

Official Reference: https://www.jlpt.jp/e/faq/

## QA နဲ့ Deploy

- 257 automated test assertions PASS (original 249 + dynamic calendar 8).
- Offline Browser Fixture: 390/1280 px, 2026 confirmed + 2027 tentative = 4 PASS, horizontal overflow 0.
- `node scripts/build-public-v7841.mjs --preview-allow-missing-generated-bundle` PASS (partial build simulation only).
- Full `npm run build` **NOT VERIFIED**: local `esbuild` မရှိလို့ fail ဖြစ်တယ်။ Live Netlify Login/Functions/Identity/DB/YKCR/Exam မစစ်ရသေးပါ။
- Netlify Preview/Staging မှာ `npm run build` သေချာအောင်လုပ်ပြီး Countdown / Login / Mock Exam စစ်ပြီးမှ Production ကို Deploy လုပ်ပါ။
- ZIP အသစ်ဟာ v7.86.4 Target Corrected ကို Base အဖြစ်သုံးထားတဲ့ hotfix ဖြစ်ပါတယ်။ အရင် Corrected ZIP အစား ဒါကို Latest Base လုပ်ပါ။
