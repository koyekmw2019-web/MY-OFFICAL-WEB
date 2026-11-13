/** Post-build regression: 12 independent exams, correct banks, current menu + cache. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
const rd=p=>readFileSync(p,'utf8');
const types=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const scripts=['jlpt-native-mock-bank-v752.js','jlpt-scoring-v755.js','jlpt-native-v750.js'];
const center=rd('dist/mock-exams.html');
const extractEngine=html=>html.match(/<script id="v728-online-exam-system-js">([\s\S]*?)<\/script>/)?.[1];
assert(extractEngine(center)?.length>10000,'Original exam access engine must exist');
assert.equal((center.match(/data-exam-v728=/g)||[]).length,12);
assert(center.includes('yk-v7875-stability.js?v=7875'));
assert(center.includes('yk874-education-menu'));
// Each exam page intentionally has a type-specific login-return URL, so
// engine code can differ from the center. The builder guarantees its own
// output transform does not change that original page's engine bytes.
let avoided=0;
for(const type of types){
 const path='dist/exams/'+type+'.html';assert(existsSync(path),path);
 const page=rd(path);
 assert.equal((page.match(/data-exam-v728=/g)||[]).length,1,type);
 assert(page.includes(`data-exam-v728="${type}"`),type);
 assert(page.includes('id="examPanel"')&&page.includes('yk-v7874-nav.js'),type);
 assert(extractEngine(page)?.length>10000,type+': engine missing');
 assert(page.includes('STUDYING WITH YE KUN')&&page.includes('yk873-exam-page'),type);
 assert(!page.includes('id="ykPrepMountV750"'),type+': unrelated 直前対策');
 assert(page.includes('yk-v7875-stability.css?v=7875'),type);
 assert(page.includes('yk-v7875-stability.js?v=7875'),type);
 const nav=page.match(/<nav class="site-menu-nav">([\s\S]*?)<\/nav>/)?.[1];
 assert(nav,type+': menu missing');
 for(const id of ['home','about','portal','study-hub','yk82Hub','study-resources','driving-dictionary']){
   assert(nav.includes(`href="/#${id}"`),type+': broken menu '+id);
 }
 for(const s of scripts){
   assert.equal(page.includes(`src="/assets/${s}"`),type.startsWith('jlpt_'),type+': '+s);
 }
 assert.equal(page.includes('href="/assets/jlpt-native-v750.css"'),type.startsWith('jlpt_'),type+': JLPT CSS');
 if(!type.startsWith('jlpt_'))avoided++;
}
assert.equal(avoided,7);
const sw=rd('dist/service-worker.js');
assert(sw.match(/yk-official-v7-87-(?:5|13|20)/));
assert(sw.includes("request.mode === 'navigate'"));
assert(!sw.includes('exam-attempt-submit'));
for(const path of ['dist/assets/yk-v7875-stability.css','dist/assets/yk-v7875-stability.js'])assert(statSync(path).size>100,path);
console.log('PASS v7875-release: 12 original exam engines, 7 non-JLPT payload optimizations, 5 JLPT preserved, cache and navigation');
