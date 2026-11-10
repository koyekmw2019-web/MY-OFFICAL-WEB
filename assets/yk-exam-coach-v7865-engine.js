/* v7.86.5: pure planning logic. Topics must originate from verified server results. */
(function(global){'use strict';
const labels={vocabulary:'文字・語彙 · စကားလုံး',grammar:'文法 · သဒ္ဒါ',reading:'読解 · စာဖတ်',listening:'聴解 · နားထောင်',theory:'学科 · သီအိုရီ',practical:'実技 · လက်တွေ့',overall:'Overall Practice · စာမေးပွဲတစ်ခုလုံး'};
function percent(n,d){return Number.isInteger(n)&&Number.isInteger(d)&&d>0&&n>=0&&n<=d?Math.round(100*n/d):null;}
function rank(raw){
 if(!Array.isArray(raw))return [];
 return raw.filter(x=>x&&Object.hasOwn(labels,String(x.id))&&Number.isInteger(x.correct)&&Number.isInteger(x.total)&&x.total>0&&x.correct>=0&&x.correct<=x.total)
  .map(x=>({id:x.id,label:labels[x.id],correct:x.correct,total:x.total,rate:percent(x.correct,x.total),missed:x.total-x.correct}))
  .sort((a,b)=>a.rate-b.rate||b.missed-a.missed);
}
function todayJst(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const obj=Object.fromEntries(parts.filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,x.value]));
 return `${obj.year}-${obj.month}-${obj.day}`;
}
function daysUntil(target,now=new Date()){
 if(typeof target!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(target))return null;
 const d=Date.parse(`${target}T00:00:00Z`);if(!Number.isFinite(d)||new Date(d).toISOString().slice(0,10)!==target)return null;
 return Math.round((d-Date.parse(todayJst(now)+'T00:00:00Z'))/86400000);
}
function studyPlan(topics,target,now=new Date()){
 const rows=rank(topics),remaining=daysUntil(target,now),focus=rows.filter(x=>x.missed>0);
 const first=focus[0]||rows[0],second=focus[1]||rows[1]||first;
 if(!first)return {topics:[],daysRemaining:remaining,steps:[],evidence:false};
 const schedule=[
  {kind:'focus',title:`Review ${first.label}`,detail:`${first.missed} missed in ${first.total} practice questions · ဖြေမှားထားတာကို ပြန်လေ့ကျင့်ပါ`},
  {kind:'focus',title:`Practice ${second?.label||first.label}`,detail:'သက်ဆိုင်ရာ Lesson ကိုပြန်ဖတ်ပြီး မေးခွန်းများ ဖြေကြည့်ပါ'},
  {kind:'review',title:'Revisit mistakes',detail:'Wrong Answer Review ထဲက မှားခဲ့တဲ့မေးခွန်းတွေကို ပြန်လေ့လာပါ'},
  {kind:'focus',title:`Strengthen ${first.label}`,detail:'အနည်းဆုံး 20 မိနစ် လေ့ကျင့်ပြီး မသိသေးတာတွေ မှတ်သားပါ'},
  {kind:'review',title:`Mixed practice${second?' · '+second.label:''}`,detail:'အားနည်းရာ နှစ်မျိုးကို ရောပြီး စမ်းဖြေပါ'},
  {kind:'mock',title:'Take a new mock exam',detail:'သက်ဆိုင်ရာ Exam Center စည်းမျဉ်းအတိုင်း ပြန်ဖြေပါ'},
  {kind:'review',title:'Light final review',detail:'အရေးကြီးတဲ့ အမှားတွေ၊ မှတ်စုတွေကို အတိုချုံး ပြန်ကြည့်ပါ'}
 ];
 if(remaining!==null&&remaining<0)return {topics:rows,daysRemaining:remaining,steps:[],evidence:true};
 const n=remaining===null?7:remaining===0?1:Math.min(7,Math.max(1,remaining));
 if(remaining===0)return {topics:rows,daysRemaining:remaining,steps:[schedule[6]],evidence:true};
 return {topics:rows,daysRemaining:remaining,steps:schedule.slice(0,n),evidence:true};
}
const api=Object.freeze({rank,percent,todayJst,daysUntil,studyPlan,labels});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
global.YKExamCoachEngineV7865=api;
})(typeof window==='undefined'?globalThis:window);
