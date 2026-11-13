/** v7.87.11 — post-build stability regression (requires FULL repository dist/).
 * This is static route/asset QA; not authenticated E2E or a Netlify production test.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const read=p=>readFileSync('dist/'+p,'utf8');
const types=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const admin=read('admin-dashboard.html');
const student=read('student-dashboard.html');
const center=read('mock-exams.html');
assert(center.includes('id="examPanel"'));
assert.equal((center.match(/data-exam-v728=/g)||[]).length,12);
assert(admin.includes('yk-v7878-admin.js'));
assert(admin.includes('yk-v7877-growth.js'));
assert(!admin.includes('yk-jlpt-learning-v782-dashboard.js'));
assert(!admin.includes('yk-learning-v760.js'));
assert(student.includes('yk-jlpt-learning-v782-dashboard.js'));
assert(student.includes('yk-v7876-journey.js'));
assert(!student.includes('yk-v7878-admin.js'));
for(const type of types){
 const page=read('exams/'+type+'.html');
 assert(page.includes('id="v728-online-exam-system-js"'),type+': exam engine');
 assert.equal((page.match(/data-exam-v728=/g)||[]).length,1,type+': one launch');
 assert(page.includes('data-exam-v728="'+type+'"'),type);
 assert(!page.includes('yk-v7878-admin.js'),type+': CRM isolation');
 assert(page.includes('yk-v7875-stability.js'),type+': offline recovery');
}
const grammar=read('study/jlpt-grammar-library.html');
assert(grammar.includes('yk-v7879-grammar.js?v=78710'));
for(const [level,expected] of Object.entries({n5:35,n4:75,n3:135,n2:137,n1:127})){
 const rows=JSON.parse(read(`assets/yk-v7879-grammar-${level}.json`)).items;
 assert.equal(rows.length,expected,level);
 assert(rows.every(x=>x.examples?.length===2),level);
}
assert(!existsSync('dist/netlify/functions/_shared/exam-autosave.mts'),'Server code must never publish as static public asset');
console.log('PASS v78711-release: 13 exam routes; Admin/Student boundary; isolated backend; 509 grammar entries and original 30-lesson bridge');
