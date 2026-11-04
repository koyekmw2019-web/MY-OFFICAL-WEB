# YE KUN Official Website — v7.75 Study Hub JLPT (Source)

အခြေခံ Source: `YE_KUN_Official_Website_v7_74_N1_Translation_Continuation.zip`

## Update

- Screenshot မှာရှိတဲ့ `STUDY HUB` Grid (`#studyHubGridV733`) ထဲ JLPT N5/N4/N3/N2/N1 Card (၅) ခု ထည့်ထားပါတယ်။ သီးခြား Page/Backend အသစ် မဆောက်ပါ။
- Truck / Taxi / Bus / 自動車整備 / 普通自動車 / 二輪 / 原付 Card အဟောင်း (၇) ခု မဖျက်ထားပါ။
- အရင် `View More` ကို `View More · JLPT` လို့ ပြင်ထားပြီး Card အားလုံးကို ချဲ့ကြည့်နိုင်ပါတယ်။
- JLPT Card တစ်ခုစီမှာ ရှိပြီးသား Dictionary Level Filter၊ အကောင့်/Exam Access ကို စစ်တဲ့ Mock Exam Launch၊ Level-specific Exam Card တို့ကို ချိတ်ထားပါတယ်။
- `Dictionary` → ရှိပြီးသား Level Filter (JLPT N5–N1), `Mock Exam` → existing exam access request flow, `Exam Scope` → selected level's existing JLPT exam card.
- Japan / Myanmar / English Text Attributes ဆက်သုံးထားပါတယ်။ Desktop မှာ 3-column Card Grid၊ Mobile မှာ Card / Button Stack Design ကို မပြောင်းထားပါ။

## Scope

ဒီ Update က STUDY HUB ရဲ့ Navigation / Shortcuts Update ဖြစ်ပါတယ်။ Grammar/Listening သင်ခန်းစာအသစ်၊ စကားလုံး/ဘာသာပြန် Data အသစ်၊ Mock Exam Question အသစ် မထည့်ပါ။ ရှိပြီးသား Module တွေကိုသာ ချိတ်ထားတာပါ။

## Backend & Translation

- မူလ `netlify/functions` / `netlify/database` / Auth / Payment / YKCR Sync / Exam Backend ဖိုင်များ မပြောင်းထားပါ။
- v7.74 ရဲ့ Dictionary QA အခြေအနေ (8,542 စကားလုံး / ဘာသာပြန်ပါရှိ 2,350 / Pending 6,192) ကို မပြောင်းထားပါ။ ဒါက Dictionary Complete Version မဟုတ်ပါ။
- Live Netlify Deployment ကို တိုက်ရိုက် ပြင်ဆင်ခြင်း မလုပ်ထားပါ။

## GitHub Desktop / Netlify

လက်ရှိ Repository ကိုသာ Update လုပ်ပါ။ v7.75 ZIP မှာ Source Files တွေပါဝင်ပြီး `.git` folder မပါပါ။ `npm install` / `npm run build` က Netlify Build Environment မှာ လုပ်ရန်လိုပါတယ်။ Build ပြီးရင် `assets/identity.bundle.js` ကို generate လုပ်မှာပါ။ Build Settings ကို မပြောင်းပါ။

## QA

- `npm test` : PASS (existing integration/static checks + new 6 checks).
- New `tests/v775-study-hub-jlpt.mjs` : 6 PASS / 0 FAIL.
- Website JavaScript syntax: existing v7.74 smoke test PASS.
- Build verification: local network restrictions အကြောင့် npm dependencies install မရခဲ့သဖြင့် `npm run build` ကို အတည်မပြုနိုင်သေးပါ။
- Browser visual test: local browser access restricted (`ERR_BLOCKED_BY_ADMINISTRATOR`); Desktop/Mobile actual rendering ကို QA မပြီးသေးပါ။

**Release Recommendation:** Netlify Deploy Preview သို့မဟုတ် local development server မှာ Card Grid, Mobile layout, Dictionary Level Filter, Login-gated JLPT Mock Exam, Paid/Student Access Rules, and PWA refresh ကို စစ်ပြီးမှ Production တင်ပါ။
