/** v7.88.1 RC1 — deterministic, guarded backend integration for SECOND-CLASS exam.
 * Apply to the COMPLETE original checkout after overlaying cumulative PATCH.
 * No Netlify deployment, database access, HTTP, or data deletions.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
function replaceFile(path, changes){
 assert(existsSync(path),`Full checkout missing ${path}; refusing partial integration`);
 let src=readFileSync(path,'utf8'),count=0;
 for(const [before,after] of changes){
  if(src.includes(after))continue; // idempotent: the old anchor may be a substring of the replacement
  assert(src.includes(before),`Source anchor changed in ${path}: ${before.slice(0,110)}`);
  assert.equal(src.split(before).length-1,1,`Anchor appears more than once ${path}`);
  src=src.replace(before,after);count++;
 }
 if(count)writeFileSync(path,src);
 return {path,edits:count};
}
const results=[];
results.push(replaceFile('netlify/functions/_shared/security.mts',[
 ['"jlpt_n4","jlpt_n5"]);','"jlpt_n4","jlpt_n5","nishu"]);']
]));
results.push(replaceFile('netlify/functions/_shared/exam-autosave.mts',[
 ['car: [50], motorcycle: [50], moped: [30]','car: [50], motorcycle: [50], moped: [30], nishu: [50]'],
 ["WHEN 'car' THEN 50 WHEN 'motorcycle' THEN 50 WHEN 'moped' THEN 30", "WHEN 'car' THEN 50 WHEN 'motorcycle' THEN 50 WHEN 'moped' THEN 30 WHEN 'nishu' THEN 50"],
 ['  moped:{max:48,pass:45,minimumElapsedSeconds:5},','  moped:{max:48,pass:45,minimumElapsedSeconds:5},\n  nishu:{max:100,pass:90,minimumElapsedSeconds:5},']
]));
results.push(replaceFile('netlify/functions/exam-access.mts',[
 ["WHEN 'motorcycle' THEN 50 WHEN 'moped' THEN 30 ELSE 80 END", "WHEN 'motorcycle' THEN 50 WHEN 'moped' THEN 30 WHEN 'nishu' THEN 50 ELSE 80 END"]
]));
results.push(replaceFile('netlify/functions/exam-checkpoint.mts',[
 ["const engine=attempt.exam_type.startsWith('jlpt_')?'jlpt':", "const engine=attempt.exam_type==='nishu'?'nishu':\n    attempt.exam_type.startsWith('jlpt_')?'jlpt':"]
]));
results.push(replaceFile('netlify/functions/_shared/exam-score-v763.mts',[
 ["import { key } from './exam-answer-key-v763.mts';", "import { key } from './exam-answer-key-v763.mts';\nimport { scoreNishuSnapshot } from './nishu-scoring-v7881.mjs';"],
 [" if(['car','motorcycle','moped'].includes(type)){", " if(type==='nishu')return scoreNishuSnapshot(s);\n if(['car','motorcycle','moped'].includes(type)){"]
]));

console.log(JSON.stringify({version:'7.88.1-rc.1',kind:'source_backend_patch',changes:results,allFilesFound:true},null,2));
