/** Minimal synthetic fixture, *not* full production build or browser checkout test. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
const root=resolve(),tmp=mkdtempSync(join(tmpdir(),'yk-v78718-'));
const put=(p,s)=>{const file=join(tmp,'dist',p);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,s)};
const run=(path)=>spawnSync(process.execPath,[join(root,path)],{cwd:tmp,encoding:'utf8'});
const types=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const content=`<!doctype html><html><head><meta charset="utf-8"></head><body>
<div id="examAccessTitleV728">Guest Access</div><div id="examAccessTextV728">One free attempt per exam type · Student verification or paid access is available.</div>
<div id="examPlanMiniTextV739">1 Week ¥1,000 · 1 Month ¥2,000<br>3 Months ¥3,000 · 1 Year ¥5,000</p>
<button id="examPlansV728"></button><button id="examPlansMiniV728"></button>
<script>
const V737_TEXT={my:{},ja:{}};
function v737TranslateBase(base,lang){let m;if(lang==='en')return base;const d=V737_TEXT[lang]||{};if(Object.prototype.hasOwnProperty.call(d,base)) return d[base];return base;}
const V737_ORIGINAL_TEXT = new WeakMap();
const PLANS={week:{price:1000},month:{price:2000},"3months":{price:3000},year:{price:5000}};
function statusText(s,user){if(!user)return {state:'guest',icon:'🔐',t:'Guest Access',x:'Login / Register required · One free attempt per exam type.'};return {state:'member'};}
function setAccessButtonsV739(s,user,state){const miniText={innerHTML:''};miniText.innerHTML='1 Week ¥1,000 · 1 Month ¥2,000<br>3 Months ¥3,000 · 1 Year ¥5,000';return miniText.innerHTML;}
function planModal(){const cards=Object.entries(PLANS).map(([k,p])=>\`<div class="exam-plan-card-v728" data-plan="\${k}"><small>label</small><b>¥\${p.price.toLocaleString()}</b><span>Access starts on Admin approval date</span></div>\`).join('');const dialog=\`<div class="exam-plans-v728">\${cards}</div>\`;$$('[data-plan]',o).forEach(c=>c.onclick=()=>checkout(c.dataset.plan));return cards}
function syncStatus(){}
function v737Localize(root=document,lang='my'){}
</script></body></html>`;
try{
 put('mock-exams.html',content);
 for(const type of types)put('exams/'+type+'.html',content);
 for(const p of ['index.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html','login.html'])put(p,'<!doctype html><html><head></head><body>Unchanged</body></html>');
 const css='assets/yk-v78718-exam-access.css';const dest=join(tmp,'dist',css);mkdirSync(dirname(dest),{recursive:true});copyFileSync(join(root,css),dest);
 let res=run('scripts/build-v78718-exam-access-copy.mjs');assert.equal(res.status,0,res.stderr||res.stdout);
 res=run('tests/v78718-release.mjs');assert.equal(res.status,0,res.stderr||res.stdout);
 const updated=readFileSync(join(tmp,'dist/mock-exams.html'),'utf8');
 // Run only our inserted trusted-translation snippet in isolation.
 const start=updated.indexOf('/* v7.87.18: targeted guest / plan copy');
 const end=updated.indexOf('const V737_ORIGINAL_TEXT',start);
 assert(start>=0&&end>start);
 const vm={V737_TEXT:{my:{},ja:{}}};runInNewContext(updated.slice(start,end),vm);
 const original='Log in or register to take an exam. Each exam type includes one free attempt per account. STUDYING WITH YE KUN students can verify their enrollment with Student Verify. To purchase a plan, select View Plans.';
 assert(vm.V737_TEXT.my[original].includes('စာမေးပွဲအမျိုးအစားတစ်ခုစီကို အခမဲ့ ၁ ကြိမ်'));
 assert(vm.V737_TEXT.my['Access starts on Admin approval date'].includes('Admin'));
 assert(vm.V737_TEXT.ja[original].includes('試験種別'));
 assert(vm.V737_TEXT.my['Bank Transfer only. After transfer, upload your receipt. Access begins when Admin approves the request.'].includes('Screenshot'));
 res=run('scripts/build-v78718-exam-access-copy.mjs');assert.notEqual(res.status,0,'Must reject double-build');
 const old=readFileSync(join(tmp,'dist/exams/taxi.html'),'utf8');
 const broken=old.replace('price:2000','price:9999');writeFileSync(join(tmp,'dist/exams/taxi.html'),broken);
 res=run('tests/v78718-release.mjs');assert.notEqual(res.status,0,'Price change must fail release test');
 console.log('PASS v78718-build-fixture: 13 pages, localization, repeat prevention, price tamper gate');
}finally{rmSync(tmp,{recursive:true,force:true})}
