/** QA: generated-output performance pass. No live environment changes. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,writeFileSync,readFileSync,readdirSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const source=resolve('.'),fixture=mkdtempSync(join(tmpdir(),'yk-perf-'));
try{
  mkdirSync(join(fixture,'assets','embedded-v780'),{recursive:true});
  mkdirSync(join(fixture,'dist','assets','embedded-v780'),{recursive:true});
  mkdirSync(join(fixture,'dist','assets','yk-perf-images'),{recursive:true});
  mkdirSync(join(fixture,'dist','study'),{recursive:true});
  cpSync(join(source,'assets/yk-perf-image-manifest.json'),join(fixture,'assets/yk-perf-image-manifest.json'));
  const manifest=JSON.parse(readFileSync(join(fixture,'assets/yk-perf-image-manifest.json'),'utf8'));
  for(const image of manifest.assets){
    cpSync(join(source,image.optimized.slice(1)),join(fixture,'dist',image.optimized.slice(1)));
    // If the baseline original images are available, verify image conversion too.
    const original=join(source,image.source.slice(1));
    if(existsSync(original))cpSync(original,join(fixture,'dist',image.source.slice(1)));
  }
  const cssA='body{color:#fff}';const cssB='.x{margin:0}';
  writeFileSync(join(fixture,'dist/assets/one.css'),cssA);
  writeFileSync(join(fixture,'dist/assets/two.css'),cssB);
  const image=manifest.assets[0];
  const html=`<!doctype html><html><head><link rel="stylesheet" href="/assets/one.css"><link rel="stylesheet" href="/assets/two.css"></head><body><h1 id="yk82Title">Lessons</h1><a href="#yk82Title">Explore Lessons</a><img alt="hero" src="/assets/hero.jpg"><img alt="logo" src="/assets/logo.jpg"><img alt="extra" src="/assets/extra.jpg"><img alt="photo" src="${image.source}"><iframe src="https://example.com/video"></iframe><script>const preserved = '<img src="${image.source}">';</script></body></html>`;
  const keepLinks=[
    '<link rel="stylesheet" href="/assets/yk-ui-preferences.css?v=1">',
    '<link rel="stylesheet" href="/assets/yk-page-transitions-v7875.css?v=7875native2">',
    '<link disabled rel="stylesheet" href="/assets/one.css">',
    '<link media="print" rel="stylesheet" href="/assets/two.css">'
  ];
  for (const filename of ['yk-ui-preferences.css','yk-page-transitions-v7875.css'])
    writeFileSync(join(fixture,'dist/assets',filename),cssA);
  const rawHead='<script>const example=\'<link rel="stylesheet" href="/assets/one.css"><link rel="stylesheet" href="/assets/two.css">\';</script>';
  const rawBody=`<!-- <img src="${image.source}"> --><template><img src="${image.source}"></template>`;
  const priority='<img fetchpriority="high" src="/assets/cover.jpg">';
  const dataOnly=`data-src="${image.source}" src="/assets/placeholder.jpg"`;
  const input=html.replace('</head>',keepLinks.join('')+rawHead+'</head>')
                  .replace('</body>',rawBody+priority+'<img '+dataOnly+'></body>');
  writeFileSync(join(fixture,'dist/index.html'),input);
  writeFileSync(join(fixture,'dist/study/jlpt-learning.html'),input);
  const run=()=>spawnSync(process.execPath,[join(source,'scripts/build-v7880-performance.mjs')],{cwd:fixture,encoding:'utf8'});
  let res=run();assert.equal(res.status,0,res.stderr);
  let after=readFileSync(join(fixture,'dist/index.html'),'utf8');
  for (const literal of [...keepLinks,rawHead,rawBody,priority,dataOnly])
    assert(after.includes(literal),'Preserve UI stylesheet contracts, raw markup and priority images: '+literal);
  const matches=[...after.matchAll(/href="\/assets\/yk-perf-([\w-]+)\.css"/g)];
  assert.equal(matches.length,1,'CSS link should be combined to one');
  const path=join(fixture,'dist/assets',`yk-perf-${matches[0][1]}.css`);
  const output=readFileSync(path,'utf8');
  assert(output.indexOf(cssA)>=0 && output.indexOf(cssB)>output.indexOf(cssA),'CSS order must be unchanged');
  assert(after.includes('href="#yk82Title"'),'Explore Lessons href unchanged');
  assert(after.includes(`const preserved = '<img src="${image.source}">'`),'JavaScript text must be byte-preserved');
  assert(after.includes('loading="lazy"'),'Lazy image/iframe should be enabled');
  if(existsSync(join(fixture,'dist',image.source.slice(1))))assert(after.includes(image.optimized),'Known image should be replaced');
  const report=JSON.parse(readFileSync(join(fixture,'dist/yk-performance-build-report.json')));
  assert.equal(report.css_original_links,4);
  assert.equal(report.css_bundled_links,2);
  res=run();assert.notEqual(res.status,0,'Double operation must be blocked');
  assert.equal(readFileSync(join(fixture,'dist/index.html'),'utf8'),after,'Blocked repeat must not mutate HTML');
  assert.equal(readdirSync(join(fixture,'dist/assets')).filter(x=>x.startsWith('yk-perf-')&&x.endsWith('.css')).length,1,'Identical bundles should deduplicate');
  console.log('PASS performance QA: CSS order, image fingerprint, lazy loading, JS untouched, links, dedupe, idempotency');
}finally{rmSync(fixture,{recursive:true,force:true})}
