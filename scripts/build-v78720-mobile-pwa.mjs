/** v7.87.20: post-build mobile/PWA release hygiene.
 * Operates on generated dist/ ONLY; no user data, exam engine or backend changes.
 * Cache-bust local JS/CSS in actual HTML tags so an OLD installed service worker
 * cannot serve stale script bytes during the first page load of a new release.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {resolve,join,relative,dirname} from 'node:path';
const root=resolve();
const dist=join(root,'dist');
assert(existsSync(join(dist,'index.html')),'A complete public dist/ is required before v7.87.20');
const EPOCH='78720';
const EXAMS=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const targeted=['mock-exams.html',...EXAMS.map(s=>`exams/${s}.html`)];
for(const p of targeted)assert(existsSync(join(dist,p)),`Missing original exam route ${p}`);
const cssPath='assets/yk-v78720-mobile-fixes.css';
assert(existsSync(join(root,cssPath)),'Mobile fix stylesheet missing');
// Use string operations only on real HTML tags, never inside inline JS/JSON/templates.
function changeAttr(tag,attr,page,metrics){
 const re=new RegExp(`\\s${attr}\\s*=\\s*(["'])([^"']+)\\1`,'i');
 const m=tag.match(re);if(!m)return tag;
 const old=m[2];
 if(/^(?:https?:|\/\/|data:|blob:|#)/i.test(old))return tag;
 const u=new URL(old,'https://yk.invalid/'+page);
 if(u.origin!=='https://yk.invalid' || !/\.(?:js|css)$/i.test(u.pathname) || u.pathname.startsWith('/.netlify/'))return tag;
 const file=resolve(dist,'.'+decodeURIComponent(u.pathname));
 assert(file.startsWith(dist+'/')&&existsSync(file),`Missing local JS/CSS ${old} on ${page}`);
 assert(!u.searchParams.has('ykv')||u.searchParams.get('ykv')===EPOCH,`Stale/double version: ${old}`);
 if(u.searchParams.get('ykv')===EPOCH)return tag;
 u.searchParams.set('ykv',EPOCH);
 const updated=u.pathname+u.search+u.hash;
 metrics.busted++;
 return tag.replace(m[0],()=>`${m[0].match(/^\s*/)?.[0]||" "}${attr}=${m[1]}${updated}${m[1]}`);
}
function lazyHomeYouTubeMedia(fragment,page,metrics){
 if(page!=='index.html')return fragment;
 return fragment.replace(/<img\b[^>]*>/gi,tag=>{
  const src=tag.match(/\ssrc\s*=\s*(["'])([^"']+)\1/i)?.[2]||'';
  if(!/^https:\/\/(?:yt3\.ggpht\.com|i\.ytimg\.com)\//i.test(src))return tag;
  let out=tag;
  if(!/\sloading\s*=/.test(out)){out=out.replace(/\s*\/?>$/,ending=>' loading="lazy"'+ending);metrics.lazyRemoteImages++;}
  if(!/\sdecoding\s*=/.test(out)){out=out.replace(/\s*\/?>$/,ending=>' decoding="async"'+ending);}
  return out;
 });
}
function mapRealMarkup(src,page,metrics){
 // Never inspect <link> strings embedded inside an inline script. Traverse
 // literal script blocks and rewrite ONLY static HTML between those blocks.
 const mapLinks=chunk=>lazyHomeYouTubeMedia(chunk.replace(/<link\b[^>]*>/gi,tag=>{
  if(!/\brel\s*=\s*["']stylesheet["']/i.test(tag))return tag;
  return changeAttr(tag,'href',page,metrics);
 }),page,metrics);
 const scripts=/<script\b[^>]*>[\s\S]*?<\/script>/gi;
 let cursor=0,out='',m;
 while((m=scripts.exec(src))){
  out+=mapLinks(src.slice(cursor,m.index));
  const block=m[0],headEnd=block.indexOf('>')+1;
  out+=changeAttr(block.slice(0,headEnd),'src',page,metrics)+block.slice(headEnd);
  cursor=scripts.lastIndex;
 }
 out+=mapLinks(src.slice(cursor));
 return out;
}
function allHtml(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?allHtml(join(dir,x.name)):x.isFile()&&x.name.endsWith('.html')?[join(dir,x.name)]:[])}
let busted=0,changed=0,lazyImages=0;
for(const file of allHtml(dist)){
 const page=relative(dist,file).replaceAll('\\','/');let html=readFileSync(file,'utf8');
 assert(html.includes('</head>')&&html.includes('</body>'),`Malformed page ${page}`);
 if(targeted.includes(page)){
  const tag=`<link rel="stylesheet" href="/${cssPath}?ykv=${EPOCH}">`;
  assert(!html.includes(cssPath),'v7.87.20 attempted twice '+page);
  html=html.replace('</head>',tag+'\n</head>');
  // The existing plan cards are DIVs; make them keyboard-selectable while
  // preserving the original checkout click event and data-plan values.
  const old="$$('[data-plan]',o).forEach(c=>c.onclick=()=>checkout(c.dataset.plan))";
  const newer="$$('[data-plan]',o).forEach(c=>{c.setAttribute('role','button');c.tabIndex=0;const select=()=>checkout(c.dataset.plan);c.onclick=select;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select()}}})";
  assert(html.includes(old),`Expected v7.87.18 plan handler changed: ${page}`);
  html=html.replace(old,()=>newer); // callback preserves literal $$ selector
 }
 const metrics={busted:0,lazyRemoteImages:0};const output=mapRealMarkup(html,page,metrics);
 if(output!==readFileSync(file,'utf8')){writeFileSync(file,output);changed++;}
 busted+=metrics.busted;lazyImages+=metrics.lazyRemoteImages;
}
copyFileSync(join(root,'service-worker.js'),join(dist,'service-worker.js'));
assert(readFileSync(join(dist,'service-worker.js'),'utf8').includes("yk-official-v7-87-20"));
// Data quality: warn about large public images, not a misleading promise that
// bytes have been compressed. No image conversion dependency is introduced.
const sizes=[];
function allFiles(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?allFiles(join(dir,x.name)):x.isFile()?[join(dir,x.name)]:[])}
for(const f of allFiles(join(dist,'assets'))){
 if(!/\.(?:png|jpe?g|webp|avif|js|css)$/i.test(f))continue;
 sizes.push({file:relative(dist,f).replaceAll('\\','/'),bytes:statSync(f).size});
}
sizes.sort((a,b)=>b.bytes-a.bytes);
const report={version:'7.87.20',routes:allHtml(dist).length,htmlFilesChanged:changed,localStaticRefsVersioned:busted,
  examPaymentPagesEnhanced:targeted.length,homeYouTubeImagesLazy:lazyImages,cacheKey:'yk-official-v7-87-20',topLargestPublicAssets:sizes.slice(0,12),
  imageEncodingChanged:false,lcpInpClsMeasured:false,noForcedExamReload:true};
console.log(JSON.stringify(report,null,2));
