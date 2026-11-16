/** STUDYING WITH YE KUN — UI Fix05.4 stand-alone QA regression.
 * node tests/v7876-ui-fix05.mjs [--release]
 * Tests exact generated-output injection logic against representative original anchors;
 * NOT a substitute for full GitHub repo / real-device QA.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,mkdirSync,writeFileSync,cpSync,mkdtempSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const read=p=>readFileSync(p,'utf8');
const builder=read('scripts/build-page-transitions-v7875.mjs');
const injector=read('scripts/build-v7876-jlpt-ui-fix05.mjs');
const css=read('assets/yk88-jlpt-ui-fix05.css');
const js=read('assets/yk88-jlpt-ui-fix05.js');
const fix04="await import('./build-v7876-jlpt-tabs-fix04.mjs')";
const fix05="await import('./build-v7876-jlpt-ui-fix05.mjs')";
assert.equal(builder.split(fix05).length-1,1,'Fix05 import once');
assert(builder.indexOf(fix04)<builder.indexOf(fix05),'Fix05 after Fix04');
assert(css.includes('flex:0 0 100%!important')&& css.includes('.yk88-cta-label')&&css.includes('white-space:nowrap!important'), 'Original mobile flex:1 bug must be overridden');
assert(injector.includes('yk88-fix054-critical') && injector.includes('flex:0 0 100%!important'), 'Mobile full row preserved');
assert(injector.includes('display:block!important;text-align:center!important') && !injector.includes('<span class="yk88-cta-label">Open All Lessons'), 'Plain block center independent of extra span');
assert(css.includes('#online-mock-exam>.exam-v728-subtitle {display:none!important;}'), 'Exam subtitle fallback missing');
assert(injector.includes('introRE') && injector.includes('mock-exams.html') && injector.includes('html.exam'), 'Exam paragraph must be removed in generated HTML');
assert(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),'Existing Grammar buttons single row');
assert(js.includes('group.append(back)') && js.includes('#yk88Bookmark') && js.includes('#yk88Learned'), 'Original Grammar state controls preserved');
assert(!js.includes('preventDefault()') && !js.includes('location.href='), 'Do not override original routes');
for(const forbidden of ['netlify/database','netlify/functions','checkout(', 'localStorage','sessionStorage','supabase'])
 assert(!js.includes(forbidden) && !injector.includes(forbidden),`Protected API or state logic in patch: ${forbidden}`);
const root=mkdtempSync(join(tmpdir(),'yk-v7876-fix054-'));
try {
  const dist=join(root,'dist');
  mkdirSync(join(dist,'study'),{recursive:true});
  mkdirSync(join(dist,'assets'),{recursive:true});
  cpSync('assets/yk88-jlpt-ui-fix05.css',join(dist,'assets/yk88-jlpt-ui-fix05.css'));
  cpSync('assets/yk88-jlpt-ui-fix05.js',join(dist,'assets/yk88-jlpt-ui-fix05.js'));
  const examHeader='<section class="section reveal" id="online-mock-exam"><div class="kicker">ONLINE EXAM CENTER</div><div class="title">STUDYING WITH YE KUN · စာမေးပွဲစင်တာ</div>';
  const examIntro='<p class="exam-v728-subtitle" data-en="Practice exams in one place." data-my="Mock Exam များကို လေ့ကျင့်နိုင်ပါတယ်။">Mock Exam များကို လေ့ကျင့်နိုင်ပါတယ်။</p>';
  const examAccess='<div class="exam-hub"><div class="exam-v728-access"><div class="exam-access-card"><b id="examAccessTitleV728">Guest Access</b><p id="yk88AccessGuide">Students verify</p><button id="examStudentVerifyV728">Student Verify</button><button id="examPlansV728">View Plans</button></div></div></div></section>';
  const fixture={
    'index.html':'<!doctype html><html><head></head><body><section id="study-hub"><div id="studyHubMoreV733"></div><div id="yk82Hub"><a class="yk821-hub-open" href="/study/jlpt-learning.html">Open All Lessons ↗</a></div></section><span>yk88-index-ux.css</span><script>const V737_TEXT = {my:{},ja:{}};/* YK88 UX patch */const V737_ORIGINAL_ATTR = new WeakMap();</script></body></html>',
    'mock-exams.html':'<!doctype html><html><head></head><body>'+examHeader+examIntro+examAccess+'</body></html>',
    'study/jlpt-learning.html':'<!doctype html><html><head><link href="/assets/yk88-jlpt-tabs-fix04.css?v=7876fix04" rel="stylesheet"></head><body class="yk82-page"><nav class="yk82-top-links">Study Hub</nav><h2 id="yk82Title">Lessons</h2></body></html>',
    'study/jlpt-grammar-detail.html':'<!doctype html><html><head></head><body class="yk82-page yk88-detail-page"><nav><a id="yk88BackTop" href="#">Grammar</a></nav><article id="yk88GrammarDetail"></article><script defer src="/assets/yk88-grammar-detail.js?v=7876fix03"></script></body></html>'
  };
  const reset=()=>{for(const [p,content] of Object.entries(fixture))writeFileSync(join(dist,p),content)};
  reset();
  const script=resolve('scripts/build-v7876-jlpt-ui-fix05.mjs');
  const run=()=>spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8'});
  let result=run();
  assert.equal(result.status,0,'Fix05.4 fixture injection must pass: '+result.stderr);
  for(const p of Object.keys(fixture)){
    const html=read(join(dist,p));
    assert.equal(html.split('yk88-jlpt-ui-fix05.css?v=7876ui054').length-1,1,`CSS once on ${p}`);
    if(p==='index.html'){
      assert(html.includes('style="display:block!important;text-align:center!important;white-space:nowrap!important;box-sizing:border-box!important">Open All Lessons</a>') && !html.includes('<span class="yk88-cta-label">') && !html.includes('Open All Lessons ↗</a>'), 'Plain anchor centered and arrow free');
      assert(html.includes('yk88-fix054-critical')&&html.includes('flex:0 0 100%!important'),'critical CSS exists and fixes basis');
      assert(html.includes("'Open All Lessons':'သင်ခန်းစာအားလုံးဖွင့်ရန်'")&&html.includes("'Open All Lessons':'すべてのレッスンを開く'"),'translation map preserved');
      assert(html.includes('id="studyHubMoreV733"'),'View More must stay');
    }
    if(p==='mock-exams.html'){
      assert(!html.includes('class="exam-v728-subtitle"') && !html.includes('Mock Exam များကို လေ့ကျင့်နိုင်ပါတယ်။'),'Redundant exam intro removed');
      for(const marker of ['ONLINE EXAM CENTER','STUDYING WITH YE KUN','examAccessTitleV728','yk88AccessGuide','examStudentVerifyV728','examPlansV728'])assert(html.includes(marker),`Exam feature preserved: ${marker}`);
      assert(!html.includes('yk88-fix054-critical'),'No Home critical CSS on Exam');
    }
    assert.equal(html.split('yk88-jlpt-ui-fix05.js?v=7876ui054').length-1,p.includes('grammar-detail')?1:0,'Detail-only JS');
  }
  const before=read(join(dist,'index.html'));
  result=run();
  assert.notEqual(result.status,0,'Duplicate injection must fail closed');
  assert.equal(read(join(dist,'index.html')),before,'Failing duplicate injection must not rewrite Home');
  reset();
  writeFileSync(join(dist,'mock-exams.html'),fixture['mock-exams.html'].replace('id="examPlansV728"','id="changed"'));
  result=run();
  assert.notEqual(result.status,0,'Changed Exam Access anchor must fail closed');
  assert.equal(read(join(dist,'index.html')),fixture['index.html'],'Changed Exam must not partially update Home');
  reset();
  writeFileSync(join(dist,'index.html'),fixture['index.html'].replace('Open All Lessons ↗','Unexpected'));
  result=run();
  assert.notEqual(result.status,0,'Unexpected CTA anchor must fail closed');
  assert.equal(read(join(dist,'mock-exams.html')),fixture['mock-exams.html'],'Changed CTA must not partially update Exam');
  if(process.argv.includes('--release')){
    const expect=['dist/index.html','dist/mock-exams.html','dist/study/jlpt-learning.html','dist/study/jlpt-grammar-detail.html'];
    for(const p of expect){assert(existsSync(p),`Missing complete built page ${p}`);assert(read(p).includes(css.includes('v=7876ui054')?'v=7876ui054':'yk88-jlpt-ui-fix05.css?v=7876ui054'),`Missing release CSS ${p}`)}
    assert(!read('dist/mock-exams.html').includes('class="exam-v728-subtitle"'), 'Exam intro present in release output');
  }
  console.log('PASS Fix05.4: baseline guards, full-row Home CTA, no intro Exam, original Access, JLPT and Grammar preserved; duplicate & mismatch fail closed');
} finally {rmSync(root,{force:true,recursive:true});}
