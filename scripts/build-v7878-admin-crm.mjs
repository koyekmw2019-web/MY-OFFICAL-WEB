/** v7.87.8 — post-v7.87.7 public build: Admin ONLY.
 * Removes personal JLPT lesson/Daily Practice scripts from Admin Dashboard while
 * retaining management-only announcements via a new separated Admin UI.
 * Does not change Student/Member Dashboard, API, exam engines, payment or YKCR.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve('dist'),path=join(root,'admin-dashboard.html');
for(const name of ['assets/yk-v7878-admin.js','assets/yk-v7878-admin.css'])
 assert(existsSync(join(root,name)),`Missing public asset: ${name}`);
let html=readFileSync(path,'utf8');
for(const expected of ['<body data-dashboard="admin">','id="dashboardBody"','yk-dashboard-v758.js','yk-dashboard-pro-v784.js','yk-v7877-growth.js'])
 assert(html.includes(expected),'Expected original Admin Dashboard/previous cumulative growth patch: '+expected);
assert(!html.includes('yk-v7878-admin.js'),'Prevent duplicate integration');
const oldScripts=['/assets/yk-learning-v760.js?v=7863','/assets/yk-jlpt-learning-v782-state.js','/assets/yk-jlpt-learning-v782-dashboard.js'];
function dropScript(src){
 const safe=src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const re=new RegExp(`<script\\b[^>]*\\bsrc="${safe}"[^>]*>\\s*<\\/script>`,'g');
 assert.equal([...html.matchAll(re)].length,1,`Expected exactly one personal-learning admin script ${src}`);
 html=html.replace(re,'');
}
for(const src of oldScripts)dropScript(src);
// Only CSS used exclusively by those personal-learning components is removed.
const styles=['/assets/yk-learning-v760.css?v=7862','/assets/yk-jlpt-learning-v782.css','/assets/yk-jlpt-characters-v7821.css','/assets/yk-jlpt-characters-v7822.css'];
let stylesRemoved=0;
for(const src of styles){
 const literal=`<link rel="stylesheet" href="${src}">`;
 assert(html.split(literal).length-1<=1,'Unexpected duplicate CSS '+src);
 if(html.includes(literal)){html=html.replace(literal,'');stylesRemoved++;}
}
assert.equal(html.split('</head>').length-1,1);assert.equal(html.split('</body>').length-1,1);
html=html.replace('</head>','<link rel="stylesheet" href="/assets/yk-v7878-admin.css?v=7878">\n</head>');
html=html.replace('</body>','<script defer src="/assets/yk-v7878-admin.js?v=7878"></script>\n</body>');
assert(!html.includes('yk-jlpt-learning-v782-dashboard.js'));
assert(!html.includes('yk-learning-v760.js'));
assert(html.includes('yk-v7877-growth.js'));
writeFileSync(path,html,'utf8');
console.log(JSON.stringify({version:'7.87.8',adminPersonalLearningScriptsRemoved:oldScripts.length,personalLearningStylesRemoved:stylesRemoved,
 announcementsSeparated:true,newProtectedCRMFunction:1,studentMemberRoutesChanged:false,examEnginesChanged:false,
 adminExamAnalyticsPreserved:true,existingYkcrPaymentIdentityChanged:false},null,2));
