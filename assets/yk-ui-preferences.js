/** YE KUN UI preferences v1 — presentation only.
 * Does not call endpoints, change session data or replace language translators.
 * The existing language buttons/select remain the source of truth.
 */
(() => {
  'use strict';
  const attr = 'data-yk-ui-theme';
  const themeKey = 'yk_ui_theme';
  const labels = {my:'မြန်မာ', en:'English', ja:'日本語'};
  const sun = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></svg>';
  const moon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.8 14.3A9 9 0 0 1 9.7 3.2a9 9 0 1 0 11.1 11.1Z"/></svg>';
  const readTheme = () => document.documentElement.getAttribute(attr)==='light'?'light':'dark';
  const persistTheme = v => {try{localStorage.setItem(themeKey,v)}catch{}};
  function applyTheme(value, save) {
    const v = value==='light'?'light':'dark';
    document.documentElement.setAttribute(attr, v);
    if (save) persistTheme(v);
    document.querySelectorAll('.yk-ui-theme-toggle').forEach(btn => {
      btn.innerHTML = v==='light'?sun:moon;
      btn.setAttribute('aria-label', v==='light'?'Switch to dark theme':'Switch to light theme');
      btn.setAttribute('title', v==='light'?'Dark theme':'Light theme');
      btn.setAttribute('aria-pressed', String(v==='light'));
    });
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',v==='light'?'#f3f4f6':'#09090a');
  }
  function themeButton(header) {
    if(!header || header.querySelector('.yk-ui-theme-toggle')) return;
    const btn=document.createElement('button');
    btn.type='button';btn.className='yk-ui-theme-toggle';
    btn.addEventListener('click', () => applyTheme(readTheme()==='dark'?'light':'dark', true));
    const afterLanguage=header.querySelector('.yk-ui-lang-picker, #ykDashboardLangPicker, #vcLanguage');
    const before=afterLanguage?.nextSibling||header.querySelector('.menu-toggle, .yk-auth-home, #vcAccountLink')||null;
    header.insertBefore(btn,before);
  }
  function enhanceLanguage(box) {
    if(!box || box.closest('.yk-ui-lang-picker')) return;
    const options=[...box.children].filter(el => el.tagName==='BUTTON');
    if(options.length!==3) return; // never rewrite unknown translation markup
    const wrapper=document.createElement('div');wrapper.className='yk-ui-lang-picker';
    const trigger=document.createElement('button');
    trigger.type='button';trigger.className='yk-ui-lang-trigger';
    trigger.setAttribute('aria-haspopup','true');trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('aria-label','Choose language');
    trigger.innerHTML='<span class="yk-ui-lang-value">မြန်မာ</span><span class="yk-ui-caret" aria-hidden="true">⌄</span>';
    box.parentNode.insertBefore(wrapper,box);
    wrapper.append(trigger,box);
    box.setAttribute('aria-label','Languages');
    const update=()=>{
      const current=options.find(b=>b.classList.contains('active') || b.getAttribute('aria-pressed')==='true');
      const guessed=options.find(b=>b.dataset.lang===document.documentElement.lang);
      const language=current?.dataset.lang||guessed?.dataset.lang||document.documentElement.lang||'my';
      const label=labels[language]||current?.textContent?.trim()||'မြန်မာ';
      trigger.querySelector('.yk-ui-lang-value').textContent=label;
    };
    const close=()=>{wrapper.classList.remove('yk-ui-lang-open');trigger.setAttribute('aria-expanded','false')};
    trigger.addEventListener('click',e=>{
      e.stopPropagation();const open=!wrapper.classList.contains('yk-ui-lang-open');
      document.querySelectorAll('.yk-ui-lang-open').forEach(x=>x.classList.remove('yk-ui-lang-open'));
      wrapper.classList.toggle('yk-ui-lang-open',open);trigger.setAttribute('aria-expanded',String(open));
    });
    options.forEach((button,i)=>{
      if(!button.hasAttribute('data-lang')) button.dataset.lang=['my','en','ja'][i];
      button.addEventListener('click',()=>{update();close()});
    });
    document.addEventListener('click',e=>{if(!wrapper.contains(e.target))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && wrapper.classList.contains('yk-ui-lang-open')){close();trigger.focus()}});
    const langObserver = new MutationObserver(update);
    langObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    update();
  }
  function ready() {
    // These existing buttons already own translation and persistence.
    enhanceLanguage(document.querySelector('.header-actions > .lang-switch, .yk-auth-header-actions > .auth-languages'));
    // Video already has one native select, Dashboard already has a details dropdown.
    const header=document.querySelector('.header-actions, .vc-top-actions, .yk-auth-header-actions, .topbar .top-actions');
    themeButton(header);
    applyTheme(readTheme(),false);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();
