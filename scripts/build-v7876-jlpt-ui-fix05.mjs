/** STUDYING WITH YE KUN — v7.87.6 UI Fix05.4, QA-only.
 * Minimal correction after Fix05.3. Runs after Fix04 and applies limited presentation changes
 * ONLY to generated dist/ pages. No auth, payment, exam, database or YKCR logic.
 * Verify all anchors before writing any output. */
import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
const dist = resolve('dist');
const css = '/assets/yk88-jlpt-ui-fix05.css?v=7876ui054';
const js  = '/assets/yk88-jlpt-ui-fix05.js?v=7876ui054';
const paths = {
  home: join(dist, 'index.html'),
  exam: join(dist, 'mock-exams.html'),
  study: join(dist, 'study/jlpt-learning.html'),
  detail: join(dist, 'study/jlpt-grammar-detail.html'),
};
const assets = [join(dist, 'assets/yk88-jlpt-ui-fix05.css'), join(dist, 'assets/yk88-jlpt-ui-fix05.js')];
for(const p of [...Object.values(paths),...assets])
  assert(existsSync(p), `Fix05.3: missing generated file ${p}`);
const html = Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,readFileSync(p,'utf8')]));
const count=(s,t)=>s.split(t).length-1;
for(const [key,s] of Object.entries(html)) {
  assert.equal(count(s,'</head>'),1, `${key}: unexpected head structure`);
  assert.equal(count(s,'</body>'),1, `${key}: unexpected body structure`);
  assert.equal(count(s,css),0,`${key}: duplicate CSS injection`);
  assert.equal(count(s,js),0,`${key}: duplicate JS injection`);
  assert(!s.includes('yk88-fix054-critical'),`${key}: duplicate critical CSS`);
}
// Home must be exactly the existing Fix04 source-derived generated output.
const oldCTA='<a class="yk821-hub-open" href="/study/jlpt-learning.html">Open All Lessons ↗</a>';
const newCTA='<a class="yk821-hub-open" href="/study/jlpt-learning.html" style="display:block!important;text-align:center!important;white-space:nowrap!important;box-sizing:border-box!important">Open All Lessons</a>';
const langAnchor='const V737_ORIGINAL_ATTR = new WeakMap();';
assert.equal(count(html.home,oldCTA),1,'Home source CTA changed — stop rather than guessing');
assert.equal(count(html.home,langAnchor),1,'Home localization anchor missing');
assert(html.home.includes('const V737_TEXT = {') && html.home.includes('/* YK88 UX patch */')
    && html.home.includes('id="studyHubMoreV733"') && html.home.includes('id="yk82Hub"'),
  'Expected Home Study Hub or locale structure missing');
assert(html.study.includes('class="yk82-top-links"') && html.study.includes('id="yk82Title"')
  && html.study.includes('/assets/yk88-jlpt-tabs-fix04.css?v=7876fix04'),
  'Fix04 JLPT page structure is required');
assert(html.detail.includes('yk88-detail-page') && html.detail.includes('id="yk88BackTop"')
  && html.detail.includes('id="yk88GrammarDetail"') && html.detail.includes('/assets/yk88-grammar-detail.js'),
  'Original Grammar Detail state/back-navigation structure is required');
// Exam: remove one and only one introductory paragraph immediately between
// the Online Exam heading and the existing Access card. Do NOT remove the
// guest-access explanation inside that card or alter any access functionality.
const examStart=html.exam.indexOf('<section class="section reveal" id="online-mock-exam">');
assert(examStart>=0,'Dedicated exam section not found');
const hubStart=html.exam.indexOf('<div class="exam-hub">',examStart);
assert(hubStart>examStart && hubStart-examStart<5000,'Exam Access container anchor changed');
const introRE=/<p class="exam-v728-subtitle"[^>]*>[\s\S]*?<\/p>/g;
const examHeader=html.exam.slice(examStart,hubStart);
const intros=[...examHeader.matchAll(introRE)];
assert.equal(intros.length,1,'Expected exactly one long Exam intro directly above Access');
assert(examHeader.includes('ONLINE EXAM CENTER') && examHeader.includes('STUDYING WITH YE KUN')
  && html.exam.includes('id="examAccessTitleV728"') && html.exam.includes('id="examStudentVerifyV728"')
  && html.exam.includes('id="examPlansV728"') && html.exam.includes('id="yk88AccessGuide"'),
  'Exam heading, guest Access or Fix04 guide changed — stop');
const localized=`/* YK88 Fix05.4: arrow-free Home CTA in all three languages. */
Object.assign(V737_TEXT.my,{'Open All Lessons':'သင်ခန်းစာအားလုံးဖွင့်ရန်'});
Object.assign(V737_TEXT.ja,{'Open All Lessons':'すべてのレッスンを開く'});
`;
// Keep legacy responsive rules for the CTA's full-width flex row.
// The CTA itself is now a plain block with important inline text centering.
// This removes dependency on inline-flex justify-content and nested span layout.
const criticalCSS=`<style id="yk88-fix054-critical">
@media(max-width:640px){
 #study-hub.study-hub-v7{margin-top:12px!important;padding-top:8px!important}
 #study-hub #studyHubGridV733{row-gap:8px!important}
 #study-hub .study-hub-more-wrap{margin-top:0!important;margin-bottom:0!important}
 #study-hub #studyHubMoreV733{min-height:54px!important;padding-block:10px!important}
 #study-hub #yk82Hub.yk82-panel{margin-top:0!important}
 #yk82Hub .yk821-hub-welcome>a.yk821-hub-open[href="/study/jlpt-learning.html"]{
   order:3!important;flex:0 0 100%!important;align-self:stretch!important;
   display:flex!important;width:100%!important;min-width:0!important;max-width:100%!important;
   box-sizing:border-box!important;justify-content:center!important;align-items:center!important;
   min-height:56px!important;padding:10px 8px!important;text-align:center!important;
   white-space:nowrap!important;font:850 clamp(13px,4vw,19px)/1.8
   Inter,"Noto Sans Myanmar","Noto Sans JP",system-ui,sans-serif!important;
 }
 #yk82Hub .yk821-hub-welcome>a.yk821-hub-open .yk88-cta-label{
   display:block!important;flex:0 1 auto!important;width:auto!important;min-width:0!important;
   text-align:center!important;white-space:nowrap!important;word-break:keep-all!important;
   overflow-wrap:normal!important;letter-spacing:0!important;
 }
}
</style>`;
const styleLink=`<link rel="stylesheet" href="${css}">`;
const detailScript=`<script defer src="${js}"></script>`;
// All validation above occurs before a single file is changed.
const output={...html};
output.home=html.home.replace(oldCTA,newCTA).replace(langAnchor,localized+langAnchor)
  .replace('</head>',styleLink+'\n'+criticalCSS+'\n</head>');
output.exam=html.exam.slice(0,examStart)
  +html.exam.slice(examStart,hubStart).replace(introRE,'')
  +html.exam.slice(hubStart);
output.exam=output.exam.replace('</head>',styleLink+'\n</head>');
output.study=html.study.replace('</head>',styleLink+'\n</head>');
output.detail=html.detail.replace('</head>',styleLink+'\n</head>')
  .replace('</body>',detailScript+'\n</body>');
assert(!output.exam.includes('class="exam-v728-subtitle"'), 'Exam intro unexpectedly remains');
for(const [key,path] of Object.entries(paths)) writeFileSync(path,output[key],'utf8');
console.log('PASS Fix05.4: plain block CTA, compact Study spacing, Exam intro removed and Access moved up; protected logic untouched.');
