/** STUDYING WITH YE KUN — Grammar reference-inventory completion, v7.87.8 QA only.
 * Runs after the v7.87.7 consolidated stage, on dist/ only.
 * No UI restructuring, no database, no auth/payment/exam/YKCR code or state migration.
 * Existing N1–N5 lesson IDs remain immutable to protect bookmark/learned progress.
 * Reference website used only as list of grammar topics: examples/descriptions are original drafts.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';

const root=resolve('dist');
const paths={
 completion:join(root,'assets/yk-grammar-v7878-completion.json'),
 coverage:join(root,'assets/yk-grammar-v7878-coverage-audit.json'),
 content:join(root,'assets/jlpt-learning-v782-content.json'),
 detail:join(root,'assets/yk88-grammar-details.json'),
 listJS:join(root,'assets/yk-jlpt-learning-v782-page.js'),
 detailJS:join(root,'assets/yk88-grammar-detail.js'),
 listPage:join(root,'study/jlpt-learning.html'),
 detailPage:join(root,'study/jlpt-grammar-detail.html')
};
for(const [key,p] of Object.entries(paths))assert(existsSync(p),`v7.87.8 missing ${key}: ${p}`);
const rd=p=>readFileSync(p,'utf8');
const source=JSON.parse(rd(paths.completion));
const audit=JSON.parse(rd(paths.coverage));
const curriculum=JSON.parse(rd(paths.content));
const details=JSON.parse(rd(paths.detail));
assert.equal(source.lessons.length,355,'Expected 355 newly authored N3/N2/N1 grammar lessons');
assert.equal(curriculum.version,'7.87.7-qa-curriculum-batch02','Base grammar must be exactly post Batch02');
assert.equal(details.version,'7.87.7-qa-curriculum-batch02','Base detail version changed');
assert.equal(Object.keys(details.items).length,169,'Baseline must contain 169 Grammar detail records');
assert(!curriculum.version.includes('complete'),'Refuse duplicate completion');
const before={N5:40,N4:81,N3:16,N2:16,N1:16};
const added={N5:0,N4:0,N3:121,N2:123,N1:111};
const after={N5:40,N4:81,N3:137,N2:139,N1:127};
const allLevels=['N5','N4','N3','N2','N1'];
const originalIDs={};
for(const level of allLevels){
 const list=curriculum.levels?.[level]?.grammar;
 assert(Array.isArray(list),`${level} missing original grammar`);
 assert.equal(list.length,before[level],`${level} post-Batch02 cards mismatch`);
 assert.deepEqual(list.map(x=>x.id),Array.from({length:before[level]},(_,i)=>`${level}-g-${i+1}`),`${level} ID sequence changed`);
 originalIDs[level]=list.map(x=>x.id);
}
const seenTitles={};
for(const level of allLevels)seenTitles[level]=new Set(curriculum.levels[level].grammar.map(x=>x.title.replace(/[～〜]/g,'~').replace(/\s+/g,'')));
for(const level of allLevels){
 const rows=source.lessons.filter(x=>x.level===level);
 assert.equal(rows.length,added[level],`${level} completion count changed`);
 for(const r of rows){
   assert(r.title&&r.formation&&r.explanationJa&&r.explanationMy&&r.explanationEn,`Missing JP/MM/EN description for ${r.title}`);
   const normalized=r.title.replace(/[～〜]/g,'~').replace(/\s+/g,'');
   assert(!seenTitles[level].has(normalized),`Duplicate existing grammar ${level} ${r.title}`);
   seenTitles[level].add(normalized);
   assert(Array.isArray(r.examples)&&r.examples.length===3,`Must have 3 examples for ${r.title}`);
   for(const ex of r.examples){
    assert(ex.length===4&&ex.every(x=>typeof x==='string'&&x.trim()),`Incomplete example for ${r.title}`);
    assert(ex[0].includes(ex[3]),`Highlighted Grammar token not in Japanese sentence: ${r.title}`);
   }
   const id=`${level}-g-${curriculum.levels[level].grammar.length+1}`;
   assert(!details.items[id],`${id} already exists`);
   const [first,...more]=r.examples;
   curriculum.levels[level].grammar.push({id,title:r.title,meaning:r.explanationMy,
      example:first[0],exampleMy:first[1],note:r.formation});
   details.items[id]={formation:r.formation,explanationJa:r.explanationJa,
     explanationMy:r.explanationMy,explanationEn:r.explanationEn,
     originalEnglish:first[2],originalFocus:first[3],
     more:more.map(e=>({ja:e[0],my:e[1],en:e[2],focus:e[3]}))};
 }
 assert.equal(curriculum.levels[level].grammar.length,after[level],`${level} generated count unexpected`);
 assert.deepEqual(curriculum.levels[level].grammar.slice(0,before[level]).map(x=>x.id),originalIDs[level],`${level} changed existing IDs`);
}
assert.equal(Object.keys(details.items).length,524,'Expected complete 524 cross-linked Grammar detail records');
for(const level of allLevels){
 const coverage=audit.levels?.[level];assert(coverage&&coverage.patterns.length===coverage.inventoryCount,`${level} missing reference audit`);
 assert(!coverage.patterns.some(x=>x.status==='NEEDS-MANUAL-REVIEW'),`${level} reference title coverage unresolved`);
}
const once=(s,old,next,label)=>{
 assert.equal(s.split(old).length-1,1,`Expected exactly one prior ${label}`);
 return s.replace(old,next);
};
let listJS=rd(paths.listJS),detailJS=rd(paths.detailJS),listPage=rd(paths.listPage),detailPage=rd(paths.detailPage);
const oldTag='7877batch02',newTag='7878grammarcomplete1';
for(const [k,value] of [['listJS',listJS],['detailJS',detailJS],['listPage',listPage],['detailPage',detailPage]]){
 assert(value.includes(oldTag),`Missing Batch02 cache version in ${k}`);
}
listJS=once(listJS,'/assets/jlpt-learning-v782-content.json?v='+oldTag,
 '/assets/jlpt-learning-v782-content.json?v='+newTag,'list JSON cache URL');
detailJS=once(detailJS,'/assets/jlpt-learning-v782-content.json?v='+oldTag,
 '/assets/jlpt-learning-v782-content.json?v='+newTag,'detail content cache URL');
detailJS=once(detailJS,'/assets/yk88-grammar-details.json?v='+oldTag,
 '/assets/yk88-grammar-details.json?v='+newTag,'detail extras cache URL');
listPage=once(listPage,'/assets/yk-jlpt-learning-v782-page.js?v='+oldTag,
 '/assets/yk-jlpt-learning-v782-page.js?v='+newTag,'list JS cache URL');
detailPage=once(detailPage,'/assets/yk88-grammar-detail.js?v='+oldTag,
 '/assets/yk88-grammar-detail.js?v='+newTag,'detail JS cache URL');
assert(detailJS.includes('markSentenceWithRuby(e)')&&detailJS.includes('initFurigana()'),
  'Furigana toggle or crimson underline renderer missing');
assert(listJS.includes('yk88-grammar-card'), 'Existing JLPT Grammar card render missing');
assert(detailJS.includes('toggleSaved(id)')&&detailJS.includes('markDone(id)'),
  'Existing bookmarked and learned actions missing');
curriculum.version='7.87.8-qa-reference-inventory-complete';
details.version='7.87.8-qa-reference-inventory-complete';
details.draftStatus='original-content-teacher-proofreading-required-before-publishing';
// All guards and transformations performed before writing.
const output={
 [paths.content]:JSON.stringify(curriculum,null,2)+'\n',
 [paths.detail]:JSON.stringify(details,null,2)+'\n',
 [paths.listJS]:listJS,
 [paths.detailJS]:detailJS,
 [paths.listPage]:listPage,
 [paths.detailPage]:detailPage
};
for(const [p,value] of Object.entries(output))writeFileSync(p,value,'utf8');
console.log('PASS v7.87.8 QA Grammar completion',JSON.stringify({prior:169,new:355,total:524,examplesNew:1065,after,sourceUiModified:false,storedIDsPreserved:169}));
