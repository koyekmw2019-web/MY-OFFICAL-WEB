/** v7.87.12 post-full-build public-surface guards. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const read=p=>readFileSync('dist/'+p,'utf8');
const required=['index.html','mock-exams.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html','login.html','video-class.html','study/jlpt-learning.html','study/jlpt-grammar-library.html'];
for(const p of required){assert(existsSync('dist/'+p),p);assert(read(p).includes('/assets/yk-v78712-i18n.js?v=78712'),p)}
for(const t of ['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1']){
 const p='exams/'+t+'.html';assert(read(p).includes('/assets/yk-v78712-i18n.js?v=78712'),p);
 assert(read(p).includes('id="v728-online-exam-system-js"'),t+' exam DOM preserved');
}
const grammar=read('study/jlpt-grammar-library.html');
for(const key of ['grammarIntro','grammarDisclaimer','grammarFuriNote','grammarLegal','grammarReference'])assert(grammar.includes(`data-yk-l12="${key}"`),key);
assert(grammar.includes('yk879FuriBtns')&&grammar.includes('yk-v7879-grammar.js?v=78710'));
assert(grammar.includes('data-yk-l12-switch="my"')&&grammar.includes('data-yk-l12-switch="ja"'));
const learn=read('study/jlpt-learning.html');assert(learn.includes('yk-jlpt-learning-v782-page.js'));
const admin=read('admin-dashboard.html'),student=read('student-dashboard.html');
assert(admin.includes('yk-v7878-admin.js?v=78712'));
assert(admin.includes('yk-v7877-growth.js?v=78712'));
assert(!student.includes('yk-v7878-admin.js'));
assert(!existsSync('dist/netlify/functions/yk-enrollment-crm.mts'));
assert(existsSync('dist/assets/yk-v78712-i18n.js'));
console.log('PASS v78712-release: 12 exam pages, learning/grammar, admin/student isolation, localized controls, no server leak');
