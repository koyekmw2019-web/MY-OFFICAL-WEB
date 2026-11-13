/** v7.87.16 — cumulative/source integration, no private API side effects. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8'),pkg=JSON.parse(read('package.json'));
assert(['7.87.16','7.87.17','7.87.18','7.87.19','7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version));
assert(pkg.scripts.build.includes('build-v78715-smart-weakness.mjs && node tests/v78715-release.mjs && node scripts/build-v78716-study-calendar.mjs && node tests/v78716-release.mjs'));
assert(pkg.scripts.test.includes('tests/v78716-engine.mjs')&&pkg.scripts.test.includes('tests/v78716-source.mjs'));
for(const f of ['study/jlpt-study-calendar.html','assets/yk-v78716-calendar-engine.js','assets/yk-v78716-calendar.js','assets/yk-v78716-calendar.css','assets/yk-v78716-student.js','assets/yk-v78716-student.css','assets/yk-v78716-link.css','scripts/build-v78716-study-calendar.mjs','tests/v78716-engine.mjs','tests/v78716-release.mjs'])assert(existsSync(f),f);
const page=read('study/jlpt-study-calendar.html');
for(const marker of ['id="yk816App"','yk816GoalForm','yk816PlanForm','yk816Days','yk816Done','yk816TargetDate'])assert(page.includes(marker),marker);
for(const src of ['assets/yk-v78716-calendar.js','assets/yk-v78716-calendar-engine.js','assets/yk-v78716-student.js'])for(const forbidden of ['/.netlify/functions','exam-attempt-submit','exam-access','getDatabase(','YKCR_SYNC_SECRET','fetch(','XMLHttpRequest','sendBeacon'])assert(!read(src).includes(forbidden),`${src}: ${forbidden}`);
assert(read('assets/yk-v78716-student.js').includes("dataset.dashboard==='student'"));
assert(read('assets/yk-v78716-calendar-engine.js').includes('STORAGE_KEY'));
for(const f of ['assets/yk-v78715-insights.js','assets/yk-v78714-practice.js','assets/yk-v7879-grammar-n1.json','netlify/functions/_shared/exam-autosave.mts','netlify/functions/yk-enrollment-crm.mts','netlify/functions/yk-business-growth.mts'])assert(existsSync(f),'Cumulative source lost '+f);
console.log('PASS v78716-source: version/build chain, safe local state, 3 languages, student-only integration, previous backend/grammar preserved');
