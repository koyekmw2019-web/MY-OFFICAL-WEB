/** v7.87.14 additive PUBLIC output pass — after v7.87.13.
 * Adds a separate practice page, learning-library navigation and student-only
 * browser-local progress widget. Does not alter secure exam/payment/YKCR paths.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve('dist');
const required=['study/jlpt-grammar-practice.html','study/jlpt-grammar-library.html','student-dashboard.html',
 'assets/yk-v78714-engine.js','assets/yk-v78714-practice.js','assets/yk-v78714-practice.css',
 'assets/yk-v78714-choice-bank.json','assets/yk-v78714-student.js','assets/yk-v78714-student.css','assets/yk-v78714-link.css'];
for(const file of required)assert(existsSync(join(root,file)),`v7.87.14 missing published source asset: ${file}`);
const libraryFile=join(root,'study/jlpt-grammar-library.html');
let library=readFileSync(libraryFile,'utf8');
assert(library.includes('id="yk879App"')&&library.includes('yk-v7879-grammar.js'),'Original 509 Grammar Library must survive');
assert(!library.includes('yk814-library-practice'),'Duplicate Grammar Practice link');
const link='<a href="/study/jlpt-grammar-practice.html" class="yk814-library-practice" aria-label="Open Grammar Practice">▶ Grammar Practice</a>';
assert(library.includes('<div class="yk879-summary">'),'Grammar Library summary marker changed');
library=library.replace('<div class="yk879-summary">','<div class="yk879-summary">'+link);
library=library.replace('</head>','<link rel="stylesheet" href="/assets/yk-v78714-link.css?v=78714">\n</head>');
writeFileSync(libraryFile,library,'utf8');
const studentFile=join(root,'student-dashboard.html');let student=readFileSync(studentFile,'utf8');
assert(student.includes('data-dashboard="student"')&&student.includes('id="dashboardBody"'),'Student Dashboard target changed');
assert(!student.includes('yk-v78714-student.js'),'Duplicate student integration');
student=student.replace('</head>','<link rel="stylesheet" href="/assets/yk-v78714-student.css?v=78714">\n</head>');
student=student.replace('</body>','<script type="module" src="/assets/yk-v78714-student.js?v=78714"></script>\n</body>');
writeFileSync(studentFile,student,'utf8');
const practice=readFileSync(join(root,'study/jlpt-grammar-practice.html'),'utf8');
assert(practice.includes('id="yk814App"')&&practice.includes('/assets/yk-v78714-practice.js'));
assert(!practice.includes('exam-access')&&!practice.includes('exam-attempt-submit'),'Practice must never spend mock-exam quotas');
const admin=readFileSync(join(root,'admin-dashboard.html'),'utf8');
assert(!admin.includes('yk-v78714-student.js')&&!admin.includes('yk-v78714-practice.js'),'Admin dashboard unchanged');
console.log(JSON.stringify({version:'7.87.14',page:'study/jlpt-grammar-practice.html',newAssets:7,libraryLink:true,studentDashboardBrowserLocal:true,extraBackendRequests:0,backendChanges:0,examAccessChanges:0}));
