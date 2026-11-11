/** Post-build: each route keeps only its own original card and engine. */
import assert from 'node:assert/strict';
import {readFileSync,statSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const types=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const center=read('dist/mock-exams.html');
assert.equal((center.match(/data-exam-v728=/g)||[]).length,12);
assert(center.includes('yk-v787-routing.js?v=7872'));
assert(read('dist/index.html').includes('yk-v787-routing.js?v=7872'));
assert(!read('dist/index.html').includes('id="examPanel"'));
for(const type of types){
 const path='dist/exams/'+type+'.html';
 assert(existsSync(path),path);
 const page=read(path);
 assert(page.includes('data-exam-type="'+type+'"'));
 assert(page.includes('data-exam-v728="'+type+'"'));
 assert.equal((page.match(/data-exam-v728=/g)||[]).length,1,type);
 assert(page.includes('id="examPanel"'));
 assert(page.includes('id="v728-online-exam-system-js"'));
 assert(page.includes('/assets/yk-v7872-exam-mobile.css?v=7872'));
 assert(page.includes('/assets/yk-v7872-exam-mobile.js?v=7872'));
 assert(!page.includes('id="home"'));
 assert(!page.includes('id="driving-dictionary"'));
 assert(!page.includes('id="yk863-dictionary-loader"'));
 assert(statSync(path).size<statSync('dist/mock-exams.html').size,type+' should be smaller');
}
for(const f of ['dist/assets/yk-v7872-exam-mobile.css','dist/assets/yk-v7872-exam-mobile.js'])assert(existsSync(f));
console.log('PASS v7872-release 12 isolated exam pages (static checks; live login/payment QA still required)');
