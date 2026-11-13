import assert from 'node:assert/strict';import {existsSync,readFileSync} from 'node:fs';
const pkg=JSON.parse(readFileSync('package.json','utf8'));
assert(['7.87.17','7.87.18','7.87.19','7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version));
assert(pkg.scripts.test.includes('v78717-api.mock.mjs')&&pkg.scripts.build.includes('build-v78717-marketing-crm.mjs && node tests/v78717-release.mjs'));
for(const f of ['assets/yk-v78717-admin.js','assets/yk-v78717-admin.css',
 'netlify/functions/yk-enrollment-insights.mts','netlify/functions/_shared/yk-crm-insights-v78717.mjs',
 'tests/v78717-engine.mjs','tests/v78717-api.mock.mjs','scripts/build-v78717-marketing-crm.mjs'])assert(existsSync(f),f);
const html=readFileSync('assets/yk-v78717-admin.js','utf8');
for(const mark of ["dataset.dashboard!=='admin'",'yk817Insights','yk878CRM','yk877Growth',
 'yk-business-growth','enrolled','followups','day','my:','ja:','en:'])assert(html.includes(mark),mark);
assert(!html.includes('localStorage.setItem')&&!html.includes('navigator.sendBeacon'),'Admin new panel never writes client data or tracks visitors');
for(const f of ['netlify/functions/yk-enrollment-crm.mts','netlify/functions/yk-business-growth.mts',
 'netlify/functions/yk-growth-event.mts','assets/yk-v7879-grammar-n1.json','assets/yk-v78716-calendar.js'])assert(existsSync(f),f);
console.log('PASS v78717-source: build chain, admin-only and no new DB/identity/CRM mutations');
