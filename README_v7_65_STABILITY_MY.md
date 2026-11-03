# YE KUN Official Website v7.65 — Stability / Furigana Integrity

## အဓိက Update

- v7.64 ကိုအခြေခံထားတဲ့ **Staging Release Candidate** ပါ။ Live Netlify ကို မတင်ထားပါ။
- **JLPT N1–N5 文字・語彙 / 読み方 စာမေးပွဲ** ဖြေစဉ် Furigana က အဖြေဖော်ပြမိတဲ့ပြဿနာကို ပိတ်ထားပါတယ်။ အဖြေတင်ပြီးမှ Review မှာ Furigana ပြန်မြင်နိုင်ပါတယ်။
- Grammar/Reading ရဲ့ known Kanji စကားလုံးတွေမှာ Furigana သင်ထောက်ကူ အဖြစ် ဆက်ပြပါတယ်။ Full Level-by-Level Linguistic Audit မဟုတ်သေးပါ။
- **My Learning Overview** Graph မှာ JLPT 180 မှတ်၊ Truck/Taxi/Bus 50၊ Car/Motorcycle 95၊ Moped 48၊ Maintenance 45 ကို 0–100% အဖြစ် normalize လုပ်ပြီး ပြပါတယ်။ Server Verification ရှိတဲ့ Submitted Result ပဲ plot မှာ ပါပါတယ်။
- Exam Type အလိုက် Filter ပါပါတယ်။ မသိတဲ့/အမှတ်မမှန်တဲ့ Exam Type ကို graph မှာ မပြပါ။
- Login၊ Payment၊ YKCR Sync၊ Auto Save/Resume၊ Netlify Function၊ မူလ Database Migration တွေကို မပြောင်းထားပါ။
- Service Worker VERSION marker နဲ့ package version ကို v7.65 အဖြစ် Update လုပ်ထားပါတယ်။

## Installation / Netlify

1. မူလ GitHub Repository / Netlify Data ကို Backup ယူပါ။
2. ZIP ထဲက Website Source Files ကို GitHub Repository အမြစ်မှာ ထည့်ပါ။
3. GitHub Desktop မှာ Changed Files စစ်ပြီး Commit / Push လုပ်ပါ။
4. Production မတင်ခင် Netlify Deploy Preview / Staging မှာ Login, Account Roles, Student Verification, Payment, Real Auto Save & Resume, All Exam Types, JLPT N1–N5 ကို စမ်းသပ်ပါ။
5. Admin Approve / Reject / Soft Delete လုပ်ပြီး Paid Access မထိခိုက်တာကို စစ်ပါ။
6. အမှားမရှိမှ Live Deploy ကို ဆောင်ရွက်ပါ။

**သတိ**: Browser QA က Mock API / Fake Account နဲ့ စမ်းထားတာပါ။ Production Netlify Database, actual Identity sessions, actual YKCR data နဲ့ End-to-End စမ်းသပ်ချက် မဟုတ်သေးပါ။

**Stability Release Candidate**, Production Stable စာရင်းသတ်မှတ်မယ့်အတွက် Staging QA အောင်မြင်ဖို့လိုပါတယ်။
