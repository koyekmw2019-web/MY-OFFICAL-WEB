STUDYING WITH YE KUN | Mobile UI Fix v7.87.5-rc1
================================================
အခြေအနေ: PREVIEW CANDIDATE / NOT STABLE
GitHub Repository: koyekmw2019-web/MY-OFFICAL-WEB
Base branch: main
Verified main commit: bf359245609c015d331d3a3715fb030d144ccf57
Previous source ZIP: YEKUN_Main_UI_Refresh_Language_Theme_Preview_v1.zip
Previous ZIP code files vs GitHub main: 9/9 MATCH (Git blob hashes)

ဒီ ZIP က Full Website ZIP မဟုတ်ပါ။ PATCH ZIP သာဖြစ်ပါတယ်။
မူလ Project Folder ကို မဖျက်ပါနဲ့။

ဘာတွေပြောင်းလဲသလဲ
- Home အပေါ်က Space ကို Fixed Header အတိုင်း ပြန်တွက်ပြီး 14px ဝန်းကျင် ထားနိုင်ရန်
- Exam Center အပေါ်က Space ကို လျှော့ရန်
- JLPT Hamburger ကို Touch Highlight 170ms ပြပြီးမှ မူလ Click Handler ကို ခေါ်ရန်
- Smooth Scroll v1 logic ကို ဆက်ထိန်းရန်
- Light/Dark Theme နှင့် Language Dropdown ကို မပြင်/မဖျက်ရန်
- Unique asset names ?v=7875rc1 ဖြင့် Browser Cache အဟောင်းကို ရှောင်ရန်

Code Files (6):
  MODIFY  scripts/build-mobile-ui-polish.mjs
  ADD     assets/yk-v7875-rc1-ui.css
  ADD     assets/yk-v7875-rc1-ui.js
  ADD     tests/v7875-mobile-fix.mjs
  ADD     tests/v7875-runtime.mjs
  ADD     tests/v7875-browser-smoke.py  (Optional local Chromium QA)

အရေးကြီး: package.json ကို ZIP မှာ မထည့်ထားပါ။
Existing npm postbuild/test မှာ build-mobile-ui-polish.mjs ကို ခေါ်ပြီးသားမို့
အပေါ်ဖိုင် ၆ ခု ထည့်ရုံနဲ့ နောက်ဆုံး Build အချိန်မှာ Patch လည်ပတ်ပါတယ်။
Release identity v7.87.5-rc1 ကို PATCH_MANIFEST.json ထဲ သတ်မှတ်ထားပါတယ်။
package.json version 7.87.4 ကို source compatibility အတွက် မပြောင်းသေးပါ။

GitHub Desktop Instructions:
1. GitHub Desktop မှာ MY-OFFICAL-WEB ကိုရွေးပြီး main ကို Fetch Origin လုပ်ပါ။
2. main SHA bf359245609c015d331d3a3715fb030d144ccf57 ဟုတ်မဟုတ် စစ်ပါ။
3. Main SHA ပြောင်းထားရင် STOP: ဖိုင်တွေကို compare ပြန်လုပ်ပြီးမှ ဆက်ပါ။
4. main ကနေ feature/mobile-ui-v7875-rc1 Branch အသစ်ဖန်တီးပါ။
5. ZIP ထဲက Code Files ၆ ခုကို ORIGINAL Folder Path အတိုင်း ပေါင်းထည့်ပါ။
6. GitHub Desktop Changes ၆ files ONLY ဖြစ်ကြောင်း စစ်ပါ။
   (1 modified + 5 added; README/Logs/Manifest က Repo ထဲ ထည့်စရာမလိုပါ)
7. Project Root မှာ npm test နှင့် npm run build run လုပ်ပါ။
   `node tests/v7875-mobile-fix.mjs --release` ကို Build ပြီးမှ Run လုပ်ပါ။
   `node tests/v7875-runtime.mjs` ကိုလည်း Run ပါ။
8. Full Test/Build PASS မဖြစ်ရင် Commit/Push မလုပ်ပါနဲ့။
9. PASS ပြီးရင် Commit & Push → Draft Pull Request → Netlify Deploy Preview → Real Phone QA.
10. Boss ကြီး အတည်ပြုပြီးမှ main ထဲ Merge လုပ်ပါ။

Protected systems:
No modifications to netlify/functions/**, netlify/database/**, migrations,
Identity, YKCR, Payment, Login, Exam engine, exam access or scoring logic.

QA limitations:
Full source repo build/Netlify preview/real device testing are still PENDING.
Local simulated build of 42 HTML pages and local headless Chromium PASS.
See QA_REPORT.md for precise evidence.
