/** Isolated local mock test for new v7.82 backend; does not contact Netlify/production. */
import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {stripTypeScriptTypes} from 'node:module';import vm from 'node:vm';
let code=stripTypeScriptTypes(readFileSync(new URL('../netlify/functions/jlpt-learning-progress.mts',import.meta.url),'utf8'),{mode:'strip'});
code=code.replace(/^import .*?;\s*$/gm,'').replace('export default async','globalThis.handler=async');
const rows=new Map();let user='alice',signedIn=true;
const getDatabase=()=>({sql:async(strings,...params)=>{const sql=strings.join('?').replace(/\s+/g,' ');
 if(sql.includes('SELECT state FROM yk_jlpt_learning_progress'))return rows.has(params[0])?[{state:rows.get(params[0])}]:[];
 if(sql.includes('INSERT INTO yk_jlpt_learning_progress')){rows.set(params[0],JSON.parse(params[1]));return []}
 throw new Error('Unexpected SQL '+sql);
}});
const requireUser=async()=>{if(!signedIn)throw new Response('Unauthorized',{status:401});return {id:user}};
const asResponse=e=>e instanceof Response?e:Response.json({error:'Server error'},{status:500});
const context={getDatabase,requireUser,asResponse,Response,console,URL};vm.createContext(context);vm.runInContext(code,context);
const handler=context.handler;
const body=state=>new Request('http://localhost',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({state})});
const get=()=>new Request('http://localhost',{method:'GET'});
let r=await handler(body({completed:['N5-v-1'],bookmarkTimestamps:{'N5-v-1':100},dailyRuns:[{day:'2026-11-09',level:'N5',count:5,correct:4,finishedAt:111}],lastLevel:'N5',lastLevelAt:12,updatedAt:100}));assert.equal(r.status,200);
r=await handler(get());assert.equal(r.status,200);let state=(await r.json()).state;assert.equal(state.completed[0],'N5-v-1');
user='bob';r=await handler(get());assert.deepEqual((await r.json()).state,{});
user='alice';r=await handler(body({completed:['N5-g-1'],bookmarkTimestamps:{'N5-v-1':-200},dailyRuns:[],lastLevel:'N4',lastLevelAt:20,updatedAt:200}));assert.equal(r.status,200);
r=await handler(get());state=(await r.json()).state;assert.equal(state.completed.length,2);assert.equal(state.bookmarkTimestamps['N5-v-1'],-200);assert.equal(state.dailyRuns.length,1);assert.equal(state.lastLevel,'N4');
signedIn=false;r=await handler(get());assert.equal(r.status,401);
signedIn=true;r=await handler(body({completed:['evil-code','N1-v-1'],dailyRuns:[],lastLevel:'Q1',updatedAt:300}));assert.equal(r.status,200);r=await handler(get());state=(await r.json()).state;assert(!state.completed.includes('evil-code'));assert(state.completed.includes('N1-v-1'));
console.log('PASS v7.82 mock API authorization, account isolation, state sanitization, merge and bookmark removal');
