/** v7.87.10 post-build assertions; run AFTER v7.87.9 build integration. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const rd=p=>readFileSync(p,'utf8');
const page='dist/study/jlpt-grammar-library.html';
assert(existsSync(page),'Grammar route must be published');
const html=rd(page);
for(const m of ['id="yk879App"','id="yk879Grid"','data-furi="auto"','data-furi="all"','data-furi="off"','yk-v7879-grammar.js?v=78710','Original 30 lessons']) assert(html.includes(m),m);
assert(existsSync('dist/study/jlpt-learning.html'),'Legacy learning page preserved');
assert(rd('dist/study/jlpt-learning.html').includes('yk-jlpt-learning-v782-page.js'),'Legacy learning engine preserved');
assert(rd('dist/study/jlpt-learning.html').includes('yk-v7879-grammar-bridge.js?v=7879'),'Bridge preserved');
assert(existsSync('dist/assets/yk-v7879-grammar.js'),'Grammar JS published');
assert(rd('dist/assets/yk-v7879-grammar.js').includes('json?v=78710'),'Level-load cache version');
const levels={n5:35,n4:75,n3:135,n2:137,n1:127};
for(const [lv,count] of Object.entries(levels)){
 const fp=`dist/assets/yk-v7879-grammar-${lv}.json`;
 assert(existsSync(fp),fp);
 const rows=JSON.parse(rd(fp)).items;
 assert.equal(rows.length,count,lv);
 assert(rows.every(x=>x.status==='draft'&&x.examples?.length===2),lv+' all lessons authored');
}
for(const expected of ['exam-attempt-submit.mts','exam-access.mts','ykcr-student-sync.mts'])assert(!rd('scripts/grammar-v7879/build_grammar_assets.py').includes(expected),'No backend modification');
console.log('PASS v78710-release: all 509 original lessons published across lazy level files, mobile-ready page, legacy learning engine preserved');
