/** STUDYING WITH YE KUN — v7.87.6 UI Fix 05.2 (QA candidate).
 * Run after Fix04. dist-only CSS and detail action-enhancement injection;
 * never rewrite source pages, auth, payment, exam, YKCR or database logic.
 * Validate ALL target pages before making any write.
 */
import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
const dist = resolve('dist');
const css = '/assets/yk88-jlpt-ui-fix05.css?v=7876ui052';
const js = '/assets/yk88-jlpt-ui-fix05.js?v=7876ui052';
const paths = {
  home: join(dist, 'index.html'),
  study: join(dist, 'study/jlpt-learning.html'),
  detail: join(dist, 'study/jlpt-grammar-detail.html'),
};
const expectedFiles = [...Object.values(paths), join(dist, 'assets/yk88-jlpt-ui-fix05.css'), join(dist, 'assets/yk88-jlpt-ui-fix05.js')];
for (const file of expectedFiles) assert(existsSync(file), `Fix05 missing required public file: ${file}`);
const html = Object.fromEntries(Object.entries(paths).map(([key,path])=>[key,readFileSync(path,'utf8')]));
const count=(s,text)=>s.split(text).length-1;
for(const [key,source] of Object.entries(html)){
  assert.equal(count(source,'</head>'),1,`${key}: expected one head`);
  assert.equal(count(source,'</body>'),1,`${key}: expected one body`);
  assert.equal(count(source,css),0,`${key}: duplicate Fix05 CSS`);
  assert.equal(count(source,js),0,`${key}: duplicate Fix05 JS`);
}
assert(html.home.includes('class="yk821-hub-open"') && html.home.includes('yk88-index-ux.css'),
 'Home CTA / existing UX patch not found');
assert(html.study.includes('class="yk82-top-links"') && html.study.includes('id="yk82Title"')
  && html.study.includes('/assets/yk88-jlpt-tabs-fix04.css?v=7876fix04'),
 'Study page must contain original nav, lesson anchor and Fix04 tabs');
assert(html.detail.includes('class="yk88-detail-page"')
  || html.detail.includes('yk88-detail-page"'), 'Detail page body marker missing');
assert(html.detail.includes('id="yk88BackTop"') && html.detail.includes('id="yk88GrammarDetail"')
  && html.detail.includes('/assets/yk88-grammar-detail.js'),
 'Detail page original grammar/back handler missing');
// Home CTA requires a real text and translation update, not just CSS centering.
// All replacements are scoped to the dist/ home output. The JS localization
// dictionary must be extended BEFORE its ordinary translation pass starts.
const ctaOld = '<a class="yk821-hub-open" href="/study/jlpt-learning.html">Open All Lessons ↗</a>';
const ctaNew = '<a class="yk821-hub-open" href="/study/jlpt-learning.html"><span class="yk88-cta-label">Open All Lessons</span></a>';
const langAnchor = 'const V737_ORIGINAL_ATTR = new WeakMap();';
assert.equal(count(html.home,ctaOld),1,'Home CTA original label changed; refusing unsafe patch');
assert.equal(count(html.home,langAnchor),1,'Home localization anchor missing');
assert(html.home.includes('const V737_TEXT = {') && html.home.includes('/* YK88 UX patch */'),
  'Original language system and existing Fix04 UX translation missing');
const localizedNoArrow = `/* YK88 Fix05.2: Home learning CTA localized without arrow. */
Object.assign(V737_TEXT.my, {'Open All Lessons':'သင်ခန်းစာအားလုံးဖွင့်ရန်'});
Object.assign(V737_TEXT.ja, {'Open All Lessons':'すべてのレッスンを開く'});
`;
const criticalHomeCSS = "<style id=\"yk88-fix052-critical\">\n@media(max-width:640px){\n #study-hub.study-hub-v7{margin-top:12px!important;padding-top:8px!important}\n #study-hub #studyHubGridV733{row-gap:7px!important}\n #study-hub .study-hub-more-wrap{margin-top:0!important;margin-bottom:0!important}\n #study-hub #studyHubMoreV733{min-height:54px!important;padding-block:10px!important}\n #study-hub #yk82Hub.yk82-panel{margin-top:1px!important}\n}\n#yk82Hub a.yk821-hub-open[href=\"/study/jlpt-learning.html\"]{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;padding:12px!important;min-height:58px!important;text-align:center!important;white-space:normal!important;font-family:Inter,\"Noto Sans Myanmar\",\"Noto Sans JP\",system-ui,sans-serif!important;font-weight:850!important;font-size:clamp(17px,4.1vw,22px)!important;line-height:1.6!important}\n#yk82Hub a.yk821-hub-open .yk88-cta-label{display:block!important;flex:1 1 100%!important;width:100%!important;min-width:0!important;margin:0 auto!important;padding:0!important;text-align:center!important;white-space:normal!important}\n#yk82Hub a.yk821-hub-open::before,#yk82Hub a.yk821-hub-open::after{content:none!important}\n</style>";
const stylesheet=`<link rel="stylesheet" href="${css}">`;
const script=`<script defer src="${js}"></script>`;
// All validation passed. Keep writes limited to three public HTML files.
for(const [key,path] of Object.entries(paths)){
  let output=html[key].replace('</head>',`${stylesheet}\n</head>`);
  if(key==='home') output=output.replace(ctaOld,ctaNew).replace(langAnchor,localizedNoArrow+langAnchor)
    .replace(stylesheet+"\n</head>",stylesheet+"\n"+criticalHomeCSS+"\n</head>");
  if(key==='detail')output=output.replace('</body>',`${script}\n</body>`);
  writeFileSync(path,output,'utf8');
}
console.log('PASS Fix05.2 QA build injection: homepage CTA + two JLPT headers + grammar action bar. No protected endpoints changed.');
