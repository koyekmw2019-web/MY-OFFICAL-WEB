/** STUDYING WITH YE KUN · QA source overlay only.
 * Run manually after a generated dist-menu-qa build; not part of production build.
 * Preserves every original HTML event handler and underlying application asset.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const here=dirname(fileURLToPath(import.meta.url));
const dist=resolve('dist-menu-qa');
assert(existsSync(join(dist,'index.html')) && existsSync(join(dist,'mock-exams.html')),
  'STOP: run the existing isolated QA build first (dist-menu-qa absent).');
const a=join(dist,'assets');mkdirSync(a,{recursive:true});
const css='ykoc-pr7-mobile-final-polish.css';
const js='ykoc-pr7-mobile-final-polish.js';
for(const file of [css,js])copyFileSync(join(here,file),join(a,file));
const cssTag='<link rel="stylesheet" href="/assets/'+css+'?v=20261123m2">';
const jsTag='<script defer src="/assets/'+js+'?v=20261123m2"></script>';
function* htmlPaths(dir){for(const e of readdirSync(dir,{withFileTypes:true})){
  const p=join(dir,e.name);if(e.isDirectory())yield*htmlPaths(p);
  else if(e.isFile()&&e.name.endsWith('.html'))yield p;
}}
let touched=0;
for(const p of htmlPaths(dist)){
 const raw=readFileSync(p,'utf8');if(!raw.includes('id="ykoc-more"'))continue;
 assert(raw.includes('</head>')&&raw.includes('</body>'),`STOP: malformed QA HTML: ${p}`);
 // Preserve existing tags and refresh the cache version if an earlier QA
 // preview already contains m1; this operation is safe to repeat.
 const cssExists=raw.includes('/assets/'+css);
 const jsExists=raw.includes('/assets/'+js);
 let next=cssExists
   ?raw.replace(/(\/assets\/ykoc-pr7-mobile-final-polish\.css\?v=)[a-zA-Z0-9_-]+/g,'$1'+'20261123m2')
   :raw.replace('</head>',cssTag+'</head>');
 const result=jsExists
   ?next.replace(/(\/assets\/ykoc-pr7-mobile-final-polish\.js\?v=)[a-zA-Z0-9_-]+/g,'$1'+'20261123m2')
   :next.replace('</body>',jsTag+'</body>');
 if(result!==raw)writeFileSync(p,result,'utf8');
 touched++;
}
assert(touched>=30,`STOP: too few QA pages: ${touched}`);
console.log(`QA-only menu/access polish ready in ${touched} dist-menu-qa HTML files. No production files written.`);
