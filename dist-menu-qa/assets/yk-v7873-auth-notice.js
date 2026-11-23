/* v7.87.3: keep Netlify Identity / YKCR untouched; make existing signup feedback visible. */
(()=>{'use strict';
 const init=()=>{
  const status=document.getElementById('authStatus');
  const stage=document.getElementById('authStage');
  if(!status||!stage)return;
  status.setAttribute('tabindex','-1');
  let previous='';let scheduled=false;
  const sync=()=>{
   const showing=!status.hidden && !!status.textContent.trim();
   stage.classList.toggle('yk873-has-notice',showing);
   // On desktop the legacy animation uses absolutely positioned panels.
   // Expand their parent to the actual form content height, including long translations.
   const inner=stage.querySelector('.auth-form-inner');
   stage.style.minHeight=showing&&inner&&window.innerWidth>650
     ? Math.max(780,inner.scrollHeight+56)+'px' : '';
   if(!showing){previous='';return}
   const key=status.textContent.trim();
   if(key===previous)return;
   previous=key;
   if(scheduled)return;
   scheduled=true;
   requestAnimationFrame(()=>{scheduled=false;
     // Scroll only enough to expose the notice after the stage expands.
     status.scrollIntoView({behavior:'auto',block:'nearest',inline:'nearest'});
   });
  };
  new MutationObserver(sync).observe(status,{attributes:true,attributeFilter:['hidden','class'],childList:true,characterData:true,subtree:true});
  sync();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
