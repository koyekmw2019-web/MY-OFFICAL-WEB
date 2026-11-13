/** v7.88.0 non-bypassable NO-GO default and explicit evidence requirements. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
const root=resolve();const tmp=mkdtempSync(join(tmpdir(),'yk-v7880-gate-'));
try{
 const gate=join(root,'scripts/evaluate-v7880-stable.mjs');
 const run=(args=[])=>{const report=join(tmp,'decision.json');const p=spawnSync(process.execPath,[gate,'--root',tmp,'--report',report,...args],{encoding:'utf8'});return {status:p.status,result:JSON.parse(readFileSync(report,'utf8'))}};
 mkdirSync(tmp,{recursive:true});
 writeFileSync(join(tmp,'package.json'),JSON.stringify({version:'7.88.1-rc.1'}));
 const empty=run();assert.equal(empty.status,2);assert.equal(empty.result.decision,'NO_GO');assert(empty.result.blockerCount>=8);
 const forged={version:'7.88.1-rc.1',passed:true,blocked:false,checks:[{name:'FULL_NPM_TEST',passed:true},{name:'FULL_NPM_BUILD',passed:true},{name:'RELEASE_GATES',passed:true}]};
 const audit={mode:'SYNTHETIC_FIXTURE_NOT_PRODUCTION',result:'PASS',checksFailed:0,criticalRoutes:29,repoVersion:'7.88.1-rc.1'};
 const preview={mode:'LOCAL_HTTP_FIXTURE_OR_FULL_DIST',status:'PASS',failed:0,checks:11,base:'https://site.netlify.app'};
 writeFileSync(join(tmp,'QA_v7_88_0_FULL_REPO.json'),JSON.stringify(forged));
 writeFileSync(join(tmp,'QA_v7_88_0_RELEASE_AUDIT.json'),JSON.stringify(audit));
 writeFileSync(join(tmp,'QA_v7_88_0_PREVIEW.json'),JSON.stringify(preview));
 const bad=run();assert.equal(bad.status,2);assert(bad.result.blockers.includes('generated_dist_source_audit'));assert(bad.result.blockers.includes('remote_netlify_deploy_preview'));
 // Synthetic dist and report flags cannot substitute for real checkout and manual E2E.
 writeFileSync(join(tmp,'QA_v7_88_0_RELEASE_AUDIT.json'),JSON.stringify({...audit,mode:'GENERATED_DIST_SOURCE_AUDIT'}));
 writeFileSync(join(tmp,'QA_v7_88_0_PREVIEW.json'),JSON.stringify({...preview,mode:'REMOTE_READ_ONLY_PREVIEW',base:'https://deploy-preview-10--example.netlify.app/'}));
 const partial=run();assert.equal(partial.status,2);assert(partial.result.blockers.includes('complete_checkout_and_git_sha'));assert(partial.result.blockers.includes('authenticated_end_to_end'));
 console.log('PASS v7880 gate: missing evidence blocks release');
 console.log('PASS v7880 gate: synthetic/local previews rejected');
 console.log('PASS v7880 gate: fabricated full flags without checkout/E2E/rollback still blocked');
}finally{rmSync(tmp,{recursive:true,force:true})}
