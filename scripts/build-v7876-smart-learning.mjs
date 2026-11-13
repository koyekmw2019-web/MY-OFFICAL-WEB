/** v7.87.6: public-output-only Student Dashboard Learning Journey.
 * Requires prior v7.87.5 build and QA. Additive: no protected APIs, no login,
 * no exam / YKCR / payment change, and no new student database.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const dist=resolve('dist');
const target=join(dist,'student-dashboard.html');
const read=p=>readFileSync(join(dist,p),'utf8');
assert(existsSync(target),'Student dashboard must exist in public dist');
for(const f of ['assets/yk-v7876-journey-engine.js','assets/yk-v7876-journey.js','assets/yk-v7876-journey.css'])assert(existsSync(join(dist,f)),`Missing public asset: ${f}`);
let html=read('student-dashboard.html');
assert(html.includes('<body data-dashboard="student">'),'Expected existing student dashboard, not a member/admin page');
for(const token of ['yk-dashboard-pro-v784.js','yk-exam-coach-v7865.js','yk-all-exams-v7863-engine.js','yk-dashboard-v758.js','id="dashboardBody"'])assert(html.includes(token),`Original dashboard missing: ${token}`);
assert(!html.includes('yk-v7876-journey.js'),'Prevent double injection');
assert.equal(html.split('</head>').length-1,1);
assert.equal(html.split('</body>').length-1,1);
html=html.replace('</head>','<link rel="stylesheet" href="/assets/yk-v7876-journey.css?v=7876">\n</head>');
// Defer execution after pre-existing dashboard and coach scripts; the runtime
// observes dashboard mount, and only reads the shared activity Promise.
html=html.replace('</body>',`<script defer src="/assets/yk-v7876-journey-engine.js?v=7876"></script>
<script defer src="/assets/yk-v7876-journey.js?v=7876"></script>
</body>`);
assert(html.includes('YK')&&html.includes('STUDYING WITH YE KUN'));
writeFileSync(target,html,'utf8');
console.log(JSON.stringify({version:'7.87.6',addedTo:'student-dashboard.html',existingDashboardPreserved:true,extraApiRequests:0,newDatabaseTables:0,protectedBackendChanged:false},null,2));
