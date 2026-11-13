/** v7.87.18: exam guest/plan text-only improvement on the already-built public exam pages.
 * Do not change exam access, price IDs, checkout handlers, payment, student/identity or server code.
 * The v7.87.4 exam runtime owns the DOM. Its v7.37 locale map is extended, never replaced.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dist=resolve('dist');
const types=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const routes=['mock-exams.html',...types.map(type=>`exams/${type}.html`)];
const copy={
  en:{
    'Guest Access':'Guest Access',
    'Log in or register to take an exam. Each exam type includes one free attempt per account. STUDYING WITH YE KUN students can verify their enrollment with Student Verify. To purchase a plan, select View Plans.':'Log in or register to take an exam. Each exam type includes one free attempt per account. STUDYING WITH YE KUN students can verify their enrollment with Student Verify. To purchase a plan, select View Plans.',
  },
  my:{
    'Guest Access':'ဧည့်သည်အသုံးပြုခွင့်',
    'Log in or register to take an exam. Each exam type includes one free attempt per account. STUDYING WITH YE KUN students can verify their enrollment with Student Verify. To purchase a plan, select View Plans.':'စာမေးပွဲဖြေဆိုရန် Login / Register လိုအပ်ပါသည်။ အကောင့်တစ်ခုလျှင် စာမေးပွဲအမျိုးအစားတစ်ခုစီကို အခမဲ့ ၁ ကြိမ် ဖြေဆိုနိုင်ပါသည်။ STUDYING WITH YE KUN ၏ ကျောင်းသားဖြစ်ပါက Student Verify မှတစ်ဆင့် ကျောင်းသားအဖြစ် အတည်ပြုပြီး အသုံးပြုနိုင်ပါသည်။ ပုံမှန် Access Plan ဝယ်ယူလိုပါက View Plans ကို နှိပ်ပြီး မိမိနှစ်သက်ရာ Plan ကို ရွေးချယ်နိုင်ပါသည်။',
    'One free attempt per exam type · Student verification or paid access is available.':'စာမေးပွဲအမျိုးအစားတစ်ခုစီကို အခမဲ့ ၁ ကြိမ် ဖြေနိုင်ပါသည်။ ကျောင်းသားအတည်ပြုခြင်း သို့မဟုတ် Paid Plan ဖြင့် ဆက်အသုံးပြုနိုင်ပါသည်။',
    'One free attempt available for each exam type.':'စာမေးပွဲအမျိုးအစားတစ်ခုစီအတွက် အခမဲ့ ၁ ကြိမ်စီ ရရှိပါသည်။',
    'Exam Plans':'စာမေးပွဲ Access Plan များ',
    'Access starts on Admin approval date':'Admin အတည်ပြုပြီးသည့်အချိန်မှ Access စတင်အသုံးပြုနိုင်ပါသည်။',
    'Bank Transfer only. After transfer, upload your receipt. Access begins when Admin approves the request.':'Bank Transfer ဖြင့် ငွေပေးချေပါ။ ငွေလွှဲပြီးပါက ငွေလွှဲပြေစာ သို့မဟုတ် Screenshot ကို Upload လုပ်ပါ။ Admin အတည်ပြုပြီးသည့်အချိန်မှ Access စတင်အသုံးပြုနိုင်ပါသည်။',
    'Choose Plan':'Plan ရွေးရန်',
    'View Plans':'View Plans',
    'Login / Register':'Login / Register',
    'Student Verify':'Student Verify',
    'Select a plan to continue.':'မိမိနှစ်သက်ရာ Plan ကို နှိပ်ပြီး ဆက်လုပ်ပါ။',
  },
  ja:{
    'Guest Access':'ゲスト利用',
    'Log in or register to take an exam. Each exam type includes one free attempt per account. STUDYING WITH YE KUN students can verify their enrollment with Student Verify. To purchase a plan, select View Plans.':'受験にはログインまたは新規登録が必要です。アカウントごとに試験種別それぞれ1回、無料で受験できます。STUDYING WITH YE KUNの受講生はStudent Verifyで受講生認証を行えます。有料プランの購入はView Plansからお選びください。',
    'One free attempt per exam type · Student verification or paid access is available.':'各試験種別につき無料受験1回。受講生認証または有料プランをご利用いただけます。',
    'One free attempt available for each exam type.':'試験種別ごとに無料受験1回をご利用いただけます。',
    'Exam Plans':'模擬試験アクセスプラン',
    'Access starts on Admin approval date':'管理者が承認した時点から利用できます。',
    'Bank Transfer only. After transfer, upload your receipt. Access begins when Admin approves the request.':'銀行振込でお支払いください。振込後、明細書またはスクリーンショットをアップロードしてください。管理者の承認時から利用を開始できます。',
    'Choose Plan':'プランを選択',
    'View Plans':'プランを見る',
    'Student Verify':'受講生認証',
    'Select a plan to continue.':'ご希望のプランを選択してお進みください。'
  }
};
const englishGuest='Login / Register required · One free attempt per exam type.';
const newGuest='Log in or register to take an exam. Each exam type includes one free attempt per account. STUDYING WITH YE KUN students can verify their enrollment with Student Verify. To purchase a plan, select View Plans.';
const mini=[
 {en:'1 Week ¥1,000 · 1 Month ¥2,000',my:'၁ ပတ် ¥1,000 · ၁ လ ¥2,000',ja:'1週間 ¥1,000 · 1か月 ¥2,000'},
 {en:'3 Months ¥3,000 · 1 Year ¥5,000',my:'၃ လ ¥3,000 · ၁ နှစ် ¥5,000',ja:'3か月 ¥3,000 · 1年 ¥5,000'}
];
// The strings are trusted editor-written fixed labels, not account data.
const spans=mini.map(row=>`<span class="yk8718-plan-line" data-en="${row.en}" data-my="${row.my}" data-ja="${row.ja}">${row.en}</span>`).join('<br>');
const translation='\n/* v7.87.18: targeted guest / plan copy, latest exact-key translations win. */\n'+
  'Object.assign(V737_TEXT.my,'+JSON.stringify(copy.my)+');\n'+
  'Object.assign(V737_TEXT.ja,'+JSON.stringify(copy.ja)+');\n';
