import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const rd=p=>readFileSync(p,'utf8');
const p=JSON.parse(rd('package.json'));
assert(['7.87.7','7.87.8','7.87.9','7.87.10','7.87.11','7.87.12','7.87.13','7.87.14','7.87.15','7.87.16','7.87.17','7.87.18','7.87.19','7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(p.version));
assert(p.scripts.build.includes('node scripts/build-v7875-performance.mjs && node tests/v7875-release.mjs'));
assert(p.scripts.build.includes('node scripts/build-v7876-smart-learning.mjs && node tests/v7876-release.mjs'));
assert(p.scripts.build.includes('node scripts/build-v7877-business-growth.mjs && node tests/v7877-release.mjs'));
assert(p.scripts.test.includes('node tests/v7877-source.mjs && node --experimental-strip-types tests/v7877-runtime.mjs'));
for(const f of ['netlify/functions/yk-growth-event.mts','netlify/functions/yk-business-growth.mts',
 'netlify/database/migrations/20261112090000_yk_growth_analytics.sql',
 'assets/yk-v7877-growth.js','assets/yk-v7877-growth.css','assets/yk-v7877-cta.js','assets/yk-v7877-cta.css',
 'scripts/build-v7877-business-growth.mjs','tests/v7877-release.mjs'])assert(existsSync(f),f);
const publicApi=rd('netlify/functions/yk-growth-event.mts');
assert(publicApi.includes("'class_cta_click'"));
assert(!publicApi.includes('requireUser')&&!publicApi.includes('getUser')&&!publicApi.includes('user.id'));
for(const term of ['email','student_id','ip_address','user_agent','phone_number'])assert(!rd('netlify/database/migrations/20261112090000_yk_growth_analytics.sql').includes(term),term+' cannot be stored');
const adminApi=rd('netlify/functions/yk-business-growth.mts');
assert(adminApi.includes('await requireAdmin()')&&adminApi.includes('private, no-store'));
assert(adminApi.includes('enrollment_revenue')&&adminApi.includes('marketing_expense'));
const build=rd('scripts/build-v7877-business-growth.mjs');
assert(build.includes('video-class.html')&&build.includes('admin-dashboard.html'));
assert(!build.includes('netlify/functions/exam-attempt-submit')&&!build.includes('src/identity'));
assert(rd('assets/yk-v7877-cta.js').includes('event.isTrusted'));
assert(rd('assets/yk-v7877-growth.css').includes('max-width:530px'));
console.log('PASS v7877-source: cumulative, public click-only, admin-auth data, two isolated tables, previous engine retained');
