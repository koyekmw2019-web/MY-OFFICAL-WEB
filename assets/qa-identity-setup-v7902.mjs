export const QA_ORIGIN='https://yekun-ordinary-second-qa.netlify.app';
export const SETUP_PATH='/assets/qa-identity-setup-v7902.html';
const TOKEN_KEYS=Object.freeze({invite:'invite_token',confirmation:'confirmation_token',recovery:'recovery_token'});
export function extractToken(text, action){
  if(!Object.hasOwn(TOKEN_KEYS,action)||typeof text!=='string'||text.length>4096)throw Error('Invalid link');
  let url;try{url=new URL(text.trim())}catch{throw Error('Invalid link')}
  if(url.origin!==QA_ORIGIN||url.username||url.password||url.search||!['/','/index.html','/login.html'].includes(url.pathname))throw Error('Wrong QA link');
  const entries=[...new URLSearchParams(url.hash.slice(1))];
  if(entries.length!==1||entries[0][0]!==TOKEN_KEYS[action]||!/^[A-Za-z0-9._~+/=-]{8,2048}$/.test(entries[0][1]))throw Error('Invalid token');
  return entries[0][1];
}
export async function redeem(api,{action,token,password}){
  if(!Object.hasOwn(TOKEN_KEYS,action)||typeof token!=='string'||!/^[A-Za-z0-9._~+/=-]{8,2048}$/.test(token))throw Error('Invalid input');
  if(action!=='confirmation'&&(typeof password!=='string'||password.length<8||password.length>128))throw Error('Invalid password');
  if(await api.getUser())return {state:'existing-session'};
  if(action==='invite')await api.acceptInvite(token,password);
  else if(action==='recovery')await api.recoverPassword(token,password);
  else await api.confirmEmail(token);
  try{await api.logout();if(await api.getUser())throw Error('Session remains');}catch{return {state:'completed-logout-unverified'}}
  return {state:'completed'};
}
if(typeof document!=='undefined'){
  const $=id=>document.getElementById(id),form=$('setup'),submit=$('submit'),status=$('status'),action=$('action'),logout=$('logout'),back=$('back');
  const say=text=>{status.textContent=text},clear=()=>{$('link').value='';$('password').value='';$('confirm').value=''};
  let busy=false,api;
  const showMode=()=>{const pw=action.value!=='confirmation';$('passwords').hidden=!pw;$('password').required=pw;$('confirm').required=pw;clear()};
  action.addEventListener('change',showMode);showMode();
  window.addEventListener('pagehide',clear);window.addEventListener('pageshow',e=>{if(e.persisted)clear()});
  form.addEventListener('submit',async e=>{e.preventDefault();if(busy||!api)return;let token,password,kind=action.value;try{token=extractToken($('link').value,kind);password=$('password').value;if(kind!=='confirmation'&&(password.length<8||password.length>128||password!==$('confirm').value))throw Error('Invalid password');}catch{clear();say('Link / action / password ကို ပြန်စစ်ပါ။ Check the QA email link, selected action and passwords.');return;}clear();busy=true;submit.disabled=true;logout.hidden=true;back.hidden=true;say('Checking…');try{const r=await redeem(api,{action:kind,token,password});if(r.state==='existing-session'){logout.hidden=false;say('Existing QA session found. Sign out explicitly before retrying.');}else if(r.state==='completed'){say('အောင်မြင်ပါပြီ။ Setup complete. Sign in again on QA Login.');back.hidden=false;}else{say('Setup may have completed, but sign-out was not verified. Close this private window before testing login; do not reuse the token.');}}catch{say('Setup failed or could not be verified. Use a fresh correct email; do not share the link.');}finally{token=password=undefined;busy=false;submit.disabled=!api;}});
  logout.addEventListener('click',async()=>{if(busy||!api)return;busy=true;logout.disabled=true;submit.disabled=true;clear();try{await api.logout();if(await api.getUser())throw Error('Session remains');logout.hidden=true;say('Signed out. Paste the original QA email link again.');}catch{say('Sign-out could not be verified. Close this private window before retrying.');}finally{busy=false;logout.disabled=false;submit.disabled=false;}});
  if(location.origin!==QA_ORIGIN||location.pathname!==SETUP_PATH){say('Blocked: this setup is for the isolated QA site only.');}
  else if(location.hash||location.search){history.replaceState(null,'',SETUP_PATH);say('Blocked: a link was opened in the address bar. Close this window and request a fresh email before retrying.');}
  else{import('/assets/identity.bundle.js?v=7902-qa-identity').then(()=>{const candidate=window.YKIdentity;if(!candidate||!['getUser','logout','acceptInvite','confirmEmail','recoverPassword'].every(k=>typeof candidate[k]==='function'))throw Error('SDK unavailable');api=candidate;submit.disabled=false;say('Ready. Choose the email type and paste the original QA link.');}).catch(()=>say('Identity SDK unavailable. Do not use an email link until the full QA build is verified.'));}
}
