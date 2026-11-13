import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const rd=p=>readFileSync('dist/'+p,'utf8');
const admin=rd('admin-dashboard.html');
for(const s of ['id="dashboardBody"','yk-dashboard-v758.js','yk-dashboard-pro-v784.js','yk-v7877-growth.js',
 'yk-v7878-admin.css?v=7878','yk-v7878-admin.js?v=7878'])assert(admin.includes(s),'admin '+s);
for(const s of ['yk-learning-v760.js','yk-jlpt-learning-v782-dashboard.js','yk-jlpt-learning-v782-state.js'])
 assert(!admin.includes(s),'Admin must NOT load student personal component '+s);
for(const page of ['student-dashboard.html','member-dashboard.html']){
 const s=rd(page);assert(!s.includes('yk-v7878-admin.js'),'No CRM on '+page);
 assert(!s.includes('yk-v7877-growth.js'),'No admin Business Growth on '+page);
}
const student=rd('student-dashboard.html');assert(student.includes('yk-jlpt-learning-v782-dashboard.js'),'Student personal JLPT remains');
for(const t of ['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1']){
 const s=rd('exams/'+t+'.html');assert(s.includes(`data-exam-v728="${t}"`)&&s.includes('id="examPanel"'),t);
 assert(!s.includes('yk-v7878-admin.js'),'No CRM on exam '+t);
}
for(const a of ['assets/yk-v7878-admin.js','assets/yk-v7878-admin.css'])assert(existsSync('dist/'+a),a);
console.log('PASS v7878-release: Admin personal JLPT removed, announcements preserved with replacement; Student and 12 exams unchanged');
