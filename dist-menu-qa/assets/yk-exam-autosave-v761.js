/* YE KUN v7.62 — server-owned phase/deadline; CAS save, tab guard, local recovery. */
(()=>{'use strict';
const ENDPOINT='/.netlify/functions/exam-checkpoint';
let active=null,busy=false,dirty=false,timer=0,warning='',guard=null;
const key=(uid,id)=>`yk_v761_checkpoint_${encodeURIComponent(uid)}_${id}`;
const parse=s=>{try{return JSON.parse(s)}catch{return null}};
const clone=x=>JSON.parse(JSON.stringify(x));
const fromLocal=(u,id,type)=>{try{const d=parse(localStorage.getItem(key(u,id)));return d&&d.type===type&&d.attemptId===id?d:null}catch{return null}};
const message={stale:'⚠ အခြား Tab မှာ ဒီ Exam ကို ပြင်ထားပါတယ်။ / Another tab updated this exam.',
 offline:'⚠ အင်တာနက်ချိတ်ပြီးမှ နောက်အပိုင်းသို့ သွားနိုင်ပါမယ်။ / Connect to the internet to continue to the next section.',
 readonly:'🔒 အခြား Tab မှာ Exam ဖွင့်ထားပါတယ်။ / Exam active in another tab (read-only).',
 retry:'⚠ သိမ်းမရပါ။ အင်တာနက်စစ်ပြီး ပြန်ကြိုးစားပါ။ / Save failed; reconnect and retry.'};
function note(){const host=document.getElementById('examPanel');if(!host||!host.classList.contains('active'))return;
 const parent=host.querySelector('.yk-native-bar,.exam-toolbar');if(!parent)return;
 let el=parent.querySelector('.yk-autosave-badge-v761');if(!el){el=document.createElement('span');el.className='yk-autosave-badge-v761';el.setAttribute('role','status');parent.appendChild(el)}
 el.textContent=warning||(dirty||busy?'↻ Saving… / သိမ်းနေသည်':'✓ Auto Saved / သိမ်းထားပြီး');el.classList.toggle('warn',!!warning);
 if(active?.readOnly)host.querySelectorAll('button,input,select,textarea').forEach(n=>{if(!n.classList.contains('yk-autosave-badge-v761'))n.disabled=true});
}
function localWrite(){if(!active||!active.snapshot||active.readOnly)return;try{localStorage.setItem(key(active.user,active.id),JSON.stringify({type:active.type,attemptId:active.id,snapshot:active.snapshot,phase:active.phase,version:active.version,localDirty:true}))}catch{warning=message.retry}}
function localClear(){if(!active)return;try{localStorage.removeItem(key(active.user,active.id))}catch{}}
function unlock(){if(guard){try{guard()}catch{}guard=null}}
async function tabGuard(id){
 if(navigator.locks?.request){
  let settle;const outcome=new Promise(r=>{settle=r});
  navigator.locks.request(`yk_exam_attempt_${id}`,{ifAvailable:true,mode:'exclusive'},lock=>{
   if(!lock){settle(false);return}
   settle(true);return new Promise(release=>{guard=release});
  }).catch(()=>settle(false));
  return outcome;
 }
 // Fallback: BroadcastChannel coordinate best-effort; CAS still guarantees no stale overwrite.
 if(typeof BroadcastChannel!=='undefined'){
  const ch=new BroadcastChannel(`yk_exam_attempt_${id}`);let occupied=false;
  ch.onmessage=e=>{if(e.data==='ping'&&active?.id===id){ch.postMessage('occupied')}
    if(e.data==='occupied')occupied=true};ch.postMessage('ping');
  await new Promise(resolve=>setTimeout(resolve,180));
  if(occupied){ch.close();return false}
  ch.onmessage=e=>{if(e.data==='ping')ch.postMessage('occupied');if(e.data==='occupied'&&active?.id===id){active.readOnly=true;warning=message.readonly;note()}};
  guard=()=>ch.close();return true;
 }
 return true;
}
function accept(ctx,data){ctx.phase=Number(data.phase);ctx.version=Number(data.version);ctx.endsAt=data.endsAt;ctx.snapshot=data.snapshot??ctx.snapshot;ctx.onDeadline?.(ctx.endsAt,ctx.phase)}
async function reconcile(ctx,data){
 if(active!==ctx)return;
 if(data.phase!==undefined&&data.version!==undefined){accept(ctx,data);ctx.snapshot=data.snapshot??null;localClear()}
 dirty=false;warning=data.error==='stale_checkpoint'||data.error==='invalid_phase'?message.stale:
  data.error==='time_expired'?'⚠ အချိန်ကုန်သွားပါပြီ။ / Exam deadline expired.':message.retry;
 note();ctx.onConflict?.({snapshot:ctx.snapshot,phase:ctx.phase,endsAt:ctx.endsAt,version:ctx.version,error:data.error});
}
async function request(ctx,body){
 const res=await fetch(ENDPOINT,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
 const data=await res.json().catch(()=>({}));
 if(res.status===409){await reconcile(ctx,data);throw Error(data.error||'checkpoint_conflict')}
 if(!res.ok)throw Error(data.error||`Autosave ${res.status}`);
 const pendingDraft=dirty?clone(ctx.snapshot):null;
 accept(ctx,data);if(pendingDraft){ctx.snapshot=pendingDraft;localWrite()}return data;
}
async function sendOne(){if(!active||!active.snapshot||active.readOnly)return false;
 const ctx=active,body={attemptId:ctx.id,phase:ctx.phase,baseVersion:ctx.version,snapshot:clone(ctx.snapshot)};
 busy=true;note();
 try{await request(ctx,body);if(active===ctx){warning='';if(!dirty)localClear()}return true}
 catch(e){if(active===ctx){if(!warning)warning=message.retry;console.warn('YK autosave',e);if(!/checkpoint_conflict|time_expired|stale_checkpoint|invalid_phase/.test(String(e)))dirty=true}return false}
 finally{busy=false;note()}
}
async function pump(){if(busy||!active||!active.snapshot||active.readOnly)return !dirty;
 const ctx=active;while(active===ctx&&dirty){dirty=false;if(!await sendOne())return false}return active===ctx&&!dirty}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>pump(),400)}
async function activate(user,attemptId,type){
 clearTimeout(timer);unlock();active=null;dirty=false;busy=false;warning='';
 if(!user||!Number.isSafeInteger(Number(attemptId))||Number(attemptId)<=0)throw Error('Missing authorized attempt');
 const id=Number(attemptId),uid=String(user);
 const res=await fetch(`${ENDPOINT}?attemptId=${encodeURIComponent(id)}`,{credentials:'same-origin',cache:'no-store'});
 const data=await res.json().catch(()=>({}));
 if(!res.ok||!data.ok||data.type!==type)throw Error(data.error||'Cannot load saved exam');
 const canWrite=await tabGuard(id);
 const local=fromLocal(uid,id,type),version=Number(data.version??0),phase=Number(data.phase??0);
 // Phase and deadline ALWAYS originate on the server. Never use wall-clock savedAt to decide.
 const compatible=local&&local.phase===phase&&Number(local.version)>=version&&local.localDirty;
 const snapshot=compatible?clone(local.snapshot):data.snapshot??null;
 active={user:uid,id,type,phase,version,snapshot,endsAt:data.endsAt,onDeadline:null,onConflict:null,readOnly:!canWrite};
 if(!canWrite)warning=message.readonly;
 if(compatible && canWrite){dirty=true;schedule()}
 if(local && local.phase!==phase)warning='⚠ Section ကို Server နဲ့ ပြန်ညှိထားပါတယ်။ / Server section restored.';
 return {snapshot:active.snapshot,phase:active.phase,endsAt:active.endsAt,attemptId:id,resumed:!!active.snapshot,readOnly:active.readOnly};
}
function deadlineChanged(fn){if(active)active.onDeadline=fn}
function onConflict(fn){if(active)active.onConflict=fn}
function save(snapshot,phase=0){if(!active||active.readOnly||!snapshot||active.type!==snapshot.type)return false;
 if(phase!==active.phase){warning=message.offline;note();return false}
 active.snapshot=clone(snapshot);dirty=true;localWrite();note();schedule();return true;
}
async function advance(snapshot,next){
 const ctx=active;if(!ctx||ctx.readOnly||!snapshot||next!==ctx.phase+1)return false;
 clearTimeout(timer);
 if(!await pump()){warning=message.offline;note();return false}
 busy=true;note();
 try{const result=await request(ctx,{attemptId:ctx.id,phase:next,baseVersion:ctx.version,snapshot:clone(snapshot)});
  ctx.snapshot=clone(snapshot);localWrite();localClear();warning='';note();return result}
 catch(e){warning=warning||message.offline;note();return false}
 finally{busy=false}
}
function afterRender(){note()}
function discardOnSubmit(){localClear();unlock();active=null;dirty=false;clearTimeout(timer);warning=''}
function isActive(){return !!active}
function context(){return active?{...active}:null}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&active&&dirty){clearTimeout(timer);pump()}});
window.addEventListener('pagehide',()=>{if(active&&dirty){clearTimeout(timer);pump()}unlock()});
window.YKExamAutoSaveV761={activate,save,advance,onConflict,afterRender,deadlineChanged,discardOnSubmit,isActive,context,flush:()=>pump()};
})();
