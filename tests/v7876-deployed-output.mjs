/** Run after npm run build: node tests/v7876-deployed-output.mjs
 * Exam/payment engines themselves are unchanged and require browser QA.
 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const dist=join(process.cwd(),'dist');
const rd=p=>readFileSync(join(dist,p),'utf8');
for(const p of ['index.html','mock-exams.html','study/jlpt-learning.html','study/jlpt-grammar-detail.html','assets/yk-jlpt-learning-v782-page.js','assets/yk88-grammar-detail.js','assets/yk88-index-ux.css','assets/yk88-jlpt-ux.css'])
  assert(existsSync(join(dist,p)),`Missing published file: ${p}`);
const home=rd('index.html');
const exam=rd('mock-exams.html');
const jlpt=rd('study/jlpt-learning.html');
const grammar=rd('assets/yk-jlpt-learning-v782-page.js');
const detail=rd('study/jlpt-grammar-detail.html');
assert(!home.includes('>Start Learning ↗</a>'),'Old Start Learning remains in homepage');
assert(!home.includes('class="yk82-pill" href="/study/jlpt-learning.html">Open All Lessons ↗'),'Duplicate top CTA remains');
assert(home.includes('class="yk821-hub-open" href="/study/jlpt-learning.html">Open All Lessons ↗'),'Correct lower CTA missing');
assert(home.includes('yk88-index-ux.css'),'Home UX stylesheet missing');
assert(exam.includes('yk88AccessGuide') && exam.includes('yk88-plan-instruction'),'Exam access/plan info missing');
assert(!exam.includes('id="examPlanMiniV739"'),'Duplicate Access Plan Mini not removed');
for(const type of ['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1']){
  const page=rd('exams/'+type+'.html');
  assert(page.includes('yk88AccessGuide'),`Exam ${type} guest guide missing`);
  assert(page.includes('yk88-plan-instruction'),`Exam ${type} compact plan modal missing`);
  assert(!page.includes('id="examPlanMiniV739"'),`Exam ${type} duplicate access plan remains`);
  assert(page.includes('id="examPanel"'),`Exam ${type} engine DOM lost`);
}
assert(!jlpt.includes('class="yk821-hero-art"'),'JLPT hero character block remains');
assert(jlpt.includes('Explore Lessons <small>') && jlpt.includes('id="yk822LearningCountdown"'),'JLPT language/countdown missing');
assert(jlpt.includes('yk88-jlpt-ux.css'),'JLPT responsive stylesheet missing');
assert(grammar.includes('yk88-grammar-card') && grammar.includes('/study/jlpt-grammar-detail.html'),'Grammar detail cards do not navigate');
assert(detail.includes('STUDYING WITH YE KUN') && detail.includes('/assets/yk-horizontal-white-v778.webp'),'Official education branding missing on detail page');
const detailJs=rd('assets/yk88-grammar-detail.js');
assert(!detailJs.includes('yk88-lang-tag'),'MY/EN labels unexpectedly present in examples');
const notes=JSON.parse(rd('assets/yk88-grammar-details.json'));
assert.equal(Object.keys(notes.items).length,30,'Expected 30 supplied grammar detail records');
for(const item of Object.values(notes.items))assert(item.more?.length>=2,'Each grammar needs >=3 total examples');
console.log('PASS v7.87.6 deployed output QA: home, 13 exam access pages, JLPT hero and countdown, 30 grammar details, brand and 3 examples, unchanged exam engine markup');
