/** v7.87.15 additive output transform; runs after v7.87.14.
 * Integrates insights without altering existing scores, exam quota, payment or YKCR.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve('dist');
const required=['study/jlpt-grammar-insights.html','study/jlpt-grammar-practice.html','student-dashboard.html',
 'assets/yk-v78715-insights.js','assets/yk-v78715-insights-engine.js','assets/yk-v78715-tracker.js',
 'assets/yk-v78715-insights.css','assets/yk-v78715-link.css','assets/yk-v78715-student.js','assets/yk-v78715-student.css'];
for(const file of required)assert(existsSync(join(root,file)),`v7.87.15 missing published asset: ${file}`);
const practiceFile=join(root,'study/jlpt-grammar-practice.html');
let practice=readFileSync(practiceFile,'utf8');assert(practice.includes('yk814App')&&practice.includes('yk-v78714-practice.js'));
assert(!practice.includes('yk815-insights-entry'),'Insights link already injected');
// The pre-existing Practice script changes in v7.87.15. Bust its old cache key.
const oldPracticeUrl='/assets/yk-v78714-practice.js?v=78714';
assert(practice.includes(oldPracticeUrl),'v7.87.14 practice script cache key changed');
practice=practice.replace(oldPracticeUrl,'/assets/yk-v78714-practice.js?v=78715');
practice=practice.replace('<section class="yk814-analytics">','<section class="yk814-analytics"><div class="yk815-insights-entry"><a href="/study/jlpt-grammar-insights.html">🧠 Smart Grammar Weakness Analysis ↗</a></div>');
assert(practice.includes('yk815-insights-entry'),'Unable to inject Practice → Insights link');
practice=practice.replace('</head>','<link rel="stylesheet" href="/assets/yk-v78715-link.css?v=78715">\n</head>');
writeFileSync(practiceFile,practice,'utf8');
const studentFile=join(root,'student-dashboard.html');let student=readFileSync(studentFile,'utf8');
assert(student.includes('yk-v78714-student.js')&&student.includes('data-dashboard="student"'));
assert(!student.includes('yk-v78715-student.js'),'Duplicate Insights Student widget');
student=student.replace('</head>','<link rel="stylesheet" href="/assets/yk-v78715-student.css?v=78715">\n</head>');
student=student.replace('</body>','<script type="module" src="/assets/yk-v78715-student.js?v=78715"></script>\n</body>');
writeFileSync(studentFile,student,'utf8');
for(const file of ['admin-dashboard.html','member-dashboard.html']){
 const s=readFileSync(join(root,file),'utf8');assert(!s.includes('yk-v78715-student')&&!s.includes('yk-v78715-insights'),'Role guard: '+file);
}
console.log(JSON.stringify({version:'7.87.15',insightsPage:true,practiceLink:true,studentOnly:true,newBackendEndpoints:0,newDatabaseMigrations:0}));
