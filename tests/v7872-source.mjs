/** Pre-build assertions: no backend modification, routes and build are wired. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
assert(['7.87.2','7.87.3','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version));
assert(pkg.scripts.build.includes('node scripts/build-v787-exam-pages.mjs && node tests/v787-release.mjs'));
assert(pkg.scripts.build.includes('node scripts/build-v7872-mobile-exams.mjs && node tests/v7872-release.mjs'));
const route=read('assets/yk-v787-routing.js');
assert(route.includes("'/exams/'"));
assert(route.includes("if(isExamPage)return"));
assert(route.includes('location.assign(route(type))'));
assert(route.includes('location.replace(route(query))'));
assert(read('scripts/build-v7872-mobile-exams.mjs').includes('data-exam-v728='));
for(const f of ['assets/yk-v7872-exam-mobile.css','assets/yk-v7872-exam-mobile.js'])assert(existsSync(f));
assert(!read('assets/yk-v7872-exam-mobile.js').includes('requestStart('));
assert(read('netlify.toml').includes('publish = "dist"'));
// Check the actual capture handler without requesting any server-side exam attempt.
function routeFixture(pathname, search='') {
 const calls=[]; let clickHandler=null;
 const location={pathname,search,hash:'',assign:x=>calls.push(['assign',x]),replace:x=>calls.push(['replace',x])};
 const document={addEventListener:(type,fn)=>{if(type==='click')clickHandler=fn},querySelector:()=>null};
 vm.runInNewContext(route,{location,document,URLSearchParams,addEventListener:()=>{}});
 return {calls, click:(type)=>{
  const b={dataset:{examV728:type}};
  let prevented=false;
  clickHandler({target:{closest:()=>b},preventDefault:()=>{prevented=true},stopImmediatePropagation:()=>{}});
  return prevented;
 }};
}
const center=routeFixture('/mock-exams.html');
assert(center.click('truck'));
assert.equal(center.calls[0][1],'/exams/truck.html');
const single=routeFixture('/exams/truck.html');
assert.equal(single.click('truck'),false,'Do not intercept the original Start button on exam page');
assert.equal(single.calls.length,0);
const legacy=routeFixture('/mock-exams.html','?exam=jlpt_n5');
assert.equal(legacy.calls[0][1],'/exams/jlpt_n5.html');
console.log('PASS v7872-source independent routes, legacy link and exam button safety');
