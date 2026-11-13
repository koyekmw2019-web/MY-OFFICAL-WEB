/** v7.87.21 source-level regression: release QA must not weaken business logic. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
assert(['7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version));
assert(pkg.scripts.test.includes('tests/v78721-fixture.mjs'));
assert(pkg.scripts.build.includes('tests/v78721-release.mjs'));
assert(pkg.scripts['verify:full'].includes('run-v78721-full-qa.mjs'));
assert(read('scripts/run-v78721-full-qa.mjs').includes("'build'"));
for(const path of ['scripts/audit-v78721-release.mjs','scripts/smoke-v78721-preview.mjs','tests/v78721-release.mjs','scripts/run-v78721-full-qa.mjs','scripts/run-v78721-selected.mjs'])assert(existsSync(path),path);
assert(read('service-worker.js').includes('yk-official-v7-87-20'),'No runtime SW change in audit-only release');
const originalBackend=[
 ['netlify/functions/_shared/security.mts',v=>[1000,2000,3000,5000].every(n=>v.includes(': '+n))],
 ['netlify/functions/exam-access.mts',v=>v.includes("reason:'payment_required'")],
 ['netlify/functions/exam-admin-payments.mts',v=>v.includes('requireAdmin()')],
 ['netlify/functions/ykcr-student-sync.mts',v=>v.includes('signatureMatches(')]
];
let availableOriginal=0;
for(const [path,predicate] of originalBackend){if(!existsSync(path))continue;assert(predicate(read(path)),`Backend safety failed: ${path}`);availableOriginal++}
assert(read('netlify/functions/yk-system-health.mts').includes('requireAdmin()'));
const counts=[35,75,135,137,127];let examples=0;for(const [i,lv] of ['n5','n4','n3','n2','n1'].entries()) {const list=JSON.parse(read(`assets/yk-v7879-grammar-${lv}.json`)).items;assert.equal(list.length,counts[i]);examples+=list.reduce((n,x)=>n+x.examples.length,0)}assert.equal(examples,1018);
console.log(`PASS v78721-source: QA wiring, admin health, 509 grammar and audit-only release; original baseline backend checks ${availableOriginal}/4 present (full checkout required for missing)`);
