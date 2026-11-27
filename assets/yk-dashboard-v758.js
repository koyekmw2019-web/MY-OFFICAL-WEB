/* YE KUN v7.58: dedicated role dashboards over existing Identity, YKCR & Exam backend */
(()=>{
'use strict';
const root=document.getElementById('dashboardBody'),message=document.getElementById('dashMessage');
if(!root)return;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const when=x=>{if(!x)return '—';const d=new Date(x);return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('ja-JP')};
const money=x=>'¥'+Number(x||0).toLocaleString('ja-JP');
const badge=x=>`<span class="tag ${esc(x)}">${esc(x)}</span>`;
const status=(text,error=false)=>{message.hidden=!text;message.textContent=text||'';message.classList.toggle('error',error)};
function cards(items){return `<div class="stats">${items.map(x=>`<div class="stat"><span>${esc(x[0])}</span><b>${esc(x[1]??'—')}</b></div>`).join('')}</div>`}
function panel(title,body,extra=''){return `<section class="panel ${extra}"><h2>${title}</h2>${body}</section>`}
function row(k,v){return `<div class="profile-row"><span>${esc(k)}</span><b>${esc(v??'—')}</b></div>`}
async function identity(){for(let i=0;i<120;i++){if(window.YKIdentity)return window.YKIdentity;await new Promise(r=>setTimeout(r,50))}throw new Error('Login service has not loaded. Please reload the page.')}
async function api(name,opts={}){const res=await fetch('/.netlify/functions/'+name,{credentials:'same-origin',cache:'no-store',...opts,headers:{...(opts.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(opts.headers||{})}});const ct=res.headers.get('content-type')||'';let data;if(ct.includes('application/json'))data=await res.json().catch(()=>({}));else data={error:await res.text().catch(()=>res.statusText)};if(!res.ok)throw new Error(data?.error||`Server error: ${res.status}`);return data}
let id=null,user=null,me=null,activity=null;
const kind=document.body.dataset.dashboard;
const targets={admin:'/admin-dashboard.html',student:'/student-dashboard.html',member:'/member-dashboard.html'};
function currentRole(){if(me.roles?.includes('admin'))return 'admin';if(me.linkedStudent)return 'student';return 'member'}
function go(to){window.location.replace(to)}
const wantsPersonal=new URLSearchParams(location.search).get('view')==='personal';
const section=(key,title,body,open=false)=>`<details class="yk7912-section" id="${key}"${open?' open':' hidden'}><summary><span>${title}</span><span aria-hidden="true">⌄</span></summary><div class="yk7912-section-body">${body}</div></details>`;
const tiles=items=>`<nav class="yk7912-tiles" aria-label="Dashboard sections">${items.map(([key,icon,label])=>`<a href="#${key}"><span aria-hidden="true">${icon}</span><b>${label}</b><span aria-hidden="true">›</span></a>`).join('')}</nav>`;
function openSection(hash){if(!hash||hash.length>120)return;const target=$(hash.slice(1));if(!target||!root.contains(target))return;
 const selected=target.closest('.yk7912-section');if(!selected)return;
 root.querySelectorAll('.yk7912-section').forEach(el=>{const active=el===selected;el.hidden=!active;el.open=active;});
 root.querySelectorAll('.yk7912-tiles a').forEach(link=>{const active=link.getAttribute('href')==='#'+selected.id;link.setAttribute('aria-current',active?'true':'false');});
 for(let el=target;el&&el!==root;el=el.parentElement){if(el.tagName==='DETAILS')el.open=true;}
}
root.addEventListener('toggle',e=>{const d=e.target;if(!d.matches?.('.yk7912-section')||d.open||d.hidden)return;d.hidden=true;const link=root.querySelector('.yk7912-tiles a[href="#'+d.id+'"]');link?.setAttribute('aria-current','false');},true);
root.addEventListener('click',e=>{const link=e.target.closest('a[href^="#"]');if(link)openSection(link.getAttribute('href'));});
window.addEventListener('hashchange',()=>openSection(location.hash));
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
async function init(){
 try{
  id=await identity();user=await id.getUser();if(!user){go('/login.html?return='+encodeURIComponent(location.pathname+location.search+location.hash));return}
  me=await api('exam-status');if(me.authenticated!==true||!Array.isArray(me.roles))throw new Error('Account status unavailable. Please retry.');const role=currentRole();
  if(kind!==role){go(targets[role]+(role==='admin'&&wantsPersonal?'?view=personal':'')+location.hash);return}
  const management=role==='admin'&&!wantsPersonal;
  document.body.dataset.dashboardView=management?'management':'personal';
  $('rolePill').textContent=role==='admin'?'👑 Admin Access':me.student?'✅ Student Verified':me.paid?'Paid Access':me.pendingPayment?'Payment Pending':me.linkedStudent?'⚠ Student Record Linked · Not Active':'👤 Member Access';
  document.querySelector('.intro h1').textContent=management?'Admin Dashboard':'My Dashboard';
  document.querySelector('.intro p').textContent=management?'Student Management · CSV Import · Payment Requests · Reports':'Your account · Exams · Learning progress';
  document.title=(management?'Admin Dashboard':'My Dashboard')+' | STUDYING WITH YE KUN';
  if(management)await showAdmin();else await showMember(role);
  openSection(location.hash);
  status('');
 }catch(e){status('Dashboard error: '+e.message,true);root.innerHTML='<div class="actions"><button class="btn" id="retryDash">↻ Retry</button><a class="btn" href="/#home">Homepage</a></div>';$('retryDash').onclick=()=>location.reload()}
}
$('dashLogout')?.addEventListener('click',async()=>{try{await (id||await identity()).logout();window.location.replace('/#home')}catch(e){status('Logout failed: '+e.message,true)}});
let selectedFilter='all',payments=[];
async function showAdmin(){
 root.innerHTML='<div id="adminStats"></div>'+tiles([['yk7912Students','🎓','Student Management'],['yk7912Payments','💳','Payment Management'],['yk7912AdminAnalytics','📈','Exam & Student Overview'],['yk7912Sync','🔄','YKCR Sync'],['yk7912Dictionary','📚','Dictionary Reports'],['yk7912AdminAnnouncements','📢','Announcements'],['yk7912AdminAccount','⚙','Account Settings']])+
 section('yk7912Students','Student Management',`<p class="muted">ရှိပြီးသား Student Records နဲ့ YKCR Sync ကိုပဲ အသုံးပြုပါတယ်။ New Student Database မတည်ဆောက်ပါဘူး။</p><form id="csvForm" class="formrow"><label for="csvFile">Student CSV Import</label><input type="file" id="csvFile" accept=".csv,text/csv" required><button class="btn primary" type="submit">Import Students</button></form><p class="notice">CSV ထဲမှာ Student ID နဲ့ Verification Code ပါရင် မူလအချက်အလက်ကို အသုံးပြုပါမယ်။ Import မလုပ်ခင် CSV မှန်ကန်ကြောင်း စစ်ပါ။</p><div id="csvResult" class="status" hidden></div><div id="csvCredentials"></div>`)+
 section('yk7912Payments','Payment Management',`<p class="muted">Receipt Review · Approve · Reject · Delete · Refresh</p><div class="filters"><label for="paymentFilter">Status</label><select id="paymentFilter"><option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><button id="refreshPayments" class="btn sm" type="button">↻ Refresh</button></div><div id="paymentList" aria-live="polite"><p class="muted">Loading…</p></div>` )+
 section('yk7912AdminAnalytics','Exam & Student Overview','<div id="yk7912AdminChartHost"></div><div id="adminOverviewMore" class="muted">Loading overview…</div>')+
 section('yk7912Sync','YKCR Sync','<div id="yk7912SyncHost">Loading analytics…</div>')+
 section('yk7912Dictionary','Dictionary Reports','<p class="muted">Dictionary corrections and reporting are reviewed by administrators before any meaning is changed.</p><a class="btn primary" href="/dictionary-reports.html">⚑ Dictionary Translation Reports →</a>')+
 section('yk7912AdminAnnouncements','Announcements','<div id="yk7912AnnouncementHost"></div>')+
 section('yk7912AdminAccount','Account Settings',row('Email',me.email||user.email)+'<div class="actions"><a class="btn" href="/admin-dashboard.html?view=personal">My Dashboard</a><a class="btn" href="/login.html">Login / Password Recovery</a><a class="btn" href="/mock-exams.html">Exam Center</a></div>');

 $('paymentFilter').addEventListener('change',e=>{selectedFilter=e.target.value;paintPayments()});
 $('refreshPayments').addEventListener('click',loadPayments);
 $('csvForm').addEventListener('submit',importCsv);
 $('paymentList').addEventListener('click',paymentAction);
 await Promise.all([loadAdminStats(),loadPayments(false)]);
}
async function loadAdminStats(){try{const x=await api('exam-admin-overview');$('adminOverviewMore').innerHTML=cards([['Exam attempts (all time)',x.attempts?.total],['Submitted exams (all time)',x.attempts?.submitted],['Approved payments',x.payments?.approved],['Rejected payments',x.payments?.rejected]])+'<p class="muted">All-time totals. The analytics panel above uses its selected period.</p>';}catch(e){$('adminOverviewMore').textContent='Overview not available.'}}
async function importCsv(ev){ev.preventDefault();const f=$('csvFile').files?.[0],el=$('csvResult'),out=$('csvCredentials');if(!f)return;const button=$('csvForm').querySelector('button');button.disabled=true;el.hidden=false;el.className='status';el.textContent='Importing…';out.innerHTML='';try{if(f.size>1500000)throw new Error('CSV file too large.');const form=new FormData();form.append('file',f);const x=await api('exam-admin-import-students',{method:'POST',body:form});el.textContent=`Imported ${x.imported||0} students into existing student records.`;const created=(x.credentials||[]).filter(y=>y.verificationCode);if(created.length){out.innerHTML='<p class="muted">New/provided verification codes (admin-only; do not share publicly):</p><div class="tablewrap"><table class="records-table"><thead><tr><th>Student ID</th><th>Name</th><th>Verification Code</th></tr></thead><tbody>'+created.slice(0,200).map(y=>`<tr><td>${esc(y.studentCode)}</td><td>${esc(y.name)}</td><td>${esc(y.verificationCode)}</td></tr>`).join('')+'</tbody></table></div>'}await loadAdminStats()}catch(e){el.className='status error';el.textContent=e.message}finally{button.disabled=false}}
async function loadPayments(refreshStats=true){const box=$('paymentList');box.innerHTML='<p class="muted">Loading Payment Requests…</p>';try{const data=await api('exam-admin-payments');payments=data.payments||[];paintPayments();if(refreshStats!==false)await loadAdminStats()}catch(e){box.innerHTML=`<p class="status error">${esc(e.message)}</p>`}}
function paintPayments(){const box=$('paymentList');const list=payments.filter(p=>selectedFilter==='all'||p.status===selectedFilter);box.innerHTML=list.length?list.map(p=>`<article class="record" data-id="${Number(p.id)}"><div class="record-title"><b>#${Number(p.id)} · ${esc(p.payer_name)}</b>${badge(p.status)}</div><p class="muted">${esc(p.user_email)} · ${money(p.amount_yen)} · ${esc(p.plan_code)}<br>Bank: ${esc(p.bank_key||'—')} · Transfer: ${esc(p.transfer_date||'—')}<br>Submitted: ${when(p.submitted_at)} ${p.admin_note?'· Note: '+esc(p.admin_note):''}</p><div class="actions"><button type="button" class="btn sm" data-action="receipt" data-id="${Number(p.id)}">◫ Receipt</button>${p.status==='pending'?`<button type="button" class="btn sm primary" data-action="approve" data-id="${Number(p.id)}">✓ Approve</button><button type="button" class="btn sm" data-action="reject" data-id="${Number(p.id)}">✕ Reject</button>`:''}<button type="button" class="btn sm danger" data-action="delete" data-id="${Number(p.id)}">🗑 Delete</button></div></article>`).join(''):'<div class="empty">No payment requests for this status.</div>'}
let receiptURL=null;
$('closeReceipt')?.addEventListener('click',()=>{$('receiptDialog').close()});
$('receiptDialog')?.addEventListener('close',()=>{if(receiptURL){URL.revokeObjectURL(receiptURL);receiptURL=null}$('receiptContent').innerHTML=''});
async function paymentAction(event){const btn=event.target.closest('button[data-action]');if(!btn)return;const paymentId=Number(btn.dataset.id),action=btn.dataset.action;const p=payments.find(x=>Number(x.id)===paymentId);if(!p)return;
 if(action==='receipt'){
  const dialog=$('receiptDialog');$('receiptContent').textContent='Loading receipt…';dialog.showModal();try{const resp=await fetch('/.netlify/functions/exam-admin-receipt?paymentId='+paymentId,{credentials:'same-origin',cache:'no-store'});if(!resp.ok)throw new Error('Receipt could not be opened');const blob=await resp.blob();receiptURL=URL.createObjectURL(blob);const ct=blob.type||resp.headers.get('content-type')||'';$('receiptContent').innerHTML=ct.startsWith('image/')?`<img src="${receiptURL}" alt="Transfer receipt for request ${paymentId}">`:`<p class="muted">Receipt file is ready.</p><a href="${receiptURL}" target="_blank" rel="noopener">Open receipt (PDF / file)</a>`}catch(e){$('receiptContent').textContent=e.message}return;
 }
 let note='',confirmation;
 if(action==='approve'){if(!confirm(`Approve request #${paymentId} (${money(p.amount_yen)})? Paid exam access will start immediately.`))return}
 if(action==='reject'){const val=prompt(`Reason for rejecting request #${paymentId} (optional):`,'');if(val===null)return;note=val;if(!confirm(`Reject payment #${paymentId}?`))return}
 if(action==='delete'){if(!confirm(`Remove payment #${paymentId} from the Admin list?\nRecord and receipt will be retained for audit.\nExisting approved access will NOT be revoked.`))return;const typed=prompt(`Type DELETE ${paymentId} to confirm removal:`, '');if(typed!==`DELETE ${paymentId}`){alert('Delete cancelled: confirmation did not match.');return}confirmation=typed;note='Removed from Admin list (soft delete)';}
 btn.disabled=true;try{await api('exam-admin-payments',{method:'POST',body:JSON.stringify({action,paymentId,note,confirmation})});await loadPayments()}catch(e){status('Payment update failed: '+e.message,true)}finally{btn.disabled=false}
}


/* v7.67 interactive analytics — requires authenticated, account-scoped API records. */
let learningType='all',learningPeriod='all';
const formatPercent=v=>v==null?'—':`${Number(v).toFixed(1).replace(/\.0$/,'')}%`;
function learningChartV767(points){
 if(!points.length)return '<div class="learning-empty-v767"><span aria-hidden="true">◌</span><b>No verified scores yet</b><p>Submit a supported mock exam to see your learning trend here.</p></div>';
 const w=740,h=256,L=43,R=20,T=22,B=46,x1=L,x2=w-R,y1=T,y2=h-B;
 const x=i=>points.length===1?(x1+x2)/2:x1+(x2-x1)*i/(points.length-1);
 const y=p=>y2-(y2-y1)*(p.percent/100);
 const grid=[0,25,50,75,100].map(v=>{const pos=y({percent:v});return `<g><line x1="${L}" y1="${pos}" x2="${x2}" y2="${pos}" class="yk767-grid"/><text x="${L-11}" y="${pos+4}" text-anchor="end" class="yk767-axis">${v}</text></g>`}).join('');
 const segments=points.map((p,i)=>`${i===0?'M':'L'} ${x(i).toFixed(2)} ${y(p).toFixed(2)}`).join(' ');
 const area=points.length>1?`<path d="${segments} L ${x(points.length-1).toFixed(2)} ${y2} L ${x(0).toFixed(2)} ${y2} Z" class="yk767-area"/>`:'';
 const marks=points.map((p,i)=>{
   const date=new Date(p.submitted_at||p.started_at),label=Number.isFinite(date.getTime())?date.toLocaleDateString('ja-JP',{month:'2-digit',day:'2-digit'}):'—';
   const tag=String(p.exam_type||'');
   return `<g><circle cx="${x(i).toFixed(2)}" cy="${y(p).toFixed(2)}" r="5.5" class="yk767-dot" tabindex="0" role="img" aria-label="${esc(tag)} ${esc(label)} ${esc(p.percent)} percent"><title>${esc(tag)} · ${esc(label)} · ${esc(p.percent)}%</title></circle>${i===0||i===points.length-1||points.length<=4?`<text x="${x(i).toFixed(2)}" y="${h-15}" text-anchor="middle" class="yk767-axis">${esc(label)}</text>`:''}</g>`;
 }).join('');
 return `<div class="yk767-chart-container"><svg class="yk767-chart" viewBox="0 0 ${w} ${h}" role="group" aria-label="Practice score trend: latest ${points.length} verified results, zero to 100 percent">${grid}${area}<path d="${segments}" class="yk767-line"/>${marks}</svg></div>`;
}
function learningKpi(label,value,note){return `<div class="yk767-kpi"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></div>`}
function paintLearningInsights(attempts){
 const host=$('myLearningOverview');if(!host)return;
 const engine=window.YKLearningAnalyticsV767,score=window.YKLearningScoreV765;
 if(!engine||!score){host.innerHTML='<p class="status error">Learning analytics module unavailable. Reload this page.</p>';return}
 const typeOptions=engine.types(attempts);
 if(learningType!=='all'&&!typeOptions.includes(learningType))learningType='all';
 const m=engine.summarize(attempts,learningType,learningPeriod);

 
 const change=m.change===null?'—':`${m.change>0?'+':''}${Number(m.change).toFixed(1).replace(/\.0$/,'')} pp`;
 const scopeText=learningPeriod==='all'?'All available history':`Last ${learningPeriod} days`;
 const options=typeOptions.map(t=>`<option value="${esc(t)}" ${learningType===t?'selected':''}>${esc(t.toUpperCase().replaceAll('_',' '))}</option>`).join('');
 host.innerHTML=`<div class="yk767-wrap">
 <div class="yk767-hero"><div><span class="yk767-overline">STUDYING WITH YE KUN · LEARNING INSIGHTS</span><h3>Score Trends</h3><p>Explore your progress using your own saved exam results.</p></div><div class="yk767-controls"><label>Exam Type<select id="learningExamType"><option value="all" ${learningType==='all'?'selected':''}>All exams</option>${options}</select></label><label>Period<select id="learningPeriod"><option value="all" ${learningPeriod==='all'?'selected':''}>All time</option>${['7','30','90'].map(d=>`<option value="${d}" ${learningPeriod===d?'selected':''}>${d} days</option>`).join('')}</select></label></div></div>
 <div class="yk767-kpis">${learningKpi('Best score',formatPercent(m.best),'In selected filters')}${learningKpi('Score change',change,learningType==='all'?'Choose one exam type':m.change===null?'Needs 6 verified results':'Latest 3 vs previous 3')}</div>
 <div class="yk767-main-grid"><section class="yk767-surface yk767-trend"><div class="yk767-surface-head"><div><h4>Practice score trend</h4><p>${esc(scopeText)} · Latest ${m.chartRows.length} verified results</p></div><span class="yk767-verified-label">● VERIFIED</span></div>${learningChartV767(m.chartRows)}<p class="yk767-note">Scores are normalized to 0–100% for display. These are practice estimates, not official JLPT scaled scores.</p></section>
 </div>
 <p class="yk767-source">Source: your account's last 50 exam attempts (exam-my-activity). Older history may not appear. Unverified / legacy scores are excluded from averages and graphs. No additional free attempts are used.</p></div>`;
 $('learningExamType')?.addEventListener('change',e=>{learningType=e.target.value;paintLearningInsights(attempts)});
 $('learningPeriod')?.addEventListener('change',e=>{learningPeriod=e.target.value;paintLearningInsights(attempts)});
}
async function showMember(role){
 const student=me.student?{...me.student,access_state:"active"}:me.linkedStudent,active=!!me.student,paid=!!me.paid,admin=role==='admin';
 const needVerify=!admin&&!student;
 const access=admin?'Admin Access':active?'Unlimited Exam Access':paid?'Paid Access':me.pendingPayment?'Payment Pending':student?'Student Access Not Active':'Free Exam Access';
 const accessNote=admin?'Admin testing access':active?'During active class period':paid?'Active until '+when(me.paid.expires_at):me.pendingPayment?'Receipt submitted · Waiting for Admin review':'One free attempt per exam type';
 const account= row('Email',me.email||user.email)+(admin?'':row('Free attempts','1 per exam type · Used: '+((me.freeUsedTypes||[]).join(', ')||'none'))+row('Paid Plan',paid?'Active until '+when(me.paid.expires_at):'Not Active')+row('Payment status',me.pendingPayment?'Pending approval':'No pending request'));
 const studentProfile=student?row('Student name',student.name)+row('Student ID',student.student_code)+row('Class',student.class_name)+row('Start date',when(student.class_start))+row('Expire date',when(student.expire_date))+row('Status',active?'Active':student.access_state||'Inactive')+(!active?'<p class="notice">Student record exists, but unlimited student access is not currently active. Server access rules still apply.</p>':''):'';
 const compactProfile=student?`<div class="yk7912-profile-summary"><div><small>Class</small><strong>${esc(student.class_name||'—')}</strong></div><div><small>Student ID</small><strong>${esc(student.student_code||'—')}</strong></div><div><small>Expire date</small><strong>${esc(when(student.expire_date))}</strong></div></div>`:''; 
 const verify=needVerify?`<form id="studentForm" class="formrow"><label for="studentId">Student ID</label><input id="studentId" required autocomplete="off"><label for="studentCode">Verification Code</label><input id="studentCode" required type="password" autocomplete="off"><button class="btn primary" type="submit">Verify Student</button></form><div id="studentResult" class="status" hidden></div>`:'';
 const accessButtons=admin||active||paid?'<a class="btn primary" href="/mock-exams.html">Start Mock Exam</a>':'<a class="btn primary" href="/mock-exams.html">Exam / Buy Access</a>';
 root.innerHTML=`<section class="yk7912-access"><span class="yk7912-kicker">STUDYING WITH YE KUN</span><h2>${esc(access)}</h2><p>${esc(accessNote)}</p>${compactProfile}<div class="actions">${accessButtons}<a class="btn" href="/#study-hub">Study Hub</a>${needVerify&&!paid?'<a class="btn" href="#yk7912Account">Student Verification</a>':''}</div></section>`+
 tiles([['yk7912Results','📊','Exam Results'],['yk7912Learning','📈','Learning Progress & Exam Coach'],['yk7912Review','📘','Wrong Answers & Daily Practice'],['yk7912JLPT','📚','JLPT Progress'],['yk7912Announcements','📢','Announcements'],['yk7912Payments','💳','Payment History'],['yk7912Account','⚙','Account Settings']])+
 section('yk7912Results','Exam Results','<div id="myAttempts" class="muted">Loading…</div>')+
 section('yk7912Learning','Learning Progress & Exam Coach','<div id="yk7912ProHost"></div><details class="yk7912-subsection"><summary>Score Trends</summary><div id="myLearningOverview" class="muted">Loading…</div></details>')+
 section('yk7912Review','Wrong Answers & Daily Practice','<div id="yk7912ReviewHost"></div>')+
 section('yk7912JLPT','JLPT Progress','<div id="yk7912JLPTProgress"></div>')+
 section('yk7912Announcements','Announcements','<div id="yk7912AnnouncementHost"></div>')+
 section('yk7912Payments','Payment History','<div id="myPayments" class="muted">Loading…</div>')+
 section('yk7912Account','Account Settings',account+(studentProfile?'<h3>My Student Profile</h3>'+studentProfile:'')+(verify?'<h3>Student Verification</h3>'+verify:'')+'<div class="actions">'+(admin?'<a class="btn primary" href="/admin-dashboard.html">Admin Dashboard</a>':'')+'<a class="btn" href="/login.html">Login / Password Recovery</a><a class="btn" href="/mock-exams.html">Exam Center</a></div>');
 if(needVerify)$('studentForm').addEventListener('submit',verifyStudent);
 await showActivity();
}

async function verifyStudent(ev){ev.preventDefault();const b=$('studentForm').querySelector('button'),m=$('studentResult');m.hidden=false;m.className='status';m.textContent='Checking YKCR Student ID…';b.disabled=true;try{await api('exam-student-verify',{method:'POST',body:JSON.stringify({studentCode:$('studentId').value.trim(),verificationCode:$('studentCode').value.trim()})});m.textContent='Student verified. Opening Student Dashboard…';go('/student-dashboard.html')}catch(e){m.className='status error';m.textContent=e.message}finally{b.disabled=false}}
async function showActivity(){try{const shared=api('exam-my-activity');window.YKDashboardActivityPromiseV7863=shared;activity=await shared;const xs=activity.attempts||[];$('myAttempts').innerHTML=xs.length?`<div class="tablewrap"><table class="records-table"><thead><tr><th>Exam</th><th>Status</th><th>Score (practice)</th><th>Server Check</th><th>Date</th></tr></thead><tbody>${xs.map(x=>`<tr><td>${esc(x.exam_type)}</td><td>${esc(x.status)}</td><td>${x.score==null?'—':esc(x.score)}</td><td>${x.score==null?'—':x.score_verified?'✓ Recalculated':'Unverified (legacy)'}</td><td>${when(x.submitted_at||x.started_at)}</td></tr>`).join('')}</tbody></table></div>`:'No exam attempts yet.';const ps=activity.payments||[];$('myPayments').innerHTML=ps.length?ps.map(p=>`<article class="record"><div class="record-title"><b>#${Number(p.id)} · ${money(p.amount_yen)} · ${esc(p.plan_code)}</b>${badge(p.status)}</div><small>${when(p.submitted_at)}${p.admin_note?' · '+esc(p.admin_note):''}</small></article>`).join(''):'No payment requests yet.';paintLearningInsights(xs)}catch(e){$('myAttempts').textContent='Could not load history: '+e.message;$('myPayments').textContent='Could not load payment history.';if($('myLearningOverview'))$('myLearningOverview').textContent='Could not load learning overview.'}}
init();
})();
