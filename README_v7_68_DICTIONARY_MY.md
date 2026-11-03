# YE KUN Official Website v7.68 — JLPT Dictionary Bank

## အခြေခံ
v7.67 source ZIP ကို အခြေခံထားပါတယ်။ မူရင်း Dictionary, Search, Favorites, History, Pronunciation, Login, Dashboard, JLPT Exam, Payment, YKCR, Netlify Functions/Database ကို မဖျက်၊ မပြောင်းထားပါဘူး။

## ထည့်ထားတဲ့ Dictionary
- PDF ၈ ဖိုင်ကနေ Candidate 8,518 records (unique 7,853) ကို စစ်ဆေးထားပါတယ်။
- Kana/Furigana + မြန်မာအဓိပ္ပာယ်ကို လက်ဖြင့်စစ်ထားတဲ့ JLPT entries **360 ခု** ကို Runtime Dataset ထဲ ထည့်ထားပါတယ်။
- v7.67 base Dictionary အတွင်းနဲ့ keys တူတာ 29 ခုမှာ မူရင်းအဓိပ္ပာယ်နဲ့ Favorites key မပြောင်းဘဲ Level Source Tag ကိုပဲ ထပ်ထည့်ပါတယ်။
- အသစ်ထည့်သွင်းနိုင်တဲ့ entries (inline base ကိုသာ နှိုင်းယှဉ်): 331 ခု။ v7.49 JLPT အဟောင်း entries တွေကို runtime မှာ ထပ်စစ်ပေါင်းစည်းပါတယ်။
- JLPT Level အလိုက်: {'N5': 144, 'N4': 26, 'N3': 65, 'N2': 60, 'N1': 65}။ Source PDF က သတ်မှတ်ထားတဲ့ level သာဖြစ်ပြီး တရားဝင် JLPT Word List မဟုတ်ပါ။
- စစ်ထားပြီး ကိုယ်ပိုင်ရေးသားထားတဲ့ ဥပမာဝါကျ 42 ခု ပါပါတယ်။

## PDF Source
- MKT_JLPT_word-N1.pdf, JLPT-N1-Vocabulary-1-1.pdf
- Complete-JLPT-N2-vocabulary-list-PDF.pdf, JLPT-N2-Vocabulary.pdf
- JLPT-N3-Vocabulary-.pdf
- Adjectives_For_JLPT_N4.pdf
- JLPT N5 Jp vocabulary.pdf, Vocabulary_of_JLPT_N5.pdf
- 直前対策 JLPT N1–N5 PDF ငါးဖိုင်ကို Reference အဖြစ် စစ်ဆေးထားပါတယ်။ Scan books ဖြစ်လို့ စာလုံးအားလုံး OCR နဲ့ မတင်ထားပါဘူး။

## QA Note
- Burmese meaning စစ်မပြီးသေးတဲ့ candidate တွေကို **Website Dictionary ထဲ မထည့်ထားပါ**။ `DICTIONARY_v7_68_REVIEW_QUEUE.csv` ထဲမှာ Manual Review ပြုလုပ်နိုင်ပါတယ်။
- စာလုံးတစ်လုံးမှာ အသံထွက်အမျိုးမျိုးရှိနိုင်လို့ မသေချာတဲ့ Reading တွေကို မပေါင်းမိအောင် Key = Japanese + Kana ကို သုံးပါတယ်။
- PDF အပြည့်အစုံကို ZIP ထဲ မထည့်ပါဘူး။
- Production Netlify Database အစစ်နဲ့ Login/Payment/Exam End-to-End QA မလုပ်ရသေးပါဘူး။ Staging မှာ အရင်စစ်ပါ။
