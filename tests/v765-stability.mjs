/** v7.65 isolated stability tests. Node 22+ and mock browser helpers. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root = new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const data=JSON.parse(read('assets/jlpt-native-mock-v752.json'));
let passed=0;function check(label,fn){try{fn();console.log('PASS '+label);passed++}catch(e){console.error('FAIL '+label+': '+e.message);throw e}}
const script=read('assets/jlpt-native-v750.js');
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const start=script.indexOf('const jlptFuriMap=');
const stop=script.indexOf('const rand=a=>',start);
assert(start!==-1&&stop!==-1);
const furi=new Function('esc',script.slice(start,stop)+'\nreturn {rich,isReadingAssessment}')(esc);
check('N5 読み方 target cannot reveal 時計 reading',()=>{
 const q=data.questions.find(q=>q.id==='YK-NATIVE-N5-01');assert(q);const html=furi.rich(q.question,q);
 assert(!html.includes('<rt>'),html);assert(html.includes('時計'));
 for(const o of q.options)assert(!furi.rich(o,q).includes('<rt>'));
});
check('All 5 JLPT levels: no ruby during 文字・語彙',()=>{
 for(const level of ['N1','N2','N3','N4','N5']){
  const qs=data.questions.filter(q=>q.level===level && q.section==='vocabulary');assert(qs.length>0);
  for(const q of qs){for(const text of [q.question,q.passage,...q.options])assert(!furi.rich(text,q).includes('<rt>'),q.id)}
 }
});
check('Additional direct reading prompts protected regardless of section',()=>{
 const q={section:'grammar',question:'次の漢字の読み方は何ですか？ 時計'};
 assert(!furi.rich(q.question,q).includes('<rt>'));
});
check('Furigana remains available for non-tested context',()=>{
 const q={section:'grammar',question:'学校で勉強します。'};
 const html=furi.rich('学校で勉強します。',q);
 assert(html.includes('<ruby>学校<rt>がっこう</rt></ruby>'),html);
});
check('Post-submit review can show annotated target words',()=>{
 assert(furi.rich('時計').includes('<ruby>時計<rt>とけい</rt></ruby>'));
});
check('Escaping protects arbitrary text in exam content',()=>{
 const html=furi.rich('<script>alert(1)</script>学校',{section:'grammar',question:'いつですか'});
 assert(!html.includes('<script>')&&html.includes('&lt;script&gt;'));
});
const helperSource=read('assets/yk-learning-score-v765.js');
const context={window:{}};vm.createContext(context);vm.runInContext(helperSource,context);
const score=context.window.YKLearningScoreV765;
check('Chart max score mapping by exam type',()=>{
 assert.equal(score.maxFor('jlpt_n5'),180);assert.equal(score.maxFor('truck'),50);
 assert.equal(score.maxFor('maintenance'),45);assert.equal(score.maxFor('car'),95);
 assert.equal(score.maxFor('moped'),48);assert.equal(score.maxFor('unrecognized'),null);
});
check('Different score scales normalize to comparable percentages',()=>{
 const attempts=[{status:'submitted',score_verified:true,score:90,exam_type:'jlpt_n5'},
  {status:'submitted',score_verified:true,score:25,exam_type:'truck'},
  {status:'submitted',score_verified:true,score:95,exam_type:'car'}];
 assert.equal(score.normalize(attempts[0]),50);assert.equal(score.normalize(attempts[1]),50);assert.equal(score.normalize(attempts[2]),100);
});
check('Legacy unverified, pending, invalid and unknown results excluded',()=>{
 for(const a of [{status:'submitted',score_verified:false,score:180,exam_type:'jlpt_n5'},
 {status:'started',score_verified:true,score:180,exam_type:'jlpt_n5'},
 {status:'submitted',score_verified:true,score:9999,exam_type:'truck'},
 {status:'submitted',score_verified:true,score:10,exam_type:'unrecognized'}])assert.equal(score.normalize(a),null);
});
check('Filtered chart uses most recent 8 verified attempts',()=>{
 const arr=Array.from({length:10},(_,i)=>({status:'submitted',score_verified:true,score:i*5,
  exam_type:'truck',submitted_at:new Date(2026,0,i+1).toISOString()}));
 arr.push({status:'submitted',score_verified:true,score:50,exam_type:'taxi',submitted_at:new Date(2026,2,1).toISOString()});
 const rs=score.series(arr,'truck');assert.equal(rs.length,8);assert.equal(rs[0].score,20);assert.equal(rs.at(-1).score,90);
 assert.equal(score.series(arr,'taxi').length,1);assert.equal(score.series(arr,'all').length,8);
});
check('Dashboard graph helper loaded on all role dashboards',()=>{
 for(const p of ['admin-dashboard.html','student-dashboard.html','member-dashboard.html','dashboard.html']){
  const html=read(p);assert(html.includes('/assets/yk-learning-score-v765.js'));
  assert(html.indexOf('yk-learning-score-v765.js')<html.indexOf('yk-dashboard-v758.js'));
 }
});
check('v7.65 leaves auth, payment, save/resume and YKCR API files in place',()=>{
 for(const p of ['netlify/functions/exam-attempt-submit.mts','netlify/functions/exam-checkpoint.mts',
  'netlify/functions/exam-access.mts','netlify/functions/exam-admin-payments.mts',
  'netlify/functions/exam-student-verify.mts','netlify/functions/ykcr-student-sync.mts',
  'netlify/functions/_shared/auth.mts'])assert(read(p).length>100,p);
});
console.log(`TOTAL ${passed} PASS / 0 FAIL (static/mocked; not deployed)`);
