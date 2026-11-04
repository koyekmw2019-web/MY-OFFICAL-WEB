/** v7.75 functionality retained through v7.76 unified level selector. */
import {readFileSync,existsSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {strict as assert} from 'node:assert';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(join(root,'index.html'),'utf8');
const levels=['N5','N4','N3','N2','N1'];
let ok=0;
function check(label,fn){fn();console.log('PASS',label);ok++}
check('JLPT center remains inside Study Hub',()=>{
  assert(html.indexOf('id="jlpt-learning-center"')>html.indexOf('id="study-hub"'));
  assert(html.indexOf('id="jlpt-learning-center"')<html.indexOf('id="studyHubGridV733"'));
});
check('all original transport tracks preserved',()=>{
  for(const type of ['truck','taxi','bus','maintenance','car','motorcycle','moped'])assert(html.includes(`data-hub-exam="${type}"`));
  assert(html.includes('id="studyHubMoreV733"'));
});
check('existing level-specific dictionary filters are retained',()=>{
  for(const lv of levels)assert(html.includes(`data-dict-cat="JLPT ${lv}"`));
  assert(html.includes("document.querySelectorAll('[data-dict-source]')"));
});
check('existing level-specific mock exam buttons remain intact',()=>{
  for(const lv of levels){assert(html.includes(`data-exam-v728="jlpt_${lv.toLowerCase()}"`));assert(html.includes(`id="jlpt-exam-${lv.toLowerCase()}"`));}
  assert(html.includes('async function requestStart(type)'));
  assert(html.includes("api('exam-access'"));
});
check('backend paths present',()=>{
  assert(existsSync(join(root,'netlify/functions/exam-access.mts')));
  assert(existsSync(join(root,'netlify/functions/exam-student-verify.mts')));
});
console.log(`TOTAL historical v7.75 capability: ${ok} PASS / 0 FAIL`);
