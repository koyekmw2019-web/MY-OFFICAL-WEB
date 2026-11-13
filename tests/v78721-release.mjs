/** Full generated build gate; intentionally fails when real dist is absent. */
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const commands=[['scripts/audit-v78721-release.mjs'],['scripts/smoke-v78721-preview.mjs']];
for(const args of commands){
 const p=spawnSync(process.execPath,args,{encoding:'utf8',stdio:'pipe',timeout:45000});
 assert.equal(p.status,0,`Blocked v7.87.21 release: ${args[0]}\n${p.stderr}\n${p.stdout.slice(-5000)}`);
 console.log(`PASS v78721-release: ${args[0]}`);
}
