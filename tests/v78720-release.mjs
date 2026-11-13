/** v7.87.20 FULL dist release gate (not standalone ZIP; requires original GitHub repo). */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
const dist=resolve('dist');
const root=resolve();
const EPOCH='78720';
const exams=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const routes=['index.html','mock-exams.html','login.html','video-class.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html',
 'study/jlpt-grammar-library.html','study/jlpt-grammar-practice.html','study/jlpt-grammar-insights.html','study/jlpt-study-calendar.html',
 ...exams.map(x=>'exams/'+x+'.html')];
let refs=0;
function inspectTag(tag,attr,page) {
 const m=tag.match(new RegExp(`\\s${attr}\\s*=\\s*(["'])([^"']+)\\1`,'i'));
 if(!m)return;
 const raw=m[2];if(/^(https?:|\/\/|data:|blob:|#)/i.test(raw))return;
 const u=new URL(raw,'https://yk.invalid/'+page);
 if(!/\.(?:js|css)$/i.test(u.pathname)||u.origin!=='https://yk.invalid')return;
 assert.equal(u.searchParams.get('ykv'),EPOCH,`${page} missing up-to-date asset query ${raw}`);
 const path=resolve(dist,'.'+decodeURIComponent(u.pathname));
 assert(path.startsWith(dist+'/')&&existsSync(path),`Missing local static asset ${raw} (${page})`);
 refs++;
}
for(const page of routes){
 const p=join(dist,page);assert(existsSync(p),`Missing route ${page}`);
 const html=readFileSync(p,'utf8');assert(html.includes('</head>')&&html.includes('</body>'));
 if(page==='mock-exams.html'||page.startsWith('exams/')) {
  assert(html.includes('yk-v78720-mobile-fixes.css?ykv=78720'),`Missing mobile modal CSS ${page}`);
  assert(html.includes("c.setAttribute('role','button');c.tabIndex=0"),`Missing keyboard-selectable plan cards ${page}`);
  for(const s of ['price:1000','price:2000','price:3000','price:5000'])assert(html.includes(s),'Plan price changed '+page);
 }
 // Protect inline JS (which can contain HTML samples) from being interpreted as page markup.
 const withoutInline=html.replace(/<script\b(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/gi,'');
 for(const tag of withoutInline.match(/<script\b[^>]*>/gi)||[])inspectTag(tag,'src',page);
 for(const tag of withoutInline.match(/<link\b[^>]*>/gi)||[])if(/\brel\s*=\s*["']stylesheet["']/i.test(tag))inspectTag(tag,'href',page);
}
assert(existsSync(join(dist,'assets/yk-v78720-mobile-fixes.css')));
const sw=readFileSync(join(dist,'service-worker.js'),'utf8');
assert(sw.includes("yk-official-v7-87-20"),'Deployed service worker not refreshed');
for(const p of ['netlify/functions','netlify/database','src/identity-client.js','scripts'])assert(!existsSync(join(dist,p)),'Private/source leaked into public output: '+p);
assert(refs>20,'Unexpectedly few versioned JS/CSS references');
console.log(`PASS v78720-release: ${routes.length} real routes, ${refs} versioned JS/CSS references, fixed plan pricing, accessible plan cards, private output safe`);
