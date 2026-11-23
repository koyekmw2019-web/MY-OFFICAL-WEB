/** STUDYING WITH YE KUN — UI Fix05 (Grammar Detail only).
 * Presentation-only enhancement. Keeps existing state callbacks + hrefs intact.
 * Top nav #yk88BackTop stays in DOM because original detail.js uses it. */
(() => {
  'use strict';
  if (!document.body?.classList.contains('yk88-detail-page')) return;
  const root=document.getElementById('yk88GrammarDetail');
  if (!root || typeof MutationObserver==='undefined') return;
  const setText=(el,label)=>{if(el && el.textContent!==label) el.textContent=label;};
  const setLabel=(el,label)=>{if(el && el.getAttribute('aria-label')!==label) el.setAttribute('aria-label',label);};
  function polish(){
    const group=root.querySelector('.yk88-detail-actions');
    if(!group) return; // Original async renderer has not created the controls yet.
    const back=root.querySelector('a.yk88-back');
    if(back && back.getAttribute('href')){
      back.classList.remove('yk88-back');
      back.classList.add('yk88-button','yk88-button-back');
      setText(back,'← Grammar သို့');
      setLabel(back,'Grammar စာရင်းသို့ ပြန်သွားရန်');
      group.append(back); // Move the ORIGINAL link, do not create a new route.
    }
    const bookmark=root.querySelector('#yk88Bookmark');
    if(bookmark && bookmark.textContent.trim()){
      const saved=bookmark.getAttribute('aria-pressed')==='true';
      setText(bookmark,saved?'★ သိမ်းပြီး':'☆ Bookmark');
      setLabel(bookmark,saved?'Bookmark ကို ဖယ်ရန်':'Bookmark သိမ်းရန်');
    }
    const learned=root.querySelector('#yk88Learned');
    if(learned && learned.textContent.trim()){
      setText(learned,'✓ လေ့လာပြီး');
      setLabel(learned,learned.disabled?'ဒီ Grammar ကို လေ့လာပြီးပါပြီ':'ဒီ Grammar ကို လေ့လာပြီးအဖြစ် မှတ်ရန်');
    }
  }
  // The original detail page renders asynchronously and later refreshes labels
  // after Bookmark / Mark learned; respond without touching its click handlers.
  const observer=new MutationObserver(polish);
  observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed','disabled']});
  polish();
})();
