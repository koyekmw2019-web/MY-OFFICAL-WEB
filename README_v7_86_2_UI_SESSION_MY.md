# YE KUN Official Website v7.86.2 — UX, Dictionary & Video Session Refinement

## Latest approved source
- Base: `YEKUN_v7.86.1_Admin_SQL_Mobile_Login_Stability_Fix.zip`
- New: `YEKUN_v7.86.2_Dashboard_Dictionary_Video_Session_Refinement.zip`
- Brand split: YE KUN = official personal website; STUDYING WITH YE KUN = education / learning / video / exams.

## Update လုပ်ထားတာ
1. **Dashboard Mobile Footer** — Mobile (720px နှင့်အောက်) မှာ BACK TO HOME / Logout Buttons ကို Fixed Overlay အစား Page ရဲ့ အောက်ဆုံးမှာပဲထားပါတယ်။ Content/Cards မဖုံးတော့ပါ။ Desktop Floating Bar မပြောင်းပါ။
2. **Admin Dashboard** — Header ကို Compact ပြင်ပြီး Dictionary Reports ကို Admin Management Tools အောက်သို့ ရွှေ့ထားပါတယ်။ Admin Role Check အဟောင်းကို ဆက်သုံးပါတယ်။
3. **Learning Overview** — `Smart Learning · v7.60` ဆိုတဲ့ Version Label ကို ဖယ်ပြီး Advanced Learning Tools ကို ခေါက်ထားနိုင်အောင်လုပ်ထားပါတယ်။ အမျိုးအစားမတူတဲ့ Exam Score တွေကို Raw Average တစ်ခုတည်း မတွက်တော့ပါ။ Exam Type အလိုက် Recorded Results ကိုပြပါတယ်။ Saved Mistakes 0 ဆိုတာ Wrong Answers 0 လို့ မဆိုလိုကြောင်း ရှင်းပြထားပါတယ်။ Wrong Answer, Daily Practice, Announcements, Admin Announcement Publishing ကို ဆက်ထားပါတယ်။
4. **Dictionary UI** — Word Card ထဲက Report Translation Error ကို `⋯ More` ထဲ ရွှေ့ထားပါတယ်။ Data/Report API/Admin Approval မပြောင်းပါ။ Review Pending အဖြစ် အမှန်အတိုင်း ဆက်ပြထားပြီး Legacy `PDF` Source Metadata ကို More/Details ထဲမှာ ကြည့်နိုင်ပါတယ်။
5. **Video Class** — Header မှာ မူလ STUDYING WITH YE KUN Horizontal Logo ကို သုံးထားပါတယ်။ Existing Netlify Identity SDK ရဲ့ `getUser()` ကိုသုံးပြီး Login ဝင်ထားရင် `Dashboard`, မဝင်ရသေးရင် `Login` ပြမယ်။ Role Routing ကို `dashboard.html` ရဲ့ ရှိပြီးသား Logic က ဆက်လုပ်ပါတယ်။ YouTube Free Previews အတွက် Login မလိုပါ။
6. **Cache/Version** — Service Worker Public Cache Version နဲ့ ဆိုင်ရာ CSS/JS Query Versions ကို Update လုပ်ထားပါတယ်။ Homepage Search Title မပြောင်းပါ။

## Database / Backend
- Migration အသစ် **မလိုပါ**။
- Original Netlify Functions၊ Database Migrations၊ Identity Client Source၊ Exam Rules၊ Payment၊ YKCR Sync၊ Dictionary Data၊ Anime Character Assets အားလုံး **Source Byte-for-byte မပြောင်းထားပါ**။
- Video Class မှာ Identity Bundle ကို ထပ် Load လုပ်တာက Session State ကို ဖော်ပြဖို့သာ ဖြစ်ပါတယ်; ဘယ်နည်းနဲ့မဆို Server Authorization ကို Frontend မှာ Override မလုပ်ပါ။

## QA
- `npm test` — PASS (Automated output ကို QA JSON မှာ ကြည့်ပါ)။
- Offline Browser Fixtures: video brand & account login state (320/390/1280), guest & expired state, Dashboard Dock (390/1280), Dictionary More, Learning Details — PASS။
- Public Output Preview: `node scripts/build-public-v7841.mjs --preview-allow-missing-generated-bundle` PASS — 8,542 Dictionary Records ထိန်းထားသည်။
- **Full Netlify Build မစစ်ရသေးပါ** — Local esbuild bundle မရှိတာကြောင့် `dist/assets/identity.bundle.js` မထုတ်နိုင်သေးပါ။ Netlify မှာ `npm run build` လုပ်ရပါမယ်။
- **Live Authentication, Payment, YKCR, SQL Database, YouTube Embed, Staging UI** — စစ်မပြီးသေးပါ။ Production သို့ မတင်မီ Deploy Preview (staging) နဲ့ စစ်ပါ။

## Deploy
1. ZIP Extract; GitHub Desktop ရဲ့ Existing Repo/Staging Branch ထဲ Files ကို Copy/Replace။ `.git` Folder မဖျက်ပါ။
2. `netlify.toml`: build command `npm run build`, publish `dist`, functions `netlify/functions`.
3. Staging/Deploy Preview: Admin Dashboard, Video Class Session, Dictionary Report, JLPT, Exam, Payment, YKCR, 320/390/1280px စစ်ပါ။
4. Build + Role/Auth + Functional Tests PASS မှသာ Production Merge/Deploy လုပ်ပါ။

## သတိပြုရန်
- Browser/Netlify SDK Session Expired ဖြစ်ရင် Video Class မှာ Login ပေါ်နေမှာ သဘာဝကျပါတယ်။ Existing Session ကို Logout မလုပ်ဘဲ Browser အားလုံးမှာ Share မလုပ်နိုင်ပါ။
- Earlier Dictionary Draft အားလုံး Expert Verified မဟုတ်သေးပါ။
- Files အရေအတွက်ဟာ ZIP ရဲ့ Root Items နဲ့ Full Entries အရေအတွက်မတူနိုင်ပါ။
