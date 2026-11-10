/** v7.86.5 — endpoint behavior with account-scoped mock DB. Not live Netlify/Postgres verification. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=resolve(root,'netlify/functions/exam-coach.mts');const temp=resolve(root,'netlify/functions/.test-v7865-exam-coach.mts');
let s=readFileSync(source,'utf8').replace("import { getDatabase } from '@netlify/database';",'const getDatabase=()=>globalThis.__coachDB;')
.replace("import { requireUser, asResponse } from './_shared/auth.mts';","const requireUser=async()=>{if(!globalThis.__coachUser)throw new Response('Unauthorized',{status:401});return globalThis.__coachUser};const asResponse=e=>e;");
writeFileSync(temp,s);
const handler=(await import(pathToFileURL(temp).href)).default;unlinkSync(temp);
let count=0;async function test(name,fn){await fn();count++;console.log('PASS v7865-api '+name)}
function reset(){const queries=[];globalThis.__coachUser={id:'student-A'};
 globalThis.__coachDB={sql:async(parts,...values)=>{const q=parts.join('?').replace(/\s+/g,' ').trim();queries.push({q,values});
  if(q.startsWith('SELECT a.id'))return [{id:12,exam_type:'truck',score:30,passed:false,submitted_at:'2026-11-10T10:00:00Z',topic_stats:[{id:'theory',correct:12,total:30},{id:'practical',correct:18,total:20}]}];
  if(q.startsWith('SELECT target_date'))return [{target_date:'2026-12-06'}];
  if(q.startsWith('INSERT INTO exam_coach_target_dates'))return [];
  throw Error('Unexpected query '+q);
 }};return queries;}
const get=(type='truck')=>new Request('http://local/.netlify/functions/exam-coach?exam_type='+encodeURIComponent(type));
const post=(type,date)=>new Request('http://local/.netlify/functions/exam-coach',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({exam_type:type,target_date:date})});
await test('GET returns only requested signed-in exam and server evidence',async()=>{
 const q=reset(),r=await handler(get());assert.equal(r.status,200);const data=await r.json();
 assert.equal(data.analysis.examType,'truck');assert.equal(data.analysis.topics[0].correct,12);
 assert.equal(data.targetDate,'2026-12-06');assert.match(r.headers.get('cache-control'),/no-store/);
 assert.equal(q.length,2);assert.deepEqual(q[0].values,['student-A','truck']);assert.deepEqual(q[1].values,['student-A','truck']);
});
await test('Reject invalid type and client controlled query',async()=>{
 const q=reset(),r=await handler(get('unknown'));assert.equal(r.status,400);assert.equal(q.length,0);
});
await test('POST validates date and uses bound user id',async()=>{
 const q=reset();const r=await handler(post('jlpt_n5','2026-12-06'));
 assert.equal(r.status,200);assert.deepEqual(q[0].values,['student-A','jlpt_n5','2026-12-06']);
});
await test('Invalid date and past date rejected before SQL',async()=>{
 const q=reset();for(const value of ['2026-02-30','2039-01-01','2020-01-01','<script>']){
  const r=await handler(post('truck',value));assert.equal(r.status,400,value);
 }assert.equal(q.length,0);
});
await test('Missing auth cannot read another student data',async()=>{
 const q=reset();globalThis.__coachUser=null;const r=await handler(get());assert.equal(r.status,401);assert.equal(q.length,0);
});
await test('Unknown HTTP method refused',async()=>{
 const q=reset();const r=await handler(new Request('http://local/.netlify/functions/exam-coach?exam_type=truck',{method:'DELETE'}));
 assert.equal(r.status,405);assert.equal(q.length,0);
});
console.log(`v7.86.5 API mocked ${count} PASS / 0 FAIL`);
