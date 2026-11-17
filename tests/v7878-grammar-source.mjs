/** Source-only checks; safe before full website build. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const rd=p=>readFileSync(p,'utf8');
const prev=JSON.parse(rd('assets/yk-grammar-v7877-additions.json'));
const completion=JSON.parse(rd('assets/yk-grammar-v7878-completion.json'));
const audit=JSON.parse(rd('assets/yk-grammar-v7878-coverage-audit.json'));
assert.equal(prev.lessons.length,139);
assert.equal(completion.lessons.length,355);
const counts={N5:0,N4:0,N3:121,N2:123,N1:111};
for(const [lv,count] of Object.entries(counts))assert.equal(completion.lessons.filter(x=>x.level===lv).length,count,`${lv} completion`);
for(const item of [...prev.lessons,...completion.lessons]){
 assert(item.title&&item.formation&&item.explanationJa&&item.explanationMy&&item.explanationEn,`Incomplete explanation ${item.title}`);
 assert.equal(item.examples.length,3,`${item.title} example count`);
 for(const ex of item.examples){assert(ex.length===3||ex.length===4,`${item.title} example schema`);const [ja,my,en,focus]=ex;
  assert(ja&&my&&en&&ja.includes(focus||item.focus),`Focus/example mismatch ${item.title}`);}
}
for(const lv of ['N5','N4','N3','N2','N1']){
 const rows=audit.levels[lv].patterns;
 assert.equal(rows.length,audit.levels[lv].inventoryCount);
 assert(rows.every(x=>x.status!=='NEEDS-MANUAL-REVIEW'),`${lv} coverage incomplete`);
}
const driver=rd('scripts/build-page-transitions-v7875.mjs');
assert(driver.includes("await import('./build-v7877-grammar-update.mjs')"));
assert(driver.includes("await import('./build-v7878-grammar-complete.mjs')"));
assert(driver.indexOf("await import('./build-v7877-grammar-update.mjs')")<driver.indexOf("await import('./build-v7878-grammar-complete.mjs')"));
const next=JSON.parse(rd('assets/yk-grammar-v7879-editorial-corrections.json'));
assert.equal(Object.keys(next.original30JapaneseExplanations).length,30);
assert.equal(next.lessonCorrections.length,6);
assert(driver.includes("await import('./build-v7879-grammar-editorial-qa.mjs')"));
assert(driver.indexOf("await import('./build-v7878-grammar-complete.mjs')") < driver.indexOf("await import('./build-v7879-grammar-editorial-qa.mjs')"));
console.log('PASS source grammar completion',JSON.stringify({priorNew:139,currentNew:355,newExamples:355*3,referenceN3N2N1:{N3:135,N2:137,N1:127}}));
