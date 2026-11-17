/** STUDYING WITH YE KUN — v7.87.7 Grammar Curriculum Batch 02 (consolidated) (QA ONLY).
 * Append carefully authored grammar content to existing JLPT cards without changing
 * existing IDs, progress, bookmarks, auth, exams, payments or YKCR. Dist-only.
 * This is NOT full reference-index coverage. No incomplete/placeholder cards.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dist=resolve('dist');
const file={
  curriculum:join(dist,'assets/yk-grammar-v7877-additions.json'),
  furigana:join(dist,'assets/yk-grammar-v7877-furigana-map.json'),
  content:join(dist,'assets/jlpt-learning-v782-content.json'),
  extras:join(dist,'assets/yk88-grammar-details.json'),
  list:join(dist,'assets/yk-jlpt-learning-v782-page.js'),
  detail:join(dist,'assets/yk88-grammar-detail.js'),
  listHtml:join(dist,'study/jlpt-learning.html'),
  detailHtml:join(dist,'study/jlpt-grammar-detail.html'),
  css:join(dist,'assets/yk-grammar-v7877.css')
};
for(const [name,path] of Object.entries(file))assert(existsSync(path),`v7.87.7 missing ${name}: ${path}`);
const read=(p)=>readFileSync(p,'utf8');
const curriculum=JSON.parse(read(file.curriculum));
const readingMap=JSON.parse(read(file.furigana));
const content=JSON.parse(read(file.content));
const extras=JSON.parse(read(file.extras));
const levels=['N5','N4','N3','N2','N1'];
const count=(s,needle)=>s.split(needle).length-1;
const once=(s,old,next,label)=>{
  assert.equal(count(s,old),1,`v7.87.7 missing/duplicate anchor ${label}`);
  return s.replace(old,next);
};
assert.equal(curriculum.lessons.length,139,'v7.87.7 expected 139 original grammar additions (Batch 01 + 02)');
assert.equal(Object.keys(extras.items||{}).length,30,'Existing 30 grammar detail records must be present');
assert(!content.version?.includes('7877'),'Already patched grammar content; refusing duplicate migration');
const added={};
for(const lv of levels){
  assert.equal(content.levels?.[lv]?.grammar?.length,6,`${lv} existing original six cards changed`);
  assert.deepEqual(content.levels[lv].grammar.map((x,i)=>x.id),Array.from({length:6},(_,i)=>`${lv}-g-${i+1}`),`${lv} existing progress IDs changed`);
  const src=curriculum.lessons.filter(x=>x.level===lv);
  const expectedPerLevel={N5:34,N4:75,N3:10,N2:10,N1:10};
  assert.equal(src.length,expectedPerLevel[lv],`${lv} count mismatch`);
  const used=new Set(content.levels[lv].grammar.map(x=>x.title.replace(/[～〜]/g,'~').trim()));
  for(const [i,record] of src.entries()){
    const duplicate=record.title.replace(/[～〜]/g,'~').trim();
    assert(!used.has(duplicate),`${lv} duplicate grammar ${record.title}`);used.add(duplicate);
    const id=`${lv}-g-${i+7}`;
    assert(!(id in extras.items),`${id} cannot overwrite existing lesson`);
    assert(record.formation&&record.explanationJa&&record.explanationMy&&record.explanationEn,`${id} incomplete explanations`);
    assert(Array.isArray(record.examples)&&record.examples.length===3,`${id} requires exactly three examples`);
    for(const ex of record.examples){
      assert((ex.length===3||ex.length===4)&&ex[0]&&ex[1]&&ex[2],`${id} incomplete example translation`);
      assert(ex[0].includes(ex[3]||record.focus),`${id} grammar focus not found in Japanese example`);
    }
    const [first,...rest]=record.examples;
    content.levels[lv].grammar.push({id,title:record.title,meaning:record.explanationMy,example:first[0],exampleMy:first[1],note:record.formation});
    extras.items[id]={formation:record.formation,explanationJa:record.explanationJa,
      explanationMy:record.explanationMy,explanationEn:record.explanationEn,
      originalEnglish:first[2],originalFocus:first[3]||record.focus,
      more:rest.map(e=>({ja:e[0],my:e[1],en:e[2],focus:e[3]||record.focus}))};
  }
  added[lv]=src.length;
}
assert(Object.keys(extras.items).length===169,'Expected 30 preserved plus 139 new grammar explanations');
content.version='7.87.7-qa-curriculum-batch02';
extras.version='7.87.7-qa-curriculum-batch02';
extras.draftStatus='original-content-editorial-review-not-full-reference-coverage';
let lesson=read(file.list),detail=read(file.detail),study=read(file.listHtml),detailHtml=read(file.detailHtml);
lesson=once(lesson,"fetch('/assets/jlpt-learning-v782-content.json'","fetch('/assets/jlpt-learning-v782-content.json?v=7877batch02'",'learning content URL');
detail=once(detail,"fetch('/assets/jlpt-learning-v782-content.json')","fetch('/assets/jlpt-learning-v782-content.json?v=7877batch02')",'detail grammar content URL');
detail=once(detail,"fetch('/assets/yk88-grammar-details.json')","fetch('/assets/yk88-grammar-details.json?v=7877batch02')",'detail descriptions URL');
const escapedReadingMap=JSON.stringify(Object.entries(readingMap).sort((a,b)=>b[0].length-a[0].length));
const renderer=`
  // v7.87.7: Manual reading dictionary; no guess-based readings or external API.
  const YK7877_READINGS=${escapedReadingMap};
  function markSentenceWithRuby(e){
    const source=String(e.ja||''), focus=String(e.focus||'');
    function render(text){
      let html='',i=0;
      while(i<text.length){
        const found=YK7877_READINGS.find(([base])=>text.startsWith(base,i));
        if(found){html+='<ruby>'+safe(found[0])+'<rt>'+safe(found[1])+'</rt></ruby>';i+=found[0].length;}
        else{html+=safe(text[i]);i++;}
      }
      return html;
    }
    const p=focus?source.indexOf(focus):-1;
    return p<0?render(source):render(source.slice(0,p))+'<mark class="yk88-pattern-mark">'+render(focus)+'</mark>'+render(source.slice(p+focus.length));
  }
  function initFurigana(){
    const btn=root.querySelector('#yk7877Furigana');if(!btn)return;
    const key='yk_jlpt_furigana_v7877_'+level;
    let setting=level==='N5'||level==='N4'||level==='N3'?'on':'off';
    try{const saved=localStorage.getItem(key);if(saved==='on'||saved==='off')setting=saved;}catch{}
    function apply(){root.dataset.furigana=setting;btn.textContent=setting==='on'?'ふりがな ON':'ふりがな OFF';btn.setAttribute('aria-pressed',String(setting==='on'));}
    btn.addEventListener('click',()=>{setting=setting==='on'?'off':'on';try{localStorage.setItem(key,setting)}catch{}apply();});
    apply();
  }
`;
detail=once(detail,'  const error = message =>',renderer+'\n  const error = message =>','detail reading function');
detail=once(detail,'<h2 id="yk88ExplainTitle">Grammar Pattern · 文型</h2>',
  '<div class="yk7877-detail-head"><h2 id="yk88ExplainTitle">Grammar Pattern · 文型</h2><button type="button" id="yk7877Furigana" class="yk7877-furigana" aria-pressed="false">ふりがな</button></div>', 'detail existing heading');
detail=once(detail,'<p class="yk88-formation" lang="ja">${safe(more.formation)}</p>',
  '<p class="yk88-formation" lang="ja">${safe(more.formation)}</p>${more.explanationJa?`<p lang="ja" class="yk7877-explain-ja">${safe(more.explanationJa)}</p>`:""}', 'Japanese grammar explanation');
detail=once(detail,'${markSentence(e.ja,e.focus)}','${markSentenceWithRuby(e)}','Japanese sentence highlight');
detail=once(detail,'      await state.init();','      initFurigana();\n      await state.init();','furigana switch init');
// Reversion-safe cache keys: older public CSS/JS are SW cached by URL.
const cacheScript=(html,path,key)=>{
  const re=new RegExp('src="'+path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:\\?[^\"]*)?"','g');
  const hits=[...html.matchAll(re)]; assert.equal(hits.length,1,`Expected exactly one ${path} script`);
  return html.replace(re,`src="${path}?v=${key}"`);
};
study=cacheScript(study,'/assets/yk-jlpt-learning-v782-page.js','7877batch02');
detailHtml=cacheScript(detailHtml,'/assets/yk88-grammar-detail.js','7877batch02');
detailHtml=once(detailHtml,'</head>',
  '<link rel="stylesheet" href="/assets/yk-grammar-v7877.css?v=7877batch02">\n</head>','grammar detail CSS');
// Atomic best effort: every assertion and pure transform precedes any dist writes.
const out={
 [file.content]:JSON.stringify(content,null,2)+'\n',
 [file.extras]:JSON.stringify(extras,null,2)+'\n',
 [file.list]:lesson,[file.detail]:detail,[file.listHtml]:study,[file.detailHtml]:detailHtml
};
for(const [path,value] of Object.entries(out))writeFileSync(path,value,'utf8');
console.log('PASS v7.87.7 QA Curriculum',JSON.stringify({added,existingPreserved:30,newTotal:169,authoredExamples:417,sourceUIChanged:false,protectedBackendChanged:false}));
