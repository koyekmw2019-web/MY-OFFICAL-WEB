/** Cumulative v7.87.20 source guard; previous features retained. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const pkg=JSON.parse(readFileSync('package.json','utf8'));
assert(['7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version),'Unexpected version; v7.87.20 runtime guard must remain active');
for(const [key,pieces] of Object.entries({
 build:['tests/v78719-release.mjs','scripts/build-v78720-mobile-pwa.mjs','tests/v78720-release.mjs'],
 test:['tests/v78719-backend.mock.mjs','tests/v78720-sw-runtime.mjs','tests/v78720-source.mjs','tests/v78720-build-fixture.mjs'],
 'verify:release':['tests/v78719-release.mjs','tests/v78720-release.mjs']
}))for(const k of pieces)assert(pkg.scripts[key].includes(k),'Missing chain '+key+' '+k);
const sw=readFileSync('service-worker.js','utf8');
for(const s of ['yk-official-v7-87-20','MAX_CACHE_BYTES','request.mode === \'navigate\'','url.pathname.startsWith(\'/.netlify/\')','textRefreshes','response.headers.has(\'set-cookie\')'])assert(sw.includes(s),'SW protection '+s);
const builder=readFileSync('scripts/build-v78720-mobile-pwa.mjs','utf8');
assert(builder.includes('htmlFilesChanged')&&builder.includes('role\',\'button')&&builder.includes('ykv'));
for(const p of ['assets/yk-v78720-mobile-fixes.css','assets/yk-v78718-exam-access.css',
'assets/yk-v78714-engine.js','assets/yk-v78715-insights-engine.js','assets/yk-v78716-calendar-engine.js',
'netlify/functions/_shared/exam-autosave.mts', 'netlify/functions/exam-student-verify.mts',
'netlify/functions/exam-payment-submit.mts','netlify/functions/yk-system-health.mts',
'netlify/functions/yk-enrollment-insights.mts','netlify/functions/yk-business-growth.mts',
'netlify/database/migrations/20261112090000_yk_growth_analytics.sql',
'netlify/database/migrations/20261112140000_yk_enrollment_crm.sql'])assert(existsSync(p),'Missing inherited critical source '+p);
let count=0;
for(const [l,n] of [['n5',35],['n4',75],['n3',135],['n2',137],['n1',127]]) {
 const x=JSON.parse(readFileSync(`assets/yk-v7879-grammar-${l}.json`,'utf8'));
 assert.equal(x.items.length,n);count+=x.items.length;
}
assert.equal(count,509);
const exam=readFileSync('netlify/functions/_shared/exam-autosave.mts','utf8');
assert(exam.includes("EXAM_FREE_POLICY = 'ONE_PER_EXAM_TYPE'"));
console.log('PASS v78720-source: cache version, build/test chain, 509 grammar, critical exam/payment/YKCR/CRM sources retained');
