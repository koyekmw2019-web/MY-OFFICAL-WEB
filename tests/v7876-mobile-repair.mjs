/** Validate after `npm run build`: node tests/v7876-mobile-repair.mjs --release */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const read=p=>readFileSync(p,'utf8');
const b=read('scripts/build-page-transitions-v7875.mjs');
const patch=read('scripts/build-v7876-jlpt-mobile-repair.mjs');
const css=read('assets/yk88-jlpt-mobile-repair.css');
const script=read('assets/yk88-jlpt-mobile-repair.js');
assert(b.includes("await import('./build-v7876-jlpt-deploy.mjs')"),'Existing v7.87.6 builder must remain');
assert(b.indexOf("await import('./build-v7876-jlpt-deploy.mjs')") < b.indexOf("await import('./build-v7876-jlpt-mobile-repair.mjs')"),'Builder order invalid');
assert(css.includes('minmax(0, 1fr)') && css.includes('overflow-x:clip') && css.includes('overflow-x:auto') && css.includes('scroll-margin-top'),'Overflow/anchor CSS missing');
assert(script.includes('scrollToLessons(true)') && script.includes('history.replaceState') && script.includes('role="button"'),'Safe anchor/navigation hooks absent');
assert(!script.includes('exam-start') && !script.includes('/.netlify/functions/'),'Backend access must remain untouched');
assert(patch.includes('v=7876fix03') && patch.includes('readFileSync') && patch.includes('writeFileSync'),'Cache-bust/build steps missing');
assert(!patch.includes('netlify/database') && !patch.includes('index.html'),'Do not change backend or home page');
if(process.argv.includes('--release')){
 const rd=p=>read(join('dist',p));
 const h=rd('study/jlpt-learning.html');
 const js=rd('assets/yk-jlpt-learning-v782-page.js');
 const d=rd('study/jlpt-grammar-detail.html');
 for(const a of ['yk88-jlpt-mobile-repair.css?v=7876fix03','yk88-jlpt-mobile-repair.js?v=7876fix03','yk-jlpt-learning-v782-page.js?v=7876fix03']) assert.equal(h.split(a).length-1,1,'Missing or duplicated '+a);
 assert(js.includes('jlpt-grammar-detail.html?v=7876fix03&level='),'Cached Grammar Card route not refreshed');
 assert(d.includes('yk88-grammar-detail.js?v=7876fix03'),'Detail JS not cache-busted');
 assert(!h.includes('class="yk821-hero-art"'),'Duplicate hero image returned');
 for(const f of ['assets/yk88-jlpt-mobile-repair.css','assets/yk88-jlpt-mobile-repair.js']) assert(existsSync(join('dist',f)),`Missing built asset ${f}`);
 console.log('PASS v7.87.6 release: repaired JLPT overflow, anchored scroll and grammar detail URL');
}
console.log('PASS v7.87.6 mobile repair source checks');
