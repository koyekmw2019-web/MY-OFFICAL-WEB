# Boss ကြီးအတွက် — PR #4 QA repair အသုံးပြုနည်း

ဒီ package က **full website ZIP မဟုတ်ပါ**။ PR #4 remote head `082290577842ad98996c3156c65734e741adeaaf` အတွက် စမ်းသပ်ပြီးသား repair သီးသန့်ဖြစ်ပါသည်။ GitHub သို့ တင်ပြီးသား မဟုတ်ပါ။ `main` မှာ မသုံးပါနှင့်။

1. GitHub Desktop တွင် existing `MY-OFFICAL-WEB` repository ကိုဖွင့်ပြီး `release/v7.88.1-rc1-qa` ကိုရွေးပါ။ မပြီးသေးသော changes ရှိလျှင် သီးသန့်သိမ်းပါ။
2. Repository → Open in Terminal ဖြင့် အောက်ပါ read-only checks လုပ်ပါ။

```sh
git branch --show-current
git rev-parse HEAD
git status --short
```

Branch/head သည် အထက်ပါအတိုင်းကိုက်ပြီး working tree clean ဖြစ်ရပါမည်။ Remote head ပြောင်းသွားပါက blind overwrite မလုပ်ပါနှင့်။

3. ZIP ထဲမှ `QA_REPAIR.patch` path ကိုအသုံးပြု၍ အရင် check၊ ပြီးမှ apply လုပ်ပါ။ Path တွင် space ပါလျှင် quotes ထည့်ပါ။

```sh
git apply --check "PATH/TO/QA_PR4/QA_REPAIR.patch"
git apply "PATH/TO/QA_PR4/QA_REPAIR.patch"
npm ci
npm test
npm run build
npm run verify:release
```

`overlay/` တွင် changed files 36 ခုလည်း ပါသည်။ Patch နည်းလမ်းက source မကိုက်လျှင် refuse လုပ်နိုင်သဖြင့် ပိုရှင်းပါသည်။ Patch နှင့် overlay ကို နှစ်ကြိမ် apply မလုပ်ပါနှင့်။ Generated `dist/`, `node_modules/`, `assets/identity.bundle.js` ကို commit မထည့်ပါနှင့်။

4. GitHub Desktop diff ကိုစစ်ပြီး **QA branch သို့သာ** commit / Push origin လုပ်ပါ။ Existing GitHub → Netlify workflow က PR Preview ကိုဆက်လုပ်ပေးမည်။ PR #4 merge မလုပ်သေးပါနှင့်။
5. Preview success, isolated test DB နှင့် live E2E evidence ရပြီးမှ release ပြန်သုံးသပ်ပါ။ Production credentials ပါသည့် preview တွင် payment/YKCR test မလုပ်သေးပါနှင့်။

အသေးစိတ်: `QA_REPORT_MY.md`။ လက်ရှိ status: **Local QA PASS / Release NO_GO**။
