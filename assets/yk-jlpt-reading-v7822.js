/* v7.82.2 Reading Update: 2026 December JLPT date from official JLPT/JEES notice. No future-date guessing. */
(()=>{'use strict';
 const DAY=86400000,TARGET=Date.UTC(2026,11,6),START=Date.UTC(2026,10,6);
 const examUrl='https://www.jlpt.jp/e/faq/';
 const getJstDay=()=>{
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const v=Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
  return Date.UTC(v.year,v.month-1,v.day);
 };
 function fill(node){
  const date=getJstDay(),days=Math.round((TARGET-date)/DAY),elapsed=Math.max(0,Math.min(30,Math.round((date-START)/DAY)));
  const done=days<0,today=days===0,daysText=done?'終了':today?'本日':String(days),remaining=done?'2026 JLPT ပြီးဆုံးသွားပါပြီ။ နောက်စာမေးပွဲနေ့ကို Official Site မှာ စစ်ကြည့်ပါ။':today?'ဒီနေ့ JLPT စာမေးပွဲနေ့ပါ။ ကောင်းကောင်းဖြေနိုင်ပါစေ။':`စာမေးပွဲမတိုင်မီ ${days} ရက်ကျန်ပါတယ်။ နေ့တိုင်း နည်းနည်းစီ လေ့လာကြမယ်။`;
  const progress=done?100:Math.round(elapsed*100/30);
  const num=done?'✓':daysText;
  node.innerHTML=`<div class="yk822-countdown-head"><span>📅 JLPT EXAM COUNTDOWN <small>試験まであと</small></span><a href="${examUrl}" target="_blank" rel="noopener noreferrer" title="Official JLPT schedule">6 Dec 2026 · Sun ↗</a></div><div class="yk822-countdown-main"><strong class="yk822-countdown-days" aria-live="polite">${num}<small>${done?'Finished':today?'Exam Day':'Days Left'}</small></strong><p>${remaining}</p><img src="/assets/characters/student-v7821.webp" alt="" width="339" height="319" loading="lazy" decoding="async"></div><div class="yk822-countdown-track" role="progressbar" aria-label="Last 30-day preparation period completed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><div style="width:${progress}%"></div></div><div class="yk822-countdown-foot"><span>Last 30-day review · 11/6–12/6</span><span>${progress}%</span></div>`;
 }
 document.querySelectorAll('.yk822-countdown').forEach(fill);
})();
