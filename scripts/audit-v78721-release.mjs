/** v7.87.21 release audit: read-only assertions on an actual generated dist/.
 * --fixture exists only for synthetic test fixtures. Never use fixture mode as proof
 * that a real repository or Netlify deployment has passed.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const argv=process.argv.slice(2);
const arg=(flag,otherwise)=>{const i=argv.indexOf(flag);return i>=0?argv[i+1]:otherwise};
const fixture=argv.includes('--fixture');
const root=resolve(arg('--root',process.cwd()));
const dist=resolve(arg('--dist',join(root,'dist')));
const reportPath=arg('--report',null);
const EXAMS=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n1','jlpt_n2','jlpt_n3','jlpt_n4','jlpt_n5'];
const REQUIRED=['index.html','login.html','video-class.html','mock-exams.html','dashboard.html','dictionary-reports.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html',
 'study/jlpt-learning.html','study/ssw-truck.html','study/ssw-taxi.html','study/ssw-bus.html',
 'study/jlpt-grammar-library.html','study/jlpt-grammar-practice.html','study/jlpt-grammar-insights.html','study/jlpt-study-calendar.html',
 ...EXAMS.map(x=>`exams/${x}.html`)];
const PRIVATE=['netlify','src','tests','scripts','package.json','package-lock.json','.env','.git','README.md'];
const checks=[];const warnings=[];const errors=[];
const check=(label,ok,detail='')=>{checks.push({name:label,passed:!!ok,detail});if(!ok)errors.push(`${label}${detail?': '+detail:''}`)};
const txt=p=>readFileSync(p,'utf8');
const walk=dir=>!existsSync(dir)?[]:readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(join(dir,d.name)):d.isFile()?[join(dir,d.name)]:[]);
check('dist directory exists',existsSync(dist));
let pkg={};try{pkg=JSON.parse(txt(join(root,'package.json')))}catch(e){check('package metadata readable',false,e.message)}
check('accepted source release version',['7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version),String(pkg.version||'missing'));
for(const file of REQUIRED)check(`route ${file}`,existsSync(join(dist,file)));
for(const path of PRIVATE)check(`private path absent ${path}`,!existsSync(join(dist,path)));
let refs=0,missing=[],unversioned=[],images=[],htmlCount=0;const examined=[];
for(const file of walk(dist).filter(x=>x.endsWith('.html'))){
 const page=relative(dist,file).split(sep).join('/');const html=txt(file);htmlCount++;
 check(`HTML structure ${page}`,/<\/head\s*>/i.test(html)&&/<\/body\s*>/i.test(html));
 // Do not mistake an inline JS string containing a <link> tag for actual HTML.
 const noInline=html.replace(/<script\b(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/gi,'');
 const tags=[...(noInline.match(/<script\b[^>]*\bsrc\s*=\s*["'][^"']+["'][^>]*>/gi)||[]).map(t=>[t,'src']),
   ...(noInline.match(/<link\b[^>]*>/gi)||[]).filter(t=>/\brel\s*=\s*["']stylesheet["']/i.test(t)).map(t=>[t,'href'])];
 for(const [tag,attr] of tags){
   const m=tag.match(new RegExp(`\\b${attr}\\s*=\\s*(["'])([^"']+)\\1`,'i'));if(!m)continue;
   const raw=m[2];if(/^(?:https?:|\/\/|data:|blob:|#)/i.test(raw))continue;
   let u;try{u=new URL(raw,'https://yk.invalid/'+page)}catch{errors.push(`Invalid static URL ${page} ${raw}`);continue}
   if(u.origin!=='https://yk.invalid'||!/\.(?:js|css)$/i.test(u.pathname))continue;
   const target=resolve(dist,'.'+decodeURIComponent(u.pathname));
   if(!target.startsWith(dist+sep)||!existsSync(target))missing.push({page,raw});
   if(u.searchParams.get('ykv')!=='78720')unversioned.push({page,raw});
   refs++;
 }
 const imgs=noInline.match(/<img\b[^>]*>/gi)||[];
 for(const tag of imgs){let m=tag.match(/\bsrc\s*=\s*(["'])([^"']+)\1/i);if(!m)continue;const url=m[2];if(/^(?:https?:|\/\/|data:)/i.test(url))continue;const u=new URL(url,'https://yk.invalid/'+page);const filePath=resolve(dist,'.'+decodeURIComponent(u.pathname));if(filePath.startsWith(dist+sep)&&!existsSync(filePath))images.push({page,url});}
 examined.push(page);
}
check('HTML routes audited',htmlCount>=REQUIRED.length,`found=${htmlCount} expected>=${REQUIRED.length}`);
check('local JS/CSS files exist',missing.length===0,JSON.stringify(missing.slice(0,12)));
check('release-versioned local JS/CSS',unversioned.length===0,JSON.stringify(unversioned.slice(0,12)));
check('static references present',refs>=20,`refs=${refs}`);
if(images.length)warnings.push({code:'MISSING_LOCAL_IMAGES',count:images.length,examples:images.slice(0,10)});
for(const file of ['sitemap.xml','robots.txt','manifest.webmanifest','service-worker.js'])check(`public ${file}`,existsSync(join(dist,file)));
if(existsSync(join(dist,'service-worker.js'))){
 const sw=txt(join(dist,'service-worker.js'));
 check('PWA cache key unchanged (audit-only release)',sw.includes('yk-official-v7-87-20'));
 check('private Function URLs bypass service worker',sw.includes('/.netlify/'));
 check('navigation not cached',sw.includes("request.mode === 'navigate'"));
 check('non-GET not cached',sw.includes("request.method !== 'GET'"));
}
for(const page of ['mock-exams.html',...EXAMS.map(x=>`exams/${x}.html`)]){
 const file=join(dist,page);if(!existsSync(file))continue;const html=txt(file);
 check(`prices preserved ${page}`,[1000,2000,3000,5000].every(x=>html.includes(`price:${x}`)));
 check(`mobile plans accessible ${page}`,html.includes("c.setAttribute('role','button');c.tabIndex=0"));
 check(`mobile stylesheet ${page}`,html.includes('yk-v78720-mobile-fixes.css?ykv=78720'));
}
const staticFiles=walk(join(dist,'assets'));const large=staticFiles.filter(f=>/\.(?:png|jpg|jpeg|webp|avif)$/i.test(f)&&statSync(f).size>400_000).map(f=>({path:relative(dist,f).split(sep).join('/'),bytes:statSync(f).size})).sort((a,b)=>b.bytes-a.bytes);
if(large.length)warnings.push({code:'LARGE_IMAGES_NOT_COMPRESSED',count:large.length,examples:large.slice(0,12)});
if(!fixture){
 const sourcePaths=['netlify/functions/exam-access.mts','netlify/functions/exam-payment-submit.mts','netlify/functions/exam-admin-payments.mts','netlify/functions/exam-student-verify.mts','netlify/functions/ykcr-student-sync.mts','netlify/functions/yk-system-health.mts','netlify/database/migrations/20261112090000_yk_growth_analytics.sql','netlify/database/migrations/20261112140000_yk_enrollment_crm.sql'];
 for(const path of sourcePaths)check(`source ${path}`,existsSync(join(root,path)));
 if(existsSync(join(root,'netlify/functions/_shared/security.mts'))){const src=txt(join(root,'netlify/functions/_shared/security.mts'));check('four plan prices protected',[1000,2000,3000,5000].every(n=>src.includes(': '+n)));}
 if(existsSync(join(root,'netlify/functions/exam-access.mts'))){const src=txt(join(root,'netlify/functions/exam-access.mts'));check('free attempt server response',src.includes("reason:'payment_required'"));}
 if(existsSync(join(root,'netlify/functions/ykcr-student-sync.mts'))){const src=txt(join(root,'netlify/functions/ykcr-student-sync.mts'));check('YKCR signed sync',src.includes('signatureMatches(')&&src.includes('timingSafeEqual('));}
 if(existsSync(join(root,'assets/yk-v7879-grammar-n5.json'))){
  let count=0,exampleCount=0;
  for(const level of ['n5','n4','n3','n2','n1']){const file=join(root,`assets/yk-v7879-grammar-${level}.json`);if(!existsSync(file)){check(`grammar ${level} exists`,false);continue;}const data=JSON.parse(txt(file));count+=data.items?.length||0;for(const item of data.items||[])exampleCount+=item.examples?.length||0;}
  check('grammar patterns 509',count===509,`found=${count}`);check('grammar examples 1018',exampleCount===1018,`found=${exampleCount}`);
 }
 if(existsSync(join(root,'netlify/database/migrations/20261112090000_yk_growth_analytics.sql'))){const db=txt(join(root,'netlify/database/migrations/20261112090000_yk_growth_analytics.sql'));check('growth migration preserves existing tables',!/(?:DROP\s+TABLE|TRUNCATE\s+TABLE)\s+(?:exam_|ykcr_)/i.test(db));}
}
const summary={version:pkg.version,mode:fixture?'SYNTHETIC_FIXTURE_NOT_PRODUCTION':'GENERATED_DIST_SOURCE_AUDIT',runAt:new Date().toISOString(),result:errors.length?'FAIL':'PASS',checks:checks.length,checksPassed:checks.filter(x=>x.passed).length,checksFailed:errors.length,htmlRoutesAudited:htmlCount,criticalRoutes:REQUIRED.length,staticJsCssReferences:refs,missingStaticRefs:missing,unversionedStaticRefs:unversioned,largeImages:large,errors,warnings,repoVersion:pkg.version,liveNetlifyPreviewVerified:false,realDeviceWebVitalsMeasured:false,fullNpmTestPerformedByThisScript:false,fullBuildPerformedByThisScript:false};
if(reportPath){const p=resolve(reportPath);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(summary,null,2)+'\n')}
console.log(JSON.stringify(summary,null,2));
if(errors.length)process.exitCode=1;
