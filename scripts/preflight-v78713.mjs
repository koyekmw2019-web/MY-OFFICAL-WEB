/** v7.87.13 — source checkout prerequisites; intentionally no network or writes. */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const required = [
 'index.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html',
 'study/jlpt-learning.html','src/identity-client.js','netlify.toml',
 'scripts/build-public-v7841.mjs','scripts/build-v787-exam-pages.mjs',
 'scripts/build-v7872-mobile-exams.mjs',
 'netlify/functions/exam-access.mts','netlify/functions/exam-attempt-submit.mts',
 'netlify/functions/_shared/security.mts',
 'netlify/database/migrations/20261112090000_yk_growth_analytics.sql',
 'netlify/database/migrations/20261112140000_yk_enrollment_crm.sql',
 'assets/yk-v7879-grammar-n5.json','assets/yk-v7879-grammar-n1.json',
 'assets/yk-v78712-i18n.js','service-worker.js'
];
const missing=required.filter(p=>!existsSync(resolve(p)));
if(missing.length){
 console.error('PRE-FLIGHT BLOCKED: This ZIP is a cumulative PATCH, not the full website source checkout.');
 console.error('Copy the ZIP over an intact GitHub checkout of koyekmw2019-web/MY-OFFICAL-WEB (main v7.87.4 base), keeping existing files.');
 console.error('Missing required files:\n  '+missing.join('\n  '));
 process.exit(2);
}
const pkg=JSON.parse(readFileSync('package.json','utf8'));
assert(['7.87.13','7.87.14','7.87.15','7.87.16','7.87.17','7.87.18','7.87.19','7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version));
assert(pkg.scripts.build.includes('scripts/build-v78713-performance.mjs'));
assert(pkg.scripts.test.includes('tests/v78713-static.mjs'));
console.log('PASS v7.87.13 full checkout preflight: source, 12-exam build chain, backend and DB migration files present');
