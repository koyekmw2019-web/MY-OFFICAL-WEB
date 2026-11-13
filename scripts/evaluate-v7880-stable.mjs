/** v7.88.0 strict final release decision. Fails closed until real full-source,
 * deploy-preview, isolated E2E and real-device evidence has been reviewed.
 * This tool is READ ONLY except for writing its own decision report.
 * It does not deploy, upload, modify payments, or change accounts.
 */
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
const RELEASE='7.88.1', CANDIDATE='7.88.1-rc.1';
const args=process.argv.slice(2);
const opt=(f,def)=>{const i=args.indexOf(f);return i===-1?def:args[i+1]};
const cwd=resolve(opt('--root',process.cwd()));
const pathOf=(f,def)=>resolve(cwd,opt(f,def));
const reports={
 full:pathOf('--full','QA_v7_88_0_FULL_REPO.json'),
 audit:pathOf('--audit','QA_v7_88_0_RELEASE_AUDIT.json'),
 preview:pathOf('--preview','QA_v7_88_0_PREVIEW.json'),
 manual:pathOf('--manual','QA_v7_88_0_MANUAL_EVIDENCE.json'),
};
const out=pathOf('--report','QA_v7_88_0_RELEASE_DECISION.json');
const readJson=p=>{try{return JSON.parse(readFileSync(p,'utf8'))}catch{return null}};
const full=readJson(reports.full),audit=readJson(reports.audit),preview=readJson(reports.preview),manual=readJson(reports.manual);
const pkg=readJson(resolve(cwd,'package.json'));
const checks=[];
const add=(code,ok,why)=>checks.push({code,status:ok?'PASS':'BLOCKED',detail:ok?'Evidence accepted':why});
const all=(r,keys)=>keys.every(k=>r?.[k]===true);
let gitSha='';try{gitSha=execFileSync('git',['-C',cwd,'rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()}catch{}
const fullChecks=['FULL_NPM_TEST','FULL_NPM_BUILD','RELEASE_GATES'];
const audited=Array.isArray(full?.checks)&&fullChecks.every((name,i)=>full.checks[i]?.name===name&&full.checks[i]?.passed===true);
const previewUrl=String(preview?.base||'');
let safePreview=false;
try{const u=new URL(previewUrl);safePreview=u.protocol==='https:'&&/^deploy-preview-\d+--[a-z0-9-]+\.netlify\.app$/i.test(u.hostname)&&u.pathname==='/';}catch{}
const e2eKeys=['register','login','logout','studentVerification','ykcrSync','freeAttemptPerExamType','examResume','examSubmitAndScore','receiptUpload','adminApproval','paidStartAndExpiry','rolePermissions','paymentRejectAndDuplicateHandling'];
const deviceKeys=['androidRealDevice','iosRealDevice','pwaInstall','offlinePublicOnly','newVersionAfterCache','myEnJaLanguages','mobileNoOverflow','performanceMeasured'];
const fullSha=String(manual?.sourceCommit||'');
const recent=(val,maxDays=14)=>{const t=Date.parse(val||'');return Number.isFinite(t)&&Math.abs(Date.now()-t)<=maxDays*86400000};
add('candidate_version',pkg?.version===CANDIDATE,'The full checkout must contain package version '+CANDIDATE);
add('complete_checkout_and_git_sha',existsSync(resolve(cwd,'index.html'))&&existsSync(resolve(cwd,'src/identity-client.js'))&&/^[a-f0-9]{40}$/i.test(gitSha),'A real checked-out Git repository and original source files are required');
add('lockfile',existsSync(resolve(cwd,'package-lock.json')),'Create and verify a package-lock.json before npm ci; GitHub main had no lockfile');
add('full_npm_test_build_and_release',full?.passed===true&&full?.blocked===false&&audited&&full?.version===CANDIDATE&&full?.sourceCommit===gitSha&&recent(full?.runAt),'Full npm test + npm build + release gates must all PASS on the actual repository');
add('generated_dist_source_audit',audit?.mode==='GENERATED_DIST_SOURCE_AUDIT'&&audit?.result==='PASS'&&audit?.checksFailed===0&&audit?.criticalRoutes>=29&&audit?.repoVersion===CANDIDATE&&recent(audit?.runAt),'Use actual generated dist; synthetic fixtures cannot certify this release');
add('remote_netlify_deploy_preview',preview?.mode==='REMOTE_READ_ONLY_PREVIEW'&&preview?.status==='PASS'&&preview?.failed===0&&preview?.checks>=11&&safePreview&&recent(preview?.runAt),'A real deploy-preview-N--site.netlify.app URL and successful remote smoke are required');
add('source_commit_matches_evidence',/^[a-f0-9]{40}$/i.test(fullSha)&&fullSha===gitSha&&manual?.previewSourceCommit===gitSha,'The reviewed preview must be built from exactly the source commit being released');
add('isolated_test_database',manual?.environment==='DEPLOY_PREVIEW'&&manual?.isolatedTestDatabase===true&&manual?.realPaymentNotUsed===true,'Use only test users and isolated non-production payment/DB environment');
add('authenticated_end_to_end',all(manual?.e2e,e2eKeys),'Missing one or more real preview Login / Student / Exam / Payment / YKCR steps');
add('real_device_verification',all(manual?.device,deviceKeys),'Actual Android and iOS + PWA + mobile performance verification not complete');
add('rollback_and_human_signoff',/^[a-f0-9]{40}$/i.test(String(manual?.rollback?.previousProductionCommit||''))&&Boolean(String(manual?.rollback?.previousDeployId||'').trim())&&manual?.rollback?.dryRunVerified===true&&String(manual?.reviewer||'').trim().length>=3&&recent(manual?.reviewedAt),'Verified rollback, named reviewer and recent sign-off are mandatory');
const blockers=checks.filter(x=>x.status==='BLOCKED');
const decision=blockers.length?'NO_GO':'GO_ELIGIBLE_FOR_FINAL_HUMAN_APPROVAL';
const result={release:RELEASE,candidate:CANDIDATE,decision,productionStable:!blockers.length,reportCreatedAt:new Date().toISOString(),
 checks,blockerCount:blockers.length,blockers:blockers.map(x=>x.code),evidenceFiles:Object.fromEntries(Object.entries(reports).map(([k,p])=>[k,{name:p.split('/').pop(),present:existsSync(p)}])),
 note:'GO_ELIGIBLE_FOR_FINAL_HUMAN_APPROVAL is not permission to automatically deploy. Human approval and controlled promotion are separate. No data was written by this check.',
 noDeployPerformed:true};
mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');
console.log(`${decision}: ${checks.length-blockers.length}/${checks.length} gates passed. See ${out}`);
for(const b of blockers)console.log('  BLOCKED '+b.code+': '+b.detail);
if(blockers.length)process.exitCode=2;
