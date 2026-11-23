
/* v7.59: premium menu session state; no new auth, consistent English action labels. */
(()=>{
  'use strict';
  const link=document.getElementById('ykMenuAuthLink');
  const label=document.getElementById('ykMenuAuthLabel');
  const glyph=document.getElementById('ykMenuAuthIcon');
  const dashboard=document.getElementById('ykMenuDashboardLink');
  const hint=document.getElementById('ykMenuAuthHint');
  if(!link||!label)return;
  let signedIn=false,busy=false,seq=0;
  function paint(){
    label.textContent=signedIn?'Logout':'Login';
    link.setAttribute('aria-label',signedIn?'Logout':'Login');
    link.href=signedIn?'/#home':'/login.html?return=%2F%23home';
    if(glyph)glyph.classList.toggle('is-logout',signedIn);
    link.classList.toggle('is-logout',signedIn);
    if(hint)hint.textContent=signedIn?'SIGN OUT':'ACCOUNT';
    if(dashboard)dashboard.hidden=!signedIn;
  }
  async function refresh(){
    const current=++seq;
    try{const user=await window.YKIdentity?.getUser?.();if(current===seq){signedIn=!!user;paint();}}
    catch{if(current===seq){signedIn=false;paint();}}
  }
  link.addEventListener('click',async ev=>{
    if(busy){ev.preventDefault();return;}
    if(!signedIn)return;
    ev.preventDefault();busy=true;
    try{await window.YKIdentity.logout();signedIn=false;seq++;paint();window.YKExamAccess?.syncStatus?.();}
    catch{window.alert('Logout failed. Please retry.');}
    finally{busy=false;}
  });
  paint();
  window.YKMenuAuthV757={refresh};
  for(const evt of ['yk-identity-ready','yk-identity-callback','pageshow'])window.addEventListener(evt,refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  refresh();
})();
