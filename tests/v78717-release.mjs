import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const dist=p=>readFileSync('dist/'+p,'utf8');
const admin=dist('admin-dashboard.html');
for(const marker of ['id="dashboardBody"','yk-v7877-growth.js?v=7877','yk-v7878-admin.js?v=7878',
 'yk-v78717-admin.js?v=78717','yk-v78717-admin.css?v=78717','data-dashboard="admin"'])
 assert(admin.includes(marker),'Admin missing '+marker);
for(const f of ['student-dashboard.html','member-dashboard.html','index.html','mock-exams.html']){
 const text=dist(f);assert(!text.includes('yk-v78717-admin'),`CRM Insights must not be loaded by ${f}`);
}
for(const p of ['assets/yk-v78717-admin.js','assets/yk-v78717-admin.css',
 'assets/yk-v7878-admin.js','assets/yk-v7878-admin.css'])assert(existsSync('dist/'+p),'Missing public asset '+p);
for(const f of ['netlify/functions/yk-enrollment-insights.mts',
 'netlify/functions/_shared/yk-crm-insights-v78717.mjs',
 'netlify/database/migrations/20261112140000_yk_enrollment_crm.sql'])assert(existsSync(f),f);
const ui=dist('assets/yk-v7878-admin.js');
for(const hook of ['yk878Search','yk878DueOnly','yk878CourseFilter','yk878SourceFilter','applyCRMFilters'])
 assert(ui.includes(hook),'CRM list filter lost '+hook);
assert(!dist('student-dashboard.html').includes('yk-v78717-admin.js'));
console.log('PASS v78717-release: admin-only insights, CRM search/due filters, previous dashboard and assets preserved');
