/** Synthetic fixture for v7.87.15 public build integration and negative release. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,copyFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(),folder=mkdtempSync(join(tmpdir(),'yk-v78715-fixture-'));
const put=(path,data)=>{const p=join(folder,path);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,data)};
try{
 const files=['study/jlpt-grammar-insights.html','study/jlpt-grammar-practice.html','assets/yk-v78714-engine.js','assets/yk-v78714-practice.js',
  'assets/yk-v78715-insights.js','assets/yk-v78715-insights-engine.js','assets/yk-v78715-tracker.js',
  'assets/yk-v78715-insights.css','assets/yk-v78715-link.css','assets/yk-v78715-student.js','assets/yk-v78715-student.css'];
 for(const f of files){const p=join(folder,'dist',f);mkdirSync(dirname(p),{recursive:true});copyFileSync(join(root,f),p)}
 put('dist/study/jlpt-grammar-library.html','<!doctype html><html><head></head><body><div id="yk879App"></div></body></html>');
 put('dist/student-dashboard.html','<!doctype html><html><head></head><body data-dashboard="student"><div id="dashboardBody"><div id="yk814Student"></div></div><script type="module" src="/assets/yk-v78714-student.js"></script></body></html>');
 put('dist/admin-dashboard.html','<!doctype html><html><head></head><body data-dashboard="admin"></body></html>');
 put('dist/member-dashboard.html','<!doctype html><html><head></head><body data-dashboard="member"></body></html>');
 const ok=spawnSync(process.execPath,[join(root,'scripts/build-v78715-smart-weakness.mjs')],{cwd:folder,encoding:'utf8'});
 assert.equal(ok.status,0,ok.stderr+'\n'+ok.stdout);
 const good=spawnSync(process.execPath,[join(root,'tests/v78715-release.mjs')],{cwd:folder,encoding:'utf8'});
 assert.equal(good.status,0,good.stderr+'\n'+good.stdout);
 assert(readFileSync(join(folder,'dist/student-dashboard.html'),'utf8').includes('yk-v78715-student.js'));
 assert(!readFileSync(join(folder,'dist/admin-dashboard.html'),'utf8').includes('yk-v78715-student.js'));
 assert(existsSync(join(folder,'dist/assets/yk-v78715-insights-engine.js')));
 rmSync(join(folder,'dist/assets/yk-v78715-insights-engine.js'));
 const bad=spawnSync(process.execPath,[join(root,'tests/v78715-release.mjs')],{cwd:folder,encoding:'utf8'});
 assert.notEqual(bad.status,0,'Missing analysis engine must block release');
 console.log('PASS v78715-build-fixture: positive integration, role separation, missing dependency blocks release');
}finally{rmSync(folder,{recursive:true,force:true})}
