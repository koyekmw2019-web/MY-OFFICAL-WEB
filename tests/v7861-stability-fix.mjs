/** v7.86.1 isolated regressions for Postgres alias, mobile links and click-gated login.
 * Mocked database/DOM is NOT a live Netlify authentication or real SQL parser. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>readFileSync(join(root,file),'utf8');
let passed=0;
const test=async(label,fn)=>{await fn();console.log(`PASS v7861 ${label}`);passed++};
const server=read('netlify/functions/exam-admin-analytics.mts');
await test('release and source links are 7.86.1',()=>{
 const p=JSON.parse(read('package.json'));assert(['7.86.1','7.86.2','7.86.3','7.86.4'].includes(p.version));
 assert(p.scripts.test.includes('v7861-stability-fix.mjs'));assert(p.scripts.build.includes('v7861-stability-fix.mjs'));
 assert.match(read('netlify.toml'),/publish\s*=\s*"dist"/);
 assert.match(read('scripts/build-public-v7841.mjs'),/version:'7\.86\.(?:1|2|3|4)'/);
});
await test('PostgreSQL output labels use explicit safe aliases in BOTH date series',()=>{
 assert.match(server,/::date::text AS day_key,/);
 assert.match(server,/SELECT r\.value->>'day' AS day_key,/);
 assert.match(server,/GROUP BY r\.value->>'day' ORDER BY day_key ASC/);
 assert.doesNotMatch(server,/::text\s+day\s*,/);
 assert.doesNotMatch(server,/ORDER BY day ASC/);
 assert.equal((server.match(/day:String\(r\.day_key\)/g)||[]).length,2);
});
await test('report output retains day property used by existing dashboard graph',()=>{
 assert.match(server,/daily:trend\.map\(\(r:any\)=>\(\{day:String\(r.day_key\)/);
 assert.match(server,/dailyPractice:practice\.map\(\(r:any\)=>\(\{day:String\(r.day_key\)/);
});
await test('SQL mock returns chart dates and preserves verified pass-rate formula',async()=>{
 const code=stripTypeScriptTypes(server,{mode:'strip'})
   .replace(/^import .*;$/gm,'')
   .replace('export default async (req         ) => {','const handler = async (req) => {');
 assert.match(code,/const handler = async \(req\) => \{/);
 let authorized=true,failed=false;
 const calls=[];
 const db={sql:async(parts,...params)=>{
  const q=parts.join('?');calls.push({q,params});
  if(failed)throw new Error('sensitive SELECT secret_sql_text');
  if(q.includes('FROM exam_students'))return [{total:12,active:9}];
  if(q.includes('FROM exam_payment_requests'))return [{pending:2}];
  if(q.includes('GROUP BY exam_type'))return [{exam_type:'truck',submitted:5,verified:4,passed:3}];
  if(q.includes('GROUP BY (submitted_at'))return [{day_key:'2026-11-10',submitted:5,verified:4,passed:3}];
  if(q.includes('FROM exam_attempts'))return [{submitted:5,verified:4,passed:3}];
  if(q.includes('FROM ykcr_sync_events'))return [{received:5,inbound_24h:2}];
  if(q.includes('jsonb_array_elements'))return [{day_key:'2026-11-10',sessions:3,questions:10,correct:8}];
  if(q.includes('yk_jlpt_learning_progress'))return [{accounts:3,lessons_completed:25,recently_updated:1}];
  throw new Error('unexpected SQL');
 }};
 const ctx={Response,Request,URL,Date,console:{error:()=>{}},
  getDatabase:()=>db, requireAdmin:async()=>{if(!authorized)throw new Response('Forbidden',{status:403})},
  asResponse:e=>e instanceof Response?e:Response.json({error:'Unexpected error'},{status:500})};
 vm.createContext(ctx);vm.runInContext(code+'\nglobalThis.handler=handler',ctx);
 const h=ctx.handler;
 let r=await h(new Request('https://host.test/.netlify/functions/exam-admin-analytics?days=30'));
 assert.equal(r.status,200);const v=await r.json();
 assert.equal(v.exams.passRate,75);assert.equal(v.exams.daily[0].day,'2026-11-10');
 assert.equal(v.learning.dailyPractice[0].day,'2026-11-10');
 assert.equal(v.ykcr.queueStatus,'unknown');
 assert.equal(r.headers.get('Cache-Control'),'private, no-store');
 assert(calls.every(x=>x.params.every(p=>p===30)));
 authorized=false;r=await h(new Request('https://host.test/?days=30'));assert.equal(r.status,403);
 authorized=true;failed=true;r=await h(new Request('https://host.test/?days=30'));
 assert.equal(r.status,500);assert.doesNotMatch(JSON.stringify(await r.json()),/sensitive SELECT secret_sql_text/);
});
await test('database write access, payments, exams and YKCR untouched by analytics patch',()=>{
 assert.match(server,/await requireAdmin\(\)/);
 assert.doesNotMatch(server,/\b(?:UPDATE|DELETE|INSERT)\s+(?:exam_|ykcr_|INTO)/i);
 assert.match(server,/score_verified=TRUE/);
 assert.match(server,/passed IS NOT NULL/);
});
await test('JLPT nav is a 3-column one-row mobile grid while desktop stays intact',()=>{
 const css=read('assets/yk-jlpt-learning-v782.css');
 assert.match(css,/@media \(max-width: 620px\)/);
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/white-space:nowrap/);
 const html=read('study/jlpt-learning.html');
 assert.equal((html.match(/<nav class="yk82-top-links"[^>]*>(.*?)<\/nav>/s)?.[1].match(/class="yk82-pill"/g)||[]).length,3);
 assert(html.includes('yk-jlpt-learning-v782.css?v=7861'));
});
await test('login requires explicit button interaction, Enter/form-submit never invokes API',()=>{
 const html=read('login.html'),js=read('assets/yk-login-v757.js');
 assert.match(html,/<button class="auth-submit" type="button" id="loginSubmit">/);
 assert.match(js,/\$\('loginForm'\)\.addEventListener\('submit',e=>\{e\.preventDefault\(\)/);
 assert.match(js,/\$\('loginSubmit'\)\.addEventListener\('click'/);
 assert.equal((js.match(/await id\.login\(/g)||[]).length,1);
 assert(html.includes('yk-login-v757.js?v=7861'));
 assert(js.includes('clickLogin'));
});
await test('legacy auth bundle and existing session mechanism kept',()=>{
 assert(read('login.html').includes('/assets/identity.bundle.js'));
 assert(read('src/identity-client.js').includes('handleAuthCallback'));
 assert(read('index.html').includes('<title>YE KUN Official Website | YE LINN OO</title>'));
 assert(read('service-worker.js').includes('v7861-stability'));
});
console.log(`v7.86.1 regression: ${passed} PASS / 0 FAIL`);
