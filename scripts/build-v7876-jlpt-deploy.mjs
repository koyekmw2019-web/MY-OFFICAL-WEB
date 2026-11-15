/** STUDYING WITH YE KUN v7.87.6 — QA-only public-dist patch.
 * Applies the approved UX features to deploy output rather than source HTML.
 * Does not change private, authorization, persistence or checkout API code.
 * Stops the deployment on unexpected baseline changes.
 */
import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve, join} from 'node:path';

const dist = resolve('dist');
const files = {
  index: join(dist, 'index.html'),
  center: join(dist, 'mock-exams.html'),
  study: join(dist, 'study/jlpt-learning.html'),
  lesson: join(dist, 'assets/yk-jlpt-learning-v782-page.js')
};
const assets = [
 'assets/yk88-index-ux.css',
 'assets/yk88-jlpt-ux.css',
 'assets/yk88-grammar-detail.js',
 'assets/yk88-grammar-details.json',
 'study/jlpt-grammar-detail.html'
];
for(const p of [...Object.values(files),...assets.map(a=>join(dist,a))])
  assert(existsSync(p), `v7.87.6: missing public file ${p}`);
const one = (source, old, next, label) => {
  const count = source.split(old).length - 1;
  assert.equal(count,1,`v7.87.6: changed HTML anchor: ${label} (${count})`);
  return source.replace(old,next);
};
const guestGuide = 'STUDYING WITH YE KUN students can use the exams free after Student Verification while their course access is active. Non-students can use one free attempt per exam type, then purchase an exam practice plan through View Plans.';
const miniPattern = /<div class="exam-plan-mini" id="examPlanMiniV739">[\s\S]*?<\/div>/g;
const modalBlock = `function planModal(){
  const cards=Object.entries(PLANS).map(([k,p])=>\`<button type="button" class="exam-plan-card-v728" data-plan="\${k}" aria-label="\${p.name} ¥\${p.price.toLocaleString()}"><small>\${p.name}</small><b>¥\${p.price.toLocaleString()}</b><span>Select to purchase this plan</span></button>\`).join('');
  const o=overlay(\`<div class="exam-v728-modal-head"><h3>💳 Exam Plans</h3><button class="exam-v728-close">✕</button></div><p class="yk88-plan-instruction">To buy a plan, select the plan you want below. Then follow the bank transfer steps.</p><div class="exam-plans-v728">\${cards}</div><div class="exam-backend-note-v728">Access begins only after an Admin approves the payment receipt.</div>\`);
  $$('[data-plan]',o).forEach(c=>c.onclick=()=>checkout(c.dataset.plan));
}
`;
const translations = `/* YK88 UX patch */
Object.assign(V737_TEXT.my,{
 'Open All Lessons ↗':'သင်ခန်းစာအားလုံး ဖွင့်ရန် ↗',
 '${guestGuide}':'STUDYING WITH YE KUN သင်တန်းသားဖြစ်ပါက Student Verify ဖြင့် အတည်ပြုပြီး သင်တန်းသက်တမ်းရှိနေစဉ် စာမေးပွဲများကို အခမဲ့ အသုံးပြုနိုင်ပါတယ်။ သင်တန်းသားမဟုတ်ပါက စာမေးပွဲအမျိုးအစားတစ်ခုလျှင် အခမဲ့ ၁ ကြိမ် ဖြေဆိုနိုင်ပြီး ထပ်မံလေ့ကျင့်ရန် View Plans မှ Plan ကို ရွေးချယ်ဝယ်ယူနိုင်ပါတယ်။',
 'To buy a plan, select the plan you want below. Then follow the bank transfer steps.':'Plan ဝယ်ယူရန် အောက်ပါ Plan များထဲမှ မိမိလိုချင်သော Plan ကို နှိပ်ပြီး ရွေးချယ်ပါ။ ထို့နောက် ဘဏ်ငွေလွှဲရန် လမ်းညွှန်ချက်များအတိုင်း ဆက်လုပ်ပါ။',
 'Select to purchase this plan':'ဒီ Plan ကို ဝယ်ယူရန် နှိပ်ပါ',
 'Access begins only after an Admin approves the payment receipt.':'ငွေလွှဲပြေစာကို Admin က အတည်ပြုပြီးမှသာ Access စတင်အသုံးပြုနိုင်ပါမယ်။'
});
Object.assign(V737_TEXT.ja,{
 'Open All Lessons ↗':'すべてのレッスンを開く ↗',
 '${guestGuide}':'STUDYING WITH YE KUN の受講生は在籍期間内に学生認証をすると試験を無料で利用できます。受講生以外の方は試験種類ごとに1回無料で受けられ、追加練習には「View Plans」から練習用プランを購入できます。',
 'To buy a plan, select the plan you want below. Then follow the bank transfer steps.':'購入したいプランを下から選択し、銀行振込の案内に従って手続きを進めてください。',
 'Select to purchase this plan':'このプランを選んで購入',
 'Access begins only after an Admin approves the payment receipt.':'振込明細を管理者が承認した後にアクセスが有効になります。'
});
`;
const examPages = ['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1']
  .map(type=>join(dist,'exams',type+'.html'));
