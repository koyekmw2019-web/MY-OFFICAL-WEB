/* YKOC v7.89.1 — Dictionary bottom-tab press animation / correct route. */
(()=>{'use strict';
const tab=document.querySelector('#yk-mobile-nav a[data-tab="dictionary"]');
if(!tab)return;
const target='/#driving-dictionary';
if(tab.getAttribute('href')!==target)tab.setAttribute('href',target);
const nav=document.getElementById('yk-mobile-nav');
const onDictionary=()=>/^\/(?:index(?:\.html)?)?$/.test(location.pathname)&&
  location.hash==='#driving-dictionary';
function highlight(){
 if(onDictionary())nav.querySelectorAll('[data-tab]').forEach(el=>
   el===tab?el.setAttribute('aria-current','page'):el.removeAttribute('aria-current'));
 tab.classList.remove('yk-dict-pressed');
}
tab.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.ctrlKey||
    event.metaKey||event.altKey||event.shiftKey)return;
 event.preventDefault();tab.classList.add('yk-dict-pressed');
 const go=()=>{
   tab.classList.remove('yk-dict-pressed');
   if(onDictionary())
     document.getElementById('driving-dictionary')?.scrollIntoView({behavior:'smooth',block:'start'});
   else location.assign(target);
 };
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)go();
 else setTimeout(go,155);
});
window.addEventListener('hashchange',highlight);
window.addEventListener('pageshow',highlight);
highlight();
})();