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
async function init(){
 try{
  id=await identity();user=await id.getUser();if(!user){go('/login.html?return='+encodeURIComponent(location.pathname));return}
  me=await api('exam-status');const role=currentRole();
  if(kind!==role){go(targets[role]);return}
  $('rolePill').textContent=role==='admin'?'👑 Admin Access':role==='student'?(me.student?'✅ Student Verified':'⚠ Student Record Linked · Not Active'):'👤 Member Access';
  if(role==='admin')await showAdmin();else await showMember(role);
  status('');
 }catch(e){status('Dashboard error: '+e.message,true);root.innerHTML='<div class="actions"><button class="btn" id="retryDash">↻ Retry</button><a class="btn" href="/#home">Homepage</a></div>';$('retryDash').onclick=()=>location.reload()}
}
$('dashLogout')?.addEventListener('click',async()=>{try{await (id||await identity()).logout();window.location.replace('/#home')}catch(e){status('Logout failed: '+e.message,true)}});
let selectedFilter='all',payments=[];
async function showAdmin(){
 root.innerHTML='<div id="adminStats"></div><div class="grid">'+
 panel('🎓 Student Management · YKCR Sync',`<p class="muted">ရှိပြီးသား Student Records နဲ့ YKCR Sync ကိုပဲ အသုံးပြုပါတယ်။ New Student Database မတည်ဆောက်ပါဘူး။</p><form id="csvForm" class="formrow"><label for="csvFile">Student CSV Import</label><input type="file" id="csvFile" accept=".csv,text/csv" required><button class="btn primary" type="submit">Import Students</button></form><p class="notice">CSV ထဲမှာ Student ID နဲ့ Verification Code ပါရင် မူလအချက်အလက်ကို အသုံးပြုပါမယ်။ Import မလုပ်ခင် CSV မှန်ကန်ကြောင်း စစ်ပါ။</p><div id="csvResult" class="status" hidden></div><div id="csvCredentials"></div>`)+
 panel('💳 Payment Management',`<p class="muted">Receipt Review · Approve · Reject · Delete · Refresh</p><div class="filters"><label for="paymentFilter">Status</label><select id="paymentFilter"><option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><button id="refreshPayments" class="btn sm" type="button">↻ Refresh</button></div><div id="paymentList" aria-live="polite"><p class="muted">Loading…</p></div>`)+
 panel('📈 Exam & Student Overview','<div id="adminOverviewMore" class="muted">Loading overview…</div>','wide')+'</div>';
 $('paymentFilter').addEventListener('change',e=>{selectedFilter=e.target.value;paintPayments()});
 $('refreshPayments').addEventListener('click',loadPayments);
 $('csvForm').addEventListener('submit',importCsv);
 $('paymentList').addEventListener('click',paymentAction);
 await Promise.all([loadAdminStats(),loadPayments()]);
}
async function loadAdminStats(){try{const x=await api('exam-admin-overview');$('adminStats').innerHTML=cards([['Student records',x.students?.total],['Active students',x.students?.active],['Submitted exams',x.attempts?.submitted],['Pending payments',x.payments?.pending]]);$('adminOverviewMore').innerHTML=`<div class="stats">${[['Exam attempts',x.attempts?.total],['Approved payments',x.payments?.approved],['Rejected payments',x.payments?.rejected],['YKCR sync events',x.ykcr?.received]].map(v=>`<div class="stat"><span>${esc(v[0])}</span><b>${esc(v[1]??0)}</b></div>`).join('')}</div><p class="muted">Source: existing exam_students / exam_attempts / exam_payment_requests / ykcr_sync_events tables.</p>`}catch(e){$('adminStats').innerHTML=`<div class="status error">${esc(e.message)}</div>`;$('adminOverviewMore').textContent='Overview not available.'}}
async function importCsv(ev){ev.preventDefault();const f=$('csvFile').files?.[0],el=$('csvResult'),out=$('csvCredentials');if(!f)return;const button=$('csvForm').querySelector('button');button.disabled=true;el.hidden=false;el.className='status';el.textContent='Importing…';out.innerHTML='';try{if(f.size>1500000)throw new Error('CSV file too large.');const form=new FormData();form.append('file',f);const x=await api('exam-admin-import-students',{method:'POST',body:form});el.textContent=`Imported ${x.imported||0} students into existing student records.`;const created=(x.credentials||[]).filter(y=>y.verificationCode);if(created.length){out.innerHTML='<p class="muted">New/provided verification codes (admin-only; do not share publicly):</p><div class="tablewrap"><table class="records-table"><thead><tr><th>Student ID</th><th>Name</th><th>Verification Code</th></tr></thead><tbody>'+created.slice(0,200).map(y=>`<tr><td>${esc(y.studentCode)}</td><td>${esc(y.name)}</td><td>${esc(y.verificationCode)}</td></tr>`).join('')+'</tbody></table></div>'}await loadAdminStats()}catch(e){el.className='status error';el.textContent=e.message}finally{button.disabled=false}}
async function loadPayments(){const box=$('paymentList');box.innerHTML='<p class="muted">Loading Payment Requests…</p>';try{const data=await api('exam-admin-payments');payments=data.payments||[];paintPayments();await loadAdminStats()}catch(e){box.innerHTML=`<p class="status error">${esc(e.message)}</p>`}}
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
async function showMember(role){
 const student=me.linkedStudent,active=!!me.student;
 const needVerify=role==='member'&&!student;
 const body=role==='student'?`${cards([['Student verification',active?'Active':student?.access_state||'Inactive'],['Exam access',active?'Unlimited':'See access status'],['Class expires',student?.expire_date?when(student.expire_date):'—'],['Free exam used',me.freeUsed?'Yes':'No']])}<div class="grid">`+
 panel('🎓 My Student Profile',row('Student name',student?.name)+row('Student ID',student?.student_code)+row('Class',student?.class_name)+row('Start date',when(student?.class_start))+row('Expire date',when(student?.expire_date))+row('Status',student?.access_state||'—')+(!active?'<p class="notice">Student record exists, but unlimited access is not currently active. Server access rules still apply.</p>':''))+
 panel('📚 My Exams & Training Access',`<p class="muted">YKCR Student Data နဲ့ချိတ်ထားပါတယ်။ သင်တန်းသက်တမ်းအတွင်း Mock Exams ကို Unlimited ဖြေနိုင်ပါတယ်။</p><div class="actions"><a class="btn primary" href="/#online-mock-exam">Start Mock Exam</a><a class="btn" href="/#study-hub">Study Hub</a></div><div class="notice">Training Access Card နဲ့ Verification Code အပြည့်အစုံကို Public Dashboard မှာ မပြပါဘူး။</div>`):
 `${cards([['Account','Member'],['Free exam',me.freeUsed?'Used':'1 available'],['Paid access',me.paid?'Active':'Not active'],['Plan expires',me.paid?when(me.paid.expires_at):'—']])}<div class="grid">`+
 panel('👤 My Account & Exam Access',row('Email',me.email||user.email)+row('Free attempt',me.freeUsed?'Already used':'Available (one per account)')+row('Paid Plan',me.paid?'Active until '+when(me.paid.expires_at):'Not Active')+row('Payment status',me.pendingPayment?'Pending approval':'No pending request')+`<div class="actions"><a class="btn primary" href="/#online-mock-exam">Exam / Buy Access</a><a class="btn" href="/login.html">Account Settings</a></div>`)+
 panel('✅ Verify as Student',`<p class="muted">YKCR မှာ စာရင်းရှိတဲ့ Student တွေက ရှိပြီးသား Student ID နဲ့ Verification Code ကို အသုံးပြုနိုင်ပါတယ်။</p><form id="studentForm" class="formrow"><label for="studentId">Student ID</label><input id="studentId" required autocomplete="off"><label for="studentCode">Verification Code</label><input id="studentCode" required type="password" autocomplete="off"><button class="btn primary" type="submit">Verify Student</button></form><div id="studentResult" class="status" hidden></div>`);
 root.innerHTML=body+panel('📊 My Exam History','<div id="myAttempts" class="muted">Loading…</div>','wide')+panel('💳 My Payment History','<div id="myPayments" class="muted">Loading…</div>','wide')+'</div>';
 if(needVerify)$('studentForm').addEventListener('submit',verifyStudent);
 await showActivity();
}
async function verifyStudent(ev){ev.preventDefault();const b=$('studentForm').querySelector('button'),m=$('studentResult');m.hidden=false;m.className='status';m.textContent='Checking YKCR Student ID…';b.disabled=true;try{await api('exam-student-verify',{method:'POST',body:JSON.stringify({studentCode:$('studentId').value.trim(),verificationCode:$('studentCode').value.trim()})});m.textContent='Student verified. Opening Student Dashboard…';go('/student-dashboard.html')}catch(e){m.className='status error';m.textContent=e.message}finally{b.disabled=false}}
async function showActivity(){try{activity=await api('exam-my-activity');const xs=activity.attempts||[];$('myAttempts').innerHTML=xs.length?`<div class="tablewrap"><table class="records-table"><thead><tr><th>Exam</th><th>Status</th><th>Score (practice)</th><th>Date</th></tr></thead><tbody>${xs.map(x=>`<tr><td>${esc(x.exam_type)}</td><td>${esc(x.status)}</td><td>${x.score==null?'—':esc(x.score)}</td><td>${when(x.submitted_at||x.started_at)}</td></tr>`).join('')}</tbody></table></div>`:'No exam attempts yet.';const ps=activity.payments||[];$('myPayments').innerHTML=ps.length?ps.map(p=>`<article class="record"><div class="record-title"><b>#${Number(p.id)} · ${money(p.amount_yen)} · ${esc(p.plan_code)}</b>${badge(p.status)}</div><small>${when(p.submitted_at)}${p.admin_note?' · '+esc(p.admin_note):''}</small></article>`).join(''):'No payment requests yet.'}catch(e){$('myAttempts').textContent='Could not load history: '+e.message;$('myPayments').textContent='Could not load payment history.'}}
init();
})();
