/* YE KUN v7.57 — website nav session state; existing Netlify Identity only */
(()=>{
 'use strict';
 const link=document.getElementById('ykMenuAuthLink');
 const label=document.getElementById('ykMenuAuthLabel');
 const glyph=document.getElementById('ykMenuAuthIcon');
 if(!link||!label)return;
 const translations={my:{login:'အကောင့်ဝင်ရန် · Login',logout:'အကောင့်ထွက်ရန် · Logout'},en:{login:'Login',logout:'Logout'},ja:{login:'ログイン · Login',logout:'ログアウト · Logout'}};
 let signedIn=false,busy=false,seq=0;
 const locale=()=>['my','en','ja'].includes(document.documentElement.lang)?document.documentElement.lang:'my';
 function paint(){const s=translations[locale()];label.textContent=s[signedIn?'logout':'login'];link.setAttribute('aria-label',signedIn?'Logout':'Login');link.setAttribute('href',signedIn?'#home':'/login.html?return=%2F%23home');if(glyph)glyph.textContent=signedIn?'⇤':'⇥';}
 async function refresh(){const ticket=++seq;let user=null;try{user=await window.YKIdentity?.getUser?.()}catch{}if(ticket!==seq)return;signedIn=!!user;paint();}
 link.addEventListener('click',async event=>{
   if(busy){event.preventDefault();return;}
   if(!signedIn)return;
   event.preventDefault();busy=true;
   try{await window.YKIdentity.logout();signedIn=false;paint();window.YKExamAccess?.syncStatus?.();}
   catch(err){window.alert('Logout could not be completed. Please try again.');}
   finally{busy=false;}
 });
 window.YKMenuAuthV757={refresh};
 window.addEventListener('yk-identity-ready',refresh);
 window.addEventListener('yk-identity-callback',refresh);
 window.addEventListener('pageshow',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 document.addEventListener('click',e=>{if(e.target.closest('.lang-switch'))setTimeout(paint,0)});
 refresh();
})();
