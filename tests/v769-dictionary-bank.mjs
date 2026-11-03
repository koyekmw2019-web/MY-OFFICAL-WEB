import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=readFileSync(new URL('../assets/yk-dictionary-v769.js',import.meta.url),'utf8');
const win={};vm.runInNewContext(src,{window:win});
const xs=win.YK_DICTIONARY_V769;
assert.equal(xs.length,8542);
const key=x=>x.jp+'¦'+x.reading;
const keys=new Set(xs.map(key));assert.equal(keys.size,xs.length);
const statuses={};for(const x of xs){statuses[x.quality]=(statuses[x.quality]||0)+1; assert(x.jp&&x.reading);assert(x.levels.includes(x.level));assert(['N1','N2','N3','N4','N5'].includes(x.level));}
assert.equal(statuses.verified_v768,360);
assert.equal(xs.filter(x=>!x.mm).length,8182);
const queue=readFileSync(new URL('../DICTIONARY_v7_68_REVIEW_QUEUE.csv',import.meta.url),'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/).slice(1);
// Csv fields contain no multi-line values; first three columns are enough for coverage assertions.
assert(queue.length===7523);
const curated=xs.filter(x=>x.quality==='verified_v768');assert(curated.every(x=>x.mm && x.mm.trim()));
const h=readFileSync(new URL('../index.html',import.meta.url),'utf8');
for(const pattern of ['yk-dictionary-v769.js','dictionaryLoadMore','YK_DICTIONARY_V769','JLPT N5','dictionary-pending','FAV_KEY',"'yekun_dictionary_favorites_v7'"]){assert(h.includes(pattern),pattern);}
assert(!h.includes('<script src="/assets/yk-dictionary-v768.js"></script>'));
console.log('v7.69 DICTIONARY TESTS PASS; catalog='+xs.length+' reviewed=360 pending=8182 queue='+queue.length);
