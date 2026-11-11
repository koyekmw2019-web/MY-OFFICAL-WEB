import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const base=JSON.parse(read('assets/jlpt-learning-v782-content.json'));
const d=JSON.parse(read('assets/yk-n2-same-meaning-v7871.json'));
test('132 user-provided N2 synonym pairs recorded in order, with original bilingual examples',()=>{
 assert.equal(d.items.length,132);const ids=new Set();let review=0;
 for(let i=0;i<d.items.length;i++){const x=d.items[i];assert.equal(x.number,i+1);assert.equal(x.id,`N2-v-${i+401}`);assert(!ids.has(x.id));ids.add(x.id);
  for(const key of ['a','aReading','b','bReading','meaningMy','example','exampleMy'])assert(x[key]?.length,`${x.number}:${key}`);
  assert(['ok','review'].includes(x.quality));if(x.quality==='review'){review++;assert(x.noteJa?.length)}
 }
 assert.equal(review,36);assert.equal(d.items.filter(x=>x.quality==='ok').length,96);
 assert.equal(d.items[1].quality,'review');assert.match(d.items[1].noteJa,/等しい意味ではありません/);
 assert.equal(d.items[121].quality,'review');
});
test('learning progress uses existing account scope and valid N2-v-ID records',()=>{
 assert.equal(base.levels.N2.sameMeaning,undefined,'original authored lessons stay unchanged');
 assert(d.items.every(x=>/^N2-v-\d{1,4}$/.test(x.id)));
 assert(read('assets/yk-n2-same-meaning-v7871.js').includes('S.toggleSaved'));
 assert(read('assets/yk-n2-same-meaning-v7871.js').includes('S.markDone'));
 assert(read('assets/yk-n2-same-meaning-v7871.js').includes('S.getScope'));
 assert(read('assets/yk-jlpt-learning-v782-page.js').includes('/study/jlpt-n2-same-meaning.html'));
});
test('N2 lesson appears in native JLPT Learning Center, N2 SEO guide and sitemap',()=>{
 assert(read('study/jlpt-learning.html').includes('/assets/yk-jlpt-learning-v782-page.js'));
 assert(read('study/jlpt-n2.html').includes('N2 同じ意味 · 132 Pairs'));
 assert(read('sitemap.xml').includes('/study/jlpt-n2-same-meaning.html'));
 const html=read('study/jlpt-n2-same-meaning.html');
 assert(html.includes('/assets/yk-n2-same-meaning-v7871.json')===false); // lazy via JS
 assert(html.includes('id="ykn2-start-practice"'));
 assert(html.includes('id="ykn2-list"'));
 assert(html.includes('identity.bundle.js'));
 assert(!html.includes('exam-attempt-submit')); // free practice only
});
test('practice excludes context-review pairs and preserves exam access',()=>{
 const js=read('assets/yk-n2-same-meaning-v7871.js');
 assert(js.includes("data.filter(x=>x.quality==='ok')"));
 assert(js.includes("choices:Object.fromEntries(chosen.map(x=>[x.id,optionsFor(x)]))"));
 assert(!js.includes('/.netlify/functions/exam-attempt-submit'));
 assert(!js.includes('paid_access'));
 assert(read('scripts/build-public-v7841.mjs').includes("walk(join(root,'study'))"));
});
