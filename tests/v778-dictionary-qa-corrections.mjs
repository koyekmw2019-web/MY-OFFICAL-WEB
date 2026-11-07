import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=(x)=>fs.readFileSync(x,'utf8');
const newer=JSON.parse(read('DICTIONARY_v7_78_FULL_CATALOG.json'));
const old=JSON.parse(read('DICTIONARY_v7_74_FULL_CATALOG.json'));
const audit=JSON.parse(read('QA_v7_78_TARGETED_CORRECTIONS.json'));
const active=read('assets/yk-dictionary-v778-complete-draft.js');
const html=read('index.html');
const ids=[...read('DICTIONARY_v7_78_QA_CORRECTIONS_2026-11-05.csv').matchAll(/^(\d+),P[012],/gm)].map(x=>+x[1]);
assert.equal(ids.length,56);assert.equal(new Set(ids).size,56);
assert.equal(newer.length,8542);assert.equal(newer.filter(x=>!x.mm).length,0);
assert.equal(audit.corrected_entries,56);
const changed = new Set(ids);
for(let i=0;i<newer.length;i++){
  if(!changed.has(i)){
    assert.equal(newer[i].jp,old[i].jp,`JP changed without audit at ${i}`);
    assert.equal(newer[i].reading,old[i].reading,`reading changed without audit at ${i}`);
    if(old[i].mm) assert.equal(newer[i].mm,old[i].mm,`gloss changed without audit at ${i}`);
  } else {
    assert.equal(newer[i].quality,'targeted_qa_correction_draft_20261105');
    assert.equal(newer[i].translation_review_status,'targeted_qa_draft_not_expert_verified');
  }
  assert(!/Node- count limit exceeded/.test(newer[i].jp),`Corrupted word at ${i}`);
}
for(const [i,jp,reading,mm] of [
 [4000,'薬指','くすりゆび','လက်သူကြွယ်'],
 [3411,'利子','りし','အတိုးငွေ'],
 [1700,'助詞','じょし','ဝိဘတ်'],
 [4841,'留まる','とまる','တည်ရှိ'],
 [5992,'許可','きょか','ခွင့်ပြု'],
 [6365,'直','じき','မကြာမီ'],
 [6737,'通す','とおす','ဖြတ်သန်း'],
 [6,'愛憎','あいぞう','အချစ်'],
 [27,'灰汁','あく','အရည်'],
 [8427,'渡る','わたる','ကူး']
]) { assert.equal(newer[i].jp,jp);assert.equal(newer[i].reading,reading);assert(newer[i].mm.includes(mm),`${jp} invalid Burmese gloss`); }
assert.equal(newer[17].reading,'あからさま');
assert.equal(newer[23].reading,'あきま');
assert.equal(newer[29].reading,'あくび');
assert(active.startsWith('/* v7.78 dictionary'));
const m=active.match(/window\.YK_DICTIONARY_V778=(\[.*\]);\s*$/s);assert(m);
assert.deepEqual(JSON.parse(m[1]),newer,'runtime JS dictionary must match source JSON');
assert(html.includes('yk-dictionary-v778-complete-draft.js?v=778qa20261105'));
assert.equal(audit.all_entries_editorially_verified,false);
console.log('v7.78 targeted QA patch PASS: 56 targeted entries corrected; 8,542 source and runtime entries consistent; 0 blanks; expert verification still pending');
