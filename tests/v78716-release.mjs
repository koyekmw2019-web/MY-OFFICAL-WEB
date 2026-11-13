/** v7.87.16 — release gate for built public dist, not a production E2E test. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dir=resolve('dist'),r=p=>readFileSync(join(dir,p),'utf8');
const files=['study/jlpt-study-calendar.html','study/jlpt-grammar-practice.html','study/jlpt-learning.html','student-dashboard.html','admin-dashboard.html','member-dashboard.html',
 'assets/yk-v78716-calendar-engine.js','assets/yk-v78716-calendar.js','assets/yk-v78716-calendar.css','assets/yk-v78716-link.css','assets/yk-v78716-student.js','assets/yk-v78716-student.css'];
for(const f of files)assert(existsSync(join(dir,f)),`Missing public resource: ${f}`);
const page=r('study/jlpt-study-calendar.html'),student=r('student-dashboard.html'),practice=r('study/jlpt-grammar-practice.html'),learning=r('study/jlpt-learning.html');
assert(page.includes('id="yk816App"')&&page.includes('yk-v78716-calendar.js'));
assert(student.includes('yk-v78714-student.js')&&student.includes('yk-v78715-student.js')&&student.includes('yk-v78716-student.js'));
assert(practice.includes('yk816-planner-entry')&&practice.includes('href="/study/jlpt-study-calendar.html"'));
assert(learning.includes('yk816LearningCalendar'));
for(const f of ['admin-dashboard.html','member-dashboard.html'])assert(!r(f).includes('yk-v78716-student'),`Leaked Student widget: ${f}`);
assert(!existsSync(join(dir,'netlify/functions'))&&!existsSync(join(dir,'netlify/database')),'Private backend leaked into public output');
let count=0;
for(const f of ['study/jlpt-study-calendar.html','study/jlpt-grammar-practice.html','study/jlpt-learning.html','student-dashboard.html']){
 for(const m of r(f).matchAll(/<(?:link|script)\b[^>]*(?:src|href)="(\/assets\/yk-v78716-[^"?]+)(?:\?[^\"]*)?"/g)){
  assert(existsSync(join(dir,m[1].slice(1))),`Missing asset referenced by ${f}: ${m[1]}`);count++;
 }
}
assert(count>=5,'Planner, Practice, Learning Center, Student widget must link to new assets');
console.log(`PASS v78716-release: 3 navigation entrypoints, standalone page, student only, no exposed backend, ${count} checked new-asset references`);
