/** STUDYING WITH YE KUN v7.89.0 Production output integration.
 * Uses previously approved QA-rendered UI as a build INPUT but never publishes
 * QA answer keys, QA warnings or the dist-menu-qa working folder.
 * Only modifies generated dist. Existing backend/identity/payment code remains.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync,writeFileSync,existsSync,copyFileSync,rmSync,renameSync,
         readdirSync,statSync } from 'node:fs';
import { resolve,join } from 'node:path';
const root=process.cwd(),dist=resolve('dist'),staged=resolve('dist-menu-qa');
const marker=join(staged,'.local-menu-build');
function run(script){execFileSync(process.execPath,[script],{cwd:root,stdio:'inherit'});}
assert(existsSync(join(dist,'mock-exams.html')),'Base Netlify dist not found');
if(existsSync(staged)){
 assert(existsSync(marker),'Existing output not owned by YKOC QA builder');
 rmSync(staged,{recursive:true,force:true});
}
run('scripts/build-v7890-second-license-qa.mjs');
run('qa/menu-slidein-pr7/apply-pr7-menu-qa.mjs');
run('qa/menu-slidein-pr7/apply-mobile-final-polish-qa.mjs');
function walk(path){
 return readdirSync(path,{withFileTypes:true}).flatMap(e=>{
  const full=join(path,e.name);
  return e.isDirectory()?walk(full):e.isFile()&&e.name.endsWith('.html')?[full]:[];
 });
}
const qa=join(staged,'mock-second-license-qa.html');
assert(existsSync(qa),'Second license exam view was not built');
let html=readFileSync(qa,'utf8');
const tag=/<script type="application\/json" id="questionData">([\s\S]*?)<\/script>/;
const match=html.match(tag);assert(match,'QA question data tag missing');
const bank=JSON.parse(match[1]);
assert(bank.type==='ordinary_second'&&bank.originalItems.length>=90&&bank.illustrations.length>=5,
  'Invalid bank contents');
for(const q of bank.originalItems) {
 delete q.answer;delete q.explanationJP;delete q.explanationMM;
}
for(const s of bank.illustrations)for(const q of s.statements) {
 delete q.answer;delete q.explanationJP;delete q.explanationMM;
}
const publicBank=JSON.stringify(bank);
assert(!/"answer"\s*:/.test(publicBank)&&!/"explanationJP"\s*:/.test(publicBank),
  'Answer key accidentally exposed in published page');
html=html.replace(tag,()=>'<script type="application/json" id="questionData">'+
 publicBank+'</script>');
html=html.replace(/<meta name="robots" content="noindex,nofollow">/,'');
html=html.replace(/<div class="qa-live-warning">[\s\S]*?<\/div>/,'');
html=html.replace('QA · ဒီစက်ပေါ်တွင်သာ သိမ်းထားမည်',
 'Online Mock Exam · Server Save');
html=html.replaceAll('Auto Save · この端末のみ','Auto Save · Server');
html=html.replace('</head>','<style>#studySecond{display:none!important}</style></head>');
html=html.replace('</body>',
 '<script defer src="/assets/yk-ordinary-second-online.js?v=7890"></script></body>');
assert(html.includes('id="startSecond"')&&html.includes('yk-ordinary-second-online.js'),
 'Server-backed client missing');
assert(!html.includes('QA PREVIEW / NOT PRODUCTION'),'QA warning survived');
copyFileSync(resolve('assets/yk-ordinary-second-online.js'),
  join(staged,'assets/yk-ordinary-second-online.js'));
const newPage=join(staged,'mock-second-license.html');
writeFileSync(newPage,html,'utf8');
rmSync(qa);
let count=0;
for(const file of walk(staged)){
 let s=readFileSync(file,'utf8');
 const target=s.replaceAll('/mock-second-license-qa.html','/mock-second-license.html');
 const polished=target.replaceAll('普通第二種免許 QA Exam','普通第二種免許 Exam');
 if(s!==polished)writeFileSync(file,polished,'utf8');
 assert(polished.includes('id="yk-mobile-nav"')&&polished.includes('id="siteMenu"'),
  'Required approved UI is missing: '+file);
 count++;
}
assert(count>=35,'Unexpected number of built pages: '+count);
assert(readFileSync(join(staged,'mock-exams.html'),'utf8')
 .includes('href="/mock-second-license.html"'),'Second license card not linked');
rmSync(marker,{force:true});
const originalBackup=resolve('dist-v7890-pre-final');
assert(!existsSync(originalBackup),'Refusing to overwrite an earlier build backup');
renameSync(dist,originalBackup);
try{renameSync(staged,dist);rmSync(originalBackup,{recursive:true,force:true});}
catch(e){renameSync(originalBackup,dist);throw e;}
assert(existsSync(join(dist,'mock-second-license.html')));
assert(!existsSync(join(dist,'mock-second-license-qa.html')));
// v7.89.1: approved dictionary route, compact mobile layout, tap feedback,
// and fully covered mobile drawer. Generated output only.
for (const asset of ['yk-v7891-dictionary-hotfix.css','yk-v7892-navigation.css','yk-v7892-navigation.js','yk-v7895-exam-access.css'])
 copyFileSync(resolve('assets',asset),join(dist,'assets',asset));
let accessCardPages=0;
for (const page of walk(dist)) {
 let body=readFileSync(page,'utf8');
 // Match the original Exam Access markup, regardless of additional classes.
 if(/class=["'][^"']*\bexam-access-card\b/.test(body))accessCardPages++;
 assert(body.includes('id="yk-mobile-nav"')&&body.includes('id="siteMenu"'),
  'Dictionary hotfix requires built navigation: '+page);
 assert(body.includes('</head>')&&body.includes('</body>'));
 assert(!body.includes('data-tab="dictionary" href="/study/japanese-myanmar-dictionary.html"'));
 assert(!body.includes('data-menu-search="Dictionary အဘိဓာန် 辞書" href="/study/japanese-myanmar-dictionary.html"'));
 body=body.replace('</head>','<link rel="stylesheet" href="/assets/yk-v7891-dictionary-hotfix.css?v=7891"><link rel="stylesheet" href="/assets/yk-v7892-navigation.css?v=7895"><link rel="stylesheet" href="/assets/yk-v7895-exam-access.css?v=7895"></head>');
 body=body.replace('</body>','<script defer src="/assets/yk-v7892-navigation.js?v=7895"></script></body>');
 writeFileSync(page,body,'utf8');
}
assert(accessCardPages>=2,'Exam Access UI missing from generated pages');
console.log(JSON.stringify({release:'v7.89.5',pages:count,
 menu:'V2.1 + approved final polish',ordinary_second:'server-backed',
 bank_publication:'questions only — answers removed from dist',
 existing_site_backend:'preserved',output:'dist'}));
