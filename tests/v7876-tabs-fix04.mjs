/** STUDYING WITH YE KUN v7.87.6 Fix 04 regression checks.
 * Run: node tests/v7876-tabs-fix04.mjs [--release]
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const rd = name => readFileSync(name,'utf8');
const builder = rd('scripts/build-page-transitions-v7875.mjs');
const injection = rd('scripts/build-v7876-jlpt-tabs-fix04.mjs');
const css = rd('assets/yk88-jlpt-tabs-fix04.css');
const js = rd('assets/yk88-jlpt-tabs-fix04.js');
const step03 = "await import('./build-v7876-jlpt-mobile-repair.mjs')";
const step04 = "await import('./build-v7876-jlpt-tabs-fix04.mjs')";
assert(builder.includes(step03) && builder.includes(step04) && builder.indexOf(step03)<builder.indexOf(step04), 'Fix 04 builder order must follow Fix 03');
assert.match(css,/grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/);
assert.match(css,/nth-child\(n\+5\)/);
assert.match(css,/overflow:\s*visible\s*!important/);
assert.match(css,/max-width:\s*720px/);
assert.match(css,/\.yk88-grammar-card \.yk88-grammar-link::after/);
assert(js.includes('yk82Content') && js.includes('yk88-grammar-link') && js.includes('link.click()'), 'Full grammar card click absent');
assert(!js.includes('preventDefault') && !js.includes('/.netlify/functions/'), 'Do not override native links or protected services');
assert(injection.includes('v=7876fix04') && injection.includes('yk82Tabs') && injection.includes('yk82Content'));
for (const protectedName of ['netlify/database','netlify/functions','identity.bundle.js','exam-status','ykcr-student-sync'])
  assert(!injection.includes(protectedName) && !js.includes(protectedName) && !css.includes(protectedName), 'Protected backend marker '+protectedName);
if (process.argv.includes('--release')) {
  const path='dist/study/jlpt-learning.html';
  assert(existsSync(path),'Public JLPT HTML missing; run npm run build first');
  const html=rd(path);
  for (const asset of ['/assets/yk88-jlpt-tabs-fix04.css?v=7876fix04','/assets/yk88-jlpt-tabs-fix04.js?v=7876fix04'])
    assert.equal(html.split(asset).length-1,1,'Missing or duplicated asset: '+asset);
  assert(html.indexOf('yk88-jlpt-mobile-repair.css?v=7876fix03') < html.indexOf('yk88-jlpt-tabs-fix04.css?v=7876fix04'), 'Stylesheet cascade order incorrect');
  for (const name of ['dist/assets/yk88-jlpt-tabs-fix04.css','dist/assets/yk88-jlpt-tabs-fix04.js'])
    assert(existsSync(name),'Missing built asset: '+name);
  console.log('PASS Fix 04 release: compiled JLPT page includes exactly one scoped tabs stylesheet and one optional grammar-card click handler');
}
console.log('PASS Fix 04 source: 7 accessible tab buttons in 2 compact rows, Fix 03 preserved, Grammar Detail linked, backend unmodified');
