/* YKOC v7.89.8 — dedicated exam directory only.
 * Correct the overlay at the VIEWPORT level, not just by adding bottom padding.
 * The scroll area ends at the TOP of the fixed bottom navigation and adapts to
 * Android custom-tab browser chrome, PWA viewport and device orientation.
 */
(()=>{'use strict';
const init=()=>{
  const body=document.body;
  if(!body?.classList.contains('yk787-exam-page'))return;
  const wrap=body.querySelector(':scope > .wrap');
  const nav=document.getElementById('yk-mobile-nav');
  if(!wrap||!nav)return;
  let raf=0;
  const measure=()=>{
    raf=0;
    if(window.matchMedia('(min-width: 721px)').matches){
      body.classList.remove('yk-v7898-safe-scroll');
      wrap.style.removeProperty('--yk-v7898-scroll-height');
      return;
    }
    const navStyle=getComputedStyle(nav);
    const navBox=nav.getBoundingClientRect();
    const wrapBox=wrap.getBoundingClientRect();
    if(navStyle.display==='none'||nav.hidden||navBox.height<20||
      body.classList.contains('menu-open')||
      body.classList.contains('yk872-running')||
      document.querySelector('#examPanel.active,dialog[open],.exam-v728-overlay.open')){
      body.classList.remove('yk-v7898-safe-scroll');
      return;
    }
    // The fixed dock is the actual boundary, not a guessed 73px padding.
    const visibleHeight=Math.floor(navBox.top-wrapBox.top-2);
    if(visibleHeight<160){
      body.classList.remove('yk-v7898-safe-scroll');
      return;
    }
    wrap.style.setProperty('--yk-v7898-scroll-height',visibleHeight+'px');
    body.classList.add('yk-v7898-safe-scroll');
  };
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(measure);};
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  window.addEventListener('pageshow',schedule,{passive:true});
  window.visualViewport?.addEventListener('resize',schedule,{passive:true});
  window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
  const ro=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
  ro?.observe(nav);
  const top=document.querySelector('.top');
  if(top)ro?.observe(top);
  const mo=new MutationObserver(schedule);
  mo.observe(body,{attributes:true,attributeFilter:['class']});
  mo.observe(nav,{attributes:true,attributeFilter:['hidden']});
  document.fonts?.ready?.then(schedule).catch(()=>{});
  schedule();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();