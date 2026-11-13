/** v7.87.7: anonymous class-CTA-only measurement. No pageview, identity or PII.
 * A failed measurement never interrupts the user's external Facebook link.
 */
(()=>{'use strict';
 const allowed=new Set(['truck','taxi','bus','general']);
 const pick=(v,max)=>typeof v==='string'&&v.length<=max&&/^[a-z0-9][a-z0-9_-]*$/i.test(v)?v.toLowerCase():null;
 const search=new URLSearchParams(location.search);
 let campaign={};
 try{campaign=JSON.parse(sessionStorage.getItem('yk877_campaign')||'{}')||{}}catch{}
 // Session only, no cross-session cookies or tracking identifiers.
 for(const [key,max] of [['utm_source',48],['utm_medium',48],['utm_campaign',64]]){
   const raw=search.get(key);
   if(raw!==null)campaign[key]=pick(raw,max)||undefined;
 }
 try{sessionStorage.setItem('yk877_campaign',JSON.stringify(campaign))}catch{}
 document.addEventListener('click',event=>{
   if(!event.isTrusted)return; // Never report synthetic automated clicks.
   const a=event.target.closest?.('a[data-yk877-course]');
   const course=a?.dataset.yk877Course;
   if(!allowed.has(course))return;
   const url=new URL(a.href,location.href);
   if(url.protocol!=='https:'||url.hostname!=='www.facebook.com')return;
   const body=JSON.stringify({event:'class_cta_click',course,page:location.pathname,
     source:campaign.utm_source||'direct',medium:campaign.utm_medium||'none',campaign:campaign.utm_campaign||'none'});
   // Fire and forget. Never preventDefault, stop propagation, delay a link or retry.
   try{void fetch('/.netlify/functions/yk-growth-event',{
     method:'POST',credentials:'omit',mode:'same-origin',keepalive:true,
     headers:{'Content-Type':'application/json'},body
   }).catch(()=>{});}catch{}
 },{passive:true});
})();
