/** Post-build release gate on REAL dist when run inside the complete checked-out repository.
 * This is not meaningful on a patch-only ZIP; the preflight prevents accidental misuse.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dist=resolve('dist');
const exams=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const pages=['index.html','mock-exams.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html',
 'login.html','video-class.html','study/jlpt-learning.html','study/jlpt-grammar-library.html',
 ...exams.map(t=>'exams/'+t+'.html'), ...['truck','taxi','bus'].map(t=>'study/ssw-'+t+'.html')];
const failures=[];let references=0;
for(const page of pages){
 const fp=join(dist,page);assert(existsSync(fp),`Missing page ${page}`);
 const html=readFileSync(fp,'utf8');
 assert(html.includes('</head>')&&html.includes('</body>'),page+' truncated HTML');
 if(page.startsWith('exams/')){
  const type=page.slice(6,-5);
  assert(html.includes(`data-exam-v728="${type}"`),page+' wrong exam link');
  assert(html.includes('id="v728-online-exam-system-js"'),page+' engine missing');
 }
 if(page==='admin-dashboard.html'){
  assert(html.includes('yk-v7878-admin.js'), 'CRM missing');
  assert(!html.includes('yk-jlpt-learning-v782-dashboard.js'), 'Student JLPT injected into admin');
 }
 if(page==='student-dashboard.html')assert(!html.includes('yk-v7878-admin.js'),'CRM leaked into student');
 if(page==='study/jlpt-grammar-library.html')assert(html.includes('yk-v7879-grammar.js'),'Grammar Library missing');
 if(page==='index.html'||page.startsWith('exams/'))assert(html.includes('yk-v78712-i18n.js'),'Language layer missing');
 // Scan static script and stylesheet tags only; do not parse HTML-like templates in inline JS.
 const clean=html.replace(/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi,'');
 for(const tag of clean.match(/<(?:script|link)\b[^>]*>/gi)||[]){
  const isJs=/^<script\b/i.test(tag),css=!isJs&&/\brel=["']stylesheet["']/i.test(tag);
  if(!isJs&&!css)continue;
  const attr=isJs?'src':'href';const match=tag.match(new RegExp(`\\b${attr}=["']([^"']+)["']`,'i'));
  if(!match)continue;
  const url=new URL(match[1],'https://local.test/'+page);
  if(url.origin!=='https://local.test'||url.pathname.startsWith('/.netlify/'))continue;
  const asset=join(dist,decodeURIComponent(url.pathname));references++;
  if(!existsSync(asset))failures.push(page+': '+match[1]);
 }
}
assert.equal(failures.length,0,'Missing static JS/CSS requests: \n'+failures.join('\n'));
const sw=readFileSync(join(dist,'service-worker.js'),'utf8');
assert(sw.includes('yk-official-v7-87-20'));
for(const f of ['netlify/functions','netlify/database'])assert(!existsSync(join(dist,f)),'Private backend leaked: '+f);
for(const l of ['n1','n2','n3','n4','n5'])assert(existsSync(join(dist,`assets/yk-v7879-grammar-${l}.json`)));
console.log(`PASS v78713-release: ${pages.length} real public pages, ${references} local JS/CSS references checked, no private backend published, versioned cache`);
