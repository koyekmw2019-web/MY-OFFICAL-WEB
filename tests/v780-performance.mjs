/** v7.80 static performance/security and asset fidelity checks. */
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const file=(p)=>join(root,p);
const html=readFileSync(file('index.html'),'utf8');
const pkg=JSON.parse(readFileSync(file('package.json'),'utf8'));
const manifest=JSON.parse(readFileSync(file('QA_v7_80_ASSET_MANIFEST.json'),'utf8'));
const worker=readFileSync(file('service-worker.js'),'utf8');
let passed=0;
const check=(name,cb)=>{cb();passed++;console.log('PASS '+name)};
check('v7.80 release and original homepage SEO title preserved',()=>{
  assert(['7.80.0','7.81.0'].includes(pkg.version));
  assert(html.includes('<title>YE KUN Official Website | YE LINN OO</title>'));
  assert(html.includes('View More · Study Hub &amp; JLPT'));
});
check('32 inline JPEG/PNG images safely externalized without changing bytes',()=>{
  assert.equal(manifest.embedded_originals,32);
  assert.equal(manifest.files_created,32);
  assert(!/data:image\/(?:jpeg|png|webp);base64,/.test(html));
  for(const asset of manifest.assets){
    const path=asset.url.replace(/^\//,'');
    assert(existsSync(file(path)),path);
    const data=readFileSync(file(path));
    assert.equal(createHash('sha256').update(data).digest('hex'),asset.sha256,path);
    assert.equal(data.length,asset.bytes);
    assert(html.includes(asset.url));
  }
});
check('homepage HTML transfer-size reduction is at least 75% in bytes',()=>{
  assert(manifest.original_index_bytes>4_000_000);
  assert(statSync(file('index.html')).size===manifest.optimized_index_bytes);
  assert(manifest.optimized_index_bytes/manifest.original_index_bytes<.25);
  assert(manifest.optimized_index_gzip_bytes<manifest.original_index_gzip_bytes);
});
check('original logo, dictionary, exam and YKCR integrations still referenced',()=>{
  for(const frag of ['yk-brand-icon-v778','YK_DICTIONARY_V778','STUDYING WITH YE KUN','jlpt-exam-n1',
    'id="studyHubGridV733"','/assets/yk-dictionary-v778-complete-draft.js',
    'exam-access'])assert(html.includes(frag),frag);
  for(const path of ['admin-dashboard.html','student-dashboard.html','member-dashboard.html','dashboard.html']) {
    assert(readFileSync(file(path),'utf8').includes('yk-horizontal-white-v778'),path);
  }
});
check('safe PWA caching never stores protected routes or navigation HTML',()=>{
  assert(worker.includes('v7-80-stability-speed'));
  assert(worker.includes("request.mode === 'navigate'"));
  for(const guard of ["request.method !== 'GET'",'url.origin !== self.location.origin',"/.netlify/","/api/","/admin", "request.headers.has('authorization')"])
    assert(worker.includes(guard),guard);
  assert(/\.\*\?\:js\|css/.test(worker)||worker.includes('js|css|png'));
  assert(worker.includes('response.ok'));
});
check('source data and published content complete',()=>{
  const dict=JSON.parse(readFileSync(file('DICTIONARY_v7_78_FULL_CATALOG.json')));
  assert.equal(dict.length,8542);
  assert(existsSync(file('QA_v7_78_TARGETED_CORRECTIONS.json')));
});
console.log(`TOTAL v7.80 PERFORMANCE: ${passed} PASS / 0 FAIL`);
