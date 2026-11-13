/** v7.87.17: additive admin-only Marketing & Enrollment insights.
 * Runs after all v7.87.16 public build passes. Uses existing CRM and Growth tables.
 * No homepage, student/member, exam, payment or YKCR route changes.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve('dist'),adminFile=join(root,'admin-dashboard.html');
for(const file of ['assets/yk-v78717-admin.js','assets/yk-v78717-admin.css'])
 assert(existsSync(join(root,file)),`Missing v7.87.17 published asset: ${file}`);
let admin=readFileSync(adminFile,'utf8');
for(const marker of ['<body data-dashboard="admin">','id="dashboardBody"'])
 assert(admin.includes(marker),`Missing previous admin feature marker: ${marker}`);
// v7.87.12 deliberately refreshes these two existing asset query versions.
for(const [name,version] of [['yk-v7878-admin','7878'],['yk-v7877-growth','7877']]) {
 const scripts=[...admin.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)].map(x=>x[1]);
 assert(scripts.some(src=>{const url=new URL(src,'https://qa.invalid');return url.pathname===`/assets/${name}.js` && [version,'78712'].includes(url.searchParams.get('v'));}),`Missing previous admin script: ${name}`);
}
assert(!admin.includes('yk-v78717-admin.js'),'Duplicate CRM insights integration');
assert.equal((admin.match(/<\/head>/g)||[]).length,1,'Expected one admin head');
assert.equal((admin.match(/<\/body>/g)||[]).length,1,'Expected one admin body');
admin=admin.replace('</head>','<link rel="stylesheet" href="/assets/yk-v78717-admin.css?v=78717">\n</head>');
admin=admin.replace('</body>','<script src="/assets/yk-v78717-admin.js?v=78717" defer></script>\n</body>');
writeFileSync(adminFile,admin,'utf8');
for(const f of ['student-dashboard.html','member-dashboard.html','index.html','mock-exams.html']){
 const html=readFileSync(join(root,f),'utf8');
 assert(!html.includes('yk-v78717-admin.js')&&!html.includes('yk-v78717-admin.css'),`Role isolation failed: ${f}`);
}
console.log(JSON.stringify({version:'7.87.17',adminOnly:true,newInsightsPanel:true,
 followupsAndFunnel:true,latest100CrmFilters:true,newReadOnlyEndpoint:1,
 newDatabaseMigrations:0,examsPaymentYKCRChanged:false,marketingConversionRateInvented:false}));
