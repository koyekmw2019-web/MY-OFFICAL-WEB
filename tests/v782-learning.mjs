/** v7.82: new free learning content, privacy isolation, progress and SEO smoke tests. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');const file=p=>join(root,p),read=p=>readFileSync(file(p),'utf8');
let passed=0;function test(label,fn){fn();console.log('PASS',label);passed++}
const content=JSON.parse(read('assets/jlpt-learning-v782-content.json'));
const cats=['vocabulary','grammar','kanji','reading','listening'];
test('original content has all five JLPT levels and five real lesson categories',()=>{
 assert.deepEqual(Object.keys(content.levels).sort(),['N1','N2','N3','N4','N5']);assert(content.source.includes('not official JLPT'));
 for(const level of Object.values(content.levels))for(const c of cats)assert(level[c].length>=2);
});
test('152 distinct authored lessons, with no missing Japanese/Myanmar learning text',()=>{
 const ids=new Set();let count=0;for(const [lv,data] of Object.entries(content.levels))for(const c of cats){for(const entry of data[c]){assert(!ids.has(entry.id),entry.id);ids.add(entry.id);count++;assert(entry.id.startsWith(lv+'-'));if(c==='vocabulary')assert(entry.word&&entry.meaning&&entry.reading&&entry.example&&entry.exampleMy);if(c==='grammar')assert(entry.title&&entry.meaning&&entry.example&&entry.exampleMy&&entry.note);if(c==='kanji')assert(entry.character&&entry.reading&&entry.meaning&&entry.words.length>=2);if(['reading','listening'].includes(c))assert(entry.question&&entry.options.length===4&&entry.explanation&&Number.isInteger(entry.answer)&&entry.answer>=0&&entry.answer<4);}}
 assert.equal(count,152);
});
test('STUDY HUB preserves previous 3-card preview and appends level selector with six categories',()=>{
 const s=read('index.html');assert(s.includes('id="studyHubGridV733"')&&s.includes('View More · Study Hub &amp; JLPT'));
 assert(s.includes('id="yk82Hub"')&&s.includes('id="yk82HubLevels"'));
 for(const c of [...cats,'mock'])assert(s.includes(`data-category="${c}"`));
});
test('new learning page has readable content SEO, real links and explicit unofficial notice',()=>{
 const s=read('study/jlpt-learning.html');assert(s.includes('<title>JLPT Learning Center N5–N1'));assert(s.includes('rel="canonical"'));assert(s.includes('Original')||s.includes('မူရင်း'));assert(s.includes('Official JLPT မဟုတ်ပါ'));assert(s.includes('identity.bundle.js'));assert(!s.includes('noindex'));
});
test('bookmarks, daily practice and progress are isolated from exam/payment backend',()=>{
 const js=read('assets/yk-jlpt-learning-v782-page.js'),state=read('assets/yk-jlpt-learning-v782-state.js');assert(js.includes('speechSynthesis'));assert(js.includes('daily-start'));assert(js.includes('bookmark'));assert(js.includes('markDone'));assert(state.includes('account:')&&state.includes('getUser'));assert(!js.includes('exam-attempt-submit'));assert(!js.includes('paid_access'));assert(!state.includes('exam_attempts'));
});
test('account-scoped progress endpoint uses server identity and additive migration',()=>{
 const f=read('netlify/functions/jlpt-learning-progress.mts');assert(f.includes('requireUser()'));assert(f.includes('WHERE user_id=${user.id}'));assert(f.includes('Cache-Control'));assert(f.includes('120000'));const sql=read('netlify/database/migrations/20261109090000_v782_jlpt_learning_progress.sql');assert(sql.includes('CREATE TABLE IF NOT EXISTS yk_jlpt_learning_progress'));assert(!/DROP TABLE|ALTER TABLE\s+exam_/i.test(sql));
});
test('dashboard script shared across admin/member/student/route and old dashboard scripts retained',()=>{
 for(const name of ['admin-dashboard','student-dashboard','member-dashboard','dashboard']){const s=read(name+'.html');assert(s.includes('yk-jlpt-learning-v782-dashboard.js'));assert(s.includes('yk-dashboard-v758.js'));assert(s.includes('yk-horizontal-white-v778'));assert(s.includes('noindex'));}
});
test('new public learning URL appears in sitemap, old pages and brand title unchanged',()=>{
 const s=read('sitemap.xml');assert(s.includes('https://yekun-mryethemenstyle.netlify.app/study/jlpt-learning.html'));assert(!s.includes('admin-dashboard.html'));assert(read('index.html').includes('<title>YE KUN Official Website | YE LINN OO</title>'));
});
test('all content JSON and JS files are present and nonempty, PWA cache is public-only',()=>{
 for(const p of ['assets/yk-jlpt-learning-v782-page.js','assets/yk-jlpt-learning-v782-state.js','assets/yk-jlpt-learning-v782-hub.js','assets/yk-jlpt-learning-v782-dashboard.js','assets/yk-jlpt-learning-v782.css'])assert(existsSync(file(p))&&statSync(file(p)).size>300,p);
 const sw=read('service-worker.js');assert(sw.includes('assets/jlpt-learning-v782-content.json'));assert(sw.includes("request.mode === 'navigate'"));assert(sw.includes("/.netlify/"));
});
test('progress merges completed lessons and updates bookmark tombstones by timestamp',()=>{
 const w={};vm.runInNewContext(read('assets/yk-jlpt-learning-v782-state.js'),{window:w});const st=w.YKJLPTStateV782;
 const a=st.clean({completed:['N5-v-1'],bookmarkTimestamps:{'N5-v-1':100},lastLevel:'N5',lastLevelAt:1});
 const b=st.clean({completed:['N5-g-1'],bookmarkTimestamps:{'N5-v-1':-200},lastLevel:'N4',lastLevelAt:2});
 const m=st.merge(a,b);assert.equal(m.completed.length,2);assert.equal(st.bookmarks(m).length,0);assert.equal(m.lastLevel,'N4');
 assert.equal(st.progress(m,content,'N5').completed,2);
});
console.log(`TOTAL v7.82 LEARNING: ${passed} PASS / 0 FAIL`);
