/** STUDYING WITH YE KUN v7.87.6 — after prior public build and UX patch.
 * Harden mobile overflow + anchor and cache-bust the grammar renderer in dist.
 * Output-only, no changes to source HTML or protected backend files. */
import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const dist=resolve('dist');
const study=join(dist,'study/jlpt-learning.html');
const detail=join(dist,'study/jlpt-grammar-detail.html');
const lesson=join(dist,'assets/yk-jlpt-learning-v782-page.js');
const needed=['assets/yk88-jlpt-mobile-repair.css','assets/yk88-jlpt-mobile-repair.js'];
for(const p of [study,detail,lesson,...needed.map(x=>join(dist,x))]) assert(existsSync(p),`v7.87.6 mobile repair missing ${p}`);
const oldStudy=readFileSync(study,'utf8');
const oldDetail=readFileSync(detail,'utf8');
const oldLesson=readFileSync(lesson,'utf8');
const marker='v=7876fix03';
assert(oldStudy.includes('yk88-jlpt-ux.css') && oldStudy.includes('yk82Title') && oldStudy.includes('id="yk82Tabs"'), 'Previous JLPT UX build not present');
assert(oldLesson.includes('yk88-grammar-card') && oldLesson.includes('/study/jlpt-grammar-detail.html'), 'Previous Grammar Card navigation not present');
assert(oldDetail.includes('yk88-grammar-detail.js'), 'Original grammar detail page missing');
assert(!oldStudy.includes('yk88-jlpt-mobile-repair.css') && !oldStudy.includes('yk88-jlpt-mobile-repair.js'),'Already enhanced: refuse duplicate injection');
const expectOnce=(value,needle,label)=>{assert.equal(value.split(needle).length-1,1,`Expected single ${label}`)};
expectOnce(oldStudy,'src="/assets/yk-jlpt-learning-v782-page.js"','old lesson script');
expectOnce(oldStudy,'</head>','study head');
expectOnce(oldStudy,'</body>','study body');
expectOnce(oldDetail,'src="/assets/yk88-grammar-detail.js?v=1"','detail script');
const sourceRoute='/study/jlpt-grammar-detail.html?level=${encodeURIComponent(level)}&id=${encodeURIComponent(item.id)}';
expectOnce(oldLesson,sourceRoute,'existing detail href');
const newStudy=oldStudy
  .replace('src="/assets/yk-jlpt-learning-v782-page.js"','src="/assets/yk-jlpt-learning-v782-page.js?'+marker+'"')
  .replace('</head>','<link rel="stylesheet" href="/assets/yk88-jlpt-mobile-repair.css?'+marker+'">\n</head>')
  .replace('</body>','<script defer src="/assets/yk88-jlpt-mobile-repair.js?'+marker+'"></script>\n</body>');
const newLesson=oldLesson.replace(sourceRoute,'/study/jlpt-grammar-detail.html?'+marker+'&level=${encodeURIComponent(level)}&id=${encodeURIComponent(item.id)}');
const newDetail=oldDetail.replace('src="/assets/yk88-grammar-detail.js?v=1"','src="/assets/yk88-grammar-detail.js?'+marker+'"');
// All input validation above. Write dist-only outputs at the very end.
writeFileSync(study,newStudy,'utf8');
writeFileSync(lesson,newLesson,'utf8');
writeFileSync(detail,newDetail,'utf8');
console.log('PASS v7.87.6 mobile repair: lesson overflow/scroll controls loaded, Grammar Card script & detail URL cache-busted, original state/actions untouched');
