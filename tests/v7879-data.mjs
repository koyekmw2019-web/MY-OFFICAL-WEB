import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const levels={n5:35,n4:75,n3:135,n2:137,n1:127};
let total=0,curated=0;
const ids=new Set();
for(const [lv,count] of Object.entries(levels)){
 const path=`assets/yk-v7879-grammar-${lv}.json`;assert(existsSync(path),path);
 const data=JSON.parse(readFileSync(path,'utf8'));
 assert.equal(data.items.length,count,lv);assert.equal(data.level,lv.toUpperCase());
 for(const x of data.items){assert(!ids.has(x.id),x.id);ids.add(x.id);assert(x.title);assert(['draft','pending_review'].includes(x.status),x.id);
  if(x.status==='draft') {curated++;
   for(const key of ['meaningJa','meaningMy','meaningEn','formation'])assert(x[key]?.trim(),`${x.id}:${key}`);
   assert.equal(x.examples?.length,2,x.id);
   for(const ex of x.examples){for(const k of ['ja','my','en','highlight'])assert(ex[k]?.trim(),x.id+':'+k);
    assert(ex.ja.includes(ex.highlight),x.id+':target must appear');
    assert(!ex.ja.includes('<mark')&&!ex.ja.includes('<ruby'),x.id+': HTML not stored in content');}
  }else {assert(!x.examples&&!x.meaningEn&&!x.meaningMy,x.id+': no unverified fake translations');}
 }
 total+=data.items.length;
}
assert.equal(total,509);assert.equal(curated,509);
const html=readFileSync('study/jlpt-grammar-library.html','utf8');
for(const frag of ['id="yk879App"','id="yk879FuriBtns"','id="yk879Grid"','yk-v7879-grammar.js','STUDYING WITH YE KUN'])assert(html.includes(frag),frag);
const js=readFileSync('assets/yk-v7879-grammar.js','utf8');
assert(js.includes('<mark class="yk879-grammar-mark">'),'Red underline markup contract');
assert(js.includes('<ruby>'),'Furigana markup contract');
assert(js.includes('selected=first?.id'),'Only reviewed default selected');
assert(!js.includes('exam-access')&&!js.includes('payment_required'));
assert(readFileSync('assets/yk-v7879-grammar-bridge.js','utf8').includes("legacy')==='1"));
console.log(`PASS v7879-data: ${total} patterns, ${curated} original multilingual lesson drafts, ${total-curated} explicitly pending, furigana & underline, no backend changes`);
