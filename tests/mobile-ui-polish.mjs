import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const css = readFileSync('assets/yk-mobile-nav.css', 'utf8');
const builder = readFileSync('scripts/build-mobile-ui-polish.mjs', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
assert.match(css, /\.wrap > \.hero#home/);
assert.match(css, /body\.yk787-exam-page #online-mock-exam/);
assert.match(css, /a\.yk864-menu-jlpt:not\(\[aria-current="page"\]\)/);
assert.match(css, /prefers-reduced-motion: reduce/);
assert.match(builder, /const distant=!window\.matchMedia/);
assert.doesNotMatch(builder, /netlify\/functions|database|ykcr|exam_attempts|payment_requests|identity\.bundle/);
assert(pkg.scripts.postbuild.includes('node scripts/build-mobile-ui-polish.mjs && node tests/mobile-ui-polish.mjs --release')); 
assert(pkg.scripts.posttest.includes('node tests/mobile-ui-polish.mjs')); 
if (process.argv.includes('--release')) {
  const home = readFileSync('dist/index.html', 'utf8');
  const center = readFileSync('dist/mock-exams.html', 'utf8');
  const single = readFileSync('dist/exams/jlpt_n5.html', 'utf8');
  const video = readFileSync('dist/video-class.html', 'utf8');
  for (const [page,html] of Object.entries({home,center,single,video})) {
    assert.match(html, /yk-mobile-nav\.css\?v=2/, `${page} mobile CSS missing`);
    assert.match(html, /yk-mobile-nav\.js\?v=2/, `${page} original nav missing`);
  }
  assert.match(home, /const distant=!window\.matchMedia\?\.\('\(max-width:720px\)'\)\.matches/);
  assert.doesNotMatch(home, /const distant=Math\.abs\(jlptCenter\.getBoundingClientRect/);
  assert.match(home, /id="yk82Hub"/);
  assert.match(center, /id="examPanel"/);
  assert.match(single, /id="examPanel"/);
  assert.match(video, /VIDEO CLASS/i);
  console.log('PASS Mobile UI polish release QA: generated pages, JLPT smooth-scroll, original exam engine, nav assets');
}
console.log('PASS Mobile UI polish source QA: only spacing and JLPT interactive styling');
