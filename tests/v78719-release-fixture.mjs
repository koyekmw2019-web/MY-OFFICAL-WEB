/** v7.87.19: positive and deliberately broken POST-BUILD fixtures.
 * A synthetic route gate test, NOT the real full repository build. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve();const tmp=mkdtempSync(join(tmpdir(),'yk-v78719-release-'));
const exams=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const write=(p,s)=>{const f=join(tmp,'dist',p);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,s);};
const run=()=>spawnSync(process.execPath,[join(root,'tests/v78719-release.mjs')],{cwd:tmp,encoding:'utf8'});
const page=(type)=>`<!doctype html><html><head></head><body>
<!-- v7.87.18: targeted guest / plan copy -->
<div id="examAccessTitleV728"></div><div id="examAccessTextV728"></div>
<div id="examPlanMiniTextV739"></div><button id="examPlansV728"></button>
<script>const notice='one free attempt per account';const PLANS={week:{price:1000},month:{price:2000},months:{price:3000},year:{price:5000}};</script>
<link rel="stylesheet" href="/assets/yk-v78718-exam-access.css">
${type?`<main data-exam-type="${type}"></main>`:''}</body></html>`;
try{
 write('mock-exams.html',page(null));
 for(const type of exams)write('exams/'+type+'.html',page(type));
  // The release gate also audits unchanged server sources in the real checkout.
 for(const key of ['netlify/functions/exam-admin-payments.mts','netlify/functions/ykcr-student-sync.mts','netlify/functions/exam-access.mts']){
   const source=key.includes('exam-admin-payments')?"await requireAdmin(); verifyRequestOrigin(req); FOR UPDATE; BEGIN; COMMIT; p.status !== 'pending';":
     key.includes('ykcr-student-sync')?"signatureMatches( timingSafeEqual( ykcr_sync_events":
       "isFreeUniqueViolation(e) reason:'payment_required'";
   const file=join(tmp,key);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,source);
 }
for(const file of ['assets/yk-v78718-exam-access.css','assets/yk-v78714-engine.js','assets/yk-v78715-insights-engine.js','assets/yk-v78716-calendar-engine.js'])write(file,'fixture');
 let r=run();assert.equal(r.status,0,r.stderr+'\n'+r.stdout);
 const bad=join(tmp,'dist/exams/taxi.html'),old=readFileSync(bad,'utf8');
 write('exams/taxi.html',old.replace('price:3000','price:4444'));
 r=run();assert.notEqual(r.status,0,'Tampered plan pricing must block release');
 write('exams/taxi.html',old);
 write('netlify/functions/exam-student-verify.mts','private!');
 r=run();assert.notEqual(r.status,0,'Published private backend must block release');
 console.log('PASS v78719-release-fixture: 13 valid routes, tampered price blocked, public backend leak blocked (synthetic only)');
}finally{rmSync(tmp,{recursive:true,force:true})}
