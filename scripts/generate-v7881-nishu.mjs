/** Original private editorial bank -> separated public question text and private scoring key.
 * No book text is copied. This script operates in source checkout, never in dist. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
const source=JSON.parse(readFileSync('scripts/nishu-author-bank-v7881.json','utf8'));
assert.equal(source.text.length,90);
assert.equal(source.visual.length,5);
assert.equal(Object.values(source.distribution).reduce((a,b)=>a+b,0),90);
const tally={};const ids=new Set();
for(const q of source.text){
 assert(/^N2S-T\d{3}$/.test(q.id)&&!ids.has(q.id));ids.add(q.id);
 assert(typeof q.answer==='boolean'&&q.jp.length>=13&&q.my.length>=10&&q.reasonJa.length>=10);
 tally[q.section]=(tally[q.section]||0)+1;
}
for(const [k,n] of Object.entries(source.distribution))assert.equal(tally[k],n,k);
for(const s of source.visual){
 assert(/^N2S-V\d{2}$/.test(s.id)&&!ids.has(s.id));ids.add(s.id);
 assert.equal(s.questions.length,3);
 for(const q of s.questions)assert(typeof q.answer==='boolean'&&q.jp.length>12&&q.my.length>=10);
}
const publicBank={version:source.version,type:'nishu',notice:'Original mock questions, NOT official examination questions',
  durationMinutes:50,maxScore:100,passScore:90,
  composition:{text:90,illustrations:5,subitemsPerIllustration:3,pointsPerIllustration:2},distribution:source.distribution,
  text:source.text.map(({id,section,jp,my})=>({id,section,jp,my})),
  visual:source.visual.map(({id,scene,section,jp,my,questions})=>({id,scene,section,jp,my,image:`/assets/yk-v7881-scene-${scene}.svg`,questions:questions.map(({jp,my})=>({jp,my}))}))};
const key={text:Object.fromEntries(source.text.map(x=>[x.id,{a:x.answer,reasonJa:x.reasonJa}])),
  visual:Object.fromEntries(source.visual.map(x=>[x.id,{a:x.questions.map(y=>y.answer),reasonJa:x.questions.map(y=>y.reasonJa)}]))};
const put=(p,s)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,s)};
put('assets/yk-v7881-nishu-questions.json',JSON.stringify(publicBank,null,2)+'\n');
put('netlify/functions/_shared/nishu-key-v7881.mts','/* Original 2026 independent practice answer key. SERVER-ONLY. Never publish in dist/assets. */\nexport const nishuAnswers = '+JSON.stringify(key,null,2)+' as const;\n');
console.log(`PASS original nishu bank: 90 unique text + 5 illustrated triplets; official-style 100-point distribution; private/public split`);
