/* v7.86.2: Show current session on Video Course using the same identity client as Login/Dashboards.
 * Public video previews remain accessible to guests. Never trust browser labels for authorization. */
(()=>{'use strict';
 const account=document.getElementById('vcAccountLink');
 if(!account)return;
 let loggedIn=false,checking=false;
 const label=()=>{
  const lang=document.documentElement.lang;
  if(loggedIn){account.textContent='Dashboard';account.href='/dashboard.html';account.dataset.loggedIn='true';account.setAttribute('aria-label','Open your dashboard');}
  else {account.textContent='Login';account.href='/login.html';account.dataset.loggedIn='false';account.setAttribute('aria-label',lang==='ja'?'ログイン':'Login');}
 };
 const check=async()=>{
  if(checking)return;checking=true;
  try{
   if(!window.YKIdentity)return;
   const user=await window.YKIdentity.getUser();
   loggedIn=Boolean(user && user.id);
  }catch(_){loggedIn=false;}
  finally{checking=false;label();}
 };
 label();
 // The module may initialize before or after this deferred script.
 if(window.YKIdentity)void check();
 window.addEventListener('yk-identity-ready',()=>{void check();});
 window.addEventListener('pageshow',()=>{if(window.YKIdentity)void check();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&window.YKIdentity)void check();});
 document.getElementById('vcLanguage')?.addEventListener('change',label);
})();
