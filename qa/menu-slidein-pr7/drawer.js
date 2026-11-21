/* YKOC Menu Option B · QA only · existing Identity client, existing routes.
 * No new API, DB, payment, YKCR, or progress writes. */
(() => {
 'use strict';
 const root=document.getElementById('ykoc-more'); if(!root)return;
 const $=id=>document.getElementById(id);
 const phrases={
  my:{menu:'Menu',welcome:'YKOC မှ ကြိုဆိုပါတယ်',guestDesc:'စာမေးပွဲဖြေဆိုရန် Login လိုအပ်ပြီး တိုးတက်မှုကို ရှိပြီးသား Account မှာ သိမ်းဆည်းပါတယ်။',login:'Login',create:'အကောင့်အသစ်ဖွင့်ရန်',signed:'Login ဝင်ထားသည် · YK Account',examExplore:'အစမ်းစာမေးပွဲများ ကြည့်ရန်',examAccess:'အကောင့်ဝင်ပြီး သတ်မှတ်ထားသော Free Attempt / Student / Paid Access စည်းကမ်းအတိုင်း ဖြေနိုင်ပါတယ်။',open:'ဖွင့်ရန်',continue:'လေ့လာမှု ဆက်လုပ်ရန်',continueDesc:'ရှိပြီးသား Study Hub ကို ဖွင့်ပါ။ အမှန်တကယ် Result တွေ Dashboard မှာရှိပါတယ်။',shortcuts:'SHORTCUTS · အမြန်သွားရန်',mock:'အစမ်းစာမေးပွဲ',mockSmall:'စာမေးပွဲများ',video:'Video Course',videoSmall:'Truck · Taxi · Bus',jlpt:'JLPT လေ့ကျင့်ခန်း',dictionary:'အဘိဓာန်',dictionarySmall:'ဂျပန် · မြန်မာ',hub:'လေ့လာရေး Hub',hubSmall:'သင်ခန်းစာများ',account:'ACCOUNT · အကောင့်',results:'My Results',resultsDesc:'Dashboard မှ ရလဒ်များ',plans:'Plans & Payment',plansDesc:'Exam Center မှ Plan များကြည့်ရန်',verify:'Student Verify',verifyDesc:'ရှိပြီးသား YKCR စနစ်ဖြင့် အတည်ပြုရန်',settings:'SETTINGS · ဆက်တင်များ',language:'ဘာသာစကား',languageDesc:'မြန်မာ · English · 日本語',dark:'Dark Mode',darkDesc:'Website Theme ကို တစ်ပြေးညီသုံးရန်',notifications:'Notifications',notificationsDesc:'မချိတ်ရသေးပါ · အသိပေးချက်မပို့ပါ',coming:'နောက်ပိုင်း',support:'SUPPORT · အကူအညီ',contact:'YE KUN ကို ဆက်သွယ်ရန်',faq:'အကူအညီ / FAQ',about:'YKOC အကြောင်း',follow:'FOLLOW · စောင့်ကြည့်ရန်',logout:'⇥ Logout',faq1:'မေး: Login မဝင်ဘဲ ဝင်ကြည့်လို့ရလား? ရပါတယ်။ ကာကွယ်ထားတဲ့ Exam ဖြေဖို့ Login လိုပါတယ်။',faq2:'မေး: သင်တန်းသားတွေ ဘယ်လိုဖြေလဲ? အတန်းသက်တမ်းအတွင်း YKCR Student Verification ဖြင့် Access ရပါတယ်။'},
  en:{menu:'Menu',welcome:'Welcome to YKOC',guestDesc:'Login to take protected mock exams and keep your existing account progress.',login:'Login',create:'Create account',signed:'Signed in · Existing YK Account',examExplore:'Explore mock exams',examAccess:'Login required to start. Existing free attempt, student and paid access rules apply.',open:'Open',continue:'Continue learning',continueDesc:'Open the existing Study Hub. Your real results remain in your dashboard.',shortcuts:'SHORTCUTS',mock:'Mock Exams',mockSmall:'Start or resume',video:'Video Course',videoSmall:'Truck · Taxi · Bus',jlpt:'JLPT Practice',dictionary:'Dictionary',dictionarySmall:'Japanese · Myanmar',hub:'Learning Hub',hubSmall:'Study resources',account:'ACCOUNT',results:'My Results',resultsDesc:'Verified exam results in your dashboard',plans:'Plans & Payment',plansDesc:'Current access plans in Exam Center',verify:'Student Verify',verifyDesc:'Use existing YKCR verification through your account',settings:'SETTINGS',language:'Language',languageDesc:'Myanmar · English · Japanese',dark:'Dark Mode',darkDesc:'Shared with your existing website theme',notifications:'Notifications',notificationsDesc:'Not connected yet · no alerts will be sent',coming:'Coming soon',support:'SUPPORT',contact:'Contact YE KUN',faq:'Help / FAQ',about:'About YKOC',follow:'FOLLOW',logout:'⇥ Logout',faq1:'Q: Can I browse without signing in? Yes. Protected mock exams require login.',faq2:'Q: How do students access exams? Verified students use the existing access system during their active class period.'},
  ja:{menu:'メニュー',welcome:'YKOCへようこそ',guestDesc:'模擬試験の受験にはログインが必要です。学習履歴は既存アカウントで管理します。',login:'ログイン',create:'新規登録',signed:'ログイン中 · YKアカウント',examExplore:'模擬試験を見る',examAccess:'ログインが必要です。無料1回・受講生・有料プランの既存ルールを適用します。',open:'開く',continue:'学習を続ける',continueDesc:'既存のStudy Hubを開きます。成績はダッシュボードで確認できます。',shortcuts:'ショートカット',mock:'模擬試験',mockSmall:'試験を見る',video:'動画講座',videoSmall:'Truck · Taxi · Bus',jlpt:'JLPT練習',dictionary:'辞書',dictionarySmall:'日本語 · ミャンマー語',hub:'学習ハブ',hubSmall:'教材と学習',account:'アカウント',results:'試験結果',resultsDesc:'既存のダッシュボードで確認',plans:'料金・お支払い',plansDesc:'試験センターで料金プランを確認',verify:'受講生認証',verifyDesc:'既存YKCR認証を使用',settings:'設定',language:'言語',languageDesc:'ミャンマー語 · 英語 · 日本語',dark:'ダークモード',darkDesc:'既存サイトのテーマと連動',notifications:'通知',notificationsDesc:'未設定 · 通知は送信しません',coming:'準備中',support:'サポート',contact:'YE KUNに連絡',faq:'ヘルプ / FAQ',about:'YKOCについて',follow:'フォロー',logout:'⇥ ログアウト',faq1:'Q: ログインせずに閲覧できますか？ はい。模擬試験の受験にはログインが必要です。',faq2:'Q: 受講生はどう利用しますか？ 有効な受講期間中に既存のYKCRで認証してください。'}
 };
 const codes = {my:'မြန်မာ', en:'English', ja:'日本語'};
 Object.assign(phrases.my,{resources:'လေ့လာရေးအရင်းအမြစ်များ',driving:'ယာဉ်မောင်းအဘိဓာန်'});
 Object.assign(phrases.en,{resources:'Study Resources',driving:'Driving Dictionary'});
 Object.assign(phrases.ja,{resources:'学習資料',driving:'運転辞書'});
 function saved(key) { try { return localStorage.getItem(key); } catch { return null; } }
 function save(key,value) { try { localStorage.setItem(key,value); } catch {} }
 const html=document.documentElement;
 function paintPreferences() {
   const language=codes[saved('yk_lang')] ? saved('yk_lang') : (codes[html.lang] ? html.lang : 'my');
   for(const el of root.querySelectorAll('[data-drawer-label]')) el.textContent=phrases[language][el.dataset.drawerLabel];
   for(const button of root.querySelectorAll('[data-more-lang]')) button.setAttribute('aria-pressed',String(button.dataset.moreLang===language));
   $('moreLangValue').textContent=codes[language];
   $('moreDark').setAttribute('aria-checked',String(html.getAttribute('data-yk-ui-theme')!=='light'));
 }
 function changeLanguage(value) {
   const button=document.querySelector('.lang-switch [data-lang="'+value+'"],.auth-languages [data-lang="'+value+'"],.lang-switch [onclick*="'+value+'"],[data-yk-lang="'+value+'"]');
   const select=$('vcLanguage');
   if(button) button.click();
   else if(select) {select.value=value; select.dispatchEvent(new Event('change',{bubbles:true}));}
   else html.lang=value;
   save('yk_lang',value);
   paintPreferences();
 }
 if(!html.hasAttribute('data-yk-ui-theme')) html.setAttribute('data-yk-ui-theme',saved('yk_ui_theme')==='light'?'light':'dark');
 new MutationObserver(paintPreferences).observe(html,{attributes:true,attributeFilter:['lang','data-yk-ui-theme']});
 paintPreferences();
 root.querySelectorAll('[data-more-lang]').forEach(button=>button.addEventListener('click',()=>changeLanguage(button.dataset.moreLang)));
 $('moreDark').addEventListener('click',()=>{
   const toggle=document.querySelector('.yk-ui-theme-toggle');
   if(toggle) toggle.click();
   else {
     const value=html.getAttribute('data-yk-ui-theme')==='light'?'dark':'light';
     html.setAttribute('data-yk-ui-theme',value);save('yk_ui_theme',value);
   }
 });
 $('moreSettingsButton').addEventListener('click',()=>$('moreSettings').scrollIntoView({block:'start'}));
 $('moreSearchToggle').addEventListener('click',()=>{const pane=$('moreSearchPanel');const open=!pane.classList.contains('open');pane.classList.toggle('open',open);$('moreSearchToggle').setAttribute('aria-expanded',String(open));if(open)$('moreSearchInput').focus();else{$('moreSearchInput').value='';filter('');}});
 function filter(q){let match=0;for(const el of root.querySelectorAll('[data-menu-search]')){const text=(el.dataset.menuSearch+' '+el.textContent).toLowerCase();const hidden=!!q&&!text.includes(q.trim().toLowerCase());el.classList.toggle('search-hidden',hidden);if(!hidden)match++;}return match;}
 $('moreSearchInput').addEventListener('input',e=>filter(e.target.value));
 $('moreFAQToggle').addEventListener('click',()=>{const faq=$('moreFAQ'),expanded=faq.hidden;faq.hidden=!expanded;$('moreFAQToggle').setAttribute('aria-expanded',String(expanded));});
 let signedIn=false,client=null;
 function status(text){const el=$('moreStatus');if(!text){el.hidden=true;el.textContent='';return;}el.hidden=false;el.textContent=text;}
 function paint(user){signedIn=!!user;$('moreGuest').hidden=signedIn;$('moreGuestAction').hidden=signedIn;$('moreMember').hidden=!signedIn;$('moreMemberAction').hidden=!signedIn;$('moreLogout').hidden=!signedIn;$('resultsLock').hidden=signedIn;$('verifyLock').hidden=signedIn;const name=user?.name||user?.user_metadata?.full_name||user?.full_name||user?.email||'Your account';$('moreMemberName').textContent=String(name);$('moreMemberEmail').textContent=String(user?.email||'');}
 async function auth(){const provider=window.YKIdentity; if(!provider?.getUser){paint(null);return;}client=provider;try{const u=await provider.getUser();paint(u);}catch{paint(null);}}
 $('moreLogout').addEventListener('click',async()=>{if(!signedIn)return;const btn=$('moreLogout');btn.disabled=true;try{if(!client?.logout)throw Error('Identity client not ready');await client.logout();paint(null);status('Logged out.');location.reload();}catch{status('Logout failed. Please retry.');}finally{btn.disabled=false;}});
 // Return to the same existing website page after login. Menu itself is not a new route.
 const loginPage=/^\/login(?:\.html)?\/?$/.test(location.pathname);
 const returnTo=loginPage ? (new URLSearchParams(location.search).get('return') || '/#home') : location.pathname+location.search+location.hash;
 for(const link of root.querySelectorAll('a[href^="/login.html?return="]')){
   const destination=new URL('/login.html',location.origin);
   destination.searchParams.set('return',returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/#home');
   if(link.dataset.drawerLabel==='create') destination.hash='signupForm';
   link.href=destination.href;
 }
 if(loginPage && location.hash==='#signupForm') document.querySelector('[data-switch="signup"]')?.click();
 paint(null);auth();window.addEventListener('yk-identity-ready',auth);window.addEventListener('yk-identity-callback',auth);window.addEventListener('pageshow',auth);document.addEventListener('visibilitychange',()=>{if(!document.hidden)auth();});

 // Existing site menu header owns the drawer state. Bottom Menu delegates to that
 // controller instead of opening a new page. Pages without a header get a local one.
 const drawer=document.getElementById('siteMenu'),bottom=document.getElementById('ykocBottomMenu');
 const headerToggle=document.getElementById('menuToggle');
 function setOpen(open){document.body.classList.toggle('menu-open',open);drawer?.setAttribute('aria-hidden',String(!open));headerToggle?.setAttribute('aria-expanded',String(open));bottom?.setAttribute('aria-expanded',String(open));bottom?.setAttribute('aria-current',open?'page':'false');if(open)drawer?.scrollTo?.(0,0);}
 function refresh(){const open=document.body.classList.contains('menu-open');bottom?.setAttribute('aria-expanded',String(open));$('ykDrawerOpen')?.setAttribute('aria-expanded',String(open));}
 bottom?.addEventListener('click',()=>{if(headerToggle){headerToggle.click();queueMicrotask(refresh);}else setOpen(!document.body.classList.contains('menu-open'));});
 // Source index/exam header already wires close/backdrop; fallback for other pages.
 if(!headerToggle){$('ykDrawerOpen')?.addEventListener('click',()=>setOpen(true));document.getElementById('menuClose')?.addEventListener('click',()=>setOpen(false));document.getElementById('menuBackdrop')?.addEventListener('click',()=>setOpen(false));document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});}
 drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{if(!headerToggle)setOpen(false);else queueMicrotask(refresh)}));
 new MutationObserver(refresh).observe(document.body,{attributes:true,attributeFilter:['class']});
 let opener=null;
 document.addEventListener('click',event=>{
   const trigger=event.target.closest('#menuToggle,#ykocBottomMenu,#ykDrawerOpen');
   if(trigger && !document.body.classList.contains('menu-open')) opener=trigger;
 },true);
 let wasOpen=false;
 new MutationObserver(()=>{
   const open=document.body.classList.contains('menu-open');
   if(open===wasOpen)return;
   wasOpen=open;
   if(open){drawer.scrollTop=0;$('menuClose').focus({preventScroll:true});}
   else if(opener?.isConnected) opener.focus({preventScroll:true});
 }).observe(document.body,{attributes:true,attributeFilter:['class']});
 refresh();
})();
