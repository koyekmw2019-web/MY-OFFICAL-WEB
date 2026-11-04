/** v7.77: preserve v7.75 study grid and its existing exam routes while adding preview and visual covers. */
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {strict as assert} from 'node:assert';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(join(root,'index.html'),'utf8');
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
const tracks=['truck','taxi','bus','auto-maintenance','ordinary-car','motorcycle','moped','jlpt-n5','jlpt-n4','jlpt-n3','jlpt-n2','jlpt-n1'];
let passed=0;
const check=(label,fn)=>{fn();passed++;console.log('PASS',label)};
const grid=html.split('id="studyHubGridV733">')[1]?.split('\n</div>\n<div class="study-hub-more-wrap">')[0];
assert(grid,'Study Hub grid missing');
const cards=[...grid.matchAll(/<article class="study-track[^>]*>([\s\S]*?)<\/article>/g)].map(m=>m[0]);
check('v7.77 package version',()=>assert.equal(pkg.version,'7.77.0'));
check('12 original v7.75 study cards retained in order',()=>{
 assert.equal(cards.length,12);
 for(let i=0;i<7;i++)assert(cards[i].includes(`data-hub-exam="${['truck','taxi','bus','maintenance','car','motorcycle','moped'][i]}"`));
 for(let i=0;i<5;i++)assert(cards[i+7].includes(`data-hub-exam="jlpt_${['n5','n4','n3','n2','n1'][i]}"`));
});
check('all 12 appropriate book covers are localized WebP assets with proper alt and lazy loading',()=>{
 for(let i=0;i<12;i++){
  const filename=`assets/study-hub-covers/${tracks[i]}.webp`;
  assert(cards[i].includes(`src="${filename}"`),tracks[i]);
  assert(cards[i].includes('class="study-book-cover-v777"'));
  assert(/alt="[^"]+"/.test(cards[i]));
  assert(cards[i].includes('loading="lazy"'));
  assert(existsSync(join(root,filename)),filename);
  const image=readFileSync(join(root,filename));
  assert.equal(image.toString('ascii',0,4),'RIFF');assert.equal(image.toString('ascii',8,12),'WEBP');
 }
 assert.equal(readdirSync(join(root,'assets/study-hub-covers')).filter(n=>n.endsWith('.webp')).length,12);
});
check('collapsed Study Hub uses 3-column preview and shows first three paths',()=>{
 assert(html.includes('.study-hub-grid:not(.expanded){grid-template-columns:repeat(3,minmax(0,1fr));max-width:none'));
 assert(html.includes('.study-hub-grid:not(.expanded)>.study-track.study-extra-card{display:none}'));
 assert(html.includes('.study-hub-grid:not(.expanded)>.study-track.study-extra-card:nth-child(2),'));
 assert(html.includes('.study-hub-grid:not(.expanded)>.study-track.study-extra-card:nth-child(3){display:flex}')); 
 assert(cards[1].includes('study-extra-card')&&cards[2].includes('study-extra-card'));
 assert(cards[3].includes('study-extra-card'));
});
check('tablet and mobile grid responsive breakpoints',()=>{
 assert(html.includes('@media(max-width:1000px)'));
 assert(html.includes('@media(max-width:620px)'));
 assert(html.includes('.study-hub-grid,.study-hub-grid:not(.expanded){grid-template-columns:minmax(0,1fr)}'));
});
check('View More and View Less labels are stable through language switching',()=>{
 assert(html.includes('View More · Study Hub &amp; JLPT'));
 assert(html.includes('View Less · Study Hub & JLPT'));
 assert(html.includes('aria-expanded="false" aria-controls="studyHubGridV733"'));
 assert(html.includes("btn.setAttribute('aria-expanded',String(open));"));
 assert(html.includes("if(arrow)arrow.textContent=open?'↑':'↓';"));
});
check('existing Dictionary, Mock Exam, payment and login are untouched by click routing',()=>{
 for(let i=7;i<12;i++)assert(cards[i].includes('data-dict-source="JLPT '));
 assert(html.includes("api('exam-access'"));
 assert(html.includes('async function requestStart(type)'));
 assert(html.includes('assets/yk-dictionary-v774.js'));
});
console.log(`v7.77 Study Hub layout/covers: ${passed} PASS / 0 FAIL`);
