/* STUDYING WITH YE KUN v7.87.7 — Admin-only, additive Business Growth dashboard.
 * Existing admin/student/member, YKCR, free-exam and paid access remain owners.
 * Anonymous clicks != inquiries; manually entered class sales != exam payments.
 */
(()=>{'use strict';
 if(document.body?.dataset.dashboard!=='admin')return;
 const root=document.getElementById('dashboardBody');if(!root)return;
 const $=id=>document.getElementById(id);
 const ask=english=>window.confirm(window.YKUiLanguageV78712?.t(english)||english);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeNum=v=>Number.isFinite(Number(v))?Number(v):0;
 const fmt=v=>safeNum(v).toLocaleString('ja-JP');
 const yen=v=>'¥'+safeNum(v).toLocaleString('ja-JP');
 const today=()=>{const d=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const x=Object.fromEntries(d.filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,x.value]));return x.year+'-'+x.month+'-'+x.day};
 const langs={
  my:{head:'Business Growth & Marketing',sub:'သင်တန်းအပ်နှံမှုနဲ့ Marketing ရလဒ်ကို သီးခြားတိုင်းတာရန်',visitors:'Website Visitors',clicks:'Class CTA Clicks',inquiries:'Confirmed Inquiries',enrollments:'Class Enrollments',revenue:'Class Revenue',expense:'Recorded Marketing Cost',after:'After Recorded Marketing',source:'Source',course:'Course',entry:'စာရင်းအသစ်ထည့်ရန်',create:'Save Entry',builder:'Campaign Link Builder',funnel:'Enrollment Journey',notes:'စာရင်းမှတ်ချက်',noVisitor:'Not measured',date:'Date',type:'Entry Type',amount:'Amount (¥)',units:'Count',campaign:'Campaign',copy:'Copy Link',generate:'Generate Link',ref:'မူလစာရင်းမှာ အမှန်တကယ်အတည်ပြုထားသည့် အချက်အလက်များကိုသာ ထည့်ပါ။',manual:'Admin က ကိုယ်တိုင်ထည့်ထားတဲ့ စာရင်း',examples:'FB/YouTube Campaign Link ကို ဖြန့်ဝေသုံးနိုင်သည်။',refresh:'Refresh',noData:'No records yet'},
  en:{head:'Business Growth & Marketing',sub:'Separate class enquiries, enrollment and marketing measures',visitors:'Website Visitors',clicks:'Class CTA Clicks',inquiries:'Confirmed Inquiries',enrollments:'Class Enrollments',revenue:'Class Revenue',expense:'Recorded Marketing Cost',after:'After Recorded Marketing',source:'Source',course:'Course',entry:'Add Verified Manual Record',create:'Save Entry',builder:'Campaign Link Builder',funnel:'Enrollment Journey',notes:'Data quality notes',noVisitor:'Not measured',date:'Date',type:'Record Type',amount:'Amount (¥)',units:'Count',campaign:'Campaign',copy:'Copy Link',generate:'Generate Link',ref:'Enter only records you have checked in your own business ledger.',manual:'Owner-entered totals only',examples:'Share generated campaign links on Facebook or YouTube.',refresh:'Refresh',noData:'No records yet'},
  ja:{head:'事業成長・マーケティング分析',sub:'受講相談・入会・広告実績を別々に管理',visitors:'サイト訪問者数',clicks:'お問い合わせリンククリック',inquiries:'確認済みの問い合わせ',enrollments:'受講申込件数',revenue:'講座売上（手入力）',expense:'登録した広告費',after:'売上－登録広告費',source:'流入元',course:'講座',entry:'確認済みの記録を登録',create:'記録を保存',builder:'キャンペーンリンク作成',funnel:'申込までの流れ',notes:'データの注意点',noVisitor:'未計測',date:'日付',type:'記録種類',amount:'金額（円）',units:'件数',campaign:'キャンペーン',copy:'リンクをコピー',generate:'リンクを作成',ref:'実際に確認した受講実績だけを登録してください。',manual:'管理者の手入力記録',examples:'Facebook・YouTube投稿でリンクを利用できます。',refresh:'更新',noData:'データなし'}
 };
 const i18n=()=>langs[window.YKDashboardLanguageV759?.getLanguage?.()]||langs.my;
 const courseNames={truck:'TRUCK',taxi:'TAXI',bus:'BUS',general:'GENERAL'};
 const options=(map,selected)=>Object.entries(map).map(([v,k])=>`<option value="${esc(v)}" ${selected===v?'selected':''}>${esc(k)}</option>`).join('');
 const typeNames={'confirmed_inquiries':'Confirmed class inquiry / 受講相談','enrollment_revenue':'Confirmed class enrollment + revenue / 受講申込','marketing_expense':'Marketing expense / 広告費'};
 const sources={'facebook':'Facebook','youtube':'YouTube','google':'Google','direct':'Direct','other':'Other'};
 let period='30',data=null,busy=false,inflight=0,lastLink='';
 const API='/.netlify/functions/yk-business-growth';
 function mount(){
  if($('yk877Growth')||!($('yk84Admin')||$('adminStats')))return false;
  root.insertAdjacentHTML('afterbegin',`<section class="yk877-growth" id="yk877Growth" aria-label="STUDYING WITH YE KUN Business Growth" aria-live="polite">
    <div class="yk877-head"><div><div class="yk877-kicker">STUDYING WITH YE KUN · OWNER ONLY</div><h2 id="yk877Title"></h2><p class="yk877-sub" id="yk877Subtitle"></p></div>
    <div class="yk877-controls"><select id="yk877Period" aria-label="Period"><option value="7">7 days</option><option value="30" selected>30 days</option><option value="90">90 days</option></select><button type="button" id="yk877Refresh"></button></div></div>
    <div id="yk877Summary" role="status">Loading business metrics…</div>
    <div class="yk877-sections"><article class="yk877-block" id="yk877Funnel"></article><article class="yk877-block" id="yk877Attribution"></article></div>
    <div class="yk877-sections"><article class="yk877-block" id="yk877Bookkeeping"></article><article class="yk877-block" id="yk877Campaign"></article></div>
    <p id="yk877Messages" class="yk877-message" role="status" aria-live="polite"></p><p class="yk877-note" id="yk877Caveat"></p>
    </section>`);
  $('yk877Period').addEventListener('change',e=>{period=e.target.value;void load()});
  $('yk877Refresh').addEventListener('click',()=>void load());
  const lang=$('ykCurrentLanguage');if(lang){new MutationObserver(()=>{render();}).observe(lang,{childList:true,characterData:true,subtree:true});}
  render();void load();return true;
 }
 if(!mount()){
  const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});
  observer.observe(root,{childList:true,subtree:true});
 }
 async function load(){const num=++inflight;const output=$('yk877Summary');if(output)output.textContent='Loading…';
  try{const r=await fetch(API+'?days='+encodeURIComponent(period),{credentials:'same-origin',cache:'no-store'});
   const value=await r.json().catch(()=>({}));if(!r.ok)throw new Error(value.error||'Admin analytics unavailable ('+r.status+')');
   if(num!==inflight)return;data=value;render();setMessage('');
  }catch(e){if(num!==inflight)return;data=null;render();setMessage(e.message||'Could not connect',true)}
 }
 const metric=(label,value,detail)=>`<div class="yk877-metric"><small>${esc(label)}</small><strong>${esc(value)}</strong><span>${esc(detail)}</span></div>`;
 function render(){if(!$('yk877Growth'))return;const L=i18n();
  $('yk877Title').textContent=L.head;$('yk877Subtitle').textContent=L.sub;$('yk877Refresh').textContent='↻ '+L.refresh;
  const a=data?.manual||{},c=data?.clicks||{},s=data?.students||{};
  $('yk877Summary').innerHTML=`<div class="yk877-metrics">
   ${metric(L.visitors,L.noVisitor,'No page-view tracking')}
   ${metric(L.clicks,data?fmt(c.total):'—','Non-unique · anonymous · not an inquiry')}
   ${metric(L.inquiries,data?fmt(a.inquiries):'—',L.manual)}
   ${metric(L.enrollments,data?fmt(a.enrollments):'—','Manual · not attributed automatically')}
   ${metric(L.revenue,data?yen(a.revenueYen):'—','Class enrollment only')}
   ${metric(L.expense,data?yen(a.marketingExpenseYen):'—','Recorded marketing expenses only')}
   ${metric(L.after,data?yen(a.afterRecordedMarketingYen):'—','Not net profit; other expenses excluded')}
   ${metric('Student Records (YKCR/CSV)',data?fmt(s.active):'—',data?`${fmt(s.total)} total · not campaign-attributed`:'Not loaded')}
  </div>`;
  $('yk877Funnel').innerHTML=`<h3>${esc(L.funnel)}</h3><div class="yk877-steps">
    <div class="yk877-step"><span>${esc(L.visitors)}<br><em>Not collected; no cohort conversion rate</em></span><b>—</b></div>
    <div class="yk877-step"><span>${esc(L.clicks)}<br><em>Website → Facebook button only</em></span><b>${data?fmt(c.total):'—'}</b></div>
    <div class="yk877-step"><span>${esc(L.inquiries)}<br><em>Manual confirmed inquiry count</em></span><b>${data?fmt(a.inquiries):'—'}</b></div>
    <div class="yk877-step"><span>${esc(L.enrollments)}<br><em>Manually entered class enrollment</em></span><b>${data?fmt(a.enrollments):'—'}</b></div>
   </div><p class="yk877-note">Different datasets/cohorts. Conversion rate: not available.</p>`;
  const rows=Array.isArray(c.rows)?c.rows:[];
  const manualSources=(Array.isArray(a.rows)?a.rows:[]).filter(x=>x.kind==='enrollment_revenue');
  $('yk877Attribution').innerHTML=`<h3>Marketing ${esc(L.source)} · UTM</h3>`+(rows.length?`<table class="yk877-table"><thead><tr><th>${esc(L.source)}</th><th>${esc(L.course)}</th><th>Clicks</th></tr></thead><tbody>${rows.slice(0,12).map(x=>`<tr><td>${esc(x.source)}</td><td>${esc(courseNames[x.course]||x.course)}</td><td>${fmt(x.clicks)}</td></tr>`).join('')}</tbody></table>`:`<p class="yk877-empty">${esc(L.noData)} · tracked clicks start after deploy.</p>`)+
    `<h3 style="margin-top:16px">Manual Enrollment by Source</h3>`+(manualSources.length?
     `<table class="yk877-table"><thead><tr><th>${esc(L.source)}</th><th>${esc(L.course)}</th><th>Count</th><th>Revenue</th></tr></thead><tbody>${manualSources.slice(0,10).map(x=>`<tr><td>${esc(x.source)}</td><td>${esc(courseNames[x.course]||x.course)}</td><td>${fmt(x.units)}</td><td>${yen(x.amountYen)}</td></tr>`).join('')}</tbody></table>`:
     `<p class="yk877-empty">${esc(L.noData)} · ${esc(L.manual)}</p>`);
  $('yk877Caveat').textContent='Source: anonymous CTA clicks + admin-entered business records. '+
    'Exam-plan payment approvals ('+(data?fmt(data.examAccessPayments?.approvedCount):'—')+') are separate from class revenue. '+
    'Visitor count/unique users not tracked. No class net-profit figure claimed.';
  buildBookkeeping();buildCampaign();
 }
 function buildBookkeeping(){const L=i18n(),el=$('yk877Bookkeeping');if(!el)return;
  const recent=Array.isArray(data?.manual?.recent)?data.manual.recent:[];
  el.innerHTML=`<h3>${esc(L.entry)}</h3><p class="yk877-note">${esc(L.ref)}</p>
   <form class="yk877-form" id="yk877EntryForm">
     <label>${esc(L.type)}<select name="entryType">${options(typeNames,'confirmed_inquiries')}</select></label>
     <label>${esc(L.course)}<select name="course">${options(courseNames,'truck')}</select></label>
     <label>${esc(L.source)}<select name="source">${options(sources,'facebook')}</select></label>
     <label>${esc(L.date)}<input type="date" name="entryDay" required value="${today()}"></label>
     <label>${esc(L.units)}<input type="number" name="units" min="1" max="100" value="1" required></label>
     <label>${esc(L.amount)}<input type="number" name="amountYen" min="0" max="100000000" step="1" value="0" required></label>
     <div class="yk877-actions"><button class="primary" type="submit" id="yk877Save">${esc(L.create)}</button><span class="yk877-note">Manual · Admin only</span></div>
   </form>
   <h3>Recent Manual Records</h3>`+(recent.length?`<table class="yk877-table"><thead><tr><th>Date</th><th>Type</th><th>Value</th><th></th></tr></thead><tbody>${recent.slice(0,8).map(x=>`<tr><td>${esc(x.day)}</td><td>${esc(x.kind)} · ${esc(x.course)}</td><td>${x.kind==='confirmed_inquiries'?fmt(x.units):yen(x.amountYen)}</td><td><button type="button" data-yk877-delete="${Number(x.id)}" aria-label="Delete record ${Number(x.id)}">×</button></td></tr>`).join('')}</tbody></table>`:`<p class="yk877-empty">${esc(L.noData)}</p>`);
  const form=$('yk877EntryForm');form.addEventListener('submit',save);
  form.elements.entryType.addEventListener('change',()=>{
    const kind=form.elements.entryType.value;
    form.elements.units.value='1';form.elements.units.disabled=kind!=='confirmed_inquiries';
    form.elements.amountYen.value='0';form.elements.amountYen.disabled=kind==='confirmed_inquiries';
  });form.elements.amountYen.disabled=true;
  el.querySelectorAll('[data-yk877-delete]').forEach(btn=>btn.addEventListener('click',()=>void deleteEntry(Number(btn.dataset.yk877Delete))));
 }
 async function save(event){event.preventDefault();if(busy)return;
  const f=event.currentTarget,kind=f.elements.entryType.value;
  const payload={entryType:kind,course:f.elements.course.value,source:f.elements.source.value,entryDay:f.elements.entryDay.value,
   units:kind==='confirmed_inquiries'?Number(f.elements.units.value):1,
   amountYen:kind==='confirmed_inquiries'?0:Number(f.elements.amountYen.value)};
  if(!['confirmed_inquiries','enrollment_revenue','marketing_expense'].includes(kind))return;
  if(kind==='marketing_expense'&&payload.amountYen<=0){setMessage('Marketing expense must be greater than zero.',true);return;}
  if(!ask('Save this owner-confirmed business record?'))return;
  busy=true;const b=$('yk877Save');if(b)b.disabled=true;
  try{const res=await fetch(API,{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error(body.error||'Could not save');await load();setMessage('Business record saved ✓');
  }catch(e){setMessage(e.message||'Save failed',true)}finally{busy=false;const b=$('yk877Save');if(b)b.disabled=false;}
 }
 async function deleteEntry(id){if(busy||!Number.isSafeInteger(id)||id<=0)return;
  if(!ask('Delete this manual business entry? This cannot be undone.'))return;
  busy=true;try{const res=await fetch(API,{method:'DELETE',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
    const body=await res.json().catch(()=>({}));if(!res.ok||!body.ok)throw new Error(body.error||'Delete failed');await load();setMessage('Manual record deleted ✓');
  }catch(e){setMessage(e.message||'Delete failed',true)}finally{busy=false;}
 }
 function buildCampaign(){const L=i18n(),el=$('yk877Campaign');if(!el)return;
   el.innerHTML=`<h3>${esc(L.builder)}</h3><p class="yk877-note">${esc(L.examples)}</p>
     <div class="yk877-form">
       <label>${esc(L.course)}<select id="yk877CampCourse">${options({truck:'TRUCK',taxi:'TAXI',bus:'BUS'},'truck')}</select></label>
       <label>${esc(L.source)}<select id="yk877CampSource">${options(sources,'facebook')}</select></label>
       <label>${esc(L.campaign)}<input id="yk877CampName" value="class_2026" maxlength="64" pattern="[a-zA-Z0-9_-]+" aria-label="Campaign slug"></label>
       <div class="yk877-actions"><button id="yk877Generate" type="button" class="primary">${esc(L.generate)}</button><button id="yk877Copy" type="button" disabled>${esc(L.copy)}</button></div>
     </div><div class="yk877-campaign-link" id="yk877Generated" aria-live="polite"></div>
     <p class="yk877-note">UTM is kept for this browser session only. No automatic page-view tracking. Data contains no personal identifiers.</p>`;
   $('yk877Generate').addEventListener('click',()=>{
     const course=$('yk877CampCourse').value,source=$('yk877CampSource').value,slug=$('yk877CampName').value;
     if(!/^[a-zA-Z0-9_-]{1,64}$/.test(slug)){setMessage('Campaign should use letters, numbers, _ or - only.',true);return;}
     const medium=source==='google'?'search':source==='direct'?'direct':'social';
     const u=new URL('/study/ssw-'+course+'.html','https://yekun-mryethemenstyle.netlify.app');
     u.searchParams.set('utm_source',source);u.searchParams.set('utm_medium',medium);u.searchParams.set('utm_campaign',slug.toLowerCase());
     lastLink=u.toString();$('yk877Generated').textContent=lastLink;$('yk877Copy').disabled=false;
   });
   $('yk877Copy').addEventListener('click',async()=>{
     if(!lastLink)return;
     try{await navigator.clipboard.writeText(lastLink);setMessage('Campaign link copied ✓')}catch{setMessage('Copy unavailable. Select the shown link manually.',true)}
   });
 }
 function setMessage(s,error=false){const el=$('yk877Messages');if(!el)return;el.textContent=s;el.classList.toggle('error',error)}
})();
