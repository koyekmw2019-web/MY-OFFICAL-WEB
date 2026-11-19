/** STUDYING WITH YE KUN — website performance pass, QA candidate.
 * Touches generated dist HTML and creates fingerprinted CSS bundles ONLY.
 * Does not edit source, auth, exams, SQL, YKCR or any Netlify Function.
 * Existing JS, links, IDs, handlers and content are preserved.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, existsSync, readdirSync} from 'node:fs';
import {resolve,join,dirname,relative,sep} from 'node:path';
const root=resolve('dist');
const sourceAssets=resolve('assets');
const manifest=JSON.parse(readFileSync(join(sourceAssets,'yk-perf-image-manifest.json'),'utf8'));
const toGitSha=buffer=>createHash('sha1').update(`blob ${buffer.length}\0`).update(buffer).digest('hex');
const isWithin=(parent,p)=>p===parent||p.startsWith(parent+sep);
const imageMap=new Map();
for(const item of manifest.assets){
  assert(/^\/assets\/embedded-v780\/[\w.-]+\.(?:jpe?g|png)$/.test(item.source));
  assert(/^\/assets\/yk-perf-images\/[\w.-]+\.webp$/.test(item.optimized));
  const original=join(root,item.source.slice(1));
  const optimized=join(root,item.optimized.slice(1));
  if(!existsSync(optimized)) throw Error(`Optimized image missing from dist: ${item.optimized}`);
  if(!existsSync(original)) continue; // The original public build may have excluded it.
  if(toGitSha(readFileSync(original))===item.source_git_sha) imageMap.set(item.source,item.optimized);
  else console.warn(`SKIP changed source image: ${item.source}`);
}
function walk(dir){
  return existsSync(dir)?readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):e.isFile()&&e.name.endsWith('.html')?[join(dir,e.name)]:[]):[];
}
const paths=walk(root);
assert(paths.some(p=>p===join(root,'index.html')),'Performance: main output missing');
assert(paths.some(p=>p===join(root,'study','jlpt-learning.html')),'Performance: JLPT output missing');
const bundles=new Map();
const updates=[];
const aggregate={html_pages:0,css_original_links:0,css_bundled_links:0,css_groups:0,new_css_files:0,optimized_images:0,new_lazy_images:0,new_lazy_iframes:0};
// These separately versioned UI layers have public link contracts in release checks.
const uiLayer = /^\/assets\/(?:yk88-|yk-(?:mobile-nav\.|ui-preferences\.|page-transitions-|v787[2-5]-))/;
const protectedMarkup = /(<!--[\s\S]*?-->|<(script|style|template|noscript|textarea|title)\b[^>]*>[\s\S]*?<\/\2\s*>)/gi;
function parseCssLink(tag){
  // Boolean attributes (e.g. disabled), media conditions and handlers change semantics.
  if(!/^<link(?:\s+(?:href|rel|type)\s*=\s*(?:"[^"]*"|'[^']*'))+\s*\/?>$/i.test(tag)) return null;
  const type=tag.match(/\stype\s*=\s*(['"])(.*?)\1/i)?.[2];
  if(type && type.toLowerCase()!=='text/css') return null;
  const rel=tag.match(/\brel\s*=\s*(['"])(.*?)\1/i)?.[2];
  const href=tag.match(/\bhref\s*=\s*(['"])(.*?)\1/i)?.[2];
  if(!rel||rel.toLowerCase()!=='stylesheet'||!href||!href.startsWith('/assets/')||!/^\/assets\/[\w\-./]+\.css(?:\?[\w.%=&+-]*)?$/.test(href))return null;
  if(uiLayer.test(href)) return null;
  const file=join(root,href.split('?')[0].slice(1));
  if(!isWithin(root,file)||!existsSync(file))return null;
  const css=readFileSync(file,'utf8');
  if(/@(?:import|charset|namespace)\b/i.test(css)) return null;
  // Bundle in /assets (not a subdirectory): preserves relative URL() resolution
  // for root-level stylesheets. Skip nested stylesheets if they have URL() paths.
  if(/url\s*\(|image-set\s*\(/i.test(css)&&dirname(file)!==join(root,'assets'))return null;
  return {href,css};
}
function optimizeCssGroups(head){
  const links=[...head.matchAll(/<link\b[^>]*>/gi)].map(m=>({tag:m[0],start:m.index,end:m.index+m[0].length,css:parseCssLink(m[0])}));
  const groups=[];let active=[];
  for(const link of links){
    if(!link.css){if(active.length>1)groups.push(active);active=[];continue;}
    if(active.length&&head.slice(active[active.length-1].end,link.start).trim()!==''){
      if(active.length>1)groups.push(active);
      active=[];
    }
    active.push(link);
  }
  if(active.length>1)groups.push(active);
  for(const g of groups.reverse()){
    const css=g.map(x=>`/* ${x.css.href.replace(/\*\//g,'')} */\n${x.css.css}\n`).join('\n');
    const hash=createHash('sha256').update(css).digest('hex').slice(0,20);
    const filename=`yk-perf-${hash}.css`;
    bundles.set(filename,css);
    const tag=`<link rel="stylesheet" href="/assets/${filename}">`;
    head=head.slice(0,g[0].start)+tag+head.slice(g[g.length-1].end);
    aggregate.css_original_links+=g.length;
    aggregate.css_bundled_links++;
    aggregate.css_groups++;
  }
  return head;
}
function mapMarkup(html, transform){
  let result='', end=0;
  for(const match of html.matchAll(protectedMarkup)){
    result+=transform(html.slice(end,match.index))+match[0];
    end=match.index+match[0].length;
  }
  return result+transform(html.slice(end));
}
function optimizeStaticTags(html){
  let imageIndex=0;
  return mapMarkup(html,fragment=>{
    fragment=fragment.replace(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi,tag=>{
      imageIndex++;
      const href=tag.match(/\ssrc\s*=\s*(['"])([^'"\s]+)\1/i);
      if(href){const optimized=imageMap.get(href[2]);
        if(optimized){tag=tag.replace(href[0],` src=${href[1]}${optimized}${href[1]}`);aggregate.optimized_images++;}
      }
      const canDefer=imageIndex>3&&!/\s(?:onload|onerror)\s*=|\sfetchpriority\s*=\s*['"]?high\b/i.test(tag);
      if(canDefer&&!/\sloading\s*=/i.test(tag)){
        tag=tag.replace(/\s*\/?>(?=$)/,s=>` loading="lazy"${s}`);
        aggregate.new_lazy_images++;
      }
      if(canDefer&&!/\sdecoding\s*=/i.test(tag))tag=tag.replace(/\s*\/?>(?=$)/,s=>` decoding="async"${s}`);
      return tag;
    });
    return fragment.replace(/<iframe\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi,tag=>{
      if(/\s(?:loading|onload|onerror)\s*=/i.test(tag))return tag;
      aggregate.new_lazy_iframes++;
      return tag.replace(/\s*\/?>(?=$)/,s=>` loading="lazy"${s}`);
    });
  });
}

for(const path of paths){
  const src=readFileSync(path,'utf8');
  const isCritical=path===join(root,'index.html')||path===join(root,'study','jlpt-learning.html');
  if(src.split('</head>').length-1!==1 || src.split('</body>').length-1!==1){
    if(isCritical) throw Error(`Critical generated page has invalid head/body: ${relative(root,path)}`);
    console.warn(`SKIP nonstandard HTML: ${relative(root,path)}`);continue;
  }
  if(src.includes('yk-perf-') || src.includes('data-yk-performance'))throw Error(`Already optimized: ${path}`);
  const headEnd=src.indexOf('</head>');
  const head=mapMarkup(src.slice(0,headEnd),optimizeCssGroups);
  const output=optimizeStaticTags(head+src.slice(headEnd));
  updates.push({path,src,output});
  aggregate.html_pages++;
}
// All input checks completed. Touch generated outputs only after validation.
for(const [name,css] of bundles){writeFileSync(join(root,'assets',name),css,'utf8');aggregate.new_css_files++;}
for(const {path,output,src} of updates){if(output!==src)writeFileSync(path,output,'utf8');}
const reportPath=join(root,'yk-performance-build-report.json');
writeFileSync(reportPath,JSON.stringify({version:'v7.88.1-rc.1',image_manifest_base:manifest.base_commit,...aggregate},null,2)+'\n');
console.log('PASS YEKUN performance dist-only: '+JSON.stringify(aggregate));
