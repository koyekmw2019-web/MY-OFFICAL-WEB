/** v7.87.16 student-only, local-study goal summary. Never calls remote APIs. */
import {GOALS_KEY,STORAGE_KEY,cleanGoals,studyDays,weekProgress,streak,dateKey} from './yk-v78716-calendar-engine.js';
import {cleanState} from './yk-v78714-engine.js';
if(document.body?.dataset.dashboard==='student'){
 const root=document.getElementById('dashboardBody');
 if(root){
  const T={my:{title:'လေ့လာရေး Calendar & Goals',today:'ဒီနေ့ Grammar မေးခွန်း',weekly:'အပတ်စဉ် လေ့လာခဲ့တဲ့နေ့',streak:'ဆက်တိုက် လေ့လာခဲ့သောနေ့',open:'Calendar / Goals ဖွင့်ရန်',note:'ဒီ Browser မှတ်တမ်းကိုပဲ သုံးပါတယ်။ အပတ်စဉ်နေ့အရေအတွက်မှာ ကိုယ်တိုင်ပြီးစီးကြောင်းမှတ်ထားတဲ့နေ့တွေ ပါနိုင်ပါတယ်။'},en:{title:'Learning Calendar & Study Goals',today:'Today’s grammar questions',weekly:'Study days this week',streak:'Study-day streak',open:'Open Calendar & Goals',note:'Browser-local study record. Weekly study days may include self-reported completions.'},ja:{title:'学習カレンダー・目標',today:'本日の文法問題',weekly:'今週の学習日数',streak:'連続学習日数',open:'カレンダーと目標を開く',note:'このブラウザ内の記録です。自己申告の学習日も含まれる場合があります。'}};
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
  function render(){const node=document.getElementById('yk816Student');if(!node)return;
   let lang='my';try{lang=window.YKDashboardLanguageV759?.getLanguage?.()||localStorage.getItem('yk_lang')||'my'}catch{}const t=T[lang]||T.my;
   const goals=cleanGoals(read(GOALS_KEY)),practice=cleanState(read(STORAGE_KEY)),today=dateKey(new Date()),days=studyDays(goals,practice);
   const q=days.get(today)?.questions||0,w=weekProgress(goals,practice,today),run=streak(goals,practice,today);
   node.innerHTML=`<h3>${t.title}</h3><div class="yk816s-stats"><div><strong>${q}/${goals.dailyQuestions}</strong><small>${t.today}</small></div><div><strong>${w.done}/${w.target}</strong><small>${t.weekly}</small></div><div><strong>${run}</strong><small>${t.streak}</small></div></div><a class="yk816s-open" href="/study/jlpt-study-calendar.html">${t.open} ↗</a><p>${t.note}</p>`;
  }
  function mount(){const anchor=document.getElementById('yk815Student')||document.getElementById('yk814Student');if(!anchor||!anchor.isConnected)return false;
   let node=document.getElementById('yk816Student');if(!node){node=document.createElement('section');node.id='yk816Student';node.className='yk816s-panel';node.setAttribute('aria-label','Browser-local Study Calendar and Goals');anchor.insertAdjacentElement('afterend',node);}render();return true;
  }
  const mo=new MutationObserver(()=>{if(!document.getElementById('yk816Student'))mount()});mo.observe(root,{childList:true,subtree:true});mount();
  window.addEventListener('storage',e=>{if([GOALS_KEY,STORAGE_KEY,'yk_lang'].includes(e.key))render()});
  window.addEventListener('focus',render);
  document.addEventListener('yk-ui-language-v78712',render);
  document.querySelectorAll('[data-yk-lang]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(render)));
 }
}
