/** YE KUN v7.87.5-rc1 — additive mobile polish on the verified 7.87.4 main.
 * Legacy v1 JLPT distant-scroll fix retained verbatim for prior source tests.
 * Injects cache-busted presentation assets in published dist/ HTML ONLY.
 * No source HTML changes; presentation-only build adjustment.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dist=resolve('dist');
const homeFile=join(dist,'index.html');
assert(existsSync(homeFile), 'Run after normal public build and mobile nav injection');
let home=readFileSync(homeFile,'utf8');
const before='const distant=Math.abs(jlptCenter.getBoundingClientRect().top)>window.innerHeight*2;';
const after="const distant=!window.matchMedia?.('(max-width:720px)').matches && Math.abs(jlptCenter.getBoundingClientRect().top)>window.innerHeight*2;";
assert.equal(home.split(before).length-1,1,'JLPT scroll signature changed: stop instead of overwriting unknown code');
assert(home.includes('id="ykMenuJLPTV7864"') && home.includes('id="yk82Hub"'),'Missing original JLPT route');
assert(home.includes('id="yk-mobile-nav"'),'Existing 5-tab navigation missing');
home=home.replace(before,after);
writeFileSync(homeFile,home,'utf8');

for(const asset of ['yk-v7875-rc1-ui.css','yk-v7875-rc1-ui.js'])
  assert(existsSync(join(dist,'assets',asset)),`Missing build asset ${asset}`);
const css='<link rel="stylesheet" href="/assets/yk-v7875-rc1-ui.css?v=7875rc1">';
const js='<script defer src="/assets/yk-v7875-rc1-ui.js?v=7875rc1"></script>';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):e.name.endsWith('.html')?[join(dir,e.name)]:[])}
const pages=walk(dist);
assert(pages.length>=22,`Expected 22+ generated HTML pages, got ${pages.length}`);
for(const page of pages){
  let s=readFileSync(page,'utf8');
  assert.equal(s.split('</head>').length-1,1,`${page}: malformed head`);
  assert.equal(s.split('</body>').length-1,1,`${page}: malformed body`);
  assert(s.includes('id="yk-mobile-nav"'),`${page}: existing 5-tab nav missing`);
  assert(!s.includes('yk-v7875-rc1-ui.css')&&!s.includes('yk-v7875-rc1-ui.js'),`${page}: RC assets already injected`);
  // Script in <head> executes before the legacy deferred route handler and
  // can intercept JLPT tap while preserving the original click destination.
  s=s.replace('</head>',`${css}${js}</head>`);
  writeFileSync(page,s,'utf8');
}
console.log(`PASS v7.87.5-rc1 mobile polish: ${pages.length} generated HTML pages, original JLPT route preserved`);
