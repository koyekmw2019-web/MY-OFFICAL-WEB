/** v7.81 public SEO pages and sitemap safety regression checks. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');
const home=read('index.html');
const sitemap=read('sitemap.xml');
const domain='https://yekun-mryethemenstyle.netlify.app';
let passes=0;function test(n,cb){cb();console.log('PASS',n);passes++}
const names=['index','jlpt-n5','jlpt-n4','jlpt-n3','jlpt-n2','jlpt-n1','jlpt-mock-exams','japanese-myanmar-dictionary','ssw-transport','ssw-truck','ssw-taxi','ssw-bus','transport-textbooks','ssw-mock-exam','ssw-auto-maintenance','driving-license'];
function match(html, regex){return (html.match(regex)||[]).length}
test('v7.81 package and original homepage search title stay unchanged',()=>{
 assert.equal(JSON.parse(read('package.json')).version,'7.81.0');
 assert(home.includes('<title>YE KUN Official Website | YE LINN OO</title>'));
 assert.equal(match(home,/<title>/g),1);
 assert.equal(match(home,/rel="canonical"/g),1);
 assert(home.includes('id="study-hub"') && home.includes('id="online-mock-exam"') && home.includes('id="driving-dictionary"'));
});
test('new guides are unique static Japanese/Myanmar readable content pages',()=>{
 const titles=new Set(),descs=new Set();
 for(const name of names){
  const rel=`study/${name}.html`;
  assert(existsSync(join(root,rel)),rel);
  const t=read(rel);
  assert(t.startsWith('<!doctype html>'));
  const title=t.match(/<title>(.*?)<\/title>/)?.[1]; const desc=t.match(/<meta name="description" content="(.*?)">/)?.[1];
  assert(title&&desc&&desc.length>40&&desc.length<250,rel);
  assert(!titles.has(title)&&!descs.has(desc),rel+' duplicates');titles.add(title);descs.add(desc);
  assert(t.includes('<h1>')&&t.includes('lang="my"')&&t.includes('lang="ja"'),rel);
  assert(!/noindex/i.test(t),rel);
  assert(!/meta name="keywords"/.test(t),rel);
  assert(t.includes(`rel="canonical" href="${domain}/${rel}"`),rel);
  assert(statSync(join(root,rel)).size>5800,'thin content? '+rel);
 }
});
test('public sitemap exactly lists the 16 guides and one original homepage; no private URLs',()=>{
 const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.equal(locs.length,names.length+1);
 assert.equal(new Set(locs).size,locs.length);
 assert.equal(locs[0],domain+'/');
 for(const n of names)assert(locs.includes(`${domain}/study/${n}.html`),n);
 for(const loc of locs)assert(!/(login|dashboard|payment|\.netlify|receipt|api\/)/i.test(new URL(loc).pathname),loc);
 assert.equal(match(sitemap,/<lastmod>2026-11-07<\/lastmod>/g),locs.length);
});
test('guides have valid WebPage and BreadcrumbList JSON-LD, not fabricated official Courses',()=>{
 for(const n of names){const t=read(`study/${n}.html`);const match=t.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);assert(match,n);
  const data=JSON.parse(match[1]);
  assert(data['@graph'].some(x=>x['@type']==='WebPage'&&x['@id']===`${domain}/study/${n}.html#webpage`),n);
  assert(data['@graph'].some(x=>x['@type']==='BreadcrumbList'),n);
  assert(!data['@graph'].some(x=>x['@type']==='Course'),n);
 }
});
test('user-facing website contains discoverable footer links without changing hero design',()=>{
 const links=['/study/index.html','/study/jlpt-mock-exams.html','/study/ssw-transport.html','/study/transport-textbooks.html','/study/japanese-myanmar-dictionary.html','/study/driving-license.html'];
 for(const link of links) assert(home.includes(`href="${link}"`),link);
 assert(home.includes('View More · Study Hub &amp; JLPT'));
 assert(home.includes('yk-brand-icon-v778'));
});
test('all new guides link to a known public homepage anchor, each other and index',()=>{
 const valid=new Set(names.map(n=>`/study/${n}.html`));
 for(const n of names){
  const t=read(`study/${n}.html`);
  assert(t.includes('href="/study/index.html"')||n==='index',n);
  assert(t.includes('href="/#'),n);
  const hrefs=[...t.matchAll(/href="(\/study\/[^"#]+)"/g)].map(m=>m[1]);
  for(const h of hrefs) assert(valid.has(h),`${n} invalid ${h}`);
 }
});
test('private login and Dashboard pages stay noindex and absent from public sitemap',()=>{
 for(const name of ['login','admin-dashboard','student-dashboard','member-dashboard','dashboard']){
  const t=read(name+'.html');assert(/<meta[^>]+name="robots"[^>]+content="noindex,(?:follow|nofollow)"/.test(t),name);
  assert(!sitemap.includes(name+'.html'));
 }
});
test('SEO update does not modify protected backend entrypoints or dictionary entries',()=>{
 const cat=JSON.parse(read('DICTIONARY_v7_78_FULL_CATALOG.json'));
 assert.equal(cat.length,8542);
 assert(existsSync(join(root,'assets/yk-dictionary-v778-complete-draft.js')));
 assert(existsSync(join(root,'netlify/functions/exam-access.mts')) || existsSync(join(root,'netlify/functions/exam-access.ts')) || existsSync(join(root,'netlify/functions/exam-access.js')));
 assert(read('robots.txt').includes('Sitemap: '+domain+'/sitemap.xml'));
});
console.log(`TOTAL v7.81 SEO: ${passes} PASS / 0 FAIL`);
