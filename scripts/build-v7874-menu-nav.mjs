/** YE KUN Official Website v7.87.4 — deploy-only education menu navigation.
 * Runs AFTER v7.87.3 builder; never changes original source index, authentication,
 * exam engines, attempts, timer, database, pricing, payment or YKCR.
 */
import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';

const out=resolve('dist');
const names=['mock-exams.html',...['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'].map(x=>`exams/${x}.html`)];
const homeSections=['home','about','portal','study-hub','yk82Hub','study-resources','driving-dictionary'];
const navRe=/(<nav class="site-menu-nav">)([\s\S]*?)(<\/nav>)/;
function rewriteNav(source, page){
  const matches=[...source.matchAll(new RegExp(navRe.source,'g'))];
  assert.equal(matches.length,1,`${page}: exactly one site menu nav expected`);
  const whole=matches[0][0],prefix=matches[0][1],suffix=matches[0][3];
  let inner=matches[0][2];
  // v7.87.2 deliberately rewrote href="#home" to href="/" on single-exam
  // pages. Both are legitimate inputs but neither goes to the correct section.
  const home=/\<a\s+href="(?:#home|\/)"\s+class="yk864-menu-link"/g;
  assert.equal([...inner.matchAll(home)].length,1,`${page}: original Home menu link changed`);
  inner=inner.replace(home,'<a href="/#home" data-yk874-return-home="home" class="yk864-menu-link"');
  for(const id of homeSections.filter(x=>x!=='home')){
    const from=`href="#${id}"`;
    assert.equal(inner.split(from).length-1,1,`${page}: ${id} menu link changed`);
    inner=inner.replace(from,`href="/#${id}" data-yk874-return-home="${id}"`);
  }
  // Only the home sections above are changed. Existing Video Course,
  // Dashboard/Login and Mock Exam destinations remain exactly as authored.
  assert(inner.includes('href="/video-class.html"'),`${page}: preserve Video Course`);
  assert(inner.includes('href="/mock-exams.html"'),`${page}: preserve Exam Center menu`);
  return source.replace(whole,prefix+inner+suffix);
}
function rewritePage(path){
  const filepath=join(out,path);
  assert(existsSync(filepath),`Missing built page ${path}`);
  let html=readFileSync(filepath,'utf8');
  assert(html.includes('yk787-exam-page'),`${path}: expected original exam page`);
  assert(html.includes('id="v728-online-exam-system-js"')&&html.includes('id="examPanel"'),`${path}: exam engine must stay`);
  assert(html.includes('href="/video-class.html"'),`${path}: video route must stay`);
  html=rewriteNav(html,path);
  assert.equal(html.split('<body class="').length-1,1,`${path}: body signature changed`);
  html=html.replace('<body class="','<body class="yk874-education-menu ');
  if(path==='mock-exams.html'){
    assert.equal(html.split('<div>YE KUN</div></a>').length-1,1,'Center brand signature changed');
    html=html.replace('<div>YE KUN</div></a>','<div>STUDYING WITH YE KUN</div></a>');
    assert.equal(html.split('<div class="menu-kicker">YE KUN</div>').length-1,1,'Center menu brand signature changed');
    html=html.replace('<div class="menu-kicker">YE KUN</div>','<div class="menu-kicker">STUDYING WITH YE KUN</div>');
    assert.equal((html.match(/data-exam-v728=/g)||[]).length,12,'Center must retain 12 exam types');
  } else {
    assert(html.includes('yk873-exam-page'),`${path}: v7.87.3 branding must remain`);
    assert(html.includes('<div>STUDYING WITH YE KUN</div></a>'),`${path}: education header must remain`);
    assert.equal((html.match(/data-exam-v728=/g)||[]).length,1,`${path}: only own exam Start`);
  }
  // Both the Logo and the full Exam Center menu should lead to the real home,
  // not a missing #home section on the separate HTML page.
  const brand=/(<a\s+class="brand brand-home-link"\s+href=")(?:#home|\/)(")/g;
  assert.equal([...html.matchAll(brand)].length,1,`${path}: logo link missing`);
  html=html.replace(brand,'$1/#home$2');
  assert.equal(html.split('</head>').length-1,1,`${path}: head boundary changed`);
  assert.equal(html.split('</body>').length-1,1,`${path}: body boundary changed`);
  html=html.replace('</head>','<link rel="stylesheet" href="/assets/yk-v7874-nav.css?v=7874">\n</head>');
  html=html.replace('</body>','<script src="/assets/yk-v7874-nav.js?v=7874" defer></script>\n</body>');
  assert.equal((html.match(/data-yk874-return-home=/g)||[]).length,homeSections.length,`${path}: route count incorrect`);
  writeFileSync(filepath,html,'utf8');
  return {path,bytes:Buffer.byteLength(html),returnLinks:homeSections.length};
}
for(const asset of ['assets/yk-v7874-nav.js','assets/yk-v7874-nav.css'])assert(existsSync(join(out,asset)),`Missing published asset ${asset}`);
const report=names.map(rewritePage);
console.log(JSON.stringify({version:'7.87.4',generated:report.length,homeRoutes:homeSections.length,centerAndExamsPreserved:true,backendChanged:false,report},null,2));
