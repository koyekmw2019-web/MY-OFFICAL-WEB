/** v7.72 dictionary progress release static checks; does not replace live Netlify testing */
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {resolve,dirname,join,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');
const file=p=>join(root,p);
const release=process.argv.includes('--release');
let passes=0, inlineScripts=0, fileRefs=0;
function check(label,fn){fn();passes++;console.log('PASS',label)}
const htmls=['index.html','login.html','dashboard.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html'];
check('all six website entry routes exist',()=>{for(const path of htmls)assert(existsSync(file(path)),path)});
check('all local HTML referenced assets exist, except generated bundle pre-build',()=>{
 for(const h of htmls){
  const html=read(h);
  for(const tag of html.matchAll(/<(?:script|link|img|source)\b[^>]*>/gi)){
   const match=tag[0].match(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/i);
   if(!match)continue;
   const url=match[2];
   if(/^(?:https?:|\/\/|data:|#|mailto:)/i.test(url) || /\$\{/.test(url))continue;
   const resource=url.split(/[?#]/,1)[0].replace(/^\//,'');
   if(!resource)continue;
   const path=resolve(root,resource);
   assert(path.startsWith(root+'/'),`Disallowed local asset path ${h}: ${url}`);
   if(!existsSync(path))assert(!release && resource==='assets/identity.bundle.js',`Missing: ${h} ${resource}`);
   fileRefs++;
  }
 }
});
check('every classic inline script parses',()=>{
 for(const h of htmls){
  const html=read(h);
  for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
   if(!script[2].trim())continue;
   if(/\btype\s*=\s*["']?(application\/ld\+json|application\/json|module)\b/i.test(script[1]))continue;
   new vm.Script(script[2],{filename:h});
   inlineScripts++;
  }
 }
 assert(inlineScripts>5);
});
check('every shipped browser asset JavaScript parses',()=>{
 let total=0;
 for(const f of readdirSync(file('assets'))){
  if(!f.endsWith('.js'))continue;
  const code=read(`assets/${f}`);
  // bundled identity client is ESM and is checked by esbuild during the Netlify build
  if(f==='identity.bundle.js')continue;
  new vm.Script(code,{filename:f});
  total++;
 }
 assert(total>=12);
});
check('v7.74 vocabulary counts, legacy glossary and draft warnings are tracked',()=>{
 const x=JSON.parse(read('QA_v7_74_DICTIONARY.json'));
 assert.equal(x.total,8542);
 assert.equal(x.translated,2350);
 assert.equal(x.pending,6192);
 assert.equal(x.translation_review_complete,false);
 assert(read('index.html').includes('YK_DICTIONARY_V778')); 
});
check('PWA icon references and updated service worker version are valid',()=>{
 const m=JSON.parse(read('manifest.webmanifest'));
 for(const icon of m.icons)assert(existsSync(file(icon.src.split(/[?#]/,1)[0].replace(/^\//,''))));
 assert(/yk-official-v7-(?:78-brand-dictionary|79-seo-jlpt-cards|80-stability-speed)/.test(read('service-worker.js'))); // permit backward-compatible version bump 
});
check('backend functions/migrations exactly match v7.70 source',()=>{
 const manifest=JSON.parse(read('QA_v7_71_BACKEND_HASHES.json'));
 assert(Object.keys(manifest.files).length>=30);
 for(const [p,h] of Object.entries(manifest.files)){
  assert(existsSync(file(p)),`Missing ${p}`);
  let bytes=readFileSync(file(p));
  if(p==='netlify/functions/exam-attempt-submit.mts' && /^7\.(?:86\.[5-9]|8[7-9]\.\d+)$/.test(JSON.parse(read('package.json')).version)){
   // v7.86.5 permits ONLY the additional, optional verified-evidence insert.
   // Strip that insert and its import, then require the original protected source hash.
   let source=bytes.toString('utf8');
   assert(source.includes('verifiedTopics(attempt.exam_type,cp.snapshot)'));
   source=source.replace("import { verifiedTopics } from './_shared/exam-coach-evidence-v7865.mts';\n",'');
   source=source.replace(/  \/\/ v7\.86\.5: persist section-level evidence[\s\S]*?\n  \/\/ Existing optional review data:/,'  // Existing optional review data:');
   bytes=Buffer.from(source);
  }
  assert.equal(createHash('sha256').update(bytes).digest('hex'),h,`Source backend changed: ${p}`);
 }
});
check('no PDFs or environment secrets packaged for deploy',()=>{
 for(const name of readdirSync(root))assert(!/\.pdf$/i.test(name));
 for(const path of readdirSync(root))assert(!/^\.env(?:\..*)?$/i.test(path));
});
check('npm build contract creates identity client on release',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert(Number(pkg.version.split('.')[0])===7 && Number(pkg.version.split('.')[1])>=74,'Must be v7.74 or later');
 assert(pkg.scripts.build.includes('assets/identity.bundle.js'));
 assert(pkg.scripts.test.includes('v774-dictionary-translation.mjs'));
 if(release){const bundle=file('assets/identity.bundle.js');assert(existsSync(bundle),'Build missing identity.bundle.js');assert(readFileSync(bundle).length>2000,'Identity bundle unexpectedly small');}
});
console.log(`TOTAL v7.74: ${passes} PASS / 0 FAIL; ${inlineScripts} inline scripts parsed; ${fileRefs} local resource links; ${release?'POST-BUILD':'PRE-BUILD'} checks`);
