/* JLPT Countdown: official 2026 dates + future July/December rolling candidates.
 * Future dates are tentative until confirmed by JLPT/JEES. No remote dependency.
 * JST calendar-day calculation; final 30-day review advances with the exam.
 */
(()=>{'use strict';
 const DAY=86400000,REVIEW_DAYS=30;
 const examUrl='https://www.jlpt.jp/e/faq/';
 // Officially confirmed dates (2026, JLPT/JEES). Add future confirmations here.
 const official={
  '2026-07':Date.UTC(2026,6,5),
  '2026-12':Date.UTC(2026,11,6)
 };
 const pad=n=>String(n).padStart(2,'0');
 const firstSunday=(year,month)=>{
  const first=Date.UTC(year,month-1,1);
  return Date.UTC(year,month-1,1+(7-new Date(first).getUTCDay())%7);
 };
 const getJstDay=(now=new Date())=>{
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const v=Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
  return Date.UTC(v.year,v.month-1,v.day);
 };
 const pickNext=date=>{
  const year=new Date(date).getUTCFullYear();
  for(let y=year;y<=year+2;y++)for(const m of [7,12]){
   const key=`${y}-${pad(m)}`;
   const confirmed=Object.prototype.hasOwnProperty.call(official,key);
   const timestamp=confirmed?official[key]:firstSunday(y,m);
   if(timestamp>=date)return {timestamp,confirmed};
  }
  return null;
 };
 const formatDate=timestamp=>new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric',weekday:'short'}).format(new Date(timestamp)).replace(',', ' ·');
 const shortDate=timestamp=>{const date=new Date(timestamp);return `${date.getUTCMonth()+1}/${date.getUTCDate()}`};
 let lastDay=null;
 function fill(node,date){
  const exam=pickNext(date);
  if(!exam)return;
  const days=Math.max(0,Math.round((exam.timestamp-date)/DAY));
  const start=exam.timestamp-REVIEW_DAYS*DAY;
  const elapsed=Math.max(0,Math.min(REVIEW_DAYS,Math.round((date-start)/DAY)));
  const progress=Math.round(elapsed*100/REVIEW_DAYS);
  const today=days===0;
  const status=exam.confirmed?'Official date':'Tentative · 公式発表待ち';
  const remaining=today?'ဒီနေ့ JLPT စာမေးပွဲနေ့ပါ။ ကောင်းကောင်းဖြေနိုင်ပါစေ။':`JLPT စာမေးပွဲမတိုင်မီ ${days} ရက်ကျန်ပါတယ်။ နေ့တိုင်း နည်းနည်းစီ လေ့လာကြမယ်။`;
  const reviewLabel=`Last 30-day review · ${shortDate(start)}–${shortDate(exam.timestamp)}`;
  node.setAttribute('aria-label',`Next JLPT exam countdown: ${formatDate(exam.timestamp)}${exam.confirmed?'':' (tentative)'}`);
  node.innerHTML=`<div class="yk822-countdown-head"><span>📅 JLPT EXAM COUNTDOWN <small>試験まであと</small></span><a href="${examUrl}" target="_blank" rel="noopener noreferrer" title="Check the official JLPT schedule">${formatDate(exam.timestamp)} ↗</a></div><div class="yk822-countdown-main"><strong class="yk822-countdown-days" aria-live="polite">${today?'本日':days}<small>${today?'Exam Day':'Days Left'}</small></strong><p>${remaining}</p><img src="/assets/characters/student-v7821.webp" alt="" width="339" height="319" loading="lazy" decoding="async"></div><div class="yk822-countdown-track" role="progressbar" aria-label="Last 30-day preparation period completed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><div style="width:${progress}%"></div></div><div class="yk822-countdown-foot"><span>${reviewLabel}</span><span>${progress}%</span></div><div class="yk822-countdown-date-status" ${exam.confirmed?'':'role="note"'}>${status}${exam.confirmed?'':' · <a href="'+examUrl+'" target="_blank" rel="noopener noreferrer">Official JLPT ↗</a>'}</div>`;
 }
 function render(){
  const day=getJstDay();
  if(lastDay===day)return;
  lastDay=day;
  document.querySelectorAll('.yk822-countdown').forEach(node=>fill(node,day));
 }
 render();
 // Update if a page stays open across midnight JST, or the user resumes a tab.
 window.setInterval(render,60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
 window.addEventListener('pageshow',render);
})();
