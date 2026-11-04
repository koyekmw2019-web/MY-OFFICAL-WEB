/** v7.75: Study Hub JLPT card regression; production auth/payment access is unchanged. */
import {readFileSync, existsSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {strict as assert} from 'node:assert';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(join(root,'index.html'),'utf8');
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
const levels=['N5','N4','N3','N2','N1'];
let ok=0;
function check(name,fn){fn();console.log('PASS',name);ok++}
check('v7.75 version',()=>assert.equal(pkg.version,'7.75.0'));
check('JLPT cards are *inside* existing Study Hub grid',()=>{
 const fragment=html.split('id="studyHubGridV733">')[1]?.split('</div>\n<div class="study-hub-more-wrap">')[0];
 assert(fragment,'Missing Study Hub grid');
 assert.equal((fragment.match(/class="study-track /g)||[]).length,11,'Expect 7 existing transport cards + 5 JLPT cards except first Truck uses class-only');
 for(const level of levels){
   assert(fragment.includes(`data-study-level="${level}"`),`Missing ${level}`);
   const card=fragment.split('<article ').find(part=>part.includes(`data-study-level="${level}"`))?.split('</article>')[0]||'';
   assert(card.includes(`data-dict-source="JLPT ${level}"`));
   assert(card.includes(`data-hub-exam="jlpt_${level.toLowerCase()}"`));
   assert(card.includes(`href="#jlpt-exam-${level.toLowerCase()}"`));
   assert(card.includes('class="primary"'));
   assert(card.includes('study-extra-card'),`Level ${level} must honor existing View More behavior`);
 }
});
check('every Study Hub JLPT level reuses existing dictionary filter and mock exam',()=>{
 for(const level of levels){
  assert(html.includes(`data-dict-cat="JLPT ${level}"`),level);
  assert(html.includes(`data-exam-v728="jlpt_${level.toLowerCase()}"`),level);
 }
 assert(html.includes('id="jlpt-exam-center"'));
 for(const level of levels)assert(html.includes(`id="jlpt-exam-${level.toLowerCase()}"`));
});
check('existing Truck / Taxi / Bus / Maintenance / Car / Motorcycle / Moped are still present',()=>{
 for(const type of ['truck','taxi','bus','maintenance','car','motorcycle','moped'])
  assert(html.includes(`data-hub-exam="${type}"`),type);
 assert(html.includes('id="studyHubMoreV733"'));
});
check('existing access checks and Dictionary JS are retained',()=>{
 assert(html.includes('async function requestStart(type)'));
 assert(html.includes("await requireAuth('Login is required"));
 assert(html.includes("api('exam-access'"));
 assert(html.includes("document.querySelectorAll('[data-dict-source]')"));
 assert(html.includes("if(/^JLPT N[1-5]$/.test(cat))"));
});
check('no new backend migrations/functions are required',()=>{
 assert(existsSync(join(root,'netlify/functions/exam-access.mts')));
 assert(existsSync(join(root,'netlify/functions/exam-student-verify.mts')));
});
console.log(`TOTAL v7.75 Study Hub JLPT: ${ok} PASS / 0 FAIL`);
