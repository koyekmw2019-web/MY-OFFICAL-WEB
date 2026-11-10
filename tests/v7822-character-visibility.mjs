/** v7.82.2 regression: both previously approved character artworks remain visible. */
import {readFileSync,existsSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>readFileSync(join(root,f),'utf8');
const css=read('assets/yk-jlpt-characters-v7822.css');
const files=['index.html','study/jlpt-learning.html','dashboard.html','student-dashboard.html','member-dashboard.html','admin-dashboard.html'];
assert(['7.82.2','7.83.0','7.84.0','7.84.1','7.85.0','7.86.0','7.86.1','7.86.2'].includes(JSON.parse(read('package.json')).version));
for(const f of files){
  assert(read(f).includes('/assets/yk-jlpt-characters-v7822.css'),`Missing update stylesheet in ${f}`);
  assert(read(f).indexOf('yk-jlpt-characters-v7821.css') < read(f).indexOf('yk-jlpt-characters-v7822.css'),`Stylesheet order for ${f}`);
}
for(const img of ['student','teacher']){
  assert(existsSync(join(root,`assets/characters/${img}-v7821.webp`)));
  assert(read('index.html').includes(`/assets/characters/${img}-v7821.webp`));
  assert(read('study/jlpt-learning.html').includes(`/assets/characters/${img}-v7821.webp`));
}
for(const selector of ['.yk821-hub-people', '.yk821-hero-art', '.yk821-dashboard-people'])assert(css.includes(selector));
assert(css.includes('grid-template-columns:'));
assert(css.includes('position:static'));
assert(css.includes('@media (max-width:640px)'));
assert(read('index.html').includes('<title>YE KUN Official Website | YE LINN OO</title>'));
const data=JSON.parse(read('assets/jlpt-learning-v782-content.json'));
const cats=['vocabulary','grammar','kanji','reading','listening'];
assert.equal(Object.values(data.levels).reduce((sum,v)=>sum+cats.reduce((n,c)=>n+v[c].length,0),0),152);
console.log('PASS v7.82.2 source, branding, reused images, responsive stylesheet, 152 lessons');
