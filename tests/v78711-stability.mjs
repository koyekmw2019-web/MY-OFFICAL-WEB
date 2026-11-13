/** v7.87.11 — stable release-candidate safeguards; isolated/offline runtime QA.
 * The real Netlify build, migration and authenticated browser E2E still require
 * a complete checked-out repository and Netlify Deploy Preview.
 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {
  isFreeUniqueViolation,isMissingCheckpointTable,
  EXAM_FREE_POLICY,sectionDurations,examScoreRules,practicePassed
} from '../netlify/functions/_shared/exam-autosave.mts';

const pkg=JSON.parse(readFileSync('package.json','utf8'));
assert(['7.87.11','7.87.12','7.87.13','7.87.14','7.87.15','7.87.16','7.87.17','7.87.18','7.87.19','7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version));
assert(pkg.scripts.test.includes('tests/v78711-stability.mjs'));
assert(pkg.scripts.build.includes('tests/v78710-release.mjs'));
assert.equal(EXAM_FREE_POLICY,'ONE_PER_EXAM_TYPE');
assert.equal(Object.keys(sectionDurations).length,13);
assert.equal(Object.keys(examScoreRules).length,13);
assert.equal(practicePassed('truck',50,{theory:30,practical:20}),true);
assert.equal(practicePassed('truck',40,{theory:25,practical:15}),true);
assert.equal(practicePassed('jlpt_n5',180,[{score:120},{score:60}]),true);
assert.equal(practicePassed('jlpt_n5',180,[{score:120},{score:0}]),false);
assert.equal(practicePassed('jlpt_n5',100,null),false);

const collision={code:'23505',constraint:'exam_one_free_attempt_per_user_type',message:'duplicate key'};
assert(isFreeUniqueViolation(collision));
assert(isFreeUniqueViolation({name:'WaddlerQueryError',message:'Failed query',cause:collision}));
assert(isFreeUniqueViolation({cause:{cause:collision}}));
assert(isFreeUniqueViolation({code:'23505',constraint:'exam_one_free_attempt_per_user'}));
assert(!isFreeUniqueViolation({code:'23505',constraint:'other_free_attempt_per_user_type'}));
assert(!isFreeUniqueViolation({code:'42P01',constraint:'exam_one_free_attempt_per_user_type'}));
assert(!isFreeUniqueViolation({message:'duplicate key value violates unique constraint "exam_one_free_attempt_per_user_type"'}));
assert(!isFreeUniqueViolation(null));
const cyclic={code:'23505',constraint:'some_other_key'};cyclic.cause=cyclic;
assert(!isFreeUniqueViolation(cyclic));
const missing={code:'42P01',message:'relation "exam_attempt_checkpoints" does not exist'};
assert(isMissingCheckpointTable({name:'WaddlerQueryError',cause:missing}));
assert(!isMissingCheckpointTable({cause:{code:'42P01',message:'other relation'}}));

for(const path of ['assets/yk-v7879-grammar.js','assets/yk-v7879-grammar-n5.json','assets/yk-v7879-grammar-n4.json',
  'assets/yk-v7879-grammar-n3.json','assets/yk-v7879-grammar-n2.json','assets/yk-v7879-grammar-n1.json',
  'netlify/functions/yk-business-growth.mts','netlify/functions/yk-growth-event.mts',
  'netlify/functions/yk-enrollment-crm.mts','service-worker.js'])assert(existsSync(path),path);
for(const n of ['n5','n4','n3','n2','n1']){
 const x=JSON.parse(readFileSync(join('assets',`yk-v7879-grammar-${n}.json`),'utf8'));
 assert(x.items.every(i=>i.examples.length===2&&i.examples.every(e=>e.ja.includes(e.highlight)&&e.my&&e.en)));
}

// Verify every non-classifier line matches the original inspected GitHub main.
// Fingerprints computed against main v7.87.4 (2026-11-12 audit).
assert.deepEqual(sectionDurations.nishu,[50]);
assert.equal(examScoreRules.nishu.max,100);
assert.equal(examScoreRules.nishu.pass,90);
assert.equal(practicePassed('nishu',89,null),false);
assert.equal(practicePassed('nishu',90,null),true);
// Remove ONLY the three reviewed additive nishu rules before checking legacy fingerprints.
const autosave=readFileSync('netlify/functions/_shared/exam-autosave.mts','utf8')
 .replace(', nishu: [50]','')
 .replace(" WHEN 'nishu' THEN 50",'')
 .replace('  nishu:{max:100,pass:90,minimumElapsedSeconds:5},\n','');
function fnv(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;}
assert.equal(fnv(autosave.slice(0,autosave.indexOf('export const EXAM_FREE_POLICY'))),628168957,'Exam prelude changed');
assert.equal(fnv(autosave.slice(autosave.indexOf('/** Close any phase expired'))),2210106627,'Timer and scoring rules changed');

const sw=readFileSync('service-worker.js','utf8');
assert(sw.includes("request.mode === 'navigate'"));
assert(sw.includes("url.pathname.startsWith('/.netlify/')"));
const access='netlify/functions/exam-access.mts';
if(existsSync(access)){
 const code=readFileSync(access,'utf8');
 assert(code.includes('isFreeUniqueViolation(e)'));
 assert(code.includes("reason:'payment_required'"));
 assert(code.includes("status:402"));
}
console.log('PASS v78711-stability: wrapped PostgreSQL free-attempt collision recognized, 12 exam rules unchanged, grammar+CRM assets preserved');
