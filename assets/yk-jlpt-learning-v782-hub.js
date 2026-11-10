/* v7.82 — STUDY HUB level-dependent learning tiles; legacy SSW/Driving cards unchanged. */
(()=>{'use strict';const el=document.getElementById('yk82Hub'),buttons=document.getElementById('yk82HubLevels');if(!el||!buttons)return;
 const allowed=['N5','N4','N3','N2','N1'];let chosen='N5';
 try{const last=localStorage.getItem('yk_jlpt_hub_level_v782');if(allowed.includes(last))chosen=last}catch{}
 function paint(){const readingLink=document.getElementById('yk822HubReadingLink');if(readingLink)readingLink.href=`/study/jlpt-learning.html?level=${chosen}&section=reading`;buttons.querySelectorAll('[data-level]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.level===chosen)));
  el.querySelectorAll('[data-category]').forEach(link=>{
    const cat=link.dataset.category;
    link.href=cat==='mock'?`/#jlpt-exam-n${chosen[1]}`:`/study/jlpt-learning.html?level=${chosen}&section=${encodeURIComponent(cat)}`;
    const marker=link.querySelector('[data-current-level]');if(marker)marker.textContent=chosen;
    link.setAttribute('aria-label',`${chosen} ${cat==='mock'?'Mock Exam':cat} သို့ သွားရန်`);
  });
 }
 buttons.addEventListener('click',ev=>{const target=ev.target.closest('button[data-level]');if(!target||!allowed.includes(target.dataset.level))return;chosen=target.dataset.level;try{localStorage.setItem('yk_jlpt_hub_level_v782',chosen)}catch{}paint()});paint();
 const wordLevel=new URLSearchParams(window.location.search).get('jlpt_vocab');
 if(allowed.includes(wordLevel)){
  setTimeout(()=>{const chip=document.querySelector('#dictionaryToolsV7 [data-dict-cat="JLPT '+wordLevel+'"]');if(chip)chip.click()},400);
 }
})();
