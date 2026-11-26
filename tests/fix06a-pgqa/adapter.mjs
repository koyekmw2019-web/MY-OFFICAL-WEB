// Test-only SDK adapters. No Netlify SDK, hosted credentials or hosted calls.
import { AsyncLocalStorage } from 'node:async_hooks';
import { Pool } from 'pg';
import assert from 'node:assert/strict';
if(process.env.YKOC_LOCAL_QA!=='disposable-v1' || process.env.GITHUB_ACTIONS!=='true' || process.env.GITHUB_REPOSITORY!=='koyekmw2019-web/MY-OFFICAL-WEB' || process.env.GITHUB_HEAD_REF!=='qa/v7.90.2-secure-identity') throw Error('Run only in isolated authorized QA CI');
const context=new AsyncLocalStorage();
export const pool=new Pool({host:'127.0.0.1',port:5432,user:'ykoc_fixture',password:'synthetic-only-fixture',database:'ykoc_fixture',ssl:false,max:8,connectionTimeoutMillis:5000,options:'-c timezone=UTC -c statement_timeout=15000 -c lock_timeout=10000'});
export const getUser=async()=>context.getStore()?.user??null;
export function asUser(user,fn,options={}){return context.run({user,...options},fn);}
export function getDatabase(){
 const state=context.getStore();assert.ok(state,'Missing synthetic context');
 return {sql:async(parts,...params)=>{
   let sql=parts.reduce((a,b,i)=>a+'$'+i+b);
   // Fixed clocks only for deterministic boundary cases; real PostgreSQL evaluates SQL.
   if(state.clock && /\bCURRENT_TIMESTAMP\b|\bNOW\(\)/i.test(sql)){
     params.push(state.clock);sql=sql.replace(/\bCURRENT_TIMESTAMP\b|\bNOW\(\)/gi,'$'+params.length+'::timestamptz');
   }
   const {rows}=await pool.query(sql,params);
   if(state.afterRead && /^SELECT id,student_code,status,verification_code_hash,linked_user_id FROM exam_students/.test(sql.trim())) await state.afterRead(rows);
   return rows;
 },pool:{connect:async()=>{
   const client=await pool.connect();let inserts=0;
   return {query:async(sql,params)=>{
     if(state.injectSecondInsertFailure && /^INSERT INTO exam_students\(/.test(sql) && ++inserts===2){
       const seen=await client.query('SELECT COUNT(*)::int AS n FROM exam_students WHERE student_code=$1',[state.firstId]);
       assert.equal(seen.rows[0].n,1,'First insert must be visible within transaction');
       const invalid=[...params];invalid[1]=null;
       try{return await client.query(sql,invalid);}catch(e){state.rollbackEvidence.code=e.code;throw e;}
     }
     return client.query(sql,params);
   },release:()=>client.release()};
 }}};
}
