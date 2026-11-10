/** v7.86.4 — premium icon menu + direct JLPT card navigation without new dependencies. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');
const home=read('index.html'), css=read('assets/yk-premium-menu-v7864.css');
let count=0;
function check(name,fn){fn();count++;console.log('PASS v7864 '+name);}
check('version and lightweight standalone stylesheet included in both test and build',()=>{
 const p=JSON.parse(read('package.json'));
 assert.equal(p.version,'7.86.4');
 for(const cmd of ['test','build'])assert(p.scripts[cmd].includes('tests/v7864-premium-menu.mjs'));
 assert.equal(home.split('yk-premium-menu-v7864.css').length-1,1);
 assert(statSync(join(root,'assets/yk-premium-menu-v7864.css')).size<9000);
});
check('exactly one JLPT link immediately above Video Course in menu',()=>{
 const menu=home.split('<nav class="site-menu-nav">')[1]?.split('class="yk-account-area-v759"')[0]||'';
 const jlpt=menu.indexOf('id="ykMenuJLPTV7864"'),video=menu.indexOf('id="ykMenuVideoCourseV785"');
 assert(jlpt>=0&&video>jlpt);
 assert(menu.slice(jlpt,video).includes('>JLPT</b>'));
 assert.equal((menu.match(/id="ykMenuJLPTV7864"/g)||[]).length,1);
 assert(menu.includes('href="#jlpt-study-cards"'));
 assert.equal((menu.match(/class="yk864-menu-link/g)||[]).length,9);
});
check('nine icon-based navigation rows use inline SVG and accessible semantic links',()=>{
 const nav=home.split('<nav class="site-menu-nav">')[1].split('<div class="yk-account-area-v759"')[0];
 assert.equal((nav.match(/class="yk864-menu-icon"/g)||[]).length,9);
 assert.equal((nav.match(/class="yk864-menu-chevron"/g)||[]).length,9);
 assert.equal((nav.match(/<svg/g)||[]).length,18);
 assert.equal((nav.match(/<use href=/g)||[]).length,18);
 assert(home.includes('id="yk864-ico-graduation-cap"'));
 assert(home.includes('id="yk864-ico-chevron"'));
 assert.equal((nav.match(/data-my=/g)||[]).length,9);
 assert.equal((nav.match(/data-ja=/g)||[]).length,9);
 assert.equal((nav.match(/data-en=/g)||[]).length,9);
 assert(!nav.includes('onclick=')&&!nav.includes('javascript:'));
});
check('Study Hub remains existing 3-card collapsed preview + all 5 original JLPT cards',()=>{
 assert(home.includes('id="studyHubGridV733"'));
 assert(home.includes('id="studyHubMoreV733"'));
 for(const n of ['N5','N4','N3','N2','N1'])assert(home.includes(`data-study-level="${n}"`));
 assert.equal((home.match(/id="jlpt-study-cards"/g)||[]).length,1);
 assert(home.includes('id="jlpt-study-cards" tabindex="-1" data-study-level="N5"'));
 assert(home.includes("grid.classList.add('expanded')"));
});
check('menu shortcut handles click and direct external hash navigation',()=>{
 assert(home.includes("jlptMenu.addEventListener('click',event=>"));
 assert(home.includes("window.history.pushState(null,'','#jlpt-study-cards')"));
 assert(home.includes("window.addEventListener('hashchange'"));
 assert(home.includes("if(window.location.hash==='#jlpt-study-cards')goToJLPTHub();"));
 assert(home.includes('jlptCards.scrollIntoView'));
 assert(home.includes("jlptCards.focus({preventScroll:true})"));
 assert(css.includes('#jlpt-study-cards{scroll-margin-top:'));
});
check('animations are short, accessible, reduced-motion aware',()=>{
 for(const token of ['prefers-reduced-motion:no-preference','prefers-reduced-motion:reduce','@media(max-width:720px)','@keyframes yk864-menu-item-in','focus-visible'])assert(css.includes(token),token);
 assert(css.includes('backdrop-filter:none!important'));
 assert(!css.includes('@import')&&!css.includes('url('));
});
check('existing login, account, menu close, dictionary, tests retained',()=>{
 for(const key of ['ykMenuDashboardLink','ykMenuAuthLink','menuClose','menuBackdrop','menuToggle','driving-dictionary','online-mock-exam'])assert(home.includes(key));
 assert(home.includes("menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)))"));
 for(const p of ['assets/characters/student-v7821.webp','assets/characters/teacher-v7821.webp','netlify/functions/exam-access.mts','netlify/functions/ykcr-student-sync.mts'])assert(existsSync(join(root,p)),p);
 assert(home.includes('<title>YE KUN Official Website | YE LINN OO</title>'));
 assert(read('netlify.toml').includes('publish = "dist"'));
});
check('public builder references stylesheet and preserves link target in deploy preview',()=>{
 const dist=join(root,'dist');
 if(existsSync(dist)){
  assert(existsSync(join(dist,'assets/yk-premium-menu-v7864.css')));
  assert(read('dist/index.html').includes('id="ykMenuJLPTV7864"'));
  assert(read('dist/index.html').includes('href="#jlpt-study-cards"'));
 }
 assert(read('service-worker.js').includes('v7864-jlpt-menu'));
});
console.log(`v7.86.4 Premium Menu ${count} PASS / 0 FAIL`);
