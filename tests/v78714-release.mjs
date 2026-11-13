/** Release gate for real dist: run only after full repo build & earlier v7.87.13 gate. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const dist=resolve('dist');
for(const p of ['study/jlpt-grammar-library.html','study/jlpt-grammar-practice.html','student-dashboard.html','admin-dashboard.html',
'assets/yk-v78714-engine.js','assets/yk-v78714-practice.js','assets/yk-v78714-practice.css','assets/yk-v78714-choice-bank.json','assets/yk-v78714-student.js','assets/yk-v78714-student.css','assets/yk-v78714-link.css'])assert(existsSync(join(dist,p)),p);
const grammar=readFileSync(join(dist,'study/jlpt-grammar-library.html'),'utf8');
assert(grammar.includes('yk-v7879-grammar.js')&&grammar.includes('yk814-library-practice'),'Grammar library must remain and link to practice');
const page=readFileSync(join(dist,'study/jlpt-grammar-practice.html'),'utf8');
assert(page.includes('yk-v78714-practice.js')&&page.includes('yk814App'));
const student=readFileSync(join(dist,'student-dashboard.html'),'utf8');
assert(student.includes('yk-v78714-student.js')&&student.includes('yk-v7876-journey.js'));
const admin=readFileSync(join(dist,'admin-dashboard.html'),'utf8');
assert(!admin.includes('yk-v78714-student.js')&&!admin.includes('yk-v78714-practice.js'));
const members=readFileSync(join(dist,'member-dashboard.html'),'utf8');assert(!members.includes('yk-v78714-student.js'));
for(const level of ['n5','n4','n3','n2','n1'])assert(existsSync(join(dist,`assets/yk-v7879-grammar-${level}.json`)));
const paths=['study/jlpt-grammar-practice.html','student-dashboard.html','study/jlpt-grammar-library.html'];
let refs=0;for(const p of paths){const html=readFileSync(join(dist,p),'utf8');for(const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["'](\/assets\/yk-v78714-[^"']+)["'][^>]*>/g)){
 const name=m[1].split('?')[0];assert(existsSync(join(dist,name.slice(1))),`${p} missing ${name}`);refs++;
}}
assert(refs>=4,'Practice imports and UI static references should remain available');
const bank=JSON.parse(readFileSync(join(dist,'assets/yk-v78714-choice-bank.json'),'utf8'));assert.equal(bank.items.length,40);
for(const f of ['netlify/functions','netlify/database'])assert(!existsSync(join(dist,f)),'Private backend published');
console.log('PASS v78714-release: Grammar Practice page, student-only widget, lesson deep link, MCQ bank, no private backend or admin leakage. References checked: '+refs);
