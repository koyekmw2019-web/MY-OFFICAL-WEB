/* v7.87.8: admin-only CRM, preserved announcement publishing, and management nav.
 * CRM fetches ONLY when an admin opens its panel; no public visitor tracking.
 * Student/Member dashboards never mount this. Does not modify YKCR/Identity/exams.
 */
(()=>{'use strict';
 if(document.body?.dataset.dashboard!=='admin')return;
 const host=document.getElementById('dashboardBody');if(!host)return;
 const $=id=>document.getElementById(id);
 const ask=english=>window.confirm(window.YKUiLanguageV78712?.t(english)||english);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const courses={truck:'🚚 TRUCK',taxi:'🚕 TAXI',bus:'🚌 BUS',general:'General'};
 const statuses={new:'New',contacted:'Contacted',interested:'Interested',enrolled:'Enrolled',closed:'Closed'};
 const sources={facebook:'Facebook',youtube:'YouTube',google:'Google',website:'Website',referral:'Referral',manual:'Manual',other:'Other'};
 const channels={messenger:'Facebook Messenger',email:'Email',phone:'Phone',other:'Other'};
 const opt=(values,selected)=>Object.entries(values).map(([v,k])=>`<option value="${esc(v)}" ${v===selected?'selected':''}>${esc(k)}</option>`).join('');
 const api='/.netlify/functions/yk-enrollment-crm';
 const announcementApi='/.netlify/functions/yk-announcement-admin';
 const filterLabels={
  my:{status:'အခြေအနေ',course:'သင်တန်း',source:'စုံစမ်းလာသည့်နေရာ',search:'ရှာရန်',due:'ဒီနေ့ / နောက်ကျ Follow-up',clear:'Filter ရှင်းရန်',placeholder:'အမည် / ဆက်သွယ်ရန် (နောက်ဆုံး ၁၀၀)',latest:'နောက်ဆုံး CRM စာရင်း'},
  en:{status:'Status',course:'Course',source:'Source',search:'Search',due:'Due today / overdue',clear:'Clear filters',placeholder:'Name / contact (latest 100)',latest:'latest CRM leads'},
  ja:{status:'状態',course:'講座',source:'流入元',search:'検索',due:'本日 / 期限超過のフォロー',clear:'条件を解除',placeholder:'氏名 / 連絡先（最新100件）',latest:'最新CRM記録'}
 };
 const filterLanguage=()=>filterLabels[window.YKDashboardLanguageV759?.getLanguage?.()||'my']||filterLabels.my;
 function localizeFilters(){const words=filterLanguage();
  for(const [id,key] of [['yk878Filter','status'],['yk878CourseFilter','course'],['yk878SourceFilter','source'],['yk878Search','search']]){
   const label=document.querySelector('label[for="'+id+'"]');if(label)label.textContent=words[key];
  }
  const due=document.querySelector('.yk878-due-check');if(due){const input=due.querySelector('input');
   if(input)due.replaceChildren(input,document.createTextNode(words.due));}
  if($('yk878ResetFilters'))$('yk878ResetFilters').textContent=words.clear;
  if($('yk878Search'))$('yk878Search').placeholder=words.placeholder;
 }

 let crmLoaded=false,crmData=null,crmBusy=false,filter='all',editId=null,annLoaded=false,annBusy=false;
 let courseFilter='all',sourceFilter='all',dueOnly=false,searchTerm=''; // latest-100 displayed list filters only
 const msg=(id,text,error=false)=>{const el=$(id);if(el){el.textContent=text||'';el.classList.toggle('error',!!error);}};
 async function json(url,init={}){const r=await fetch(url,{credentials:'same-origin',cache:'no-store',...init});const body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.error||`Request failed (${r.status})`);return body;}
 function mount(){
  // Only mount after the authenticated Admin Dashboard has rendered.
  if($('yk878Shell')||!host.querySelector('#adminStats'))return false;
  host.insertAdjacentHTML('afterbegin',`<div class="yk878-shell" id="yk878Shell">
   <nav class="yk878-nav" aria-label="Admin management shortcuts">
     <a href="#adminStats">Overview</a><a href="#yk84Admin">Exam Analytics</a>
     <a href="#paymentList">Payments</a><a href="#yk877Growth">Business Growth</a>
     <a href="#yk878CRM">Enrollment CRM</a><a href="#yk878Announcements">Announcements</a>
   </nav>
   <details class="yk878-admin" id="yk878CRM"><summary>👥 Enrollment CRM · စုံစမ်းသူ စီမံခန့်ခွဲမှု</summary>
     <p class="yk878-meta">Admin-only manual prospects. Messenger inquiries are NOT imported automatically. CRM enrollments are separate from manually entered Business Growth revenue; no duplicate sales or YKCR students are created.</p>
     <div id="yk878CRMContent" aria-live="polite"><p>Open this panel to load leads.</p></div>
   </details>
   <details class="yk878-admin" id="yk878Announcements"><summary>📢 Announcement Management · ကြေညာချက်ထုတ်ရန်</summary>
     <p class="yk878-meta">Admin-only announcements. Existing announcement API is reused; Student/Member learning tools remain unchanged.</p>
     <div id="yk878AnnouncementContent" aria-live="polite"><p>Open to manage announcements.</p></div>
   </details></div>`);
  $('yk878CRM').addEventListener('toggle',()=>{if($('yk878CRM').open&&!crmLoaded){crmLoaded=true;void loadCRM();}});
  $('yk878Announcements').addEventListener('toggle',()=>{if($('yk878Announcements').open&&!annLoaded){annLoaded=true;void loadAnnouncements();}});
  const lang=$('ykCurrentLanguage');if(lang){new MutationObserver(localizeFilters).observe(lang,{childList:true,characterData:true,subtree:true});}
  $('yk878CRM').addEventListener('click',event=>{
   const edit=event.target.closest('[data-yk878-edit]'),del=event.target.closest('[data-yk878-delete]');
   if(edit)chooseEdit(Number(edit.dataset.yk878Edit));
   else if(del)void deleteLead(Number(del.dataset.yk878Delete));
  });
  // The existing admin analytics include useful aggregate JLPT metrics.
  // Keep them but collapse student-wide daily practice graph under a labelled group.
  const analytics=$('yk84AdminBody');if(analytics){
    let queued=false;const place=()=>{queued=false;const graph=[...analytics.querySelectorAll('.yk84-surface')]
      .find(x=>x.querySelector('h3')?.textContent.trim()==='Learning Progress Graph');
      if(!graph||graph.closest('#yk878EducationAnalytics'))return;
      const panel=document.createElement('details');panel.id='yk878EducationAnalytics';
      panel.innerHTML='<summary>JLPT Student Activity Analytics · Aggregated, not personal progress</summary>';
      graph.before(panel);panel.appendChild(graph);
    };
    new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(place);}})
      .observe(analytics,{childList:true,subtree:true});place();
  }
  host.querySelectorAll('.yk878-nav a[href="#yk878CRM"],.yk878-nav a[href="#yk878Announcements"]').forEach(link=>link.addEventListener('click',()=>{
   const target=$(link.hash.slice(1));if(target)target.open=true;
  }));
  return true;
 }
 if(!mount()){
  const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});
  observer.observe(host,{childList:true});
 }
 function stats(){const a=crmData?.summary?.counts||{},due=Number(crmData?.summary?.due)||0;
  return '<div class="yk878-kpis">'+[
   ['New',a.new],['Contacted',a.contacted],['Interested',a.interested],['Enrolled',a.enrolled],['Follow-ups due',due]
  ].map(([name,n])=>`<div class="yk878-kpi"><small>${esc(name)}</small><strong>${crmData?Number(n||0):'—'}</strong></div>`).join('')+'</div>';
 }
 async function loadCRM(){if(crmBusy)return;crmBusy=true;const content=$('yk878CRMContent');if(content)content.textContent='Loading CRM…';
  try{crmData=await json(api);paintCRM();msg('yk878CRMMessage','');}
  catch(e){crmData=null;if(content)content.innerHTML='<p class="yk878-meta">CRM unavailable. Check v7.87.8 migration, admin permissions and Netlify Function logs.</p><button type="button" id="yk878RetryCRM">Retry</button>';
   $('yk878RetryCRM')?.addEventListener('click',()=>void loadCRM());}
  finally{crmBusy=false;}
 }
 function formMarkup(){return `<form class="yk878-grid" id="yk878LeadForm">
    <label>Name / အမည်<input name="name" maxlength="120" autocomplete="off" required></label>
    <label>Contact channel<select name="channel">${opt(channels,'messenger')}</select></label>
    <label>Contact / Messenger reference<input name="contact" maxlength="180" autocomplete="off" required></label>
    <label>Class / သင်တန်း<select name="course">${opt(courses,'truck')}</select></label>
    <label>Source<select name="source">${opt(sources,'facebook')}</select></label>
    <label>Status<select name="status">${opt(statuses,'new')}</select></label>
    <label>Follow-up date<input name="followUpDate" type="date"></label>
    <label>Existing YKCR student ID (optional, unverified reference)<input name="studentCode" maxlength="80" pattern="[A-Za-z0-9_-]*" autocomplete="off"></label>
    <label class="yk878-full">Notes / မှတ်ချက်<textarea name="notes" rows="2" maxlength="1000"></textarea></label>
    <div class="yk878-full yk878-toolbar"><button class="yk878-main" type="submit" id="yk878Save">Save Lead</button><button type="button" id="yk878Clear">Clear / New</button>
      <span class="yk878-meta" id="yk878FormMode">New inquiry</span></div>
   </form>`;}
 function paintCRM(){const root=$('yk878CRMContent');if(!root)return;
  const leads=Array.isArray(crmData?.leads)?crmData.leads:[];
  // Filters are client-side ONLY over the latest 100. Never present as all-time CRM search.
  root.innerHTML=stats()+`<p class="yk878-meta">All-time summary above · List below: latest 100 updated leads only. Filters and search apply to these 100 rows only. The Insights panel shows all-time course/source counts and due follow-ups. No inferred campaign conversion.</p>
   <div class="yk878-toolbar"><label for="yk878Filter">Status</label><select id="yk878Filter"><option value="all">All</option>${opt(statuses,filter)}</select>
   <label for="yk878CourseFilter">Course</label><select id="yk878CourseFilter"><option value="all">All</option>${opt(courses,courseFilter)}</select>
   <label for="yk878SourceFilter">Source</label><select id="yk878SourceFilter"><option value="all">All</option>${opt(sources,sourceFilter)}</select>
   <label for="yk878Search">Search</label><input id="yk878Search" type="search" maxlength="100" value="${esc(searchTerm)}" placeholder="Name / contact (latest 100)" autocomplete="off">
   <label class="yk878-due-check"><input type="checkbox" id="yk878DueOnly" ${dueOnly?'checked':''}>Due today / overdue</label>
   <button type="button" id="yk878ResetFilters">Clear filters</button>
   <button type="button" id="yk878Refresh">↻ Reload</button><small id="yk878FilterResult" class="yk878-meta" aria-live="polite"></small></div>
   <div class="yk878-tablewrap"><table class="yk878-table"><thead><tr><th>Name / Contact</th><th>Course / Source</th><th>Status / Follow-up</th><th>Actions</th></tr></thead><tbody>
   ${leads.length?leads.map(row=>`<tr data-yk878-row data-course="${esc(row.course)}" data-source="${esc(row.source)}" data-status="${esc(row.status)}" data-followup="${esc(row.followUpDate||'')}"><td><b>${esc(row.name)}</b><small>${esc(channels[row.channel]||row.channel)}: ${esc(row.contact)}</small></td>
     <td>${esc(courses[row.course]||row.course)}<small>${esc(sources[row.source]||row.source)}</small></td>
     <td>${esc(statuses[row.status]||row.status)}<small class="${row.followUpDate&&row.followUpDate<=dateJST()&&!['enrolled','closed'].includes(row.status)?'yk878-due':''}">${esc(row.followUpDate||'No follow-up')}</small></td>
     <td><div class="yk878-controls"><button type="button" data-yk878-edit="${Number(row.id)}">Edit</button><button type="button" data-yk878-delete="${Number(row.id)}">Delete</button></div></td></tr>`).join(''):'<tr><td colspan="4">No CRM records yet.</td></tr>'}
   <tr id="yk878NoMatches" hidden><td colspan="4">No matching rows in latest 100 records.</td></tr></tbody></table></div>
   <hr class="yk878-sep"><h3 id="yk878FormHeading">Add / Update Lead</h3>${formMarkup()}
   <p class="yk878-message" id="yk878CRMMessage" role="status" aria-live="polite"></p>`;
  $('yk878Filter').value=filter;
  $('yk878Filter').addEventListener('change',e=>{filter=e.target.value;applyCRMFilters();});
  $('yk878CourseFilter').addEventListener('change',e=>{courseFilter=e.target.value;applyCRMFilters();});
  $('yk878SourceFilter').addEventListener('change',e=>{sourceFilter=e.target.value;applyCRMFilters();});
  $('yk878Search').addEventListener('input',e=>{searchTerm=e.target.value;applyCRMFilters();});
  $('yk878DueOnly').addEventListener('change',e=>{dueOnly=e.target.checked;applyCRMFilters();});
  $('yk878ResetFilters').addEventListener('click',()=>{
   filter='all';courseFilter='all';sourceFilter='all';searchTerm='';dueOnly=false;
   $('yk878Filter').value='all';$('yk878CourseFilter').value='all';$('yk878SourceFilter').value='all';
   $('yk878Search').value='';$('yk878DueOnly').checked=false;applyCRMFilters();
  });
  applyCRMFilters();localizeFilters();
  $('yk878Refresh').addEventListener('click',()=>void loadCRM());
  $('yk878LeadForm').addEventListener('submit',e=>void saveLead(e));
  $('yk878Clear').addEventListener('click',clearForm);
  if(editId!==null&&leads.some(x=>x.id===editId))chooseEdit(editId,false);
 }
 function applyCRMFilters(){const rows=[...document.querySelectorAll('#yk878CRMContent [data-yk878-row]')];
  const today=dateJST(),q=searchTerm.trim().toLocaleLowerCase();let visible=0;
  for(const tr of rows){const d=tr.dataset;
   const due=d.followup && d.followup<=today&&!['enrolled','closed'].includes(d.status);
   const matches=(filter==='all'||d.status===filter)&&(courseFilter==='all'||d.course===courseFilter)&&
    (sourceFilter==='all'||d.source===sourceFilter)&&(!dueOnly||due)&&(!q||tr.textContent.toLocaleLowerCase().includes(q));
   tr.hidden=!matches;if(matches)visible++;
  }
  const empty=$('yk878NoMatches');if(empty)empty.hidden=visible!==0||rows.length===0;
  const count=$('yk878FilterResult');if(count)count.textContent=visible+' / '+rows.length+' '+filterLanguage().latest;
 }
 function dateJST(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const obj=Object.fromEntries(parts.filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,x.value]));return `${obj.year}-${obj.month}-${obj.day}`;}
 function clearForm(){editId=null;const f=$('yk878LeadForm');if(f)f.reset();const b=$('yk878Save');if(b)b.textContent='Save Lead';$('yk878FormMode').textContent='New inquiry';}
 function chooseEdit(id,scroll=true){const row=crmData?.leads?.find(x=>x.id===id),f=$('yk878LeadForm');if(!row||!f)return;
  editId=id;for(const [field,val] of Object.entries({name:row.name,contact:row.contact,channel:row.channel,course:row.course,source:row.source,status:row.status,followUpDate:row.followUpDate||'',studentCode:row.studentCode||'',notes:row.notes||''})){
    const control=f.elements.namedItem(field);if(control)control.value=val;
  }
  $('yk878Save').textContent='Update Lead';$('yk878FormMode').textContent='Editing lead #'+id;
  if(scroll)f.scrollIntoView({block:'center',behavior:'smooth'});
 }
 async function saveLead(e){e.preventDefault();if(crmBusy)return;const f=e.currentTarget;
  const data=Object.fromEntries(new FormData(f).entries()),id=editId;
  const body={...data,followUpDate:data.followUpDate||null,studentCode:data.studentCode||null};if(id!==null)body.id=id;
  if(!ask(id===null?'Save this inquiry?':'Update this inquiry?'))return;
  crmBusy=true;const b=$('yk878Save');if(b)b.disabled=true;
  try{await json(api,{method:id===null?'POST':'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    editId=null;filter='all';await fetchAfterMutation();msg('yk878CRMMessage','Saved ✓');
  }catch(err){msg('yk878CRMMessage',err.message||'Could not save',true)}
  finally{crmBusy=false;const b=$('yk878Save');if(b)b.disabled=false;}
 }
 async function deleteLead(id){if(crmBusy||!Number.isSafeInteger(id)||id<=0)return;
  if(!ask('Permanently delete this CRM prospect? This does NOT delete an existing YKCR student.'))return;
  crmBusy=true;
  try{await json(api,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
    if(editId===id)editId=null;await fetchAfterMutation();msg('yk878CRMMessage','Lead deleted ✓');
  }catch(err){msg('yk878CRMMessage',err.message||'Could not delete',true)}
  finally{crmBusy=false;}
 }
 async function fetchAfterMutation(){crmData=await json(api);paintCRM();}
 async function loadAnnouncements(){if(annBusy)return;annBusy=true;const el=$('yk878AnnouncementContent');if(el)el.textContent='Loading announcements…';
  try{const data=await json(announcementApi);paintAnnouncements(data.announcements||[]);}
  catch(e){if(el){el.innerHTML='<p class="yk878-meta">Announcements unavailable. Please retry.</p><button type="button" id="yk878AnnRetry">Retry</button>';el.querySelector('#yk878AnnRetry').addEventListener('click',()=>void loadAnnouncements());}}
  finally{annBusy=false;}
 }
 function paintAnnouncements(rows){const el=$('yk878AnnouncementContent');if(!el)return;
  el.innerHTML=`<form id="yk878AnnForm" class="yk878-grid">
   <label class="yk878-full">Title / ခေါင်းစဉ်<input name="title" maxlength="160" required></label>
   <label class="yk878-full">Announcement<textarea name="body" rows="3" maxlength="4000" required></textarea></label>
   <label>Language<select name="language"><option value="all">All</option><option value="my">Myanmar</option><option value="ja">Japanese</option><option value="en">English</option></select></label>
   <div class="yk878-full"><button type="submit" class="yk878-main" id="yk878AnnPublish">Publish Announcement</button> <button type="button" id="yk878AnnReload">↻ Refresh</button></div>
   </form><p id="yk878AnnMessage" class="yk878-message" aria-live="polite" role="status"></p>
   <h3>Recent announcements</h3><div>${rows.length?rows.slice(0,12).map(a=>`<article class="yk878-meta"><b>${esc(a.title)}</b> · ${esc(a.language)} · ${esc(String(a.created_at||'').slice(0,10))}<p>${esc(a.body)}</p></article>`).join(''):'<p>No announcements published yet.</p>'}</div>`;
  $('yk878AnnReload').addEventListener('click',()=>void loadAnnouncements());
  $('yk878AnnForm').addEventListener('submit',e=>void publish(e));
 }
 async function publish(e){e.preventDefault();if(annBusy)return;const form=e.currentTarget;const body=Object.fromEntries(new FormData(form).entries());
  if(!ask('Publish this announcement?'))return;
  annBusy=true;const b=$('yk878AnnPublish');if(b)b.disabled=true;
  try{await json(announcementApi,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    await loadAnnouncementsAfterPublish();msg('yk878AnnMessage','Published ✓');
  }catch(err){msg('yk878AnnMessage',err.message||'Publish failed',true);}
  finally{annBusy=false;const b=$('yk878AnnPublish');if(b)b.disabled=false;}
 }
 async function loadAnnouncementsAfterPublish(){const data=await json(announcementApi);paintAnnouncements(data.announcements||[]);}
})();
