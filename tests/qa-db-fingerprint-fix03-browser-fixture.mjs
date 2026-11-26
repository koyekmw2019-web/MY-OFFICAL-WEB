// Loopback-only test harness. No Netlify SDK, network DB or real identity.
import http from 'node:http';
import { QA, endpointParts, endpointFingerprint, runDiagnostic } from '../netlify/functions/_shared/qa-db-fingerprint-v7902.mjs';
const connection='postgresql://synthetic:synthetic@qa-pooler.example.test/db';
const fingerprint=endpointFingerprint(endpointParts('postgresql://readonly:synthetic@qa.example.test/db'));
const counts={connection:0,client:0,queries:0};
let last=null;
const ctx={site:{id:QA.site},account:{id:QA.team},deploy:{context:'production',published:true},user:{id:'synthetic'}};
const server=http.createServer(async(req,res)=>{
 try {
  const base='http://127.0.0.1:'+server.address().port;
  if(req.url==='/state'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({counts,last,fingerprint}));}
  if(req.url==='/attacker'){res.setHeader('Content-Type','text/html');return res.end(`<form action="${base}/fixed" method="post"><input name="fingerprint" value="${fingerprint}"><button>Submit</button></form>`);}
  const mode=req.url;
  if(!['/fixed','/legacy','/denied'].includes(mode)){res.statusCode=404;return res.end();}
  let body='';for await(const chunk of req){body+=chunk;if(body.length>1024)throw Error('too large');}
  const headers=new Headers();if(req.headers['content-type'])headers.set('content-type',req.headers['content-type']);
  // Preserve native browser Origin; translate ONLY exact trusted loopback origin to canonical QA origin.
  const origin=req.headers.origin;if(origin!==undefined)headers.set('origin',origin===base?QA.origin:origin);
  const request=new Request(QA.origin+QA.path,{method:req.method,headers,...(req.method==='POST'?{body}:{})});
  const result=await runDiagnostic(request,mode==='/denied'?{...ctx,user:undefined}:ctx,{getConnectionString(){counts.connection++;return connection;},getDatabase(){counts.client++;return {sql:async()=>{counts.queries++;return [{database_matches:true}];}};}});
  if(req.method==='POST')last={mode,origin:origin??null,status:result.status,referer:req.headers.referer??null};
  res.statusCode=result.status;for(const [k,v] of result.headers)res.setHeader(k,v);
  // Reproduce FIX02 policy exactly; all other logic is unchanged.
  if(mode==='/legacy'&&req.method==='GET')res.setHeader('Referrer-Policy','no-referrer');
  res.end(await result.text());
 }catch{res.statusCode=500;res.end('fixture error');}
});
server.listen(0,'127.0.0.1',()=>console.log(server.address().port));
