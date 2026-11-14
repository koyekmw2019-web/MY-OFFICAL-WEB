/** STUDYING WITH YE KUN v7.87.5-rc1 — mobile presentation only.
 * - Measures actual fixed-header-to-card gap on the home and exam pages.
 * - Gives the existing JLPT hamburger item visible tap feedback before allowing
 *   the original click handlers/navigation to run. No destination is changed.
 * No API calls, auth, storage writes, exam starts, or backend mutations.
 */
(() => {
  'use strict';
  const mobile = () => window.matchMedia('(max-width:720px)').matches;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raf2 = fn => requestAnimationFrame(() => requestAnimationFrame(fn));
  const targetPage = () => {
    const home = document.querySelector('body > .wrap > .hero#home');
    if (home && (!location.hash || location.hash === '#home'))
      return {box:home,first:home.querySelector('.hero-card')};
    const exam = document.querySelector('body.yk787-exam-page .wrap > #online-mock-exam');
    if (exam && !document.querySelector('#examPanel.active'))
      return {box:exam,first:exam.querySelector('.kicker')};
    return null;
  };
  function compactHeaderGap() {
    const entry=targetPage();
    if (!entry?.first || !entry.box || !mobile()) return;
    // Do not move offscreen reading content. A visible #home anchor is safe to trim.
    const topBefore = entry.first.getBoundingClientRect().top;
    if (window.scrollY > 24 && (topBefore < -20 || topBefore > window.innerHeight * .6)) return;
    const header=document.querySelector('.top');
    if (!header) return;
    entry.box.style.removeProperty('--yk875-top-trim');
    const headerBottom=header.getBoundingClientRect().bottom;
    const contentTop=entry.first.getBoundingClientRect().top;
    if (!Number.isFinite(headerBottom) || !Number.isFinite(contentTop)) return;
    const visibleGap=contentTop-headerBottom;
    // Preserve at least 14px beneath the fixed header; prevent large shifts.
    const trim=Math.max(0,Math.min(130,Math.round(visibleGap-14)));
    if (trim>0) entry.box.style.setProperty('--yk875-top-trim',trim+'px');
  }
  function scheduleMeasure() { raf2(compactHeaderGap); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',scheduleMeasure,{once:true});
  else scheduleMeasure();
  window.addEventListener('load',()=>{scheduleMeasure();window.setTimeout(scheduleMeasure,950);},{once:true});
  window.addEventListener('resize',scheduleMeasure,{passive:true});
  // A late font load can change the header height on translated pages.
  if (document.fonts?.ready) document.fonts.ready.then(scheduleMeasure).catch(()=>{});

  let replaying=false;
  document.addEventListener('pointerdown',event=>{
    const link=event.target.closest?.('#ykMenuJLPTV7864');
    if (!link || !mobile() || reduced()) return;
    link.classList.add('yk875-jlpt-pressed');
  },true);
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('#ykMenuJLPTV7864');
    if(!link || replaying || !mobile() || reduced() || event.defaultPrevented) return;
    if(event.button!==0 || event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return;
    // Capture before the legacy handler so the user can actually see the press.
    event.preventDefault();
    event.stopImmediatePropagation();
    link.classList.add('yk875-jlpt-pressed');
    window.setTimeout(()=>{
      replaying=true;
      try{link.click();}finally{replaying=false;}
      window.setTimeout(()=>link.classList.remove('yk875-jlpt-pressed'),320);
    },170);
  },true);
})();
