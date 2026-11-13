/** v7.87.15 — Student-only, browser-local summary. No APIs or admin content touched. */
import {STORAGE_KEY,cleanState} from './yk-v78714-engine.js';
import {INSIGHTS_KEY,cleanEvents,allLevelOverview} from './yk-v78715-insights-engine.js';
if(document.body?.dataset.dashboard==='student'){
 const root=document.getElementById('dashboardBody');
 if(root){
  const T={my:{title:'Smart Grammar Weakness Analysis',none:'ဒီ Browser မှာ Grammar အားနည်းချက်အတွက် မှတ်တမ်း မလုံလောက်သေးပါ။',suggest:'ပြန်လေ့လာရန် Grammar',repeated:'ထပ်ခါတလဲလဲ မှားခဲ့',open:'အကြံပြုချက်ကြည့်ရန်',note:'Browser မှတ်တမ်းအပေါ် အခြေခံသော အကြံပြုချက်သာဖြစ်သည်။ Official JLPT Score မဟုတ်ပါ။'},en:{title:'Smart Grammar Weakness Analysis',none:'Not enough local practice history to suggest areas for review.',suggest:'Suggested review patterns',repeated:'Repeated mistakes',open:'Open recommendations',note:'Browser-local study suggestions, not official JLPT scores.'},ja:{title:'苦手文法の分析',none:'復習を提案できる練習記録がまだありません。',suggest:'復習候補',repeated:'繰り返した間違い',open:'復習の提案を見る',note:'ブラウザ内の自主学習記録です。JLPT公式スコアではありません。'}};
  function read(k,fn){try{return fn(JSON.parse(localStorage.getItem(k)||'null'))}catch{return fn(null)}}
  function render(){const node=document.getElementById('yk815Student');if(!node)return;let lang='my';try{lang=window.YKDashboardLanguageV759?.getLanguage?.()||localStorage.getItem('yk_lang')||'my'}catch{}const t=T[lang]||T.my;
   const state=read(STORAGE_KEY,cleanState),ev=read(INSIGHTS_KEY,cleanEvents),rows=allLevelOverview(state,ev),review=rows.reduce((n,x)=>n+x.reviewCount,0),repeated=rows.reduce((n,x)=>n+x.counts.repeated,0);
   const main=[...rows].sort((a,b)=>b.reviewCount-a.reviewCount||a.level.localeCompare(b.level))[0];const lv=main?.reviewCount?main.level:'N5';
   node.innerHTML=`<h3>${t.title}</h3><p>${review?t.suggest+': '+review:t.none}</p><p>${t.repeated}: <strong>${repeated}</strong></p><a href="/study/jlpt-grammar-insights.html?level=${lv}">${t.open} ↗</a><small>${t.note}</small>`;
  }
  function mount(){const anchor=document.getElementById('yk814Student');if(!anchor||!anchor.isConnected)return false;let node=document.getElementById('yk815Student');if(!node){node=document.createElement('section');node.id='yk815Student';node.className='yk815s-panel';node.setAttribute('aria-label','Browser-local grammar review insights');anchor.insertAdjacentElement('afterend',node);}render();return true;}
  const mo=new MutationObserver(()=>{if(!document.getElementById('yk815Student'))mount()});mo.observe(root,{childList:true,subtree:true});mount();
  window.addEventListener('storage',e=>{if([STORAGE_KEY,INSIGHTS_KEY,'yk_lang'].includes(e.key))render()});document.addEventListener('yk-ui-language-v78712',render);document.querySelectorAll('[data-yk-lang]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(render)));window.addEventListener('focus',render);
 }
}
