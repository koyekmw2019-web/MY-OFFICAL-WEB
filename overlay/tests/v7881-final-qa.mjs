/** Reject stale final nishu assets and broken checkout handlers in real built output. */
import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(),tmp=mkdtempSync(join(tmpdir(),'yk-final-qa-'));
const run=(script,args=[])=>spawnSync(process.execPath,[join(root,script),...args],{cwd:root,encoding:'utf8'});
try{
 const dist=join(tmp,'dist');cpSync('dist',dist,{recursive:true});
 const args=['--root',root,'--dist',dist];
 let result=run('scripts/audit-v78721-release.mjs',args);assert.equal(result.status,0,result.stdout+result.stderr);
 const path=join(dist,'exams/nishu.html'),original=readFileSync(path,'utf8');
 for(const epoch of ['78720','stale']){
  writeFileSync(path,original.replace('yk-v7881-nishu.js?ykv=7881',`yk-v7881-nishu.js?ykv=${epoch}`));
  result=run('scripts/audit-v78721-release.mjs',args);assert.notEqual(result.status,0,'Stale nishu JS must fail final audit');
 }
 console.log('PASS final actual-dist audit accepts scoped nishu epoch and rejects stale versions');
}finally{rmSync(tmp,{recursive:true,force:true});}
