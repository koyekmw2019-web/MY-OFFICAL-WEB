import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
const rd = p => readFileSync(p, 'utf8');
const pkg = JSON.parse(rd('package.json'));
const builder = rd('scripts/build-page-transitions-v7875.mjs');
const css = rd('assets/yk-page-transitions-v7875.css');
const asset = '/assets/yk-page-transitions-v7875.css?v=7875native2';
const pages = ['index.html','mock-exams.html','video-class.html',
  'dashboard.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html'];
assert.equal(pkg.version, '7.87.4', 'Legacy core version remains pinned by existing source tests');
assert(pkg.scripts.postbuild.includes('node scripts/build-page-transitions-v7875.mjs && node tests/v7875-page-transitions.mjs --release'));
assert(pkg.scripts.posttest.endsWith('node tests/v7875-page-transitions.mjs'));
assert.match(css, /@view-transition\s*\{\s*navigation:\s*auto\s*;/);
assert.match(css, /max-width:\s*720px/);
assert.match(css, /prefers-reduced-motion:\s*no-preference/);
assert.match(css, /#yk-mobile-nav:not\(\[hidden\]\)/);
assert.match(css, /::view-transition-old\(root\)/);
assert.match(css, /::view-transition-new\(root\)/);
assert.match(css, /::view-transition-old\(yk-v7875-tab-bar\)/);
assert.match(css, /::view-transition-new\(yk-v7875-tab-bar\)/);
// Native-style polish: common chrome is snapshotted separately, not slid.
assert.match(css, /view-transition-name:\s*yk-v7875-header/);
assert.match(css, /::view-transition-group\(yk-v7875-header\)/);
assert.match(css, /::view-transition-group\(yk-v7875-tab-bar\)/);
assert.match(css, /html\[data-yk-ui-theme="light"\]::view-transition/);
assert.match(css, /yk-v7875-soft-in/);
assert.doesNotMatch(css, /translate3d|translateX|translateY|scale3d|scaleX|scaleY/, 'Do not move the full screen');

for (const route of pages) assert(builder.includes(`'${route}'`), `Route not opted in: ${route}`);
for (const forbidden of ['netlify/functions','netlify/database','identity.bundle.js','exam_attempts','ykcr-student-sync','exam-payment-submit'])
  assert(!builder.includes(forbidden) && !css.includes(forbidden), `Protected code marker: ${forbidden}`);
assert(!builder.includes('location.assign') && !builder.includes('preventDefault'), 'Must preserve native link navigation');
assert(!builder.includes("'login.html'"), 'Auth form intentionally excluded');
if (process.argv.includes('--release')) {
  for(const route of pages) {
    const html = rd(join('dist', route));
    assert.equal(html.split(asset).length - 1, 1, `${route}: transition asset missing or duplicated`);
    assert(html.includes('id="yk-mobile-nav"'), `${route}: original navigation absent`);
    assert(html.includes('yk-ui-preferences.css?v=1'), `${route}: theme CSS absent`);
  }
  for(const excluded of ['login.html','exams/truck.html','exams/jlpt_n5.html']) {
    if(!existsSync(join('dist',excluded)))continue;
    assert(!rd(join('dist',excluded)).includes(asset), `${excluded}: navigation during sensitive flow unexpectedly opted in`);
  }
  assert(rd(join('dist','index.html')).includes('href="/mock-exams.html"'), 'Exam navigation lost');
  assert(rd(join('dist','index.html')).includes('href="/video-class.html"'), 'Video navigation lost');
  console.log('PASS v7.87.5 release: seven opted-in pages, theme/nav preserved, login and exam-details excluded');
}
console.log('PASS v7.87.5 source: native navigation, cross-document transitions, reduced-motion safety');
