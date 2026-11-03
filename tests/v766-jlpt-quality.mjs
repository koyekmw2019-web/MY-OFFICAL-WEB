/** v7.66 — repeatable structural JLPT bank & furigana safety checks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const full=JSON.parse(read('assets/jlpt-native-mock-v752.json'));
const drill=JSON.parse(read('assets/jlpt-chokuzen-bank-v750.json'));
const levels=['N5','N4','N3','N2','N1'];
const sections=['vocabulary','grammar','reading','listening'];
let passed=0;function check(name,fn){fn();passed++;console.log('PASS',name)}
function checkBank(name,arr,expected){
 check(`${name}: IDs unique; consistent records`,()=>{
  assert.equal(new Set(arr.map(q=>q.id)).size,arr.length);
  for(const q of arr){
   assert(levels.includes(q.level),q.id);assert(sections.includes(q.section),q.id);
   assert(Array.isArray(q.options)&&q.options.length===4,q.id);
   assert.equal(new Set(q.options.map(x=>x.trim())).size,4,q.id);
   assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,q.id);
   assert(q.options.every(x=>typeof x==='string'&&x.trim()),q.id);
   assert(typeof q.explanation_ja==='string'&&q.explanation_ja.trim(),q.id);
   assert(typeof q.explanation_my==='string'&&q.explanation_my.trim(),q.id);
   assert(typeof q.question==='string'?!!q.question.trim():!!q.script?.trim(),q.id);
   if(q.section==='reading')assert(q.passage?.trim(),`${q.id}: missing passage`);
   if(q.section==='listening')assert(q.script?.trim(),`${q.id}: missing audio script`);
  }
 });
 check(`${name}: expected counts per level and section`,()=>{
  for(const l of levels){for(const [section,num] of Object.entries(expected))assert.equal(arr.filter(q=>q.level===l&&q.section===section).length,num,l+':'+section)}
 });
}
checkBank('Full JLPT mock',full.questions,{vocabulary:36,grammar:24,reading:20,listening:20});
checkBank('直前対策',drill.questions,{vocabulary:8,grammar:8,reading:4,listening:0});
check('Full mock public JS and JSON banks match exactly',()=>{
 const js=read('assets/jlpt-native-mock-bank-v752.js');const data=JSON.parse(js.slice(js.indexOf(' = ')+3).trim().replace(/;$/,''));
 assert.deepEqual(data.questions,full.questions);
});
check('Practice public JS and JSON banks match exactly',()=>{
 const js=read('assets/jlpt-chokuzen-bank-v750.js');const data=JSON.parse(js.slice(js.indexOf(' = ')+3).trim().replace(/;$/,''));
 assert.deepEqual(data.questions,drill.questions);
});
const state=new Map();const env={window:{dispatchEvent(){}},localStorage:{getItem:k=>state.get(k)||null,setItem:(k,v)=>state.set(k,v)},Event:class{}};
vm.createContext(env);vm.runInContext(read('assets/yk-jlpt-furigana-v766.js'),env);
const f=env.window.YKJLPTFuriganaV766;
check('Furigana dictionary has > 250 curated phrases and safely escapes HTML',()=>{
 assert(Object.keys(f.map).length>250);
 const s=f.format('<img src=x onerror=alert(1)> 学校', {section:'grammar',question:'学校で何をしますか。'});
 assert(!s.includes('<img')&&s.includes('&lt;img'));
 assert(s.includes('<ruby>学校<rt>がっこう</rt></ruby>'));
});
check('All 5 levels protect every live vocabulary question from ruby answer leaks',()=>{
 for(const q of full.questions.concat(drill.questions).filter(q=>q.section==='vocabulary')){
  for(const t of [q.question,q.passage,...q.options])assert(!f.format(t,q,false).includes('<rt>'),q.id);
 }
});
check('Reading target protected even outside vocab and includes kana terms',()=>{
 const q={section:'reading',question:'「約束」の読み方はどれですか。'};
 assert(!f.format('約束',q).includes('<rt>'));
 const q2={section:'grammar',question:'漢字の読みを選びましょう'};
 assert(!f.format('漢字',q2).includes('<rt>'));
});
check('Non-reading grammar, including 漢字の書き方, can show ruby',()=>{
 const q={section:'grammar',question:'この 漢字は 書き方が（　）です。'};
 assert(!f.assessment(q));
 assert(f.format('書き方',q).includes('<rt>かきかた</rt>'));
});
check('Furigana preference OFF removes live ruby but review still annotates',()=>{
 f.setEnabled(false);
 assert(!f.format('学校で勉強',{section:'grammar',question:'どこですか。'}).includes('<rt>'));
 assert(f.format('時計',null,true).includes('<rt>とけい</rt>'));
 f.setEnabled(true);
 assert(f.format('学校で勉強',{section:'grammar',question:'どこですか。'}).includes('<rt>'));
});
check('Full mock and 直前対策 use shared formatter and level-specific question context',()=>{
 const native=read('assets/jlpt-native-v750.js');const practice=read('assets/jlpt-chokuzen-v750.js');
 for(const src of [native,practice]){assert(src.includes('YKJLPTFuriganaV766'));assert(src.includes('data-yk-furi-toggle'));assert(src.includes('rich(q.question,q)'))}
 assert(native.includes('postRich(q.explanation_ja)'));
 assert(practice.includes('rich(q.explanation_ja,q,true)'));
});
check('Client preload order and existing security files preserved',()=>{
 const html=read('index.html');assert(html.indexOf('yk-jlpt-furigana-v766.js') < html.indexOf('jlpt-chokuzen-v750.js'));
 assert(html.indexOf('yk-jlpt-furigana-v766.js') < html.indexOf('jlpt-native-v750.js'));
 for(const file of ['netlify/functions/exam-attempt-submit.mts','netlify/functions/exam-access.mts','netlify/functions/exam-admin-payments.mts','netlify/functions/ykcr-student-sync.mts'])assert(read(file).length>100);
});
console.log(`v7.66: ${passed} PASS / 0 FAIL (static test only)`);
