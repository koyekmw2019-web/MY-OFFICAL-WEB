/* v7.87.4 — Cross-page menu navigation on education routes.
 * The original v7.77 JLPT click handler assumes #yk82Hub exists on the
 * current page and prevents the hyperlink's default action. On separate exam
 * pages that panel is hidden/absent, so use document capture before that
 * legacy handler. Do NOT touch the exam Start button or API layer.
 */
(()=>{'use strict';
 const allowed=new Set(['home','about','portal','study-hub','yk82Hub','study-resources','driving-dictionary']);
 if(!document.body?.classList.contains('yk874-education-menu'))return;
 document.addEventListener('click',event=>{
   if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const link=event.target.closest?.('.site-menu-nav a[data-yk874-return-home]');
   if(!link)return;
   const id=link.getAttribute('data-yk874-return-home');
   if(!allowed.has(id))return;
   const dest=new URL(link.href,location.href);
   if(dest.origin!==location.origin||dest.pathname!=='/'||dest.hash!=='#'+id)return;
   event.preventDefault();
   event.stopImmediatePropagation();
   location.assign('/#'+id);
 },true);
})();
