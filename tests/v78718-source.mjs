import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const pkg=JSON.parse(readFileSync('package.json','utf8'));
assert(['7.87.18','7.87.19','7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version));
for(const file of ['scripts/build-v78718-exam-access-copy.mjs','assets/yk-v78718-exam-access.css',
 'tests/v78718-release.mjs','tests/v78718-build-fixture.mjs','tests/v78718-source.mjs'])assert(existsSync(file),'Missing release file: '+file);
assert(pkg.scripts.build.includes('node scripts/build-v78718-exam-access-copy.mjs && node tests/v78718-release.mjs'));
assert(pkg.scripts.test.includes('tests/v78718-source.mjs')&&pkg.scripts.test.includes('tests/v78718-build-fixture.mjs'));
const js=readFileSync('scripts/build-v78718-exam-access-copy.mjs','utf8');
assert(js.includes('one free attempt per account')&&js.includes('စာမေးပွဲအမျိုးအစားတစ်ခုစီကို အခမဲ့ ၁ ကြိမ်'));
for(const x of [1000,2000,3000,5000])assert(js.includes('price:'+x),'Missing unchanged plan price '+x);
assert(!js.includes('getDatabase(')&&!js.includes('exam-attempt-submit')&&!js.includes('fetch('),'No backend mutations');
for(const path of ['netlify/functions/_shared/exam-autosave.mts',
 'netlify/functions/yk-enrollment-crm.mts','netlify/functions/yk-business-growth.mts',
 'assets/yk-v7879-grammar-n1.json','assets/yk-v78716-calendar.js','assets/yk-v78717-admin.js'])assert(existsSync(path),'Missing previous cumulative code '+path);
console.log('PASS v78718-source: cumulative build, exact per-exam policy, no backend/learning changes');
