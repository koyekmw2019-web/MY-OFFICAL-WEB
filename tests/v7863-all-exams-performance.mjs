/** v7.86.3: all 12 exam types, no mixed scoring, progressive private data, deploy-only lazy dictionary. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {lazyDictionaryHTML} from '../scripts/_dictionary-lazy-v7863.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');
const engineCode=read('assets/yk-all-exams-v7863-engine.js');
const ctx={};vm.createContext(ctx);vm.runInContext(engineCode,ctx);
const all=ctx.YKAllExamsV7863;let passed=0;
function test(name,fn){fn();passed++;console.log('PASS v7863 '+name)}
const attempt=(t,score,verified=true,passed=false,status='submitted')=>({exam_type:t,score,score_verified:verified,passed,status,submitted_at:'2026-11-09T12:00:00Z'});
test('12 supported exams and correct independent types/caps',()=>{
 assert.equal(all.catalog.length,12);assert.equal(new Set(all.catalog.map(x=>x.type)).size,12);
 assert.equal(all.list('ssw').length,4);assert.equal(all.list('driving').length,3);assert.equal(all.list('jlpt').length,5);
 assert.equal(all.catalog.find(x=>x.type==='maintenance').max,45);assert.equal(all.catalog.find(x=>x.type==='moped').max,48);
 assert.equal(all.catalog.find(x=>x.type==='jlpt_n5').max,180);
});
test('truck scores 25/50 and 30/50 average 55 percent',()=>{
 const s=all.summarize([attempt('truck',25),attempt('truck',30)],'truck');
 assert.equal(s.averagePercent,55);assert.equal(s.verified,2);assert.equal(s.passRate,0);
});
test('do not combine unequal JLPT, driving and SSW point scales',()=>{
 const rows=[attempt('truck',25),attempt('jlpt_n5',180),attempt('car',95)];
 const allRows=all.allSummary(rows);
 assert.equal(allRows.verified,3);assert.equal(Object.hasOwn(allRows,'averagePercent'),false);
 assert.equal(all.summarize(rows,'truck').averagePercent,50);
 assert.equal(all.summarize(rows,'jlpt_n5').averagePercent,100);
});
test('unverified, incomplete, null and impossible scores not used',()=>{
 const rows=[attempt('taxi',39,false,true),attempt('taxi',null),attempt('taxi',54),attempt('taxi',30,true,true,'started')];
 const s=all.summarize(rows,'taxi');assert.equal(s.verified,0);assert.equal(s.averagePercent,null);assert.equal(s.excluded,3);
});
test('unknown or missing pass status is not counted as 0 percent',()=>{
 const a=attempt('bus',35);a.passed=null;
 const s=all.summarize([a],'bus');assert.equal(s.verified,1);assert.equal(s.passKnown,0);assert.equal(s.passRate,null);
});
test('SSW category only counts SSW attempts',()=>{
 const rows=[attempt('truck',50),attempt('jlpt_n1',180),attempt('moped',45)];
 assert.equal(all.allSummary(rows,'ssw').verified,1);assert.equal(all.allSummary(rows,'jlpt').verified,1);
});
test('no evidence is not declared a weak exam',()=>{
 assert.equal(all.allSummary([]).weakTypes.length,0);
 assert.equal(all.allSummary([attempt('truck',5)]).weakTypes.length,0);
 assert.equal(all.allSummary([attempt('truck',20),attempt('truck',25)]).weakTypes.length,1);
});
test('wrong answers are filtered to selected exam only',()=>{
 const data=[{exam_type:'truck',missed_count:3},{exam_type:'taxi',missed_count:7},{exam_type:'truck',missed_count:1}];
 assert.equal(all.mistakesFor(data,'truck').length,2);
 assert.equal(all.mistakesFor(data,'truck')[0].missed_count,3);
});
test('UI uses only account-scoped read-only APIs and shared activity request',()=>{
 const js=read('assets/yk-dashboard-pro-v784.js');
 for(const x of ['exam-my-activity','yk-learning','jlpt-learning-progress','jlpt-learning-v782-content.json','jlpt-reading-v7822-upgrade.json'])assert(js.includes(x));
 assert(js.includes('YKDashboardActivityPromiseV7863'));assert(js.includes('yk863JLPTLoad'));assert(js.includes('yk863Mistakes'));
 assert(!js.includes('exam-attempt-submit'));assert(!js.includes('exam-access?'));
 for(const x of ['netlify/functions/exam-my-activity.mts','netlify/functions/yk-learning.mts'])assert(read(x).includes('requireUser()'));
});
test('no eager JLPT or mistake fetch on account dashboard initial mount',()=>{
 const js=read('assets/yk-dashboard-pro-v784.js');
 const loading=js.slice(js.indexOf('async function loadStudent(){'),js.indexOf('async function loadMistakes()'));
 assert(loading.includes('await getActivity()'));
 assert(!loading.includes('jlpt-learning-progress'));assert(!loading.includes('yk-learning'));
 const old=read('assets/yk-dashboard-v758.js');
 assert(old.includes('window.YKDashboardActivityPromiseV7863=shared'));
 assert(!old.includes('paintLearningInsights(xs);void loadLearningFocus(xs)'));
 const legacy=read('assets/yk-learning-v760.js');assert(!legacy.includes('setTimeout(load,1200)'));
 assert(legacy.includes("details?.addEventListener('toggle'"));
});
test('new layout preserves responsive semantics and accessibility',()=>{
 const page=read('student-dashboard.html'),css=read('assets/yk-dashboard-pro-v784.css');
 assert(page.includes('yk-all-exams-v7863-engine.js'));
 assert(css.includes('.yk863-categories'));assert(css.includes('@media(max-width:620px)'));
 assert(read('assets/yk-dashboard-pro-v784.js').includes('aria-pressed'));
 assert(css.includes('focus-visible'));assert(['v7863-all-exams','v7864-jlpt-menu'].some(v=>read('service-worker.js').includes(v)));
});
test('deploy-only dictionary preserves original source and produces lazy loader',()=>{
 const source=read('index.html');assert(source.includes('<script src="/assets/yk-dictionary-v778-complete-draft.js?v=778qa20261105"></script>'));
 const deployed=source.replace('/assets/yk-dictionary-v778-complete-draft.js?v=778qa20261105','/assets/yk-dictionary-v778-complete-draft.js?v=7841packed');
 const out=lazyDictionaryHTML(deployed);
 assert(out.code.includes('Array.isArray(window.YK_DICTIONARY_V778)'));
 assert(!out.html.includes('const incomingV769 ='));
 assert(out.html.includes('yk863-dictionary-loader'));
 assert(out.html.includes('yk-dictionary-runtime-v7863.js'));
 assert(Buffer.byteLength(out.html)<Buffer.byteLength(source)*0.8);
});
test('deploy output has no personal DB source or unpublished drafts',()=>{
 if(!existsSync(join(root,'dist')))return;
 for(const path of ['index.html','assets/yk-all-exams-v7863-engine.js','assets/yk-dictionary-runtime-v7863.js'])assert(existsSync(join(root,'dist',path)),path);
 for(const name of ['netlify','src','tests','scripts','DICTIONARY_v7_83_FULL_CATALOG.json'])assert(!existsSync(join(root,'dist',name)),name);
 assert(statSync(join(root,'dist/index.html')).size<statSync(join(root,'index.html')).size);
});
test('no original protected backend change required',()=>{
 for(const file of ['netlify/functions/exam-access.mts','netlify/functions/exam-payment-submit.mts','netlify/functions/ykcr-student-sync.mts','netlify/functions/exam-attempt-submit.mts','assets/characters/student-v7821.webp','assets/characters/teacher-v7821.webp'])assert(existsSync(join(root,file)));
 const p=JSON.parse(read('package.json'));assert(['7.86.3','7.86.4'].includes(p.version));
 assert(read('netlify.toml').includes('publish = "dist"'));
});
console.log(`v7.86.3: ${passed} PASS / 0 FAIL`);
