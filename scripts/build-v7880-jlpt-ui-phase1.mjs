/** STUDYING WITH YE KUN — JLPT Phase 1 QA (dist-only typography/layout).
 * Run LAST, after v7.88.0 grammar RC1 stage. Never touch source HTML,
 * login, exam engine, payments, database, or YKCR. No JS event modifications.
 */
import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
const dist=resolve('dist');
const page=join(dist,'study/jlpt-learning.html');
const asset=join(dist,'assets/yk88-jlpt-phase1.css');
const href='/assets/yk88-jlpt-phase1.css?v=7880p1qa01';
assert(existsSync(page), 'Phase 1: generated study page not found; run original build first');
assert(existsSync(asset), 'Phase 1: CSS missing from dist; check build-public asset copy');
const css=readFileSync(asset,'utf8');
const html=readFileSync(page,'utf8');
for(const label of ['id="yk82Levels"','id="yk82Stats"','id="yk82Tabs"','id="yk82Content"','id="yk82Title"','class="yk821-hero-actions"',
  'id="yk-mobile-nav"','/assets/yk88-jlpt-tabs-fix04.css','/assets/yk88-jlpt-ui-fix05.css',
  '/assets/yk-jlpt-learning-v782-page.js?v=7880rc1audited',
  '/assets/yk-jlpt-learning-v782-state.js?v=7880rc1capacity']) {
 assert(html.includes(label), `Phase 1: required previous asset/DOM missing: ${label}`);
}
for(const [label,token] of [['head','</head>'],['body','</body>']])
 assert.equal(html.split(token).length-1,1,`Phase 1: exactly one ${label} boundary required`);
assert(!html.includes('yk88-jlpt-phase1.css'),'Phase 1: duplicate injection refused');
assert(css.includes('body.yk82-page:not(.yk88-detail-page)'),'Phase 1: CSS must exclude Grammar Detail');
assert(!css.includes('display:none!important') && !css.includes('display: none !important'), 'Phase 1: no force-hidden interactive elements');
const next=html.replace('</head>',`<link rel="stylesheet" href="${href}">\n</head>`);
// All checks above. Single public HTML file change at the end.
writeFileSync(page,next,'utf8');
console.log('PASS JLPT Phase 1 scoped CSS injection: Learning Center only, release NO-GO until full QA');
