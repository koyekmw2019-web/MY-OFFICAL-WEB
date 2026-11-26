// UI only. Applied to the final generated Exam and Mobile Home pages.
import assert from 'node:assert/strict';

const examSkeleton = '<div class="yk791-skeleton yk791-exam-skeleton" aria-hidden="true"><i class="yk791-sk-line yk791-sk-heading"></i><div class="yk791-sk-row"><i class="yk791-sk-circle"></i><i class="yk791-sk-line"></i><i class="yk791-sk-end"></i></div><div class="yk791-sk-row"><i class="yk791-sk-circle"></i><i class="yk791-sk-line"></i><i class="yk791-sk-end"></i></div><div class="yk791-sk-row"><i class="yk791-sk-circle"></i><i class="yk791-sk-line"></i><i class="yk791-sk-end"></i></div></div>';
const examStatus = `let yk791AccessSeq=0;
function yk791PresentAccess(state){
  const card=$('#online-mock-exam .yk-approved-access');
  if(!card)return;
  card.dataset.ykAccessState=state;
  card.setAttribute('aria-busy',String(state==='loading'));
  const student=card.querySelector('.yk-audience-student');
  const publicCard=card.querySelector('.yk-audience-public');
  const account=$('#examAccountV735'),compact=$('#yk791CompactAccount');
  const publicActions=publicCard?.querySelector('.yk-public-actions');
  const compactAccess=['admin','student','paid'].includes(state);
  if(account&&compact&&publicActions){
    if(compactAccess)compact.append(account);
    else if(account.parentElement===compact)publicActions.prepend(account);
  }
  if(student)student.hidden=compactAccess||state==='loading'||state==='error';
  if(publicCard)publicCard.hidden=compactAccess||state==='loading'||state==='error';
  if(compact)compact.hidden=!compactAccess;
  const guide=$('#yk88AccessGuide'),mini=$('#examPlanMiniV739');
  if(state==='loading'||state==='error'){if(guide)guide.hidden=true;if(mini)mini.hidden=true;}
  const retry=$('#yk791AccessRetry');
  if(retry){retry.hidden=state!=='error';retry.onclick=()=>syncStatus();}
}
async function syncStatus(){
  const seq=++yk791AccessSeq;
  yk791PresentAccess('loading');
  window.YKMenuAuthV757?.refresh?.();
  const t=$('#examAccessTitleV728'),x=$('#examAccessTextV728'),a=$('#examAccountV735'),icon=$('#examAccessIconV739'),guide=$('#yk88AccessGuide');
  const render=(s,data,user)=>{
    if(seq!==yk791AccessSeq)return;
    cachedStatus=data;
    if(guide)guide.hidden=Boolean(user);
    if(a)a.textContent=user?'👤 My Account':'👤 Login / Register';
    if(t)t.textContent=s.t;if(x)x.textContent=s.x;if(icon)icon.textContent=s.icon;
    setAccessButtonsV739(data,user,s.state);
    yk791PresentAccess(s.state);v737Localize(document);
  };
  try{
    // Distinguish an unavailable identity client from a confirmed guest.
    const user=await (await waitIdentity()).getUser();
    if(seq!==yk791AccessSeq)return;
    if(!user){render(statusText(null,null),null,null);return;}
    const {res,data}=await api('exam-status');
    if(seq!==yk791AccessSeq)return;
    if(!res.ok||!data||data.authenticated!==true)throw new Error('Status unavailable');
    render(statusText(data,user),data,user);
  }catch{
    if(seq!==yk791AccessSeq)return;
    cachedStatus=null;
    if(guide)guide.hidden=true;
    if(t)t.textContent='Account Connected';
    if(x)x.textContent='Could not load exam access status. Please retry.';
    if(icon)icon.textContent='⚠️';
    yk791PresentAccess('error');v737Localize(document);
  }
}
`;
const styleLink='<link rel="stylesheet" href="/assets/yk-v7910-access-loading.css?v=7911ui">';
function replaceOnce(html,from,to){
  assert.equal(html.split(from).length,2,'Unexpected UI build anchor: '+from.slice(0,100));
  return html.replace(from,()=>to);
}
export function applyExamLoading(html){
  // Correct the old Burmese guest wording to match the unchanged per-exam policy.
  html=replaceOnce(html,'အကောင့်တစ်ခုလျှင် အခမဲ့စာမေးပွဲ စုစုပေါင်း 1 ကြိမ် ရရှိပါတယ်။','စာမေးပွဲအမျိုးအစားတစ်ခုစီအတွက် အခမဲ့ 1 ကြိမ် ဖြေဆိုနိုင်ပါတယ်။');
  // Only the authenticated exam-status response determines the displayed Admin state.
  html=replaceOnce(html,'const roles=Array.isArray(user.roles)?user.roles:(Array.isArray(s?.roles)?s.roles:[]);','const roles=s?.authenticated===true&&Array.isArray(s.roles)?s.roles:[];');
  const card='<div class="exam-access-card yk-approved-access">';
  html=replaceOnce(html,card,card.slice(0,-1)+' data-yk-access-state="loading" aria-busy="true">'+examSkeleton);
  const publicActions='<div class="yk-public-actions"><button id="examAccountV735">';
  assert(html.includes(publicActions),'Original account action missing');
  const endPublic='</div>\n    </div>\n    \n  </div>\n  <div class="exam-feature-row-v7">';
  html=replaceOnce(html,endPublic,'</div><div id="yk791CompactAccount" hidden></div><button id="yk791AccessRetry" type="button" hidden><span data-my="ထပ်စမ်းရန်" data-en="Retry" data-ja="再試行">ထပ်စမ်းရန်</span></button>\n    </div>\n    \n  </div>\n  <div class="exam-feature-row-v7">');
  const start=html.indexOf('async function syncStatus(){');
  const end=html.indexOf('async function studentModal(){',start);
  assert(start>=0&&end>start,'Original exam status renderer not found');
  assert(html.slice(start,end).includes("api('exam-status')"),'Original exam status fetch not found');
  html=html.slice(0,start)+examStatus+html.slice(end);
  return replaceOnce(html,'</head>',styleLink+'</head>');
}
export function applyHomeLoading(html){
  html=replaceOnce(html,'id="yk790MobileHome" aria-label=', 'id="yk790MobileHome" data-yk-home-loading="true" aria-busy="true" aria-label=');
  return replaceOnce(replaceOnce(html,'yk-v7900-mobile-home.js?v=7901qa','yk-v7900-mobile-home.js?v=7901qa-ui7911'),'</head>',styleLink+'</head>');
}
