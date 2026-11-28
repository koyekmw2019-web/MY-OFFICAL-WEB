/* FIX09: verified role display and UI routing only. The same existing exam-status
   GET remains the authority; no change to Identity, exam access, DB, payments
   or authorization functions. Patch the generated exam pages, not Home. */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';

const dist=resolve('dist');
const accountStart="  if(mode==='account'){\n    const user=await currentUser();if(!user)return authModal('login');const roles=Array.isArray(user.roles)?user.roles:[];const isAdmin=roles.includes('admin');";
const accountEnd="\n  }\n}\nfunction fmtDateV739";
const modalStart="async function authModal(mode='login',opts={}){";
const oldAdmin="async function adminDashboard(){const user=await currentUser();if(!user||!Array.isArray(user.roles)||!user.roles.includes('admin')){alert('Admin role is required. Role changes take effect after the next login or token refresh.');return}";

const helper=String.raw`// FIX09: never infer authorization UI from client-cached Identity roles.
Object.assign(V737_TEXT.my,{'Checking account role…':'အကောင့် Role စစ်ဆေးနေသည်…','Role verification unavailable':'အကောင့် Role အတည်ပြုမရသေးပါ','Retry role check':'ထပ်စမ်းရန်'});
Object.assign(V737_TEXT.ja,{'Checking account role…':'アカウントの権限を確認中…','Role verification unavailable':'権限を確認できません','Retry role check':'再試行'});
async function yk09VerifiedAccount(user){
  const email=v=>String(v||'').trim().toLowerCase();
  if(!user?.id||!email(user.email))throw Error('Account unavailable');
  const {res,data}=await api('exam-status',{cache:'no-store'});
  const current=await currentUser();
  if(!current||current.id!==user.id||email(current.email)!==email(user.email)||
     !res.ok||data?.authenticated!==true||email(data.email)!==email(user.email)||
     !Array.isArray(data.roles)||!data.roles.every(r=>typeof r==='string'))throw Error('Role verification unavailable');
  return {email:data.email,roles:data.roles};
}
function yk09InvalidateAccountModal(){
  const role=document.getElementById('yk09AccountRole'),o=role?.closest('#examV728Overlay');
  if(o?.classList.contains('open')){
    o.classList.remove('open');
    role.textContent='Checking account role…';
    o.querySelector('#yk09AccountEmail').textContent='—';
    o.querySelector('#yk09AccountActions').replaceChildren();
  }
}
window.addEventListener('yk-identity-ready',yk09InvalidateAccountModal);
window.addEventListener('yk-identity-callback',yk09InvalidateAccountModal);
window.addEventListener('yk-identity-error',yk09InvalidateAccountModal);
`;

const replacement=String.raw`  if(mode==='account'){
    const user=await currentUser();if(!user)return authModal('login');
    const o=overlay('<div class="exam-v728-modal-head"><h3>👤 My Exam Account</h3><button class="exam-v728-close">✕</button></div><div class="auth-account-v735"><div class="auth-account-row"><b>Email</b><span id="yk09AccountEmail">—</span></div><div class="auth-account-row"><b>Role</b><span id="yk09AccountRole" role="status" aria-live="polite" aria-busy="true">Checking account role…</span></div><div class="auth-account-actions"><span id="yk09AccountActions" style="display:contents"></span><button id="authLogout" type="button">Logout</button></div></div>');
    const role=$('#yk09AccountRole',o),email=$('#yk09AccountEmail',o),actions=$('#yk09AccountActions',o);
    let sequence=0;
    const open=()=>o.classList.contains('open')&&$('#yk09AccountRole',o)===role;
    const button=(id,label,action)=>{const b=document.createElement('button');b.id=id;b.type='button';b.textContent=label;b.onclick=action;actions.append(b);return b;};
    async function verify(navigate=false){
      const seq=++sequence;actions.replaceChildren();email.textContent='—';
      role.textContent='Checking account role…';role.setAttribute('aria-busy','true');v737Localize(o);
      try{
        const verified=await yk09VerifiedAccount(user);
        if(!open()||sequence!==seq)return;
        email.textContent=verified.email;role.textContent=verified.roles.length?verified.roles.join(', '):'member';
        if(verified.roles.includes('admin')){
          if(navigate){window.location.assign('/admin-dashboard.html');return;}
          const b=button('openAdminV735','👑 Admin Dashboard',()=>verify(true));b.className='primary';
        }
      }catch{
        if(!open()||sequence!==seq)return;
        role.textContent='Role verification unavailable';
        button('yk09AccountRetry','Retry role check',()=>verify());
      }finally{
        if(open()&&sequence===seq){role.setAttribute('aria-busy','false');v737Localize(o);}
      }
    }
    $('#authLogout',o).onclick=async()=>{sequence++;actions.replaceChildren();role.textContent='Checking account role…';email.textContent='—';try{await id.logout()}finally{o.classList.remove('open');cachedStatus=null;await syncStatus()}};
    await verify();return;
`;

let count=0;
const pages=readdirSync(dist,{recursive:true}).filter(p=>p.endsWith('.html')).map(p=>p.replaceAll('\\','/'));
for(const page of pages){
  const file=join(dist,page);let html=readFileSync(file,'utf8');
  if(!html.includes(accountStart))continue;
  assert(page==='mock-exams.html'||page.startsWith('exams/'),'Unexpected role modal route: '+page);
  const start=html.indexOf(accountStart),end=html.indexOf(accountEnd,start);
  assert(end>start&&html.split(accountStart).length===2,page+' account block must be unique');
  assert(html.split(modalStart).length===2&&html.split(oldAdmin).length===2,page+' role anchors');
  html=html.slice(0,start)+replacement.trimEnd()+html.slice(end);
  html=html.replace(modalStart,()=>helper+modalStart);
  // Keep the exposed legacy admin UI consistent as well. Its existing server
  // guards and API calls remain untouched, and are still the actual authority.
  html=html.replace(oldAdmin,()=> "async function adminDashboard(){const user=await currentUser();try{if(!(await yk09VerifiedAccount(user)).roles.includes('admin'))throw Error('Admin role required')}catch{alert('Admin role could not be verified.');return}");
  writeFileSync(file,html,'utf8');count++;
}
assert.equal(count,13,'Expected exactly the 13 legacy Exam Center/Exam pages');
console.log(JSON.stringify({fix:'FIX09',examPages:count,scope:'account role display and UI routing only'}));
