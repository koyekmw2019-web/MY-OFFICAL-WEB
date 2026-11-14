/* Mobile navigation only: delegates authentication and access to existing pages. */
(() => {
  'use strict';
  const nav = document.getElementById('yk-mobile-nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a[data-tab]')];

  // Netlify Pretty URLs may serve /video-class.html as /video-class (or /video-class/).
  // Normalize only the path used for highlighting; keep every original link intact.
  function activeTab() {
    const path = (location.pathname.replace(/\/+$/, '').replace(/\.html$/i, '') || '/');
    const studyHash = /^#(?:study-hub|yk82Hub|driving-dictionary|study-resources)$/.test(location.hash);
    if (/\/study(?:\/|$)/.test(path) || (path === '/' || path === '/index') && studyHash) return 'study';
    if (/\/exams(?:\/|$)/.test(path) || /\/mock-exams$/.test(path)) return 'exam';
    if (/\/video-class$/.test(path)) return 'video';
    if (/\/(?:login|dashboard|admin-dashboard|student-dashboard|member-dashboard|dictionary-reports)$/.test(path)) return 'account';
    return 'home';
  }

  function refresh() {
    const active = activeTab();
    for (const link of links) {
      if (link.dataset.tab === active) {
        if (link.getAttribute('aria-current') !== 'page') link.setAttribute('aria-current', 'page');
      } else if (link.hasAttribute('aria-current')) link.removeAttribute('aria-current');
    }
    const focused = document.activeElement;
    const editing = focused && (focused.matches('input,textarea,select') || focused.isContentEditable);
    const blocked = document.body.classList.contains('menu-open') || document.querySelector('#examPanel.active, dialog[open], .exam-v728-overlay.open');
    nav.hidden = Boolean(editing || blocked || document.fullscreenElement || document.webkitFullscreenElement);
  }
  // Observe only relevant state attributes. Never read/write user sessions or data.
  const observer = new MutationObserver(refresh);
  observer.observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['class','open']});
  for (const event of ['focusin', 'focusout', 'fullscreenchange', 'webkitfullscreenchange']) {
    document.addEventListener(event, () => queueMicrotask(refresh));
  }
  // Also handle browser history navigation, not just changes to the hash.
  for (const event of ['hashchange', 'popstate', 'pageshow']) window.addEventListener(event, refresh);
  refresh();
})();
