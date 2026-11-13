/* v7.87.17 — admin-only Marketing & Enrollment Insights.
 * Non-blocking/lazy loaded, read-only, never creates or edits student/payment data.
 */
(()=>{'use strict';
 if(document.body?.dataset.dashboard!=='admin')return;
 const host=document.getElementById('dashboardBody');if(!host)return;
 const $=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=v=>Number.isSafeInteger(Number(v))&&Number(v)>=0?Number(v):0;
 const fmt=v=>num(v).toLocaleString('ja-JP');
 const courses={truck:'TRUCK',taxi:'TAXI',bus:'BUS',general:'General'};
 const sources={facebook:'Facebook',youtube:'YouTube',google:'Google',website:'Website',referral:'Referral',manual:'Manual',other:'Other'};
 const langs={
 my:{title:'သင်တန်းစုံစမ်းမှုနှင့် Marketing အခြေအနေ',subtitle:'Admin ထည့်ထားတဲ့ CRM စာရင်းအပေါ် အခြေခံသော Pipeline နှင့် Follow-up',period:'အချိန်ကာလ',all:'အားလုံး',day:'ရက်',refresh:'ပြန်ဖတ်ရန်',loading:'စုံစမ်းမှုမှတ်တမ်းများ ဖတ်နေသည်…',
 total:'စုံစမ်းသူစုစုပေါင်း',new:'အသစ်',contacted:'ဆက်သွယ်ပြီး',interested:'စိတ်ဝင်စားသူ',enrolled:'အပ်နှံပြီး (Admin မှတ်တမ်း)',closed:'ပိတ်ပြီး',due:'ယနေ့နှင့် နောက်ကျ Follow-up',overdue:'နောက်ကျနေသူ',today:'ဒီနေ့ ဆက်သွယ်ရန်',next7:'လာမည့် ၇ ရက်',unscheduled:'ရက်မသတ်မှတ်ရသေး',
 pipeline:'စုံစမ်းသူအဆင့်များ',course:'သင်တန်းအလိုက် စုံစမ်းမှု',source:'စုံစမ်းလာတဲ့ လမ်းကြောင်း',contacts:'ဆက်သွယ်ရန်ကျန်သူများ',date:'ရက်',status:'အခြေအနေ',viewCRM:'CRM ဖွင့်ရန်',grow:'Marketing Dashboard ဖွင့်ရန်',
 clicks:'Website CTA ခလုတ်နှိပ်မှု',noClicks:'မရရှိသေး',allClicks:'All-time Clicks ကို ဒီအပိုင်းမှာ မတွက်ထားပါ',sample:'နောက်ကျ/ယနေ့ Follow-up စာရင်းမှ အများဆုံး ၂၀ ဦး',none:'ဆက်သွယ်ရန် နောက်ကျနေသူမရှိပါ',
 disclaimer:'မှတ်ချက် — ဒီကိန်းဂဏန်းတွေက Admin ထည့်ထားတဲ့ CRM Status များသာဖြစ်ပါတယ်။ Enrolled ဆိုတာ ငွေပေးချေပြီးကြောင်း၊ YKCR မှာ အတည်ပြုပြီးကြောင်း မဟုတ်ပါ။ Website Click နဲ့ CRM Lead တွေကို ချိတ်ထားခြင်းမရှိလို့ Campaign Conversion Rate မတွက်ပါ။',
 periodnote:'ရွေးထားတဲ့ကာလမှာ စာရင်းစသွင်းခဲ့သူတွေရဲ့ ယနေ့အခြေအနေ',duenote:'Follow-up စာရင်းက ရွေးထားတဲ့ကာလမဟုတ်ဘဲ Active Lead အားလုံးကို တွက်ထားပါတယ်',clicknote:'ထပ်နှိပ်မှုတွေ ပါနိုင်သည်။ Lead / Customer မဟုတ်ပါ။',error:'အချက်အလက်မဖတ်နိုင်ပါ။ CRM Migration နဲ့ Admin Permission ကို စစ်ပါ။',hint:'အခြားအချက်အလက်တွေကို CRM ထဲမှာ ပြင်နိုင်ပါတယ်။ CRM မှာ နောက်ဆုံးပြင်ထားတဲ့ ၁၀၀ ယောက်သာ ပေါ်နေပါတယ်။'},
 en:{title:'Marketing & Enrollment Insights',subtitle:'Owner-entered CRM pipeline and follow-up overview',period:'Period',all:'All time',day:'days',refresh:'Refresh',loading:'Loading enrollment insights…',
 total:'CRM leads',new:'New',contacted:'Contacted',interested:'Interested',enrolled:'Enrolled (owner status)',closed:'Closed',due:'Due follow-ups',overdue:'Overdue',today:'Due today',next7:'Next 7 days',unscheduled:'No follow-up date',pipeline:'Pipeline status',course:'Leads by course',source:'Owner-entered lead sources',contacts:'Due / overdue follow-up list',date:'Date',status:'Status',viewCRM:'Open CRM',grow:'Open Marketing Dashboard',clicks:'Website CTA clicks',noClicks:'Unavailable',allClicks:'All-time CTA clicks not queried',sample:'Up to 20 oldest due/overdue leads',none:'No due follow-ups',
 disclaimer:'CRM counts are owner-entered statuses only. Enrolled does NOT mean a verified class payment or a YKCR student. Anonymous website clicks are not linked to CRM records; campaign conversion rates are unavailable.',
 periodnote:'Leads created in the selected period, grouped by current status',duenote:'Follow-up totals always include all active leads, irrespective of selected period',clicknote:'Non-unique clicks; not leads or customers.',error:'Could not load. Check Admin access and CRM migration.',hint:'Edit records in CRM. The existing CRM list shows only the last 100 updated records.'},
 ja:{title:'受講相談・マーケティング分析',subtitle:'管理者が登録した見込み受講者とフォローアップの状況',period:'集計期間',all:'全期間',day:'日',refresh:'更新',loading:'申込データを読み込み中…',
 total:'相談件数',new:'新規',contacted:'連絡済み',interested:'関心あり',enrolled:'入会登録（手入力）',closed:'終了',due:'フォローアップ期限',overdue:'期限超過',today:'本日対応',next7:'今後７日',unscheduled:'日付未設定',pipeline:'申込ステータス',course:'講座別の相談',source:'相談経路（管理者入力）',contacts:'要対応者一覧',date:'日付',status:'状態',viewCRM:'CRMを開く',grow:'マーケティング画面へ',clicks:'サイトCTAクリック',noClicks:'取得不可',allClicks:'全期間クリックは取得しません',sample:'期限が近い順で最大20件',none:'期限到来の相談なし',
 disclaimer:'CRMの数値は管理者が入力した記録です。入会登録は実際の入金やYKCRの認証を意味しません。匿名クリックとCRMを連結していないため、キャンペーン転換率は出しません。',
 periodnote:'選択期間に登録した相談の現在のステータス',duenote:'フォローアップ件数は期間に関係なく全ての有効な相談を対象とします',clicknote:'重複クリックを含む場合があります。実際の相談件数ではありません。',error:'取得できません。管理者権限とCRM移行を確認してください。',hint:'記録の編集はCRMで行います。既存CRMリストは更新の新しい100件のみ表示します。'}
 };
 const language=()=>{try{return window.YKDashboardLanguageV759?.getLanguage?.()||localStorage.getItem('yk_lang')||'my'}catch{return 'my'}};
 const L=()=>langs[language()]||langs.my;
 const stages=['new','contacted','interested','enrolled','closed'];
 const endpoint='/.netlify/functions/yk-enrollment-insights';
 let period='30',data=null,growth=null,error='',loaded=false,inflight=0;
 const el=(tag,attrs={})=>{const n=document.createElement(tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n};
 function mount(){
  const shell=$('yk878Shell');if(!shell||$('yk817Insights')||!host.querySelector('#adminStats'))return false;
  const nav=shell.querySelector('.yk878-nav');if(nav){const a=el('a',{href:'#yk817Insights'});a.textContent='Enrollment Insights';nav.appendChild(a);}
  const panel=el('details',{id:'yk817Insights',class:'yk817-panel'});
  panel.innerHTML=`<summary id="yk817Title"></summary>
   <div class="yk817-top"><p id="yk817Subtitle"></p><div class="yk817-controls"><label for="yk817Period" id="yk817PeriodLabel"></label>
   <select id="yk817Period"><option value="7">7</option><option value="30" selected>30</option><option value="90">90</option><option value="all">All</option></select>
   <button id="yk817Refresh" type="button"></button></div></div>
   <div id="yk817Status" class="yk817-status" role="status" aria-live="polite"></div>
   <div id="yk817Body"></div>`;
  shell.insertBefore(panel,shell.querySelector('#yk878Announcements')||null);
  panel.addEventListener('toggle',()=>{if(panel.open&&!loaded){loaded=true;void load()}});
  $('yk817Period').addEventListener('change',e=>{period=e.target.value;void load()});
  $('yk817Refresh').addEventListener('click',()=>void load());
  panel.addEventListener('click',e=>{if(e.target.closest('[data-yk817-opencrm]')){
   const crm=$('yk878CRM');if(crm){crm.open=true;crm.scrollIntoView({block:'start',behavior:'smooth'});}
  }else if(e.target.closest('[data-yk817-opengrowth]')){
   const g=$('yk877Growth');if(g)g.scrollIntoView({block:'start',behavior:'smooth'});
  }});
  const display=$('ykCurrentLanguage');if(display)new MutationObserver(()=>render()).observe(display,{childList:true,characterData:true,subtree:true});
  render();return true;
 }
 if(!mount()){
  const watch=new MutationObserver(()=>{if(mount())watch.disconnect()});watch.observe(host,{subtree:true,childList:true});
 }
 async function getJSON(url){const r=await fetch(url,{credentials:'same-origin',cache:'no-store'});
  const body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.error||String(r.status));return body;}
 async function load(){const serial=++inflight,errorBox=$('yk817Status');if(errorBox)errorBox.textContent=L().loading;
  const crm=getJSON(endpoint+'?days='+encodeURIComponent(period));
  const marketing=period==='all'?Promise.resolve(null):getJSON('/.netlify/functions/yk-business-growth?days='+encodeURIComponent(period));
  const [cr,gr]=await Promise.allSettled([crm,marketing]);if(serial!==inflight)return;
  if(cr.status==='fulfilled'){data=cr.value;error=''}else{data=null;error=L().error}
  growth=gr.status==='fulfilled'?gr.value:null;render();
 }
 const card=(title,value,sub)=>`<div class="yk817-card"><small>${esc(title)}</small><strong>${esc(value)}</strong>${sub?`<span>${esc(sub)}</span>`:''}</div>`;
 function chart(title,rows,local,subtitles){const total=rows.reduce((sum,r)=>sum+num(r.total),0);
  return `<section class="yk817-box"><h3>${esc(title)}</h3>${rows.filter(r=>r.total>0).length?
   rows.filter(r=>r.total>0).map(r=>`<div class="yk817-chartline"><div><b>${esc(local[r.id]||r.id)}</b><span>${fmt(r.total)} · ${esc(subtitles.enrolled)} ${fmt(r.enrolled)}</span></div><div class="yk817-track"><span style="width:${total?Math.min(100,Math.round(num(r.total)/total*100)):0}%"></span></div></div>`).join(''):
   `<p class="yk817-empty">—</p>`}</section>`;
 }
 function render(){const title=$('yk817Title');if(!title)return;const t=L();
  title.textContent='📈 '+t.title;$('yk817Subtitle').textContent=t.subtitle;
  $('yk817PeriodLabel').textContent=t.period;
  const opts=$('yk817Period').options;for(let i=0;i<opts.length;i++)opts[i].textContent=opts[i].value==='all'?t.all:opts[i].value+' '+t.day;
  $('yk817Refresh').textContent='↻ '+t.refresh;
  const status=$('yk817Status');status.textContent=error||(!data&&loaded?t.loading:'');status.classList.toggle('yk817-error',!!error);
  const body=$('yk817Body');if(!data){body.innerHTML='';return;}
  const c=data.cohort||{},counts=c.counts||{},f=data.followups||{};
  const byCourse=Object.entries(c.byCourse||{}).map(([id,v])=>({id,...v}));
  const bySource=Object.entries(c.bySource||{}).map(([id,v])=>({id,...v}));
  const clicks=period==='all'?t.allClicks:growth?fmt(growth.clicks?.total):t.noClicks;
  const due=Array.isArray(f.dueSample)?f.dueSample:[];
  body.innerHTML=`<p class="yk817-note">${esc(t.periodnote)}</p><div class="yk817-metrics">
   ${card(t.total,fmt(c.total))}${card(t.new,fmt(counts.new))}${card(t.contacted,fmt(counts.contacted))}${card(t.interested,fmt(counts.interested))}
   ${card(t.enrolled,fmt(counts.enrolled))}${card(t.closed,fmt(counts.closed))}</div>
   <h3>${esc(t.due)}</h3><p class="yk817-note">${esc(t.duenote)}</p>
   <div class="yk817-metrics">${card(t.overdue,fmt(f.overdue))}${card(t.today,fmt(f.today))}${card(t.next7,fmt(f.next7Days))}${card(t.unscheduled,fmt(f.unscheduled))}</div>
   <div class="yk817-grid">${chart(t.course,byCourse,courses,t)}${chart(t.source,bySource,sources,t)}</div>
   <section class="yk817-box"><h3>${esc(t.contacts)}</h3><p class="yk817-note">${esc(t.sample)}</p>
    ${due.length?`<div class="yk817-tablewrap"><table><thead><tr><th>ID</th><th>${esc(t.date)}</th><th>${esc(t.course)}</th><th>${esc(t.source)}</th><th>${esc(t.status)}</th></tr></thead><tbody>${due.map(x=>`<tr><td><b>#${num(x.id)}</b><span>${esc(x.name)}</span></td><td>${esc(x.date)}</td><td>${esc(courses[x.course]||x.course)}</td><td>${esc(sources[x.source]||x.source)}</td><td>${esc(t[x.status]||x.status)}</td></tr>`).join('')}</tbody></table></div>`:
    `<p class="yk817-empty">${esc(t.none)}</p>`}
    <p class="yk817-note">${esc(t.hint)}</p><button type="button" data-yk817-opencrm class="yk817-main">${esc(t.viewCRM)} ↗</button></section>
   <section class="yk817-box"><h3>Marketing · ${esc(t.clicks)}</h3><div class="yk817-clickrow"><strong>${esc(clicks)}</strong><span>${esc(t.clicknote)}</span></div>
   <button type="button" data-yk817-opengrowth>${esc(t.grow)} ↗</button></section>
   <p class="yk817-caveat">${esc(t.disclaimer)}</p>`;
 }
})();
