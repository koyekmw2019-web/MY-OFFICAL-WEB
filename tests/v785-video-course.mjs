/** v7.85.0 scoped Video Course checks. No existing protected backend edits. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const rd=p=>readFileSync(join(root,p),'utf8');
const html=rd('video-class.html');
const js=rd('assets/yk-video-course-v785.js');
const css=rd('assets/yk-video-course-v785.css');
let count=0;
function test(title,callback){callback();count++;console.log(`PASS v785 ${title}`)}
test('homepage hamburger has exactly one in-site Video Course link and leaves existing menu selectors intact',()=>{
  const home=rd('index.html');
  assert.equal((home.match(/id="ykMenuVideoCourseV785"/g)||[]).length,1);
  assert(home.includes('href="/video-class.html" id="ykMenuVideoCourseV785"'));
  for(const id of ['siteMenu','menuToggle','ykMenuDashboardLink','ykMenuAuthLink'])assert(home.includes(`id="${id}"`),id);
});
test('each user-supplied YouTube video is mapped to the corresponding category and fallback URL',()=>{
  for(const [cat,id] of Object.entries({TRUCK:'Uu9pI35J6Kw',TAXI:'sBQRpsDpBis',BUS:'-_ZD6orT8b8'})){
    assert(js.includes(`${cat}:{id:'${id}'`));
    assert(html.includes(`https://youtu.be/${id}`));
    assert(html.includes(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`));
    assert(html.includes(`data-course-category="${cat}"`));
  }
  assert(js.includes('youtube-nocookie.com/embed/'));
  assert(js.includes('replaceChildren()')); // close removes iframe / stops playback
  assert(js.includes("modal.showModal()"));
});
test('original three textbook cover files still used and present',()=>{
  for(const cat of ['truck','taxi','bus']){
    const path=`assets/study-hub-covers/${cat}.webp`;
    assert(existsSync(join(root,path)),path);
    assert(html.includes(`/${path}`),path);
    assert(html.includes(`/study/ssw-${cat}.html`));
  }
});
test('page accessible, localized and offers direct Facebook contact and YouTube fallback',()=>{
  for(const phrase of ['lang="my"','data-my=','data-en=','data-ja=','aria-pressed','aria-label','<dialog','<noscript','Watch on YouTube'])assert(html.includes(phrase),phrase);
  assert(html.includes('https://www.facebook.com/share/19kc6Vk9XM/'));
  assert(html.includes('https://www.facebook.com/share/1GDHn4Qfm4/'));
  assert(js.includes("localStorage.setItem('yk_lang'"));
  assert(js.includes("button.setAttribute('aria-pressed'"));
});
test('SEO title/canonical/schema and sitemap include one public video-class route',()=>{
  assert(html.includes('Video Course | Truck・Taxi・Bus'));
  assert(html.includes('https://yekun-mryethemenstyle.netlify.app/video-class.html'));
  const site=rd('sitemap.xml');
  assert.equal((site.match(/<loc>https:\/\/yekun-mryethemenstyle.netlify.app\/video-class.html<\/loc>/g)||[]).length,1);
});
test('public build includes new page without publishing backend or introducing video binary',()=>{
  assert(rd('scripts/build-public-v7841.mjs').includes("'index.html','video-class.html'"));
  const pkg=JSON.parse(rd('package.json'));
  assert(['7.85.0','7.86.0'].includes(pkg.version));
  assert(pkg.scripts.test.includes('tests/v785-video-course.mjs'));
  assert(pkg.scripts.build.includes('tests/v785-video-course.mjs'));
  assert(/publish = "dist"/.test(rd('netlify.toml')));
  assert(!readdirSync(root).some(x=>/\.mp4$|\.mov$|\.pdf$/i.test(x)));
  const dist=join(root,'dist');
  if(existsSync(dist)){
    assert(existsSync(join(dist,'video-class.html')));
    for(const asset of ['assets/yk-video-course-v785.css','assets/yk-video-course-v785.js'])assert(existsSync(join(dist,asset)));
    assert(!existsSync(join(dist,'netlify')));
  }
});
test('responsive layout, safe iframe attributes and reduced motion present',()=>{
  for(const breakpoint of ['@media(max-width:760px)','@media(max-width:520px)','prefers-reduced-motion'])assert(css.includes(breakpoint));
  assert(js.includes("iframe.referrerPolicy='strict-origin-when-cross-origin'"));
  assert(js.includes("iframe.allowFullscreen=true"));
  assert(html.includes('rel="noopener noreferrer"'));
});
console.log(`v7.85 Video Course: ${count} PASS`);
