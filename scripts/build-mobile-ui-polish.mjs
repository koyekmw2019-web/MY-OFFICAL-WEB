/** Mobile UI polish v1 — deploy-only JLPT smooth scroll correction.
 * The old handler intentionally jumps instantly for distant targets.
 * Only on mobile, use the existing smooth-scroll path to match other sections.
 * Never modify source HTML, navigation routes, authentication, exams or DB.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const path = 'dist/index.html';
assert(existsSync(path), 'Run after normal public build and mobile nav injection');
let html = readFileSync(path, 'utf8');
const before = 'const distant=Math.abs(jlptCenter.getBoundingClientRect().top)>window.innerHeight*2;';
const after = "const distant=!window.matchMedia?.('(max-width:720px)').matches && Math.abs(jlptCenter.getBoundingClientRect().top)>window.innerHeight*2;";
assert.equal(html.split(before).length - 1, 1, 'JLPT scroll signature changed: stop instead of patching the wrong code');
assert(html.includes('id="ykMenuJLPTV7864"') && html.includes('id="yk82Hub"'), 'Original JLPT menu and destination must remain');
assert(html.includes('id="yk-mobile-nav"'), 'Mobile navigation must remain');
html = html.replace(before, after);
writeFileSync(path, html, 'utf8');
console.log('PASS Mobile UI polish: mobile JLPT smooth-scroll behavior, homepage output only');