for(const p of examPages) assert(existsSync(p), `Missing generated exam page: ${p}`);

function patchHome(s){
  // The published home deliberately does NOT contain exam DOM/JS.
  if(s.includes('/* YK88 UX patch */')){
    assert(s.includes('yk88-index-ux.css') && !s.includes('>Start Learning ↗</a>'),'Existing home patch incomplete');
    return s;
  }
  s=one(s,'<a class="yk82-pill" href="/study/jlpt-learning.html">Open All Lessons ↗</a>','', 'duplicate learning CTA');
  s=one(s,'<a class="yk821-hub-open" href="/study/jlpt-learning.html">Start Learning ↗</a>',
       '<a class="yk821-hub-open" href="/study/jlpt-learning.html">Open All Lessons ↗</a>','lower learning CTA');
  // The main page's language switch needs the new CTA translation.
  s=one(s,'const V737_ORIGINAL_ATTR = new WeakMap();',translations+'const V737_ORIGINAL_ATTR = new WeakMap();', 'home language map');
  s=one(s,'</head>','<link rel="stylesheet" href="/assets/yk88-index-ux.css?v=7876auto1">\n</head>', 'homepage CSS');
  return s;
}
function patchExam(s){
  if(s.includes('/* YK88 UX patch */')){
    assert(s.includes('yk88AccessGuide')&&s.includes('yk88-index-ux.css')&&!s.includes('id="examPlanMiniV739"'), 'Previously patched exam page incomplete');
    return s;
  }
  const old='<span id="examAccessTextV728">One free attempt per exam type · Student verification or paid access is available.</span>';
  s=one(s,old,old+`<p id="yk88AccessGuide" hidden>${guestGuide}</p>`,'guest access');
  assert.equal([...s.matchAll(miniPattern)].length,1,'Duplicate mini plan anchor changed');
  s=s.replace(miniPattern,'');
  s=one(s,'const user=await currentUser();if(a)a.textContent=user?',
    "const user=await currentUser();const guide=$('#yk88AccessGuide');if(guide)guide.hidden=Boolean(user);if(a)a.textContent=user?",'guest display');
  const a=s.indexOf('function planModal(){'); const b=s.indexOf('async function checkout(',a);
  assert(a>=0&&b>a, 'Original plan / checkout functions unavailable');
  s=s.slice(0,a)+modalBlock+s.slice(b);
  s=one(s,'const V737_ORIGINAL_ATTR = new WeakMap();',translations+'const V737_ORIGINAL_ATTR = new WeakMap();', 'exam language map');
  s=one(s,'</head>','<link rel="stylesheet" href="/assets/yk88-index-ux.css?v=7876auto1">\n</head>', 'exam CSS');
  return s;
}
function patchStudy(s){
  if(s.includes('yk88-jlpt-ux.css')){
    assert(s.includes('Explore Lessons <small>')&&!s.includes('class="yk821-hero-art"'),'Previously patched JLPT page incomplete');
    return s;
  }
  s=one(s,'<a class="yk821-button-secondary" href="#yk82Title">Explore Lessons ↘</a>',
       '<a class="yk821-button-secondary" href="#yk82Title">Explore Lessons <small>သင်ခန်းစာများကို ကြည့်ရန်</small></a>','Explore Lessons translation');
  const a=s.indexOf('  <div class="yk821-hero-art"');const b=s.indexOf('\n</section>',a);
  assert(a>=0&&b>a,'Teacher/student hero start/end anchors changed');
  s=s.slice(0,a)+s.slice(b);
  s=one(s,'</head>','<link rel="stylesheet" href="/assets/yk88-jlpt-ux.css?v=7876auto1">\n</head>','JLPT CSS');
  return s;
}
function patchLesson(s){
  if(s.includes('yk88-grammar-card')){
    assert(s.includes('/study/jlpt-grammar-detail.html'), 'Previously patched grammar detail link missing');
    return s;
  }
  const a=s.indexOf("  if(type==='grammar')return");
  const b=s.indexOf("\n  if(type==='kanji')",a);
  assert(a>=0&&b>a,'Grammar card renderer anchor changed');
  const replacement=`  if(type==='grammar'){
    const detail=\`/study/jlpt-grammar-detail.html?level=\${encodeURIComponent(level)}&id=\${encodeURIComponent(item.id)}\`;
    return \`<article class="yk82-lesson yk88-grammar-card"><a class="yk88-grammar-link" href="\${detail}" aria-label="JLPT \${level} \${fmt(item.title)} Grammar detail">\${head}<h3 lang="ja">\${fmt(item.title)}</h3><p class="yk82-mm">\${fmt(item.meaning)}</p><div class="yk82-sentence" lang="ja">\${fmt(item.example)}<div class="yk82-mm">\${fmt(item.exampleMy)}</div></div><p class="yk82-note">💡 \${fmt(item.note)}</p></a>\${commonActions(item)}</article>\`;
  }`;
  return s.slice(0,a)+replacement+s.slice(b);
}
// Validate all proposed output BEFORE writing any files.
const next = [
  patchHome(readFileSync(files.index,'utf8')),
  patchExam(readFileSync(files.center,'utf8')),
  patchStudy(readFileSync(files.study,'utf8')),
  patchLesson(readFileSync(files.lesson,'utf8')),
  ...examPages.map(p=>patchExam(readFileSync(p,'utf8')))
];
assert(!next[0].includes('>Start Learning ↗</a>'), 'Old duplicate CTA is still visible');
assert(!next[0].includes('class="yk82-pill" href="/study/jlpt-learning.html">Open All Lessons ↗'), 'Upper duplicate CTA remains');
assert(next[0].includes('class="yk821-hub-open" href="/study/jlpt-learning.html">Open All Lessons ↗'), 'Lower CTA was not updated');
for(const html of [next[1],...next.slice(4)]){
  assert(html.includes('yk88AccessGuide'),'Exam Guest Access copy is missing');
  assert(!html.includes('id="examPlanMiniV739"'),'Redundant mini Plan box remains');
  assert(html.includes('yk88-plan-instruction'),'Compact Plans modal is missing');
}
assert(next[2].includes('yk88-jlpt-ux.css') && !next[2].includes('class="yk821-hero-art"'),'JLPT Hero was not updated');
assert(next[3].includes('yk88-grammar-card') && next[3].includes('jlpt-grammar-detail.html'),'Grammar detail navigation missing');
const keys=[files.index,files.center,files.study,files.lesson,...examPages];
for(let i=0;i<keys.length;i++)writeFileSync(keys[i],next[i],'utf8');
console.log(`PASS v7.87.6 PUBLIC OUTPUT: Home CTA, ${1+examPages.length} exam access pages, JLPT layout, and grammar detail links activated.`);
