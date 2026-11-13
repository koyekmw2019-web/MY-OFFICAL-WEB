/** Isolated synthetic public-dist fixture. NOT the real production build. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,copyFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(),folder=mkdtempSync(join(tmpdir(),'yk-v78716-fixture-'));
const put=(file,data)=>{const p=join(folder,'dist',file);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,data)};
try{
 for(const f of ['study/jlpt-grammar-insights.html','study/jlpt-grammar-practice.html','study/jlpt-study-calendar.html',
  'assets/yk-v78714-engine.js','assets/yk-v78714-practice.js','assets/yk-v78715-insights.js','assets/yk-v78715-insights-engine.js',
  'assets/yk-v78715-tracker.js','assets/yk-v78715-insights.css','assets/yk-v78715-link.css','assets/yk-v78715-student.js',
  'assets/yk-v78715-student.css','assets/yk-v78716-calendar-engine.js','assets/yk-v78716-calendar.js','assets/yk-v78716-calendar.css',
  'assets/yk-v78716-student.js','assets/yk-v78716-student.css','assets/yk-v78716-link.css']){
  const p=join(folder,'dist',f);mkdirSync(dirname(p),{recursive:true});copyFileSync(join(root,f),p);
 }
 put('study/jlpt-grammar-library.html','<!doctype html><html><head></head><body><div id="yk879App"></div></body></html>');
 put('study/jlpt-learning.html','<!doctype html><html><head></head><body><button id="yk82DailyShortcut">Daily</button></body></html>');
 put('student-dashboard.html','<!doctype html><html><head></head><body data-dashboard="student"><div id="dashboardBody"><section id="yk814Student"></section></div><script type="module" src="/assets/yk-v78714-student.js"></script></body></html>');
 put('admin-dashboard.html','<!doctype html><html><head></head><body data-dashboard="admin"></body></html>');
 put('member-dashboard.html','<!doctype html><html><head></head><body data-dashboard="member"></body></html>');
 const run=(file)=>spawnSync(process.execPath,[join(root,file)],{cwd:folder,encoding:'utf8'});
 for(const f of ['scripts/build-v78715-smart-weakness.mjs','tests/v78715-release.mjs','scripts/build-v78716-study-calendar.mjs','tests/v78716-release.mjs']){
  const x=run(f);assert.equal(x.status,0,`${f}\n${x.stdout}\n${x.stderr}`);
 }
 assert(readFileSync(join(folder,'dist/student-dashboard.html'),'utf8').includes('yk-v78716-student.js'));
 assert(!readFileSync(join(folder,'dist/admin-dashboard.html'),'utf8').includes('yk-v78716-student'));
 assert(!readFileSync(join(folder,'dist/member-dashboard.html'),'utf8').includes('yk-v78716-student'));
 rmSync(join(folder,'dist/assets/yk-v78716-calendar-engine.js'));
 assert.notEqual(run('tests/v78716-release.mjs').status,0,'Missing planner engine must block release');
 console.log('PASS v78716-build-fixture: prior v7.87.15 builder, additive calendar integration, role isolation, missing-asset release rejection');
}finally{rmSync(folder,{recursive:true,force:true})}
