/** v7.87.15 static privacy + cumulative build integration. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const r=p=>readFileSync(p,'utf8');const pkg=JSON.parse(r('package.json'));
assert(['7.87.15','7.87.16','7.87.17','7.87.18','7.87.19','7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version));
assert(pkg.scripts.build.includes('build-v78714-grammar-mastery.mjs && node tests/v78714-release.mjs && node scripts/build-v78715-smart-weakness.mjs && node tests/v78715-release.mjs'));
assert(pkg.scripts.test.includes('tests/v78715-engine.mjs')&&pkg.scripts.test.includes('tests/v78715-source.mjs'));
for(const f of ['study/jlpt-grammar-insights.html','assets/yk-v78715-insights.js','assets/yk-v78715-insights-engine.js','assets/yk-v78715-tracker.js','assets/yk-v78715-insights.css','assets/yk-v78715-student.js','assets/yk-v78715-student.css','assets/yk-v78715-link.css','scripts/build-v78715-smart-weakness.mjs','tests/v78715-engine.mjs','tests/v78715-release.mjs'])assert(existsSync(f),f);
const tracker=r('assets/yk-v78715-tracker.js'),ins=r('assets/yk-v78715-insights.js'),student=r('assets/yk-v78715-student.js');
assert(r('assets/yk-v78714-practice.js').includes("recordInsightEvent({id:q.id,correct:correct===true,method:revealed?'self'"));
for(const src of [tracker,ins,student])for(const bad of ['/.netlify/functions','exam-attempt-submit','exam-access','getDatabase(','YKCR_SYNC_SECRET','fetch("https://','XMLHttpRequest'])assert(!src.includes(bad),bad);
assert(student.includes("dataset.dashboard==='student'"));
const page=r('study/jlpt-grammar-insights.html');assert(page.includes('yk815App')&&!page.includes('identity.bundle.js'));
for(const f of ['netlify/functions/_shared/exam-autosave.mts','netlify/functions/yk-business-growth.mts','netlify/functions/yk-enrollment-crm.mts'])assert(existsSync(f),'Missing previous backend: '+f);
console.log('PASS v78715-source: version chain, new files, student-only role, no backend or personal data network requests');
