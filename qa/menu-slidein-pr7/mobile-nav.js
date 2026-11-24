/* Mobile navigation only: delegates authentication and access to existing pages. */
(() => {
  'use strict';
  const nav = document.getElementById('yk-mobile-nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('[data-tab]')]; // ykoc-pr7-menu

  // Netlify Pretty URLs may serve /video-class.html as /video-class (or /video-class/).
  // Normalize only the path used for highlighting; keep every original link intact.
  function activeTab() {
    const path = (location.pathname.replace(/\/+$/, '').replace(/\.html$/i, '') || '/');
    if ((path === '/' || path === '/index') && location.hash === '#driving-dictionary') return 'dictionary';
    if (path === '/study/japanese-myanmar-dictionary') return 'dictionary';
    if (path === '/mock-second-license-qa' || path === '/mock-exams' || path.startsWith('/exams/')) return 'exam';
    if (path === '/video-class') return 'video';
    if (path.startsWith('/study/') || /^\/(login|dashboard|admin-dashboard|student-dashboard|member-dashboard|dictionary-reports)$/.test(path)) return 'menu';
    return 'home';
  }

  function refresh() {
    const active = document.body.classList.contains('menu-open') ? 'menu' : activeTab();
    for (const link of links) {
      if (link.dataset.tab === active) {
        if (link.getAttribute('aria-current') !== 'page') link.setAttribute('aria-current', 'page');
      } else if (link.hasAttribute('aria-current')) link.removeAttribute('aria-current');
    }
    const focused = document.activeElement;
    const editing = focused && (focused.matches('input,textarea,select') || focused.isContentEditable);
    const blocked = document.querySelector('#examPanel.active, dialog[open], .exam-v728-overlay.open');
    nav.hidden = Boolean(editing || blocked || document.fullscreenElement || document.webkitFullscreenElement);
  }
  // Observe only the owning body class and exam/modal state elements.
  // Watching every dictionary result insertion caused unnecessary full-nav scans.
  const observer = new MutationObserver(refresh);
  observer.observe(document.body, {attributes:true, attributeFilter:['class']});
  document.querySelectorAll('#examPanel,.exam-v728-overlay,dialog').forEach(el=>
    observer.observe(el, {attributes:true, attributeFilter:['class','open']}));
  for (const event of ['focusin', 'focusout', 'fullscreenchange', 'webkitfullscreenchange']) {
    document.addEventListener(event, () => queueMicrotask(refresh));
  }
  // Also handle browser history navigation, not just changes to the hash.
  for (const event of ['hashchange', 'popstate', 'pageshow']) window.addEventListener(event, refresh);
  refresh();
})();
