/** v7.86.3 deploy-only lazy dictionary transform.
 * Keeps editor/QA source HTML unchanged but publishes a smaller, faster HTML file.
 * 8,542 records and all dictionary behavior are left exactly as authored.
 */
export function lazyDictionaryHTML(html){
 const dataScript='<script src="/assets/yk-dictionary-v778-complete-draft.js?v=7841packed"></script>';
 const overlayScript='<script src="/assets/yk-dictionary-v783-overlay.js?v=783qa20261109"></script>';
 const marker='<!-- ===== V7.18 Dictionary pronunciation restore: based on V7.17, Dictionary only ===== -->';
 const start=html.indexOf(marker);
 if(!html.includes(dataScript)||!html.includes(overlayScript)||start<0)throw Error('v7863 dictionary lazy transform: missing original runtime markers');
 const begin=html.indexOf('<script>',start),end=html.indexOf('</script>',begin);
 if(begin<0||end<0)throw Error('v7863 dictionary runtime script not found');
 const code=html.slice(begin+8,end);
 if(!code.includes('Array.isArray(window.YK_DICTIONARY_V778)')||!code.includes('function openDictionaryReport(t)'))throw Error('v7863 dictionary: original QA/runtime not recognized');
 const loader=`<!-- v7.86.3: Load the dictionary only when the dictionary is close to the viewport or opened. -->
<script id="yk863-dictionary-loader">\n(()=>{
 'use strict';
 const section=document.getElementById('driving-dictionary');
 if(!section)return;
 let pending=null,ready=false,loading=null;
 const status=document.getElementById('dictionaryResults');
 function script(src){return new Promise((resolve,reject)=>{
  const el=document.createElement('script');el.src=src;el.async=true;
  el.onload=resolve;el.onerror=()=>reject(Error('Dictionary asset failed: '+src));
  document.head.appendChild(el);
 })}
 function load(){
  if(ready)return Promise.resolve();
  if(loading)return loading;
  if(status)status.innerHTML='<p class="dictionary-empty" role="status">Loading dictionary… · စကားလုံးဒေတာ ဖွင့်နေပါသည်…</p>';
  loading=script('/assets/yk-dictionary-v778-complete-draft.js?v=7841packed')
   .then(()=>script('/assets/yk-dictionary-v783-overlay.js?v=783qa20261109'))
   .then(()=>script('/assets/yk-dictionary-runtime-v7863.js?v=7863'))
   .then(()=>{ready=true; if(pending&&pending.isConnected){const node=pending;pending=null;node.click()}})
   .catch(()=>{loading=null; if(status){status.innerHTML='<p class="dictionary-empty" role="status">Dictionary unavailable. <button id="yk863RetryDictionary" type="button">Retry</button></p>';document.getElementById('yk863RetryDictionary')?.addEventListener('click',load)}});
  return loading;
 }
 window.YKLoadDictionaryV7863=load;
 section.addEventListener('focusin',load,{once:true});
 section.addEventListener('pointerdown',load,{once:true,passive:true});
 section.addEventListener('click',ev=>{
  if(ready)return;
  const el=ev.target.closest('[data-dict-cat],#dictFavMode,[data-recent],#dictionaryLoadMore');
  if(el){ev.preventDefault();ev.stopPropagation();pending=el;void load()}
 },true);
 if('IntersectionObserver' in window){
  const io=new IntersectionObserver(entries=>{if(entries.some(x=>x.isIntersecting)){io.disconnect();void load()}},{rootMargin:'450px 0px',threshold:0});io.observe(section);
 }else{void load()}
 if(location.hash==='#driving-dictionary'||location.hash==='#dictionary')void load();
 window.addEventListener('hashchange',()=>{if(location.hash==='#driving-dictionary'||location.hash==='#dictionary')void load()});
})()\n</script>`;
 const transformed=(html.slice(0,start).replace(dataScript,'').replace(overlayScript,'')+loader+html.slice(end+9))
  .replace(marker,'');
 if(transformed.includes('const incomingV769 ='))throw Error('v7863 dictionary inline was not externalized');
 return {html:transformed,code};
}
