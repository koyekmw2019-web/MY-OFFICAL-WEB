/** Safe v7.88.0 RC evidence pre-check; never creates a Netlify deployment. */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const required=[
 {path:'index.html',label:'full home HTML'},
 {path:'src/identity-client.js',label:'Identity client source'},
 {path:'scripts/build-public-v7841.mjs',label:'original public build'},
 {path:'netlify.toml',label:'Netlify configuration'},
 {path:'netlify/functions/ykcr-student-sync.mts',label:'YKCR backend'},
 {path:'netlify/database/migrations/20261112090000_yk_growth_analytics.sql',label:'growth migration'},
 {path:'netlify/database/migrations/20261112140000_yk_enrollment_crm.sql',label:'CRM migration'},
 {path:'package-lock.json',label:'reproducible package lockfile'}
];
const entries=required.map(x=>({...x,present:existsSync(x.path)}));
const blockers=entries.filter(x=>!x.present);
const report={candidate:'7.88.1-rc.1',check:'real-checkout-preflight',state:blockers.length?'BLOCKED':'READY_FOR_FULL_NPM_TEST',entries,missing:blockers.map(x=>x.path),
 important:'A READY preflight does NOT imply full build, deploy preview, authenticated E2E, real-device QA or stable certification.'};
const at=process.argv.indexOf('--report');const dest=at!==-1?process.argv[at+1]:'QA_v7_88_0_READINESS.json';
mkdirSync(dirname(resolve(dest)),{recursive:true});writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log(`${report.state}: ${blockers.length} missing prerequisites`);if(blockers.length)process.exitCode=2;
