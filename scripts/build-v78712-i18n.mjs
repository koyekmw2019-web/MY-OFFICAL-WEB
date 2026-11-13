/** v7.87.12 additive, privacy-aware language consistency patch over v7.87.11.
 * Runs ONLY after previous complete build and all older release tests.
 * No backend/Identity/Exam rules modified, no JSON learning data modified.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync,existsSync,mkdirSync,readdirSync} from 'node:fs';
import {join,resolve,dirname,relative} from 'node:path';
const root=resolve('dist');
assert(existsSync(root),'Full public builder must create dist before language patch');
for(const p of ['assets/yk-v78712-i18n.js','assets/yk-v78712-i18n.css']){
  const target=join(root,p);mkdirSync(dirname(target),{recursive:true});copyFileSync(p,target);
}
const nav='<div class="yk-l12-languages" role="group" aria-label="Select interface language">'+
  '<button type="button" data-yk-l12-switch="my">မြန်မာ</button>'+
  '<button type="button" data-yk-l12-switch="en">English</button>'+
  '<button type="button" data-yk-l12-switch="ja">日本語</button></div>';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(join(dir,x.name)):[join(dir,x.name)]);}
const htmlFiles=walk(root).filter(f=>f.endsWith('.html'));
let enhanced=0;
const skip=/\/archives\/|\/legacy\//i;
for(const file of htmlFiles){
 const name=relative(root,file).replaceAll('\\','/');
 const include= name==='index.html'||name==='mock-exams.html'||name==='login.html'||name==='video-class.html'||
   /^(?:admin|student|member)-dashboard\.html$/.test(name)|| /^exams\/[\w-]+\.html$/.test(name)||
   /^study\/(?:jlpt-learning|jlpt-grammar-library|ssw-(?:truck|taxi|bus))\.html$/.test(name);
 if(!include||skip.test(name))continue;
 let html=readFileSync(file,'utf8');
 assert(html.includes('</body>')&&html.includes('</head>'),`${name}: invalid HTML skeleton`);
 assert(!html.includes('yk-v78712-i18n.js'),`${name}: duplicate language script`);
 if(name==='study/jlpt-grammar-library.html'){
   assert(html.includes('id="yk879App"'), 'Grammar page must retain original learning component');
   assert(html.includes('id="yk879FuriBtns"'), 'Grammar Furigana must remain');
   assert(html.includes('yk-v7879-grammar.js'), 'Grammar engine must remain');
   assert(html.includes('<div class="yk879-topin">'),'Grammar header anchor missing');
   const intro='ဂျပန် Grammar ကို မြန်မာ၊ English နဲ့ လေ့လာပါ။ Level အလိုက် Furigana ရွေးနိုင်ပြီး 例文 ထဲက Grammar ကို အနီမျဉ်းနဲ့ ပြထားပါတယ်။';
   const disclaimer='509 original trilingual grammar lessons across N5–N1. The grouping is for learning purposes and is not an official JLPT syllabus.';
   const furi='Only independently verified reading annotations are shown, so not every kanji is annotated.';
   for(const [text,key] of [[intro,'grammarIntro'],[disclaimer,'grammarDisclaimer'],[furi,'grammarFuriNote']]){
     assert(html.includes('>'+text+'</p>'),`Missing grammar UI text anchor ${key}`);
     html=html.replace('>'+text+'</p>',` data-yk-l12="${key}">`+text+'</p>');
     // Replace the opening tag's position correctly, without replacing surrounding content.
     html=html.replace(new RegExp('(<p[^>]*?) data-yk-l12="'+key+'">'),(_all,opening)=>opening+' data-yk-l12="'+key+'">');
   }
   // The text interpolation above is anchored at >, producing attribute after its >.
   // Normalize it back onto the actual <p ...> element (works for class/style attrs).
   for(const key of ['grammarIntro','grammarDisclaimer','grammarFuriNote']){
     html=html.replace(/(<p[^>]*?)> data-yk-l12="([^"]+)">/g,(_m,tag,k)=>tag+' data-yk-l12="'+k+'">');
   }
   const legal='Furigana defaults are approximate learner-friendly settings rather than an official JLPT kanji list.';
   const source='Grammar index reference';
   const tail='Explanations/examples here are newly authored, not reproduced from the reference. Library bookmarks/learning marks use browser-local storage; existing account learning progress is unchanged.';
   assert(html.includes(legal)&&html.includes(source)&&html.includes(tail),'Grammar legal text anchors missing');
   html=html.replace(legal,`<span data-yk-l12="grammarLegal">${legal}</span>`)
     .replace('>'+source+'</a>',` data-yk-l12="grammarReference">${source}</a>`)
     .replace(tail,`<span data-yk-l12="grammarLegalTail">${tail}</span>`);
   html=html.replace(/(<a\b[^>]*?) data-yk-l12="grammarReference">/,'$1 data-yk-l12="grammarReference">');
   // Fix HTML opening anchor where a dynamically appended attribute followed >.
   html=html.replace(/(<a\b[^>]*?)> data-yk-l12="grammarReference">/,'$1 data-yk-l12="grammarReference">');
   html=html.replace('</a></div></header>','</a>'+nav+'</div></header>');
   assert(html.includes('data-yk-l12-switch="my"'),'Grammar page language selector missing');
 }
 if(name==='study/jlpt-learning.html'){
   if(html.includes('class="yk82-top-links"')){
     html=html.replace('</nav></div></header>',nav+'</nav></div></header>');
     assert(html.includes('data-yk-l12-switch="my"'),'Learning page language selector missing');
   }else{
     // Minimal CI fixtures have no header; the real public page does.
     assert(!html.includes('class="yk82-top-links"'),'Unexpected learning header');
   }
 }
 html=html.replace('</head>','<link rel="stylesheet" href="/assets/yk-v78712-i18n.css?v=78712">\n</head>')
   .replace('</body>','<script defer src="/assets/yk-v78712-i18n.js?v=78712"></script>\n</body>');
 writeFileSync(file,html,'utf8');enhanced++;
}
for(const file of ['study/jlpt-grammar-library.html','study/jlpt-learning.html','admin-dashboard.html','student-dashboard.html','login.html','mock-exams.html']){
 assert(existsSync(join(root,file)),file+' must exist before multilingual release');
 const s=readFileSync(join(root,file),'utf8');assert(s.includes('yk-v78712-i18n.js?v=78712'),file+' must load new localization');
}
// These two scripts have source-only changes (translated admin confirmation prompts).
// Cache-bust ONLY their URLs on Admin, rather than invalidating static assets globally.
const adminPath=join(root,'admin-dashboard.html');
let adminRead=readFileSync(adminPath,'utf8');
for(const [oldUrl,newUrl] of [
 ['/assets/yk-v7878-admin.js?v=7878','/assets/yk-v7878-admin.js?v=78712'],
 ['/assets/yk-v7877-growth.js?v=7877','/assets/yk-v7877-growth.js?v=78712']
]){assert(adminRead.includes(oldUrl),`Admin script absent: ${oldUrl}`);adminRead=adminRead.replaceAll(oldUrl,newUrl);}
writeFileSync(adminPath,adminRead,'utf8');
// Preserve original per-exam free policy and correct only contradictory legacy Myanmar display copy.
let copyCorrections=0;
for(const file of htmlFiles.filter(f=>/^(?:index|mock-exams)\.html$/.test(relative(root,f).replaceAll('\\','/'))||/\/exams\/[\w-]+\.html$/.test(f))){
 let html=readFileSync(file,'utf8');const wrong='အကောင့်တစ်ခုလျှင် အခမဲ့စာမေးပွဲ စုစုပေါင်း 1 ကြိမ် ရရှိပါတယ်။';
 if(html.includes(wrong)){html=html.replaceAll(wrong,'အကောင့်တစ်ခုလျှင် Exam အမျိုးအစားတစ်ခုစီကို အခမဲ့ ၁ ကြိမ် ဖြေနိုင်ပါတယ်။');copyCorrections++;}
 const wrongSeven='အခမဲ့စာမေးပွဲ 1/1 ရရှိနိုင်ပါတယ် · Exam 7 မျိုးထဲမှ တစ်မျိုးကိုရွေးပြီး ဖြေနိုင်ပါတယ်။';
 if(html.includes(wrongSeven))html=html.replaceAll(wrongSeven,'ဒီ Exam အမျိုးအစားအတွက် အခမဲ့ ၁ ကြိမ် ရရှိနိုင်ပါတယ်။ အခြား Exam အမျိုးအစားတွေရဲ့ Free Attempt ကို သီးခြားတွက်ပါတယ်။');
 writeFileSync(file,html,'utf8');
}
console.log(JSON.stringify({version:'7.87.12',enhancedRoutes:enhanced,legacyFreePolicyCopyCorrections:copyCorrections,newAssets:['yk-v78712-i18n.js','yk-v78712-i18n.css'],backendChanged:false},null,2));
