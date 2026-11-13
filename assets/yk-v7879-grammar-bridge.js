/* Grammar tab now opens full catalog without changing legacy progress or exam behavior.
 * Add ?legacy=1 to preserve access to the original 30 base lessons.
 */
(()=>{'use strict';if(!document.body?.classList.contains('yk82-page'))return;
 document.addEventListener('click',e=>{const b=e.target.closest?.('#yk82Tabs [data-tab="grammar"]');if(!b||new URLSearchParams(location.search).get('legacy')==='1'||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const level=document.querySelector('#yk82Levels [data-level][aria-pressed="true"]')?.dataset.level||'N5';
  if(!/^N[1-5]$/.test(level))return;
  e.preventDefault();e.stopImmediatePropagation();location.assign('/study/jlpt-grammar-library.html?level='+encodeURIComponent(level));
 },true);
})();
