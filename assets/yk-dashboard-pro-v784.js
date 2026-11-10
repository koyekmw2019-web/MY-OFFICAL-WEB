/* v7.84 — Admin + Student Pro panels, additive to existing v7.58-7.83 Dashboard.
 * No modification to auth, payment approval, YKCR receiver or exam access.
 */
(()=>{
'use strict';
const root=document.getElementById('dashboardBody'),role=document.body?.dataset.dashboard;
const engine=window.YKDashboardProEngineV784;
if(!root||!engine||!['admin','student'].includes(role))return;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=x=>Number.isFinite(Number(x))?Number(x):0;
const fmt=x=>x===null||x===undefined?'—':num(x).toLocaleString('en-US');
const pct=x=>x===null||x===undefined?'—':engine.percent(x);
const statusLine=(text)=>`<p class="yk84-caption">${esc(text)}</p>`;
async function getJson(path){const r=await fetch(path,{credentials:'same-origin',cache:'no-store'});let data={};
 try{data=await r.json()}catch{}if(!r.ok)throw new Error(data.error||`Request failed (${r.status})`);return data;}
function metric(title,value,note,accent=''){
 return `<div class="yk84-metric"><span>${esc(title)}</span><strong class="${accent}">${esc(value)}</strong><small>${esc(note)}</small></div>`;
}
function escapeAttr(s){return esc(s)}
function adminMarkup(){return `<section class="yk84-wrap" id="yk84Admin" aria-label="Admin Dashboard Pro">
 <div class="yk84-title"><div><span class="yk84-overline">STUDYING WITH YE KUN · MANAGEMENT INTELLIGENCE</span><h2>Admin Dashboard <em>Pro</em></h2><p>Verified practice data · Student operations · YKCR Receiver</p></div>
 <div class="yk84-controls"><label for="yk84AdminPeriod">期間 · Period</label><select id="yk84AdminPeriod"><option value="7">7 Days</option><option value="30" selected>30 Days</option><option value="90">90 Days</option></select><button type="button" class="yk84-refresh" id="yk84AdminRefresh">↻ Refresh</button></div></div>
 <div id="yk84AdminBody" class="yk84-progress" aria-live="polite" aria-busy="true">Loading verified analytics…</div></section>`;}
function studentMarkup(){return `<section class="yk84-wrap" id="yk84Student" aria-label="My Learning Dashboard Pro">
 <div class="yk84-title"><div><span class="yk84-overline">STUDYING WITH YE KUN · LEARNING COMPASS</span><h2>My Learning <em>Pro</em></h2><p>သင်ယူမှုအခြေအနေ · Weak exams · Recommended next lessons</p></div><div class="yk84-controls"><label for="yk84StudentLevel">JLPT Level</label><select id="yk84StudentLevel">${['N5','N4','N3','N2','N1'].map(l=>`<option value="${l}">${l}</option>`).join('')}</select><button type="button" class="yk84-refresh" id="yk84StudentRefresh">↻ Refresh</button></div></div>
 <div id="yk84StudentBody" class="yk84-progress" aria-live="polite" aria-busy="true">Loading your learning records…</div></section>`;}
function bars(rows,days,field,title){
 const values=engine.series(rows,field,days),max=Math.max(1,...values.map(x=>x.value)),total=values.reduce((s,x)=>s+x.value,0);
 if(!total)return `<div class="yk84-empty">No recorded ${esc(title.toLowerCase())} in this period.</div>`;
 const shown=values.map((x,i)=>({...x,i}));
 return `<div class="yk84-chart" role="img" aria-label="${esc(title)} over ${days} days. Total ${total}."><div class="yk84-bars">${shown.map(x=>`<span class="yk84-bar" style="height:${Math.max(2,(x.value/max)*100)}%" title="${escapeAttr(x.day)}: ${x.value}" aria-hidden="true"></span>`).join('')}</div><div class="yk84-chartlabels"><span>${esc(values[0].day.slice(5))}</span><span>${esc(values[Math.floor(values.length/2)].day.slice(5))}</span><span>${esc(values.at(-1).day.slice(5))}</span></div></div>`;
}
function examRows(rows){if(!rows?.length)return '<div class="yk84-empty">No submitted exams in this period.</div>';
 return `<div class="yk84-exams">${rows.map(r=>`<div class="yk84-exam"><div class="yk84-exam-top"><span>${esc(engine.friendly(r.type))}</span><b>${pct(r.passRate)} <small>· ${fmt(r.verified)} verified</small></b></div><div class="yk84-track"><i style="width:${Math.max(0,Math.min(100,num(r.passRate)))}%"></i></div></div>`).join('')}</div>`;
}
function adminRender(data){const days=Number(data.periodDays),s=data.students||{},p=data.payments||{},e=data.exams||{},y=data.ykcr||{},l=data.learning||{};
 const last=y.lastReceivedAt?new Date(y.lastReceivedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'}):'No events received';
 const updated=data.generatedAt?new Date(data.generatedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'}):'—';
 return `<div class="yk84-kpis">${metric('Active Students',fmt(s.active),`${fmt(s.total)} total student records`)}${metric('Exam Pass Rate',pct(e.passRate),`${fmt(e.passed)} passed / ${fmt(e.verified)} server-verified mock exams`)}${metric('Pending Payments',fmt(p.pending),'Existing Bank Transfer approval queue','yk84-attention')}${metric('YKCR Receiver',fmt(y.inbound24h),`Events received in the past 24 h · queue status unknown`)}</div>
 <div class="yk84-grid"><article class="yk84-surface"><div class="yk84-head"><div><h3>Verified Mock Exam Trend</h3><p>Server-verified submissions per day · ${days}-day window</p></div><span class="yk84-dot">● VERIFIED ONLY</span></div>${bars(e.daily||[],days,'verified','verified submissions')}<div class="yk84-submetrics"><span>${fmt(e.submitted)} submitted</span><span>${fmt(e.verified)} verified</span><span>${fmt(e.passed)} passed</span></div>${statusLine('Pass rate excludes legacy / unverified results. Mock results are not official test outcomes.')}</article>
 <article class="yk84-surface"><div class="yk84-head"><div><h3>Learning Progress Graph</h3><p>JLPT Daily Practice sessions · ${days}-day window</p></div></div>${bars(l.dailyPractice||[],days,'sessions','daily practice sessions')}<div class="yk84-submetrics"><span>${fmt(l.accounts)} learning accounts</span><span>${fmt(l.lessonsCompleted)} total completed lessons*</span><span>${fmt(l.recentlyUpdated)} recently updated</span></div>${statusLine('*Lesson completions are current totals; no historical completion dates. Daily Practice records are not verified exam scores.')}</article>
 <article class="yk84-surface"><div class="yk84-head"><div><h3>Pass Rate by Exam</h3><p>Per exam type · no mixing JLPT and driving scoring</p></div></div>${examRows(e.byType)}</article>
 <article class="yk84-surface"><div class="yk84-head"><div><h3>YKCR Sync Receiver</h3><p>Only incoming events recorded on this website</p></div><span class="yk84-unknown">Upstream status unknown</span></div>
 <div class="yk84-synclist"><div><span>Received events (all time)</span><strong>${fmt(y.received)}</strong></div><div><span>Last 24 hours</span><strong>${fmt(y.inbound24h)}</strong></div><div><span>Last 7 days</span><strong>${fmt(y.inbound7d)}</strong></div><div><span>Last received (JST)</span><strong>${esc(last)}</strong></div><div><span>YKCR Pending / Failed Queue</span><strong>Not connected</strong></div></div>
 ${statusLine('No inbound events does not necessarily mean sync failure. Upstream queue success/failure cannot be verified by this receiver.')}</article></div>
 <div class="yk84-footer"><a href="#paymentList">Review Pending Payments ↗</a><a href="#csvForm">Student Management ↗</a><span>Updated ${esc(updated)} JST · Server aggregates · No personal records in charts</span></div>`;
}
let adminRequest=0;
async function loadAdmin(){const host=$('yk84AdminBody');if(!host)return;const request=++adminRequest,days=$('yk84AdminPeriod')?.value||'30';host.setAttribute('aria-busy','true');
 host.innerHTML='<div class="yk84-progress">Loading admin analytics…</div>';
 try{const data=await getJson(`/.netlify/functions/exam-admin-analytics?days=${encodeURIComponent(days)}`);if(request===adminRequest&&host.isConnected)host.innerHTML=adminRender(data)}
 catch(e){if(request===adminRequest&&host.isConnected)host.innerHTML=`<div class="yk84-error">Admin analytics unavailable: ${esc(e.message||'Please retry.')}. Existing management sections below are unaffected.</div>`}
 finally{if(request===adminRequest&&host.isConnected)host.setAttribute('aria-busy','false')}
}
function studentRender(result,level){const data=result.insights,coverage=data.coverage,exams=data.weakExams;
 const hasExamEvidence=data.sourceStatus.verifiedExams>0;
 const subjectBars=coverage.map(c=>`<div class="yk84-subject"><div class="yk84-subjectmeta"><span>${esc(c.section.toUpperCase())}</span><b>${fmt(c.done)} / ${fmt(c.total)} · ${pct(c.percent)}</b></div><div class="yk84-track"><i style="width:${Math.max(0,Math.min(100,num(c.percent)))}%"></i></div></div>`).join('');
 const priority=data.focus.length?data.focus.map((r,i)=>`<div class="yk84-action"><span class="yk84-action-num">${i+1}</span><div><strong>${esc(r.title)}</strong><p>${esc(r.why)}</p></div><a href="${escapeAttr(r.href)}">Start ↗</a></div>`).join(''):
 `<div class="yk84-empty">まだ学習データが少ないです。 · စာလေ့လာမှု Data မလုံလောက်သေးပါ။ <a href="/study/jlpt-learning.html?level=${escapeAttr(level)}&section=daily">Start Daily Practice ↗</a></div>`;
 const evidence=hasExamEvidence?`<div class="yk84-submetrics"><span>${fmt(data.sourceStatus.verifiedExams)} verified attempts</span><span>${exams.length} exam areas below 70% (min. 2 attempts)</span></div>`:
 '<div class="yk84-empty">No verified exam scores yet — weakness cannot be inferred from exam results.</div>';
 const examsHtml=exams.length?exams.map(x=>`<div class="yk84-subject"><div class="yk84-subjectmeta"><span>${esc(engine.friendly(x.type))}</span><b>${pct(x.average)} · ${fmt(x.count)} verified</b></div><div class="yk84-track"><i style="width:${Math.max(0,Math.min(100,x.average))}%"></i></div></div>`).join(''):'<div class="yk84-empty">No sufficiently repeated low-scoring exam type found.</div>';
 return `<div class="yk84-kpis">${metric('Verified Exam Results',fmt(data.sourceStatus.verifiedExams),'Last 50 attempts available')}${metric('JLPT Daily Practice',fmt(data.practiceCount),'Most recent 10 sessions')}${metric('Practice Accuracy',pct(data.practiceAccuracy),'Recent JLPT Daily Practice; not an official score')}${metric('Saved Mistakes (sample)',data.sourceStatus.mistakesAvailable?fmt(data.mistakeQuestions):'Unavailable','Most recent 50 saved mistakes')}</div>
 <div class="yk84-grid"><article class="yk84-surface"><div class="yk84-head"><div><h3>Subjects Needing More Study</h3><p>JLPT ${esc(level)} · lesson completion, <strong>not test weakness</strong></p></div></div>${result.progressError?`<div class="yk84-error">${esc(result.progressError)}</div>`:subjectBars||'<div class="yk84-empty">Lesson data unavailable.</div>'}${statusLine('Low completion means lessons remain; this does not prove poor subject understanding.')}</article>
 <article class="yk84-surface"><div class="yk84-head"><div><h3>Exam Areas to Review</h3><p>Scores below 70%, with at least 2 verified attempts</p></div></div>${evidence}${examsHtml}${statusLine('Verified mock exam scores only; older unverified attempts are ignored.')}</article>
 <article class="yk84-surface yk84-recommend"><div class="yk84-head"><div><h3>Recommended Next Practice</h3><p>Missed questions first, then weak exam scores, then incomplete lessons</p></div></div><div class="yk84-actions">${priority}</div><a class="yk84-daily" href="/study/jlpt-learning.html?level=${escapeAttr(level)}&section=daily">Start JLPT ${esc(level)} Daily Practice ↗</a></article>
 <article class="yk84-surface"><div class="yk84-head"><div><h3>Data Sources & Accuracy</h3><p>Personal account only · no simulated data</p></div></div><div class="yk84-synclist"><div><span>Verified exam data</span><strong>${fmt(data.sourceStatus.verifiedExams)} attempts</strong></div><div><span>Saved mistakes</span><strong>${data.sourceStatus.mistakesAvailable?'Available':'Unavailable'}</strong></div><div><span>JLPT progress</span><strong>${data.sourceStatus.progressAvailable?'Available':'Unavailable'}</strong></div></div>${statusLine('Mock exam questions do not currently store verified per-section performance. Subject bars show lesson coverage only.')} </article></div>`;
}
let studentData=null,studentRequest=0;
async function loadStudent(){const host=$('yk84StudentBody');if(!host)return;const request=++studentRequest;host.setAttribute('aria-busy','true');host.innerHTML='<div class="yk84-progress">Loading personalized study records…</div>';
 const [activity,mistakes,progress,content,reading]=await Promise.allSettled([
  getJson('/.netlify/functions/exam-my-activity'),getJson('/.netlify/functions/yk-learning'),getJson('/.netlify/functions/jlpt-learning-progress'),
  getJson('/assets/jlpt-learning-v782-content.json'),getJson('/assets/jlpt-reading-v7822-upgrade.json')]);
 if(request!==studentRequest||!host.isConnected)return;
 if(activity.status!=='fulfilled'){host.innerHTML=`<div class="yk84-error">Personal activity unavailable: ${esc(activity.reason?.message)}. Please sign in again or retry.</div>`;host.setAttribute('aria-busy','false');return;}
 let lessonData=content.status==='fulfilled'?content.value:null;
 if(lessonData&&reading.status==='fulfilled'){
  for(const level of ['N5','N4','N3','N2','N1']){
   const add=reading.value?.levels?.[level]?.exercises;if(!Array.isArray(add)||!lessonData?.levels?.[level])continue;
   const base=lessonData.levels[level].reading||[];const known=new Set(base.map(x=>x.id));lessonData.levels[level].reading=base.concat(add.filter(x=>!known.has(x.id)));
  }
 }
 studentData={attempts:activity.value.attempts||[],mistakes:mistakes.status==='fulfilled'?mistakes.value.mistakes:[],
  state:progress.status==='fulfilled'?progress.value.state:{},content:lessonData,
  mistakesAvailable:mistakes.status==='fulfilled',progressAvailable:progress.status==='fulfilled'&&!!lessonData,
  progressError:progress.status!=='fulfilled'?'JLPT progress cloud API unavailable.':!lessonData?'Lesson content not available.':null};
 const valid=/^N[1-5]$/.test(studentData.state?.lastLevel)?studentData.state.lastLevel:'N5';
 if($('yk84StudentLevel'))$('yk84StudentLevel').value=valid;
 paintStudent();host.setAttribute('aria-busy','false');
}
function paintStudent(){if(!studentData)return;const host=$('yk84StudentBody');if(!host)return;
 const level=$('yk84StudentLevel')?.value||'N5';const info={...studentData,state:{...studentData.state,lastLevel:level}};
 host.innerHTML=studentRender({insights:engine.recommendations(info),progressError:studentData.progressError},level);
}
function mount(){if(role==='admin'){
 if(!root.querySelector('#adminStats')||root.querySelector('#yk84Admin'))return false;
 root.insertAdjacentHTML('afterbegin',adminMarkup());$('yk84AdminPeriod').addEventListener('change',loadAdmin);$('yk84AdminRefresh').addEventListener('click',loadAdmin);void loadAdmin();return true;
 }
 if(!root.querySelector('#myAttempts')||root.querySelector('#yk84Student'))return false;
 root.insertAdjacentHTML('afterbegin',studentMarkup());$('yk84StudentLevel').addEventListener('change',paintStudent);$('yk84StudentRefresh').addEventListener('click',loadStudent);void loadStudent();return true;
}
// The old dashboard remains the source of truth for login/role redirects.
if(!mount()){
 const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});
 observer.observe(root,{childList:true});
}
})();
