/** Actual nishu handlers with only Identity/SQL dependencies stubbed. No network. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
let user=null, queries=[], rows=[];
globalThis.__nishuQA={user:()=>user,sql:async(strings,...args)=>{queries.push({sql:strings.join('?'),args});return rows;}};
async function load(name){
 const path=resolve(`netlify/functions/.${name}.qa.mts`);
 const src=readFileSync(`netlify/functions/${name}.mts`,'utf8')
  .replace(/^import .* from ['"]@netlify\/database['"];$/m,'const getDatabase=()=>globalThis.__nishuQA;')
  .replace(/^import .* from ['"]\.\/_shared\/auth.mts['"];$/m,"const requireUser=async()=>{const user=globalThis.__nishuQA.user();if(!user)throw new Response('Unauthorized',{status:401});return user;};const asResponse=e=>{if(e instanceof Response)return e;throw e;};");
 writeFileSync(path,src);try{return (await import(pathToFileURL(path).href)).default;}finally{unlinkSync(path);}
}
try{
 for(const name of ['exam-nishu-history','exam-nishu-review']){
  const handler=await load(name),request=(id='1')=>new Request(`https://qa.invalid/?attemptId=${id}`);
  queries=[];user=null;
  assert.equal((await handler(request())).status,401);assert.equal(queries.length,0);
  assert.equal((await handler(new Request('https://qa.invalid/',{method:'POST'}))).status,405);
  user={id:'qa-owner'};rows=[];
  if(name.endsWith('review')){
   queries=[];assert.equal((await handler(request('-1'))).status,400);assert.equal(queries.length,0);
   assert.equal((await handler(request())).status,404);
   rows=[{id:1,status:'started'}];assert.equal((await handler(request())).status,409);
   rows=[{id:1,status:'submitted',score:90,passed:true}];
  }else rows=[{id:1,score:90,passed:true,score_verified:true}];
  const response=await handler(request());assert.equal(response.status,200);
  assert.equal(response.headers.get('cache-control'),'private, no-store');
  for(const query of queries){assert(query.sql.includes('user_id=?'));assert(query.args.includes('qa-owner'));assert(query.sql.includes("exam_type='nishu'"));assert(!/INSERT|UPDATE|DELETE/.test(query.sql));}
  const body=await response.json();
  if(name.endsWith('review')){assert.equal(Object.keys(body.text).length,90);assert.equal(Object.keys(body.visual).length,5);}
  else{assert(queries.at(-1).sql.includes("status='submitted'"));assert.equal(body.results[0].verified,true);}
  console.log('PASS',name,'auth, method, ownership-scoped SQL, no-store and completed-result contract');
 }
}finally{delete globalThis.__nishuQA;}
