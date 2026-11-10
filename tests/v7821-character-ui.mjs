/** v7.82.1 character layer – safeguard the learning app and brand UI. */
import { readFileSync, existsSync,statSync } from 'node:fs';
import { join,resolve,dirname } from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=x=>readFileSync(join(root,x),'utf8');
let pass=0;
function check(title,fn){fn();pass++;console.log('PASS '+title)}
const html=read('study/jlpt-learning.html'),index=read('index.html');
check('v7.82.1 has matching package release and unchanged official title',()=>{
 assert(['7.82.1','7.82.2','7.83.0','7.84.0','7.84.1','7.85.0','7.86.0','7.86.1','7.86.2'].includes(JSON.parse(read('package.json')).version));
 assert(index.includes('<title>YE KUN Official Website | YE LINN OO</title>'));
 assert(html.includes('STUDYING WITH YE KUN'));
});
check('Approved student and teacher character assets are lightweight static WebP',()=>{
 for(const name of ['student','teacher']){
  const p=`assets/characters/${name}-v7821.webp`;
  assert(existsSync(join(root,p)));
  assert(statSync(join(root,p)).size>8000 && statSync(join(root,p)).size<100000);
  assert.equal(readFileSync(join(root,p)).subarray(8,12).toString(),'WEBP');
  assert(index.includes('/'+p)&&html.includes('/'+p));
 }
});
check('All JLPT levels and original six-card study hub navigation preserved',()=>{
 assert.equal((index.match(/data-category="(?:vocabulary|grammar|kanji|reading|listening|mock)"/g)||[]).length,6);
 for(const level of ['N1','N2','N3','N4','N5'])assert(index.includes(`data-level="${level}"`));
 for(const name of ['vocabulary','grammar','kanji','reading','listening'])assert(html.includes(`data-tab="${name}"`));
 assert(index.includes('id="studyHubMoreV733"'));
});
check('Feedback guide has accessible real user-action hooks, no fake progress',()=>{
 const js=read('assets/yk-jlpt-characters-v7821.js');
 for(const a of ['bookmark','complete','answer','daily-answer','daily-start']) assert(js.includes(`what==='${a}'`)||js.includes(`what==='answer'||what==='daily-answer'`));
 assert(html.includes('role="status" aria-live="polite"'));
 assert(js.includes('YKJLPTStateV782?.isSaved'));
 assert(html.includes('id="yk821StartDaily"'));
 assert(html.includes('id="yk821TeacherTip"'));
});
check('All four dashboard types get non-invasive character branding',()=>{
 for(const file of ['dashboard.html','student-dashboard.html','member-dashboard.html','admin-dashboard.html']){
  assert(read(file).includes('yk-jlpt-characters-v7821.css'));
 }
 assert(read('assets/yk-jlpt-learning-v782-dashboard.js').includes('yk821-dashboard-hero'));
});
check('Learning dataset/SEO sitemap and separated private backend remain in original versions',()=>{
 const data=JSON.parse(read('assets/jlpt-learning-v782-content.json'));
 const sections=['vocabulary','grammar','kanji','reading','listening'];
 const total=Object.values(data.levels).reduce((count,lv)=>count+sections.reduce((n,x)=>n+lv[x].length,0),0);
 assert.equal(total,152);
 assert(!read('assets/yk-jlpt-characters-v7821.js').includes('/.netlify/functions/exam-'));
 assert(read('sitemap.xml').includes('/study/jlpt-learning.html'));
});
check('Reduced-motion and mobile accessibility design rules exist',()=>{
 const css=read('assets/yk-jlpt-characters-v7821.css');
 for(const str of ['prefers-reduced-motion','focus-visible','max-width:640px','yk821-reaction','yk821-hub-welcome']) assert(css.includes(str));
});
console.log(`TOTAL v7.82.1 CHARACTER UI: ${pass} PASS / 0 FAIL`);
