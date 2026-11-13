/* STUDYING WITH YE KUN — v7.87.6 read-only Student Study Journey.
 * Uses the dashboard's already-requested scoped activity Promise, and the
 * existing Personal Exam Coach / Saved Wrong Answers UI. No additional APIs.
 */
(()=>{'use strict';
if(document.body?.dataset.dashboard!=='student')return;
const root=document.getElementById('dashboardBody'),engine=window.YKSmartJourneyV7876;
if(!root||!engine||!window.YKAllExamsV7863)return;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr={
 my:{title:'My Study Journey',sub:'စာမေးပွဲကို ရွေးပြီး တိုးတက်မှုနဲ့ နောက်တစ်ဆင့် လေ့လာရန်အချက်တွေ ကြည့်နိုင်ပါတယ်။',choose:'အပေါ်က Exam Card တစ်ခုကို ရွေးပါ။',load:'ရှိပြီးသား Exam History ကို ဖတ်နေပါတယ်…',missing:'Account Exam History မရသေးပါ။ Dashboard Refresh လုပ်ပြီး ပြန်ရွေးပါ။',failed:'Exam History မရနိုင်သေးပါ။ Login နဲ့ Internet ကို စစ်ပါ။',recent:'နောက်ဆုံး Verified Exam Results',noScores:'အချိန်မှန်ကန်တဲ့ Verified Result မရှိသေးပါ။',stats:'အတည်ပြုထားသော Result',avg:'ဒီ Exam ရဲ့ ပျမ်းမျှ',caution:'Verified Result ၂ ကြိမ်အထက်တွင် ပျမ်းမျှ 70% အောက်ဖြစ်နေပါတယ်။ ဒီ Exam ကို ပြန်လေ့ကျင့်သင့်ပါတယ်။',neutral:'အားနည်းချက်ကို အထောက်အထားမရှိဘဲ မခန့်မှန်းပါ။ အသေးစိတ်အတွက် Personal Exam Coach ကိုကြည့်ပါ။',first:'Verified Result မရှိသေးပါ။ ပထမဆုံး Mock Exam ကို စမ်းဖြေနိုင်ပါတယ်။',steps:'ယနေ့ 20 မိနစ် Study Routine',s1:'5 မိနစ် · မှားထားတဲ့မေးခွန်းတွေ ပြန်ကြည့်ရန်',s2:'10 မိနစ် · သက်ဆိုင်ရာ Lesson ပြန်လေ့လာရန်',s3:'5 မိနစ် · Coach အကြံပြုချက် သို့မဟုတ် Mock Practice',mistakes:'Wrong Answer Review',lesson:'Lesson ဖွင့်မည်',coach:'Personal Exam Coach',practice:'Mock Exam ဖွင့်မည်',session:'အမှန်ခြစ်ထားတာတွေက ဒီ Page ဖွင့်ထားချိန်အတွက်သာပါ။ Server မှာ မသိမ်းပါ။',evidence:'အကောင့်ရဲ့ နောက်ဆုံး 50 Exam Records ထဲက Verified Result များသာ ပြထားပါတယ်။ မတူတဲ့ Exam အမှတ်တွေကို မပေါင်းတွက်ပါ။',ready:'အဆင့်ပြီးစီးမှု (ယခု Session)'},
 en:{title:'My Study Journey',sub:'Select an exam above to see verified progress and useful next steps.',choose:'Choose an exam card above.',load:'Reading existing account-scoped exam history…',missing:'Exam history is not ready. Refresh dashboard records and select again.',failed:'Could not read exam history. Check sign-in and connection.',recent:'Recent Verified Exam Results',noScores:'No dated, verified exam scores are available.',stats:'Verified Results',avg:'Average for this exam',caution:'At least two verified results average below 70%. Review this exam.',neutral:'No evidence-based weakness identified. Open your Personal Exam Coach for topic details.',first:'No verified results yet. Start with an exam when ready.',steps:'Today’s 20-minute study routine',s1:'5 min · Review saved wrong answers',s2:'10 min · Review a related lesson',s3:'5 min · Coach guidance or mock practice',mistakes:'Wrong Answer Review',lesson:'Open lesson',coach:'Personal Exam Coach',practice:'Open mock exam',session:'Checkboxes are only for this page session; no study completion is saved to the server.',evidence:'Only verified results from the most recent 50 account attempts. Different exam scales are not averaged together.',ready:'Steps completed (this session)'},
 ja:{title:'学習ステップ',sub:'上の試験カードを選ぶと、確認済み成績と次の学習案内を表示します。',choose:'上の試験カードを選んでください。',load:'既存の受験履歴を読み込み中…',missing:'受験履歴の準備ができていません。更新して再選択してください。',failed:'履歴を取得できません。ログインと接続をご確認ください。',recent:'最近の確認済み模試結果',noScores:'日時が確認できる検証済み成績はまだありません。',stats:'検証済み結果',avg:'この試験の平均',caution:'2回以上の検証済み結果が平均70%未満です。この試験を復習しましょう。',neutral:'根拠のない弱点判定はしません。詳細はPersonal Exam Coachをご覧ください。',first:'検証済み結果はまだありません。まず模試に挑戦しましょう。',steps:'今日の20分学習プラン',s1:'5分 · 間違えた問題を復習',s2:'10分 · 関連する学習ページへ',s3:'5分 · コーチの助言または模試',mistakes:'間違いの復習',lesson:'学習ページを開く',coach:'Personal Exam Coach',practice:'模擬試験へ',session:'チェックはページを開いている間だけ有効です。サーバーに保存しません。',evidence:'アカウントの最新50件の受験履歴にある検証済み結果のみ。異なる試験の点数は混合しません。',ready:'完了した項目（このページ）'}
};
let selected='',rows=null,historyState='idle',ready=false,revision=0;
let done=new Set();
const lang=()=>{const n=window.YKDashboardLanguageV759?.getLanguage?.()||document.documentElement.lang;return tr[n]?n:'my'};
const T=()=>tr[lang()];
function barChart(points){if(!points.length)return `<p class="yk876-muted">${esc(T().noScores)}</p>`;
 const label=points.map(p=>`${p.date}: ${p.score} points (${p.percent}%)`).join(', ');
 return `<div class="yk876-bars" role="img" aria-label="${esc(label)}">${points.map(p=>`<div class="yk876-bar-col" aria-hidden="true"><b>${p.percent}%</b><span class="yk876-bar-track"><i style="height:${Math.max(4,Math.min(100,p.percent))}%"></i></span><small>${esc(p.date.slice(5))}</small></div>`).join('')}</div>`;
}
function content(){const l=T();if(!selected)return `<p class="yk876-muted">${esc(l.choose)}</p>`;
 const c=window.YKAllExamsV7863.catalog.find(c=>c.type===selected);
 const header=`<p class="yk876-selected"><strong>${esc(c?.short||selected)}</strong> · ${esc(l.sub)}</p>`;
 if(historyState==='loading')return header+`<p class="yk876-muted" role="status">${esc(l.load)}</p>`;
 if(historyState==='missing')return header+`<p class="yk876-muted" role="status">${esc(l.missing)}</p>`;
 if(historyState==='failed')return header+`<p class="yk876-muted" role="alert">${esc(l.failed)}</p>`;
 const m=engine.model(rows,selected);if(!m)return `<p class="yk876-muted">${esc(l.missing)}</p>`;
 const n=m.summary.verified,avg=m.summary.averagePercent===null?'—':m.summary.averagePercent+'%';
 const message=m.guidance==='review'?l.caution:m.guidance==='first'?l.first:l.neutral;
 const items=[l.s1,l.s2,l.s3];
 return header+`<div class="yk876-metrics"><div><span>${esc(l.stats)}</span><strong>${n}</strong></div><div><span>${esc(l.avg)}</span><strong>${esc(avg)}</strong></div></div>
  <section class="yk876-trend" aria-label="Verified exam trend"><h4>${esc(l.recent)}</h4>${barChart(m.points)}<p class="yk876-muted">${esc(l.evidence)}</p></section>
  <p class="yk876-guidance" role="status">${esc(message)}</p>
  <div class="yk876-plan"><h4>${esc(l.steps)}</h4>${items.map((x,i)=>`<label class="yk876-step"><input type="checkbox" data-yk876-check="${i}" ${done.has(i)?'checked':''}><span>${esc(x)}</span></label>`).join('')}<small id="yk876Done">${esc(l.ready)}: ${done.size}/3</small><p class="yk876-muted">${esc(l.session)}</p></div>
  <div class="yk876-actions"><button type="button" data-yk876-action="mistakes">${esc(l.mistakes)}</button><a href="${esc(m.lessonUrl)}">${esc(l.lesson)}</a><button type="button" data-yk876-action="coach">${esc(l.coach)}</button><a href="${esc(m.examUrl)}">${esc(l.practice)}</a></div>`;
}
function render(){const host=$('yk876JourneyBody');if(host)host.innerHTML=content();}
async function existingHistory(){const n=++revision;
 const promise=window.YKDashboardActivityPromiseV7863;
 if(!promise){historyState='missing';render();return;}
 historyState='loading';render();
 try{const data=await promise;if(n!==revision)return;
  if(!data||!Array.isArray(data.attempts))throw Error('Invalid scoped attempt data');
  rows=data.attempts;historyState='ready';
 }catch(_){if(n!==revision)return;rows=null;historyState='failed';}
 if(n===revision)render();
}
function mount(){
 if(ready)return true;
 const grid=$('yk863ExamGrid'),host=$('yk84StudentBody');
 if(!grid||!host)return false;
 grid.insertAdjacentHTML('afterend',`<section id="yk876Journey" class="yk876-journey" aria-label="My Study Journey"><div class="yk876-head"><span>STUDYING WITH YE KUN</span><h3 id="yk876Title">${esc(T().title)}</h3></div><div id="yk876JourneyBody" aria-live="polite"></div></section>`);
 root.addEventListener('click',e=>{
  const card=e.target?.closest?.('[data-yk863-type]');
  if(card&&engine.types.includes(card.dataset.yk863Type)){
    selected=card.dataset.yk863Type;done=new Set();void existingHistory();return;
  }
  if(e.target?.closest?.('[data-yk863-category]')){selected='';done=new Set();revision++;render();return;}
  if(e.target?.closest?.('#yk84StudentRefresh')&&selected){void existingHistory();return;}
  const action=e.target?.closest?.('[data-yk876-action]')?.dataset.yk876Action;
  if(action==='mistakes'){
    const existing=$('yk863Mistakes');
    if(existing){existing.click();existing.closest('.yk84-surface')?.scrollIntoView({behavior:'smooth',block:'start'});}
    else $('yk84StudentBody')?.scrollIntoView({behavior:'smooth',block:'start'});
  }else if(action==='coach'){$('yk865Coach')?.scrollIntoView({behavior:'smooth',block:'start'});}
 });
 root.addEventListener('change',e=>{
  const box=e.target?.closest?.('[data-yk876-check]');if(!box)return;
  const key=Number(box.dataset.yk876Check);if(!Number.isInteger(key)||key<0||key>2)return;
  if(box.checked)done.add(key);else done.delete(key);
  const target=$('yk876Done');if(target)target.textContent=`${T().ready}: ${done.size}/3`;
 });
 document.querySelectorAll('[data-yk-lang]').forEach(button=>button.addEventListener('click',()=>{
   requestAnimationFrame(()=>{const title=$('yk876Title');if(title)title.textContent=T().title;render();});
 }));
 ready=true;render();return true;
}
if(!mount()){
 const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});
 observer.observe(root,{childList:true,subtree:true});
}
})();
