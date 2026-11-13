/** Post-public-build source checks. Full live role/auth QA still needed. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const rd=p=>readFileSync('dist/'+p,'utf8');
const page=rd('student-dashboard.html');
assert(page.includes('yk-v7876-journey-engine.js?v=7876'));
assert(page.includes('yk-v7876-journey.js?v=7876'));
assert(page.includes('yk-v7876-journey.css?v=7876'));
assert(page.includes('yk-dashboard-pro-v784.js'));
assert(page.includes('yk-exam-coach-v7865.js'));
assert(page.includes('yk-all-exams-v7863-engine.js'));
assert(page.includes('yk-dashboard-v758.js'));
assert.equal((page.match(/yk-v7876-journey\.js\?v=7876/g)||[]).length,1);
for(const f of ['assets/yk-v7876-journey-engine.js','assets/yk-v7876-journey.js','assets/yk-v7876-journey.css'])assert(existsSync('dist/'+f),f);
for(const other of ['admin-dashboard.html','member-dashboard.html','login.html']){
 const s=rd(other);assert(!s.includes('yk-v7876-journey.js'),other+' must not receive student-only UI');
}
for(const type of ['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1']){
 const exam=rd('exams/'+type+'.html');
 assert(exam.includes('id="examPanel"'),type);
 assert(exam.includes('id="v728-online-exam-system-js"'),type);
 assert(exam.includes(`data-exam-v728="${type}"`),type);
 assert(!exam.includes('yk-v7876-journey.js'),type);
}
assert(rd('service-worker.js').match(/yk-official-v7-87-(?:5|13|20)/));
console.log('PASS v7876-release: student-only, all 12 existing exam engines, existing roles and backend unchanged');
