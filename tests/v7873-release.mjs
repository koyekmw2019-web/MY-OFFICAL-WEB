import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const rd=p=>readFileSync(p,'utf8');
const login=rd('dist/login.html');
assert(login.includes('class="yk873-auth"'));
assert(login.includes('yk873-story-mark'));
assert(login.includes('/yk-192.png'));
assert(login.includes('STUDYING WITH YE KUN'));
assert(!login.includes('YK<span>.</span>'));
assert(login.includes('id="authStatus" role="status"'));
assert(login.includes('yk-v7873-auth-notice.js'));
for(const t of ['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1']){
 const page=rd('dist/exams/'+t+'.html');
 assert(page.includes('yk873-exam-page'),t);
 assert(page.includes('<div>STUDYING WITH YE KUN</div></a>'),t);
 assert(page.includes('yk-v7873-exam.css?v=7873'),t);
 assert(!page.includes('id="ykPrepMountV750"'),t);
 assert(!page.includes('JLPT N1–N5 · ORIGINAL QUESTIONS'),t);
 assert(!page.includes('/assets/jlpt-chokuzen-v750.js'),t);
 assert(!page.includes('/assets/jlpt-chokuzen-bank-v750.js'),t);
 assert(page.includes('id="examPanel"')&&page.includes('id="v728-online-exam-system-js"'),t);
 assert.equal((page.match(/data-exam-v728=/g)||[]).length,1,t);
 assert(page.includes(`data-exam-v728="${t}"`),t);
}
for(const f of ['dist/assets/yk-v7873-auth.css','dist/assets/yk-v7873-auth-notice.js','dist/assets/yk-v7873-exam.css'])assert(existsSync(f),f);
console.log('PASS v7873-release: Login notice/brand, isolated UI, no unrelated drill, 12 preserved exam engines');
