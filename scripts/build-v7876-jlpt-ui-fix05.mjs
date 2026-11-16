/** STUDYING WITH YE KUN — v7.87.6 UI Fix 05.1 (QA candidate).
 * Run after Fix04. dist-only CSS and detail action-enhancement injection;
 * never rewrite source pages, auth, payment, exam, YKCR or database logic.
 * Validate ALL target pages before making any write.
 */
import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
const dist = resolve('dist');
const css = '/assets/yk88-jlpt-ui-fix05.css?v=7876ui051';
const js = '/assets/yk88-jlpt-ui-fix05.js?v=7876ui051';
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
const ctaNew = '<a class="yk821-hub-open" href="/study/jlpt-learning.html">Open All Lessons</a>';
const langAnchor = 'const V737_ORIGINAL_ATTR = new WeakMap();';
assert.equal(count(html.home,ctaOld),1,'Home CTA original label changed; refusing unsafe patch');
assert.equal(count(html.home,langAnchor),1,'Home localization anchor missing');
assert(html.home.includes('const V737_TEXT = {') && html.home.includes('/* YK88 UX patch */'),
  'Original language system and existing Fix04 UX translation missing');
const localizedNoArrow = `/* YK88 Fix05.1: Home learning CTA localized without arrow. */
Object.assign(V737_TEXT.my, {'Open All Lessons':'သင်ခန်းစာအားလုံးဖွင့်ရန်'});
Object.assign(V737_TEXT.ja, {'Open All Lessons':'すべてのレッスンを開く'});
`;
const stylesheet=`<link rel="stylesheet" href="${css}">`;
const script=`<script defer src="${js}"></script>`;
// All validation passed. Keep writes limited to three public HTML files.
for(const [key,path] of Object.entries(paths)){
  let output=html[key].replace('</head>',`${stylesheet}\n</head>`);
  if(key==='home') output=output.replace(ctaOld,ctaNew).replace(langAnchor,localizedNoArrow+langAnchor);
  if(key==='detail')output=output.replace('</body>',`${script}\n</body>`);
  writeFileSync(path,output,'utf8');
}
console.log('PASS Fix05.1 QA build injection: homepage CTA + two JLPT headers + grammar action bar. No protected endpoints changed.');
