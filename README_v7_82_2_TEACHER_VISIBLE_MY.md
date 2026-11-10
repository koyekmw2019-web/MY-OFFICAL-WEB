# YE KUN Official Website v7.82.2 — Teacher Visibility Fix

Base: v7.82.1 Anime Student & Teacher UI. အခြား Brand/Content/Access Rule မပြောင်းထားပါ။

## ဘာပြင်ထားသလဲ?

- STUDY HUB ရဲ့ anime welcome banner တွင် Student/Teacher ပုံနှစ်ပုံကို ထပ်မနေရအောင် ဘေးချင်းယှဉ် Grid Layout ပြောင်းထားပါတယ်။
- JLPT Learning Center main hero နှင့် ၄ မျိုးသော Account Dashboard JLPT progress banner မှာလည်း တူညီစွာ ပြင်ထားပါတယ်။
- Mobile 320px/390px၊ Tablet 900px၊ Desktop 1365px အတွက် layout QA စစ်ထားပါတယ်။
- **မူရင်း Student + Teacher `assets/characters/*-v7821.webp` ပုံများကို byte-for-byte မပြောင်းထားပါ။**
- Styling change ကို `assets/yk-jlpt-characters-v7822.css` ဖိုင်အသစ်နဲ့ သီးခြားထည့်ထားပါတယ်။ Browser cache မရောစေရန် HTML တွင် CSS link အသစ်ထည့်ထားပါတယ်။

## မပြောင်းထားတဲ့ System များ

Dictionary 8,542၊ JLPT Learning Content 152၊ Mock Exam / Scoring / Payment၊ Login / Dashboard function၊ YKCR Sync၊ SEO/Sitemap/PWA စသည့် ရှိပြီးသား data/backend ကို မပြောင်းထားပါ။ `package.json` Version ကို `7.82.2` သို့သာ ပြင်ထားပါတယ်။

## QA

- `npm test` : PASS
- Browser Component Preview: STUDY HUB Desktop 1365/900px, Mobile 390/320px; JLPT Learning 1365/390px PASS (ပုံနှစ်ပုံလုံး load + မထပ် + horizontal overflow မရှိ)
- ZIP integrity စစ်ဆေးပြီး
- **Full Netlify Build မစစ်နိုင်သေးပါ**: ယခု environment မှာ `esbuild` မရှိပါ။ Netlify Preview build ဖြင့် ထပ်စစ်ပါ။
- Live Login/Payment/YKCR က Browser component test မဟုတ်ပါ။ Production မတင်မီ Deploy Preview မှာ စစ်ပါ။

## Deploy

လက်ရှိ GitHub Desktop Repository ကိုပဲ သုံးပါ။ v7.82.1 backup commit ထားပြီး ZIP ထဲက Source ကို repo root မှာ overwrite လုပ်ပါ။ Netlify Preview ကိုစစ်ပြီးမှ production သို့ publish လုပ်ပါ။
