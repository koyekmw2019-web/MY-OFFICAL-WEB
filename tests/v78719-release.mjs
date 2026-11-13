/** Post-build gate. Must run against complete checked-out repository after all
 * previous build steps; not against a standalone cumulative source ZIP. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const dist=resolve('dist');
// Existing checkout's server-side access controls must remain present.
const approvals=readFileSync('netlify/functions/exam-admin-payments.mts','utf8');
for(const expected of ['await requireAdmin()','verifyRequestOrigin(req)','FOR UPDATE','BEGIN','COMMIT',"status !== \"pending\""]){
  // Test below also accepts existing single-quote style for status comparisons.
  if(expected.includes('status !=='))continue;
  assert(approvals.includes(expected),'Missing transactional payment admin guard: '+expected);
}
assert(approvals.includes('p.status !== "pending"')||approvals.includes("p.status !== 'pending'"),'Payment review must reject duplicate approval');
const syncSource=readFileSync('netlify/functions/ykcr-student-sync.mts','utf8');
assert(syncSource.includes('signatureMatches(')&&syncSource.includes('timingSafeEqual('),'YKCR signed event verification is missing');
assert(syncSource.includes('ykcr_sync_events'),'YKCR replay protection is missing');
const accessSource=readFileSync('netlify/functions/exam-access.mts','utf8');
assert(accessSource.includes('isFreeUniqueViolation(e)')&&accessSource.includes("reason:'payment_required'"),'Per-exam access lock / payment_required handler missing');
const types=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1'];
const pages=['mock-exams.html',...types.map(t=>'exams/'+t+'.html')];
let checked=0;
for(const page of pages){
 const file=join(dist,page);assert(existsSync(file),'Missing Exam Center page: '+page);
 const html=readFileSync(file,'utf8');
 assert(html.includes('v7.87.18: targeted guest / plan copy'),'Missing 3-language access text fix: '+page);
 assert(html.includes('yk-v78718-exam-access.css'),'Missing mobile plan styles: '+page);
 assert(html.includes('one free attempt per account'),'Per-exam free attempt copy missing: '+page);
 assert(html.includes('price:1000')&&html.includes('price:2000')&&html.includes('price:3000')&&html.includes('price:5000'),'Price list changed: '+page);
 for(const key of ['examAccessTitleV728','examAccessTextV728','examPlanMiniTextV739','examPlansV728'])assert(html.includes(key),'Access/Plan control missing: '+page+' '+key);
 if(page.startsWith('exams/'))assert(html.includes('data-exam-type="'+page.slice(6,-5)+'"'),'Wrong individual exam route '+page);
 checked++;
}
for(const asset of ['assets/yk-v78718-exam-access.css','assets/yk-v78714-engine.js','assets/yk-v78715-insights-engine.js','assets/yk-v78716-calendar-engine.js'])
 assert(existsSync(join(dist,asset)),'Missing published asset '+asset);
for(const privateFile of ['netlify/functions/_shared/auth.mts','netlify/functions/exam-student-verify.mts','netlify/functions/exam-payment-submit.mts','netlify/functions/yk-system-health.mts'])
 assert(!existsSync(join(dist,privateFile)),'Private backend was published '+privateFile);
console.log('PASS v78719-release: '+checked+' real generated exam routes, pricing/localization intact, no private backend in dist');
