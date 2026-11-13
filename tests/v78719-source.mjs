/** v7.87.19 — source release safety: cumulative patch, critical access flow. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const pkg=JSON.parse(readFileSync('package.json','utf8'));
assert(['7.87.19','7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(pkg.version));
assert(pkg.scripts.test.includes('tests/v78719-backend.mock.mjs'));
assert(pkg.scripts.build.includes('node tests/v78719-release.mjs')); 
assert(pkg.scripts['verify:release'].includes('node tests/v78719-release.mjs')); 
for(const f of [
 'netlify/functions/_shared/auth.mts', 'netlify/functions/exam-student-verify.mts',
 'netlify/functions/exam-payment-submit.mts','netlify/functions/exam-status.mts',
 'netlify/functions/yk-system-health.mts',
 'netlify/functions/yk-enrollment-crm.mts', 'netlify/functions/yk-business-growth.mts',
 'netlify/functions/_shared/exam-autosave.mts',
 'netlify/database/migrations/20261112090000_yk_growth_analytics.sql',
 'netlify/database/migrations/20261112140000_yk_enrollment_crm.sql',
 'assets/yk-v78714-engine.js','assets/yk-v78715-insights-engine.js',
 'assets/yk-v78716-calendar-engine.js','assets/yk-v78717-admin.js',
 'scripts/build-v78718-exam-access-copy.mjs'
])assert(existsSync(f),'Missing inherited source '+f);
const auth=readFileSync('netlify/functions/_shared/auth.mts','utf8');
assert(auth.includes('Array.isArray(user.roles)'));
const student=readFileSync('netlify/functions/exam-student-verify.mts','utf8');
assert(student.includes('linked_user_id IS NULL OR linked_user_id='));
assert(student.includes('RETURNING student_code,name,class_name,class_start,expire_date'));
const payment=readFileSync('netlify/functions/exam-payment-submit.mts','utf8');
assert(payment.includes('Object.prototype.hasOwnProperty.call(PLAN_PRICE, plan)'));
assert(payment.includes('try {\n      email = await sendAdminPaymentEmail'));
assert(payment.indexOf('INSERT INTO exam_payment_requests')<payment.indexOf('await sendAdminPaymentEmail('));
assert(payment.includes('status: "pending"'));
const status=readFileSync('netlify/functions/exam-status.mts','utf8');
assert(status.includes('freeAttemptLimitPerExamType: 1'));
assert(status.includes('Cache-Control": "private, no-store'));
const health=readFileSync('netlify/functions/yk-system-health.mts','utf8');
assert(health.includes('await requireAdmin()'));
for(const table of ['exam_attempts','exam_paid_access','exam_payment_requests','ykcr_sync_events','yk_growth_click_events','yk_enrollment_leads'])assert(health.includes(table));
assert(pkg.scripts.build.includes('scripts/build-v7872-mobile-exams.mjs'),'12 dedicated exam route build is required');
const css=readFileSync('assets/yk-v78718-exam-access.css','utf8');assert(css.length>100);
const cfg=JSON.parse(readFileSync('assets/yk-v78714-choice-bank.json','utf8'));assert(cfg);
console.log('PASS v78719-source: critical access/payment safeguards, cumulative backend and exam/learning source present');
