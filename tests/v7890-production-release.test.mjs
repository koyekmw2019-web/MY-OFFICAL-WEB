import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {secondBank} from '../netlify/functions/_shared/ordinary-second-bank.mts';
import {generateManifest,readManifest,gradeSecond,publicQuestions,validateSnapshot} from '../netlify/functions/_shared/ordinary-second-engine.mts';
const texts=new Map(secondBank.originalItems.map(q=>[q.id,q]));
const scenes=new Map(secondBank.illustrations.map(q=>[q.id,q]));
const row=m=>({bank_version:m.bankVersion,question_ids:m.questionIds,
 illustration_ids:m.illustrationIds,statement_orders:m.statementOrders});
function correctSnapshot(m){
 const refs=[...m.questionIds,...m.illustrationIds];
 return {version:1,type:'ordinary_second',engine:'license',index:94,refs,
  answers:[...m.questionIds.map(id=>texts.get(id).answer),
    ...m.illustrationIds.map(id=>scenes.get(id).statements.map(s=>s.answer))]};
}
test('bank original pool',()=>{
 assert.ok(secondBank.originalItems.length>=95);
 assert.ok(secondBank.illustrations.length>=10);
 assert.equal(new Set(secondBank.originalItems.map(q=>q.id)).size,secondBank.originalItems.length);
 assert.equal(new Set(secondBank.illustrations.map(q=>q.id)).size,secondBank.illustrations.length);
});
test('unique 90 text + five image questions, each three-order permutation',()=>{
 for(let i=0;i<30;i++){
  const m=readManifest(row(generateManifest()));
  const ids=[...m.questionIds,...m.illustrationIds];
  assert.equal(ids.length,95);assert.equal(new Set(ids).size,95);
  const byChapter={};for(const id of m.questionIds){
   const c=texts.get(id).chapter;byChapter[c]=(byChapter[c]||0)+1;
  }
  assert.deepEqual(byChapter,{'1':13,'4':6,'5':30,'6':9,'7':8,'9':20,'10':3,'11':1});
  m.statementOrders.forEach(x=>assert.equal(new Set(x).size,3));
 }
});
test('manifest does not expose answers or explanations',()=>{
 const m=readManifest(row(generateManifest()));
 const publicData=JSON.stringify(publicQuestions(m));
 assert.doesNotMatch(publicData,/"answer"\s*:/);
 assert.doesNotMatch(publicData,/"explanationJP"\s*:/);
});
test('100, 90 and 89 exact score/pass boundaries',()=>{
 const m=readManifest(row(generateManifest()));
 const right=correctSnapshot(m);
 assert.equal(gradeSecond(right,m).score,100);
 assert.equal(gradeSecond(right,m).passed,true);
 for(let mistakes of [10,11]){
  const s=correctSnapshot(m);for(let i=0;i<mistakes;i++)s.answers[i]=!s.answers[i];
  const g=gradeSecond(s,m);
  assert.equal(g.score,100-mistakes);
  assert.equal(g.passed,mistakes===10);
 }
});
test('illustration earns two points iff all three statements correct',()=>{
 const m=readManifest(row(generateManifest()));
 const s=correctSnapshot(m);
 s.answers[90][0]=!s.answers[90][0];
 const g=gradeSecond(s,m);
 assert.equal(g.score,98);
 assert.equal(g.wrong.length,1);
 assert.equal(g.wrong[0].kind,'scene');
});
test('invalid/forged answers rejected',()=>{
 const m=readManifest(row(generateManifest())),a=correctSnapshot(m);
 a.refs[0]='FORGED';assert.throws(()=>validateSnapshot(a,m));
 a.refs[0]=m.questionIds[0];a.answers[90]=[true,true,'fake'];
 assert.throws(()=>gradeSecond(a,m));
});
test('manifest wrong order rejected',()=>{
 const m=readManifest(row(generateManifest()));
 const r=row(m);r.statement_orders[0]=[0,0,2];
 assert.throws(()=>readManifest(r));
});
test('published dist uses production page with no answer bank or QA page',()=>{
 const dist=resolve('dist');
 assert(existsSync(join(dist,'mock-exams.html')),'Run npm run build first');
 const file=join(dist,'mock-second-license.html');
 assert(existsSync(file));
 assert(!existsSync(join(dist,'mock-second-license-qa.html')));
 const html=readFileSync(file,'utf8');
 const raw=html.match(/<script type="application\/json" id="questionData">([\s\S]*?)<\/script>/)?.[1];
 assert(raw,'Public question data is missing');
 const b=JSON.parse(raw);
 assert.equal(b.type,'ordinary_second');
 assert(b.originalItems.every(q=>!Object.hasOwn(q,'answer')&&!Object.hasOwn(q,'explanationJP')));
 assert(b.illustrations.every(s=>s.statements.every(q=>!Object.hasOwn(q,'answer'))));
 assert(html.includes('yk-ordinary-second-online.js'));
 assert(html.includes('id="yk-mobile-nav"'));
 assert(html.includes('id="siteMenu"'));
 assert(!html.includes('QA PREVIEW / NOT PRODUCTION'));
 assert(readFileSync(join(dist,'mock-exams.html'),'utf8').includes('/mock-second-license.html'));
});
