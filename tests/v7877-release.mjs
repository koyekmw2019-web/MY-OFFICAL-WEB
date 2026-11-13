import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync('dist/'+p,'utf8');
const admin=read('admin-dashboard.html');
assert(admin.includes('id="dashboardBody"')&&admin.includes('yk-dashboard-pro-v784.js'));
assert.equal((admin.match(/yk-v7877-growth\.js\?v=7877/g)||[]).length,1);
assert.equal((admin.match(/yk-v7877-growth\.css\?v=7877/g)||[]).length,1);
for(const c of ['truck','taxi','bus']){
 const h=read('study/ssw-'+c+'.html');
 assert(h.includes('STUDYING WITH YE KUN')&&h.includes('data-yk877-course="'+c+'"'),c);
 assert(h.includes('https://www.facebook.com/share/19kc6Vk9XM/'),c);
 assert(h.includes('href="/mock-exams.html"'),c+' old exam CTA retained');
 assert(h.includes('yk-v7877-cta.js?v=7877')&&h.includes('yk-v7877-cta.css?v=7877'),c);
 assert(!h.includes('yk-v7877-growth.js'),c+' cannot access admin UI');
}
const video=read('video-class.html');
assert(video.includes('data-yk877-course="general"')&&video.includes('yk-v7877-cta.js?v=7877'));
const student=read('student-dashboard.html');
assert(student.includes('yk-v7876-journey.js?v=7876'));
for(const p of ['student-dashboard.html','member-dashboard.html','login.html','mock-exams.html']){
 assert(!read(p).includes('yk-v7877-growth.js'),p+' must not include admin panel');
}
for(const t of ['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1']){
 const h=read('exams/'+t+'.html');
 assert(h.includes('id="examPanel"')&&h.includes(`data-exam-v728="${t}"`),t);
 assert(!h.includes('yk-v7877-cta.js'),t+' no click tracker while taking exams');
}
for(const p of ['assets/yk-v7877-growth.js','assets/yk-v7877-growth.css','assets/yk-v7877-cta.js','assets/yk-v7877-cta.css'])assert(existsSync('dist/'+p),p);
console.log('PASS v7877-release: existing 12 exams, previous v7876 UI, admin growth and 4 class link surfaces');
