import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join,dirname,resolve} from 'node:path';import {spawnSync} from 'node:child_process';
const root=resolve(),dir=mkdtempSync(join(tmpdir(),'yk-v7881-patch-'));
function put(p,s){const q=join(dir,p);mkdirSync(dirname(q),{recursive:true});writeFileSync(q,s)}
put('netlify/functions/_shared/security.mts',`new Set(["jlpt_n4","jlpt_n5"]);`);
put('netlify/functions/_shared/exam-autosave.mts',`car: [50], motorcycle: [50], moped: [30]\nWHEN 'car' THEN 50 WHEN 'motorcycle' THEN 50 WHEN 'moped' THEN 30\n  moped:{max:48,pass:45,minimumElapsedSeconds:5},`);
put('netlify/functions/exam-access.mts',`WHEN 'motorcycle' THEN 50 WHEN 'moped' THEN 30 ELSE 80 END`);
put('netlify/functions/exam-checkpoint.mts',`const engine=attempt.exam_type.startsWith('jlpt_')?'jlpt':`);
put('netlify/functions/_shared/exam-score-v763.mts',`import { key } from './exam-answer-key-v763.mts';\n if(['car','motorcycle','moped'].includes(type)){`);
const script=join(root,'scripts/patch-v7881-nishu-backend.mjs');
try{
 const run=()=>spawnSync(process.execPath,[script],{cwd:dir,encoding:'utf8'});
 const first=run();assert.equal(first.status,0,first.stderr+first.stdout);
 const second=run();assert.equal(second.status,0,second.stderr+second.stdout);assert(second.stdout.includes('"edits": 0'));
 for(const p of ['netlify/functions/_shared/security.mts','netlify/functions/_shared/exam-autosave.mts','netlify/functions/exam-access.mts','netlify/functions/exam-checkpoint.mts','netlify/functions/_shared/exam-score-v763.mts'])assert(readFileSync(join(dir,p),'utf8').includes('nishu'),p);
 writeFileSync(join(dir,'netlify/functions/exam-checkpoint.mts'),'changed upstream without anchor');
 const third=run();assert.notEqual(third.status,0,'An unexpected source change MUST fail closed');
 console.log('PASS v7881-patcher: guarded source integration, safe second run, upstream anchor drift blocks release');
}finally{rmSync(dir,{recursive:true,force:true})}
