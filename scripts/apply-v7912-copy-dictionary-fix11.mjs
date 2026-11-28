/* FIX11: generated UI copy and one Myanmar dictionary gloss only.
 * The existing backend allows one free attempt PER EXAM TYPE. Do not change
 * access logic, Identity, SQL, payments, the source glossary, or word IDs. */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';

const dist=resolve('dist');
const oldMy='အကောင့်တစ်ခုလျှင် အခမဲ့စာမေးပွဲ စုစုပေါင်း 1 ကြိမ် ရရှိပါတယ်။';
const newMy='စာမေးပွဲအမျိုးအစားတစ်ခုစီအတွက် အခမဲ့ 1 ကြိမ် ဖြေဆိုနိုင်ပါတယ်။';
const oldJa='1アカウントにつき無料試験は合計1回利用できます。';
const newJa='試験の種類ごとに初回1回無料で受験できます。';
const oldPrompt='Login is required so your one free exam and paid/student access can be securely tracked.';
const newPrompt='Login is required so your one free attempt per exam type and paid/student access can be securely tracked.';
function replaceOnce(text,from,to,label){
  assert.equal(text.split(from).length,2,label+' expected exactly one original anchor');
  return text.replace(from,()=>to);
}
const pages=readdirSync(dist,{recursive:true}).filter(p=>p.endsWith('.html')).map(p=>p.replaceAll('\\','/'));
const intended=pages.filter(p=>p==='index.html'||p==='mock-exams.html'||p.startsWith('exams/'));
assert.equal(intended.length,14,'Expected Home and 13 legacy exam pages');
for(const page of pages){
  const file=join(dist,page);let text=readFileSync(file,'utf8');
  if(!intended.includes(page)){
    assert(!text.includes(oldMy)&&!text.includes(oldJa),'Unexpected free-quota copy on '+page);
    continue;
  }
  // FIX13 uses the existing Exam Center loading patch on all 13 legacy Exam routes.
  if(page==='mock-exams.html'||page.startsWith('exams/')){
    assert(!text.includes(oldMy)&&text.includes(newMy),'Prior Exam Center fix missing');
  }else text=replaceOnce(text,oldMy,newMy,page+' Burmese guest copy');
  text=replaceOnce(text,oldJa,newJa,page+' Japanese guest copy');
  // Keep the existing authentication gate and correct only its explanation.
  if(page!=='index.html')text=replaceOnce(text,oldPrompt,newPrompt,page+' login prompt');
  if(page==='index.html')text=replaceOnce(text,
    'yk-dictionary-runtime-v7863.js?v=7863-v7911',
    'yk-dictionary-runtime-v7863.js?v=7863-v7911-fix11',
    'Dictionary cache-busting URL');
  writeFileSync(file,text,'utf8');
}

const dictionary=join(dist,'assets/yk-dictionary-runtime-v7863.js');
const before=readFileSync(dictionary,'utf8');
const oldWord='{"jp":"フットブレーキ","reading":"","mm":"ခြေးဘရိတ်","sources":["TRUCK CH1"]}';
const newWord='{"jp":"フットブレーキ","reading":"","mm":"ခြေနင်းဘရိတ်","sources":["TRUCK CH1"]}';
const after=replaceOnce(before,oldWord,newWord,'Exact dictionary word/reading/source');
assert.equal(after.replace(newWord,oldWord),before,'No other dictionary bytes may change');
writeFileSync(dictionary,after,'utf8');
console.log(JSON.stringify({fix:'FIX11',pages:intended.length,words:1,scope:'guest policy copy and dictionary gloss only'}));
