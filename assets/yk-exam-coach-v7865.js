/* v7.86.5 Dashboard-only. Fetch coach data for a selected exam, never on initial page load. */
(()=>{'use strict';
if(document.body?.dataset.dashboard!=='student')return;
const root=document.getElementById('dashboardBody'),engine=window.YKExamCoachEngineV7865;
if(!root||!engine)return;
const valid=new Set((window.YKAllExamsV7863?.catalog||[]).map(x=>x.type));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=t=>window.YKAllExamsV7863?.catalog.find(x=>x.type===t)?.short||t;
const href=t=>/^jlpt_n[1-5]$/.test(t)?`/study/jlpt-learning.html?level=${t.slice(-2).toUpperCase()}`:'/#online-mock-exam';
const $=id=>document.getElementById(id);
let chosen='',response=null,pending=0,saving=false,ready=false;
const panel=`<section id="yk865Coach" class="yk865-panel" aria-label="Personal Exam Coach" hidden>
 <span class="yk865-eyebrow">STUDYING WITH YE KUN · PERSONAL STUDY GUIDE</span><h3>🎯 My Exam Coach</h3>
 <p class="yk865-sub">စာမေးပွဲတစ်ကြိမ် ဖြေပြီးနောက် ဦးစားပေးလေ့လာရန် · Dashboard ထဲမှာပဲ ကြည့်နိုင်ပါတယ်</p>
 <div id="yk865Content" aria-live="polite"></div></section>`;
const summary=text=>`<div class="yk865-summary">${esc(text)}</div>`;
function mount(){
 if(ready||!root.querySelector('#yk863ExamGrid')||!root.querySelector('#yk84StudentBody'))return false;
 root.querySelector('#yk84StudentBody').insertAdjacentHTML('beforebegin',panel);
 ready=true;return true;
}
if(!mount()){
 const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});
 observer.observe(root,{childList:true,subtree:true});
}
function render(){
 const host=$('yk865Content'),wrap=$('yk865Coach');if(!host||!wrap)return;
 if(!valid.has(chosen)){wrap.hidden=true;return;}wrap.hidden=false;
 if(!response){host.innerHTML=summary('Preparing your personal analysis…');return;}
 const data=response,analysis=data.analysis,topics=engine.rank(analysis?.topics),plan=engine.studyPlan(analysis?.topics,data.targetDate);
 const caption=`${label(chosen)} · ${analysis?'Server-verified result':'Coaching evidence not available'}`;
 let html=`<p class="yk865-sub">${esc(caption)}</p>`;
 if(data.error){host.innerHTML=html+summary(data.error);return;}
 if(analysis&&topics.length){
  html+=summary(`Verified mock exam · ${analysis.score} points · ${analysis.passed?'Pass':'Needs more practice'} · Topic accuracy comes from saved answers on this attempt, not guessed ability.`);
  html+='<h4>Priority Study Topics · ဦးစားပေးလေ့လာရန်</h4><div class="yk865-topics">';
  html+=topics.map((t,i)=>`<div class="yk865-topic"><strong>${i+1}. ${esc(t.label)}</strong><small>${t.correct} / ${t.total} correct · <em>${t.rate}%</em> · ${t.missed} missed</small><div class="yk865-track"><i style="width:${t.rate}%"></i></div></div>`).join('');
  html+='</div>';
  if(topics.every(t=>t.missed===0))html+=summary('All section questions were correct in this attempt. Keep reviewing and practice a fresh set; one mock exam does not guarantee mastery.');
  if(topics.length===1&&topics[0].id==='overall')html+=summary('This exam bank does not have trusted topic tags. Only overall accuracy can be shown; no subject-level weakness is invented.');
 }else html+=summary('ဒီ Exam အတွက် Server-verified Topic Data မရှိသေးပါ။ v7.86.5 မတိုင်ခင် ဖြေထားတဲ့အဖြေတွေကို Server က မသိမ်းထားတဲ့အတွက် ပြန်တွက်မရပါ။ စာမေးပွဲအသစ်တစ်ကြိမ်ဖြေပြီးမှ Topic အလိုက် Analysis ရပါမယ်။');
 const date=String(data.targetDate||'');
 html+=`<form class="yk865-date" id="yk865DateForm"><label>My planned exam date · ကိုယ်တိုင်သတ်မှတ်မယ့်ရက်<input id="yk865TargetDate" name="targetDate" type="date" required value="${esc(date)}" min="${engine.todayJst()}" aria-label="Your planned exam date"></label><button type="submit" ${saving?'disabled':''}>${saving?'Saving…':'Save date'}</button><span id="yk865DateFeedback" class="yk865-feedback" aria-live="polite"></span></form>`;
 html+='<p class="yk865-hint">ဒီရက်စွဲကို ကိုယ်တိုင်သတ်မှတ်တာပါ။ Official Exam Date မဟုတ်ပါ။ JLPT အပါအဝင် Exam အားလုံးအတွက် သီးခြားသိမ်းထားမယ်။</p>';
 if(plan.steps.length){
  html+=`<h4>${plan.daysRemaining===null?'Suggested 7-day study routine':plan.daysRemaining===0?'Exam-day light review':plan.daysRemaining<0?'Exam date passed':'Study priorities before your exam · '+plan.daysRemaining+' days left'}</h4>`;
  html+='<div class="yk865-plan">'+plan.steps.map((r,i)=>`<div class="yk865-day"><b>${plan.daysRemaining===0?'Today':'Day '+(i+1)}</b><div><strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p></div></div>`).join('')+'</div>';
 }else html+=`<p class="yk865-hint">${plan.evidence && plan.daysRemaining!==null && plan.daysRemaining<0?'Your planned exam date has passed. Please choose a new date to continue the plan.':'Take a new verified mock exam to generate a topic-based study routine.'}</p>`;
 html+=`<a class="yk865-start" href="${href(chosen)}">${/^jlpt/.test(chosen)?'Open JLPT Learning ↗':'Open Mock Exam ↗'}</a><p class="yk865-hint">The plan is practice guidance only. Exam scores are not changed, no attempts are consumed by viewing this panel, and existing paid/student access checks still apply.</p>`;
 host.innerHTML=html;
 $('yk865DateForm')?.addEventListener('submit',saveDate);
}
async function fetchCoach(type){
 chosen=type;response=null;const current=++pending;render();
 try{
  const r=await fetch(`/.netlify/functions/exam-coach?exam_type=${encodeURIComponent(type)}`,{cache:'no-store',credentials:'same-origin'});
  const body=await r.json().catch(()=>({}));if(current!==pending)return;
  response=r.ok?body:{error:body.error||`Could not load (${r.status}). Please retry.`};
 }catch(_){if(current===pending)response={error:'Unable to connect. Please retry.'};}
 if(current===pending)render();
}
async function saveDate(event){
 event.preventDefault();if(saving||!valid.has(chosen))return;
 const type=chosen,field=$('yk865TargetDate'),value=field?.value,feedback=$('yk865DateFeedback');
 if(!value||engine.daysUntil(value)<0||engine.daysUntil(value)>1096){if(feedback)feedback.textContent='Choose a future date within 3 years.';return;}
 saving=true;const button=$('yk865DateForm')?.querySelector('button[type=submit]');if(button)button.disabled=true;
 try{
  const r=await fetch('/.netlify/functions/exam-coach',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({exam_type:type,target_date:value})});
  const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Failed to save');
  if(type===chosen){response={...(response||{}),targetDate:data.targetDate};render();const current=$('yk865DateFeedback');if(current)current.textContent='Saved ✓';}
 }catch(_){if(feedback)feedback.textContent='Could not save date. Check connection and database migration.';}
 finally{saving=false;const b=$('yk865DateForm')?.querySelector('button[type=submit]');if(b){b.disabled=false;b.textContent='Save date';}}
}
root.addEventListener('click',e=>{
 const exam=e.target?.closest?.('[data-yk863-type]');
 if(exam&&valid.has(exam.dataset.yk863Type))void fetchCoach(exam.dataset.yk863Type);
 else if(e.target?.closest?.('[data-yk863-category]')){chosen='';response=null;pending++;render();}
 else if(e.target?.closest?.('#yk84StudentRefresh')&&valid.has(chosen))void fetchCoach(chosen);
});
})();
