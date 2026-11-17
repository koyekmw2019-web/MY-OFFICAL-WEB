/** v7.87.9 target-specific language audit repairs and cautious furigana (QA ONLY).
 * Runs after v7.87.8 completion. No card redesign, ID changes, progress migration,
 * database, admin/auth, payment, exam or YKCR writes.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve('dist');
const files={
  fixes:join(root,'assets/yk-grammar-v7879-editorial-corrections.json'),
  content:join(root,'assets/jlpt-learning-v782-content.json'),
  details:join(root,'assets/yk88-grammar-details.json'),
  detailJS:join(root,'assets/yk88-grammar-detail.js'),
  studyJS:join(root,'assets/yk-jlpt-learning-v782-page.js'),
  detailHTML:join(root,'study/jlpt-grammar-detail.html'),
  studyHTML:join(root,'study/jlpt-learning.html'),
  renderer:resolve('scripts/yk-v7879-ruby-renderer.fragment.js')
};
for(const [key,path] of Object.entries(files))assert(existsSync(path),`Missing v7.87.9 ${key}: ${path}`);
const rd=p=>readFileSync(p,'utf8');
const fixed=JSON.parse(rd(files.fixes));
const content=JSON.parse(rd(files.content));
const extra=JSON.parse(rd(files.details));
assert.equal(content.version,'7.87.8-qa-reference-inventory-complete','v7.87.8 built data required');
assert.equal(extra.version,content.version,'v7.87.8 explanation data required');
assert.equal(fixed.version,'7.87.9-qa-editorial-revision','Correct correction set required');
assert.equal(Object.keys(extra.items||{}).length,524,'Cannot alter incomplete grammar data');
const counts={N5:40,N4:81,N3:137,N2:139,N1:127};
for(const [lv,n] of Object.entries(counts))assert.equal(content.levels?.[lv]?.grammar?.length,n,`${lv} count changed`);
assert.equal(Object.keys(fixed.original30JapaneseExplanations).length,30);
let originals=0;
for(const [id,explanationJa] of Object.entries(fixed.original30JapaneseExplanations)){
  assert(/^N[1-5]-g-[1-6]$/.test(id),`Not an original lesson: ${id}`);
  assert(extra.items[id]&&!extra.items[id].explanationJa,`Original explanation already populated or missing: ${id}`);
  assert(typeof explanationJa==='string'&&explanationJa.length>15,`Unclear Japanese explanation ${id}`);
  extra.items[id].explanationJa=explanationJa;
  originals++;
}
let repairs=0;
for(const c of fixed.lessonCorrections){
  assert(/N[1-5]/.test(c.level)&&c.title&&c.fields,`Bad correction metadata`);
  const hits=content.levels[c.level].grammar.filter(x=>x.title===c.title);
  assert.equal(hits.length,1,`Ambiguous or missing lesson: ${c.level} ${c.title}`);
  const target=hits[0],more=extra.items[target.id];
  assert(more&&target.id.match(/-g-\d+$/),`Missing detail for correction ${target.id}`);
  const v=c.fields;
  for(const key of ['explanationJa','explanationMy','explanationEn','formation']){
    if(v[key]!==undefined){
      assert(typeof v[key]==='string'&&v[key].trim(),`Empty correction ${target.id}.${key}`);
      more[key]=v[key];
      if(key==='explanationMy')target.meaning=v[key];
      if(key==='formation')target.note=v[key];
    }
  }
  if(v.examples){
    assert(Array.isArray(v.examples)&&v.examples.length===3,`Exactly three examples for ${target.id}`);
    for(const example of v.examples){
      assert(example.length===4&&example.every(s=>typeof s==='string'&&s.trim())&&example[0].includes(example[3]),
        `Invalid example for ${target.id}`);
    }
    const [first,...rest]=v.examples;
    target.example=first[0]; target.exampleMy=first[1];
    more.originalEnglish=first[2]; more.originalFocus=first[3];
    more.more=rest.map(e=>({ja:e[0],my:e[1],en:e[2],focus:e[3]}));
  }
  repairs++;
}
assert.equal(originals,30);assert.equal(repairs,6);
const old='7878grammarcomplete1',next='7879editorialqa1';
const once=(text,prior,update,key)=>{
 assert.equal(text.split(prior).length-1,1,`Expected one ${key}`);
 return text.replace(prior,update);
};
let detailJS=rd(files.detailJS),studyJS=rd(files.studyJS),detailHTML=rd(files.detailHTML),studyHTML=rd(files.studyHTML);
const oldStart='  function markSentenceWithRuby(e){';
const oldEnd='  function initFurigana(){';
const i=detailJS.indexOf(oldStart),j=detailJS.indexOf(oldEnd,i);
assert(i>=0&&j>i&&detailJS.slice(i,j).includes('YK7877_READINGS'), 'Expected v7.87.7 Ruby matcher');
const renderer=rd(files.renderer);
assert(renderer.includes('function markSentenceWithRuby(e)')&&renderer.includes('yk7879ResolveReading'),'Renderer incomplete');
detailJS=detailJS.slice(0,i)+renderer+'\n'+detailJS.slice(j);
// Do not call it full furigana: conservative reading map intentionally skips ambiguous words.
detailJS=once(detailJS,"btn.textContent=setting==='on'?'ふりがな ON':'ふりがな OFF';",
 "btn.textContent=setting==='on'?'ふりがな ON':'ふりがな OFF';btn.title='読み方を確認できる漢字だけに表示します。';",
 'furigana tooltip');
studyJS=once(studyJS,`/assets/jlpt-learning-v782-content.json?v=${old}`,
 `/assets/jlpt-learning-v782-content.json?v=${next}`,'list JSON cache');
detailJS=once(detailJS,`/assets/jlpt-learning-v782-content.json?v=${old}`,
 `/assets/jlpt-learning-v782-content.json?v=${next}`,'detail JSON content cache');
detailJS=once(detailJS,`/assets/yk88-grammar-details.json?v=${old}`,
 `/assets/yk88-grammar-details.json?v=${next}`,'detail JSON extras cache');
studyHTML=once(studyHTML,`/assets/yk-jlpt-learning-v782-page.js?v=${old}`,
 `/assets/yk-jlpt-learning-v782-page.js?v=${next}`,'study JS cache');
detailHTML=once(detailHTML,`/assets/yk88-grammar-detail.js?v=${old}`,
 `/assets/yk88-grammar-detail.js?v=${next}`,'detail JS cache');
extra.editorialQAVersion=fixed.version;
extra.editorialStatus='targeted-repairs-only-not-full-teacher-approved';
// Preflight complete; no files modified until all checks have passed.
for(const [path,contents] of Object.entries({
 [files.content]:JSON.stringify(content,null,2)+'\n',
 [files.details]:JSON.stringify(extra,null,2)+'\n',
 [files.detailJS]:detailJS,
 [files.studyJS]:studyJS,
 [files.detailHTML]:detailHTML,
 [files.studyHTML]:studyHTML
}))writeFileSync(path,contents,'utf8');
console.log('PASS v7.87.9 editorial QA correction stage',JSON.stringify({cards:524,originalJapaneseExplanations:30,lessonRepairs:6,renderer:'conservative',bookmarkIdsPreserved:true}));
