/** STUDYING WITH YE KUN — v7.87.6 UI Fix05 regression (standalone source/fixture).
 * Run: node tests/v7876-ui-fix05.mjs [--release]
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,mkdirSync,writeFileSync,cpSync,mkdtempSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const read=path=>readFileSync(path,'utf8');
const builder=read('scripts/build-page-transitions-v7875.mjs');
const injector=read('scripts/build-v7876-jlpt-ui-fix05.mjs');
const css=read('assets/yk88-jlpt-ui-fix05.css');
const js=read('assets/yk88-jlpt-ui-fix05.js');
const fix04="await import('./build-v7876-jlpt-tabs-fix04.mjs')";
const fix05="await import('./build-v7876-jlpt-ui-fix05.mjs')";
assert.equal(builder.split(fix05).length-1,1,'Fix05 import must occur once');
assert(builder.indexOf(fix04)<builder.indexOf(fix05),'Fix05 must follow Fix04');
assert(css.includes('a.yk821-hub-open[href="/study/jlpt-learning.html"]'),'Homepage learning CTA must be scoped');
assert(css.includes('body.yk82-page .yk82-top-links {display:none !important;}'),'Redundant header links not hidden');
assert(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),'Three same-row detail actions required');
assert(js.includes('group.append(back)') && js.includes("#yk88Bookmark") && js.includes("#yk88Learned"),'Existing action controls must be preserved');
assert(!js.includes('preventDefault()') && !js.includes('location.href='),'Do not override existing routes');
for (const blocked of ['netlify/database','netlify/functions','fetch(', 'checkout(', 'localStorage','sessionStorage','supabase'])
  assert(!js.includes(blocked) && !injector.includes(blocked),`No backend/state handling: ${blocked}`);
const root=mkdtempSync(join(tmpdir(),'yk-v7876-ui-fix05-'));
try {
  const dist=join(root,'dist');
  mkdirSync(join(dist,'study'),{recursive:true});
  mkdirSync(join(dist,'assets'),{recursive:true});
  cpSync('assets/yk88-jlpt-ui-fix05.css',join(dist,'assets/yk88-jlpt-ui-fix05.css'));
  cpSync('assets/yk88-jlpt-ui-fix05.js',join(dist,'assets/yk88-jlpt-ui-fix05.js'));
  const fixture={
    'index.html':'<!doctype html><html><head></head><body><a class="yk821-hub-open" href="/study/jlpt-learning.html">Open All Lessons ↗</a><span>yk88-index-ux.css</span></body></html>',
    'study/jlpt-learning.html':'<!doctype html><html><head><link href="/assets/yk88-jlpt-tabs-fix04.css?v=7876fix04" rel="stylesheet"></head><body class="yk82-page"><nav class="yk82-top-links">Study Hub</nav><h2 id="yk82Title">Lessons</h2></body></html>',
    'study/jlpt-grammar-detail.html':'<!doctype html><html><head></head><body class="yk82-page yk88-detail-page"><nav><a id="yk88BackTop" href="#">Grammar</a></nav><article id="yk88GrammarDetail"></article><script defer src="/assets/yk88-grammar-detail.js?v=7876fix03"></script></body></html>'
  };
  for(const [path,content] of Object.entries(fixture)) writeFileSync(join(dist,path),content);
  const script=resolve('scripts/build-v7876-jlpt-ui-fix05.mjs');
  const run=()=>spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8'});
  let result=run();
  assert.equal(result.status,0,'Fixture builder must PASS: '+result.stderr);
  for(const path of Object.keys(fixture)){
    const html=read(join(dist,path));
    assert.equal(html.split('yk88-jlpt-ui-fix05.css?v=7876ui05').length-1,1,`${path}: CSS once`);
    assert(!html.includes('style="display:none"'),'Do not remove navigation DOM');
    assert.equal(html.split('yk88-jlpt-ui-fix05.js?v=7876ui05').length-1,path.includes('grammar-detail')?1:0,'JS must be grammar detail only');
  }
  // Guard: refuse second injection, do not rewrite once patched.
  const before=read(join(dist,'index.html'));
  result=run();
  assert.notEqual(result.status,0,'Second injection must fail closed');
  assert.equal(read(join(dist,'index.html')),before,'Failing injection must not modify homepage');
  // Guard: if one required anchor changes, all pages remain unchanged.
  for(const [path,content] of Object.entries(fixture)) writeFileSync(join(dist,path),content);
  writeFileSync(join(dist,'study/jlpt-learning.html'),fixture['study/jlpt-learning.html'].replace('id="yk82Title"','id="unexpected"'));
  result=run();
  assert.notEqual(result.status,0,'Unexpected baseline change must fail closed');
  assert.equal(read(join(dist,'index.html')),fixture['index.html'],'Failing preflight must not modify homepage');
  if(process.argv.includes('--release')){
    for(const [path,count] of [['dist/index.html',1],['dist/study/jlpt-learning.html',1],['dist/study/jlpt-grammar-detail.html',1]]){
      assert(existsSync(path),'Missing release output '+path);
      const html=read(path);
      assert.equal(html.split('/assets/yk88-jlpt-ui-fix05.css?v=7876ui05').length-1,count,`Release CSS injection incorrect: ${path}`);
    }
  }
  console.log('PASS Fix05: source order, UI-only scope, three-route injection, duplicate/anchor fail-closed, preservation of original control IDs');
}finally{rmSync(root,{force:true,recursive:true});}
