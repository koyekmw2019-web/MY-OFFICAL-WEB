import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const prev=JSON.parse(readFileSync('assets/yk-grammar-v7877-additions.json','utf8')).lessons;
const complete=JSON.parse(readFileSync('assets/yk-grammar-v7878-completion.json','utf8')).lessons;
const fixes=JSON.parse(readFileSync('assets/yk-grammar-v7879-editorial-corrections.json','utf8')).lessonCorrections;
const readings=Object.entries(JSON.parse(readFileSync('assets/yk-grammar-v7877-furigana-map.json','utf8'))).sort((a,b)=>b[0].length-a[0].length);
const fragment=readFileSync('scripts/yk-v7879-ruby-renderer.fragment.js','utf8');
const sandbox={};
vm.runInNewContext(`const YK7877_READINGS=${JSON.stringify(readings)};const safe=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;');${fragment}\nthis.render=markSentenceWithRuby;`,sandbox);
let total=0,hasKanji=0,noRuby=0,marked=0,zero=[];
const levels={N5:{examples:0,kanji:0,noRuby:0},N4:{examples:0,kanji:0,noRuby:0},N3:{examples:0,kanji:0,noRuby:0},N2:{examples:0,kanji:0,noRuby:0},N1:{examples:0,kanji:0,noRuby:0}};
for(const row of [...prev,...complete]){
 const fix=fixes.find(x=>x.level===row.level&&x.title===row.title);
 const examples=fix?.fields?.examples || row.examples;
 for(const e of examples){
  total++;levels[row.level].examples++;
  const ja=e[0],focus=e[3]||row.focus;
  const html=sandbox.render({ja,focus});
  assert(html.includes('yk88-pattern-mark')&&ja.includes(focus),row.title+' '+ja);
  const kanji=/[\u3400-\u9fff]/u.test(ja);
  if(kanji){hasKanji++;levels[row.level].kanji++;if(!html.includes('<ruby>')){noRuby++;levels[row.level].noRuby++;zero.push([row.level,row.title,ja]);}}
  marked+=(html.match(/yk88-pattern-mark/g)||[]).length;
 }
}
const result={authoredLessons:prev.length+complete.length,examples:total,withKanji:hasKanji,noRubyDespiteKanji:noRuby,underlines:marked,partialFurigana:true,levels};
console.log('PASS v7.87.9 coverage metrics',JSON.stringify(result));
console.log('No ruby examples:',JSON.stringify(zero.slice(0,18),null,2));
