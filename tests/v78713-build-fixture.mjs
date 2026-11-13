/** Unit-integration test of the isolated PUBLIC output transformer, not a full site build. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve();const folder=mkdtempSync(join(tmpdir(),'yk-v78713-fixture-'));
const dist=join(folder,'dist');
const routes=['index.html','video-class.html','study/jlpt-learning.html','study/jlpt-grammar-library.html',
 ...['truck','taxi','bus'].map(x=>`study/ssw-${x}.html`),
 'admin-dashboard.html','student-dashboard.html','member-dashboard.html','login.html','mock-exams.html',
 ...['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'].map(x=>'exams/'+x+'.html')];
function put(p,c){const x=join(folder,p);mkdirSync(dirname(x),{recursive:true});writeFileSync(x,c);}
try{
 // A real PNG signature/header is sufficient for deterministic intrinsic-size detection.
 const png=Buffer.alloc(32);Buffer.from('89504e470d0a1a0a','hex').copy(png);png.writeUInt32BE(13,8);png.write('IHDR',12);png.writeUInt32BE(320,16);png.writeUInt32BE(160,20);
 put('dist/assets/test.png',png);
 const real='<img src="/assets/test.png" loading="lazy">';
 const inline="<script>const untouched = '<img src=\"/assets/test.png\">';</script>";
 for(const route of routes){
  const i18n=route==='index.html'||route.startsWith('exams/')?'<script defer src="/assets/yk-v78712-i18n.js"></script>':'';
  const crm=route==='admin-dashboard.html'?'<script defer src="/assets/yk-v7878-admin.js"></script>':'';
  const grammar=route==='study/jlpt-grammar-library.html'?'<script defer src="/assets/yk-v7879-grammar.js"></script>':'';
  const exam=route.startsWith('exams/')?`<div data-exam-v728="${route.slice(6,-5)}"></div><script id="v728-online-exam-system-js">/* fixture only */</script>`:'';
  put('dist/'+route,`<!doctype html><html><head><title>${route}</title><link rel="stylesheet" href="/assets/test.css"></head><body>${real}${inline}${i18n}${crm}${grammar}${exam}</body></html>`);
 }
 for(const file of ['yk-v78712-i18n.js','yk-v7878-admin.js','yk-v7879-grammar.js','test.css'])put('dist/assets/'+file,'/* static fixture */');
 for(const level of ['n1','n2','n3','n4','n5'])put('dist/assets/yk-v7879-grammar-'+level+'.json','{"items":[]}');
 copyFileSync('service-worker.js',join(folder,'service-worker.js'));
 const run=spawnSync(process.execPath,[join(root,'scripts/build-v78713-performance.mjs')],{cwd:folder,encoding:'utf8'});
 assert.equal(run.status,0,run.stderr+'\n'+run.stdout);
 const page=readFileSync(join(dist,'index.html'),'utf8');
 assert.match(page,/<img src="\/assets\/test.png" loading="lazy" decoding="async" width="320" height="160">/);
 assert(page.includes(inline),'Never modify HTML-like strings inside JavaScript');
 assert(!page.includes('height="160"<script>'),'Malformed markup');
 const video=readFileSync(join(dist,'video-class.html'),'utf8');assert(video.includes('decoding="async"'));
 assert(readFileSync(join(dist,'service-worker.js'),'utf8').includes('yk-official-v7-87-20'));
 const report=JSON.parse(run.stdout);assert.equal(report.publicPagesProtected,24);
 assert.equal(report.imageMarkup.length,7);assert.equal(report.imageMarkup[0].ratioPreserved,1);
 const gate=spawnSync(process.execPath,[join(root,'tests/v78713-release.mjs')],{cwd:folder,encoding:'utf8'});
 assert.equal(gate.status,0,gate.stderr+'\n'+gate.stdout);
 rmSync(join(dist,'assets/test.css'));
 const negative=spawnSync(process.execPath,[join(root,'tests/v78713-release.mjs')],{cwd:folder,encoding:'utf8'});
 assert.notEqual(negative.status,0,'Release gate must block missing CSS references');
 assert(negative.stderr.includes('Missing static JS/CSS requests'),negative.stderr);
 console.log('PASS v78713-build-fixture: 24-page HTML metadata, inline JS preservation, positive release gate & missing CSS negative test (synthetic fixture only)');
}finally{rmSync(folder,{recursive:true,force:true});}
