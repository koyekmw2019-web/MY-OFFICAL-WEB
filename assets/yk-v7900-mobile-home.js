/* STUDYING WITH YE KUN v7.90.0 — Mobile Home QA.
 * This is a read-only UI. Account status, progress and resume checkpoints are
 * fetched from existing owner-authenticated server endpoints; never cache PII.
 * Existing header, desktop Home, payments, YKCR, login and exam flows untouched.
 */
(()=>{'use strict';
const root=document.getElementById('yk790MobileHome');
if(!root)return;
const $=id=>document.getElementById(id);
const mq=window.matchMedia('(max-width:720px)');
const isHomeRoute=()=>/^\/(?:index(?:\.html)?)?$/.test(location.pathname)&&(!location.hash||location.hash==='#home');
const isMode=()=>mq.matches&&isHomeRoute();
const text=(id,s)=>{const e=$(id);if(e)e.textContent=String(s??'');};
const label=(my,en,ja)=>({en,ja,my})[document.documentElement.lang]||my;
let requestSeq=0,latestUser=null;
const examNames={jlpt_n1:'JLPT N1',jlpt_n2:'JLPT N2',jlpt_n3:'JLPT N3',jlpt_n4:'JLPT N4',jlpt_n5:'JLPT N5',truck:'TRUCK',taxi:'TAXI',bus:'BUS',ordinary_second:'普通第二種免許',car:'普通自動車',motorcycle:'二輪',moped:'原付',maintenance:'自動車整備'};
const wordList=[
 ['横断歩道','おうだんほどう','လမ်းကူးမျဉ်းကြား'],
 ['信号','しんごう','မီးပွိုင့်'],
 ['安全運転','あんぜんうんてん','ဘေးကင်းစွာ မောင်းနှင်ခြင်း'],
 ['道路','どうろ','လမ်းမ'],
 ['停止','ていし','ရပ်တန့်ခြင်း'],
 ['点呼','てんこ','လူစစ်ခြင်း'],
 ['運転手','うんてんしゅ','ယာဉ်မောင်း']
];
function todayWord(){
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const day=Number(date.replace(/\D/g,''))||1;
 const w=wordList[day%wordList.length];text('yk790WordJP',w[0]);text('yk790WordReading',w[1]);text('yk790WordMM',w[2]);
}
function showView(){
 const on=isMode();
 document.body.classList.toggle('yk790-mobile-home',on);
 root.hidden=!on;
 if(on){
   root.setAttribute('aria-hidden','false');
   if(location.hash==='#home')window.scrollTo({top:0,behavior:'instant'});
 }else root.setAttribute('aria-hidden','true');
 if(!on&&mq.matches&&location.hash){
   const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
   if(target&&target!==root)requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant',block:'start'}));
 }
}
function member(msg,expire){text('yk790MemberText',msg);text('yk790ExpireText',expire||'');}
function guest(){
 latestUser=null;
 text('yk790WelcomeName','');
 member(label('ဧည့်သည် · Login / Register','Guest · Login / Register','ゲスト · ログイン登録'),'');
 document.querySelectorAll('#yk790ExamCards .yk790-pill').forEach(e=>e.textContent=label('Login ဝင်ရန်','Login required','ログインが必要'));
 clearProgress();
 $('yk790Resume').hidden=true;$('yk790Daily').hidden=false;
}
function clearProgress(){text('yk790ScoreValue','—');text('yk790ScoreNote',label('အတည်ပြု Result မရှိသေးပါ','No verified results yet','検証済み結果はまだありません'));$('yk790ScoreBars').replaceChildren();}
async function fetchJson(path){
 const res=await fetch(path,{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
 if(!res.ok)throw Error('Read-only data unavailable: '+res.status);
 return res.json();
}
function accessBadges(status){
 const verified=!!status?.student;
 const paid=!!status?.paid;
 const used=new Set(Array.isArray(status?.freeUsedTypes)?status.freeUsedTypes:[]);
 for(const card of document.querySelectorAll('#yk790ExamCards [data-exam-type]')){
   const exam=card.dataset.examType, pill=card.querySelector('.yk790-pill');
   if(!pill)continue;
   const free=verified||paid||!used.has(exam);
   pill.textContent=verified?label('Student Access','Student Access','学生アクセス'):
     paid?label('Plan Active','Plan Active','プラン有効'):
     free?label('အခမဲ့ ၁ ကြိမ်','1 free attempt','無料1回'):
     label('Plan လိုအပ်','Plan required','プランが必要');
   pill.classList.toggle('is-verified',verified||paid);
 }
}
function renderAccount(status,user){
 const student=status?.student;
 const linked=status?.linkedStudent;
 const displayName=student?.name||linked?.name||user?.user_metadata?.full_name||user?.user_metadata?.name||'';
 text('yk790WelcomeName',displayName?(', '+String(displayName).slice(0,80)):'');
 if(student){member('Student · '+(student.class_name||'Verified'),student.expire_date?label('သက်တမ်း','Valid to','期限')+': '+String(student.expire_date).slice(0,10):'');}
 else if(status?.paid){member(label('Paid Plan · အသုံးပြုနိုင်','Paid Plan · Active','有料プラン · 有効'),String(status.paid.expires_at||'').slice(0,10));}
 else if(linked?.access_state==='expired'){member(label('Student · သက်တမ်းကုန်','Student · Expired','学生 · 期限切れ'),'');}
 else{member(label('Account · Student Verify လုပ်နိုင်','Account · Verify student','アカウント · 学生認証'),'');}
 accessBadges(status);
}
function renderProgress(rows){
 const verified=(Array.isArray(rows)?rows:[]).filter(a=>a&&a.status==='submitted'&&a.score_verified===true&&typeof a.passed==='boolean').slice(0,5);
 if(!verified.length){clearProgress();return;}
 const ratio=Math.round(100*verified.filter(a=>a.passed).length/verified.length);
 text('yk790ScoreValue',ratio+'%');
 text('yk790ScoreNote',label('နောက်ဆုံး '+verified.length+' ကြိမ် · Verified','Last '+verified.length+' verified exams','検証済み直近 '+verified.length+' 回'));
 const bars=$('yk790ScoreBars');bars.replaceChildren();
 for(const row of verified.slice().reverse()){
   const b=document.createElement('span');b.className=row.passed?'is-pass':'';
   b.style.height=(row.passed?'95%':'46%');b.title=row.passed?'Pass':'Not passed';bars.appendChild(b);
 }
}
function resumePercent(snapshot){
 if(!snapshot||typeof snapshot!=='object')return null;
 if(snapshot.type==='ordinary_second'&&Array.isArray(snapshot.answers)){
   const n=snapshot.answers.filter(v=>v!==null&&v!==undefined&&v!==''&&!(Array.isArray(v)&&!v.length)).length;
   return Math.max(0,Math.min(100,Math.round(n/95*100)));
 }
 return null;
}
async function findResume(attempts,seq){
 const started=(Array.isArray(attempts)?attempts:[]).filter(x=>x?.status==='started'&&Number.isSafeInteger(Number(x.id))&&examNames[x.exam_type]).slice(0,3);
 for(const attempt of started){
   try{
     const cp=await fetchJson('/.netlify/functions/exam-checkpoint?attemptId='+encodeURIComponent(attempt.id));
     if(seq!==requestSeq)return;
     const deadline=Date.parse(cp?.endsAt||'');
     // Never show a fake / expired resume card; only server-owned checkpoints.
     if(!cp?.ok||!cp?.snapshot||!Number.isFinite(deadline)||deadline<=Date.now()||cp.type!==attempt.exam_type)continue;
     $('yk790Resume').hidden=false;$('yk790Daily').hidden=true;
     text('yk790ResumeTitle',examNames[attempt.exam_type]+' — Mock Exam');
     text('yk790ResumeSection',label('သိမ်းထားသော Exam','Saved exam','保存した試験')+(Number.isInteger(cp.phase)?' · Section '+(cp.phase+1):''));
     const phaseCounts={jlpt_n1:2,jlpt_n2:2,jlpt_n3:3,jlpt_n4:3,jlpt_n5:3};
     const totalPhases=phaseCounts[attempt.exam_type];
     // A completed-section fraction is knowable from the server checkpoint;
     // do not pretend that it measures answered questions in the active phase.
     const finishedPhases=totalPhases?Math.max(0,Math.min(totalPhases,Number(cp.phase)||0)):0;
     const answerProgress=resumePercent(cp.snapshot);
     const progress=totalPhases?Math.round(finishedPhases/totalPhases*100):answerProgress;
     const progressLabel=totalPhases?
       finishedPhases+'/'+totalPhases+' '+label('အပိုင်းပြီး','sections finished','セクション完了'):
       progress===null?'':progress+'%';
     text('yk790ResumePercent',progressLabel);
     $('yk790ResumeFill').style.width=(progress===null?0:progress)+'%';
     $('yk790ResumeProgress').setAttribute('aria-valuenow',String(progress??0));
     $('yk790ResumeProgress').setAttribute('aria-label',totalPhases?'Completed sections':'Saved answer progress');
     const mins=Math.max(0,Math.ceil((deadline-Date.now())/60000));
     text('yk790ResumeTime','◷ '+mins+' min '+label('ကျန်','left','残り'));
     const link=$('yk790ResumeLink');
     link.href=attempt.exam_type==='ordinary_second'?'/mock-second-license.html':'/exams/'+encodeURIComponent(attempt.exam_type)+'.html';
     text('yk790ResumeHint',label('မူလ Exam Page မှာ Start / Resume ကိုနှိပ်မှ ဆက်ဖြေနိုင်ပါတယ်။','On the exam page, tap Start / Resume to continue the saved attempt.','試験ページの「開始・再開」から続けられます。'));
     return;
   }catch{ /* No checkpoint or user is not entitled: omit Continue card. */ }
 }
 $('yk790Resume').hidden=true;$('yk790Daily').hidden=false;
}
async function reload(){
 if(!isMode())return;
 const seq=++requestSeq;
 const auth=window.YKIdentity;
 if(!auth?.getUser){guest();return;}
 let user;
 try{user=await auth.getUser();}catch{
   if(seq===requestSeq){member(label('အကောင့် စစ်ဆေးမရသေး','Account unavailable','アカウントを確認できません'),'');clearProgress();}
   return;
 }
 if(seq!==requestSeq)return;
 if(!user){guest();return;}
 latestUser=user;
 member(label('အကောင့် စစ်ဆေးနေသည်…','Checking your access…','アクセス確認中…'),'');
 const [s,a]=await Promise.allSettled([fetchJson('/.netlify/functions/exam-status'),fetchJson('/.netlify/functions/exam-my-activity')]);
 if(seq!==requestSeq)return;
 if(s.status==='fulfilled'&&s.value?.authenticated)renderAccount(s.value,user);
 else member(label('အကောင့် အခြေအနေမရသေး','Account status unavailable','アカウント状態を確認できません'),'');
 if(a.status==='fulfilled'){renderProgress(a.value?.attempts);await findResume(a.value?.attempts,seq);}
 else{clearProgress();$('yk790Resume').hidden=true;$('yk790Daily').hidden=false;}
}
function onSearch(event){
 event?.preventDefault();
 const q=String($('yk790Search').value||'').trim().toLowerCase();
 const cards=[...document.querySelectorAll('#yk790ExamCards [data-exam-type]')];
 let hits=0;
 for(const a of cards){
  const show=!q||String(a.dataset.tags||'').toLowerCase().includes(q);
  a.hidden=!show;if(show)hits++;
 }
 text('yk790SearchHint',q?(hits?label('ကိုက်ညီသော Exam '+hits+' ခု','Matching exams: '+hits,'該当試験: '+hits):label('Exam မတွေ့ပါ။ Dictionary မှာ ရှာနိုင်ပါတယ်။','No matching exam. Try the dictionary.','一致する試験はありません。辞書をご利用ください。')):'');
}
// The existing bottom Study tab and hamburger shortcuts use history.pushState()
// without firing "hashchange". Capture mobile Home -> legacy-anchor navigation
// before those handlers so the old Study Hub / Dictionary / Portal is visible.
function openLegacyAnchor(event){
 const homePath=/^\/(?:index(?:\.html)?)?$/.test(location.pathname);
 if(!mq.matches||!homePath||event.defaultPrevented||event.button!==0||
    event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
 const link=event.target?.closest?.('a[href]');
 if(!link)return;
 const m=/^\/#([A-Za-z][\w-]*)$/.exec(link.getAttribute('href')||'');
 if(!m)return;
 // Capture both directions: Dashboard -> Study/Dictionary, and Study -> Home.
 // Old bottom-nav code calls history.pushState() without a hashchange event.
 if(m[1]==='home'&&isMode())return;
 if(m[1]!=='home'&&!isMode())return;
 const target=document.getElementById(m[1]);
 if(!target)return;
 event.preventDefault();
 event.stopImmediatePropagation();
 document.getElementById('menuClose')?.click();
 if(m[1]!=='home'){
   document.body.classList.remove('yk790-mobile-home');
   root.hidden=true;
   root.setAttribute('aria-hidden','true');
 }
 location.assign('/#'+m[1]);
 if(m[1]!=='home')requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant',block:'start'}));
}
function init(){
 // Capture phase is intentional: old menu handlers only listen in bubble phase.
 document.addEventListener('click',openLegacyAnchor,true);
 $('yk790QuickSearch').addEventListener('submit',onSearch);
 $('yk790Search').addEventListener('input',onSearch);
 todayWord();showView();reload();
 window.addEventListener('hashchange',()=>{showView();if(isMode())reload();});
 window.addEventListener('popstate',()=>{showView();if(isMode())reload();});
 window.addEventListener('pageshow',()=>{showView();if(isMode())reload();});
 window.addEventListener('yk-identity-ready',reload);
 window.addEventListener('yk-identity-callback',reload);
 mq.addEventListener?.('change',()=>{showView();if(isMode())reload();});
 const langObserver=new MutationObserver(()=>{if(isMode())reload();});
 langObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();