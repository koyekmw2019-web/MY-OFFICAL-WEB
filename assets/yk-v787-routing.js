/* v7.87: Dedicated Exam navigation and active hamburger state.
 * Navigation-only. Never changes attempt count, authorization or exam scoring. */
(()=>{'use strict';
 const allowed=new Set(['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1']);
 const isExamPage=location.pathname.endsWith('/mock-exams.html');
 const route=t=>'/mock-exams.html?exam='+encodeURIComponent(t);
 // Preserve old #online-mock-exam bookmarks as a forward to the standalone center.
 if(!isExamPage&&location.hash==='#online-mock-exam'){location.replace('/mock-exams.html');return;}
 document.addEventListener('click',e=>{
   if(isExamPage)return; // Original exam engine owns Start buttons on the dedicated page.
   const b=e.target.closest?.('[data-hub-exam], [data-exam-v728]');
   const type=b?.dataset.hubExam||b?.dataset.examV728;
   if(b&&allowed.has(type)){
     e.preventDefault();e.stopImmediatePropagation();
     location.assign(route(type));return;
   }
   const old=e.target.closest?.('a[href="#online-mock-exam"], a[href="/#online-mock-exam"]');
   if(old){e.preventDefault();e.stopImmediatePropagation();location.assign('/mock-exams.html')}
 },true);
 // Current-page highlight only. No permanently red JLPT menu.
 const nav=document.querySelector('.site-menu-nav');
 const setCurrent=()=>{
   if(!nav)return;
   nav.querySelectorAll('.yk864-menu-link').forEach(a=>a.removeAttribute('aria-current'));
   const path=location.pathname,hash=location.hash;
   const sel=isExamPage?'a[href="/mock-exams.html"]':
     path.includes('/study/jlpt')||hash==='#yk82Hub'?'#ykMenuJLPTV7864':
     path.includes('/video-class')?'#ykMenuVideoCourseV785':
     hash==='#study-hub'?'a[href="#study-hub"]':null;
   if(sel)nav.querySelector(sel)?.setAttribute('aria-current','page');
 };
 setCurrent();addEventListener('hashchange',setCurrent,{passive:true});
 if(isExamPage){
   const t=new URLSearchParams(location.search).get('exam');
   if(allowed.has(t)){
     const b=document.querySelector('[data-exam-v728="'+t+'"]');
     if(b){b.closest('.exam-category')?.classList.add('yk787-exam-target');
       const go=()=>b.closest('.exam-category')?.scrollIntoView({behavior:'instant',block:'center'});
       addEventListener('load',go,{once:true});
     }
   }
 }
})();
