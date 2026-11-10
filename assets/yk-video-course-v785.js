/** STUDYING WITH YE KUN Video Course v7.85.0
 * Only supplied public YouTube video IDs. Iframes appear on user click; nothing is hosted on Netlify.
 * No authentication, payment, or private course-access claims are made by this preview page.
 */
(()=>{
  'use strict';
  const videos=Object.freeze({
    TRUCK:{id:'Uu9pI35J6Kw',title:'TRUCK — 特定技能 自動車運送業'},
    TAXI:{id:'sBQRpsDpBis',title:'TAXI — 特定技能 自動車運送業'},
    BUS:{id:'-_ZD6orT8b8',title:'BUS — 特定技能 自動車運送業'}
  });
  const state={category:'ALL',lastTrigger:null};
  const qs=(selector,root=document)=>root.querySelector(selector);
  const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const modal=qs('#vcPlayerDialog');
  const frameContainer=qs('#vcPlayerFrame');
  const playerTitle=qs('#vcPlayerTitle');
  const youtubeLink=qs('#vcWatchYoutube');
  const failNotice=qs('#vcPlayerNotice');
  function openPlayer(category,trigger){
    const video=videos[category];
    if(!video||!modal||!frameContainer||!modal.showModal)return;
    state.lastTrigger=trigger||document.activeElement;
    playerTitle.textContent=video.title;
    youtubeLink.href=`https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`;
    frameContainer.replaceChildren();
    const iframe=document.createElement('iframe');
    iframe.title=`YouTube ${video.title} — free sample lesson`;
    iframe.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&rel=0&playsinline=1`;
    iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen=true;
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    iframe.loading='eager';
    frameContainer.append(iframe);
    if(failNotice)failNotice.hidden=false; // fallback is always visible in case embedding is disabled
    modal.showModal();
  }
  function closePlayer(){if(modal&&modal.open)modal.close();}
  if(modal){
    modal.addEventListener('close',()=>{
      frameContainer.replaceChildren(); // removing iframe stops YouTube playback immediately
      if(state.lastTrigger?.isConnected)state.lastTrigger.focus({preventScroll:true});
      state.lastTrigger=null;
    });
    modal.addEventListener('click',(event)=>{if(event.target===modal)closePlayer();});
    qs('#vcPlayerClose')?.addEventListener('click',closePlayer);
  }
  all('[data-video-category]').forEach(button=>button.addEventListener('click',()=>openPlayer(button.dataset.videoCategory,button)));
  const filterButtons=all('[data-filter]');
  const cards=all('[data-course-category]');
  function applyFilter(category){
    state.category=category in videos||category==='ALL'?category:'ALL';
    filterButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===state.category)));
    cards.forEach(card=>card.hidden=state.category!=='ALL'&&card.dataset.courseCategory!==state.category);
    const counter=qs('#vcVisibleCount');
    if(counter)counter.textContent=String(cards.filter(c=>!c.hidden).length);
  }
  filterButtons.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.filter)));
  applyFilter('ALL');
  const langSelect=qs('#vcLanguage');
  function setLanguage(lang){
    if(!['my','en','ja'].includes(lang))lang='my';
    document.documentElement.lang=lang;
    all('[data-my][data-en][data-ja]').forEach(node=>{node.textContent=node.dataset[lang]??node.dataset.my;});
    if(langSelect)langSelect.value=lang;
    try{localStorage.setItem('yk_lang',lang);}catch{}
  }
  let preferred='my';
  try{preferred=localStorage.getItem('yk_lang')||'my';}catch{}
  setLanguage(preferred);
  langSelect?.addEventListener('change',()=>setLanguage(langSelect.value));
})();
