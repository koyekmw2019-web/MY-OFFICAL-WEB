/** v7.87.13 patch-level source and policy regression; full deploy not simulated. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
assert(['7.87.13','7.87.14','7.87.15','7.87.16','7.87.17','7.87.18','7.87.19','7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version));
assert(pkg.scripts.build.includes('node scripts/build-v78713-performance.mjs && node tests/v78713-release.mjs'));
assert(pkg.scripts.build.includes('node scripts/build-v78712-i18n.mjs && node tests/v78712-release.mjs'));
assert(pkg.scripts.test.includes('node tests/v78713-static.mjs'));
assert(pkg.scripts.build.startsWith('node scripts/preflight-v78713.mjs &&'));
for(const p of ['assets/yk-v7879-grammar-n1.json','assets/yk-v7879-grammar-n2.json',
'assets/yk-v7879-grammar-n3.json','assets/yk-v7879-grammar-n4.json','assets/yk-v7879-grammar-n5.json',
'netlify/functions/yk-enrollment-crm.mts','netlify/functions/yk-business-growth.mts',
'netlify/functions/_shared/exam-autosave.mts','netlify/database/migrations/20261112090000_yk_growth_analytics.sql',
'netlify/database/migrations/20261112140000_yk_enrollment_crm.sql',
'assets/yk-v78712-i18n.js'])assert(existsSync(p),p);
const sw=read('service-worker.js');
for(const t of ["yk-official-v7-87-20","request.mode === 'navigate'",
"url.pathname.startsWith('/.netlify/')", "url.pathname.startsWith('/api/')",'response.headers.has(\'set-cookie\')',
'yk-v7879-grammar-n[1-5]', 'MAX_CACHE_BYTES'])assert(sw.includes(t),t);
assert(!sw.includes('precache('),'No eager/static precaching on install');
const builder=read('scripts/build-v78713-performance.mjs');
assert(builder.includes('copyFileSync(\'service-worker.js\''));
assert(builder.includes('improveHtml')&&builder.includes('intrinsicSize'));
assert(!builder.includes('netlify/functions/exam-access.mts'),'No exam access code rewrite');
const preflight=read('scripts/preflight-v78713.mjs');
assert(preflight.includes('This ZIP is a cumulative PATCH'));
const counts={n5:35,n4:75,n3:135,n2:137,n1:127};
let total=0;
for(const [n,count] of Object.entries(counts)){
 const d=JSON.parse(read(`assets/yk-v7879-grammar-${n}.json`));assert.equal(d.items.length,count);
 assert(d.items.every(x=>x.examples.length===2),n);total+=d.items.length;
}
assert.equal(total,509);
const exam=read('netlify/functions/_shared/exam-autosave.mts');
assert(exam.includes("EXAM_FREE_POLICY = 'ONE_PER_EXAM_TYPE'"));
console.log('PASS v78713-static: patch chain, all 509 grammar records, previous API/schema retained, SW no private caching, full source preflight present');
