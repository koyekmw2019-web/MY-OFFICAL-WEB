/** Read-only smoke validation AFTER running the patch. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const root=process.cwd();
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const index=read('index.html'),study=read('study/jlpt-learning.html'),page=read('assets/yk-jlpt-learning-v782-page.js');
const detail=read('study/jlpt-grammar-detail.html'),script=read('assets/yk88-grammar-detail.js');
const original=JSON.parse(read('assets/jlpt-learning-v782-content.json'));
const added=JSON.parse(read('assets/yk88-grammar-details.json'));
assert(!index.includes('>Start Learning ↗</a>'),'Old duplicate CTA still present');
assert(!index.includes('class="exam-plan-mini" id="examPlanMiniV739"'),'Duplicate Plan Mini still visible');
assert(index.includes('yk88AccessGuide') && index.includes('yk88-index-ux.css'),'Guest access guide missing');
assert(index.includes('class="yk821-hub-open" href="/study/jlpt-learning.html">Open All Lessons ↗'),'CTA not moved');
assert(study.includes('Explore Lessons <small>သင်ခန်းစာများကို ကြည့်ရန်</small>'),'Myanmar label missing');
assert(!study.includes('class="yk821-hero-art"'),'Student/Teacher hero art not removed');
assert(study.includes('yk88-jlpt-ux.css'),'Responsive fixes not linked');
assert(page.includes('yk88-grammar-card') && page.includes('/study/jlpt-grammar-detail.html'),'Card does not link to detail page');
assert(detail.includes('yk88-grammar-detail.js') && script.includes('markSentence'),'Grammar detail view not linked');
let count=0;
for(const level of ['N5','N4','N3','N2','N1']){
  for (const item of original.levels[level].grammar){
    const rec=added.items[item.id]; assert(rec,`Missing detail for ${item.id}`);
    assert(rec.originalEnglish && rec.explanationMy && rec.explanationEn && rec.formation,`Missing explanation ${item.id}`);
    assert(item.example.includes(rec.originalFocus),`Original highlight not found: ${item.id}`);
    assert(rec.more.length>=2,`Need at least 3 examples: ${item.id}`);
    for(const e of rec.more){assert(e.ja.includes(e.focus) && e.my && e.en,`Invalid example: ${item.id}`)}
    count++;
  }
}
assert.equal(count,30,'Expected to cover all 30 current Grammar Cards');
console.log('PASS QA: UI text/CTA/navigation, 30 detail lessons, 90 trilingual examples, highlight locations.');
console.log('This is STATIC QA only; manual browser and Netlify Deploy Preview tests remain required.');
