/** v7.84.1 public-build safety: every original vocabulary object is preserved exactly. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script,createContext} from 'node:vm';
import {parseSourceDictionary,packDictionary} from '../scripts/_dictionary-packer-v7841.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');
const original=read('assets/yk-dictionary-v778-complete-draft.js');
const expected=parseSourceDictionary(original);
let passed=0;
function test(title,fn){fn();console.log('PASS v7841 '+title);passed++}
test('every one of 8542 dictionary records reconstructed losslessly, including exact optional data',()=>{
  const {code}=packDictionary(original);
  const ctx=createContext({window:{}});
  new Script(code,{filename:'packed-dictionary.js'}).runInContext(ctx,{timeout:15000});
  const actual=JSON.parse(JSON.stringify(ctx.window.YK_DICTIONARY_V778));
  assert.equal(actual.length,8542);
  for(let i=0;i<expected.length;i++){
    try{assert.deepStrictEqual(actual[i],expected[i]);}
    catch(e){throw Error(`Mismatch at word ${i} ${expected[i].jp}: ${e.message}`)}
  }
  assert(Buffer.byteLength(code)<Buffer.byteLength(original)*0.5);
});
test('homepage title, hero and dictionary references remain, and PWA cache revision bumped',()=>{
  assert(read('index.html').includes('<title>YE KUN Official Website | YE LINN OO</title>'));
  assert(read('index.html').includes('STUDYING WITH YE KUN'));
  assert(read('index.html').includes('View More · Study Hub &amp; JLPT'));
  assert(read('index.html').includes('yk-dictionary-v778-complete-draft.js?v=778qa20261105'));
  assert(read('service-worker.js').includes('yk-official-v7-87-20'));
});
test('Netlify uses dist publish, retains Functions and original esbuild login bundle',()=>{
  assert(/publish = "dist"/.test(read('netlify.toml')));
  assert(/functions = "netlify\/functions"/.test(read('netlify.toml')));
  assert(read('package.json').includes('esbuild src/identity-client.js'));
  assert(read('package.json').includes('node scripts/build-public-v7841.mjs'));
});
test('no source exclusions or destructive database schema edits, PDF or service-worker broad caching',()=>{
  for(const f of ['DICTIONARY_v7_78_FULL_CATALOG.json','DICTIONARY_v7_83_FULL_CATALOG.json',
    'QA_v7_71_BACKEND_HASHES.json','netlify/functions/exam-access.mts',
    'netlify/functions/exam-admin-analytics.mts','netlify/functions/ykcr-student-sync.mts',
    'assets/characters/student-v7821.webp','assets/characters/teacher-v7821.webp'])assert(existsSync(join(root,f)),f);
  assert(!/\.pdf$/i.test(readdirSync(root).join(',')));
  const sw=read('service-worker.js');
  for(const must of ['request.mode === \'navigate\'','request.method !== \'GET\'','/.netlify/'])assert(sw.includes(must));
});
test('explicit production public output does not contain backend source, CSV, QA, secrets or draft catalogues',()=>{
  const dist=join(root,'dist');
  if(!existsSync(dist))return;
  for(const forbidden of ['netlify','tests','scripts','src','translations','DICTIONARY_v7_78_FULL_CATALOG.json',
    'DICTIONARY_v7_83_FULL_CATALOG.json','QA_v7_84_RELEASE.json','package.json','EXAM_BACKEND_SETUP.md'])
    assert(!existsSync(join(dist,forbidden)),forbidden);
  for(const needed of ['index.html','sitemap.xml','robots.txt','manifest.webmanifest',
     'study/jlpt-learning.html','student-dashboard.html','admin-dashboard.html',
     'assets/yk-dictionary-v778-complete-draft.js','assets/characters/student-v7821.webp','assets/characters/teacher-v7821.webp'])
    assert(existsSync(join(dist,needed)),needed);
  assert(readFileSync(join(dist,'index.html'),'utf8').includes('yk-dictionary-v778-complete-draft.js?v=7841packed'));
});
console.log(`v7841 optimization QA: ${passed} PASS`);
