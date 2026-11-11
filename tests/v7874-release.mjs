import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const rd=p=>readFileSync('dist/'+p,'utf8');
const ids=['home','about','portal','study-hub','yk82Hub','study-resources','driving-dictionary'];
const types=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
for(const path of ['mock-exams.html',...types.map(x=>'exams/'+x+'.html')]){
 const page=rd(path);
 assert(page.includes('yk874-education-menu'),path);
 assert(page.includes('yk-v7874-nav.css?v=7874'),path);
 assert(page.includes('yk-v7874-nav.js?v=7874'),path);
 const nav=page.match(/<nav class="site-menu-nav">([\s\S]*?)<\/nav>/)?.[1];
 assert(nav,path+' must have menu');
 for(const id of ids)assert(nav.includes(`href="/#${id}" data-yk874-return-home="${id}"`),path+':'+id);
 for(const id of ids)assert(!nav.includes(`href="#${id}"`),path+':'+id+' legacy local link');
 assert(nav.includes('href="/video-class.html"'),path+': video link preserved');
 assert(nav.includes('href="/mock-exams.html"'),path+': mock exam link preserved');
 assert(page.includes('<div>STUDYING WITH YE KUN</div></a>'),path+': education brand preserved');
 assert(page.includes('<div class="menu-kicker">STUDYING WITH YE KUN</div>'),path+': menu brand preserved');
 assert(page.includes('href="/#home"'),path+': logo returns home');
 assert(page.includes('id="v728-online-exam-system-js"')&&page.includes('id="examPanel"'),path+': exam engine preserved');
 if(path==='mock-exams.html'){
   assert.equal((page.match(/data-exam-v728=/g)||[]).length,12,'Center retains 12 exam cards');
 }else{
   const t=path.match(/exams\/(.+)\.html/)[1];
   assert(page.includes('yk873-exam-page'),t+': previous UI stays');
   assert.equal((page.match(/data-exam-v728=/g)||[]).length,1,t+': one exam card');
   assert(page.includes(`data-exam-v728="${t}"`),t+': correct card');
 }
}
for(const p of ['assets/yk-v7874-nav.js','assets/yk-v7874-nav.css'])assert(existsSync('dist/'+p),p);
console.log('PASS v7874-release: 7 home destinations, JLPT menu correction, education branding, 13 generated pages, 12 original exam engines');
