/* STUDYING WITH YE KUN · isolated QA-only drawer visual polish.
 * No network calls, no storage, no service worker, no Identity or payment changes.
 * Existing menu controller owns open/close; swipe uses existing Close button.
 */
(() => {
 'use strict';
 const drawer = document.getElementById('siteMenu');
 const root = document.getElementById('ykoc-more');
 if (!drawer || !root) return;
 const ns='http://www.w3.org/2000/svg';
 const icons={
   pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-5 1 1-5Z"/>',
   play:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4z"/>',
   book:'<path d="M12 7v14"/><path d="M12 7C9 5 5 4 2 5v14c3-1 7 0 10 2 3-2 7-3 10-2V5c-3-1-7 0-10 2z"/>',
   bookmark:'<path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z"/>',
   grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
   chart:'<path d="M4 20h16"/><path d="M7 16v-5"/><path d="M12 16V6"/><path d="M17 16v-8"/>',
   credit:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
   verify:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
   languages:'<path d="m5 8 6 6m-7 0 6-6M2 5h12M8 2v3"/><path d="m13 21 5-10 5 10m-8-4h6"/>',
   moon:'<path d="M20.8 14a9 9 0 0 1-10.8-10.8A9 9 0 1 0 20.8 14z"/>',
   bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9z"/><path d="M10 21h4"/>',
   mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 8 10-8"/>',
   help:'<circle cx="12" cy="12" r="10"/><path d="M9.5 9a3 3 0 0 1 5.7 1c0 2-3.2 2.4-3.2 4"/><circle cx="12" cy="17.5" r=".75" fill="currentColor" stroke="none"/>',
   info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6"/><path d="M12 7h.01"/>',
   settings:'<path d="M10 2.5h4l.65 2.25 2.15.9 2.05-1.1 2.65 2.65-1.1 2.05.9 2.15 2.2.6v3.8l-2.2.6-.9 2.15 1.1 2.05-2.65 2.65-2.05-1.1-2.15.9L14 21.5h-4l-.65-2.25-2.15-.9-2.05 1.1-2.65-2.65 1.1-2.05-.9-2.15-2.2-.6v-3.8l2.2-.6.9-2.15-1.1-2.05 2.65-2.65 2.05 1.1 2.15-.9Z"/><circle cx="12" cy="12" r="3"/>',
   search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
   close:'<path d="M18 6 6 18M6 6l12 12"/>',
   instagram:'<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
   youtube:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
   music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 };
 function svg(name){
   const e=document.createElementNS(ns,'svg');
   e.setAttribute('viewBox','0 0 24 24');
   e.setAttribute('aria-hidden','true');
   e.setAttribute('focusable','false');
   e.classList.add('yk-menu-icon');
   e.innerHTML=icons[name]||icons.info;
   return e;
 }
 function iconize(el,name){if(!el || !icons[name])return;el.replaceChildren(svg(name));}
 const shortcutIcons=['pen','play','bookmark','book','book','grid','book','book'];
 root.querySelectorAll('.shortcut .symbol').forEach((el,i)=>iconize(el,shortcutIcons[i]||'book'));
 const rowIcons=['chart','credit','verify','languages','moon','bell','mail','help','info'];
 root.querySelectorAll('.item .ico').forEach((el,i)=>iconize(el,rowIcons[i]||'info'));
 iconize(document.getElementById('moreSearchToggle'),'search');
 iconize(document.getElementById('moreSettingsButton'),'settings');
 iconize(document.getElementById('menuClose'),'close');
 // Align the existing three control nodes inside one flex header. Do NOT
 // clone buttons: original search/settings/close listeners remain attached.
 const head=drawer.querySelector('.ykoc-drawer-head');
 const topActions=root.querySelector('.top-actions');
 const closeButton=document.getElementById('menuClose');
 if(head && topActions && closeButton && topActions.parentElement!==head){
   head.insertBefore(topActions,closeButton);
 }
 root.querySelectorAll('.social-icon').forEach(el=>{
   const title=el.getAttribute('aria-label')||'';
   if(title==='Instagram'||title==='TikTok'||title==='YouTube')iconize(el,title==='Instagram'?'instagram':title==='TikTok'?'music':'youtube');
   el.dataset.platform=title.toLowerCase();
 });
 // Compact typographic footer: do not alter upper logo or social media links.
 const footer=root.querySelector('.footer');
 if(footer){
   const brand=document.createElement('strong'); brand.className='yk-menu-footer-brand'; brand.textContent='STUDYING WITH YE KUN';
   const handle=document.createElement('span'); handle.className='yk-menu-footer-handle'; handle.textContent='@YKOC';
   footer.classList.add('yk-menu-text-footer'); footer.replaceChildren(brand,handle);
 }
 // Per-item tap feedback. Never intercept navigation or form buttons.
 const targetSelector='.shortcut,.item,.social-icon,.social-row,.pill,.underlink,.small-button,.circle,.logout,.lang-list button,.menu-close';
 let pressed=null;
 function release(){ if(!pressed)return; const old=pressed; pressed=null; setTimeout(()=>old.classList.remove('yk-menu-pressed'),120); }
 drawer.addEventListener('pointerdown',event=>{
   if(event.pointerType==='mouse'&&event.button!==0)return;
   const el=event.target.closest(targetSelector);
   if(!el||!drawer.contains(el))return;
   release();pressed=el;el.classList.add('yk-menu-pressed');
 },{passive:true});
 drawer.addEventListener('pointerup',release,{passive:true});
 drawer.addEventListener('pointercancel',release,{passive:true});
 drawer.addEventListener('pointerleave',release,{passive:true});
 // Close drawer via a deliberate swipe to the right. Vertical scrolling is unchanged.
 let gesture=null, suppressionUntil=0;
 const isOpen=()=>document.body.classList.contains('menu-open');
 const clearSwipe=()=>{drawer.classList.remove('yk-swipe-dragging','yk-swipe-closing');drawer.style.removeProperty('--yk-swipe-x');};
 drawer.addEventListener('pointerdown',event=>{
   if(!isOpen() || event.pointerType==='mouse' || !event.isPrimary ||
      event.target.closest('button,a,input,select,textarea,summary,[role="switch"]'))return;
   gesture={id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,drag:false};
 },{passive:true});
 drawer.addEventListener('pointermove',event=>{
   if(!gesture||event.pointerId!==gesture.id ||!isOpen())return;
   const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
   if(!gesture.drag){
     if(Math.abs(dy)>16 && Math.abs(dy)>Math.abs(dx)) {gesture=null;return;}
     if(dx<=12||dx<Math.abs(dy)*1.35)return;
     gesture.drag=true;drawer.classList.add('yk-swipe-dragging');
   }
   gesture.dx=Math.max(0,Math.min(drawer.getBoundingClientRect().width,dx));
   drawer.style.setProperty('--yk-swipe-x',gesture.dx+'px');
   if(event.cancelable)event.preventDefault();
 },{passive:false});
 function finish(event){
   if(!gesture||event.pointerId!==gesture.id)return;
   const g=gesture;gesture=null;
   if(!g.drag){clearSwipe();return;}
   suppressionUntil=Date.now()+400;
   const shouldClose=g.dx>Math.max(76,Math.min(130,drawer.clientWidth*.25));
   if(shouldClose){
     drawer.classList.remove('yk-swipe-dragging');drawer.classList.add('yk-swipe-closing');
     drawer.style.removeProperty('--yk-swipe-x');
     // Use the site's ORIGINAL close controller to restore focus / ARIA and backdrop.
     document.getElementById('menuClose')?.click();
     setTimeout(clearSwipe,330);
   } else {clearSwipe();}
 }
 drawer.addEventListener('pointerup',finish,{passive:true});
 drawer.addEventListener('pointercancel',finish,{passive:true});
 // A completed swipe must not accidentally tap a card beneath the pointer.
 drawer.addEventListener('click',event=>{
   if(event.isTrusted && Date.now()<suppressionUntil){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 new MutationObserver(()=>{if(!isOpen())clearSwipe();}).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
