/** v7.87.9: targeted original-language repair + cautious Japanese ruby tests.
 * Local synthetic build stage only — no full repository nor actual user device.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,copyFileSync} from 'node:fs';
import os from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
const cwd=resolve('.');
const source=JSON.parse(readFileSync('assets/yk-grammar-v7878-completion.json','utf8'));
const previous=JSON.parse(readFileSync('assets/yk-grammar-v7877-additions.json','utf8'));
const edits=JSON.parse(readFileSync('assets/yk-grammar-v7879-editorial-corrections.json','utf8'));
const levels=['N5','N4','N3','N2','N1'];
const counts={N5:40,N4:81,N3:137,N2:139,N1:127};
const all={version:'7.87.8-qa-reference-inventory-complete',levels:{}};
const details={version:all.version,items:{}};
for(const lv of levels){
 all.levels[lv]={grammar:[]};
 for(let i=1;i<=6;i++){
  const id=`${lv}-g-${i}`;
  all.levels[lv].grammar.push({id,title:`LEGACY ${id}`,meaning:'မူလစာ',example:'これは本です。',exampleMy:'ဒါက စာအုပ်ပါ။',note:'名詞＋です'});
  details.items[id]={formation:'名詞＋です',explanationMy:'မူလစာ',explanationEn:'Original',originalEnglish:'This is a book.',originalFocus:'です',more:[{ja:'私は学生です。',my:'ကျောင်းသားပါ။',en:'I am a student.',focus:'です'},{ja:'先生です。',my:'ဆရာပါ။',en:'I am a teacher.',focus:'です'}]};
 }
 for(const r of [...previous.lessons,...source.lessons].filter(x=>x.level===lv)){
  const id=`${lv}-g-${all.levels[lv].grammar.length+1}`,[first,...rest]=r.examples;
  const focus=e=>e[3]||r.focus;
  all.levels[lv].grammar.push({id,title:r.title,meaning:r.explanationMy,example:first[0],exampleMy:first[1],note:r.formation});
  details.items[id]={formation:r.formation,explanationJa:r.explanationJa,explanationMy:r.explanationMy,explanationEn:r.explanationEn,originalEnglish:first[2],originalFocus:focus(first),more:rest.map(e=>({ja:e[0],my:e[1],en:e[2],focus:focus(e)}))};
 }
 assert.equal(all.levels[lv].grammar.length,counts[lv]);
}
const dir=mkdtempSync(join(os.tmpdir(),'yk-v7879-editorial-'));
const put=(relative,data)=>{const p=join(dir,relative);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,typeof data==='string'?data:JSON.stringify(data,null,2),'utf8')};
put('dist/assets/jlpt-learning-v782-content.json',all);
put('dist/assets/yk88-grammar-details.json',details);
put('dist/assets/yk-grammar-v7879-editorial-corrections.json',edits);
put('scripts/yk-v7879-ruby-renderer.fragment.js',readFileSync('scripts/yk-v7879-ruby-renderer.fragment.js','utf8'));
const old='7878grammarcomplete1';
const readings=Object.entries(JSON.parse(readFileSync('assets/yk-grammar-v7877-furigana-map.json','utf8'))).sort((a,b)=>b[0].length-a[0].length);
const testDetail=`const safe = x=>String(x);\nconst YK7877_READINGS=${JSON.stringify(readings)};\n  function markSentenceWithRuby(e){\n    const source=String(e.ja||''),focus=String(e.focus||'');\n    function render(text){let html='',i=0;while(i<text.length){const found=YK7877_READINGS.find(([base])=>text.startsWith(base,i));if(found){html+=found[0];i+=found[0].length;}else{html+=text[i];i++;}}return html;}\n    const p=focus?source.indexOf(focus):-1;return p<0?render(source):render(source.slice(0,p))+'<mark class="yk88-pattern-mark">'+render(focus)+'</mark>'+render(source.slice(p+focus.length));\n  }\n  function initFurigana(){\n  const btn={textContent:''};const setting='on';btn.textContent=setting==='on'?'ふりがな ON':'ふりがな OFF';\n  }\nfetch('/assets/jlpt-learning-v782-content.json?v=${old}');\nfetch('/assets/yk88-grammar-details.json?v=${old}');\n`;
put('dist/assets/yk88-grammar-detail.js',testDetail);
put('dist/assets/yk-jlpt-learning-v782-page.js',`fetch('/assets/jlpt-learning-v782-content.json?v=${old}');`);
put('dist/study/jlpt-grammar-detail.html',`<script src="/assets/yk88-grammar-detail.js?v=${old}"></script>`);
put('dist/study/jlpt-learning.html',`<script src="/assets/yk-jlpt-learning-v782-page.js?v=${old}"></script>`);
copyFileSync('scripts/build-v7879-grammar-editorial-qa.mjs',join(dir,'scripts/build-v7879-grammar-editorial-qa.mjs'));
const run=()=>spawnSync('node',['scripts/build-v7879-grammar-editorial-qa.mjs'],{cwd:dir,encoding:'utf8'});
const r=run();assert.equal(r.status,0,r.stdout+'\n'+r.stderr);assert.match(r.stdout,/PASS v7\.87\.9/);
const twice=run();assert.notEqual(twice.status,0,'Duplicate patch must be rejected');
const content=JSON.parse(readFileSync(join(dir,'dist/assets/jlpt-learning-v782-content.json'),'utf8'));
const extras=JSON.parse(readFileSync(join(dir,'dist/assets/yk88-grammar-details.json'),'utf8'));
assert.equal(Object.keys(extras.items).length,524);
assert.equal(Object.keys(extras.items).filter(id=>!!extras.items[id].explanationJa).length,524,'Every lesson gets Japanese explanation');
for(const lv of levels)for(const it of content.levels[lv].grammar){
 const more=extras.items[it.id];const examples=[{ja:it.example,my:it.exampleMy,en:more.originalEnglish,focus:more.originalFocus},...more.more];
 assert.equal(examples.length,3);for(const ex of examples)assert(ex.ja.includes(ex.focus)&&ex.my&&ex.en,`Broken ${it.id}`);
}
let t=content.levels.N3.grammar.find(x=>x.title==='〜て済む');
assert(t&&t.example.includes('謝って済む'), 'The N3 primary example was not repaired');
assert(extras.items[t.id].formation.includes('N＋で済む'),'Related source variants lost');
const browserJS=readFileSync(join(dir,'dist/assets/yk88-grammar-detail.js'),'utf8');
assert(browserJS.includes('yk7879ResolveReading')&&browserJS.includes('7879editorialqa1'));
const fragment=readFileSync('scripts/yk-v7879-ruby-renderer.fragment.js','utf8');
const sandbox={};
vm.runInNewContext(`const YK7877_READINGS=${JSON.stringify(readings)};\nconst safe=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;');\n${fragment}\nthis.render=markSentenceWithRuby;`,sandbox);
const cases=[
 ['あと十分だけ待ってください。','十分','<rt>じっぷん</rt>'],
 ['バスは十分おきに来ます。','十分','<rt>じっぷん</rt>'],
 ['二十分も歩きました。','二十分','<rt>にじゅっぷん</rt>'],
 ['試験前には十分に寝るべきです。','十分','<rt>じゅうぶん</rt>'],
 ['会議を行う。','行う','<rt>おこな</rt>'],
 ['日本へ行く。','行く','<rt>い</rt>'],
 ['結果を出します。','出します','<rt>だ</rt>'],
 ['学校から出かける。','出かける','<rt>で</rt>'],
 ['彼は大人です。','大人','<rt>おとな</rt>'],
 ['彼はよく話す。','話す','<rt>はな</rt>'],
 ['その話を聞きました。','話を','<rt>はなし</rt>'],
 ['今年は忙しかった。','今年','<rt>ことし</rt>'],
 ['彼は変な味だと言った。','変な','<rt>へん</rt>'],
 ['売り上げが上がる。','上がる','<rt>あ</rt>'],
 ['ここに来たのは一人です。','一人','<rt>ひとり</rt>']
];
for(const [ja,focus,rt] of cases){
 const out=sandbox.render({ja,focus});assert(out.includes(rt),`${ja}: missing ${rt} -> ${out}`);
 assert(out.includes('yk88-pattern-mark'),`${ja}: missing grammar underline`);
}
// Do not mispronounce single kanji inside an unlisted compound.
const safeCompound=sandbox.render({ja:'今年の行事は大変です。',focus:'行事'});
assert(!safeCompound.includes('今<rt>いま</rt>年')&&!safeCompound.includes('行<rt>い</rt>事'),safeCompound);
console.log('PASS v7.87.9 targeted editorial QA',JSON.stringify({cards:524,examples:1572,japaneseExplanations:524,lessonCorrections:6,furiganaCases:cases.length,duplicateRejected:true,fixtureNotProduction:true}));
