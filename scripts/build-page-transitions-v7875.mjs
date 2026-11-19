/** STUDYING WITH YE KUN — existing v7.87.5 page transition build plus v7.87.6 dist-only UX.
 * Runs after existing mobile nav and UI preferences; protected source/build/tests unchanged.
 */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {resolve, join} from 'node:path';

const out = resolve('dist');
const asset = 'assets/yk-page-transitions-v7875.css';
const href = '/assets/yk-page-transitions-v7875.css?v=7875native2';
const link = `<link rel="stylesheet" href="${href}">`;
const pages = [
  'index.html',
  'mock-exams.html',
  'video-class.html',
  'dashboard.html',
  'admin-dashboard.html',
  'student-dashboard.html',
  'member-dashboard.html'
];

assert(existsSync(join(out, asset)), 'Transition CSS is missing from dist/assets; run the regular public build first');
let count = 0;
for (const page of pages) {
  const filename = join(out, page);
  assert(existsSync(filename), `Expected existing public route: ${page}`);
  const source = readFileSync(filename, 'utf8');
  assert.equal(source.split('</head>').length - 1, 1, `${page}: invalid head boundary`);
  assert(source.includes('id="yk-mobile-nav"'), `${page}: original 5-tab navigation missing`);
  assert(source.includes('yk-ui-preferences.css?v=1'), `${page}: original language and theme missing`);
  assert(!source.includes(href), `${page}: transition CSS already injected, refusing duplicate`);
  writeFileSync(filename, source.replace('</head>', `${link}\n</head>`), 'utf8');
  count++;
}
assert.equal(count, pages.length);
console.log(`PASS v7.87.5: transition CSS injected in ${count} approved routes; no login/answer-form route enabled`);

// v7.87.6: Automatically activate the existing JLPT UX assets in the public output.
// Runs as part of npm run build: no .bat, Python, or manual editing of large HTML files.
await import('./build-v7876-jlpt-deploy.mjs');

// v7.87.6 mobile QA repair (after all public assets, menus, and grammar links).
await import('./build-v7876-jlpt-mobile-repair.mjs');

// v7.87.6 Fix 04: no clipped JLPT mobile tabs and full-card Grammar Detail click.
await import('./build-v7876-jlpt-tabs-fix04.mjs');

// v7.87.6 UI Fix 05.3: full-row centered Home CTA; compact Exam intro; retain JLPT/Grammar actions.
await import('./build-v7876-jlpt-ui-fix05.mjs');

// v7.87.7 QA batch: append authored Grammar lessons after existing Fix05.4.
await import('./build-v7877-grammar-update.mjs');

// v7.87.8: reference-index Grammar completion. Data-only appendix after Batch02, QA only.
await import('./build-v7878-grammar-complete.mjs');
// v7.87.9: targeted editorial repairs and conservative Ruby readings (QA only).
await import('./build-v7879-grammar-editorial-qa.mjs');
// v7.88.0 RC1 targeted content repair + progress-capacity cross-check. NOT release approved.
await import('./build-v7880-grammar-rc.mjs');

// v7.88.0 JLPT UI Phase 1: presentation-only scoped polish (QA; not stable).
await import('./build-v7880-jlpt-ui-phase1.mjs');

// QA follow-up: restore stable in-page Explore Lessons navigation without changing other routes.
await import('./build-v7880-jlpt-explore-rescue.mjs');

// Performance QA: generated public output only; preserve all original page scripts.
await import('./build-v7880-performance.mjs');
