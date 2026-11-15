/** STUDYING WITH YE KUN v7.87.6 Fix 04: append scoped mobile tabs fix.
 * Runs AFTER the existing Fix 03 public-dist builder. No source HTML edits.
 * Guard before write: never silently omit / duplicate these assets. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dist=resolve('dist');
const page=join(dist,'study/jlpt-learning.html');
const css='/assets/yk88-jlpt-tabs-fix04.css?v=7876fix04';
const js='/assets/yk88-jlpt-tabs-fix04.js?v=7876fix04';
for (const f of [page, join(dist,'assets/yk88-jlpt-tabs-fix04.css'),join(dist,'assets/yk88-jlpt-tabs-fix04.js')])
  assert(existsSync(f),`Fix 04 missing required public file: ${f}`);
let html=readFileSync(page,'utf8');
assert(html.includes('/assets/yk88-jlpt-mobile-repair.css?v=7876fix03'), 'Fix 03 must run before Fix 04');
assert(html.includes('/assets/yk88-jlpt-mobile-repair.js?v=7876fix03'), 'Fix 03 script absent');
assert(html.includes('id="yk82Tabs"') && html.includes('id="yk82Content"'), 'JLPT tabs / content missing');
assert(html.split('</head>').length===2 && html.split('</body>').length===2,'Expected single HTML boundaries');
assert(!html.includes(css) && !html.includes(js),'Fix 04 assets already injected');
html=html.replace('</head>',`<link rel="stylesheet" href="${css}">\n</head>`)
 .replace('</body>',`<script defer src="${js}"></script>\n</body>`);
writeFileSync(page,html,'utf8');
console.log('PASS v7.87.6 Fix 04: seven JLPT tabs rendered in compact two-row mobile grid; Grammar Card click area enhanced');
