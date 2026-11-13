import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {scoreNishuSnapshot} from '../netlify/functions/_shared/nishu-scoring-v7881.mjs';
import {nishuAnswers} from '../netlify/functions/_shared/nishu-key-v7881.mts';
const bank=JSON.parse(readFileSync('assets/yk-v7881-nishu-questions.json','utf8'));
const ordinary=bank.text.map(x=>x.id),visual=bank.visual.map(x=>x.id);
const canonical={version:1,engine:'nishu',type:'nishu',phase:0,index:94,refs:[...ordinary,...visual],answers:[...ordinary.map(id=>nishuAnswers.text[id].a),...visual.map(id=>[...nishuAnswers.visual[id].a])]};
const grade=x=>scoreNishuSnapshot(structuredClone(x));
assert.deepEqual([bank.text.length,bank.visual.length,bank.visual.reduce((s,x)=>s+x.questions.length,0)],[90,5,15]);
assert.equal(grade(canonical).score,100);assert.equal(grade(canonical).passed,true);assert.equal(grade(canonical).count,95);
const allNull={...canonical,answers:[...ordinary.map(()=>null),...visual.map(()=>[null,null,null])]};assert.equal(grade(allNull).score,0);
const partial=structuredClone(canonical);partial.answers[90][0]=!partial.answers[90][0];assert.equal(grade(partial).score,98,'partial illustration must score 0/2');
const exactly90=structuredClone(canonical);exactly90.answers.slice(0,10).forEach((_,i)=>exactly90.answers[i]=null);assert.equal(grade(exactly90).score,90);assert.equal(grade(exactly90).passed,true);
const below=structuredClone(exactly90);below.answers[10]=null;assert.equal(grade(below).score,89);assert.equal(grade(below).passed,false);
for(const change of [x=>x.refs[0]=x.refs[1],x=>x.refs[90]=x.refs[0],x=>x.answers[90]=[true],x=>x.answers[0]='false',x=>x.type='car',x=>x.index=95]){
 let x=structuredClone(canonical);change(x);assert.throws(()=>grade(x));
}
for(const q of bank.text){assert(!Object.hasOwn(q,'answer')&&!Object.hasOwn(q,'reasonJa'));}
for(const q of bank.visual)for(const sub of q.questions)assert(!Object.hasOwn(sub,'answer')&&!Object.hasOwn(sub,'reasonJa'));
console.log('PASS 12 private nishu scoring checks: 90+5 composition, 2-point all-three, 90/100 pass, tamper rejection, public key separation');
