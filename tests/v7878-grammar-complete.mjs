/** STUDYING WITH YE KUN — v7.87.8 Grammar completion integration QA. Run after full `npm run build`. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dist=resolve('dist');
const read=p=>readFileSync(join(dist,p),'utf8');
const data=JSON.parse(read('assets/jlpt-learning-v782-content.json'));
const extras=JSON.parse(read('assets/yk88-grammar-details.json'));
const delta=JSON.parse(read('assets/yk-grammar-v7878-completion.json'));
const previous=JSON.parse(read('assets/yk-grammar-v7877-additions.json'));
const audit=JSON.parse(read('assets/yk-grammar-v7878-coverage-audit.json'));
const counts={N5:40,N4:81,N3:137,N2:139,N1:127};
assert.equal(data.version,'7.87.8-qa-reference-inventory-complete');
assert.equal(extras.version,data.version);
assert.equal(delta.lessons.length,355);
assert.equal(previous.lessons.length,139);
assert.equal(Object.keys(extras.items).length,524);
const ids=new Set(),countByLevel={};
for(const [lv,n] of Object.entries(counts)){
 const items=data.levels[lv]?.grammar;
 assert.equal(items?.length,n,`${lv} curriculum count`);
 assert.deepEqual(items.map(x=>x.id),Array.from({length:n},(_,i)=>`${lv}-g-${i+1}`),`${lv} lesson IDs consecutive`);
 const titles=new Set();
 for(const item of items){
  assert(!ids.has(item.id),`${item.id} duplicate global ID`);ids.add(item.id);
  assert(item.title&&item.meaning&&item.example&&item.exampleMy,`${item.id} incomplete lesson`);
  const title=item.title.replace(/[～〜]/g,'~').replace(/\s+/g,'');
  assert(!titles.has(title),`${lv} duplicate title: ${item.title}`);titles.add(title);
  const x=extras.items[item.id];assert(x,`${item.id} detail missing`);
  assert(x.formation&&x.explanationMy&&x.explanationEn,`${item.id} detail explanation missing`);
  if(+item.id.split('-')[2]>6)assert(x.explanationJa,`${item.id} Japanese explanation missing`);
  const examples=[{ja:item.example,my:item.exampleMy,en:x.originalEnglish,focus:x.originalFocus},...(x.more||[])];
  assert.equal(examples.length,3,`${item.id} example count`);
  for(const ex of examples){
   assert(ex.ja&&ex.my&&ex.en&&ex.focus,`${item.id} trilingual example incomplete`);
   assert(ex.ja.includes(ex.focus),`${item.id} highlight not present in Japanese source`);
  }
 }
 countByLevel[lv]=items.length;
}
for(const lv of ['N5','N4','N3','N2','N1']){
 const cover=audit.levels[lv];
 assert(cover&&cover.patterns.length===cover.inventoryCount,`${lv} coverage index corrupted`);
 assert(!cover.patterns.some(x=>x.status==='NEEDS-MANUAL-REVIEW'),`${lv} unmapped inventory topic`);
}
const detailJS=read('assets/yk88-grammar-detail.js');
const studyJS=read('assets/yk-jlpt-learning-v782-page.js');
const detailHTML=read('study/jlpt-grammar-detail.html');
const studyHTML=read('study/jlpt-learning.html');
const currentCache=extras.editorialQAVersion==='7.88.0-rc1-targeted-corrections'?'7880rc1audited':(extras.editorialQAVersion?'7879editorialqa1':'7878grammarcomplete1');
for(const s of [detailJS,studyJS,detailHTML,studyHTML])assert(s.includes(currentCache),'Stale cache URL: URL update missing');
if(extras.editorialQAVersion)assert(Object.values(extras.items).every(x=>x.explanationJa),'Every grammar must have Japanese explanation');
for(const token of ['markSentenceWithRuby(e)','initFurigana()','toggleSaved(id)','markDone(id)','yk88-pattern-mark','yk7877Furigana'])assert(detailJS.includes(token),'UI behavior missing '+token);
assert(studyHTML.includes('id="yk82Tabs"'),'Existing JLPT tab bar removed');
assert(studyHTML.includes('yk82Content'),'Existing JLPT content region removed');
assert(detailHTML.includes('yk88GrammarDetail'),'Existing grammar detail page replaced');
console.log('PASS v7.87.8 QA Grammar',JSON.stringify({counts:countByLevel,total:ids.size,previous139:previous.lessons.length,new355:delta.lessons.length,examples:ids.size*3,referenceInventoryMapped:true,idsPreserved:true,grammarUiUnchanged:true}));
