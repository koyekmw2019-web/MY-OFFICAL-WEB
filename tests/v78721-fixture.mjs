/** v7.87.21 real negative-gate tests on synthetic output, not production QA. */
import {mkdtempSync,writeFileSync,readFileSync,rmSync,mkdirSync,unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve();const tmp=mkdtempSync(join(tmpdir(),'yk-v78721-fixture-'));const dist=join(tmp,'dist');
const write=(name,s)=>{let p=join(dist,name);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,s)};
const exams=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n1','jlpt_n2','jlpt_n3','jlpt_n4','jlpt_n5'];
const pages=['index.html','login.html','video-class.html','mock-exams.html','dashboard.html','dictionary-reports.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html','study/jlpt-learning.html','study/ssw-truck.html','study/ssw-taxi.html','study/ssw-bus.html','study/jlpt-grammar-library.html','study/jlpt-grammar-practice.html','study/jlpt-grammar-insights.html','study/jlpt-study-calendar.html',...exams.map(x=>`exams/${x}.html`)];
function page(p){const plans=p==='mock-exams.html'||p.startsWith('exams/')?`<script>const PLANS={week:{price:1000},month:{price:2000},three:{price:3000},year:{price:5000}};c.setAttribute('role','button');c.tabIndex=0;</script><link rel="stylesheet" href="/assets/yk-v78720-mobile-fixes.css?ykv=78720">`:'';
 return `<!doctype html><html lang="my"><head><title>STUDYING WITH YE KUN</title><link rel="stylesheet" href="/assets/app.css?ykv=78720"><script src="/assets/app.js?ykv=78720" defer></script>${plans}</head><body><main>Page ${p}</main></body></html>`}
const run=(script,args=[])=>spawnSync(process.execPath,[join(root,script),...args],{cwd:root,encoding:'utf8',timeout:20000});
try{
 writeFileSync(join(tmp,'package.json'),JSON.stringify({version:'7.87.21'}));
 for(const p of pages)write(p,page(p));
 write('assets/app.css','body{background:#111}');write('assets/app.js','console.log("test")');write('assets/yk-v78720-mobile-fixes.css','/* UI */');
 write('sitemap.xml','<urlset/>');write('robots.txt','User-agent: *');write('manifest.webmanifest','{"name":"YK"}');
 write('service-worker.js',"/* yk-official-v7-87-20 */ request.mode === 'navigate'; request.method !== 'GET'; /.netlify/");
 const flags=['--root',tmp,'--dist',dist,'--fixture'];
 let a=run('scripts/audit-v78721-release.mjs',flags);assert.equal(a.status,0,'Positive fixture audit must pass: '+a.stdout+'\n'+a.stderr);
 let s=run('scripts/smoke-v78721-preview.mjs',['--dist',dist]);assert.equal(s.status,0,'Local HTTP preview must pass: '+s.stderr+'\n'+s.stdout);
 const fail=(label,action,restore)=>{action();let r=run('scripts/audit-v78721-release.mjs',flags);assert.notEqual(r.status,0,`${label} must block release`);restore();};
 const path=join(dist,'assets/app.js');let original=readFileSync(path);
 fail('missing JS/CSS dependency',()=>unlinkSync(path),()=>writeFileSync(path,original));
 const home=join(dist,'index.html');let html=readFileSync(home,'utf8');
 fail('stale JS cache key',()=>writeFileSync(home,html.replace('app.js?ykv=78720','app.js?ykv=78719')),()=>writeFileSync(home,html));
 const truck=join(dist,'exams/truck.html');let exam=readFileSync(truck,'utf8');
 fail('tampered paid-plan price',()=>writeFileSync(truck,exam.replace('price:3000','price:9999')),()=>writeFileSync(truck,exam));
 fail('missing exam route',()=>unlinkSync(truck),()=>writeFileSync(truck,exam));
 write('netlify/functions/exam-access.mts','secret');a=run('scripts/audit-v78721-release.mjs',flags);assert.notEqual(a.status,0,'private backend leaked into dist must block release');
 const bad=run('scripts/smoke-v78721-preview.mjs',['--dist',join(tmp,'missing')]);assert.notEqual(bad.status,0,'missing dist must block preview');
 console.log('PASS v78721-fixture: 29 synthetic public routes; positive release audit and real local HTTP smoke; negative missing JS, stale JS, tampered price, missing route, backend leak and missing dist blocked');
}finally{rmSync(tmp,{recursive:true,force:true})}
