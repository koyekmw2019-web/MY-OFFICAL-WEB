/** v7.87.20 synthetic 24-route build + negative release checks + browser UX. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve();
const tmp=mkdtempSync(join(tmpdir(),'yk-v78720-fixture-'));
const exams=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const routes=['index.html','mock-exams.html','login.html','video-class.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html',
'study/jlpt-learning.html','study/jlpt-grammar-library.html','study/jlpt-grammar-practice.html','study/jlpt-grammar-insights.html','study/jlpt-study-calendar.html',
 ...['truck','taxi','bus'].map(x=>`study/ssw-${x}.html`),...exams.map(x=>`exams/${x}.html`)];
const put=(path,body)=>{const p=join(tmp,'dist',path);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,body)};
const run=(script)=>spawnSync(process.execPath,[join(root,script)],{cwd:tmp,encoding:'utf8'});
const plans=`
<script>
const PLANS={week:{name:'1 Week',price:1000},month:{name:'1 Month',price:2000},'3months':{name:'3 Months',price:3000},year:{name:'1 Year',price:5000}};
function overlay(html){const o=document.getElementById('mount');o.innerHTML='<div class="exam-v728-modal"><div class="exam-plans-v728">'+html+'</div></div>';return o;}
const $$=(query,root=document)=>[...root.querySelectorAll(query)];
const checkout=k=>document.getElementById('selection').textContent=k;
function planModal(){const cards=Object.entries(PLANS).map(([k,p])=>\`<div class="exam-plan-card-v728" data-plan="\${k}"><small>\${p.name}</small><b>¥\${p.price.toLocaleString()}</b><span>Access starts on Admin approval date</span></div>\`).join('');const o=overlay(cards);$$('[data-plan]',o).forEach(c=>c.onclick=()=>checkout(c.dataset.plan))}
document.addEventListener('DOMContentLoaded',()=>{planModal();document.getElementById('language').addEventListener('change',e=>document.documentElement.lang=e.target.value);});
</script>`;
const template=(route)=>`<!doctype html><html lang="my"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:0;background:#111;color:#fff;font-family:Arial,'Noto Sans Myanmar',sans-serif}.exam-v728-overlay{padding:8px}.exam-v728-modal{margin:auto;background:#181818;border:1px solid #444;padding:12px;border-radius:16px}.exam-plans-v728{display:grid;gap:8px}.exam-plan-card-v728{border:1px solid #777;padding:16px;display:grid;gap:8px;border-radius:12px}#language{max-width:100%}</style>
<link rel="stylesheet" href="/assets/yk-v78718-exam-access.css?v=78718"><script defer src="/assets/app.js?v=1"></script>
</head><body>${route==='index.html'?'<img alt="YouTube preview" src="https://yt3.ggpht.com/example.jpg"/>':''}<div class="exam-v728-overlay" id="mount"></div><div id="selection"></div>
<select id="language"><option value="my">မြန်မာ</option><option value="en">English</option><option value="ja">日本語</option></select>
${plans}
<script>const content = '<link rel="stylesheet" href="/assets/not-a-real-file.css">';</script></body></html>`;
try{
 for(const route of routes)put(route,template(route));
 for(const p of ['assets/app.js','assets/yk-v78718-exam-access.css'])put(p,'/* test */');
 copyFileSync(join(root,'assets/yk-v78720-mobile-fixes.css'),join(tmp,'dist/assets/yk-v78720-mobile-fixes.css'));mkdirSync(join(tmp,'assets'),{recursive:true});copyFileSync(join(root,'assets/yk-v78720-mobile-fixes.css'),join(tmp,'assets/yk-v78720-mobile-fixes.css'));
 copyFileSync(join(root,'service-worker.js'),join(tmp,'service-worker.js'));
 const build=run('scripts/build-v78720-mobile-pwa.mjs');assert.equal(build.status,0,build.stderr+'\n'+build.stdout);
 const report=JSON.parse(build.stdout);assert.equal(report.examPaymentPagesEnhanced,13);
 assert(report.localStaticRefsVersioned>=routes.length*2);
 assert.equal(report.routes,routes.length);
 const homepage=readFileSync(join(tmp,'dist/index.html'),'utf8');
 assert(homepage.includes('loading="lazy"')&&homepage.includes('decoding="async"'),'Homepage remote gallery should not load eagerly');
 assert(homepage.includes('app.js?v=1&ykv=78720'),'Original static query should be preserved');
 assert(homepage.includes("'<link rel=\"stylesheet\" href=\"/assets/not-a-real-file.css\">'"),'Inline HTML-looking text must not be modified');
 const sample=readFileSync(join(tmp,'dist/mock-exams.html'),'utf8');
 assert(sample.includes("c.setAttribute('role','button')"),'Plan keyboard code missing');
 assert(sample.includes('/assets/yk-v78720-mobile-fixes.css?ykv=78720'));
 let result=run('tests/v78720-release.mjs');assert.equal(result.status,0,result.stderr+'\n'+result.stdout);
 if(process.env.YK_RUN_BROWSER_QA==='1'){
  const browser=spawnSync('python',[join(root,'tests/v78720-browser-qa.py'),join(tmp,'dist/mock-exams.html')],{cwd:tmp,encoding:'utf8',timeout:90000});
  assert.equal(browser.status,0,browser.stderr+'\n'+browser.stdout);
 }
 const p=join(tmp,'dist/exams/truck.html');const good=readFileSync(p,'utf8');
 writeFileSync(p,good.replace('app.js?v=1&ykv=78720','app.js?v=1'));
 result=run('tests/v78720-release.mjs');assert.notEqual(result.status,0,'Stale JS must fail release');
 writeFileSync(p,good);
 writeFileSync(p,good.replace('price:2000','price:9999'));
 result=run('tests/v78720-release.mjs');assert.notEqual(result.status,0,'Tampered plan price must fail');
 writeFileSync(p,good);
 put('netlify/functions/_shared/auth.mts','private fixture');
 result=run('tests/v78720-release.mjs');assert.notEqual(result.status,0,'Published private source must fail');
 console.log('PASS v78720-build-fixture: '+report.routes+' synthetic pages, '+report.localStaticRefsVersioned+' versioned static links, mobile browser, stale JS / plan price / private leak negative gates');
}finally{rmSync(tmp,{recursive:true,force:true})}
