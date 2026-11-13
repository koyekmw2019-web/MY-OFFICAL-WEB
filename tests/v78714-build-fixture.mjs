/** Build integration on synthetic public routes; does NOT substitute for full Netlify build. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve();const workspace=mkdtempSync(join(tmpdir(),'yk-v78714-fixture-'));
function put(p,s){const path=join(workspace,p);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,s)}
try{
 for(const p of ['assets/yk-v78714-engine.js','assets/yk-v78714-practice.js','assets/yk-v78714-practice.css','assets/yk-v78714-choice-bank.json','assets/yk-v78714-student.js','assets/yk-v78714-student.css','assets/yk-v78714-link.css','study/jlpt-grammar-practice.html']){
  const file=join(workspace,'dist',p);mkdirSync(dirname(file),{recursive:true});copyFileSync(join(root,p),file);
 }
 put('dist/study/jlpt-grammar-library.html','<!doctype html><html><head></head><body><div id="yk879App"></div><div class="yk879-summary"></div><script defer src="/assets/yk-v7879-grammar.js"></script></body></html>');
 put('dist/student-dashboard.html','<!doctype html><html><head></head><body data-dashboard="student"><section id="dashboardBody"></section><script defer src="/assets/yk-v7876-journey.js"></script></body></html>');
 put('dist/admin-dashboard.html','<!doctype html><html><head></head><body data-dashboard="admin"></body></html>');
 put('dist/member-dashboard.html','<!doctype html><html><head></head><body data-dashboard="member"></body></html>');
 for(const lv of ['n5','n4','n3','n2','n1'])copyFileSync(join(root,`assets/yk-v7879-grammar-${lv}.json`),join(workspace,`dist/assets/yk-v7879-grammar-${lv}.json`));
 const result=spawnSync(process.execPath,[join(root,'scripts/build-v78714-grammar-mastery.mjs')],{cwd:workspace,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr+'\n'+result.stdout);
 const positive=spawnSync(process.execPath,[join(root,'tests/v78714-release.mjs')],{cwd:workspace,encoding:'utf8'});
 assert.equal(positive.status,0,positive.stderr+'\n'+positive.stdout);
 assert(readFileSync(join(workspace,'dist/student-dashboard.html'),'utf8').includes('yk-v78714-student.js'));
 rmSync(join(workspace,'dist/assets/yk-v78714-practice.js'));
 const negative=spawnSync(process.execPath,[join(root,'tests/v78714-release.mjs')],{cwd:workspace,encoding:'utf8'});
 assert.notEqual(negative.status,0,'Missing practice runtime must block release');
 console.log('PASS v78714-build-fixture: isolated publish pass, Admin/Member exclusion, missing JS negative-release gate');
}finally{rmSync(workspace,{recursive:true,force:true});}
