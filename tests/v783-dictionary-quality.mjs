/** v7.83: dictionary coverage, original sentence provenance, favorite migration, safe reports. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=path=>fs.readFileSync(path,'utf8');
const src=JSON.parse(read('DICTIONARY_v7_78_FULL_CATALOG.json'));
const next=JSON.parse(read('DICTIONARY_v7_83_FULL_CATALOG.json'));
const meta=JSON.parse(read('QA_v7_83_DICTIONARY.json'));
const html=read('index.html');
const patchScript=read('assets/yk-dictionary-v783-overlay.js');
let pass=0;
const test=(name,fn)=>{fn();console.log('PASS '+name);pass++};
test('8,542 source words and readings preserved with zero blank Burmese meanings',()=>{
 assert.equal(next.length,8542);assert.equal(meta.automated_audited,8542);
 assert.equal(next.filter(t=>!t.mm?.trim()).length,0);
 for(let i=0;i<next.length;i++){
   assert.equal(next[i].jp,src[i].jp);assert.equal(next[i].reading,src[i].reading);
   assert.equal(next[i].level,src[i].level);
 }
});
test('Meaning fixes are traceable, targeted, and not mislabeled as expert-verified',()=>{
 const changes=next.filter((t,i)=>t.mm!==src[i].mm);
 assert.equal(changes.length,meta.targeted_meaning_corrections);
 assert(changes.length>=20);
 assert(changes.every(x=>x.translation_review_status==='editorial_draft_v783_not_expert_verified'));
 assert.equal(meta.all_translations_expert_verified,false);
 assert(meta.machine_translation_review_required>5000);
 assert(read('DICTIONARY_v7_83_CORRECTIONS.csv').includes('old_mm,new_mm'));
 assert(read('DICTIONARY_v7_83_QA_FLAGS.csv').includes('automated_flags'));
});
test('Original Japanese/Myanmar bilingual examples are valid and use optional safe ruby annotations',()=>{
 const records=next.filter(x=>x.example_ja&&x.example_my);
 assert.equal(records.length,meta.examples_with_bilingual_sentences);
 assert(records.length>=150);
 assert.equal(next.filter(x=>x.example_review_status==='original_educational_draft_v783').length,meta.original_v783_examples);
 for(const e of next){
  if(!e.example_ruby)continue;
  assert(!e.example_ruby.includes('<script'));
  const plain=e.example_ruby.replace(/\[([^:\]]+):([^\]]+)\]/g,(_,head)=>head);
  assert.equal(plain,e.example_ja,`Furigana mismatch: ${e.jp}`);
 }
});
test('v7.83 runtime overlays publish exactly the source corrections without rewriting v7.78 source',()=>{
 const ctx={window:{}};vm.runInNewContext(patchScript,ctx);
 const p=ctx.window.YK_DICTIONARY_V783_PATCH;
 assert.equal(p.metrics.catalog_entries,8542);
 assert.equal(p.metrics.targeted_meaning_corrections,meta.targeted_meaning_corrections);
 assert(p.patches.some(x=>x.jp==='免許'&&x.mm.includes('လိုင်စင်')));
 assert(p.legacy.some(x=>x.example_ruby));
 assert(read('assets/yk-dictionary-v778-complete-draft.js').includes('window.YK_DICTIONARY_V778='));
});
test('Dictionary UI includes secure report dialog, reading ruby, bilingual examples and stable favorites',()=>{
 for(const term of ['dictionaryReportModal','dictionaryReportForm','data-action="report"','dict-v783-example','rubySentence(t)','rubyWord(t)','migratedFavorites','dictionary-overrides'])assert(html.includes(term),term);
 assert(html.includes('yk-dictionary-v778-complete-draft.js'));
 assert(html.includes('yk-dictionary-v783-overlay.js'));
 assert(html.includes('yk-dictionary-v783.css'));
 assert(!html.includes('<title>STUDYING WITH YE KUN</title>'));
 assert(html.includes('<title>YE KUN Official Website | YE LINN OO</title>'));
});
test('Admin report queue is protected, responses are reviewed and changes server approved',()=>{
 const publicApi=read('netlify/functions/dictionary-report.mts');
 const adminApi=read('netlify/functions/dictionary-reports-admin.mts');
 const overrides=read('netlify/functions/dictionary-overrides.mts');
 const migration=read('netlify/database/migrations/20261109150000_v783_dictionary_reports.sql');
 assert(publicApi.includes("origin!==new URL(req.url).origin"));
 assert(publicApi.includes('Daily report limit reached'));
 assert(publicApi.includes('INSERT INTO yk_dictionary_reports'));
 assert(adminApi.includes('requireAdmin()'));
 assert(adminApi.includes('verifyRequestOrigin(req)'));
 assert(adminApi.includes('BEGIN')&&adminApi.includes('ROLLBACK'));
 assert(adminApi.includes('yk_dictionary_overrides'));
 assert(overrides.includes('yk_dictionary_overrides'));
 assert(migration.includes('CREATE TABLE IF NOT EXISTS yk_dictionary_reports'));
 assert(migration.includes('CREATE TABLE IF NOT EXISTS yk_dictionary_overrides'));
 assert(!/DROP TABLE|ALTER TABLE exam_|ALTER TABLE students|ALTER TABLE ykcr_/i.test(migration));
 assert(read('assets/yk-dashboard-v758.js').includes('/dictionary-reports.html')); // Admin-only management panel after role verification
 assert(!read('admin-dashboard.html').includes('href="/dictionary-reports.html"')); // no oversized intro CTA
 assert(read('dictionary-reports.html').includes('noindex,nofollow'));
});
test('Dictionary runtime JavaScript parses safely in isolation',()=>{
 const a=html.indexOf('<!-- ===== V7.18 Dictionary pronunciation restore:');
 const start=html.indexOf('<script>',a)+'<script>'.length;
 const end=html.indexOf('</script>',start);
 assert(start>0&&end>start);
 new vm.Script(html.slice(start,end),{filename:'dictionary-v783.js'});
 new vm.Script(read('dictionary-reports.html').split('<script>')[1].split('</script>')[0]);
});
test('Source performance budget, Study Hub and character asset paths remain retained',()=>{
 // v7.86.4: small self-contained menu SVG sprite and accessibility labels.
 const menuBudget=['7.86.4','7.86.5','7.87.0','7.87.1'].includes(JSON.parse(read('package.json')).version)?8000:0;
 assert(fs.statSync('index.html').size<=799611+15000+menuBudget);
 for(const p of ['assets/characters/student-v7821.webp','assets/characters/teacher-v7821.webp','assets/jlpt-reading-v7822-upgrade.json'])assert(fs.existsSync(p));
 assert(html.includes('id="studyHubGridV733"'));
 assert(html.includes('View More · Study Hub &amp; JLPT'));
});
console.log(`TOTAL v7.83 DICTIONARY QA: ${pass} PASS / 0 FAIL`);
