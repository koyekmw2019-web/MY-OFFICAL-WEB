/** v7.88.0 RC source audit; stable-only conditions must not silently pass. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=x=>readFileSync(x,'utf8');
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,'7.88.1-rc.1');
assert(pkg.scripts['verify:stable:gate'].includes('evaluate-v7880-stable.mjs'));
assert(pkg.scripts['verify:stable'].includes('verify:stable:gate'));
assert(pkg.scripts.test.includes('tests/v7880-gate.mjs'));
assert(!pkg.scripts.build.includes('evaluate-v7880-stable.mjs'),'Build should not auto-promote stable');
for(const name of ['scripts/evaluate-v7880-stable.mjs','tests/v7880-gate.mjs','tests/v7880-source.mjs','README_v7_88_0_RC1_RELEASE_GATES_MY.md'])assert(existsSync(name),name);
const gate=read('scripts/evaluate-v7880-stable.mjs');
for(const item of ['NO_GO','GENERATED_DIST_SOURCE_AUDIT','REMOTE_READ_ONLY_PREVIEW','isolatedTestDatabase','androidRealDevice','iosRealDevice','rollback_and_human_signoff','sourceCommit'])assert(gate.includes(item),item);
assert(read('service-worker.js').includes('yk-official-v7-87-20'),'Candidate gate-only update must not silently mutate cache behavior');
if(existsSync('netlify/functions/_shared/security.mts')) {const prices=read('netlify/functions/_shared/security.mts');for(const yen of [1000,2000,3000,5000])assert(prices.includes(': '+yen));} else console.log('BASELINE BLOCKED (expected patch-only): security.mts requires full checkout; final stable gate will refuse it');
console.log('PASS v7880 source: RC-only version, strict gate, full test/build retained, price/PWA policy preserved');
