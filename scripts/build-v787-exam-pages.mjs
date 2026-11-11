/** v7.87 public-only route split: preserves source exam engine as single source of truth.
 * Call AFTER build-public-v7841.mjs; home loses exam DOM+runtime in published dist.
 * Dedicated page retains original engine and supporting markup (non-exam sections hidden)
 * for full compatibility with Identity, saved answers and legacy providers.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve('dist');
const file=resolve(root,'index.html');
const source=readFileSync(file,'utf8');
const sectionBegin='<section class="section reveal" id="online-mock-exam">';
const from=source.indexOf(sectionBegin);
assert(from>0,'Expected existing Exam Center section');
const tags=/<\/?section\b[^>]*>/gi;
tags.lastIndex=from;
let depth=0,end=-1,m;
while((m=tags.exec(source))){
 depth+=m[0].startsWith('</')?-1:1;
 if(depth===0){end=tags.lastIndex;break}
}
assert(end>from,'Exam Center section must close');
const section=source.slice(from,end);
assert.equal((section.match(/data-exam-v728=/g)||[]).length,12,'12 original exam cards must remain');
assert(section.includes('id="examPanel"'),'Exam panel must remain on dedicated page');
// The exam page keeps legacy DOM scaffolding because some legacy event handlers expect it.
// CSS displays only the existing #online-mock-exam content and preserves the original header.
let exam=source.replace('<body>','<body class="yk787-exam-page">');
exam=exam.replace(/<title>[\s\S]*?<\/title>/,'<title>Online Mock Exam Center | STUDYING WITH YE KUN</title>');
exam=exam.replace(/<link rel="canonical" href="[^"]+">/,'<link rel="canonical" href="https://yekun-mryethemenstyle.netlify.app/mock-exams.html">');
exam=exam.replace('content="YE KUN Official Website | YE LINN OO"','content="STUDYING WITH YE KUN | Online Mock Exam Center"');
exam=exam.replace('<meta property="og:url" content="https://yekun-mryethemenstyle.netlify.app/">','<meta property="og:url" content="https://yekun-mryethemenstyle.netlify.app/mock-exams.html">');
exam=exam.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,'<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'WebPage','name':'Online Mock Exam Center | STUDYING WITH YE KUN','url':'https://yekun-mryethemenstyle.netlify.app/mock-exams.html'})+'</script>');
exam=exam.replace(/href="#online-mock-exam"/g,'href="/mock-exams.html"');
exam=exam.replace(/href="\/#online-mock-exam"/g,'href="/mock-exams.html"');
exam=exam.replaceAll('/login.html?return=%2F%23home','/login.html?return=%2Fmock-exams.html');
exam=exam.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="STUDYING WITH YE KUN original JLPT N5–N1, SSW transport and driving practice exams. Secure access, timer and verified results.">');
assert(exam.includes('yk787-exam-page')&&exam.includes('v728-online-exam-system-js'));
writeFileSync(resolve(root,'mock-exams.html'),exam,'utf8');
// Legacy full exam DOM/scripts must NOT load in the published homepage.
// No replacement card: retain only the pre-existing Study Hub cards and hamburger route.
const teaser='';
let home=source.slice(0,from)+teaser+source.slice(end);
let removed=0;
home=home.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,(block)=>{
 if(block.includes('V6.1 Online Mock Exam')||block.includes('V7.19 Exam support restore')||block.includes('id="v728-online-exam-system-js"')){removed++;return ''}
 return block;
});
assert.equal(removed,3,'Exactly three legacy exam script blocks should be removed');
const examOnly=/^(?:assets\/(?:yk-jlpt-furigana-v766|jlpt-chokuzen-bank-v750|jlpt-chokuzen-v750|jlpt-native-mock-bank-v752|jlpt-scoring-v755|jlpt-native-v750)\.js|\/assets\/yk-exam-autosave-v761\.js)$/;
home=home.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/gi,(block,src)=>examOnly.test(src)?'':block);
home=home.replace(/<link\s+rel="stylesheet"\s+href="(?:assets\/jlpt-native-v750\.css|\/assets\/yk-exam-autosave-v761\.css)"\s*\/?\s*>/gi,'');
// Public homepage links navigate to the new independent Exam Center.
home=home.replace(/href="\/?#online-mock-exam"/g,'href="/mock-exams.html"');
assert(!home.includes('id="v728-online-exam-system-js"'));
assert(!home.includes('id="examPanel"'));
assert(home.includes('data-hub-exam="jlpt_n5"'));
assert(!home.includes('yk787-home-exam-cta'));
assert(home.includes('data-hub-exam="truck"'));
writeFileSync(file,home,'utf8');
console.log(JSON.stringify({version:'7.87',homeBytes:Buffer.byteLength(home),examPageBytes:Buffer.byteLength(exam),homeReductionBytes:Buffer.byteLength(source)-Buffer.byteLength(home),legacyExamScriptsRemoved:removed,existingExamCards:12,serverCodeChanged:false},null,2));
