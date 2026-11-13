/** v7.87.5 — public-output-only mobile performance and error UX.
 * Run only AFTER v7.87.4 navigation + release QA.
 * Never change protected Netlify functions, exam engine, scoring, payment or identity.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';

const dist=resolve('dist');
const exams=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const jlptAssets=[
  ['script','jlpt-native-mock-bank-v752.js'],
  ['script','jlpt-scoring-v755.js'],
  ['script','jlpt-native-v750.js'],
  ['stylesheet','jlpt-native-v750.css']
];
const expectedFiles=['assets/yk-v7875-stability.js','assets/yk-v7875-stability.css','service-worker.js'];
for(const file of expectedFiles)assert(existsSync(join(dist,file)),`Public build missing ${file}`);
const sw=readFileSync(join(dist,'service-worker.js'),'utf8');
assert(sw.match(/yk-official-v7-87-(?:5|13|20)/), 'Cache version was not advanced to v7.87.5');
assert(sw.includes("request.mode === 'navigate'"), 'Never service-worker-cache navigation/HTML');
assert(sw.includes("url.pathname.startsWith('/.netlify/')"), 'Protected API must not be cached');

function assetMarkup([kind,name]) {
  return kind==='script' ? `<script src="/assets/${name}" defer></script>` :
    `<link rel="stylesheet" href="/assets/${name}">`;
}
function one(s,needle,page){assert.equal(s.split(needle).length-1,1,`${page}: expected exactly one ${needle}`);}
const reports=[];
for(const [index,file] of ['mock-exams.html',...exams.map(t=>`exams/${t}.html`)].entries()){
  const path=join(dist,file);
  assert(existsSync(path),`No built page ${file}`);
  let page=readFileSync(path,'utf8');
  assert(page.includes('yk874-education-menu'), `${file}: v7.87.4 navigation is required`);
  assert(page.includes('id="v728-online-exam-system-js"') && page.includes('id="examPanel"'), `${file}: exam engine missing`);
  const originalEngine=page.match(/<script id="v728-online-exam-system-js">([\s\S]*?)<\/script>/)?.[0];
  assert(originalEngine?.length>10000,`${file}: original exam engine signature changed`);
  one(page,'</head>',file);one(page,'</body>',file);
  assert(!page.includes('yk-v7875-stability.js'),`${file}: already transformed`);
  const type=index===0?null:exams[index-1];
  let savedBytes=0;
  if(type && !type.startsWith('jlpt_')){
    // SSW, maintenance and driving must not fetch the unrelated 155K-character JLPT bank.
    // Keep the standalone furigana helper, saved-attempt logic, student login and core engine.
    for(const entry of jlptAssets){
      const exact=assetMarkup(entry);
      one(page,exact,file);
      page=page.replace(exact,'');
      const asset=join(dist,'assets',entry[1]);
      assert(existsSync(asset),`Missing source asset for payload measurement: ${entry[1]}`);
      savedBytes+=statSync(asset).size;
    }
    assert(!page.includes('src="/assets/jlpt-native-v750.js"'));
  }else if(type){
    // JLPT needs its listening, score normalization and native question bank.
    for(const entry of jlptAssets)one(page,assetMarkup(entry),file);
  }
  const css='<link rel="stylesheet" href="/assets/yk-v7875-stability.css?v=7875">';
  const js='<script src="/assets/yk-v7875-stability.js?v=7875" defer></script>';
  // Install the lightweight error listener before the other deferred exam assets.
  page=page.replace('</head>',css+'\n'+js+'\n</head>');
  // Exam routing, save/resume, access control and original JS stay byte-for-byte.
  assert.equal((page.match(/data-exam-v728=/g)||[]).length,type?1:12,`${file}: attempt buttons changed`);
  if(type)assert(page.includes(`data-exam-v728="${type}"`), `${file}: wrong exam`);
  assert(page.includes(originalEngine),`${file}: original exam engine was modified`);
  assert(page.includes('yk-v7874-nav.js'),`${file}: navigation regressed`);
  writeFileSync(path,page,'utf8');
  reports.push({file,offRoutePayloadBytesSaved:savedBytes});
}
const nonJlpt=reports.filter(x=>x.offRoutePayloadBytesSaved>0);
assert.equal(nonJlpt.length,7);
const sum=nonJlpt.reduce((total,r)=>total+r.offRoutePayloadBytesSaved,0);
console.log(JSON.stringify({version:'7.87.5',examPages:12,centerPages:1,nonJlptRoutesOptimized:7,
  individualNonJlptUncompressedAssetBytesAvoided:nonJlpt[0].offRoutePayloadBytesSaved,
  sevenRoutesSumUncompressedAssetBytesAvoided:sum,
  note:'Static asset bytes saved from network requests. Does not predict wall-clock speed or transfer compression.',
  serverOrDatabaseChanged:false},null,2));
