/* STUDYING WITH YE KUN v7.89.4 — match Dictionary page crossfade to Home / EXAM.
 * Navigation/UI only. No auth, payment, exam, storage, service-worker or API writes.
 */
(()=>{'use strict';
  const HOME_PATH=/^\/(?:index(?:\.html)?)?\/?$/i;
  const IDS=new Set(['home','driving-dictionary','portal','yk82Hub','study-hub','study-resources','about']);
  const nav=document.getElementById('yk-mobile-nav');
  const studyTab=nav?.querySelector('a[data-tab="study"]');
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
    const tabName=['driving-dictionary','study-hub','yk82Hub','study-resources'].includes(id)?'study':'home';
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
    const apply=()=>{
      if(location.pathname+location.search+location.hash!==next){
        history.pushState(null,'',next);
      }
      showSelected(id);
      // Scroll in the same snapshot update, rather than an unrelated frame.
      jumpNow(id);
    };
    // Home / EXAM change whole documents, so they get native page crossfades.
    // Dictionary is an anchor on Home: give it the equivalent same-document
    // content crossfade without delaying navigation or bouncing its icon.
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if(id==='driving-dictionary' && !reduced && typeof document.startViewTransition==='function'){
      html.classList.add('yk-v7894-view');
      try{
        const transition=document.startViewTransition(apply);
        transition.finished.then(
          ()=>html.classList.remove('yk-v7894-view'),
          ()=>html.classList.remove('yk-v7894-view')
        );
      }catch{
        html.classList.remove('yk-v7894-view');
        apply();
        revealFallback(target);
      }
    }else{
      // Keep the existing immediate routing for other menu shortcuts.
      requestAnimationFrame(()=>{
        apply();
        if(id==='driving-dictionary'&&!reduced)revealFallback(target);
      });
    }
  }
  function revealFallback(target){
    target.classList.remove('yk-v7894-fade');
    void target.offsetWidth;
    target.classList.add('yk-v7894-fade');
    setTimeout(()=>target.classList.remove('yk-v7894-fade'),260);
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
  // The approved bottom navigation is Home · Study · Exam · Video · Account.
  // Dictionary remains a working fast shortcut in the hamburger drawer.
  studyTab?.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||
       event.ctrlKey||event.altKey||event.shiftKey)return;
    event.preventDefault();
    if(atHome())goTo('study-hub');
    else location.assign('/#study-hub');
  });
  nav?.querySelector('a[data-tab="home"]')?.addEventListener('click',event=>{
    if(!atHome()||event.defaultPrevented||event.button!==0||event.metaKey||
       event.ctrlKey||event.altKey||event.shiftKey)return;
    event.preventDefault();goTo('home');
  });
  // Arrivals from standalone pages should land immediately without a long
  // global html{scroll-behavior:smooth} animation down the home page.
  if(atHome()){
    const id=decodeURIComponent(location.hash.slice(1));
    if(IDS.has(id)){
      requestAnimationFrame(()=>requestAnimationFrame(()=>jumpNow(id)));
    }
  }
})();