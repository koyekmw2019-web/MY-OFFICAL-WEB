/** v7.87.6 JLPT mobile: prevent document-wide horizontal anchor jump; ensure
 * existing grammar cards navigate even if the previous lesson renderer is cached.
 * No interception of exam, payment, login, bookmarks or completion actions. */
(() => {
  'use strict';
  if (!document.body.classList.contains('yk82-page') || document.body.classList.contains('yk88-detail-page')) return;
  const header = document.querySelector('.yk82-top');
  const title = document.getElementById('yk82Title');
  const tabs = document.getElementById('yk82Tabs');
  if (!title || !tabs) return;
  const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const mobile = () => window.matchMedia?.('(max-width: 900px)')?.matches ?? false;
  const offset = () => Math.max(24, Math.ceil((header?.getBoundingClientRect().height || 0) + 16));
  function syncOffset() {
    document.documentElement.style.setProperty('--yk88-sticky-offset', offset() + 'px');
  }
  function keepHorizontalPosition() {
    if (window.scrollX !== 0) window.scrollTo({left:0, top:window.scrollY, behavior:'instant'});
  }
  function scrollToLessons(smooth) {
    syncOffset();
    const y = Math.max(0, Math.round(window.scrollY + title.getBoundingClientRect().top - offset()));
    window.scrollTo({left:0, top:y, behavior:smooth && !prefersReducedMotion()?'smooth':'instant'});
  }
  document.addEventListener('click', event => {
    const explore = event.target.closest?.('.yk821-button-secondary[href="#yk82Title"]');
    if (explore && mobile()) {
      event.preventDefault();
      // Keep the same URL anchor for browser Back and direct sharing.
      if (location.hash !== '#yk82Title') { try { history.replaceState(history.state, '', location.pathname + location.search + '#yk82Title'); } catch {} }
      scrollToLessons(true);
      return;
    }
    // Fallback only for old cached renderers with no clickable grammar link.
    // The new renderer has a real <a> and uses native browser navigation.
    if (event.defaultPrevented || event.target.closest?.('a,button,input,select,textarea,[role="button"]')) return;
    if (!tabs.querySelector('[data-tab="grammar"][aria-selected="true"]')) return;
    const card = event.target.closest?.('#yk82Content .yk82-lesson');
    if (!card || card.querySelector('a.yk88-grammar-link')) return;
    const id = card.querySelector('button[data-action="bookmark"][data-id]')?.getAttribute('data-id');
    const level = id?.split('-')[0];
    if (!/^N[1-5]-g-\d+$/.test(id || '')) return;
    location.assign('/study/jlpt-grammar-detail.html?v=7876fix03&level=' + encodeURIComponent(level) + '&id=' + encodeURIComponent(id));
  }, true);
  syncOffset();
  window.addEventListener('resize', syncOffset, {passive:true});
  window.addEventListener('pageshow', () => {
    syncOffset();
    if (mobile() && location.hash === '#yk82Title') requestAnimationFrame(() => requestAnimationFrame(() => scrollToLessons(false)));
    else if (mobile()) keepHorizontalPosition();
  });
  window.addEventListener('hashchange', () => {
    if (mobile() && location.hash === '#yk82Title') requestAnimationFrame(() => scrollToLessons(false));
  });
})();
