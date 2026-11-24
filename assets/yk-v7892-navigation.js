/* STUDYING WITH YE KUN v7.89.2 — fast local navigation and tactile Dictionary tab.
 * Navigation/UI only. No auth, payment, exam, storage, service-worker or API writes.
 */
(()=>{'use strict';
  const HOME_PATH=/^\/(?:index(?:\.html)?)?\/?$/i;
  const IDS=new Set(['home','driving-dictionary','portal','yk82Hub','study-hub','study-resources','about']);
  const nav=document.getElementById('yk-mobile-nav');
  const tab=nav?.querySelector('a[data-tab="dictionary"]');
  const drawer=document.getElementById('siteMenu');
  const html=document.documentElement;
  const atHome=()=>HOME_PATH.test(location.pathname);
  const idFromHref=href=>{
    const match=/^\/#([A-Za-z][A-Za-z0-9_-]*)$/.exec(href||'');
    return match&&IDS.has(match[1])?match[1]:null;
  };
  let jumpCounter=0;
  function showSelected(id){
    if(!nav)return;
    const tabName=id==='driving-dictionary'?'dictionary':'home';
    nav.querySelectorAll('[data-tab]').forEach(node=>{
      if(node.dataset.tab===tabName)node.setAttribute('aria-current','page');
      else node.removeAttribute('aria-current');
    });
  }
  function offset(){
    const fixed=document.querySelector('.top');
    const byElement=fixed&&getComputedStyle(fixed).position==='fixed'?fixed.getBoundingClientRect().height:0;
    const byVar=parseFloat(getComputedStyle(html).getPropertyValue('--yk-header-h'))||0;
    return Math.max(byElement,byVar,55)+12;
  }
  function jumpNow(id){
    const target=document.getElementById(id);
    if(!target)return false;
    // Reveal sections may otherwise remain transparent until an observer runs.
    if(target.classList.contains('reveal'))target.classList.add('visible');
    html.classList.add('yk-v7892-instant-jump');
    const y=Math.max(0,target.getBoundingClientRect().top+window.scrollY-offset());
    window.scrollTo(0,y);
    const token=++jumpCounter;
    requestAnimationFrame(()=>{
      if(token===jumpCounter)html.classList.remove('yk-v7892-instant-jump');
    });
    return true;
  }
  function closeDrawer(){
    if(!document.body.classList.contains('menu-open'))return;
    document.getElementById('menuClose')?.click();
    if(document.body.classList.contains('menu-open')){
      document.body.classList.remove('menu-open');
      drawer?.setAttribute('aria-hidden','true');
      document.getElementById('menuToggle')?.setAttribute('aria-expanded','false');
    }
  }
  function goTo(id){
    const target=document.getElementById(id);
    if(!atHome()||!target){location.assign('/#'+id);return;}
    closeDrawer();
    const next='/#'+id;
    if(location.pathname+location.search+location.hash!==next){
      history.pushState(null,'',next);
    }
    showSelected(id);
    // Let the drawer release overflow:hidden before computing scroll position.
    requestAnimationFrame(()=>jumpNow(id));
  }
  // Shortcuts already have valid hrefs; intercept ONLY existing known home anchors.
  // External links, login, exam pages and ordinary paths keep native navigation.
  drawer?.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link||!drawer.contains(link)||event.defaultPrevented||
       event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
    const id=idFromHref(link.getAttribute('href'));
    if(!id||!atHome()||!document.getElementById(id))return;
    event.preventDefault();
    goTo(id);
  });
  if(tab){
    tab.href='/#driving-dictionary';
    // Match Home / EXAM: use the shared nav state instead of dictionary-only
    // bounce/glow classes and delayed movement. Keep the fast in-page routing.
    tab.addEventListener('click',event=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||
         event.ctrlKey||event.altKey||event.shiftKey)return;
      event.preventDefault();
      if(atHome())goTo('driving-dictionary');
      else location.assign('/#driving-dictionary');
    });
  }
  // Arrivals from standalone pages should land immediately without a long
  // global html{scroll-behavior:smooth} animation down the home page.
  if(atHome()){
    const id=decodeURIComponent(location.hash.slice(1));
    if(IDS.has(id)){
      requestAnimationFrame(()=>requestAnimationFrame(()=>jumpNow(id)));
    }
  }
})();