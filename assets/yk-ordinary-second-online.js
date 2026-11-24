/* STUDYING WITH YE KUN v7.89.0 — server-backed ordinary-second exam.
   Loaded only on mock-second-license.html, after its visual-only legacy renderer.
   Never grade or reveal answer keys in the client. */
(()=>{
'use strict';
const EXAM='ordinary_second';
let attemptId=null, checkpointVersion=0, saving=Promise.resolve(), submitting=false;
const $x=s=>document.querySelector(s);
function warn(message){const e=$x('#yk-second-api-status');
 if(e){e.hidden=false;e.textContent=String(message)}else alert(String(message));
}
async function api(path,method='GET',body){
 const response=await fetch('/.netlify/functions/'+path,{
  method,credentials:'same-origin',cache:'no-store',
  headers:method==='GET'?{}:{'Content-Type':'application/json'},
  ...(body===undefined?{}:{body:JSON.stringify(body)})
 });
 let data={};try{data=await response.json()}catch{}
 if(!response.ok||data?.error||data?.allowed===false){
  const e=new Error(data?.reason||data?.error||'HTTP '+response.status);
  e.status=response.status;e.detail=data;throw e;
 }
 return data;
}
function authMessage(e){
 if(e?.status===401)return 'Login/Register လုပ်ပြီးမှ စာမေးပွဲဖြေပါ။ / ログインしてください。';
 if(e?.status===402)return 'အခမဲ့ဖြေခွင့် အသုံးပြုပြီးပါပြီ။ View Plans ကိုဖွင့်ပါ။';
 if(e?.status===409)return 'အခြားစာမေးပွဲတစ်ခု စတင်ထားနိုင်ပါတယ်။ အကောင့်ထဲမှာ ပြန်စစ်ပါ။';
 return 'Server Error: '+String(e?.message||e);
}
function snapshot(){
 return {version:1,type:EXAM,engine:'license',index:state.i,refs:[...state.questions],
  answers:state.answers.map(a=>Array.isArray(a)?[...a]:a)};
}
function queueSave(){
 if(!state||state.completed||!attemptId)return saving;
 const snap=snapshot(),id=attemptId;
 saving=saving.catch(()=>{}).then(async()=>{
  const res=await api('exam-checkpoint','POST',{
   attemptId:id,phase:0,baseVersion:checkpointVersion,snapshot:snap});
  checkpointVersion=res.version;
  return res;
 });
 saving.catch(err=>warn('Auto Save Error — '+authMessage(err)));
 return saving;
}
save=queueSave;
start=async function(mode='exam'){
 if(mode==='study'){
  warn('လေ့လာရန်အတွက် စာမေးပွဲပြီးသွားပါက Wrong Answer Review ကိုဖွင့်နိုင်ပါတယ်။');
  return;
 }
 if(submitting)return;
 const btn=$x('#startSecond');
 if(btn){btn.disabled=true;btn.textContent='Loading...';}
 const status=$x('#yk-second-api-status');if(status)status.hidden=true;
 try{
  const permit=await api('exam-access','POST',{examType:EXAM});
  if(!permit.allowed||!permit.attemptId)throw new Error('exam_access_denied');
  const manifest=await api('ordinary-second-start','POST',{attemptId:permit.attemptId});
  if(manifest.bankVersion!==bank.version||manifest.refs?.length!==95)
   throw new Error('Question bank version mismatch');
  attemptId=permit.attemptId;
  let cp;
  try{
    cp=await api('exam-checkpoint?attemptId='+encodeURIComponent(attemptId));
  }catch(e){if(e.status!==409)throw e;cp={version:0,snapshot:null};}
  checkpointVersion=Number(cp.version)||0;
  const old=cp.snapshot;
  const valid=old?.type===EXAM&&old?.engine==='license'&&Array.isArray(old?.refs)&&
    old.refs.length===95&&old.refs.every((v,i)=>v===manifest.refs[i])&&
    Array.isArray(old?.answers)&&old.answers.length===95;
  state={
    mode:'exam',questions:manifest.refs,sceneOrder:manifest.sceneOrder,
    answers:valid?old.answers:manifest.refs.map(id=>id.startsWith('I')?[null,null,null]:null),
    i:valid&&Number.isInteger(old.index)?Math.min(94,Math.max(0,old.index)):0,
    deadline:Date.parse(manifest.endsAt),started:Date.now(),completed:false
  };
  if(!Number.isFinite(state.deadline))throw new Error('Invalid server timer');
  $x('#examIntro').hidden=true;
  if(clock)clearInterval(clock);
  render();
  if(Date.now()>state.deadline)submit(true);
 }catch(e){
  warn(authMessage(e));
  if(e.status===401){
   const login=$x('#yk-second-login-link');if(login)login.hidden=false;
  }
 }finally{
  if(btn){btn.disabled=false;btn.textContent='模擬試験を開始・再開';}
 }
};
function boolLabel(x){return x===null?'未回答':x===true?'〇':'✕'}
function safe(x){return escapeHTML(String(x??''))}
function resultPage(review){
 const entries=review.wrong||[];
 const list=entries.map(w=>{
  if(w.kind==='text')return '<article class="review-item"><b>Q'+(w.index+1)+
   '</b><h4>'+safe(w.jp)+'</h4><p>'+safe(w.mm)+'</p><p>正解 <b>'+
   boolLabel(w.correct)+'</b> / あなた '+boolLabel(w.given)+'</p><p class="why">'+
   safe(w.explanationJP)+' '+safe(w.explanationMM)+'</p></article>';
  const rows=w.statements.map((s,i)=>'<p>'+safe(s.jp)+'<small> '+safe(s.mm)+
   '</small> · 正解 '+boolLabel(s.correct)+' / あなた '+boolLabel(s.given)+
   '</p><p class="why">'+safe(s.explanationJP)+' '+safe(s.explanationMM)+'</p>').join('');
  return '<article class="review-item"><b>Q'+(w.index+1)+
    ' · イラスト</b><h4>'+safe(w.jp)+'</h4>'+rows+'</article>';
 }).join('');
 const passed=review.passed===true;
 $x('#examView').innerHTML='<div class="exam-shell result"><div class="eyebrow">'+
  'RESULT · 🚕 普通第二種免許</div><div class="score">'+Number(review.score)+
  '<span style="font-size:21px;color:#aaa">/100</span></div><div class="resulttag '+
  (passed?'':'fail')+'">'+(passed?'PASS · 合格':'FAIL · 不合格')+'</div>'+
  '<p class="mm">အောင်မှတ် 90 / 100 · မှားတဲ့မေးခွန်း '+entries.length+' ခု</p>'+
  '<div class="flex" style="justify-content:center;margin:22px 0">'+
  '<button class="ctrl primary" id="reviewToggle">間違えた問題を見る ('+entries.length+')</button>'+
  '<a class="ctrl" href="/mock-exams.html">試験一覧へ</a></div>'+
  '<section class="review" id="reviewList" hidden>'+(
   list||'<p>間違えた問題はありません。</p>')+'</section></div>';
 $x('#reviewToggle').onclick=()=>$x('#reviewList').hidden=!$x('#reviewList').hidden;
 $x('#examView').scrollIntoView({behavior:'smooth',block:'start'});
}
submit=async function(auto=false){
 if(!state||state.completed||submitting)return;
 const unanswered=state.answers.filter(x=>!answered(x)).length;
 if(!auto&&!confirm('未回答 '+unanswered+' 問があります。提出しますか？\nစာမေးပွဲအဖြေ တင်မလား?'))return;
 submitting=true;
 try{
  if(clock)clearInterval(clock);
  // Existing server submit contract requires the last question to be the active index.
  state.i=94;
  await queueSave();
  await saving;
  const response=await api('exam-attempt-submit','POST',{attemptId});
  if(!response.ok)throw Error('submit_not_confirmed');
  const review=await api('ordinary-second-review?attemptId='+encodeURIComponent(attemptId));
  state.completed=true;
  resultPage(review);
 }catch(e){
  warn('Submit failed — '+authMessage(e));
  if(state&&!state.completed)startClock();
 }finally{submitting=false;}
};
const note=document.createElement('p');
note.id='yk-second-api-status';note.hidden=true;note.className='meta';
note.style.cssText='padding:10px;border:1px solid #a33;border-radius:9px;color:#ffd4d4';
const host=$x('#examIntro')||document.body;host.append(note);
const login=document.createElement('a');login.id='yk-second-login-link';
login.href='/login.html';login.textContent='Login / Register';
login.hidden=true;login.className='btn';host.append(login);
const study=$x('#studySecond');
if(study){study.hidden=true;study.setAttribute('aria-hidden','true');}
})();