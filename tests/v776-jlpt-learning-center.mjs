/** v7.76 JLPT Learning Center regression: level selection + 6 skills, preservation checks. */
import {readFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {strict as assert} from 'node:assert';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(join(root,'index.html'),'utf8');
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
let count=0;
function check(name,fn){fn();console.log('PASS',name);count++}
const panel=html.split('id="jlpt-learning-center"')[1]?.split('</section>')[0]||'';
const js=html.split('<script id="v776-jlpt-level-script">')[1]?.split('</script>')[0]||'';
check('new source version',()=>assert.equal(pkg.version,'7.76.0'));
check('single JLPT learning center inside Study Hub',()=>{
 assert.equal((html.match(/id="jlpt-learning-center"/g)||[]).length,1);
 assert(html.indexOf('id="study-hub"')<html.indexOf('id="jlpt-learning-center"'));
 assert(html.indexOf('id="jlpt-learning-center"')<html.indexOf('id="studyHubGridV733"'));
 assert.equal((html.match(/class="study-track study-extra-card study-jlpt-card"/g)||[]).length,0);
});
check('five accessible level buttons',()=>{
 for(const level of ['N5','N4','N3','N2','N1'])assert.equal((panel.match(new RegExp(`data-yk776-level="${level}"`,'g'))||[]).length,1);
 assert.equal((panel.match(/data-yk776-level="N[1-5]"/g)||[]).length,5);
 assert(panel.includes('aria-pressed="true"'));
});
check('six unique activity cards',()=>{
 for(const kind of ['vocabulary','grammar','kanji','reading','listening','mock']){
  assert.equal((panel.match(new RegExp(`data-yk776-skill="${kind}"`,'g'))||[]).length,1);
 }
});
check('selection updates existing dictionary and mock access parameters',()=>{
 assert(panel.includes('data-dict-source="JLPT N5"'));
 assert(panel.includes('data-hub-exam="jlpt_n5"'));
 assert(js.includes('vocab.dataset.dictSource=`JLPT ${level}`'));
 assert(js.includes('liveMock.dataset.hubExam=`jlpt_${level.toLowerCase()}`'));
 assert(js.includes("root.querySelector('[data-yk776-skill=\"mock\"]')"));
 assert(html.includes('async function requestStart(type)'));
});
check('unavailable content is disclosed rather than invented',()=>{
 assert(panel.includes('id="yk776LessonNotice" hidden'));
 assert(js.includes('Dedicated lessons for this level are being prepared'));
 assert(js.includes('skillName={grammar:'));
});
check('persist level and localize Myanmar/Japanese/English',()=>{
 assert(js.includes("localStorage.setItem(storageKey,level)"));
 assert(js.includes("['my','ja','en']"));
 assert(js.includes('MutationObserver'));
 assert(panel.includes('data-my='));assert(panel.includes('data-ja='));assert(panel.includes('data-en='));
});
check('all legacy transport routes retained and expandable',()=>{
 for(const type of ['truck','taxi','bus','maintenance','car','motorcycle','moped'])assert(html.includes(`data-hub-exam="${type}"`));
 assert(html.includes('id="studyHubMoreV733"'));assert(html.includes('study-hub-grid.expanded'));
});
check('five JLPT mock scope destinations retained',()=>{
 for(const level of ['n5','n4','n3','n2','n1'])assert(html.includes(`id="jlpt-exam-${level}"`));
});
console.log(`TOTAL v7.76 JLPT Learning Center: ${count} PASS / 0 FAIL`);
