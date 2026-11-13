/** v7.87.16 public-only additive pass after v7.87.15. No database or Netlify Functions change. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve('dist');
const required=[
 'study/jlpt-study-calendar.html','study/jlpt-grammar-practice.html','study/jlpt-learning.html','student-dashboard.html','admin-dashboard.html','member-dashboard.html',
 'assets/yk-v78716-calendar-engine.js','assets/yk-v78716-calendar.js','assets/yk-v78716-calendar.css','assets/yk-v78716-student.js','assets/yk-v78716-student.css','assets/yk-v78716-link.css'];
for(const f of required)assert(existsSync(join(root,f)),`v7.87.16 missing published asset: ${f}`);
const calendar=readFileSync(join(root,'study/jlpt-study-calendar.html'),'utf8');
assert(calendar.includes('id="yk816App"')&&calendar.includes('yk-v78716-calendar.js'));
assert(!calendar.includes('identity.bundle.js')&&!calendar.includes('exam-access'),'Standalone planner must not use exam/auth endpoints');
const studentFile=join(root,'student-dashboard.html');let student=readFileSync(studentFile,'utf8');
assert(student.includes('data-dashboard="student"')&&student.includes('yk-v78715-student.js'),'Run AFTER previous student widgets');
assert(!student.includes('yk-v78716-student.js'),'Duplicate student calendar integration');
student=student.replace('</head>','<link rel="stylesheet" href="/assets/yk-v78716-student.css?v=78716">\n</head>');
student=student.replace('</body>','<script type="module" src="/assets/yk-v78716-student.js?v=78716"></script>\n</body>');
writeFileSync(studentFile,student,'utf8');
const practiceFile=join(root,'study/jlpt-grammar-practice.html');let practice=readFileSync(practiceFile,'utf8');
assert(practice.includes('yk815-insights-entry')&&practice.includes('class="yk814-analytics"'),'Requires v7.87.15 Practice output');
assert(!practice.includes('yk816-planner-entry'),'Duplicate practice planner link');
practice=practice.replace('<section class="yk814-analytics">','<section class="yk814-analytics"><div class="yk816-planner-entry"><a href="/study/jlpt-study-calendar.html">📅 Study Calendar &amp; Goals ↗</a><small>နေ့စဉ်/အပတ်စဉ် Learning Goal သတ်မှတ်ရန်</small></div>');
practice=practice.replace('</head>','<link rel="stylesheet" href="/assets/yk-v78716-link.css?v=78716">\n</head>');
writeFileSync(practiceFile,practice,'utf8');
const learningFile=join(root,'study/jlpt-learning.html');let learning=readFileSync(learningFile,'utf8');
assert(learning.includes('id="yk82DailyShortcut"'),'Original study tools section required');
assert(!learning.includes('yk816LearningCalendar'),'Duplicate Learning Center calendar link');
learning=learning.replace('<button id="yk82DailyShortcut"','<a id="yk816LearningCalendar" class="yk82-pill yk816-study-link" href="/study/jlpt-study-calendar.html">📅 လေ့လာရေး Calendar / Study Goals ↗</a><button id="yk82DailyShortcut"');
learning=learning.replace('</head>','<link rel="stylesheet" href="/assets/yk-v78716-link.css?v=78716">\n</head>');
writeFileSync(learningFile,learning,'utf8');
for(const f of ['admin-dashboard.html','member-dashboard.html']){
 const s=readFileSync(join(root,f),'utf8');assert(!s.includes('yk-v78716-student.js')&&!s.includes('yk-v78716-calendar.js'),`Admin/Member isolation: ${f}`);
}
console.log(JSON.stringify({version:'7.87.16',studentOnlyWidget:true,newPlannerPage:true,practiceLink:true,learningCenterLink:true,newNetlifyFunctions:0,newDatabaseMigrations:0}));
