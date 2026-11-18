/** QA-only dist stage. Runs after existing v7.88.0 Phase 1 stage.
 * It refuses any nonmatching build input and writes only generated JLPT HTML.
 */
import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve, join} from 'node:path';
const dir = resolve('dist');
const page = join(dir, 'study/jlpt-learning.html');
const asset = join(dir, 'assets/yk88-jlpt-explore-rescue-v7880.js');
const tag = '<script defer src="/assets/yk88-jlpt-explore-rescue-v7880.js?v=7880exploreqa02"></script>';
assert(existsSync(page) && existsSync(asset), 'Explore rescue: generated page and new JS asset required');
const html = readFileSync(page, 'utf8');
assert.equal(html.split('</head>').length - 1, 1, 'Explore rescue: expected one head');
assert.equal(html.split('</body>').length - 1, 1, 'Explore rescue: expected one body');
assert(html.includes('href="#yk82Title"') && html.includes('id="yk82Title"'), 'Explore rescue: matching original link/target required');
assert(html.includes('yk88-jlpt-phase1.css?v=7880p1qa01'), 'Explore rescue: expected preceding Phase 1 QA build');
assert(html.includes('yk88-jlpt-mobile-repair.js'), 'Explore rescue: original mobile repair must be preserved');
assert(!html.includes('yk88-jlpt-explore-rescue-v7880.js'), 'Explore rescue: duplicate script prevented');
const guard = readFileSync(asset, 'utf8');
assert(guard.includes("window.addEventListener('click', followLink, true)") && guard.includes('event.stopImmediatePropagation()'),
  'Explore rescue: window capture must precede legacy document handlers');
writeFileSync(page, html.replace('</head>', tag + '\n</head>'), 'utf8');
console.log('PASS JLPT Explore Lessons QA navigation guard injected (Learning Center only)');
