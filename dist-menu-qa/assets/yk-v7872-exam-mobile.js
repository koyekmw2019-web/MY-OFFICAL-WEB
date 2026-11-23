/* Dedicated exam: bring quiz to the top after the *existing* exam engine starts.
 * Never programmatically starts an attempt or changes scores/access/auto-save. */
(()=>{'use strict';
 const init=()=>{
  const panel=document.getElementById('examPanel');
  if(!panel||!document.body.matches('.yk872-single-exam'))return;
  let changed=false;
  const sync=()=>{
   const active=panel.classList.contains('active') && !!panel.firstElementChild;
   document.body.classList.toggle('yk872-running',active);
   if(active&&!changed){
     changed=true;
     requestAnimationFrame(()=>panel.scrollIntoView({behavior:'instant',block:'start'}));
   }
   if(!active)changed=false;
  };
  new MutationObserver(sync).observe(panel,{childList:true,subtree:false,attributes:true,attributeFilter:['class']});
  sync();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
