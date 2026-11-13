/** Minimal public dist fixture, never equated to real repository build. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,copyFileSync,readFileSync,rmSync,unlinkSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const origin=resolve(),tmp=mkdtempSync(join(tmpdir(),'yk-v78717-fixture-'));
const put=(name,contents)=>{const path=join(tmp,'dist',name);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,contents)};
const run=name=>spawnSync(process.execPath,[join(origin,name)],{cwd:tmp,encoding:'utf8'});
try{
 const base='<!doctype html><html><head><title>Fixture</title></head>';
 put('admin-dashboard.html',base+'<body data-dashboard="admin"><main id="dashboardBody"><section id="adminStats">Admin stats</section></main><script src="/assets/yk-v7877-growth.js?v=7877"></script><script src="/assets/yk-v7878-admin.js?v=7878"></script></body></html>');
 for(const page of ['student-dashboard.html','member-dashboard.html'])put(page,base+`<body data-dashboard="${page.startsWith('student')?'student':'member'}"><div id="dashboardBody"></div></body></html>`);
 for(const page of ['index.html','mock-exams.html'])put(page,base+'<body>Test fixture</body></html>');
 for(const asset of ['assets/yk-v78717-admin.js','assets/yk-v78717-admin.css','assets/yk-v7878-admin.js','assets/yk-v7878-admin.css']){
  const dest=join(tmp,'dist',asset);mkdirSync(dirname(dest),{recursive:true});copyFileSync(join(origin,asset),dest);
 }
 for(const source of ['netlify/functions/yk-enrollment-insights.mts','netlify/functions/_shared/yk-crm-insights-v78717.mjs',
  'netlify/database/migrations/20261112140000_yk_enrollment_crm.sql']){
  const dest=join(tmp,source);mkdirSync(dirname(dest),{recursive:true});copyFileSync(join(origin,source),dest);
 }
 let result=run('scripts/build-v78717-marketing-crm.mjs');assert.equal(result.status,0,result.stderr);
 result=run('tests/v78717-release.mjs');assert.equal(result.status,0,result.stderr);
 const admin=readFileSync(join(tmp,'dist/admin-dashboard.html'),'utf8');
 assert.equal((admin.match(/yk-v78717-admin\.js/g)||[]).length,1);
 result=run('scripts/build-v78717-marketing-crm.mjs');assert.notEqual(result.status,0,'Double-build must be blocked');
 unlinkSync(join(tmp,'dist/assets/yk-v78717-admin.css'));
 result=run('tests/v78717-release.mjs');assert.notEqual(result.status,0,'Missing public CSS must block release');
 assert(!readFileSync(join(tmp,'dist/student-dashboard.html'),'utf8').includes('yk-v78717-'));
 console.log('PASS v78717-build-fixture: admin-only build, duplicate prevention and missing CSS gate');
}finally{rmSync(tmp,{recursive:true,force:true})}
