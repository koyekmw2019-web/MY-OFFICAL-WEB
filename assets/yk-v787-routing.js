/* v7.87.2: Every exam gets its own page. No attempt is used by navigation.
 * Keep existing exam engine as the only owner of Start, login and scoring. */
(()=>{'use strict';
 const allowed=new Set(['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1']);
 const path=location.pathname;
 const isCenter=path==='/mock-exams.html';
 const isExamPage=/^\/exams\/(truck|taxi|bus|maintenance|car|motorcycle|moped|jlpt_n[1-5])\.html$/.test(path);
 const route=t=>'/exams/'+encodeURIComponent(t)+'.html';
 // Old saved exam links continue working without consuming a free attempt.
 if(isCenter){const query=new URLSearchParams(location.search).get('exam');if(allowed.has(query)){location.replace(route(query));return}}
 if(!isCenter&&!isExamPage&&location.hash==='#online-mock-exam'){
  location.replace('/mock-exams.html');return;
 }
 document.addEventListener('click',e=>{
   if(isExamPage)return; // Dedicated page Start button belongs to the original exam engine.
   const b=e.target.closest?.('[data-hub-exam], [data-exam-v728]');
   const type=b?.dataset.hubExam||b?.dataset.examV728;
   if(b&&allowed.has(type)){
     e.preventDefault();e.stopImmediatePropagation();
     location.assign(route(type));return;
   }
   const old=e.target.closest?.('a[href="#online-mock-exam"], a[href="/#online-mock-exam"]');
   if(old){e.preventDefault();e.stopImmediatePropagation();location.assign('/mock-exams.html')}
 },true);
 const nav=document.querySelector('.site-menu-nav');
 const setCurrent=()=>{
   if(!nav)return;
   nav.querySelectorAll('.yk864-menu-link').forEach(a=>a.removeAttribute('aria-current'));
   const now=location.pathname,hash=location.hash;
   const sel=isCenter||isExamPage?'a[href="/mock-exams.html"]':
     now.includes('/study/jlpt')||hash==='#yk82Hub'?'#ykMenuJLPTV7864':
     now.includes('/video-class')?'#ykMenuVideoCourseV785':
     hash==='#study-hub'?'a[href="#study-hub"]':null;
   if(sel)nav.querySelector(sel)?.setAttribute('aria-current','page');
 };
 setCurrent();addEventListener('hashchange',setCurrent,{passive:true});
})();
