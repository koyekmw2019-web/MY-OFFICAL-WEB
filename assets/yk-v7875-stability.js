/** STUDYING WITH YE KUN — v7.87.5 low-cost offline / failed asset messaging.
 * Read-only UI; does not start/restart exams, submit attempts or call network APIs.
 */
(()=>{'use strict';
  const body=document.body;
  if(!body?.classList.contains('yk874-education-menu'))return;
  const critical=new Set([
    'identity.bundle.js','yk-exam-autosave-v761.js','jlpt-native-mock-bank-v752.js',
    'jlpt-scoring-v755.js','jlpt-native-v750.js','yk-v787-routing.js'
  ]);
  const strings={
    my:{offline:'အင်တာနက် ချိတ်ဆက်မှု မရှိနိုင်ပါ။ Exam Timer ဆက်သွားနိုင်ပါတယ်။ လက်ရှိစာမျက်နှာကို မပိတ်ပါနဲ့။',
      missing:'အရေးကြီးတဲ့ ဖိုင်တစ်ခု Load မအောင်မြင်ပါ။ Exam ဖြေနေစဉ် Reload မလုပ်ပါနဲ့။',retry:'Reload / ပြန်ဖွင့်ရန်'},
    en:{offline:'You may be offline. The exam timer may continue. Keep this page open.',
      missing:'An essential resource failed to load. Do not reload during an exam.',retry:'Reload page'},
    ja:{offline:'通信が切れている可能性があります。試験時間は進みます。ページを閉じないでください。',
      missing:'必要なファイルを読み込めませんでした。試験中は再読み込みしないでください。',retry:'ページを再読み込み'}
  };
  let missing=false;
  const banner=document.createElement('div');
  banner.id='yk875ConnectionNotice';banner.className='yk875-notice';banner.hidden=true;
  banner.setAttribute('role','status');banner.setAttribute('aria-live','polite');
  const message=document.createElement('span');message.className='yk875-notice-message';
  const reload=document.createElement('button');reload.type='button';reload.className='yk875-notice-retry';
  reload.addEventListener('click',()=>{if(isExamRunning())return;location.reload()});
  banner.append(message,reload);
  const header=document.querySelector('.top');
  if(header)header.insertAdjacentElement('afterend',banner);else body.prepend(banner);
  const isExamRunning=()=>{
    const panel=document.getElementById('examPanel');
    return !!(panel?.classList.contains('active')&&panel.firstElementChild);
  };
  const offline=()=>typeof navigator!=='undefined'&&navigator.onLine===false;
  function draw(){
    const shown=missing||offline();banner.hidden=!shown;
    if(!shown)return;
    const key=['my','ja','en'].includes(document.documentElement.lang)?document.documentElement.lang:'my';
    const labels=strings[key];
    message.textContent=offline()?labels.offline:labels.missing;
    const running=isExamRunning();
    reload.textContent=labels.retry;
    reload.hidden=!missing||offline()||running;
  }
  addEventListener('offline',draw);
  addEventListener('online',draw);
  addEventListener('pageshow',draw);
  addEventListener('error',event=>{
    const node=event.target;
    const asset=(node?.tagName==='SCRIPT'?node.src:node?.tagName==='LINK'?node.href:null);
    if(!asset)return;
    try{
      const url=new URL(asset,location.href);
      if(url.origin===location.origin&&critical.has(url.pathname.split('/').pop())){
        missing=true;draw();
      }
    }catch{/* Ignore untrusted/broken resource URLs; do not log tokens or user data. */}
  },true);
  if(typeof MutationObserver==='function'){
    const panel=document.getElementById('examPanel');
    if(panel)new MutationObserver(draw).observe(panel,{attributes:true,attributeFilter:['class'],childList:true});
    new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
  draw();
})();
