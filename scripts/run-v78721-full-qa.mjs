/** Execute the real full-repo gates; refuses partial patch-only checkouts. */
import {spawnSync} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
const reportPath=process.argv.includes('--report')?process.argv[process.argv.indexOf('--report')+1]:null;
const checks=[];let blocked=false;
for(const path of ['index.html','src/identity-client.js','scripts/build-public-v7841.mjs','netlify.toml']){
 if(!existsSync(path)){console.error(`BLOCKED full-repo QA: missing ${path}. Apply cumulative ZIP to an intact GitHub checkout first.`);blocked=true;}
}
if(!blocked)for(const [name,args] of [['FULL_NPM_TEST',['test']],['FULL_NPM_BUILD',['run','build']],['RELEASE_GATES',['run','verify:release']]]){
 const start=Date.now();const r=spawnSync('npm',args,{stdio:'pipe',encoding:'utf8',timeout:180000,env:{...process.env,CI:'1'}});
 const passed=r.status===0;
 checks.push({name,passed,exitCode:r.status,seconds:+((Date.now()-start)/1000).toFixed(1),outputTail:(r.stdout||'').slice(-2500),errorTail:(r.stderr||'').slice(-2500)});
 console.log(`${passed?'PASS':'FAIL'} ${name}: ${checks.at(-1).seconds}s`);
 if(!passed){console.error((r.stderr||'').slice(-5000));break;}
}
const sourceCommit=(()=>{try{return execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()}catch{return null}})();
const result={version: (()=>{try{return JSON.parse(readFileSync('package.json','utf8')).version}catch{return 'unknown'}})(),runAt:new Date().toISOString(),sourceCommit,source:'full original checkout required',blocked,passed:!blocked&&checks.length===3&&checks.every(x=>x.passed),checks,liveNetlifyDeployPreviewVerified:false,notes:['Local full checkout != Netlify Deploy Preview','No private payments or real student records modified']};
if(reportPath){const f=resolve(reportPath);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,JSON.stringify(result,null,2)+'\n')}
if(!result.passed)process.exitCode=1;
