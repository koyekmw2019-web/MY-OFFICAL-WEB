# YE KUN Official Website — v7.80 Stability & Speed

အခြေခံ Source: **v7.79 SEO & JLPT**။ UI၊ Branding၊ SEO၊ Dictionary၊ JLPT/Driving Exams၊ Login၊ Dashboard၊ Payment၊ YKCR Sync နှင့် Netlify Backend တို့ကို ထိန်းသိမ်းထားပါသည်။

## တကယ်ပြင်ထားသော အချက်များ

1. `index.html` ထဲရှိ inline Base64 JPEG/PNG ပုံ **32 ပုံ** ကို SHA-256 fingerprint ပါသော `assets/embedded-v780/` ဖိုင်များအဖြစ် အတိအကျ Byte-for-byte ခွဲထုတ်ထားသည်။ မူလပုံ အရည်အသွေး/ဒီဇိုင်းကို မပြောင်းထားပါ။
2. မူလ Base64 image URL များကို သက်ဆိုင်ရာ Local Asset Link များဖြင့် အစားထိုးထားသည်။ Exam မှာ သုံးမည့် Visual Question ပုံများလည်း ဆက်ရှိနေပါသည်။
3. Main Page အောက်ပိုင်းရှိ Profile/Nexlynk image နှစ်ပုံကို `loading="lazy"` နှင့် `decoding="async"` ထည့်ထားသည်။
4. PWA Service Worker ကို Public static assets အတွက်သာ caching ပြုလုပ်အောင် ထိန်းထားသည်။ Navigation HTML၊ API/Netlify Functions၊ Admin pages၊ Authorization ပါသော requests များကို cache မလုပ်ပါ။
5. Netlify မှာ Fingerprint ပါသော ပုံများကို immutable caching လုပ်နိုင်ရန် Header Rules ထည့်ထားသည်။
6. `package.json` Version ကို `7.80.0` သတ်မှတ်ထားပြီး Performance/Cache Behavior Regression Tests ကို ထည့်ထားသည်။

## ဖိုင်အရွယ်အစား (Homepage `index.html` သာ)

| | v7.79 | v7.80 |
|---|---:|---:|
| HTML bytes | 5,071,924 | 798,707 |
| Gzip estimate | 3,308,104 | 177,032 |

HTML အရွယ်အစား **84.25% ခန့်** လျော့သွားပါသည်။ ပုံများကို ဖယ်ရှားထားခြင်းမဟုတ်ဘဲ သီးခြားဖိုင်အဖြစ် ရွှေ့ထားခြင်းဖြစ်သောကြောင့် **Website အမှန်တကယ် Load Time 84% လျော့မည်ဟု အာမခံခြင်း မဟုတ်ပါ။**

## QA ရလဒ်

- `npm test` — PASS (အရင် Regression Tests နှင့် v7.80 Tests)
- Backend Functions/Migrations — v7.79 နှင့် SHA-256 တူညီ၊ မပြောင်းထား
- Externalized images — 32 ပုံ၊ SHA-256 data integrity PASS
- PWA Cache Safety Test — PASS
- Local HTTP Static Asset Serving — HTTP 200
- Full Netlify Build — **မစစ်နိုင်သေး** (စမ်းသပ်ပတ်ဝန်းကျင်တွင် npm registry DNS EAI_AGAIN / `esbuild` မရှိ)
- Full Browser Visual Test — **မစစ်နိုင်သေး** (Local Chromium navigation ကို Environment က `ERR_BLOCKED_BY_ADMINISTRATOR` ဖြင့်ပိတ်ထားသည်)
- Production ကို တိုက်ရိုက် Deploy မလုပ်ထားပါ။

## GitHub Desktop / Netlify Deploy Preview Checklist

1. လက်ရှိ Repository ကို Backup Commit ပြုလုပ်ပြီး၊ ZIP Extract ကို Repo Root ထဲ Copy (မူလ `.git` မဖျက်ပါနှင့်)။
2. GitHub Desktop မှာ Changes စစ်ပြီး Commit/Push လုပ်ပါ။
3. Netlify Deploy Preview တွင် `npm run build` အောင်မြင်ကြောင်း စစ်ပါ။
4. Mobile/Desktop မှာ STUDY HUB Truck/Taxi/Bus ၃ Card၊ `View More` နှင့် Book Covers၊ Dictionary Search/Favorite၊ JLPT N1–N5 Mock Exam၊ Login/Logout ကို စမ်းသပ်ပါ။
5. Student/YKCR Sync နဲ့ Payment Flow ကို Live စမ်းသပ်ပြီးမှ Production သို့ Publish လုပ်ပါ။
6. Chrome DevTools Lighthouse (Mobile) ဖြင့် v7.79 နှင့် v7.80 တကယ့် Speed ကို နှိုင်းယှဉ်ပါ။

**မပြောင်းထားသောအရာများ:** Homepage SEO Title `YE KUN Official Website | YE LINN OO`; Source Dictionary 8,542 entries (ဘာသာပြန် Draft များကို အကုန် မှန်ကြောင်း Human QA မပြီးသေး); Login/Payment/Exam/Netlify Backend; UI/Layout။
