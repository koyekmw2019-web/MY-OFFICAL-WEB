import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const src=readFileSync('assets/yk-ui-preferences.js','utf8');
const css=readFileSync('assets/yk-ui-preferences.css','utf8');
const build=readFileSync('scripts/build-ui-preferences.mjs','utf8');
const pkg=JSON.parse(readFileSync('package.json','utf8'));
assert.equal(pkg.version,'7.87.4');
assert.match(pkg.scripts.postbuild,/build-mobile-nav\.mjs/);
assert.match(pkg.scripts.postbuild,/build-mobile-ui-polish\.mjs/);
assert.match(pkg.scripts.postbuild,/build-ui-preferences\.mjs && node tests\/ui-preferences\.mjs --release$/);
assert.match(pkg.scripts.posttest,/node tests\/mobile-nav\.mjs/);
assert.match(pkg.scripts.posttest,/node tests\/ui-preferences\.mjs/);
assert.match(pkg.scripts.posttest,/node tests\/ui-preferences\.runtime\.mjs$/);
assert.match(src,/querySelector\('\.header-actions, \.vc-top-actions, \.yk-auth-header-actions, \.topbar \.top-actions'\)/);
assert.match(src,/\.lang-switch, \.yk-auth-header-actions > \.auth-languages/);
assert.match(src,/\.yk-ui-lang-picker/);
assert.match(src,/yk_ui_theme/);
assert.match(src,/localStorage\.setItem\(themeKey,v\)/);
assert.match(src,/aria-expanded/);
assert.match(css,/data-yk-ui-theme="light"/);
assert.match(css,/#yk-mobile-nav a\[aria-current="page"\]/);
assert.match(css,/\.site-menu-nav>a\.yk864-menu-link/);
assert.match(css,/prefers-reduced-motion:reduce/);
// Do not access/change server data, force navigation, or duplicate translation mechanisms.
for(const s of [src,build])assert.doesNotMatch(s,/\bfetch\s*\(|XMLHttpRequest|\/\.netlify\/functions|location\.assign|location\.replace|pushState|payment_requests|exam_attempts|ykcr_student_sync|getDatabase\s*\(/i);
assert.doesNotMatch(src,/function\s+setLang\s*\(/);
assert(!build.includes('index.html'), 'generic build must not target source index');
if(process.argv.includes('--release')){
 const paths=['dist/index.html','dist/mock-exams.html','dist/video-class.html','dist/login.html','dist/dashboard.html','dist/exams/truck.html','dist/exams/jlpt_n5.html'];
 for(const path of paths){
  assert(existsSync(path),`missing ${path}`);
  const html=readFileSync(path,'utf8');
  assert.equal(html.split('/assets/yk-ui-preferences.js?v=1').length-1,1,`${path} JS injection`);
  assert.equal(html.split('/assets/yk-ui-preferences.css?v=1').length-1,1,`${path} CSS injection`);
  assert.equal(html.split('id="yk-ui-theme-init"').length-1,1,`${path} preload theme injection`);
  assert(html.includes('id="yk-mobile-nav"'),`${path} original nav preserved`);
 }
 const home=readFileSync('dist/index.html','utf8');
 assert.match(home,/onclick="setLang\('my',this\)"/); // Existing language handler retained
 assert.match(home,/id="ykMenuJLPTV7864"/);
 assert.match(home,/const distant=!window\.matchMedia/); // Earlier polish retained
 const center=readFileSync('dist/mock-exams.html','utf8');
 assert.match(center,/id="examPanel"/);
 assert.match(center,/data-exam-v728="truck"/);
 assert.match(readFileSync('dist/login.html','utf8'),/auth-languages/);
 assert.match(readFileSync('dist/dashboard.html','utf8'),/ykDashboardLangPicker/);
 assert.match(readFileSync('dist/video-class.html','utf8'),/id="vcLanguage"/);
 const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.name.endsWith('.html')?[join(d,e.name)]:[]);
 const pages=walk('dist');assert(pages.length>=22);
 for(const page of pages){const html=readFileSync(page,'utf8');assert.equal(html.split('yk-ui-preferences.js?v=1').length-1,1,`${page} unexpected duplication`)}
 console.log(`PASS release UI: ${pages.length} HTML pages, preference assets, language/role/login/exam DOM retained`);
}
console.log('PASS source UI: theme/lang selectors, separate language engine, no API/network/data code');
