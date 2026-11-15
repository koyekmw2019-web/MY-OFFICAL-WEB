/** STUDYING WITH YE KUN v7.87.6 Fix 04 — optional large-card click target.
 * An existing <a> handles normal Grammar Detail navigation. This extends that
 * navigation to non-interactive padding of the Grammar Card, without touching
 * Bookmark, Mark Learned, quiz buttons, URLs, auth, or payment.
 */
(() => {
  'use strict';
  const body = document.body;
  if (!body?.classList.contains('yk82-page') || body.classList.contains('yk88-detail-page')) return;
  const content = document.getElementById('yk82Content');
  const tabs = document.getElementById('yk82Tabs');
  if (!content || !tabs) return;
  document.addEventListener('click', event => {
    if (event.defaultPrevented || !tabs.querySelector('[data-tab="grammar"][aria-selected="true"]')) return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest('a,button,input,textarea,select,[role="button"]')) return;
    const card = target.closest('.yk88-grammar-card');
    if (!card || !content.contains(card)) return;
    const link = card.querySelector('a.yk88-grammar-link[href^="/study/jlpt-grammar-detail.html?"]');
    if (link) link.click();
  });
})();
