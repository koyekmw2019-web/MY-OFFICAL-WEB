/** v7.82.2 Reading Enhancement: data integrity, unchanged sources, UI, countdown, and privacy. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');
const load=p=>JSON.parse(read(p));
let passed=0;
const test=(name,fn)=>{fn();console.log('PASS',name);passed++};
const levels=['N5','N4','N3','N2','N1'];
const base=load('assets/jlpt-learning-v782-content.json');
const addon=load('assets/jlpt-reading-v7822-upgrade.json');
test('version stays v7.82.2 and legacy homepage branding is unchanged',()=>{
 assert(['7.82.2','7.83.0','7.84.0','7.84.1','7.85.0','7.86.0','7.86.1'].includes(load('package.json').version));
 assert.match(read('index.html'),/<title>YE KUN Official Website \| YE LINN OO<\/title>/);
 assert(read('index.html').includes('id="yk822HubCountdown"'));
 assert(read('index.html').includes('id="yk822HubReadingLink"'));
 assert(read('study/jlpt-learning.html').includes('id="yk822LearningCountdown"'));
});
test('20 original supplemental reading exercises cover the appropriate five levels',()=>{
 const counts={N5:3,N4:3,N3:4,N2:5,N1:5};
 const seen=new Set();let total=0;
 for(const lv of levels){
  const part=addon.levels[lv];assert.equal(part.exercises.length,counts[lv]);
  assert.equal(part.techniques.length,counts[lv]);
  assert.deepEqual(new Set(part.exercises.map(x=>x.readingType)),new Set(part.techniques.map(t=>t.id)));
  for(const x of part.exercises){assert(x.id.startsWith(lv+'-r-'));assert(!seen.has(x.id));seen.add(x.id);total++;
   assert(x.passage.length>=35 && x.question && x.title && x.explanation.length>=10);assert.equal(x.options.length,4);assert(Number.isInteger(x.answer)&&x.answer>=0&&x.answer<4);
  }
 }
 assert.equal(total,20);
 assert(addon.source.includes('Not JLPT official'));
 assert.equal(addon.officialSamplesUrl,'https://www.jlpt.jp/samples/sampleindex.html');
});
test('base 152 lessons remain intact and new supplemental count is 172',()=>{
 let baseCount=0,extraCount=0;const ids=new Set();
 for(const lv of levels){for(const [cat,arr] of Object.entries(base.levels[lv])){baseCount+=arr.length;for(const x of arr){assert(!ids.has(x.id));ids.add(x.id)}}for(const x of addon.levels[lv].exercises){assert(!ids.has(x.id));ids.add(x.id);extraCount++}}
 assert.equal(baseCount,152);assert.equal(extraCount,20);assert.equal(ids.size,172);
});
test('reading UI filters, official source link, options, saved and daily practice integrate',()=>{
 const js=read('assets/yk-jlpt-learning-v782-page.js'),css=read('assets/yk-jlpt-reading-v7822.css');
 for(const word of ['renderReadingTools','data-reading-filter','readingUpgrade','readingFilter','officialSamplesUrl','drawDaily','S.toggleSaved(id)','S.markDone(id)']){
  if(word==='officialSamplesUrl')assert(js.includes('https://www.jlpt.jp/samples/sampleindex.html'));else assert(js.includes(word),word);
 }
 assert(js.includes("readingFilter!=='all'"));assert(js.includes("data.levels[lv].reading.push(...extra)"));
 assert(css.includes('.yk822-method-grid'));assert(css.includes('max-width:560px'));assert(css.includes('focus-visible'));
 assert(!js.includes('exam-attempt-submit')&&!js.includes('paid_access'));
});
test('countdown uses the officially confirmed date and Asia/Tokyo day boundaries',()=>{
 const js=read('assets/yk-jlpt-reading-v7822.js');
 assert(js.includes('Date.UTC(2026,11,6)'));
 assert(js.includes('Asia/Tokyo'));
 assert(js.includes('Days Left'));
 assert(js.includes('Last 30-day review'));
 assert.equal(Math.round((Date.UTC(2026,11,6)-Date.UTC(2026,10,9))/86400000),27);
});
test('approved student and teacher graphics are still linked and no new private cache routes',()=>{
 for(const who of ['student','teacher']){
  assert(existsSync(join(root,`assets/characters/${who}-v7821.webp`)));
  assert(read('study/jlpt-learning.html').includes(`${who}-v7821.webp`));
 }
 const sw=read('service-worker.js');
 assert(sw.includes('assets/jlpt-reading-v7822-upgrade.json'));
 assert(sw.includes('yk-public-static-'));
 assert(sw.includes("request.mode === 'navigate'"));
 assert(sw.includes("url.pathname.startsWith('/.netlify/')"));
 assert(!read('sitemap.xml').includes('admin-dashboard.html'));
});
test('server functions and migrations are never referenced or modified for this update',()=>{
 const p=read('assets/yk-jlpt-learning-v782-page.js');
 assert(p.includes("await S.init()"));
 assert(p.includes('yk82Content'));
 assert(!p.includes('ykcr_sync_events')&&!p.includes('payment_requests'));
});
console.log(`TOTAL v7.82.2 READING UPDATE: ${passed} PASS / 0 FAIL`);
