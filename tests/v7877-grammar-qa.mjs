/** STUDYING WITH YE KUN — Backward compatible QA for Batch02 and completed v7.87.8. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve('dist'),read=x=>readFileSync(join(root,x),'utf8');
const data=JSON.parse(read('assets/jlpt-learning-v782-content.json'));
const details=JSON.parse(read('assets/yk88-grammar-details.json'));
const first=JSON.parse(read('assets/yk-grammar-v7877-additions.json'));
const complete=data.version==='7.87.8-qa-reference-inventory-complete';
const expected=complete?{N5:40,N4:81,N3:137,N2:139,N1:127}:{N5:40,N4:81,N3:16,N2:16,N1:16};
const cache=complete?(details.editorialQAVersion?'7879editorialqa1':'7878grammarcomplete1'):'7877batch02';
let count=0;
for(const [lv,n] of Object.entries(expected)){
 const items=data.levels[lv]?.grammar;assert.equal(items?.length,n,`${lv} count`);
 assert.deepEqual(items.map(x=>x.id),Array.from({length:n},(_,i)=>`${lv}-g-${i+1}`),`${lv} IDs`);
 for(const item of items)assert(details.items[item.id],`${item.id} detail missing`);
 count+=n;
}
assert.equal(first.lessons.length,139);
for(const rec of first.lessons){
 assert(rec.explanationJa&&rec.explanationMy&&rec.explanationEn,`Missing explanations ${rec.title}`);
 assert.equal(rec.examples.length,3);
 for(const ex of rec.examples)assert(ex[0].includes(ex[3]||rec.focus),`Missing highlight ${rec.title}`);
}
assert.equal(Object.keys(details.items).length,count);
const s=read('assets/yk88-grammar-detail.js');
for(const marker of ['markSentenceWithRuby(e)','initFurigana()','toggleSaved(id)','markDone(id)'])assert(s.includes(marker),marker);
assert(read('study/jlpt-grammar-detail.html').includes(`yk88-grammar-detail.js?v=${cache}`));
assert(read('assets/yk-jlpt-learning-v782-page.js').includes(`jlpt-learning-v782-content.json?v=${cache}`));
console.log(`PASS v7.87.7+ QA ${complete?'completed':'batch02'}`,JSON.stringify({count,originalIDsPreserved:true,batch02Added:139}));
