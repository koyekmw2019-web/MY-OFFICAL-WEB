/** v7.87.5-rc1 source + generated output audit. Run with --release after build. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const css=readFileSync('assets/yk-v7875-rc1-ui.css','utf8');
const js=readFileSync('assets/yk-v7875-rc1-ui.js','utf8');
const build=readFileSync('scripts/build-mobile-ui-polish.mjs','utf8');
const pkg=JSON.parse(readFileSync('package.json','utf8'));
assert.equal(pkg.version,'7.87.4','Core source version stays until release QA');
assert.match(pkg.scripts.postbuild,/build-mobile-ui-polish\.mjs/);
for(const code of [css,js,build])assert.doesNotMatch(code,/\bfetch\s*\(|XMLHttpRequest|\.netlify\/functions|getDatabase\s*\(|exam_attempts|payment_requests|ykcr_student_sync|\/netlify\/database\//i);
assert.match(css,/body > \.wrap > \.hero#home/);
assert.match(css,/body\.yk787-exam-page \.wrap > #online-mock-exam/);
assert.match(css,/yk875-jlpt-pressed/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(js,/getBoundingClientRect\(\)/);
assert.match(js,/visibleGap-14/);
assert.match(js,/stopImmediatePropagation\(\)/);
assert.match(js,/replaying=true/);
assert.match(build,/const distant=!window\.matchMedia/);
assert.match(build,/yk-v7875-rc1-ui\.css\?v=7875rc1/);
assert.match(build,/yk-v7875-rc1-ui\.js\?v=7875rc1/);
if(process.argv.includes('--release')) {
 const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.name.endsWith('.html')?[join(d,e.name)]:[]);
 const pages=walk('dist');assert(pages.length>=22);
 for(const page of pages){
  const html=readFileSync(page,'utf8');
  for(const asset of ['yk-v7875-rc1-ui.css?v=7875rc1','yk-v7875-rc1-ui.js?v=7875rc1'])
   assert.equal(html.split(asset).length-1,1,`${page}: exactly one ${asset}`);
  for(const old of ['yk-mobile-nav.css?v=2','yk-ui-preferences.css?v=1'])
   assert.equal(html.split(old).length-1,1,`${page}: old UI component not retained`);
  assert(html.includes('id="yk-mobile-nav"'),`${page}: existing nav removed`);
 }
 const home=readFileSync('dist/index.html','utf8');
 assert.match(home,/id="ykMenuJLPTV7864"/);
 assert.match(home,/id="yk82Hub"/);
 assert.match(home,/const distant=!window\.matchMedia/);
 assert.match(readFileSync('dist/mock-exams.html','utf8'),/id="examPanel"/);
 console.log(`PASS v7.87.5-rc1 release fixture: ${pages.length} pages, both new assets, original menus/exam preserved`);
}
console.log('PASS v7.87.5-rc1 source guards');
