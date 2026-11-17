STUDYING WITH YE KUN — v7.88.0 RC1 Simple Build Fix
NOT STABLE · QA BRANCH ONLY · NO PRODUCTION

Boss ကြီးအတွက် လုပ်ရမယ့် ၃ ချက်

1) GitHub Desktop မှာ Current Branch > New Branch ကိုနှိပ်ပြီး
   qa/v7.88.0-simple-build-fix
   ဆိုတဲ့ QA Branch အသစ်ဖန်တီးပါ။ main ကို မပြောင်းပါနဲ့။

2) ဒီ ZIP ကို ဖြည်ပါ။ ZIP ထဲက assets နဲ့ netlify Folder နှစ်ခုကို
   Website Repository Root Folder ထဲ Copy/Paste လုပ်ပါ။
   မူလ Folder နဲ့ Merge / ဖိုင်နှစ်ဖိုင်ကို Replace လုပ်ပါ။
   ZIP ဖိုင်ကိုယ်တိုင် GitHub ထဲ မတင်ပါနဲ့။
   .cmd Run ဖို့ မလိုပါဘူး။

3) GitHub Desktop > Changes မှာ ဒီဖိုင် ၂ ဖိုင်ပဲ ပြောင်းတာ စစ်ပါ။
     assets/yk-jlpt-learning-v782-state.js
     netlify/functions/jlpt-learning-progress.mts
   ပြီးရင် QA Branch မှာ Commit + Push လုပ်ပါ။
   Preview Build စမ်းပါ။ main သို့ Merge မလုပ်ပါနဲ့။

Why: The old source contains a 500-item limit for JLPT progress and
bookmarks. The v7.88.0 build checker requires 2000. This ZIP contains
exactly the two source files with that six-occurrence, 500->2000 repair
applied. No script needs to be run before a build.

SAFE BASELINE:
GitHub main commit 266700a1529d63a95172922a81b07906f6b43aaf
Existing file SHA at this baseline:
Client: cc7049dbbd5fc9d52c520f25017fdb06fa2960e9
Server: af0a71083f27db83b2a65862e24c2ea400c7a9c9
Use on this baseline only. Stop if your repository has changed these
files since that commit; do not overwrite new changes blindly.

QA LIMITATIONS:
- Code syntax checks passed; isolated 524-item client and mock server tests passed.
- Full website npm run build, Netlify Preview, real phone and cloud database
  tests have NOT been performed here.
- This ZIP only fixes the identified progress-capacity build blocker.
  Additional build errors could still appear.
- v7.88.0 Grammar Content is still NOT approved as a Stable Release.
- No production, GitHub, or database changes were made by the assistant.
