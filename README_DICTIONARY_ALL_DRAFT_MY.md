# YE KUN Dictionary — 8,542 Myanmar Glosses Populated (Draft)

**အခြေခံ Version:** v7.78 (Brand / Dashboard Logos / STUDY HUB မပြောင်းထားပါ)။

- စကားလုံးစုစုပေါင်း **8,542** လုံးရှိပြီး Myanmar meaning field အလွတ် **0** လုံး ဖြစ်ပါပြီ။
- ယခင် Myanmar gloss 2,708 လုံး မပြောင်းထားပါ။ ကျန် **5,834** လုံးကို ယခုဖြည့်ထားပါသည်။
- ထပ်ဖြည့်သည့် စကားလုံးများမှာ အများစုသည် **Google Translate ဖြင့် ထုတ်ထားသော draft** ဖြစ်ပါသည်။ အမှန်တကယ် Japanese/Burmese ဘာသာပြန်ကျွမ်းကျင်သူ၏ တစ်လုံးချင်း အတည်ပြုချက် မဟုတ်ပါ။
- မူရင်း Japanese/Reading/English အမှားရှိနိုင်သော Entry များအတွက် `DICTIONARY_v7_78_SOURCE_REVIEW_QUEUE.csv` ကို စစ်ဆေးပါ။
- `DICTIONARY_v7_78_COMPLETE_DRAFT_NEW_TRANSLATIONS.csv` မှာ အသစ်ဖြည့်ထားသော စကားလုံး 5,834 လုံး ပါဝင်ပါသည်။
- Dictionary နဲ့ အခြား Data များကို မပြောင်းထားဘဲ Source Code မှာ `assets/yk-dictionary-v778-complete-draft.js` ကို Load လုပ်ထားပါသည်။
- အသစ်ဖြည့်ထားသော Entry တွေရဲ့ `translation_review_status` = `review_required` ဖြစ်ပြီး မှားယွင်းနိုင်ပါသည်။
- **Blank fields 0 သည် semantic accuracy 100% ကို မဆိုလိုပါ**။ Production မှာ အမှားတင်မိမှာစိုးရင် Deploy Preview / အသုံးပြုသူ Feedback နဲ့ စစ်ဆေးပြီးမှ ပြောင်းပါ။

## Test

`npm test` ဖြင့် Source Tests စစ်ပါ။ Build အတွက် `npm ci && npm run build` ကို Netlify/Local တွင် စမ်းပါ။

