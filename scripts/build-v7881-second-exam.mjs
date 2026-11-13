/** v7.88.1 new independent exam: post-build only after ALL v7.88.0 RC1 gates.
 * Do not modify any of the 12 existing exam pages or inherited backend flows.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dist=resolve('dist'),root=resolve();
const center=join(dist,'mock-exams.html');assert(existsSync(center),'Complete v7.88.0 RC1 dist required');
const canonicalTypes=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n1','jlpt_n2','jlpt_n3','jlpt_n4','jlpt_n5'];
let html=readFileSync(center,'utf8');
assert.equal((html.match(/data-exam-v728=/g)||[]).length,12,'Original 12 exam cards changed');
assert(!html.includes('id="yk7881-second-license-card"'),'Cannot build v7.88.1 twice');
const i=html.indexOf('data-exam-v728="car"');assert(i>0,'普通自動車 Card missing');
const end=html.indexOf('</article>',i);assert(end>i,'普通自動車 Card end missing');
const card=`\n<article class="exam-category v728 yk7881-second-card" id="yk7881-second-license-card" aria-label="普通第二種免許 学科試験">\n <div class="exam-card-top-v742"><div class="exam-card-copy-v742"><div class="icon">🚕</div><h3>普通第二種免許<span class="exam-card-mm">ဒုတိယအမျိုးအစား ယာဉ်မောင်းလိုင်စင်</span></h3></div><div class="exam-book-float-v743"><img class="exam-book-cover-v742" src="/assets/yk-v7881-nishu-book-cover.jpg" alt="第二種免許 学科試験 問題集の表紙（ユーザー提供の参考画像）" width="1038" height="1536" loading="lazy" decoding="async"></div></div>\n <div class="exam-card-desc-v744"><p>旅客の安全 · 交通ルール · 危険予測<span class="exam-card-mm">Taxi / Bus ခရီးသည်လုံခြုံရေးနှင့် လမ်းစည်းကမ်း</span></p></div>\n <div class="exam-rule-badge">95問 · 50分 · 100点満点 · 90点合格</div><span class="exam-rule-mm">စာမေးပွဲ ၉၅ ခု · မိနစ် ၅၀ · ၉၀ မှတ်အောင်</span>\n <div class="exam-scope"><span>90 ○×</span><span>5 イラスト</span><span>オリジナル練習</span></div>\n <a class="exam-launch-v728 yk7881-card-launch" href="/exams/nishu.html"><span>普通第二種免許 Exam を開始</span><span class="exam-card-mm">ဒုတိယအမျိုးအစား စာမေးပွဲ စတင်မည်</span></a>\n </article>\n`;
html=html.slice(0,end+10)+card+html.slice(end+10);
assert.equal((html.match(/data-exam-v728=/g)||[]).length,12);
assert.equal((html.match(/id="yk7881-second-license-card"/g)||[]).length,1);
writeFileSync(center,html);
const pageTemplate=readFileSync('scripts/yk-v7881-nishu-page.html','utf8');
assert(pageTemplate.includes('data-type="nishu"')&&pageTemplate.includes('yk-v7881-nishu.js'));
mkdirSync(join(dist,'exams'),{recursive:true});writeFileSync(join(dist,'exams/nishu.html'),pageTemplate);
for(const path of ['assets/yk-v7881-nishu.css','assets/yk-v7881-nishu.js','assets/yk-v7881-nishu-questions.json','assets/yk-v7881-nishu-book-cover.jpg',
 ...['crosswalk','taxi','bus','rain','junction'].map(x=>`assets/yk-v7881-scene-${x}.svg`)]){
 assert(existsSync(join(root,path)),`Missing new original exam asset: ${path}`);
 const out=join(dist,path);mkdirSync(join(dist,'assets'),{recursive:true});copyFileSync(join(root,path),out);
}
assert(!existsSync(join(dist,'netlify/functions')),'Private backend leaked into dist');
console.log(JSON.stringify({version:'7.88.1-rc.1',newExam:'nishu',originalExamCardsPreserved:12,totalCards:13,
  newRoute:'/exams/nishu.html',score:{text:90,illustrations:5,illustrationSubquestions:15,max:100,pass:90,minutes:50},
  privateAnswerKeyPublished:false,bookCoverUsage:'cover image only'},null,2));
