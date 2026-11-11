/** v7.87.3: deploy-only education branding, visible sign-up status and exam UI.
 * Runs AFTER v7.87.2 independent exam pages and v7.87.2 tests.
 * No authenticated network calls, no DB migrations, no changes to exam engine.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve('dist');
const load=p=>readFileSync(join(root,p),'utf8');
const save=(p,s)=>writeFileSync(join(root,p),s,'utf8');
const replaceOne=(s,old,next,part)=>{
 assert(s.includes(old),`Missing expected v7.87.2 ${part}`);
 assert.equal(s.split(old).length-1,1,`Ambiguous ${part}`);
 return s.replace(old,next);
};
// Login: fix only the fake text "YK."; reuse genuine existing /yk-192.png asset.
let login=load('login.html');
login=replaceOne(login,'<strong>YE KUN</strong><small>OFFICIAL WEBSITE</small>',
 '<strong>STUDYING WITH YE KUN</strong><small>EDUCATION · MOCK EXAMS</small>','auth header');
login=replaceOne(login,'<div class="story-mark" aria-hidden="true">YK<span>.</span></div>',
 '<div class="story-mark yk873-story-mark" aria-label="STUDYING WITH YE KUN">'+
 '<img src="/yk-192.png" width="86" height="86" alt="" decoding="async">'+
 '<strong>STUDYING WITH<br>YE KUN</strong></div>','fake YK. story mark');
login=replaceOne(login,'<body>','<body class="yk873-auth">','auth body');
login=replaceOne(login,'</head>',
 '<link rel="stylesheet" href="/assets/yk-v7873-auth.css?v=7873">\n</head>','auth CSS');
login=replaceOne(login,'</body>',
 '<script src="/assets/yk-v7873-auth-notice.js?v=7873" defer></script>\n</body>','auth notice');
save('login.html',login);
const typeNames=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const prep=/<section\b[^>]*\bid="ykPrepMountV750"[^>]*>\s*<\/section>/g;
const drillScript=/<script\b[^>]*\bsrc="\/?assets\/jlpt-chokuzen-(?:bank-v750|v750)\.js"[^>]*>\s*<\/script>\s*/g;
const brandedTag='<div>STUDYING WITH YE KUN</div></a>';
for(const type of typeNames){
 const path=`exams/${type}.html`;
 assert(existsSync(join(root,path)),`Missing v7.87.2 ${path}`);
 let page=load(path);
 page=replaceOne(page,'<body class="yk787-exam-page yk872-single-exam"',
  '<body class="yk787-exam-page yk872-single-exam yk873-exam-page"',type+' body');
 // The site has a different corporate brand. Exam pages are education pages.
 page=replaceOne(page,'<div>YE KUN</div></a>',brandedTag,type+' header wordmark');
 page=replaceOne(page,'<div class="menu-kicker">YE KUN</div>',
  '<div class="menu-kicker">STUDYING WITH YE KUN</div>',type+' menu wordmark');
 const prepMatches=[...page.matchAll(prep)];
 assert.equal(prepMatches.length,1,type+' must have exactly one legacy JLPT drill slot');
 page=page.replace(prep,'');
 const scriptMatches=[...page.matchAll(drillScript)];
 assert.equal(scriptMatches.length,2,type+' expected exactly two JLPT drills scripts');
 page=page.replace(drillScript,'');
 // Original exam question engine, server-side access, results, bookmarks untouched.
 assert(page.includes('id="examPanel"')&&page.includes('id="v728-online-exam-system-js"'));
 assert.equal((page.match(/data-exam-v728=/g)||[]).length,1,type+' must retain exactly one Start control');
 assert(page.includes(`data-exam-v728="${type}"`));
 page=replaceOne(page,'</head>',
  '<link rel="stylesheet" href="/assets/yk-v7873-exam.css?v=7873">\n</head>',type+' CSS');
 save(path,page);
}
console.log('PASS v7.87.3: genuine auth logo, signup feedback styling, branded exam header, unrelated drill removed from 12 pages; backend untouched');
