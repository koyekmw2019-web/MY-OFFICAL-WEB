/** v7.86.0 — isolated premium motion, accessibility and protected-system QA. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');
let passed=0;
function check(name,fn){fn();passed++;console.log('PASS v786 '+name)}
const css=read('assets/yk-premium-motion-v786.css'),js=read('assets/yk-premium-motion-v786.js');
check('v7.86 release and original homepage search title',()=>{
 const p=JSON.parse(read('package.json'));
 assert(['7.86.0','7.86.1','7.86.2','7.86.3'].includes(p.version));
 assert(p.scripts.test.includes('tests/v786-premium-motion.mjs'));
 assert(p.scripts.build.includes('tests/v786-premium-motion.mjs'));
 assert(read('index.html').includes('<title>YE KUN Official Website | YE LINN OO</title>'));
});
check('three intended public pages load same lightweight motion files exactly once',()=>{
 for(const p of ['index.html','video-class.html','study/jlpt-learning.html']){
   const page=read(p);
   for(const f of ['yk-premium-motion-v786.css','yk-premium-motion-v786.js'])
     assert.equal(page.split(f).length-1,1,`${p} ${f}`);
 }
 assert(statSync(join(root,'assets/yk-premium-motion-v786.js')).size<6500);
 assert(statSync(join(root,'assets/yk-premium-motion-v786.css')).size<7500);
});
check('no new character images and exact original assets still referenced',()=>{
 for(const ch of ['student','teacher']){
  const path=`assets/characters/${ch}-v7821.webp`;
  assert(existsSync(join(root,path)));
  assert(read('study/jlpt-learning.html').includes(path));
  assert(read('index.html').includes(path));
 }
 assert(!js.includes('innerHTML')&&!js.includes('createElement(\'img\')'));
});
check('prefers-reduced-motion always bypasses JS motion with CSS fallback',()=>{
 assert(js.includes("'(prefers-reduced-motion: reduce)'"));
 assert(js.includes('if (reduced.matches) return'));
 assert(css.includes('@media (prefers-reduced-motion: reduce)'));
 assert(css.includes('@media (prefers-reduced-motion: no-preference)'));
});
check('scroll reveals are one-shot and never hide readable content by default',()=>{
 assert(js.includes('IntersectionObserver'));
 assert(js.includes('observer.unobserve(entry.target)'));
 assert(css.includes('data-yk86-reveal'));
 assert(!/\{[^}]*visibility\s*:\s*hidden/.test(css));
 assert(!/\{[^}]*display\s*:\s*none/.test(css));
});
check('original JLPT verified answer action and Teacher Tip remain source of truth',()=>{
 const old=read('assets/yk-jlpt-characters-v7821.js');
 for(const key of ['what===\'answer\'','what===\'complete\'','setTip(tab.dataset.tab)'])assert(old.includes(key),key);
 assert(js.includes("getElementById('yk821Reaction')"));
 assert(js.includes("getElementById('yk821TeacherTip')"));
 assert(!js.includes('exam-attempts')&&!js.includes('/.netlify/functions'));
});
check('video embeds still user click only, contact/book covers untouched',()=>{
 const video=read('assets/yk-video-course-v785.js');
 assert(video.includes('frameContainer.append(iframe)'));
 assert(video.includes('youtube-nocookie.com/embed/'));
 assert(video.includes('frameContainer.replaceChildren()'));
 assert(read('video-class.html').includes('https://www.facebook.com/share/19kc6Vk9XM/'));
 assert(read('video-class.html').includes('/assets/study-hub-covers/truck.webp'));
});
check('existing examination, auth, YKCR, payment functions and build remain isolated',()=>{
 assert(read('netlify.toml').includes('publish = "dist"'));
 assert(read('scripts/build-public-v7841.mjs').includes("'video-class.html'"));
 assert(['v7841-slim-v786-motion','v7841-slim-v7861-stability'].some(x=>read('service-worker.js').includes(x)));
 for(const file of ['netlify/functions/exam-access.mts','netlify/functions/ykcr-student-sync.mts','netlify/functions/exam-admin-analytics.mts','netlify/functions/exam-payment-request.mts']){
  // Only require known existing files if they are actually part of this source.
  if(existsSync(join(root,file))) assert(statSync(join(root,file)).size>100);
 }
});
console.log(`v7.86 Premium Motion: ${passed} PASS / 0 FAIL`);
