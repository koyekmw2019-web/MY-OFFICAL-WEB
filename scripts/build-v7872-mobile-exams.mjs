/** v7.87.2: Build a smaller, independent page for every exam type.
 * Runs AFTER build-v787-exam-pages.mjs.  No backend, account or scoring changes.
 * The original mock-exams.html remains available as a 12-card exam directory.
 */
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('dist');
const centerFile = join(root, 'mock-exams.html');
const homeFile = join(root, 'index.html');
const routeOld = '/assets/yk-v787-routing.js?v=7870';
const routeNew = '/assets/yk-v787-routing.js?v=7872';
const originalCenter = readFileSync(centerFile, 'utf8');
const originalHome = readFileSync(homeFile, 'utf8');
assert(originalCenter.includes(routeOld) && originalHome.includes(routeOld),
  'v7.87.1 router script not found; refuse unverified cache-bust');
const source = originalCenter.replaceAll(routeOld, routeNew);
writeFileSync(centerFile, source, 'utf8');
writeFileSync(homeFile, originalHome.replaceAll(routeOld, routeNew), 'utf8');
const exams = Object.freeze({
  truck:'Truck / トラック', taxi:'Taxi / タクシー', bus:'Bus / バス',
  maintenance:'Auto Maintenance / 自動車整備',
  car:'Car / 普通自動車', motorcycle:'Motorcycle / 二輪', moped:'Moped / 原付',
  jlpt_n5:'JLPT N5', jlpt_n4:'JLPT N4', jlpt_n3:'JLPT N3',
  jlpt_n2:'JLPT N2', jlpt_n1:'JLPT N1'
});
const sectionStart = source.indexOf('<section class="section reveal" id="online-mock-exam">');
const wrapperStart = source.indexOf('<div class="wrap">');
assert(sectionStart > wrapperStart && wrapperStart > 0, 'Exam and page wrapper must exist');
const sectionTag = /<\/?section\b[^>]*>/gi;
sectionTag.lastIndex = sectionStart;
let depth = 0, sectionEnd = -1, match;
while ((match = sectionTag.exec(source))) {
  depth += match[0].startsWith('</') ? -1 : 1;
  if (depth === 0) { sectionEnd = sectionTag.lastIndex; break; }
}
assert(sectionEnd > sectionStart, 'Exam section must close safely');
const section = source.slice(sectionStart, sectionEnd);
const afterBody = source.slice(sectionEnd);
const marker = /<script>\s*\/\* ===== V7\.37 GLOBAL/;
const scriptMatch = marker.exec(afterBody);
assert(scriptMatch, 'Expected original global scripts after page content');
const scripts = afterBody.slice(scriptMatch.index);
const head = source.slice(0, wrapperStart);
const cardPattern = /<article\b[^>]*class="[^"]*\bexam-category\b[^"]*"[^>]*>[\s\S]*?<\/article>/g;
const cards = [...section.matchAll(cardPattern)];
assert.equal(cards.length, 12, 'Exactly 12 existing exam cards must be present');
const types = Object.keys(exams);
for (const type of types) {
  const token = 'data-exam-v728="' + type + '"';
  assert.equal(cards.filter(c => c[0].includes(token)).length, 1, `Exam ${type} should have one launch button`);
}
const out = join(root, 'exams');
mkdirSync(out, { recursive: true });
const host = 'https://yekun-mryethemenstyle.netlify.app';
const results = [];
for (const [type, label] of Object.entries(exams)) {
  let kept = 0;
  const content = section.replace(cardPattern, card => {
    if (card.includes('data-exam-v728="' + type + '"')) { kept += 1; return card; }
    return '';
  });
  assert.equal(kept, 1, `Could not isolate ${type} card`);
  const intro = '<nav class="yk872-back" aria-label="Exam navigation">' +
    '<a href="/mock-exams.html">← All Mock Exams / စာမေးပွဲအားလုံး</a>' +
    '<a href="/#study-hub">STUDY HUB</a></nav>' +
    '<div class="yk872-page-title"><div class="yk872-eyebrow">STUDYING WITH YE KUN</div>' +
    '<h1>' + label + ' Mock Exam</h1></div>';
  const url = host + '/exams/' + type + '.html';
  let page = head + '<div class="wrap">' + intro + content + '</div>\n' + scripts;
  page = page.replace('<body class="yk787-exam-page">',
    '<body class="yk787-exam-page yk872-single-exam" data-exam-type="' + type + '">');
  assert(page.includes('data-exam-type="' + type + '"'), 'Unexpected exam page body');
  page = page.replace(/<title>[\s\S]*?<\/title>/,
    '<title>' + label + ' Mock Exam | STUDYING WITH YE KUN</title>');
  page = page.replace(/<link rel="canonical" href="[^"]+">/,
    '<link rel="canonical" href="' + url + '">');
  page = page.replace(/<meta property="og:url" content="[^"]+">/,
    '<meta property="og:url" content="' + url + '">');
  // Login must return to the selected exam, without starting a free attempt.
  page = page.replaceAll('/login.html?return=%2Fmock-exams.html',
    '/login.html?return=%2Fexams%2F' + type + '.html');
  page = page.replaceAll('href="#home"', 'href="/"');
  // A root-level HTML clone is now under /exams/. Make existing relative asset
  // and page URLs root-absolute; otherwise they would 404 under /exams/assets/.
  page = page.replace(/\b(src|href|poster|srcset)=(["'])(?!\/|https?:|#|mailto:|tel:|data:)([^"']+)\2/gi,
    (_whole, attr, quote, value) => attr + '=' + quote + '/' + value + quote);
  page = page.replace(/url\((["']?)assets\//gi, 'url($1/assets/');
  page = page.replace(/((?:fetch|import)\(\s*["'])assets\//g, '$1/assets/');
  // No dictionary is displayed on this route: do not initialize the lazy dictionary watcher.
  page = page.replace(/<script id="yk863-dictionary-loader">[\s\S]*?<\/script>/, '');
  page = page.replace('</head>',
    '<link rel="stylesheet" href="/assets/yk-v7872-exam-mobile.css?v=7872">\n</head>');
  page = page.replace('</body>',
    '<script src="/assets/yk-v7872-exam-mobile.js?v=7872" defer></script>\n</body>');
  assert(!page.includes('id="driving-dictionary"'), 'Unrelated dictionary should not be on exam page');
  assert(!page.includes('id="home"'), 'Unrelated hero should not be on exam page');
  assert(!page.includes('id="yk863-dictionary-loader"'));
  assert(!page.includes('src="assets/'), 'Relative asset path would break under /exams/');
  assert(!page.includes('href="assets/'), 'Relative CSS path would break under /exams/');
  assert.equal((page.match(/data-exam-v728=/g) || []).length, 1, `Isolate ${type}`);
  assert(page.includes('id="examPanel"') && page.includes('v728-online-exam-system-js'));
  writeFileSync(join(out, type + '.html'), page, 'utf8');
  results.push({ type, bytes: Buffer.byteLength(page) });
}
console.log(JSON.stringify({ version:'7.87.2', generated: results.length,
  meanPageBytes: Math.round(results.reduce((n, x) => n + x.bytes, 0) / results.length),
  originalCenterBytes: Buffer.byteLength(source), backendChanged:false }, null, 2));
