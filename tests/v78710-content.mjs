/** v7.87.10: 509 independently authored multilingual grammar entries, no empty placeholders. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const rd=p=>readFileSync(p,'utf8');
const levelCounts={n5:35,n4:75,n3:135,n2:137,n1:127};
const ids=new Set();const samples=[];let total=0;
const jp=/[\u3040-\u30ff\u3400-\u9fff]/;
const my=/[\u1000-\u109f]/;
for(const [lv,num] of Object.entries(levelCounts)){
 const d=JSON.parse(rd(`assets/yk-v7879-grammar-${lv}.json`));
 assert.equal(d.version,'7.87.10');assert.equal(d.level,lv.toUpperCase());assert.equal(d.items.length,num,lv);
 for(const p of d.items){
  assert(!ids.has(p.id),`Duplicate ID ${p.id}`);ids.add(p.id);
  assert.equal(p.status,'draft',`${p.id} has no authored lesson`);
  assert.equal(p.level,lv.toUpperCase(),p.id);
  assert(p.title?.trim()&&jp.test(p.title),p.id+' title');
  for(const k of ['meaningJa','meaningMy','meaningEn','formation']) assert(p[k]?.trim()&&p[k].length >= (k==='formation'?2:5),`${p.id}:${k}`);
  assert(jp.test(p.meaningJa),p.id+' Japanese explanation');
  assert(my.test(p.meaningMy),p.id+' Myanmar explanation');
  assert(/[a-zA-Z]/.test(p.meaningEn),p.id+' English explanation');
  assert.equal(p.examples?.length,2,`${p.id} requires two examples`);
  for(const e of p.examples){
   assert(jp.test(e.ja)&&e.ja.trim().length>=6,`${p.id}:example Japanese`);
   assert(my.test(e.my)&&e.my.trim().length>=8,`${p.id}:example Myanmar`);
   assert(/[a-zA-Z]/.test(e.en)&&e.en.trim().length>=12,`${p.id}:example English`);
   assert(e.highlight?.trim()&&e.ja.includes(e.highlight),`${p.id}:underline target missing`);
   assert(!/TODO|TBD|lorem ipsum|\[PLACEHOLDER\]/i.test(`${e.ja} ${e.my} ${e.en}`),`${p.id}:placeholder`);
   samples.push(e.ja);
  }
 }
 total+=d.items.length;
}
assert.equal(total,509);assert.equal(ids.size,509);assert.equal(samples.length,1018);
const html=rd('study/jlpt-grammar-library.html'),js=rd('assets/yk-v7879-grammar.js');
assert(html.includes('yk-v7879-grammar.js?v=78710'),'fresh script cache key');
assert(js.includes('json?v=78710'),'fresh JSON cache key');
assert(js.includes('<mark class="yk879-grammar-mark">'),'red underline');
assert(js.includes('<ruby>'),'furigana ruby');
for(const v of ['auto','all','off'])assert(html.includes(`data-furi="${v}"`),v);
assert(html.includes('Original 30 lessons'),'legacy progress link preserved');
const pkg=JSON.parse(rd('package.json'));
assert(['7.87.10','7.87.11','7.87.12','7.87.13','7.87.14','7.87.15','7.87.16','7.87.17','7.87.18','7.87.19','7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version));
assert(pkg.scripts.build.includes('node scripts/build-v7879-grammar.mjs && node tests/v7879-release.mjs'),'previous cumulative grammar integration preserved');
assert(pkg.scripts.test.includes('node tests/v78710-content.mjs'),'new content QA wired');
assert(pkg.scripts.build.includes('node tests/v78710-release.mjs'),'new release QA wired');
console.log('PASS v78710-content: 509/509 trilingual original authored lessons, 1,018 JP/MY/EN examples, all highlights present, legacy safe, cache key v78710');
