/** v7.78: source-level Dictionary & branded Dashboard QA. Does not claim live deployment. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const load=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const json=(name)=>JSON.parse(load(name));
const old=json('DICTIONARY_v7_74_FULL_CATALOG.json');
const newer=json('DICTIONARY_v7_78_FULL_CATALOG.json');
const corrections=load('DICTIONARY_v7_78_QA_CORRECTIONS_2026-11-05.csv');
const correctedIndices=new Set([...corrections.matchAll(/^(\d+),P[012],/gm)].map(x=>Number(x[1])));
assert.equal(correctedIndices.size,56);
const qa=json('QA_v7_78_DICTIONARY.json');
let pass=0;
function check(name,fn){fn();pass++;console.log('PASS',name)}
check('8,542 entries retained; only 56 explicitly audited entries have source-key corrections',()=>{
 assert.equal(newer.length,8542);
 for(let i=0;i<old.length;i++){
   if(!correctedIndices.has(i)){
     assert.equal(newer[i].jp,old[i].jp);assert.equal(newer[i].reading,old[i].reading);
     assert.equal(newer[i].en,old[i].en);
   }
   assert.equal(newer[i].level,old[i].level);assert.deepEqual(newer[i].sources,old[i].sources);
 }
});
check('all 5,834 previously missing glosses populated; only audited previous glosses changed',()=>{
 let revised=0, retainedV778=0;
 for(let i=0;i<old.length;i++){
   if(old[i].mm){if(!correctedIndices.has(i))assert.equal(newer[i].mm,old[i].mm);continue;}
   assert(newer[i].mm,'Missing Burmese meaning at '+i);
   assert(/[\u1000-\u109f]/.test(newer[i].mm),'Non-Burmese meaning at '+i);
   if(newer[i].quality==='curated_draft_v778'){retainedV778++;continue;}
   assert(['review_required','targeted_qa_draft_not_expert_verified'].includes(newer[i].translation_review_status));
   assert(['machine_translation_draft','manual_revision_draft','targeted_qa_correction_draft_20261105'].includes(newer[i].quality));
   revised++;
 }
 assert.equal(revised,5834);assert.equal(retainedV778,358);
});
check('all 8,542 entries have Burmese draft gloss; quality caveat preserved',()=>{
 assert.equal(newer.filter(x=>Boolean(x.mm)).length,8542);
 assert.equal(newer.filter(x=>!x.mm).length,0);
 assert.equal(qa.new_drafts_added,5834);
 assert.equal(qa.remaining_blank_myanmar_glosses,0);
 assert.equal(qa.all_gloss_fields_populated,true);
 assert.equal(qa.all_translations_expert_verified,false);
});
check('new runtime dictionary is used by website without importing stale version',()=>{
 const html=load('index.html');const js=load('assets/yk-dictionary-v778-complete-draft.js');
 assert(html.includes('<script src="/assets/yk-dictionary-v778-complete-draft.js?v=778qa20261105"></script>'));
 assert(html.includes('Array.isArray(window.YK_DICTIONARY_V778)'));
 assert(!html.includes('<script src="/assets/yk-dictionary-v774.js"></script>'));
 assert(js.includes('window.YK_DICTIONARY_V778='));
});
check('requested YK symbol used in site header and login',()=>{
 assert(load('index.html').includes('class="logo yk-brand-icon-v778"'));
 assert(load('login.html').includes('yk-auth-brand-icon-v778'));
});
check('white-on-dark wide user logo on all 4 dashboard routes',()=>{
 for(const h of ['admin-dashboard.html','student-dashboard.html','member-dashboard.html','dashboard.html']){
  assert(load(h).includes('yk-horizontal-white-v778.webp'),h);
  assert(load(h).includes('yk-brand-v778.css'),h);
  assert(!load(h).includes('class="yklogo"'),h);
 }
 assert(fs.existsSync(path.join(root,'assets/yk-horizontal-white-v778.webp')));
});
check('PWA icons PNG dimensions and manifest versioning',()=>{
 for(const s of [192,512]){
  const b=fs.readFileSync(path.join(root,`yk-${s}.png`));
  assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a');
  assert.equal(b.readUInt32BE(16),s);assert.equal(b.readUInt32BE(20),s);
 }
 const m=json('manifest.webmanifest');
 assert(m.icons.every(x=>x.src.includes('?v=778')));
});
console.log(`v7.78 brand + dictionary QA: ${pass} PASS / 0 FAIL`);
