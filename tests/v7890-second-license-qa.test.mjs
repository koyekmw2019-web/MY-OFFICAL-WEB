/** QA-only source checks; no production data, API, or hosted writes. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('qa/second-license-exam-qa.html','utf8');
const builder=readFileSync('scripts/build-v7890-second-license-qa.mjs','utf8');
assert(source.includes('id="questionData"'));
const raw=source.match(/<script type="application\/json" id="questionData">([\s\S]*?)<\/script>/);
assert(raw,'QA bank missing');
const bank=JSON.parse(raw[1]);
assert.equal(bank.originalItems.length,102);
assert.equal(bank.illustrations.length,10);
const textIds=new Set(bank.originalItems.map(x=>x.id));
const sceneIds=new Set(bank.illustrations.map(x=>x.id));
assert.equal(textIds.size,102);
assert.equal(sceneIds.size,10);
for(const item of bank.originalItems){
  assert(item.jp?.trim() && item.mm?.trim() && item.explanationJP?.trim() && item.explanationMM?.trim());
  assert(typeof item.answer==='boolean');
}
for(const s of bank.illustrations){
  assert.equal(s.statements.length,3);
  for(const part of s.statements){
    assert(part.jp?.trim() && part.mm?.trim() && part.explanationJP?.trim() && part.explanationMM?.trim());
    assert(typeof part.answer==='boolean');
  }
}
assert.equal(90+5,95);
assert.equal(90*1+5*2,100);
assert.equal(90+4*2,98);
assert(builder.includes('existingCards, 12'));
assert(builder.includes('href="/mock-second-license-qa.html"'));
assert(builder.includes('yk-second-type-qa-card'));
assert(!builder.includes('exam-access.mts'));
assert(!/netlify\/functions\/|\.netlify\/functions\/|(?:await\s+|=\s*)fetch\s*\(/.test(source),'QA prototype must not call production APIs');
console.log(JSON.stringify({test:'v7890-second-license-source',status:'PASS',originalText:102,originalIllustrations:10,format:'90 × 1pt + 5 × 2pt',backendChanges:false}));

// Exercise the same generator and scorer called by the page controls.
const {runInNewContext} = await import('node:vm');
const engine = source.split('// BEGIN: Ordinary Second Type')[1];
const definitions = engine.slice(engine.indexOf('const bank'), engine.indexOf("$('#startSecond').onclick"));
const context = {document:{getElementById:()=>({textContent:raw[1]})}};
runInNewContext(definitions, context);
const sample = () => Array.from(runInNewContext('makeExam()', context));
const first = sample();
assert.equal(first.length, 95);
assert.equal(new Set(first).size, 95);
assert.notDeepEqual(sample(), first);
for (const expected of [100, 98, 90, 89]) {
  context.expected = expected;
  const actual = runInNewContext(`
    state={questions:makeExam()};
    state.answers=state.questions.map((id,i)=>{
      if(i<90){
        const key=mapText.get(id).answer;
        return expected!==98 && i<100-expected ? !key : key;
      }
      return mapScenes.get(id).statements.map((item,j)=>
        expected===98 && i===90 && j===0 ? !item.answer : item.answer);
    });
    scoreExam().score;`, context);
  assert.equal(actual, expected);
}
console.log('PASS second-license generator and scoring boundaries');

// Verify readings cover the actual bank, including explanations in wrong-answer review.
const prompts = [
  ...bank.originalItems.flatMap(q => [q.jp, q.explanationJP]),
  ...bank.illustrations.flatMap(q => [q.title, ...q.statements.flatMap(s => [s.jp, s.explanationJP])])
];
for (const prompt of prompts) {
  context.prompt = prompt;
  const markup = runInNewContext('fmt(prompt)', context);
  const ruby = /<ruby>([^<]+)<rt>([ぁ-ゖー]+)<\/rt><\/ruby>/g;
  assert(!/[一-龯々]/u.test(markup.replace(ruby, '')), 'Missing reading in '+prompt);
  assert.equal(markup.replace(ruby, '$1'), prompt);
}
for (const [word, reading] of Object.entries({
  '白杖':'はくじょう', '右左折':'うさせつ', '横風':'よこかぜ', '雪道':'ゆきみち',
  '急い':'いそい', '急':'きゅう', '飛び出し':'とびだし', '雨の降り始め':'あめのふりはじめ'
})) {
  context.prompt = word;
  assert.equal(runInNewContext('fmt(prompt)', context), '<ruby>'+word+'<rt>'+reading+'</rt></ruby>');
}
console.log('PASS ruby text round-trip and coverage for '+prompts.length+' Japanese fields');
