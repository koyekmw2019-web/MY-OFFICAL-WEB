/* v7.84 — Admin + Student Pro panels, additive to existing v7.58-7.83 Dashboard.
 * No modification to auth, payment approval, YKCR receiver or exam access.
 */
(()=>{
'use strict';
const root=document.getElementById('dashboardBody'),role=document.body?.dataset.dashboard;
const engine=window.YKDashboardProEngineV784,allExams=window.YKAllExamsV7863;
if(!root||!engine||!['admin','student'].includes(role)||(role==='student'&&!allExams))return;
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
function studentMarkup(){return `<section class="yk84-wrap" id="yk84Student" aria-label="All Exam Learning Dashboard Pro">
 <div class="yk84-title"><div><span class="yk84-overline">STUDYING WITH YE KUN · LEARNING COMPASS</span><h2>My Learning <em>Pro</em></h2><p>TRUCK · TAXI · BUS · 自動車整備 · Driving · JLPT</p></div>
 <div class="yk84-controls"><button type="button" class="yk84-refresh" id="yk84StudentRefresh">↻ Refresh records</button></div></div>
 <div class="yk863-categories" role="group" aria-label="Exam category">${Object.entries(allExams.catNames).map(([id,label])=>`<button type="button" class="yk863-tab" data-yk863-category="${id}" aria-pressed="${id==='all'}">${label}</button>`).join('')}</div>
 <div class="yk863-exam-grid" id="yk863ExamGrid" role="group" aria-label="Select exam"></div>
 <div id="yk84StudentBody" class="yk84-progress" aria-live="polite" aria-busy="true">Loading your exam records…</div></section>`;}
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
/* v7.86.3 — one initial scoped exam request, other APIs only when selected. */
let studentData=null,studentRequest=0,selectedCategory='all',selectedExam='all',jlptLoad=null,mistakesLoad=null;
const examLabel=t=>allExams.catalog.find(x=>x.type===t)?.short||t;
const safeHref=t=>'/mock-exams.html?exam='+encodeURIComponent(String(t||'truck'));
function examCards(){const grid=$('yk863ExamGrid');if(!grid)return;
 const attempts=studentData?.attempts||[];
 grid.innerHTML=allExams.list(selectedCategory).map(c=>{const s=allExams.summarize(attempts,c.type);
 return `<button type="button" class="yk863-exam-card" data-yk863-type="${c.type}" aria-pressed="${c.type===selectedExam}"><b>${esc(c.label)}</b><small>${s.verified?`${fmt(s.verified)} verified · ${pct(s.averagePercent)} avg`:'No verified results yet'}</small></button>`;}).join('');
 document.querySelectorAll('[data-yk863-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.yk863Category===selectedCategory)));
}
function studentRender(){
 const a=studentData?.attempts||[],total=allExams.allSummary(a,selectedCategory),selected=selectedExam!=='all'?allExams.summarize(a,selectedExam):null;
 const review=selected?total.weakTypes.filter(x=>x.type===selectedExam):total.weakTypes;
 const categories=selected?`${examLabel(selectedExam)} · individual exam scoring`:`${allExams.catNames[selectedCategory]} · ${total.totalTypes} exam types · no mixed-scale average`;
 const headline=selected?`<div class="yk84-kpis">${metric('Verified Results',fmt(selected.verified),`${fmt(selected.submitted)} submitted · ${fmt(selected.excluded)} unverified`)}${metric('Average Score',pct(selected.averagePercent),'Percent of this exam’s full marks only')}${metric('Pass Rate',pct(selected.passRate),`${fmt(selected.passed)} passed / ${fmt(selected.passKnown)} with checked pass status`)}${metric('Latest Verified Score',selected.latest?`${fmt(selected.latest.score)} / ${fmt(selected.max)}`:'—',selected.latest?.date||'No verified result available')}</div>`:
 `<div class="yk84-kpis">${metric('Verified Results',fmt(total.verified),'Last 50 account attempts only')}${metric('Exam Types Practiced',fmt(total.represented),`Of ${total.totalTypes} types in this category`)}${metric('Submitted Attempts',fmt(total.submitted),'Includes unverified historical records')}${metric('Overall Average','—','Different exam scales are not combined')}</div>`;
 const evidence=selected?selected.verified>=2&&selected.averagePercent<70?`<div class="yk863-note yk863-attention">${esc(examLabel(selectedExam))}: ${pct(selected.averagePercent)} across ${selected.verified} verified attempts. Review this exam.</div>`:selected.verified===0?'<div class="yk84-empty">No verified scores for this exam yet. Take a practice exam to begin.</div>':'<div class="yk84-empty">Not enough repeated low-scoring results to identify an exam weakness. Section-level proficiency is not recorded.</div>':
 review.length?review.map(x=>`<div class="yk863-note yk863-attention">${esc(examLabel(x.type))} · ${pct(x.averagePercent)} average across ${fmt(x.verified)} verified attempts</div>`).join(''):'<div class="yk84-empty">No verified exam type below 70% with at least 2 attempts. This does not prove there are no weak subjects.</div>';
 const mistakes=studentData?.mistakes;
 const filtered=allExams.mistakesFor(mistakes,selectedExam);
 const mistakePanel=mistakes?`<p class="yk84-caption">${fmt(filtered.length)} recent stored wrong-answer entries${selectedExam==='all'?'':' for this exam'}. Zero saved entries does not mean zero wrong answers.</p>${filtered.slice(0,3).map(x=>`<div class="yk863-mistake"><strong>${esc(examLabel(x.exam_type))} · ${fmt(x.missed_count)}×</strong><p>${esc(String(x.question_text||'').slice(0,180))}</p></div>`).join('')}`:
 studentData?.mistakesError?`<div class="yk84-empty">Review data unavailable. ${esc(studentData.mistakesError)}</div>`:`<button type="button" class="yk863-load" id="yk863Mistakes">Load saved wrong answers</button><p class="yk84-caption">Loads only when requested. Your private results are not cached publicly.</p>`;
 const next=selectedExam==='all'?(review.length?review[0].type:null):selectedExam;
 const title=next?examLabel(next):'Choose an exam',url=next?safeHref(next):'/mock-exams.html';
 const course=selectedExam.startsWith('jlpt_')?jlptPanel(selectedExam):'<div class="yk84-empty">For SSW / Driving exams, question-section scores are not currently stored as verified data. Review saved mistakes and exam history instead.</div>';
 return `<div class="yk863-summaryline">${esc(categories)}</div>${headline}
 <div class="yk84-grid"><article class="yk84-surface"><div class="yk84-head"><div><h3>Exam Areas to Review</h3><p>Based only on server-verified mock exam scores (min. 2 attempts)</p></div></div>${evidence}</article>
 <article class="yk84-surface yk84-recommend"><div class="yk84-head"><div><h3>Recommended Next Practice</h3><p>${esc(title)} · based on selected exam or lowest repeated scores</p></div></div><div class="yk84-actions"><div class="yk84-action"><span class="yk84-action-num">1</span><div><strong>${next?esc(title)+' practice':'Start a selected exam'}</strong><p>${next?'Start or review this exam using the existing Exam Center access rules.':'Choose one of the exam cards above. Recommendations need repeated verified results.'}</p></div><a href="${escapeAttr(url)}">Open ↗</a></div></div>${selectedExam==='all'?statusLine('Select an exam card to see its own verified scores, without averaging different exams.'):''}</article>
 <article class="yk84-surface"><div class="yk84-head"><div><h3>Saved Wrong Answers</h3><p>On demand · account-scoped, up to 150 stored records</p></div></div>${mistakePanel}</article>
 <article class="yk84-surface"><div class="yk84-head"><div><h3>${selectedExam.startsWith('jlpt_')?'JLPT Learning Coverage':'Learning Data Notes'}</h3><p>${selectedExam.startsWith('jlpt_')?'Completed lessons are not exam subject scores':'No invented category scores'}</p></div></div>${course}</article></div>
 <div class="yk84-footer"><span>Private, account-scoped data. Latest 50 exam attempts only. Legacy/unverified scores excluded. No exam attempts consumed.</span></div>`;
}
function jlptPanel(type){
 if(!studentData?.jlpt)return `<button type="button" class="yk863-load" id="yk863JLPTLoad">Load JLPT lesson progress</button><p class="yk84-caption">Only JLPT selection loads learning content and the additional JLPT API.</p>`;
 const level=type.slice(-2).toUpperCase(),detail=studentData.jlpt;
 if(detail.error)return `<div class="yk84-error">${esc(detail.error)}</div>`;
 const insight=engine.recommendations({attempts:[],state:{...detail.state,lastLevel:level},content:detail.content,mistakesAvailable:false,progressAvailable:!!detail.content});
 const html=insight.coverage.map(c=>`<div class="yk84-subject"><div class="yk84-subjectmeta"><span>${esc(c.section.toUpperCase())}</span><b>${fmt(c.done)} / ${fmt(c.total)} · ${pct(c.percent)}</b></div><div class="yk84-track"><i style="width:${Math.max(0,Math.min(100,num(c.percent)))}%"></i></div></div>`).join('');
 return `${html||'<div class="yk84-empty">No lesson coverage data available for this level.</div>'}<p class="yk84-caption">Completion status only. It does not measure actual Vocabulary / Grammar / Reading test weakness.</p><a class="yk84-daily" href="/study/jlpt-learning.html?level=${level}&section=daily">JLPT ${level} Daily Practice ↗</a>`;
}
async function getActivity(){
 // v7.86.3 reuses the account-scoped exam activity promise from the existing dashboard.
 const shared=window.YKDashboardActivityPromiseV7863;
 return shared?await shared:await getJson('/.netlify/functions/exam-my-activity');
}
async function loadStudent(){const host=$('yk84StudentBody');if(!host)return;const request=++studentRequest;
 host.setAttribute('aria-busy','true');host.innerHTML='<div class="yk84-progress">Loading exam history…</div>';
 try{const data=await getActivity();if(request!==studentRequest||!host.isConnected)return;
 studentData={attempts:data.attempts||[],mistakes:null,mistakesError:null,jlpt:null};paintStudent();
 }catch(e){if(request===studentRequest&&host.isConnected)host.innerHTML=`<div class="yk84-error">Account exam history unavailable. Please sign in again or retry. ${esc(e.message||'')}</div>`}
 finally{if(request===studentRequest&&host.isConnected)host.setAttribute('aria-busy','false')}
}
async function loadMistakes(){if(!studentData||mistakesLoad)return;
 const host=$('yk84StudentBody');if(!host)return;const button=$('yk863Mistakes');if(button){button.disabled=true;button.textContent='Loading review…';}
 mistakesLoad=(window.YKDashboardMistakesPromiseV7863||getJson('/.netlify/functions/yk-learning'));
 window.YKDashboardMistakesPromiseV7863=mistakesLoad;
 try{const data=await mistakesLoad;studentData.mistakes=Array.isArray(data.mistakes)?data.mistakes:[]}
 catch(e){studentData.mistakesError='Please retry later.'}
 finally{mistakesLoad=null;paintStudent()}
}
async function loadJLPT(){if(!studentData||jlptLoad)return;const button=$('yk863JLPTLoad');if(button){button.disabled=true;button.textContent='Loading JLPT…';}
 jlptLoad=Promise.allSettled([getJson('/.netlify/functions/jlpt-learning-progress'),getJson('/assets/jlpt-learning-v782-content.json'),getJson('/assets/jlpt-reading-v7822-upgrade.json')]);
 const results=await jlptLoad;const [progress,content,reading]=results;
 const lesson=content.status==='fulfilled'?content.value:null;
 if(lesson&&reading.status==='fulfilled')for(const level of ['N5','N4','N3','N2','N1']){const extra=reading.value?.levels?.[level]?.exercises;if(!Array.isArray(extra)||!lesson?.levels?.[level])continue;
 const base=lesson.levels[level].reading||[],seen=new Set(base.map(x=>x.id));lesson.levels[level].reading=base.concat(extra.filter(x=>!seen.has(x.id)));}
 studentData.jlpt={state:progress.status==='fulfilled'?progress.value.state:{},content:lesson,error:progress.status==='fulfilled'&&lesson?null:'JLPT progress data unavailable. Please retry later.'};
 jlptLoad=null;paintStudent();
}
function paintStudent(){if(!studentData)return;examCards();const host=$('yk84StudentBody');if(!host)return;
 host.innerHTML=studentRender();host.setAttribute('aria-busy','false');
 $('yk863Mistakes')?.addEventListener('click',loadMistakes);$('yk863JLPTLoad')?.addEventListener('click',loadJLPT);
}
function selectCategory(c){if(!allExams.catNames[c])return;selectedCategory=c;selectedExam='all';paintStudent()}
function selectType(type){if(!allExams.catalog.some(x=>x.type===type))return;selectedExam=type;paintStudent()}
function mount(){if(role==='admin'){
 if(!root.querySelector('#adminStats')||root.querySelector('#yk84Admin'))return false;
 root.insertAdjacentHTML('afterbegin',adminMarkup());$('yk84AdminPeriod').addEventListener('change',loadAdmin);$('yk84AdminRefresh').addEventListener('click',loadAdmin);void loadAdmin();return true;
 }
 if(!root.querySelector('#myAttempts')||root.querySelector('#yk84Student'))return false;
 root.insertAdjacentHTML('afterbegin',studentMarkup());$('yk84StudentRefresh').addEventListener('click',loadStudent);const panel=$('yk84Student');panel.addEventListener('click',e=>{const cat=e.target.closest('[data-yk863-category]'),type=e.target.closest('[data-yk863-type]');if(cat)selectCategory(cat.dataset.yk863Category);else if(type)selectType(type.dataset.yk863Type)});examCards();void loadStudent();return true;
}
// The old dashboard remains the source of truth for login/role redirects.
if(!mount()){
 const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});
 observer.observe(root,{childList:true});
}
})();
