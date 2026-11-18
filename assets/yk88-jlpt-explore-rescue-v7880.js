/** STUDYING WITH YE KUN — Explore Lessons scrolling hardening, QA ONLY.
 * Handles exactly one link, BEFORE legacy document-level click capture.
 * No changes to lessons, exam, identity, storage, progress, payments or YKCR.
 */
(() => {
  'use strict';
  if (!document.body?.classList.contains('yk82-page') || document.body.classList.contains('yk88-detail-page')) return;
  const selector = 'a.yk821-button-secondary[href="#yk82Title"]';
  const target = () => document.getElementById('yk82Title');
  const getOffset = () => {
    const header = document.querySelector('.yk82-top');
    const height = header?.getBoundingClientRect().height || 0;
    return Math.max(24, Math.ceil(height + 16));
  };
  function reveal() {
    const section = target();
    if (!section) return;
    // scrollIntoView works even if another element is the vertical scroll container.
    try { section.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'instant'}); }
    catch { section.scrollIntoView(); }
    // Offset the sticky header using actual geometry rather than a fixed pixel value.
    const delta = section.getBoundingClientRect().top - getOffset();
    if (Math.abs(delta) > 2) {
      try { window.scrollBy({top: delta, left: 0, behavior: 'instant'}); }
      catch { window.scrollBy(0, delta); }
    }
  }
  function followLink(event) {
    const node = event.target instanceof Element ? event.target : event.target?.parentElement;
    const link = node?.closest?.(selector);
    if (!link || !document.contains(link)) return;
    const heading = target();
    if (!heading) return; // Native anchor is still available if the destination is missing.
    event.preventDefault();
    // Window capture executes before legacy document-capture handlers even if loaded later.
    event.stopImmediatePropagation();
    try {
      if (location.hash !== '#yk82Title') {
        history.replaceState(history.state, '', location.pathname + location.search + '#yk82Title');
      }
    } catch { /* Scroll should still work even when history cannot be changed. */ }
    reveal();
    requestAnimationFrame(() => requestAnimationFrame(reveal));
  }
  window.addEventListener('click', followLink, true);
  window.addEventListener('pageshow', () => {
    if (location.hash === '#yk82Title') requestAnimationFrame(() => requestAnimationFrame(reveal));
  });
  window.addEventListener('hashchange', () => {
    if (location.hash === '#yk82Title') requestAnimationFrame(reveal);
  });
})();
