/**
 * Targeted QA-only repair for v7.88.1-rc.1 PR #4.
 * Make legacy v7.74 static smoke checker accept genuine ES modules.
 * Changes exactly one tracked test file; no website or backend behavior change.
 * Run from the full MY-OFFICAL-WEB repository on the QA branch.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve('tests/v774-release-smoke.mjs');
assert(existsSync(path), `Missing ${path}. Run this script from MY-OFFICAL-WEB repository root.`);
const old = readFileSync(path, 'utf8');
const importAnchor = "import vm from 'node:vm';";
const importExtra = "import { spawnSync } from 'node:child_process';";
const exactAnchor = '  new vm.Script(code,{filename:f});';
const fixedBlock = `   // Classic script and ES module syntax must be checked in their own parse goals.
   // The repository's package.json has \"type\":\"module\", so node --check handles ESM.
   if (/^\\s*(?:import\\s+(?!\\()|import\\.meta|export\\s+)/m.test(code)) {
     const syntax = spawnSync(process.execPath, ['--check', file(\`assets/\${f}\`)], { encoding: 'utf8' });
     assert.equal(syntax.status, 0, \`Module syntax error in \${f}: \${syntax.stderr || syntax.stdout}\`);
   } else {
     new vm.Script(code,{filename:f});
   }`;

if (old.includes('Classic script and ES module syntax must be checked') || old.includes('Modules are parsed without executing browser code')) {
  console.log('ALREADY_PATCHED: no changes.');
  process.exit(0);
}
assert(old.includes(importAnchor), 'Original vm import not found. File may have changed; manual review required.');
assert(!old.includes(importExtra), 'child_process import already present in unexpected form; manual review required.');
assert.equal(old.split(exactAnchor).length - 1, 1, 'Unexpected legacy vm.Script asset check; refusing unsafe replacement.');
const afterImport = old.replace(importAnchor, `${importAnchor}\n${importExtra}`);
const updated = afterImport.replace(exactAnchor, fixedBlock);
assert(updated.includes(fixedBlock) && updated.includes(importExtra));
writeFileSync(path, updated, 'utf8');
console.log('PATCH_APPLIED tests/v774-release-smoke.mjs (QA test only; not stable certified).');
console.log('Review GitHub Desktop diff, then test: node tests/v774-release-smoke.mjs --release');
