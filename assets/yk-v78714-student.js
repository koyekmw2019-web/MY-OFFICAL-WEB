/** v7.87.14 — Student-only display of device-local grammar practice analytics.
 * No new API request, no account records or verified mock-exam data changed.
 */
import {LEVELS,EXPECTED_COUNTS,STORAGE_KEY,cleanState,summarize} from './yk-v78714-engine.js';
if(document.body?.dataset.dashboard==='student'){
 const root=document.getElementById('dashboardBody');
 if(root){
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const translations={
   my:{title:'Grammar Mastery · လေ့လာမှုအခြေအနေ',note:'ဒီ Browser ထဲက Grammar Practice မှတ်တမ်းပါ။ Official JLPT Score မဟုတ်ပါ။',practiced:'လေ့ကျင့်ခဲ့သော Grammar',weak:'ပြန်လေ့လာရန်',accuracy:'မှန်ကန်မှု',start:'Grammar Practice ဖွင့်ရန်',empty:'ဒီ Browser မှာ Practice မှတ်တမ်း မရှိသေးပါ။'},
   en:{title:'Grammar Mastery · Practice Progress',note:'Browser-local grammar practice only. Not an official JLPT score or cloud record.',practiced:'Grammar Practiced',weak:'Needs Review',accuracy:'Accuracy',start:'Open Grammar Practice',empty:'No grammar practice is saved on this browser yet.'},
   ja:{title:'文法練習の進捗',note:'このブラウザ内の自主練習記録です。JLPT公式スコアやクラウド記録ではありません。',practiced:'練習した文法',weak:'復習が必要',accuracy:'正答率',start:'文法練習を開く',empty:'このブラウザの練習記録はまだありません。'}
  };
  function lang(){const v=window.YKDashboardLanguageV759?.getLanguage?.()||localStorage.getItem('yk_lang')||'my';return translations[v]?v:'my'}
  function read(){try{return cleanState(JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'))}catch{return cleanState({})}}
  function html(){const l=translations[lang()],state=read(),sum=summarize(state);
   const rows=LEVELS.map(lv=>{const m=summarize(state,lv),pct=Math.round(100*m.practiced/EXPECTED_COUNTS[lv]);return `<div class="yk814s-level"><b>${lv}</b><span class="yk814s-track"><i style="width:${pct}%"></i></span><small>${m.practiced}/${EXPECTED_COUNTS[lv]}</small></div>`}).join('');
   return `<div class="yk814s-head"><h3>${safe(l.title)}</h3><p>${safe(l.note)}</p></div>`+
   `<div class="yk814s-stats"><div><strong>${sum.practiced}/509</strong><span>${safe(l.practiced)}</span></div><div><strong>${sum.weak}</strong><span>${safe(l.weak)}</span></div><div><strong>${sum.accuracy===null?'—':sum.accuracy+'%'}</strong><span>${safe(l.accuracy)}</span></div></div>`+
   `<div class="yk814s-levels">${rows}</div><a class="yk814s-link" href="/study/jlpt-grammar-practice.html">${safe(l.start)} ↗</a>`+
   (sum.attempts===0?`<p class="yk814s-empty">${safe(l.empty)}</p>`:'');
  }
  let mounted=false;
  function render(){const node=document.getElementById('yk814Student');if(node)node.innerHTML=html();}
  function mount(){
   const anchor=document.getElementById('yk84StudentBody');
   if(!anchor||!anchor.isConnected)return false;
   let node=document.getElementById('yk814Student');
   if(!node){node=document.createElement('section');node.className='yk814s-panel';node.id='yk814Student';node.setAttribute('aria-label','Browser-local Grammar Mastery progress');anchor.insertAdjacentElement('afterend',node);}
   mounted=true;render();return true;
  }
  if(!mount()){
   const mo=new MutationObserver(()=>{if(mount())mo.disconnect()});
   mo.observe(root,{childList:true,subtree:true});
  }
  window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY||e.key==='yk_lang')render()});
  document.addEventListener('yk-ui-language-v78712',render);
  document.querySelectorAll('[data-yk-lang]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(render)));
  window.addEventListener('focus',()=>{if(mounted)render();});
 }
}
