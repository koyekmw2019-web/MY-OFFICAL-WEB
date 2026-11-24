import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {test} from 'node:test';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {secondBank} from '../netlify/functions/_shared/ordinary-second-bank.mts';
import {generateManifest,readManifest,gradeSecond,publicQuestions,validateSnapshot} from '../netlify/functions/_shared/ordinary-second-engine.mts';
const texts=new Map(secondBank.originalItems.map(q=>[q.id,q]));
const scenes=new Map(secondBank.illustrations.map(q=>[q.id,q]));
const row=m=>({bank_version:m.bankVersion,question_ids:m.questionIds,
 illustration_ids:m.illustrationIds,statement_orders:m.statementOrders});
function correctSnapshot(m){
 const refs=[...m.questionIds,...m.illustrationIds];
 return {version:1,type:'ordinary_second',engine:'license',index:94,refs,
  answers:[...m.questionIds.map(id=>texts.get(id).answer),
    ...m.illustrationIds.map(id=>scenes.get(id).statements.map(s=>s.answer))]};
}
test('bank original pool',()=>{
 assert.ok(secondBank.originalItems.length>=95);
 assert.ok(secondBank.illustrations.length>=10);
 assert.equal(new Set(secondBank.originalItems.map(q=>q.id)).size,secondBank.originalItems.length);
 assert.equal(new Set(secondBank.illustrations.map(q=>q.id)).size,secondBank.illustrations.length);
});
test('unique 90 text + five image questions, each three-order permutation',()=>{
 for(let i=0;i<30;i++){
  const m=readManifest(row(generateManifest()));
  const ids=[...m.questionIds,...m.illustrationIds];
  assert.equal(ids.length,95);assert.equal(new Set(ids).size,95);
  const byChapter={};for(const id of m.questionIds){
   const c=texts.get(id).chapter;byChapter[c]=(byChapter[c]||0)+1;
  }
  assert.deepEqual(byChapter,{'1':13,'4':6,'5':30,'6':9,'7':8,'9':20,'10':3,'11':1});
  m.statementOrders.forEach(x=>assert.equal(new Set(x).size,3));
 }
});
test('manifest does not expose answers or explanations',()=>{
 const m=readManifest(row(generateManifest()));
 const publicData=JSON.stringify(publicQuestions(m));
 assert.doesNotMatch(publicData,/"answer"\s*:/);
 assert.doesNotMatch(publicData,/"explanationJP"\s*:/);
});
test('100, 90 and 89 exact score/pass boundaries',()=>{
 const m=readManifest(row(generateManifest()));
 const right=correctSnapshot(m);
 assert.equal(gradeSecond(right,m).score,100);
 assert.equal(gradeSecond(right,m).passed,true);
 for(let mistakes of [10,11]){
  const s=correctSnapshot(m);for(let i=0;i<mistakes;i++)s.answers[i]=!s.answers[i];
  const g=gradeSecond(s,m);
  assert.equal(g.score,100-mistakes);
  assert.equal(g.passed,mistakes===10);
 }
});
test('illustration earns two points iff all three statements correct',()=>{
 const m=readManifest(row(generateManifest()));
 const s=correctSnapshot(m);
 s.answers[90][0]=!s.answers[90][0];
 const g=gradeSecond(s,m);
 assert.equal(g.score,98);
 assert.equal(g.wrong.length,1);
 assert.equal(g.wrong[0].kind,'scene');
});
test('invalid/forged answers rejected',()=>{
 const m=readManifest(row(generateManifest())),a=correctSnapshot(m);
 a.refs[0]='FORGED';assert.throws(()=>validateSnapshot(a,m));
 a.refs[0]=m.questionIds[0];a.answers[90]=[true,true,'fake'];
 assert.throws(()=>gradeSecond(a,m));
});
test('manifest wrong order rejected',()=>{
 const m=readManifest(row(generateManifest()));
 const r=row(m);r.statement_orders[0]=[0,0,2];
 assert.throws(()=>readManifest(r));
});
test('published dist uses production page with no answer bank or QA page',()=>{
 const dist=resolve('dist');
 assert(existsSync(join(dist,'mock-exams.html')),'Run npm run build first');
 const file=join(dist,'mock-second-license.html');
 assert(existsSync(file));
 assert(!existsSync(join(dist,'mock-second-license-qa.html')));
 const html=readFileSync(file,'utf8');
 const raw=html.match(/<script type="application\/json" id="questionData">([\s\S]*?)<\/script>/)?.[1];
 assert(raw,'Public question data is missing');
 const b=JSON.parse(raw);
 assert.equal(b.type,'ordinary_second');
 assert(b.originalItems.every(q=>!Object.hasOwn(q,'answer')&&!Object.hasOwn(q,'explanationJP')));
 assert(b.illustrations.every(s=>s.statements.every(q=>!Object.hasOwn(q,'answer'))));
 assert(html.includes('yk-ordinary-second-online.js'));
 assert(html.includes('id="yk-mobile-nav"'));
 assert(html.includes('id="siteMenu"'));
 assert(!html.includes('QA PREVIEW / NOT PRODUCTION'));
 assert(readFileSync(join(dist,'mock-exams.html'),'utf8').includes('/mock-second-license.html'));
});

