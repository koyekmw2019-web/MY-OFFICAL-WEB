/** v7.87.21 read-only preview smoke: local dist HTTP by default, or an
 * explicit HTTPS Netlify deploy-preview URL. Does not upload/deploy/change data.
 */
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join,dirname,sep} from 'node:path';
import assert from 'node:assert/strict';
const argv=process.argv.slice(2);
const get=(flag,other)=>{const x=argv.indexOf(flag);return x<0?other:argv[x+1]};
const dist=resolve(get('--dist','dist'));
const target=get('--base',null);
const reportPath=get('--report',null);
const names=['/','/mock-exams.html','/exams/truck.html','/exams/jlpt_n5.html','/study/jlpt-grammar-library.html','/study/jlpt-grammar-practice.html','/student-dashboard.html','/admin-dashboard.html','/login.html','/service-worker.js','/assets/yk-v78720-mobile-fixes.css'];
const mime=p=>({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.xml':'application/xml','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'}[p.match(/\.[^.]+$/)?.[0]]||'application/octet-stream');
let server=null;let base=null;let mode='LOCAL_HTTP_FIXTURE_OR_FULL_DIST';
try{
 if(target){const u=new URL(target);assert(u.protocol==='https:'||['localhost','127.0.0.1','[::1]'].includes(u.hostname),'Preview URL must be HTTPS or localhost');assert(u.pathname==='/'||!u.pathname,'Preview URL should be the deployment root');base=u.origin;mode='REMOTE_READ_ONLY_PREVIEW';}
 else {assert(existsSync(join(dist,'index.html')),'No generated dist/index.html to preview');server=createServer((req,res)=>{
   const pathname=new URL(req.url,'http://127.0.0.1').pathname;
   let decoded;try{decoded=decodeURIComponent(pathname)}catch{res.writeHead(400);res.end();return}
   if(!['GET','HEAD'].includes(req.method)||/\0/.test(decoded)||decoded.includes('..')||/\/(?:\.netlify|netlify|tests|src|scripts)(?:\/|$)/.test(decoded)){res.writeHead(404);res.end('Not Found');return}
   const file=resolve(dist,'.'+(decoded==='/'?'/index.html':decoded));
   if(!file.startsWith(dist+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end('Not Found');return}
   const body=readFileSync(file);res.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});res.end(body);
  });
  await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok)});
  base=`http://127.0.0.1:${server.address().port}`;
 }
 const results=[];
 for(const path of names){
  let status=0,ctype='',length=0,error='';
  try{const res=await fetch(new URL(path,base),{redirect:'follow',signal:AbortSignal.timeout(8000),headers:{'Accept':'*/*'}});status=res.status;ctype=res.headers.get('content-type')||'';const body=await res.arrayBuffer();length=body.byteLength;
    if(status!==200)error=`HTTP ${status}`;else if(path.endsWith('.html')||path==='/'){if(!ctype.includes('text/html'))error='Not HTML';else if(length<60)error='Empty HTML';}
    else if(path.endsWith('.js')&&!/javascript|text\/plain/.test(ctype))error='Unexpected JS content-type';
    else if(path.endsWith('.css')&&!ctype.includes('text/css'))error='Unexpected CSS content-type';
  }catch(e){error=String(e.message||e)}
  results.push({path,status,contentType:ctype,bytes:length,passed:!error,error});
 }
 // Never probe private authenticated endpoints or change live user data.
 const failed=results.filter(x=>!x.passed);const summary={version: (()=>{try{return JSON.parse(readFileSync('package.json','utf8')).version}catch{return 'unknown'}})(),runAt:new Date().toISOString(),mode,base:target?base:'http://127.0.0.1:<ephemeral>',status:failed.length?'FAIL':'PASS',checks:results.length,passed:results.length-failed.length,failed:failed.length,results,authenticatedFlowsTested:false,netlifyDeployTriggered:false,realDevicePerformanceMeasured:false};
 if(reportPath){const p=resolve(reportPath);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(summary,null,2)+'\n')}
 console.log(JSON.stringify(summary,null,2));if(failed.length)process.exitCode=1;
}finally{if(server)await new Promise(resolve=>server.close(resolve))}
