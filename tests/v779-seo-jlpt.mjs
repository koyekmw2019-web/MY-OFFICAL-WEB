/** v7.79 source-level SEO & JLPT cards regression QA. No ranking/live deployment claims. */
import {readFileSync, existsSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');
const html=read('index.html');
let pass=0;
function check(n,fn){fn(); console.log('PASS',n);pass++}
check('exact historical homepage title preserved across title and OG',()=>{
  assert(html.includes('<title>YE KUN Official Website | YE LINN OO</title>'));
  assert(html.includes('property="og:title" content="YE KUN Official Website | YE LINN OO"'));
  assert(!html.includes('<meta name="keywords"'));
});
check('metadata explains existing JLPT, SSW and dictionary study resources',()=>{
  for(const kw of ['JLPT N1–N5','日本語ミャンマー語辞書','特定技能・自動車運送業','運送業テキスト','STUDYING WITH YE KUN']) assert(html.includes(kw),kw);
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
});
check('site schema is valid JSON-LD referencing actual anchored content',()=>{
  const m=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(m,'missing site JSON-LD');
  const data=JSON.parse(m[1]);
  const page=data['@graph'].find(x=>x['@type']==='WebPage');
  assert(page && Array.isArray(page.keywords) && page.keywords.length>=10);
  for(const part of page.hasPart){assert(html.includes(`id="${part.url.split('#')[1]}"`),part.url)}
  assert(data['@graph'].some(x=>x.name==='STUDYING WITH YE KUN'));
});
check('JLPT N5–N1 have permanent Burmese explanation and two-line start CTA',()=>{
 for(const level of ['n5','n4','n3','n2','n1']){
  const start=html.indexOf(`id="jlpt-exam-${level}"`);
  assert(start>0,level);
  const end=html.indexOf('</article>',start);
  assert(end>start,level);
  const card=html.slice(start,end);
  assert(card.includes('class="jlpt-card-mm-v779" lang="my"'),level);
  assert(card.includes(`data-exam-v728="jlpt_${level}"`),level);
  assert(card.includes('class="jlpt-card-cta-mm-v779" lang="my">စာမေးပွဲ စတင်မည်'),level);
  assert(card.includes(`data-en="Start ${level.toUpperCase()} Mock Exam"`),level);
  assert(card.includes(`data-ja="${level.toUpperCase()} 模擬試験を開始"`),level);
  // Retain actual exam content references rather than fabricate a full 100-question exam.
  assert(card.includes('20</strong> Text') && card.includes('5</strong> Listening'));
 }
});
check('JLPT last-minute practice is correctly credited and clearly unofficial',()=>{
  const js=read('assets/jlpt-chokuzen-v750.js');
  assert(js.includes('STUDYING WITH YE KUNが作成した非公式'));
  assert(js.includes('STUDYING WITH YE KUN မှ ဖန်တီးထားသော'));
  assert(js.includes('聴解は含みません')); // This specific drill excludes listening, unlike the full JLPT mock.
  assert(!js.includes('※ YE KUNが作成した'));
});
check('Existing UI/navigation preserved; expanded public index permitted in v7.81',()=>{
  for(const id of ['study-hub','study-resources','driving-dictionary','online-mock-exam','jlpt-exam-center']) assert(html.includes(`id="${id}"`));
  for(const file of ['login.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html','dashboard.html']) assert(/<meta[^>]+name="robots"[^>]+content="noindex,(?:follow|nofollow)"/.test(read(file)));
  assert((read('sitemap.xml').match(/<loc>/g)||[]).length>=1);
});
check('Current source data still 8542 entries, corrected dataset retained',()=>{
 const cat=JSON.parse(read('DICTIONARY_v7_78_FULL_CATALOG.json'));
 assert(Array.isArray(cat) && cat.length===8542);
 assert(existsSync(join(root,'QA_v7_78_TARGETED_CORRECTIONS.json')));
});
console.log(`TOTAL v7.79: ${pass} PASS / 0 FAIL`);