test('v7.89.1 dictionary navigation, mobile layout and full drawer source',()=>{
 const dist=resolve('dist');
 const home=readFileSync(join(dist,'index.html'),'utf8');
 assert.doesNotMatch(home,/data-tab="dictionary"/);
 assert.match(home,/data-tab="study" href="\/#study-hub"/);
 assert.match(home,/data-tab="account" href="\/dashboard.html"/);
 assert.match(home,/data-menu-search="Dictionary အဘိဓာန် 辞書" href="\/#driving-dictionary"/);
 assert.doesNotMatch(home,/data-tab="dictionary" href="\/study\/japanese-myanmar-dictionary.html"/);
 for(const file of ['index.html','mock-exams.html','video-class.html']) {
   const html=readFileSync(join(dist,file),'utf8');
   assert(html.includes('/assets/yk-v7891-dictionary-hotfix.css?v=7891'));
   assert(html.includes('/assets/yk-v7892-navigation.js?v=7896'));
   assert(html.includes('/assets/yk-v7892-navigation.css?v=7895'));
 }
 const css=readFileSync(join(dist,'assets/yk-v7891-dictionary-hotfix.css'),'utf8');
 const js=readFileSync(join(dist,'assets/yk-v7891-dictionary-hotfix.js'),'utf8');
 assert(css.includes('body.menu-open #siteMenu.ykoc-drawer'));
 assert(css.includes('height:100dvh!important'));
 assert(css.includes('body.menu-open #yk-mobile-nav:not([hidden])'));
 assert(css.includes('#driving-dictionary .dictionary-tools-v7'));
 assert(js.includes("location.assign(target)"));
 assert(js.includes("setTimeout(go,155)"));
});

test('v7.89.3 fast menu anchors preserve shared Home/EXAM/Dictionary tab appearance',()=>{
 const dist=resolve('dist');
 const html=readFileSync(join(dist,'index.html'),'utf8');
 assert(html.includes('yk-v7892-navigation.js?v=7896'));
 assert(html.includes('yk-v7892-navigation.css?v=7895'));
 const js=readFileSync(join(dist,'assets/yk-v7892-navigation.js'),'utf8');
 const css=readFileSync(join(dist,'assets/yk-v7892-navigation.css'),'utf8');
 const nav=readFileSync(join(dist,'assets/yk-mobile-nav.js'),'utf8');
 assert(js.includes("['home','driving-dictionary','portal','yk82Hub','study-hub'"));
 assert(js.includes("history.pushState(null,'',next)"));
 assert(js.includes("requestAnimationFrame(()=>jumpNow(id))"));
 assert(js.includes("studyTab?.addEventListener('click',event=>{"));
 assert(js.includes("if(atHome())goTo('study-hub')"));
 assert(!js.includes('yk-v7892-tap'));
 assert(!js.includes("tab.addEventListener('pointerdown',animate"));
 assert(!css.includes('yk-v7892-dict-bounce'));
 assert(!css.includes('yk-v7892-label-bounce'));
 const mobileCss=readFileSync(join(dist,'assets/yk-v7891-dictionary-hotfix.css'),'utf8');
 assert(!mobileCss.includes('#yk-mobile-nav > a[data-tab="dictionary"]'));
 const drawerCss=readFileSync(join(dist,'assets/ykoc-pr7-menu-drawer.css'),'utf8');
 assert(drawerCss.includes('#yk-mobile-nav > :is(a,button)[aria-current="page"]'));
 assert(css.includes('scroll-behavior:auto!important'));
 assert(nav.includes("observer.observe(document.body, {attributes:true, attributeFilter:['class']})"));
 assert(!nav.includes('subtree:true, childList:true'));
});

