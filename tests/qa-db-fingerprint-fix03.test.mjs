import test from 'node:test';
import assert from 'node:assert/strict';
import { QA, endpointParts, endpointFingerprint, runDiagnostic } from '../netlify/functions/_shared/qa-db-fingerprint-v7902.mjs';
const connection='postgresql://synthetic:synthetic@qa.example.test/db';
const fingerprint=endpointFingerprint(endpointParts(connection));
const ctx={site:{id:QA.site},account:{id:QA.team},deploy:{context:'production',published:true},user:{id:'synthetic'}};
const url=QA.origin+QA.path;
for (const origin of [null,'null','https://foreign.example','https://yekun-ordinary-second-qa.netlify.app.evil.example',QA.origin+'/']) {
  test(`reject ${String(origin)} Origin before SDK`,async()=>{
    let touched=0;
    const headers={'content-type':'application/x-www-form-urlencoded'};
    if(origin!==null) headers.origin=origin;
    const r=await runDiagnostic(new Request(url,{method:'POST',headers,body:'fingerprint='+fingerprint}),ctx,{getConnectionString(){touched++;},getDatabase(){touched++;}});
    assert.equal(r.status,403);assert.equal(touched,0);assert.equal(r.headers.get('referrer-policy'),'no-referrer');
  });
}
test('only clean authorized GET changes referrer policy, retains strict CSP/no-cache',async()=>{
  const d={getConnectionString(){throw Error('must not call');},getDatabase(){throw Error('must not call');}};
  const r=await runDiagnostic(new Request(url),ctx,d);
  assert.equal(r.status,200);assert.equal(r.headers.get('referrer-policy'),'same-origin');
  assert.match(r.headers.get('content-security-policy'),/form-action 'self'/);assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.match(r.headers.get('cache-control'),/no-store/);assert.equal(r.headers.get('access-control-allow-origin'),null);
  for(const u of [url+'?secret=synthetic',url.replace(QA.origin,'https://other.example')]){
    const denied=await runDiagnostic(new Request(u),ctx,d);assert.equal(denied.status,404);assert.equal(denied.headers.get('referrer-policy'),'no-referrer');
  }
});
test('successful POST retains no-referrer and unchanged SQL contract',async()=>{
  let queries=0;const r=await runDiagnostic(new Request(url,{method:'POST',headers:{origin:QA.origin,'content-type':'application/x-www-form-urlencoded'},body:'fingerprint='+fingerprint}),ctx,{getConnectionString:()=>connection,getDatabase:()=>({sql:async(strings,...params)=>{queries++;assert.deepEqual([...strings],['SELECT current_database() = ',' AS database_matches']);assert.deepEqual(params,['db']);return [{database_matches:true}];}})});
  assert.equal(r.status,200);assert.equal(queries,1);assert.equal(r.headers.get('referrer-policy'),'no-referrer');assert.equal((await r.json()).status,'verified_endpoint_and_database_name');
});
