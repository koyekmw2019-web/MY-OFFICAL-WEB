/** Compatibility for legacy QA tests that explicitly list accepted package versions.
 * Only inserts the new released version into existing test allowlists; no test assertions
 * or application/backend code are removed or modified. Safe to run repeatedly.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
assert.equal(version, '7.87.2', 'v7.87.2 patch requires package version 7.87.2');
let changes = 0;
for (const name of readdirSync('tests').filter(x => x.endsWith('.mjs'))) {
  const path = join('tests', name);
  const old = readFileSync(path, 'utf8');
  // Versions were hardcoded in QA allowlists through v7.87.1.
  // Do not alter version references outside an array's final element.
  const updated = old.replace(/(['"])7\.87\.1\1(\s*\])/g, (match, quote, tail) =>
    quote + '7.87.1' + quote + ',' + quote + '7.87.2' + quote + tail);
  if (updated !== old) { writeFileSync(path, updated, 'utf8'); changes += 1; }
}
console.log(`v7.87.2 legacy QA version compatibility: ${changes} test files adjusted; original assertions preserved`);
