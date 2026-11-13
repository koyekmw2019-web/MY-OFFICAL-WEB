/** v7.87.13 — final, conservative production-public output pass.
 * Runs AFTER v7.87.12. Does not touch exam engine, account data or backend.
 * No optional CDN, image converter or third-party build dependency required.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
const dist=resolve('dist');
assert(existsSync(join(dist,'index.html')),'Full public build must exist');
const routes=['index.html','video-class.html','study/jlpt-learning.html','study/jlpt-grammar-library.html',
  ...['truck','taxi','bus'].map(x=>`study/ssw-${x}.html`)];
const exams=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const required=[...routes,'admin-dashboard.html','student-dashboard.html','member-dashboard.html','login.html',
 'mock-exams.html',...exams.map(t=>`exams/${t}.html`)];
for(const x of required)assert(existsSync(join(dist,x)),`Missing required public route: ${x}`);
const sizes=new Map();
function intrinsicSize(file){
 if(sizes.has(file))return sizes.get(file);
 let dim=null;
 try{
  const b=readFileSync(file), magic=b.toString('ascii',0,12);
  if(b.length>24&&b.subarray(0,8).toString('hex')==='89504e470d0a1a0a')dim=[b.readUInt32BE(16),b.readUInt32BE(20)];
  else if(magic.startsWith('GIF8')&&b.length>10)dim=[b.readUInt16LE(6),b.readUInt16LE(8)];
  else if(b.length>12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'){
   const kind=b.toString('ascii',12,16);
   if(kind==='VP8X'&&b.length>=30)dim=[1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)];
   else if(kind==='VP8 '&&b.length>=30)dim=[b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
   else if(kind==='VP8L'&&b.length>=25){const bits=b.readUInt32LE(21);dim=[(bits&0x3fff)+1,((bits>>14)&0x3fff)+1];}
  } else if(b[0]===0xff&&b[1]===0xd8){
   let i=2;
   while(i+8<b.length){if(b[i]!==0xff){i++;continue;}const mark=b[i+1];if(mark===0xd8||mark===0x01){i+=2;continue;}
    if(mark===0xd9||mark===0xda)break;const length=b.readUInt16BE(i+2);if(length<2||i+2+length>b.length)break;
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(mark)){
      dim=[b.readUInt16BE(i+7),b.readUInt16BE(i+5)];break;
    } i+=2+length;
   }
  }
 }catch{}
 if(!dim||dim.some(n=>!Number.isSafeInteger(n)||n<1||n>20000))dim=null;
 sizes.set(file,dim);return dim;
}
function improveRealMarkup(fragment,htmlFile,counters){
 // Never modify an inline script or a templated HTML string inside it.
 return fragment.replace(/<img\b[^>]*>/gi,tag=>{
  if(/\bonerror\s*=/.test(tag)){} // The handler, if any, stays byte-for-byte.
  const m=tag.match(/\bsrc=(['"])([^'"<>]+)\1/i);
  if(!m||/^(data:|https?:|\/\/)/i.test(m[2]))return tag;
  let changed=tag;
  if(!/\bdecoding\s*=/.test(changed)){changed=changed.replace(/\s*\/?>$/,x=>' decoding="async"'+x);counters.asyncDecode++;}
  const src=m[2].split('?')[0].split('#')[0];
  if(!/\.(?:png|jpe?g|gif|webp)$/i.test(src))return changed;
  if(/\b(width|height)\s*=/.test(changed))return changed; // Never override authored sizing.
  const path=src.startsWith('/')?join(dist,src.slice(1)):resolve(dirname(htmlFile),src);
  // Image paths must be local to the published site; no source traversal.
  if(!path.startsWith(dist+'/')||!existsSync(path))return changed;
  const dimension=intrinsicSize(path);
  if(dimension){changed=changed.replace(/\s*\/?>$/,x=>` width="${dimension[0]}" height="${dimension[1]}"`+x);counters.ratioPreserved++;}
  return changed;
 });
}
function improveHtml(html,filename,counters){
 const pattern=/(<script\b[^>]*>[\s\S]*?<\/script>)/gi;
 let last=0,out='',match;
 while((match=pattern.exec(html))){
  out+=improveRealMarkup(html.slice(last,match.index),filename,counters)+match[0];last=pattern.lastIndex;
 }
 out+=improveRealMarkup(html.slice(last),filename,counters);
 return out;
}
const stats=[];
for(const route of routes){const file=join(dist,route),html=readFileSync(file,'utf8');
 assert(html.includes('</head>')&&html.includes('</body>'),`${route}: invalid page structure`);
 const ctr={asyncDecode:0,ratioPreserved:0};const next=improveHtml(html,file,ctr);
 if(next!==html)writeFileSync(file,next);stats.push({route,...ctr,bytes:Buffer.byteLength(next)});
}
// Versioned static-cache hygiene; never cache HTML, paid pages or account endpoints.
const sw=readFileSync('service-worker.js','utf8');
for(const token of ["request.mode === 'navigate'","url.pathname.startsWith('/.netlify/')",'yk-official-v7-87-20'])
 assert(sw.includes(token),`Missing safe service-worker rule: ${token}`);
copyFileSync('service-worker.js',join(dist,'service-worker.js'));
for(const x of ['assets/yk-v7879-grammar-n5.json','assets/yk-v7879-grammar-n4.json',
'assets/yk-v7879-grammar-n3.json','assets/yk-v7879-grammar-n2.json','assets/yk-v7879-grammar-n1.json'])
 assert(existsSync(join(dist,x)),`Missing Level-split Grammar Data ${x}`);
for(const x of ['netlify/functions','netlify/database'])assert(!existsSync(join(dist,x)),`Private backend leaked into public dist: ${x}`);
console.log(JSON.stringify({version:'7.87.13',imageMarkup:stats,cacheKey:'yk-official-v7-87-20',publicPagesProtected:required.length,
 noImageContentReencoding:true,backendChanged:false,estimatesNotMeasured:true},null,2));
