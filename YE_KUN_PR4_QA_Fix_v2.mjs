/**
 * YE KUN PR #4 / v7.88.1-rc.1 — QA test parsing fix, version 2.
 * Run from the GitHub QA branch repository root.
 * Changes ONLY tests/v774-release-smoke.mjs; never touches the production site.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const target = resolve('tests/v774-release-smoke.mjs');
assert(existsSync(target), 'Missing tests/v774-release-smoke.mjs. Open MY-OFFICAL-WEB first.');
const original = readFileSync(target, 'utf8');
const importAnchor = "import vm from 'node:vm';";
const childImport = "import { spawnSync } from 'node:child_process';";
const marker = 'v7.88.1 QA: browser module syntax check';
if (original.includes(marker)) {
  console.log('ALREADY_PATCHED tests/v774-release-smoke.mjs');
  process.exit(0);
}
assert(original.includes(importAnchor), 'Could not find original vm import. No file was changed.');
assert(!original.includes(childImport), 'Existing child_process import needs manual review. No file was changed.');
assert(original.includes("check('every shipped browser asset JavaScript parses'"), 'Wrong test file version. No file was changed.');

// Match whitespace (including Windows CRLF) rather than insisting on exactly 3 spaces.
const anchor = /^([ \t]*)new vm\.Script\(code\s*,\s*\{\s*filename\s*:\s*f\s*\}\s*\);[ \t]*$/gm;
const matches = [...original.matchAll(anchor)];
assert.equal(matches.length, 1, `Expected exactly one browser asset parse statement, found ${matches.length}. No file was changed.`);
const indent = matches[0][1];
const lines = [
  '// v7.88.1 QA: browser module syntax check',
  'if (/^\\s*(?:import\\s+(?!\\()|export\\s+)/m.test(code)) {',
  "  const syntax = spawnSync(process.execPath, ['--check', file(`assets/${f}`)], { encoding: 'utf8' });",
  "  assert.equal(syntax.status, 0, `JavaScript module syntax error in ${f}: ${syntax.stderr || syntax.stdout}`);",
  '} else {',
  '  new vm.Script(code,{filename:f});',
  '}'
];
const replacement = lines.map((line,i) => (i ? indent : '') + (i ? line : indent + line)).join('\n');
const revised = original.replace(importAnchor, `${importAnchor}\n${childImport}`).replace(anchor, () => replacement);
assert(revised.includes(marker) && revised.includes(childImport), 'Patch verification failed. No file was changed.');
writeFileSync(target, revised, 'utf8');
console.log('PATCH_APPLIED tests/v774-release-smoke.mjs');
console.log('Changed ONLY the QA test. Not production-stable certified.');
