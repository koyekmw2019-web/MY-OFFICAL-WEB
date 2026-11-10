/* Isolated API runtime check: Node VM with fake Netlify Identity + SQL responses.
   DOES NOT claim to test a real Netlify deployment or real PostgreSQL syntax. */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {stripTypeScriptTypes} from 'node:module';
const source=fs.readFileSync(new URL('../netlify/functions/exam-admin-analytics.mts',import.meta.url),'utf8');
const stripped=stripTypeScriptTypes(source,{mode:'strip'})
 .replace(/^import .*;$/gm,'')
 .replace('export default async (req         ) => {','const handler = async (req) => {');
assert.ok(stripped.includes('const handler = async (req) => {'),'handler transform');
const sqlCalls=[];
let authorized=false,empty=false;
const sql=async (fragments,...params)=>{
 const q=fragments.join('?'); sqlCalls.push({q,params});
 if(q.includes('FROM exam_students'))return [{total:12,active:9,inactive_or_expired:3,upcoming:0}];
 if(q.includes('FROM exam_payment_requests'))return [{pending:2,approved:4,rejected:0}];
 if(q.includes('FROM exam_attempts') && q.includes('GROUP BY exam_type'))return empty?[]:[{exam_type:'truck',submitted:5,verified:4,passed:3}];
 if(q.includes('FROM exam_attempts') && q.includes('GROUP BY (submitted_at'))return empty?[]:[{day:'2026-11-09',submitted:5,verified:4,passed:3}];
 if(q.includes('FROM exam_attempts'))return [{submitted:5,verified:empty?0:4,passed:empty?0:3}];
 if(q.includes('FROM ykcr_sync_events'))return [{received:10,inbound_24h:2,inbound_7d:4,last_received_at:'2026-11-09T06:00:00Z'}];
 if(q.includes('jsonb_array_elements'))return [{day:'2026-11-09',sessions:8,questions:80,correct:60}];
 if(q.includes('FROM yk_jlpt_learning_progress'))return [{accounts:4,lessons_completed:32,recently_updated:2}];
 throw Error('Unexpected query '+q);
};
const ctx={Response,Request,URL,Date,console,
 getDatabase:()=>({sql}),
 requireAdmin:async()=>{if(!authorized)throw new Response('Forbidden',{status:403})},
 asResponse:e=>e instanceof Response?e:Response.json({error:e.message},{status:500})};
vm.createContext(ctx);
vm.runInContext(stripped+'\nglobalThis.apiHandler=handler;',ctx);
const handler=ctx.apiHandler;
let checks=0;
const test=async(label,fn)=>{await fn();console.log('PASS v784 API',label);checks++};
await test('reject POST',async()=>assert.equal((await handler(new Request('https://example.test/f',{method:'POST'}))).status,405));
await test('deny unauthorized GET before DB query',async()=>{const old=sqlCalls.length;const r=await handler(new Request('https://example.test/f?days=30'));assert.equal(r.status,403);assert.equal(sqlCalls.length,old)});
authorized=true;
await test('reject invalid date period',async()=>assert.equal((await handler(new Request('https://example.test/f?days=366'))).status,400));
await test('admin receives only aggregates, verified pass rate, unknown upstream queue',async()=>{
 const r=await handler(new Request('https://example.test/f?days=30'));assert.equal(r.status,200);const data=await r.json();
 assert.equal(data.exams.passRate,75);assert.equal(data.exams.passed,3);assert.equal(data.exams.verified,4);
 assert.equal(data.students.active,9);assert.equal(data.payments.pending,2);assert.equal(data.ykcr.inbound24h,2);
 assert.equal(data.ykcr.queueStatus,'unknown');assert.equal(data.learning.dailyPractice[0].sessions,8);
 assert.ok(!('studentName' in data)&&!('email' in data));
 assert.equal(r.headers.get('cache-control'),'private, no-store');
});
await test('query parameters are enum-bound',async()=>assert.ok(sqlCalls.every(x=>x.params.every(p=>p===30))));
await test('no fake 0% pass rate for no verified exams',async()=>{
 empty=true;const data=await (await handler(new Request('https://example.test/f?days=7'))).json();
 assert.equal(data.exams.passRate,null);assert.equal(data.exams.byType.length,0);
});
console.log(`v784 admin API mock: ${checks} PASS`);
