/** v7.87.15 release gate; only valid after full dist build or a labelled fixture. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const d=resolve('dist');const files=['study/jlpt-grammar-insights.html','study/jlpt-grammar-practice.html','study/jlpt-grammar-library.html','student-dashboard.html','admin-dashboard.html','member-dashboard.html',
 'assets/yk-v78715-insights.js','assets/yk-v78715-insights-engine.js','assets/yk-v78715-tracker.js','assets/yk-v78715-insights.css','assets/yk-v78715-link.css','assets/yk-v78715-student.js','assets/yk-v78715-student.css','assets/yk-v78714-practice.js','assets/yk-v78714-engine.js'];
for(const f of files)assert(existsSync(join(d,f)),'Missing published asset: '+f);
const page=readFileSync(join(d,'study/jlpt-grammar-insights.html'),'utf8'),practice=readFileSync(join(d,'study/jlpt-grammar-practice.html'),'utf8'),student=readFileSync(join(d,'student-dashboard.html'),'utf8');
assert(page.includes('yk-v78715-insights.js')&&practice.includes('yk815-insights-entry'));
assert(practice.includes('/assets/yk-v78714-practice.js?v=78715'),'Practice must not use cached v7.87.14 script');
assert(student.includes('yk-v78714-student.js')&&student.includes('yk-v78715-student.js')&&student.includes('yk-v78715-student.css'));
for(const f of ['admin-dashboard.html','member-dashboard.html'])assert(!readFileSync(join(d,f),'utf8').includes('yk-v78715-student'));
assert(!existsSync(join(d,'netlify/functions'))&&!existsSync(join(d,'netlify/database')));
assert(readFileSync(join(d,'assets/yk-v78714-practice.js'),'utf8').includes('yk-v78715-tracker.js'));
let refs=0;for(const f of ['study/jlpt-grammar-insights.html','study/jlpt-grammar-practice.html','student-dashboard.html']){
 const html=readFileSync(join(d,f),'utf8');for(const m of html.matchAll(/<(?:link|script)\b[^>]*(?:src|href)="(\/assets\/yk-v78715-[^"?]+)(?:\?[^\"]*)?"/g)){
  assert(existsSync(join(d,m[1].slice(1))),`Missing asset reference: ${m[1]}`);refs++;
 }
}
assert(refs>=4,'Need Insights, Practice and Student assets');
console.log('PASS v78715-release: route, practice link, Student-only widget, privacy separation, assets='+refs);
