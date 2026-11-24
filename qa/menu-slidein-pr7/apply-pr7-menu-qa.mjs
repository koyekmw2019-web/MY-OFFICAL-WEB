/** STUDYING WITH YE KUN — PR #7 second-license + mobile/drawer Menu integration.
 * QA build ONLY. Run after `npm run build:second-license-qa` in an isolated workspace.
 * Rewrites generated dist HTML and the existing mobile navigation client; never
 * touches source pages, Functions, Identity, SQL, Payment Blobs, or YKCR.
 */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, cpSync, copyFileSync, existsSync, mkdirSync, readdirSync} from 'node:fs';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const here=dirname(fileURLToPath(import.meta.url));
const source=resolve('dist');
const dist=resolve('dist-menu-qa');
const marker=resolve(dist,'.local-menu-build');
assert(existsSync(resolve(source,'mock-second-license-qa.html')), 'First build the PR #7 exam');
assert(!existsSync(dist) || existsSync(marker), 'Output directory already exists without a QA build marker');
cpSync(source,dist,{recursive:true});
writeFileSync(marker,'Local QA generated directory');

assert(existsSync(dist),`Built dist not found: ${dist}`);
const home=resolve(dist,'index.html');
const exams=resolve(dist,'mock-exams.html');
const second=resolve(dist,'mock-second-license-qa.html');
const script=resolve(dist,'assets/yk-mobile-nav.js');
for(const file of [home,exams,second,script]) assert(existsSync(file),`PR #7 QA built file missing: ${file}`);
const examHTML=readFileSync(exams,'utf8');
assert(examHTML.includes('id="yk-second-type-qa-card"'), 'PR #7 普通第二種免許 QA card missing; abort');
assert(examHTML.includes('href="/mock-second-license-qa.html"'),'PR #7 QA card link missing; abort');
const drawer=readFileSync(resolve(here,'drawer.html'),'utf8');
assert(drawer.includes('id="siteMenu"')&&drawer.includes('id="ykoc-more"')&&drawer.includes('id="menuClose"'));
const nav=`<nav id="yk-mobile-nav" aria-label="Main navigation">
 <a data-tab="home" href="/#home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10H15v-7H9v7H3z"/></svg><span>Home</span></a>
 <a data-tab="exam" href="/mock-exams.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9M16.4 3.6a2.1 2.1 0 0 1 3 3L7.4 18.6l-4 1 1-4Z"/></svg><span>EXAM</span></a>
 <a data-tab="video" href="/video-class.html"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/></svg><span>Video</span></a>
 <a data-tab="dictionary" href="/#driving-dictionary"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg><span>Dictionary</span></a>
 <button type="button" data-tab="menu" id="ykocBottomMenu" aria-controls="siteMenu" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h16"/></svg><span>Menu</span></button>
</nav>`;
const navRe=/<nav id="yk-mobile-nav"[^>]*>[\s\S]*?<\/nav>/g;
const drawerRe=/<aside\s+class="site-menu"\s+id="siteMenu"[^>]*>[\s\S]*?<\/aside>/g;
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.isFile()&&e.name.endsWith('.html')?[join(d,e.name)]:[]);
const pages=walk(dist);
const staged=[];
let sourceDrawer=0,injectedDrawer=0;
for(const file of pages){
 let html=readFileSync(file,'utf8');
 assert(!html.includes('id="ykocBottomMenu"')&&!html.includes('id="ykoc-more"'),`Already patched, refusing: ${file}`);
 assert(html.includes('</head>')&&html.includes('</body>'),`Incomplete HTML ${file}`);
 const matches=html.match(navRe)||[];
 assert(matches.length===1,`Expected one bottom navigation on ${file}, found ${matches.length}`);
 html=html.replace(navRe,nav);
 // These components own their labels, including the five fixed navigation names.
 html=html.replace('function v737TranslateTextNode(node,lang){',
   "function v737TranslateTextNode(node,lang){\n  if(node?.parentElement?.closest('#yk-mobile-nav,#ykoc-more')) return;");
 const count=(html.match(drawerRe)||[]).length;
 assert(count<=1,`Multiple original site menus: ${file}`);
 if(count){sourceDrawer++;html=html.replace(drawerRe,drawer);}
 else{
   injectedDrawer++;
   const backdrop=html.includes('id="menuBackdrop"')?'':'<div class="menu-backdrop" id="menuBackdrop"></div>';
   html=html.replace('</body>',backdrop+drawer+'</body>');
 }
 // All new UI is presentation-only. Existing Identity remains the source of truth.
 const style='<link rel="stylesheet" href="/assets/ykoc-pr7-menu-drawer.css?v=pr7menu1">';
 html=html.replace('</head>',style+'</head>');
 if(!html.includes('id="menuToggle"')) {
   html=html.replace(/<body\b[^>]*>/,tag=>tag+'<button type="button" id="ykDrawerOpen" aria-controls="siteMenu" aria-expanded="false">☰ Menu</button>');
 }
 if(!file.endsWith('mock-second-license-qa.html') && !/<script[^>]+src=["'][^"']*identity\.bundle\.js(?:[?#][^"']*)?["']/i.test(html)){
   html=html.replace('</body>','<script type="module" src="/assets/identity.bundle.js"></script></body>');
 }
 html=html.replace('</body>','<script defer src="/assets/ykoc-pr7-menu-drawer.js?v=pr7menu1"></script><script defer src="/assets/ykoc-pr7-menu-i18n.js?v=pr7menu2"></script></body>');
 assert(html.includes('href="/mock-exams.html"')&&html.includes('>EXAM</span>')&&html.includes('id="ykocBottomMenu"'));
 assert((html.match(/id="yk-mobile-nav"/g)||[]).length===1);
 assert((html.match(/id="siteMenu"/g)||[]).length===1);
 staged.push([file,html]);
}
assert(pages.length>=22,`Unexpected built page count ${pages.length}`);
const newer=readFileSync(resolve(here,'mobile-nav.js'),'utf8');
// Validate every mutation before writing anything.
const protectedPaths=['netlify/functions','netlify/database','payment','ykcr','service-worker.js'];
assert(staged.every(([path])=>!protectedPaths.some(p=>path.includes(p))), 'Protected source path unexpectedly present');
for(const [file,html] of staged)writeFileSync(file,html,'utf8');
writeFileSync(script,newer,'utf8');
const assetDir=resolve(dist,'assets'); mkdirSync(assetDir,{recursive:true});
copyFileSync(resolve(here,'drawer.css'),resolve(assetDir,'ykoc-pr7-menu-drawer.css'));
copyFileSync(resolve(here,'drawer.js'),resolve(assetDir,'ykoc-pr7-menu-drawer.js'));
copyFileSync(resolve(here,'menu-i18n.js'),resolve(assetDir,'ykoc-pr7-menu-i18n.js'));
for(const n of ['studying-with-ye-kun-logo.png','studying-with-ye-kun-wordmark.png'])copyFileSync(resolve(here,n),resolve(assetDir,n));
const digest=s=>createHash('sha256').update(s).digest('hex');
console.log(JSON.stringify({status:'QA DIST ONLY',base:'PR#7',changed_html:staged.length,original_side_drawers:sourceDrawer,added_side_drawers:injectedDrawer,new_tabs:['Home','EXAM','Video','Dictionary','Menu'],exam_route:'/mock-exams.html',menu_action:'slide-in on same page',original_exam_card_preserved:readFileSync(exams,'utf8').includes('id="yk-second-type-qa-card"'),changed_nav_sha256:digest(newer),source_or_backend_changed:false,deploy:false}));
