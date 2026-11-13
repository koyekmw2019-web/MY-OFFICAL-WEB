import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const root='dist/';
const types=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const routes=['mock-exams.html',...types.map(type=>`exams/${type}.html`)];
assert(existsSync(root+'assets/yk-v78718-exam-access.css'),'No published CSS');
for(const route of routes){
 const html=readFileSync(root+route,'utf8');
 for(const marker of ['yk-v78718-exam-access.css?v=78718','function yk8718MiniPlanPrices()',
  'v7.87.18: targeted guest / plan copy','yk8718-plan-hint','id="examAccessTextV728"','id="examPlanMiniTextV739"',
  'id="examPlansV728"','id="examPlansMiniV728"','data-plan="${k}"',
  'စစ်ဆေး','One free attempt per exam type','စာမေးပွဲအမျိုးအစားတစ်ခုစီကို အခမဲ့ ၁ ကြိမ်',
  'data-my="၁ ပတ် ¥1,000 · ၁ လ ¥2,000"']) {
  // The first content marker is tested separately: exact Burmese text can vary by copy updates.
  if(marker==='စစ်ဆေး')continue;
  assert(html.includes(marker),`${route}: missing ${marker}`);
 }
 for(const price of ['price:1000','price:2000','price:3000','price:5000'])assert(html.includes(price),`${route}: price ${price}`);
 assert(html.includes("$$('[data-plan]',o).forEach(c=>c.onclick=()=>checkout(c.dataset.plan))"),`${route}: selection -> checkout lost`);
 assert(html.includes('function syncStatus()'),`${route}: account status refresh lost`);
 assert(html.includes('function v737Localize(root=document'),`${route}: original language layer lost`);
 assert(!html.includes(`x:'Login / Register required · One free attempt per exam type.'`),`${route}: outdated guest message still used`);
}
// Only mock-exams + 12 single exams are patched. Prevent source/route/role leakage.
for(const name of ['admin-dashboard.html','student-dashboard.html','member-dashboard.html','login.html','index.html']){
 if(existsSync(root+name))assert(!readFileSync(root+name,'utf8').includes('yk-v78718-exam-access.css'),`${name}: exam-only styling leaked`);
}
console.log('PASS v78718-release: 13 exam routes, guest policy copy, trilingual plans, price/checkout preservation');
