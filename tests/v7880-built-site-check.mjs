/** Run AFTER full repository npm run build on QA branch.
 * Automated structural test only; not a substitute for language review or mobile E2E.
 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve('dist');
const files={
 content:'assets/jlpt-learning-v782-content.json',details:'assets/yk88-grammar-details.json',
 list:'assets/yk-jlpt-learning-v782-page.js',detail:'assets/yk88-grammar-detail.js',
 client:'assets/yk-jlpt-learning-v782-state.js',studyHTML:'study/jlpt-learning.html',detailHTML:'study/jlpt-grammar-detail.html'
};
const read={};for(const [key,f] of Object.entries(files)){const p=join(root,f);assert(existsSync(p),`Missing generated asset ${f}`);read[key]=readFileSync(p,'utf8')}
const src=JSON.parse(read.content),extra=JSON.parse(read.details);
assert.equal(src.version,'7.87.8-qa-reference-inventory-complete');
assert.equal(extra.editorialQAVersion,'7.88.0-rc1-targeted-corrections');
assert(extra.editorialStatus.includes('NO-GO'));
const levels={N5:40,N4:81,N3:137,N2:139,N1:127};
let examples=0;const ids=new Set();
for(const [lv,expected] of Object.entries(levels)){
 const list=src.levels[lv].grammar;
 assert.equal(list.length,expected,lv+' count');
 for(const [i,x] of list.entries()){
  assert.equal(x.id,`${lv}-g-${i+1}`,'ID/progress compatibility');
  assert(!ids.has(x.id),`Duplicate id ${x.id}`);ids.add(x.id);
  const detail=extra.items[x.id];assert(detail&&detail.formation&&detail.explanationJa&&detail.explanationMy&&detail.explanationEn,`Incomplete ${x.id}`);
  const ex=[{ja:x.example,my:x.exampleMy,en:detail.originalEnglish,focus:detail.originalFocus},...detail.more];
  assert.equal(ex.length,3,x.id);
  for(const e of ex){assert(e.ja&&e.my&&e.en&&e.focus&&e.ja.includes(e.focus),`Broken example ${x.id}`);examples++}
 }
}
assert.equal(ids.size,524);assert.equal(examples,1572);
assert(!extra.items[ src.levels.N1.grammar.find(x=>x.title==='〜んがために').id].more[1].ja.includes('知んがために'));
assert(read.client.includes('uniq(v.completed,2000)'),'Client cap not increased');
assert(read.client.includes('length<2000'),'Client bookmark cap not increased');
const backend=readFileSync('netlify/functions/jlpt-learning-progress.mts','utf8');
assert(backend.includes('slice(0,2000)')&&backend.includes('length<2000'),'Backend cap not increased');
for(const k of ['list','detail','studyHTML','detailHTML'])assert(read[k].includes('7880rc1audited'),`Cache version missing ${k}`);
for(const k of ['studyHTML','detailHTML'])assert(read[k].includes('7880rc1capacity'),`Client state cache bust missing ${k}`);
for(const x of ['yk88-pattern-mark','initFurigana()','toggleSaved(id)','markDone(id)'])assert(read.detail.includes(x),`Missing existing behavior ${x}`);
console.log('PASS v7.88.0 RC1 built-site structure',JSON.stringify({cards:524,examples,limit:2000,uiPreserved:true}));
console.log('WARNING: LANGUAGE SIGN-OFF, REAL MOBILE, AUTH/CLOUD E2E, AND PRODUCTION DEPLOY NOT TESTED');