test('v7.89.4 Dictionary uses a real same-document fade like cross-page Home/EXAM',()=>{
 const dist=resolve('dist');
 const html=readFileSync(join(dist,'index.html'),'utf8');
 assert(html.includes('/assets/yk-v7892-navigation.js?v=7896'));
 assert(html.includes('/assets/yk-v7892-navigation.css?v=7895'));
 const js=readFileSync(join(dist,'assets/yk-v7892-navigation.js'),'utf8');
 const css=readFileSync(join(dist,'assets/yk-v7892-navigation.css'),'utf8');
 assert(js.includes('document.startViewTransition(apply)'));
 assert(js.includes("if(id==='driving-dictionary'"));
 assert(js.includes("history.pushState(null,'',next)"));
 assert(js.includes('jumpNow(id);'));
 assert(js.includes('revealFallback(target)'));
 assert(css.includes('html.yk-v7894-view::view-transition-old(root)'));
 assert(css.includes('html.yk-v7894-view::view-transition-new(root)'));
 assert(css.includes('yk-v7875-tab-bar'));
 assert(css.includes('#driving-dictionary.yk-v7894-fade'));
 assert(!css.includes('yk-v7892-dict-bounce'));
 assert(!js.includes('yk-v7892-tap'));
});

test('v7.89.5 approved compact Exam Access UI is applied to built pages',()=>{
 const dist=resolve('dist');
 // v7.87 route split removes Exam DOM from index.html; the Exam Center is dedicated.
 const home=readFileSync(join(dist,'index.html'),'utf8');
 assert(!home.includes('id="examPanel"'));
 for(const page of ['mock-exams.html']){
   const html=readFileSync(join(dist,page),'utf8');
   assert(/class=["'][^"']*exam-access-card/.test(html),page+' missing original Exam Access class');
   assert(html.includes('/assets/yk-v7896-approved-reference.css?v=7896'),page);
   assert(html.includes('yk-audience-student'),page);
   assert(html.includes('yk-audience-public'),page);
   assert(html.includes('data-tab="study"'),page);
   assert(html.includes('data-tab="account"'),page);
   for(const id of ['examAccountV735','examStudentVerifyV728','examPlansV728'])
     assert(html.includes('id="'+id+'"'),page+' missing '+id);
 }
 const css=readFileSync(join(dist,'assets/yk-v7896-approved-reference.css'),'utf8');
 assert(css.includes('#online-mock-exam .exam-access-card.yk-approved-access'));
 assert(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
 assert(css.includes('yk-public-actions'));
 assert(css.includes('#yk88AccessGuide'));
 assert(css.includes('button[hidden]'));
});
test('v7.89.5 updated mobile PWA assets are cache-busted',()=>{
 const dist=resolve('dist');
 const html=readFileSync(join(dist,'index.html'),'utf8');
 const sw=readFileSync(join(dist,'service-worker.js'),'utf8');
 assert(html.includes('yk-v7892-navigation.js?v=7896'));
 assert(html.includes('yk-v7892-navigation.css?v=7895'));
 assert(!html.includes('yk-v7892-navigation.js?v=7894'));
 assert(sw.includes('-v7898-exam-safe-scroll'));
 assert(sw.includes("request.mode === 'navigate'"));
 assert(sw.includes("key.startsWith('yk-public-static-')"));
});

test('v7.89.6 screenshot reference: student card, public card, five expected bottom tabs',()=>{
 const dist=resolve('dist');
 const exam=readFileSync(join(dist,'mock-exams.html'),'utf8');
 const home=readFileSync(join(dist,'index.html'),'utf8');
 for(const html of [exam,home]){
   const match=html.match(/<nav id="yk-mobile-nav"[^>]*>([\s\S]*?)<\/nav>/);
   assert(match,'Missing bottom nav');
   const tabs=[...match[1].matchAll(/data-tab="([^"]+)"/g)].map(m=>m[1]);
   assert.deepEqual(tabs,['home','study','exam','video','account']);
   assert(!match[1].includes('ykocBottomMenu'));
 }
 assert(exam.includes('class="exam-access-card yk-approved-access"'));
 assert(exam.includes('yk-audience-student'));
 assert(exam.includes('yk-audience-public'));
 assert(exam.includes('STUDYING WITH YE KUN သင်တန်းသားဖြစ်ပါက'));
 assert(exam.includes('စာမေးပွဲအမျိုးအစားတစ်ခုစီအတွက် အခမဲ့'));
 for(const id of ['examAccountV735','examStudentVerifyV728','examPlansV728']){
  assert.equal((exam.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id+' duplicated');
 }
 assert(exam.indexOf('yk-audience-student')<exam.indexOf('yk-audience-public'));
 assert(exam.includes('yk-public-actions'));
 assert(exam.includes('/assets/yk-v7896-approved-reference.css?v=7896'));
});

test('v7.89.6 generated mobile nav scripts parse and preserve active routes',()=>{
 const dist=resolve('dist');
 const nav=readFileSync(join(dist,'assets/yk-mobile-nav.js'),'utf8');
 const routing=readFileSync(join(dist,'assets/yk-v7892-navigation.js'),'utf8');
 new Script(nav,{filename:'yk-mobile-nav.js'});
 new Script(routing,{filename:'yk-v7892-navigation.js'});
 assert(nav.includes(String.raw`replace(/\/+$/, '')`));
 assert(nav.includes(String.raw`replace(/\.html$/i,'')`));
 assert(nav.includes("return 'study'"));
 assert(nav.includes("return 'account'"));
 assert(routing.includes("goTo('study-hub')"));
 assert(routing.includes("'driving-dictionary'"));
});

test('v7.89.7 mobile access cards fully scroll clear of fixed bottom dock',()=>{
 const dist=resolve('dist');
 const exam=readFileSync(join(dist,'mock-exams.html'),'utf8');
 const css=readFileSync(join(dist,'assets/yk-v7897-access-visibility.css'),'utf8');
 const nav=readFileSync(join(dist,'assets/ykoc-pr7-menu-drawer.css'),'utf8');
 assert(exam.includes('/assets/yk-v7897-access-visibility.css?v=7897'));
 assert(exam.includes('class="exam-access-card yk-approved-access"'));
 assert(exam.includes('yk-audience-public'));
 assert(exam.includes('yk-public-actions'));
 assert(exam.includes('id="examAccountV735"')&&exam.includes('id="examPlansV728"'));
 assert(css.includes('padding-bottom:calc(132px + env(safe-area-inset-bottom,0px))!important'));
 assert(css.includes('min-height:calc(128px + env(safe-area-inset-bottom,0px))!important'));
 assert(css.includes('max-height:none!important'));
 assert(css.includes('overflow-y:visible!important'));
 assert(css.includes('scroll-margin-bottom:calc(108px + env(safe-area-inset-bottom,0px))'));
 assert(css.includes('@media(max-width:720px) and (max-height:770px)'));
 assert(!css.includes('display:none!important'));
 assert(nav.includes('min-height:calc(73px + env(safe-area-inset-bottom,0px))'));
 for(const tab of ['home','study','exam','video','account'])
   assert(exam.includes('data-tab="'+tab+'"'));
});

test('v7.89.8 mobile Exam scrollport ENDS ABOVE the fixed nav (not padding only)',()=>{
 const dist=resolve('dist');
 const html=readFileSync(join(dist,'mock-exams.html'),'utf8');
 const css=readFileSync(join(dist,'assets/yk-v7898-safe-scroll.css'),'utf8');
 const js=readFileSync(join(dist,'assets/yk-v7898-safe-scroll.js'),'utf8');
 assert(html.includes('/assets/yk-v7898-safe-scroll.css?v=7898'));
 assert(html.includes('/assets/yk-v7898-safe-scroll.js?v=7898'));
 assert(html.includes('yk-audience-public')&&html.includes('yk-public-actions'));
 assert(html.includes('id="examAccountV735"')&&html.includes('id="examPlansV728"'));
 assert(css.includes('overflow-y:auto!important'));
 assert(css.includes('height:var(--yk-v7898-scroll-height'));
 assert(css.includes('scrollbar-gutter:stable'));
 assert(css.includes('touch-action:pan-y'));
 assert(css.includes('body.yk787-exam-page.yk-v7898-safe-scroll'));
 assert(js.includes('navBox.top-wrapBox.top-2'));
 assert(js.includes('wrap.style.setProperty'));
 assert(js.includes('ResizeObserver'));
 assert(js.includes('visualViewport'));
 assert(js.includes("body.classList.contains('yk872-running')"));
 assert(js.includes("document.querySelector('#examPanel.active,dialog[open],.exam-v728-overlay.open')"));
 // The dropdown/links use original IDs. Do not introduce new access actions.
 assert.equal((html.match(/id="examAccountV735"/g)||[]).length,1);
 assert.equal((html.match(/id="examPlansV728"/g)||[]).length,1);
});
