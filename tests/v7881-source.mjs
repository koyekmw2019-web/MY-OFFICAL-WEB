import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const R=p=>readFileSync(p,'utf8');
const pkg=JSON.parse(R('package.json'));
assert.equal(pkg.version,'7.88.1-rc.1');
for(const key of ['test','build'])for(const script of ['scripts/generate-v7881-nishu.mjs','scripts/patch-v7881-nishu-backend.mjs'])assert(pkg.scripts[key].includes(script));
assert(pkg.scripts.build.endsWith('node tests/v7881-release.mjs'));
for(const p of ['netlify/functions/exam-nishu-review.mts','netlify/functions/exam-nishu-history.mts','netlify/database/migrations/20261113090000_v7881_nishu_exam_type.sql',
'netlify/functions/_shared/nishu-scoring-v7881.mjs','netlify/functions/_shared/nishu-key-v7881.mts','scripts/nishu-author-bank-v7881.json',
'assets/yk-v7881-nishu-questions.json','assets/yk-v7881-nishu-book-cover.jpg','assets/yk-v7881-nishu.js','assets/yk-v7881-nishu.css','scripts/yk-v7881-nishu-page.html'])assert(existsSync(p),p);
const pub=R('assets/yk-v7881-nishu-questions.json'),key=R('netlify/functions/_shared/nishu-key-v7881.mts');
assert(!pub.includes('reasonJa')&&!pub.includes('"answer"'));
assert(!R('scripts/build-v7881-second-exam.mjs').includes('nishu-key-v7881.mts'));
for(const word of ['await api(\'exam-access\'','YKExamAutoSaveV761','exam-attempt-submit','exam-nishu-review','scoreVerified','readonly'])assert(R('assets/yk-v7881-nishu.js').includes(word),word);
assert(R('scripts/build-v7881-second-exam.mjs').includes('id=\\"yk7881-second-license-card\\"')||R('scripts/build-v7881-second-exam.mjs').includes('yk7881-second-license-card'));
assert(R('netlify/functions/exam-nishu-review.mts','netlify/functions/exam-nishu-history.mts').includes('user_id=${user.id}'));
for(const price of ['1000','2000','3000','5000'])assert(R('package.json').includes('tests/v78718')||R('scripts/build-v78718-exam-access-copy.mjs').includes(price));
const migration=R('netlify/database/migrations/20261113090000_v7881_nishu_exam_type.sql');
for(const t of ['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n1','jlpt_n2','jlpt_n3','jlpt_n4','jlpt_n5','nishu'])assert(migration.includes(`'${t}'`));
assert(!migration.includes('DELETE FROM')&&!migration.includes('DROP TABLE'));
console.log('PASS v7881-source: new isolated exam, private key, stable gate, preserved 12 types, non-destructive migration');