const note="if((m=base.match(/^One free attempt per exam type · (\\d+) exam type\\(s\\) used · Repeat requires a paid plan\\.$/)))return lang==='my'?`စာမေးပွဲအမျိုးအစားတစ်ခုစီ အခမဲ့ ၁ ကြိမ် · ${m[1]} မျိုး အသုံးပြုပြီးပါပြီ · ထပ်ဖြေလိုပါက Paid Plan လိုအပ်ပါသည်။`:`試験種別ごとに無料1回 · ${m[1]}種類を使用済み · 再受験には有料プランが必要です。`;";
for(const p of ['assets/yk-v78718-exam-access.css'])assert(existsSync(join(dist,p)),`Missing published CSS: ${p}`);
const results=[];
for(const route of routes){
 const file=join(dist,route);assert(existsSync(file),`Missing exam route: ${route}`);
 let src=readFileSync(file,'utf8');
 for(const mark of ['id="examAccessTitleV728"','id="examAccessTextV728"','id="examPlanMiniTextV739"',
  'function statusText(s,user)','function setAccessButtonsV739','function planModal()',
  'const V737_ORIGINAL_TEXT = new WeakMap();','function v737TranslateBase(base,lang)',
  '<div class="exam-plan-card-v728" data-plan="${k}"']) assert(src.includes(mark),`${route}: exam source marker missing: ${mark}`);
 assert(!src.includes('v7.87.18: targeted guest'),'Refuse double build on '+route);
 assert(src.includes(`x:'${englishGuest}'`),`${route}: guest status source moved`);
 src=src.replace(`x:'${englishGuest}'`,`x:'${newGuest}'`);
 const mapAnchor='const V737_ORIGINAL_TEXT = new WeakMap();';
 src=src.replace(mapAnchor,translation+mapAnchor);
 const mapFunc='if(Object.prototype.hasOwnProperty.call(d,base)) return d[base];';
 assert(src.includes(mapFunc),`${route}: dynamic language function changed`);
 src=src.replace(mapFunc,mapFunc+'\n  '+note);
 // The fixed-price summary needs to be localized on BOTH first render and after a status refresh.
 const originalPrices='1 Week ¥1,000 · 1 Month ¥2,000<br>3 Months ¥3,000 · 1 Year ¥5,000';
 const markup=`id="examPlanMiniTextV739">${originalPrices}</p>`;
 assert(src.includes(markup),`${route}: initial mini-plan price label changed`);
 src=src.replace(markup,`id="examPlanMiniTextV739">${spans}</p>`);
 const dynamic=`miniText.innerHTML='${originalPrices}'`;
 assert(src.includes(dynamic),`${route}: dynamic mini-plan text changed`);
 const helper=`function yk8718MiniPlanPrices(){const lang=['my','ja','en'].includes(document.documentElement.lang)?document.documentElement.lang:'en';return ${JSON.stringify(mini)}.map(p=>'<span class="yk8718-plan-line" data-en="'+p.en+'" data-my="'+p.my+'" data-ja="'+p.ja+'">'+p[lang]+'</span>').join('<br>');}\n`;
 src=src.replace('function setAccessButtonsV739(s,user,state){',helper+'function setAccessButtonsV739(s,user,state){');
 src=src.replace(dynamic,'miniText.innerHTML=yk8718MiniPlanPrices()');
 const modalCards='<div class="exam-plans-v728">${cards}</div>';
 assert(src.includes(modalCards),`${route}: plan dialog card list changed`);
 src=src.replace(modalCards,'<p class="yk8718-plan-hint">Select a plan to continue.</p>'+modalCards);
 // Keep plan click targets and prices untouched. Only add a stylesheet and clearer long-text line spacing.
 assert.equal((src.match(/<\/head>/g)||[]).length,1,`${route}: expected one head close`);
 src=src.replace('</head>','<link rel="stylesheet" href="/assets/yk-v78718-exam-access.css?v=78718">\n</head>');
 // Do not alter any URL, API endpoint, authentication or plan prices.
 for(const id of ['week','month','3months','year'])assert(src.includes(`${id}:`)||src.includes(`"${id}":`),`${route}: missing plan ${id}`);
 for(const price of ['price:1000','price:2000','price:3000','price:5000'])assert(src.includes(price),`${route}: price changed ${price}`);
 assert(src.includes("$$('[data-plan]',o).forEach(c=>c.onclick=()=>checkout(c.dataset.plan))"),`${route}: checkout click handler missing`);
 writeFileSync(file,src,'utf8');results.push({route,characters:src.length});
}
console.log(JSON.stringify({version:'7.87.18',routes:results.length,guestCopy:'per-exam-type-free-1',languages:['my','en','ja'],pricesUnchanged:[1000,2000,3000,5000],backendChanged:false,uiOnly:true}));
