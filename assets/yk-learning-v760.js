/* v7.91.2 — single account-scoped review and announcement panels. */
(()=>{'use strict';
const host=document.getElementById('dashboardBody');if(!host)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=async(path,options)=>{const r=await fetch('/.netlify/functions/'+path,{credentials:'same-origin',cache:'no-store',...options});const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'Unable to load');return j};
let data=null,filter='all',loading=null;
const $=id=>document.getElementById(id);
function load(){
 if(data)return Promise.resolve(data);if(loading)return loading;
 loading=api('yk-learning').then(d=>{data=d;return d}).finally(()=>{loading=null});
 return loading;
}
function review(){
 const root=$('yk7912ReviewHost');if(!root||!data)return;
 const mistakes=Array.isArray(data.mistakes)?data.mistakes:[];
 const types=[...new Set(mistakes.map(x=>String(x.exam_type||'Unknown')))];
 if(filter!=='all'&&!types.includes(filter))types.push(filter);
 const shown=(filter==='all'?[...mistakes]:mistakes.filter(x=>x.exam_type===filter)).sort((a,b)=>Number(b.missed_count||0)-Number(a.missed_count||0));
 root.innerHTML=`<label>Exam Type <select id="yk7912MistakeType"><option value="all">All exams</option>${types.map(t=>`<option value="${esc(t)}"${t===filter?' selected':''}>${esc(t.toUpperCase().replaceAll('_',' '))}</option>`).join('')}</select></label><p class="muted">${shown.length} saved mistake records · All time · Up to 150 recent records. Zero records does not prove zero wrong answers.</p><div class="yk760-review">${shown.map(x=>`<details><summary>${esc(x.exam_type)} · ${esc(x.question_text).slice(0,160)} (${Number(x.missed_count)||0}×)</summary><p>✅ ${esc(x.correct_answer)}</p><p>🇯🇵 ${esc(x.explanation_ja)}</p><p>🇲🇲 ${esc(x.explanation_my)}</p></details>`).join('')||'<p class="muted">Mistake history will appear after supported exams are submitted.</p>'}</div><h3>Daily Practice (5 / 10 / 20)</h3><p class="muted">Review saved mistakes only. No mock exam attempts are consumed.</p><div class="actions"><button class="btn sm" type="button" data-yk760-count="5">5 Questions</button><button class="btn sm" type="button" data-yk760-count="10">10 Questions</button><button class="btn sm" type="button" data-yk760-count="20">20 Questions</button></div><div id="yk760Practice"></div>`;
 $('yk7912MistakeType').value=filter;$('yk7912MistakeType').onchange=e=>{filter=e.target.value;review()};
 root.querySelectorAll('[data-yk760-count]').forEach(b=>b.onclick=()=>practice(shown,Number(b.dataset.yk760Count)));
}
function announcements(){
 const root=$('yk7912AnnouncementHost');if(!root||!data)return;
 const admin=document.body.dataset.dashboardView==='management'&&document.body.dataset.dashboard==='admin';
 const anns=Array.isArray(data.announcements)?data.announcements:[];
 root.innerHTML='<div class="yk760-ann">'+(anns.map(a=>`<article class="record"><b>${esc(a.title)}</b><p>${esc(a.body)}</p><small>${esc(a.language)} · ${esc(String(a.created_at||'').slice(0,10))}</small></article>`).join('')||'<p class="muted">No announcements yet.</p>')+'</div>'+
 (admin?`<h3>Publish Announcement (Admin)</h3><form id="yk760AnnForm" class="yk760-form"><input name="title" maxlength="160" placeholder="Title" required><textarea name="body" maxlength="4000" placeholder="Announcement" required></textarea><select name="language"><option value="all">All languages</option><option value="my">Myanmar</option><option value="ja">Japanese</option><option value="en">English</option></select><button class="btn primary" type="submit">Publish</button><p id="yk760AnnResult" aria-live="polite"></p></form>`:'');
 const form=$('yk760AnnForm');if(form)form.onsubmit=async e=>{e.preventDefault();const f=new FormData(form),out=$('yk760AnnResult'),button=form.querySelector('button');button.disabled=true;try{await api('yk-announcement-admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(f))});out.textContent='Published successfully.';form.reset();data=null;try{await load();announcements();}catch(_){out.textContent='Published successfully. Announcement list refresh failed; reload to view it.';return;}const result=$('yk760AnnResult');if(result)result.textContent='Published successfully.'}catch(err){out.textContent=err.message}finally{button.disabled=false}};
}
function practice(items,n){const host=document.getElementById('yk760Practice');if(!items.length){host.textContent='No saved mistakes yet.';return}const day=new Date().toISOString().slice(0,10);const pick=items.map((x,i)=>({x,k:(i*37+day.length)%101})).sort((a,b)=>a.k-b.k).slice(0,n);let i=0;function draw(){if(i>=pick.length){host.innerHTML='<p class="notice">Daily review complete. This is revision only, not an official mock exam.</p>';return}const x=pick[i].x;host.innerHTML='<div class="record"><b>Question '+(i+1)+' / '+pick.length+'</b><p>'+esc(x.question_text)+'</p><button type="button" class="btn sm" id="yk760Reveal">Show answer</button><div id="yk760Answer" hidden><p>✅ '+esc(x.correct_answer)+'</p><p>🇯🇵 '+esc(x.explanation_ja)+'</p><p>🇲🇲 '+esc(x.explanation_my)+'</p><button class="btn primary sm" id="yk760Next">Next →</button></div></div>';host.querySelector('#yk760Reveal').onclick=()=>{host.querySelector('#yk760Answer').hidden=false;host.querySelector('#yk760Reveal').hidden=true;host.querySelector('#yk760Next').onclick=()=>{i++;draw()}}}draw()}

function wire(details,container,render){
 if(!details||!container||details.dataset.wired)return;
 details.dataset.wired='true';let rendered=false,busy=false;
 const show=async()=>{if(!details.open||rendered||busy)return;busy=true;container.textContent='Loading…';try{await load();render();rendered=true;}catch(e){container.textContent='Learning data unavailable: '+e.message;const b=document.createElement('button');b.type='button';b.className='btn';b.textContent='Retry';b.onclick=show;container.append(b);}finally{busy=false}};
 details?.addEventListener('toggle',show);if(details.open)void show();
}
function mount(){
 wire($('yk7912Review'),$('yk7912ReviewHost'),review);
 wire($('yk7912Announcements')||$('yk7912AdminAnnouncements'),$('yk7912AnnouncementHost'),announcements);
}
host.addEventListener('click',e=>{const link=e.target.closest('[data-yk7912-review-type]');if(link){filter=link.dataset.yk7912ReviewType;if(data)review();}});
const observer=new MutationObserver(mount);observer.observe(host,{childList:true,subtree:true});mount();
})();
