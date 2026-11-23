/** PR #7 menu display translations. Local UI only; zero network, zero backend writes.
 * Compatible with existing yk_lang/yk_ui_theme keys and both QA and source drawer.
 * Brand names STUDYING WITH YE KUN and YKOC stay unchanged.
 */
(() => {
 'use strict';
 const root=document.getElementById('ykoc-more');
 if(!root) return;
 const translations={
  my:{
   menu:'MENUS',welcome:'YKOC မှ ကြိုဆိုပါတယ်',guestDesc:'စာမေးပွဲဖြေပြီး လေ့လာမှုမှတ်တမ်း သိမ်းဆည်းရန် အကောင့်ဝင်ပါ။ ရှိပြီးသား Exam Access စည်းကမ်းများကို ဆက်လက်အသုံးပြုပါမယ်။',login:'အကောင့်ဝင်ရန်',create:'အကောင့်ဖွင့်ရန်',signed:'အကောင့်ဝင်ထားသည် · YK အကောင့်',
   examExplore:'အခမဲ့ အစမ်းစာမေးပွဲ စမ်းကြည့်ရန်',examAccess:'လေ့ကျင့်ခန်းများကို ကြည့်နိုင်ပါသည်။ တကယ့်စာမေးပွဲ Access သည် လက်ရှိစည်းကမ်းအတိုင်း ဖြစ်ပါသည်။',start:'စတင်ရန်',open:'ဖွင့်ရန်',continue:'ဆက်လက်လေ့လာရန်',continueDesc:'ရှိပြီးသား သင်ခန်းစာများကို ဆက်လေ့လာနိုင်ပါတယ်။ ရလဒ်အစစ်များကို Dashboard မှာ ကြည့်ပါ။',
   shortcuts:'အမြန်သွားရန်',mock:'အစမ်းစာမေးပွဲ',mockSmall:'စာမေးပွဲ လေ့ကျင့်ရန်',video:'ဗီဒီယိုသင်ခန်းစာ',videoSmall:'TRUCK · TAXI · BUS',jlpt:'JLPT လေ့ကျင့်ရန်',dictionary:'အဘိဓာန်',dictionarySmall:'ဂျပန် · မြန်မာ အဘိဓာန်',hub:'လေ့လာရေး Hub',hubSmall:'သင်ခန်းစာများ',resources:'လေ့လာရေးအရင်းအမြစ်များ',driving:'ယာဉ်မောင်းအဘိဓာန်',
   account:'အကောင့်',results:'စာမေးပွဲရလဒ်များ',resultsDesc:'Dashboard မှာ ရလဒ်များ ကြည့်ရန်',plans:'သင်တန်းအစီအစဉ်နှင့် ငွေပေးချေမှု',plansDesc:'သက်ဆိုင်ရာ Plan များ ကြည့်ရန်',verify:'သင်တန်းသားအတည်ပြုခြင်း',verifyDesc:'မူရင်း YKCR စနစ်ဖြင့် အတည်ပြုရန်',
   settings:'ဆက်တင်များ',language:'ဘာသာစကား',languageDesc:'မြန်မာ · English · 日本語',dark:'အမှောင်ပုံစံ',darkDesc:'ဝက်ဘ်ဆိုက် အရောင်ပုံစံ',notifications:'အသိပေးချက်များ',notificationsDesc:'Preview Setting သာဖြစ်ပြီး အသိပေးချက် မပို့ပါ',coming:'မကြာမီ',
   support:'အကူအညီ',contact:'YE KUN ကို ဆက်သွယ်ရန်',faq:'အကူအညီ / FAQ',about:'YKOC အကြောင်း',follow:'လူမှုကွန်ရက်',logout:'အကောင့်မှ ထွက်ရန်',
   faq1:'မေး: Login မဝင်ဘဲ လေ့လာလို့ရသလား? ရပါတယ်။ Access လိုအပ်သော စာမေးပွဲများအတွက် အကောင့်ဝင်ရပါမယ်။',faq2:'မေး: သင်တန်းသားများ ဘယ်လိုအသုံးပြုမလဲ? သင်တန်းသက်တမ်းအတွင်း ရှိပြီးသား Student Verification ကို အသုံးပြုပါ။',
   moreLinks:'အခြား လေ့လာရေးလင့်ခ်များ',portal:'ပေါ်တယ်',mockAux:'စာမေးပွဲ',videoAux:'ဗီဒီယို',jlptAux:'ဂျပန်စာ',dictionaryAux:'အဘိဓာန်',hubAux:'သင်ခန်းစာများ',portalAux:'ပေါ်တယ်',loginLock:'🔒 အကောင့်ဝင်ရန်',followYe:'YE KUN ကို Follow လုပ်ရန်',facebookPage:'Facebook စာမျက်နှာ',search:'မီနူးရှာရန်…',close:'မီနူးပိတ်ရန်',gear:'ဆက်တင်များ',searchAria:'မီနူးရှာရန်',notifyAria:'အသိပေးချက် Preview Setting'
  },
  en:{
   menu:'MENUS',welcome:'Welcome to YKOC',guestDesc:'Sign in to take exams and sync your progress. Existing exam access rules remain unchanged.',login:'Login',create:'Create account',signed:'Signed in · YK account',
   examExplore:'Take a free mock exam',examAccess:'Explore practice exams. Real exam access follows existing rules.',start:'Start',open:'Open',continue:'Continue learning',continueDesc:'Return to the Study Hub. Actual results remain in your dashboard.',
   shortcuts:'SHORTCUTS',mock:'Mock Exams',mockSmall:'Practice exams',video:'Video Course',videoSmall:'TRUCK · TAXI · BUS',jlpt:'JLPT Practice',dictionary:'Dictionary',dictionarySmall:'Japanese · Myanmar',hub:'Learning Hub',hubSmall:'Study resources',resources:'Study Resources',driving:'Driving Dictionary',
   account:'ACCOUNT',results:'My Results',resultsDesc:'Review your dashboard results',plans:'Plans & Payment',plansDesc:'See current access plans',verify:'Student Verify',verifyDesc:'Use the existing YKCR verification',
   settings:'SETTINGS',language:'Language',languageDesc:'Myanmar · English · Japanese',dark:'Dark Mode',darkDesc:'Website color preference',notifications:'Notifications',notificationsDesc:'Preview preference only · no alerts sent',coming:'Coming soon',
   support:'SUPPORT',contact:'Contact YE KUN',faq:'Help / FAQ',about:'About YKOC',follow:'FOLLOW',logout:'Logout',
   faq1:'Q: Can I browse without logging in? Yes. Protected exams require login.',faq2:'Q: How do students access exams? Use existing student verification during your active class period.',
   moreLinks:'More study resources',portal:'Portal',mockAux:'Exam',videoAux:'Video',jlptAux:'Japanese',dictionaryAux:'Dictionary',hubAux:'Study Hub',portalAux:'Portal',loginLock:'🔒 Login',followYe:'Follow YE KUN',facebookPage:'Facebook Page',search:'Search menu…',close:'Close menu',gear:'Settings',searchAria:'Search menu',notifyAria:'Notifications demo preference'
  },
  ja:{
   menu:'MENUS',welcome:'YKOCへようこそ',guestDesc:'試験を受け、学習履歴を同期するにはログインしてください。既存の受験ルールは変わりません。',login:'ログイン',create:'新規登録',signed:'ログイン中 · YKアカウント',
   examExplore:'無料の模擬試験を見る',examAccess:'練習問題を閲覧できます。実際の受験には既存の利用条件が適用されます。',start:'開始',open:'開く',continue:'学習を続ける',continueDesc:'学習ハブに戻ります。実際の試験結果はダッシュボードで確認できます。',
   shortcuts:'ショートカット',mock:'模擬試験',mockSmall:'試験の練習',video:'動画講座',videoSmall:'TRUCK · TAXI · BUS',jlpt:'JLPTの練習',dictionary:'辞書',dictionarySmall:'日本語 · ミャンマー語',hub:'学習ハブ',hubSmall:'学習資料',resources:'学習資料',driving:'運転用語辞典',
   account:'アカウント',results:'試験結果',resultsDesc:'ダッシュボードで確認',plans:'料金・お支払い',plansDesc:'利用プランを見る',verify:'受講生認証',verifyDesc:'既存のYKCR認証を使用',
   settings:'設定',language:'言語',languageDesc:'ミャンマー語 · 英語 · 日本語',dark:'ダークモード',darkDesc:'サイトの表示テーマ',notifications:'通知',notificationsDesc:'表示設定のみ · 通知は送信されません',coming:'準備中',
   support:'サポート',contact:'YE KUNへ連絡',faq:'ヘルプ / FAQ',about:'YKOCについて',follow:'フォロー',logout:'ログアウト',
   faq1:'Q: ログインせずに閲覧できますか？ はい。保護された試験の受験にはログインが必要です。',faq2:'Q: 受講生はどう利用しますか？ 受講期間内に既存の受講生認証を利用してください。',
   moreLinks:'その他の学習資料',portal:'ポータル',mockAux:'試験',videoAux:'動画',jlptAux:'日本語',dictionaryAux:'辞書',hubAux:'学習ハブ',portalAux:'ポータル',loginLock:'🔒 ログイン',followYe:'YE KUNをフォロー',facebookPage:'Facebookページ',search:'メニューを検索…',close:'メニューを閉じる',gear:'設定',searchAria:'メニュー検索',notifyAria:'通知の表示設定'
  }
 };
 const keys=['my','en','ja'];
 const $=id=>document.getElementById(id);
 function getLanguage(){
   try {const s=localStorage.getItem('yk_lang');if(keys.includes(s))return s;}catch{}
   const lang=document.documentElement.lang?.slice(0,2);
   return keys.includes(lang)?lang:'my';
 }
 function render(){
   const language=getLanguage(),t=translations[language];
   for(const el of root.querySelectorAll('[data-drawer-label]')) {
     const k=el.getAttribute('data-drawer-label');if(Object.hasOwn(t,k))el.textContent=t[k];
   }
   for(const el of root.querySelectorAll('[data-yk-menu-i18n]')) {
     const k=el.getAttribute('data-yk-menu-i18n');if(Object.hasOwn(t,k))el.textContent=t[k];
   }
   for(const b of root.querySelectorAll('[data-more-lang]')) b.setAttribute('aria-pressed',String(b.dataset.moreLang===language));
   if($('moreLangValue')) $('moreLangValue').textContent={my:'မြန်မာ',en:'English',ja:'日本語'}[language];
   const title=$('siteMenu')?.querySelector('.menu-title');if(title)title.textContent='MENUS';
   const search=$('moreSearchInput');if(search){search.placeholder=t.search;search.setAttribute('aria-label',t.searchAria);}
   const close=$('menuClose');if(close)close.setAttribute('aria-label',t.close);
   const gear=$('moreSettingsButton');if(gear)gear.setAttribute('aria-label',t.gear);
   const searchToggle=$('moreSearchToggle');if(searchToggle)searchToggle.setAttribute('aria-label',t.searchAria);
   const notify=$('moreNotifications');if(notify)notify.setAttribute('aria-label',t.notifyAria);
   // Keep the approved five-tab navigation Home · Study · Exam · Video · Account stable.
 }
 // Existing drawer handles saving yk_lang; this layer translates the actual UI.
 for(const b of root.querySelectorAll('[data-more-lang]')) b.addEventListener('click',()=>queueMicrotask(render));
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-yk-ui-theme']});
 window.addEventListener('pageshow',render);window.addEventListener('storage',render);
 // This is an appearance-only toggle, NOT a permission to send notifications.
 const notify=$('moreNotifications');
 if(notify){
   let on=false;try{on=localStorage.getItem('yk_menu_notifications_ui')==='on'}catch{}
   notify.setAttribute('aria-checked',String(on));
   notify.addEventListener('click',()=>{
     on=notify.getAttribute('aria-checked')!=='true';notify.setAttribute('aria-checked',String(on));
     try{localStorage.setItem('yk_menu_notifications_ui',on?'on':'off')}catch{}
   });
 }
 render();
})();
