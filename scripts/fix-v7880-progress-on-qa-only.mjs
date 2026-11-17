/** Local, one-time v7.88.0 RC1 build blocker repair. No GitHub/Netlify calls. */
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {run, patchClient, patchServer} from './apply-v7880-progress-capacity.mjs';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
assert.equal(resolve(process.cwd()), root, 'Run from the repository root; do not run from inside the ZIP');
const head = join(root, '.git', 'HEAD');
assert(existsSync(head), 'No .git/HEAD. Open your actual GitHub Desktop repository first.');
const branchLine = readFileSync(head, 'utf8').trim();
assert(/^ref: refs\/heads\/qa\//.test(branchLine),
  `SAFETY STOP: current branch must start qa/; found ${branchLine}. Do not patch main or production.`);
const clientPath = join(root, 'assets/yk-jlpt-learning-v782-state.js');
const serverPath = join(root, 'netlify/functions/jlpt-learning-progress.mts');
for (const filename of [clientPath, serverPath]) assert(existsSync(filename), `Required file missing: ${filename}`);
const beforeClient = readFileSync(clientPath, 'utf8');
const beforeServer = readFileSync(serverPath, 'utf8');
// Verify all six exact pre-v7.88.0 anchors BEFORE any writes (fail closed).
const expectedClient = patchClient(beforeClient);
const expectedServer = patchServer(beforeServer);
assert.notEqual(beforeClient, expectedClient);
assert.notEqual(beforeServer, expectedServer);
const modified = run(root);
assert.equal(readFileSync(clientPath,'utf8'), expectedClient);
assert.equal(readFileSync(serverPath,'utf8'), expectedServer);
for (const data of [expectedClient, expectedServer]) {
  assert(!/(?:length<500|slice\(0,500\)|uniq\(v\.completed,500\))/.test(data),'500-limit remains');
  assert(data.includes('2000'),'Missing new 2000 capacity');
}
console.log('PASS: v7.88.0 local progress capacity 500 -> 2000; ONLY 2 source files updated');
console.log('Next: npm run build on QA branch; verify its log. DO NOT merge/push main without approval.');
