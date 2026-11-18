/** Scoped Phase 1 build guard tests. Do not touch production or repo files. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,cpSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const cwd=resolve('.'),tmp=mkdtempSync(join(tmpdir(),'yk-jlpt-phase1-'));
try{
 mkdirSync(join(tmp,'dist/study'),{recursive:true});
 mkdirSync(join(tmp,'dist/assets'),{recursive:true});
 cpSync(join(cwd,'assets/yk88-jlpt-phase1.css'),join(tmp,'dist/assets/yk88-jlpt-phase1.css'));
 const html=`<!doctype html><html><head><title>JLPT</title></head><body class="yk82-page">
 <header></header><nav id="yk-mobile-nav"></nav>
 <main><div class="yk821-hero-actions"></div>
 <div id="yk82Levels"></div><div id="yk82Stats"></div><h2 id="yk82Title"></h2>
 <div id="yk82Tabs"></div><div id="yk82Content"></div></main>
 <link rel="stylesheet" href="/assets/yk88-jlpt-tabs-fix04.css">
 <link rel="stylesheet" href="/assets/yk88-jlpt-ui-fix05.css">
 <script src="/assets/yk-jlpt-learning-v782-page.js?v=7880rc1audited"></script>
 <script src="/assets/yk-jlpt-learning-v782-state.js?v=7880rc1capacity"></script>
 </body></html>`;
 const p=join(tmp,'dist/study/jlpt-learning.html');
 writeFileSync(p,html);
 const run=()=>spawnSync(process.execPath,[join(cwd,'scripts/build-v7880-jlpt-ui-phase1.mjs')],{cwd:tmp,encoding:'utf8'});
 let res=run();assert.equal(res.status,0,`Injection failed: ${res.stderr}`);
 const patched=readFileSync(p,'utf8');
 const href='/assets/yk88-jlpt-phase1.css?v=7880p1qa01';
 assert.equal(patched.split(href).length-1,1);
 assert.equal(patched.replace(`<link rel="stylesheet" href="${href}">\n`,''),html,'HTML modified beyond one stylesheet link');
 res=run();assert.notEqual(res.status,0,'Second injection must refuse duplication');
 assert.equal(readFileSync(p,'utf8'),patched,'Duplicate guard must leave file unchanged');
 writeFileSync(p,html.replace('id="yk82Stats"','id="wrongStats"'));
 res=run();assert.notEqual(res.status,0,'Missing progress selector must refuse');
 assert.equal(readFileSync(p,'utf8'),html.replace('id="yk82Stats"','id="wrongStats"'));
 const css=readFileSync(join(cwd,'assets/yk88-jlpt-phase1.css'),'utf8');
 assert.match(css,/\.yk82-page:not\(\.yk88-detail-page\)/);
 assert.match(css,/yk82Levels/);assert.match(css,/yk82Stats/);assert.match(css,/yk82Tabs/);
 assert.match(css,/prefers-reduced-motion/);assert.match(css,/data-yk-ui-theme/);
 for(const disallowed of ['exam-access','netlify/functions','ykcr-student-sync','localStorage','fetch(','innerHTML'])
  assert(!css.includes(disallowed),`Unnecessary cross-system reference in CSS: ${disallowed}`);
 console.log('PASS JLPT Phase 1: injection, duplicate guard, missing-anchor guard, source preservation, stylesheet scope');
}finally{rmSync(tmp,{recursive:true,force:true})}
