YE KUN Mobile Bottom Menu — Preview Candidate

အခြေခံ: main v7.87.4 / 1d5c21cdb234add7ca33c4fd456ea6cd81d0a89a
Menu: Home · Study · Exam · Video · Account
Status: Local tests/build PASS. Production release approval pending.

ထည့်သွင်းနည်း
1. လက်ရှိ local ပြင်ဆင်ထားသောဖိုင်များကို commit သို့ backup လုပ်ထားပါ။
2. GitHub Desktop မှ main ကိုရွေးပြီး Fetch/Pull လုပ်ပါ။ main သည် အထက်ပါ commit ထက်ပြောင်းနေပါက package.json ကို အတင်းမအစားထိုးပါနှင့်။ အရင်နှိုင်းယှဉ်ရန်လိုသည်။
3. main မှ feature/mobile-bottom-nav branch အသစ်ဖန်တီးပါ။ main ပေါ်တွင် ဖိုင်အစားမထိုးပါနှင့်။
4. ZIP ထဲမှ package.json၊ assets၊ scripts၊ tests ကို repository root ထဲသို့ ကူးထည့်ပါ။ ဖိုင်တွဲတစ်ခုလုံးကိုဖျက်အစားထိုးခြင်းမလုပ်ဘဲ ဖိုင်များပေါင်းထည့်ပါ။ ရှိပြီးသား package.json တစ်ဖိုင်သာ အစားထိုးရပါမည်။
5. Changes တွင် ၅ ဖိုင်သာ ရှိကြောင်းစစ်ပါ။ netlify/၊ SQL၊ YKCR၊ backend ပြောင်းလဲမှုမရှိရပါ။
6. Commit → Publish branch/Push origin → main သို့ PR အသစ်ဖွင့်ပါ။ အဟောင်း PR #4 ကို မသုံးပါနှင့်။
7. Netlify Deploy Preview တွင် ဖုန်းဖြင့် စမ်းသပ်ပါ။ အတည်မပြုမချင်း Merge/Production deploy မလုပ်ပါနှင့်။

Preview တွင်စစ်ရန်
- Home/Study/Exam/Video/Account အားလုံး မှန်သောစာမျက်နှာရောက်ခြင်း။
- Login မဝင်ထားသူ Account နှိပ်လျှင် မူလ Login flow၊ ဝင်ထားသူ role အလိုက် Dashboard ရောက်ခြင်း။
- iPhone/Android portrait/landscape မှာ Menu၊ စာနှင့် နောက်ဆုံးခလုတ်များ မဖုံးခြင်း။
- စာရိုက်ချိန်၊ hamburger၊ payment modal၊ active exam တွင် Menu ဖျောက်ခြင်း။
- ရှိပြီးသား Logout၊ Back၊ video fullscreen အလုပ်လုပ်ခြင်း။
- Desktop တွင် Mobile Menu မပေါ်ခြင်း။
- Preview database isolation ကို စစ်ပြီးမှ test account ဖြင့် exam/payment regression စမ်းရန်။ ငွေပေးချေမှုအစစ်၊ production data ပြောင်းလဲခြင်း မလုပ်ရန်။

Rollback: ဒီ branch ၏ commit ကို revert လုပ်ပါ။ Database rollback မလိုပါ။
Source HTML တွင် menu ကိုတိုက်ရိုက်ထည့်ထားခြင်းမဟုတ်ပါ။ npm run build အောင်မြင်ပြီး postbuild က dist ထဲတွင်ထည့်သည်။ အခြား build script အဟောင်းများကို မပြောင်းထားပါ။
