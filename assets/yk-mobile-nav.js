/* Mobile navigation only: delegates all authentication and access to existing pages. */
(() => {
  'use strict';
  const nav = document.getElementById('yk-mobile-nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a[data-tab]')];
  function refresh() {
    const path = location.pathname;
    const studyHash = /^#(?:study-hub|yk82Hub|driving-dictionary|study-resources)$/.test(location.hash);
    const active = /\/study\//.test(path) || ((path === '/' || path === '/index.html') && studyHash) ? 'study'
      : /\/exams\/|\/mock-exams\.html$/.test(path) ? 'exam'
      : /\/video-class\.html$/.test(path) ? 'video'
      : /\/(?:login|dashboard|admin-dashboard|student-dashboard|member-dashboard|dictionary-reports)\.html$/.test(path) ? 'account' : 'home';
    for (const link of links) {
      if (link.dataset.tab === active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    const focused = document.activeElement;
    const editing = focused && (focused.matches('input,textarea,select') || focused.isContentEditable);
    const blocked = document.body.classList.contains('menu-open') || document.querySelector('#examPanel.active, dialog[open], .exam-v728-overlay.open');
    nav.hidden = Boolean(editing || blocked || document.fullscreenElement || document.webkitFullscreenElement);
  }
  // Observe only relevant state attributes. Never read/write user sessions or data.
  const observer = new MutationObserver(refresh);
  observer.observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'open']});
  for (const event of ['focusin', 'focusout', 'fullscreenchange', 'webkitfullscreenchange']) {
    document.addEventListener(event, () => queueMicrotask(refresh));
  }
  window.addEventListener('hashchange', refresh);
  window.addEventListener('pageshow', refresh);
  refresh();
})();
