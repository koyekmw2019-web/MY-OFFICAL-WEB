/** A synthetic fixture is NOT a real Netlify deploy preview or complete repo. */
import assert from 'node:assert/strict';
import {mkdtempSync,copyFileSync,writeFileSync,readFileSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join,resolve,dirname} from 'node:path';import {spawnSync} from 'node:child_process';
const root=resolve(),dir=mkdtempSync(join(tmpdir(),'yk-v7881-fixture-'));
const copy=p=>{const to=join(dir,p);mkdirSync(dirname(to),{recursive:true});copyFileSync(join(root,p),to)};
try{
 copy('scripts/build-v7881-second-exam.mjs');copy('scripts/yk-v7881-nishu-page.html');
 for(const p of ['yk-v7881-nishu.css','yk-v7881-nishu.js','yk-v7881-nishu-questions.json','yk-v7881-nishu-book-cover.jpg',...['crosswalk','taxi','bus','rain','junction'].map(x=>`yk-v7881-scene-${x}.svg`)])copy('assets/'+p);
 const cards=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n1','jlpt_n2','jlpt_n3','jlpt_n4','jlpt_n5'].map(t=>`<article class="exam-category"><button data-exam-v728="${t}">${t}</button></article>`).join('');
 mkdirSync(join(dir,'dist'));writeFileSync(join(dir,'dist/mock-exams.html'),`<!doctype html><html><head></head><body>${cards}</body></html>`);
 const run=()=>spawnSync(process.execPath,[join(dir,'scripts/build-v7881-second-exam.mjs')],{cwd:dir,encoding:'utf8'});
 const out=run();assert.equal(out.status,0,out.stderr+out.stdout);
 const html=readFileSync(join(dir,'dist/mock-exams.html'),'utf8');
 const car=html.indexOf('data-exam-v728="car"'),second=html.indexOf('id="yk7881-second-license-card"'),bike=html.indexOf('data-exam-v728="motorcycle"');
 assert(car<second&&second<bike);assert.equal((html.match(/data-exam-v728=/g)||[]).length,12);
 assert(existsSync(join(dir,'dist/exams/nishu.html')));
 assert(!existsSync(join(dir,'dist/netlify')));
 assert(!existsSync(join(dir,'dist/assets/nishu-key-v7881.mts')));
 assert.notEqual(run().status,0,'Duplicate post-build must fail closed');
 console.log('PASS v7881-build-fixture: card immediately below car, new route, 12 inherited exam controls preserved, no private key leakage, idempotence guard');
}finally{rmSync(dir,{recursive:true,force:true})}
