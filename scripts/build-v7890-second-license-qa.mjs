/**
 * STUDYING WITH YE KUN v7.89.0-rc.1 -- QA-only second-type license card.
 * Run AFTER the existing release build. Does not alter server APIs or live data.
 * Do not include this QA-only presentation patch in a Production release.
 */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';

const root = resolve('dist');
const examPath = resolve(root, 'mock-exams.html');
const qaSourcePath = resolve('qa/second-license-exam-qa.html');
const qaOutputPath = resolve(root, 'mock-second-license-qa.html');
let html = readFileSync(examPath, 'utf8');
const QA_LABEL = 'QA PREVIEW / NOT PRODUCTION';
const existingCards = (html.match(/data-exam-v728=/g)||[]).length;
assert.equal(existingCards, 12, 'Expected 12 existing exam cards; do not alter unsupported build');
assert(html.includes('🚗') && html.includes('data-exam-v728="car"'), 'Original car exam card missing');
assert(!html.includes('id="yk-second-type-qa-card"'), 'QA card already inserted');
const section = html.indexOf('id="online-mock-exam"');
assert(section >= 0, 'Exam Center section missing');
const group = html.indexOf('運転免許・学科試験', section);
assert(group > section, 'Driving group heading missing');
const start = html.indexOf('<article class="exam-category v728">', group);
assert(start > group, 'Car exam card missing');
const end = html.indexOf('</article>', start) + '</article>'.length;
assert(end > start, 'Card closure missing');
const originalCard = html.slice(start, end);
assert(originalCard.includes('data-exam-v728="car"') && originalCard.includes('普通自動車'), 'Unexpected driving card order');
const intro = '<article class="exam-category v728" id="yk-second-type-qa-card"';
let newCard = originalCard.replace('<article class="exam-category v728"',intro)
  .replace('<div class="icon">🚗</div>','<div class="icon">🚕</div>')
  .replace('<h3>普通自動車<span class="exam-card-mm">သာမန်မော်တော်ယာဉ် (ကား)</span></h3>',
           '<h3>普通第二種免許<span class="exam-card-mm">ဒုတိယအမျိုးအစား ယာဉ်မောင်းလိုင်စင်</span></h3>')
  .replace(/src="[^"]+" alt="Ordinary car license study book cover"/,
           'src="/assets/yk-second-license-qa-cover.png" alt="第二種免許 book cover (visual reference only)"')
  .replace(/<div class="exam-card-desc-v744">[\s\S]*?<\/div>/,
           '<div class="exam-card-desc-v744"><p>旅客の安全・交通ルール・危険予測<span class="exam-card-mm">ခရီးသည်လုံခြုံရေး・လမ်းစည်းကမ်း・အန္တရာယ်ကြိုတင်ခန့်မှန်းခြင်း</span></p></div>')
  .replace(/95問 · 合格基準 90点以上/g,'95問 · 50分 · 100点満点 · 合格90点以上')
  .replace(/<div class="exam-scope">[\s\S]*?<\/div>/,
           '<div class="exam-scope"><span>〇✕ 90</span><span>イラスト 5</span><span>ふりがな</span></div>')
  .replace(/<button class="exam-launch-v728" data-exam-v728="car">[\s\S]*?<\/button>/,
           '<a class="exam-launch-v728 yk-second-type-qa-launch" href="/mock-second-license-qa.html" aria-label="普通第二種免許 QA Exam">普通第二種免許 Exam を開始<span class="exam-button-mm">ဒုတိယအမျိုးအစား စာမေးပွဲ စတင်မည်</span></a>');
assert(newCard.includes('id="yk-second-type-qa-card"'));
assert(newCard.includes('<h3>普通第二種免許'), 'New title was not inserted');
assert(newCard.includes('src="/assets/yk-second-license-qa-cover.png"'), 'Cover replacement failed');
assert(!newCard.includes('普通自動車'), 'Original car title survived in new card');
assert(!newCard.includes('data-exam-v728="car"') && newCard.includes('href="/mock-second-license-qa.html"'));
// The same button's height and alignment as the original Car, Motorcycle and Moped cards.
// No footer actions or notes: preserve the shared white CTA baseline.
html = html.slice(0,end) + newCard + html.slice(end);
const styles = `<style id="yk-second-type-qa-style">#yk-second-type-qa-card .yk-second-type-qa-launch{display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;min-height:55px;height:55px;box-sizing:border-box}#yk-second-type-qa-card .yk-second-type-qa-launch .exam-button-mm{display:block}#yk-second-type-qa-card{min-width:0}</style>`;
html = html.replace('</head>',styles+'</head>');
// Existing three cards have 55px target height; no extra card footer actions.
writeFileSync(examPath, html, 'utf8');
let preview = readFileSync(qaSourcePath, 'utf8');
assert(preview.includes('id="questionData"') && preview.includes('普通第二種免許'), 'Wrong QA exam preview');
preview = preview.replaceAll('ordinary_second_CARD_QA_PREVIEW.html','/mock-exams.html');
preview = preview.replaceAll('ordinary_second_exam_QA_PREVIEW.html','/mock-second-license-qa.html');
preview = preview.replace('</head>', `<meta name="robots" content="noindex,nofollow"><style>.qa-live-warning{position:fixed;right:12px;bottom:12px;z-index:1000;padding:8px 12px;border:1px solid #ca8656;border-radius:10px;color:#fff;background:#251b18;font:600 11px sans-serif}</style></head>`);
preview = preview.replace('</body>',`<div class="qa-live-warning">${QA_LABEL} · No production access/payment</div></body>`);
writeFileSync(qaOutputPath,preview,'utf8');
const cover = preview.match(/id="ordinarySecondCard"[\s\S]*?<img src="data:image\/png;base64,([A-Za-z0-9+/=]+)"/);
assert(cover, 'Second type cover missing from QA preview');
const data = Buffer.from(cover[1],'base64');
assert(data.length>10000 && data.length<1500000,'Suspicious book cover size');
const coverPath=resolve(root,'assets','yk-second-license-qa-cover.png');
mkdirSync(dirname(coverPath),{recursive:true});
writeFileSync(coverPath,data);
console.log(JSON.stringify({task:'second_license_QA_only',originalCardCount:existingCards,updatedCardCount:(html.match(/data-exam-v728=/g)||[]).length+1,newCardId:'yk-second-type-qa-card',qaPage:'mock-second-license-qa.html',coverBytes:data.length,backendChanged:false}));
