/** Selected cumulative-release regression only; this is NOT npm test / full build. */
import {spawnSync} from 'node:child_process';
import {existsSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const names=`v7873-source v7874-source v7875-source v7875-runtime v7876-source v7876-engine v7877-source v7877-runtime v7878-source v7878-crm v7878-crm-api.mock v7879-data v7879-source v7879-bridge v78710-content v78711-stability v78712-source v78713-static v78713-build-fixture v78714-engine v78714-source v78714-build-fixture v78715-engine v78715-source v78715-build-fixture v78716-engine v78716-source v78716-build-fixture v78717-engine v78717-api.mock v78717-source v78717-build-fixture v78718-source v78718-build-fixture v78719-backend.mock v78719-source v78720-source v78720-sw-runtime v78720-build-fixture v78721-source v78721-fixture`.split(' ');
const location=process.argv.includes('--report')?process.argv[process.argv.indexOf('--report')+1]:null;
const results=[];
for(const name of names){
 const script=`tests/${name}.mjs`;
 if(!existsSync(script)){results.push({test:name,passed:false,error:'Test source missing (full repository needed)'});continue}
 const args=[];
 if(['v78711-stability','v7877-runtime','v7878-crm-api.mock','v78717-api.mock','v78719-backend.mock'].includes(name))args.push('--experimental-strip-types');
 args.push(script);const p=spawnSync(process.execPath,args,{encoding:'utf8',timeout:120000});
 const passed=p.status===0;results.push({test:name,passed,exitCode:p.status,stdoutTail:(p.stdout||'').slice(-400),stderrTail:passed?'':(p.stderr||'').slice(-1200)});
 console.log(`${passed?'PASS':'FAIL'} ${name}`);
}
const report={version:'7.87.21',scope:'SELECTED_REGRESSION_ONLY',passed:results.filter(x=>x.passed).length,total:results.length,complete:results.every(x=>x.passed),fullBuildTested:false,results};
if(location){const f=resolve(location);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,JSON.stringify(report,null,2)+'\n')}
if(!report.complete)process.exitCode=1;
