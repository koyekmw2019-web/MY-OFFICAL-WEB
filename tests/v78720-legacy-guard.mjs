/** v7.87.20 synthetic test of targeted legacy SW expectation upgrades.
 * The historical tests remain fully executable; only obsolete revision label
 * assertions and the old unknown-length image response fixture are changed.
 */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,copyFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const root=resolve(),tmp=mkdtempSync(join(tmpdir(),'yk-v78720-oldtests-'));
const files={
 'v7841-performance-safety.mjs':"const pass=()=>assert(read('service-worker.js').includes('v7841-slim'));\n",
 'v7863-all-exams-performance.mjs':"const x=()=>assert(['v7863-all-exams','v7864-jlpt-menu'].some(v=>read('service-worker.js').includes(v)));\n",
 'v780-service-worker.mjs':"const fetch=()=>{const response=new Response('public',{status:200});return response;};\n"
};
try{
 mkdirSync(join(tmp,'tests'));mkdirSync(join(tmp,'scripts'));
 writeFileSync(join(tmp,'package.json'),JSON.stringify({version:'7.87.20'}));
 copyFileSync(join(root,'scripts/v7872-qa-version-guards.mjs'),join(tmp,'scripts/v7872-qa-version-guards.mjs'));
 for(const [name,text] of Object.entries(files))writeFileSync(join(tmp,'tests',name),text);
 const run=()=>spawnSync(process.execPath,['scripts/v7872-qa-version-guards.mjs'],{cwd:tmp,encoding:'utf8'});
 let res=run();assert.equal(res.status,0,res.stderr+'\n'+res.stdout);
 assert.match(res.stdout,/legacy SW expectations updated: 3/);
 assert(readFileSync(join(tmp,'tests/v7841-performance-safety.mjs'),'utf8').includes('yk-official-v7-87-20'));
 assert(readFileSync(join(tmp,'tests/v7863-all-exams-performance.mjs'),'utf8').includes('yk-official-v7-87-20'));
 const v780=readFileSync(join(tmp,'tests/v780-service-worker.mjs'),'utf8');
 assert(v780.includes('content-length')&&v780.includes('image/jpeg'));
 res=run();assert.equal(res.status,0,'Idempotent legacy test update required');
 assert.match(res.stdout,/legacy SW expectations updated: 0/);
 console.log('PASS v78720-legacy-guard: three old SW assertions updated exactly once, without changing other test logic');
}finally{rmSync(tmp,{recursive:true,force:true})}
