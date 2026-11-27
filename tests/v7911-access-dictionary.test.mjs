import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=fs.readFileSync('dist/assets/yk-v7900-mobile-home.js','utf8');
const html=fs.readFileSync('dist/index.html','utf8');
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
const tests=[];
const run=async(name,fn)=>{try{await fn();tests.push({name,pass:true});console.log('PASS',name)}catch(e){tests.push({name,pass:false});console.log('FAIL',name,e.message)}};
class E {
  constructor(id=''){this.id=id;this.textContent='';this.hidden=false;this.style={};this.dataset={};this.children=[];this.attributes={};this.events={};this.classes=new Set();this.classList={toggle:(s,on)=>on?this.classes.add(s):this.classes.delete(s),remove:s=>this.classes.delete(s)};}
  setAttribute(k,v){this.attributes[k]=v;}
  replaceChildren(){this.children=[];}
  appendChild(e){this.children.push(e);}
  addEventListener(k,f){this.events[k]=f;}
  querySelector(q){return q==='.yk790-pill'?this.pill:null;}
  scrollIntoView(){}
}
const tick=()=>new Promise(r=>setImmediate(r));
function fixture({user=null,status={},attempts=[],checkpoints={},width=390,blockStatus=false,blockActivity=false}={}){
  const els=new Map([...ids].map(id=>[id,new E(id)])), byId=id=>els.get(id)||null;
  const cards=[...html.matchAll(/data-tags="([^"]+)" data-exam-type="([^"]+)"/g)].map(m=>{const e=new E();e.dataset={examType:m[2],tags:m[1]};e.pill=new E();return e;});
  byId('yk790Resume').hidden=true;
  const calls=[], winEvents={}, mq={matches:width<=720,addEventListener(k,f){this.change=f}}, body=new E('body'), doc={readyState:'complete',body,documentElement:{lang:'en'},getElementById:byId,querySelectorAll(q){return q.includes('.yk790-pill')?cards.map(c=>c.pill):cards},createElement:()=>new E(),addEventListener(){}};
  const state={user,status,attempts,checkpoints,blockStatus,blockActivity,delay:null,checkpointOverride:null};
  const window={matchMedia:()=>mq,YKIdentity:{getUser:async()=>state.user},scrollTo(){},addEventListener(k,f){winEvents[k]=f}};
  const location={pathname:'/',hash:'',assigned:null,assign(url){this.assigned=url;}};
  const fetch=async(path,init)=>{calls.push({path,method:init?.method||'GET',cache:init?.cache});if(state.delay)await state.delay;if(path.includes('exam-checkpoint?')&&state.checkpointOverride){const override=state.checkpointOverride(path);if(override)return override;}const bad=(path.endsWith('exam-status')&&state.blockStatus)||(path.endsWith('exam-my-activity')&&state.blockActivity);const value=path.endsWith('exam-status')?{authenticated:true,...state.status}:path.endsWith('exam-my-activity')?{attempts:state.attempts}:state.checkpoints[path.split('attemptId=')[1]];return{ok:!bad&&value!==undefined,status:bad?503:200,json:async()=>value};};
  vm.runInNewContext(src,{window,document:doc,location,fetch,Intl,Date,URLSearchParams,MutationObserver:class{observe(){}},requestAnimationFrame:f=>f(),setTimeout,clearTimeout,console});
  return {state,byId,cards,mq,winEvents,location,calls,body};
}
const student={id:'synthetic-student',user_metadata:{name:'QA Student'}}, paid={id:'synthetic-paid',user_metadata:{name:'QA Paid'}};
const S={student:{name:'QA Student',class_name:'TRUCK',expire_date:'2099-03-01'},freeUsedTypes:['truck']};
const P={paid:{expires_at:'2099-03-01'},freeUsedTypes:['truck']};
const successful={id:1,status:'submitted',score_verified:true,passed:true}, failed={id:2,status:'submitted',score_verified:true,passed:false}, unverified={id:3,status:'submitted',score_verified:false,passed:true};
const start={id:4,status:'started',exam_type:'ordinary_second'};
const checkpoint={ok:true,type:'ordinary_second',endsAt:'2099-03-01T00:00:00Z',snapshot:{type:'ordinary_second',answers:Array.from({length:95},(_,i)=>i<20?true:null)}};
await run('Guest: no backend calls, daily practice, no fake score',async()=>{const f=fixture();await tick();assert.match(f.byId('yk790MemberText').textContent,/Guest/);assert.equal(f.calls.length,0);assert.equal(f.byId('yk790ScoreValue').textContent,'—');assert.equal(f.byId('yk790Resume').hidden,true)});
await run('Student: labels and verified score only',async()=>{const f=fixture({user:student,status:S,attempts:[successful,failed,unverified]});await tick();assert(f.byId('yk790MemberText').textContent.includes('Student · TRUCK'));assert(f.cards.every(c=>c.pill.textContent==='Student Access'));assert.equal(f.byId('yk790ScoreValue').textContent,'50%');assert.equal(f.byId('yk790ScoreBars').children.length,2);assert(f.calls.every(c=>c.method==='GET'&&c.cache==='no-store'))});
await run('Expired student: used free attempt requires plan',async()=>{const f=fixture({user:student,status:{linkedStudent:{name:'QA Student',access_state:'expired'},freeUsedTypes:['truck']}});await tick();assert.match(f.byId('yk790MemberText').textContent,/Expired/);assert.equal(f.cards.find(c=>c.dataset.examType==='truck').pill.textContent,'Plan required')});
await run('Paid plan: correct badges',async()=>{const f=fixture({user:paid,status:P});await tick();assert.match(f.byId('yk790MemberText').textContent,/Paid Plan/);assert(f.cards.every(c=>c.pill.textContent==='Plan Active'))});
await run('Resume: valid server-owned checkpoint only, no write',async()=>{const f=fixture({user:student,status:S,attempts:[start],checkpoints:{4:checkpoint}});await tick();assert.equal(f.byId('yk790Resume').hidden,false);assert.equal(f.byId('yk790ResumeLink').href,'/mock-second-license.html');assert.equal(f.byId('yk790ResumePercent').textContent,'21%');assert(f.calls.every(c=>c.method==='GET'))});
await run('Expired checkpoint: daily practice instead',async()=>{const f=fixture({user:student,status:S,attempts:[start],checkpoints:{4:{...checkpoint,endsAt:'2000-01-01T00:00:00Z'}}});await tick();assert.equal(f.byId('yk790Resume').hidden,true);assert.equal(f.byId('yk790Daily').hidden,false)});
await run('Desktop: mobile UI inactive',async()=>{const f=fixture({width:1440,user:student,status:S});await tick();assert.equal(f.byId('yk790MobileHome').hidden,true);assert.equal(f.calls.length,0)});
await run('Search submits exact Japanese, Burmese, spaces and encoded characters to real dictionary',async()=>{const f=fixture();await tick();for(const q of ['免許','မြန်မာ','  安全 運転  ','a&b?#','']){f.byId('yk790Search').value=q;f.byId('yk790Search').events.input();let prevented=false;f.byId('yk790QuickSearch').events.submit({preventDefault(){prevented=true}});assert(prevented);const url=new URL(f.location.assigned,'https://example.invalid');assert.equal(url.hash,'#driving-dictionary');assert.equal(url.searchParams.get('yk_dictionary_q'),q.trim()||null);assert.equal(f.byId('yk790DictionaryLink').href,f.location.assigned);assert(f.cards.every(c=>!c.hidden));}});
await run('Admin server role takes precedence even with used free attempt, student and paid',async()=>{const f=fixture({user:{id:'synthetic-admin',roles:[]},status:{roles:['admin'],...S,...P}});await tick();assert.match(f.byId('yk790MemberText').textContent,/Admin Access/);assert.equal(f.byId('yk790Membership').dataset.ykAccessState,'admin');assert(f.cards.every(c=>c.pill.textContent==='Admin Unlimited'&&c.pill.classes.has('is-verified')));f.state.user=null;f.winEvents['yk-identity-callback']();await tick();assert.match(f.byId('yk790MemberText').textContent,/Guest/);assert(f.cards.every(c=>c.pill.textContent==='Login required'));});
await run('Untrusted client role never grants Admin display; malformed status fails closed',async()=>{const f=fixture({user:{id:'synthetic-member',roles:['admin']},status:{roles:[],freeUsedTypes:['truck']}});await tick();assert.match(f.byId('yk790MemberText').textContent,/Verify student/);assert(!f.cards.some(c=>c.pill.textContent==='Admin Unlimited'));f.state.status={authenticated:false,roles:['admin']};f.winEvents['yk-identity-callback']();await tick();assert(f.cards.every(c=>c.pill.textContent==='Access unavailable'));});
await run('Account switching: old account data cleared before delayed responses',async()=>{const f=fixture({user:student,status:S,attempts:[successful,start],checkpoints:{4:checkpoint}});await tick();assert.equal(f.byId('yk790ScoreValue').textContent,'100%');assert.equal(f.byId('yk790Resume').hidden,false);f.state.user=paid;f.state.status=P;f.state.attempts=[];let release;f.state.delay=new Promise(r=>release=r);f.winEvents['yk-identity-callback']();await tick();try{assert.equal(f.byId('yk790WelcomeName').textContent,'');assert.equal(f.byId('yk790ScoreValue').textContent,'—');assert.equal(f.byId('yk790Resume').hidden,true);}finally{release();await tick()}});
await run('Account switching: failed response does not expose old account data',async()=>{const f=fixture({user:student,status:S,attempts:[successful]});await tick();f.state.user=paid;f.state.status=P;f.state.attempts=[];f.state.blockStatus=true;f.state.blockActivity=true;f.winEvents['yk-identity-callback']();await tick();assert(!f.byId('yk790WelcomeName').textContent.includes('QA Student'));assert.equal(f.byId('yk790ScoreValue').textContent,'—');assert(!f.cards.some(c=>c.pill.textContent==='Student Access'))});
await run('Logout: old student verification accent and data removed',async()=>{const f=fixture({user:student,status:S,attempts:[successful,start],checkpoints:{4:checkpoint}});await tick();assert(f.cards.every(c=>c.pill.classes.has('is-verified')));f.state.user=null;f.winEvents['yk-identity-callback']();await tick();assert.equal(f.byId('yk790WelcomeName').textContent,'');assert.equal(f.byId('yk790ScoreValue').textContent,'—');assert.equal(f.byId('yk790Resume').hidden,true);assert(f.cards.every(c=>!c.pill.classes.has('is-verified')&&c.pill.textContent==='Login required'))});
await run('Late failed checkpoint cannot hide newer account resume',async()=>{const f=fixture({user:student,status:S,attempts:[start],checkpoints:{4:checkpoint}});let rejectOld;f.state.checkpointOverride=path=>path.endsWith('=4')?new Promise((resolve,reject)=>rejectOld=reject):null;await tick();assert.equal(typeof rejectOld,'function');f.state.user=paid;f.state.status=P;f.state.attempts=[{...start,id:5}];f.state.checkpoints={5:checkpoint};f.winEvents['yk-identity-callback']();await tick();assert.equal(f.byId('yk790Resume').hidden,false);rejectOld(Error('Synthetic old request rejected'));await tick();assert.equal(f.byId('yk790Resume').hidden,false);assert.match(f.byId('yk790MemberText').textContent,/Paid Plan/)});
await run('Generated Exam: compact admin/student/paid, restore member/guest and hide loading/error offers',async()=>{
 const exam=fs.readFileSync('dist/mock-exams.html','utf8');
 assert(!exam.includes('အကောင့်တစ်ခုလျှင် အခမဲ့စာမေးပွဲ စုစုပေါင်း 1 ကြိမ် ရရှိပါတယ်။'));
 assert(exam.includes('စာမေးပွဲအမျိုးအစားတစ်ခုစီအတွက် အခမဲ့ 1 ကြိမ် ဖြေဆိုနိုင်ပါတယ်။'));
 const fragment=exam.slice(exam.indexOf('function fmtDateV739('),exam.indexOf('async function studentModal(){'));
 const nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,new E(id));return nodes.get(id)};
 const card=get('#online-mock-exam .yk-approved-access'),studentCard=get('.yk-audience-student'),publicCard=get('.yk-audience-public'),actions=get('.yk-public-actions'),compact=get('#yk791CompactAccount'),account=get('#examAccountV735');
 card.querySelector=q=>get(q);publicCard.querySelector=q=>get(q);compact.append=e=>e.parentElement=compact;actions.prepend=e=>e.parentElement=actions;account.parentElement=actions;
 let state={user:{id:'synthetic',roles:[]},status:{authenticated:true,roles:['admin']}};
 for(const id of ['#examStudentVerifyV728','#examPlansV728']){get(id).classList.add=()=>{};}
 const ctx=vm.createContext({$:get,window:{},document:{},cachedStatus:null,waitIdentity:async()=>({getUser:async()=>state.user}),api:async()=>({res:{ok:true},data:state.status}),v737Localize:()=>{},AbortController,setTimeout,clearTimeout,console});
 vm.runInContext(fragment,ctx);
 for(const [name,data,expected] of [['admin',{roles:['admin']},true],['student',{student:{class_name:'TAXI',expire_date:'2099-01-01'}},true],['paid',{paid:{expires_at:'2099-01-01'}},true],['member',{roles:[]},false],['pending',{pendingPayment:{}},false],['expired',{linkedStudent:{access_state:'expired'}},false]]){
  state.status={authenticated:true,...data};await vm.runInContext('syncStatus()',ctx);assert.equal(card.dataset.ykAccessState,name);assert.equal(publicCard.hidden,expected);assert.equal(studentCard.hidden,expected);assert.equal(compact.hidden,!expected);assert.equal(account.parentElement,expected?compact:actions);
 }
 state.user=null;await vm.runInContext('syncStatus()',ctx);assert.equal(card.dataset.ykAccessState,'guest');assert.equal(publicCard.hidden,false);
 state.user={roles:['admin']};state.status={authenticated:false,roles:['admin']};await vm.runInContext('syncStatus()',ctx);assert.equal(card.dataset.ykAccessState,'error');assert.equal(publicCard.hidden,true);assert.equal(compact.hidden,true);assert.equal(get('#yk791AccessRetry').hidden,false);
});
await run('Generated dictionary runtime reads Home query and renders real matching result',async()=>{
 const dictionary=fs.readFileSync('dist/assets/yk-dictionary-runtime-v7863.js','utf8');
 const elems=new Map();for(const id of ['dictionarySearch','dictionaryResults','dictionaryEmpty','dictionaryToolsV7','dictFavMode','dictRecentV7','dictCountV7','dictionaryLoadMore','dictionaryReportModal','dictionaryReportForm','dictReportStatus','dictReportSend','dictReportWord','dictReportCurrent','dictReportCancel']){const e=new E(id);e.value='';e.innerHTML='';e.querySelectorAll=()=>[];elems.set(id,e);}
 const window={location:{hash:'#driving-dictionary',search:'?yk_dictionary_q='+encodeURIComponent('免許')}};
 const ctx=vm.createContext({window,document:{getElementById:id=>elems.get(id)||null,querySelectorAll:()=>[]},localStorage:{getItem:()=>null,setItem:()=>{}},fetch:async()=>({ok:true,json:async()=>({overrides:[]})}),URLSearchParams,console,setTimeout(){},clearTimeout(){},navigator:{},SpeechSynthesisUtterance:function(){}});
 vm.runInContext(fs.readFileSync('dist/assets/yk-dictionary-v778-complete-draft.js','utf8'),ctx);vm.runInContext(fs.readFileSync('dist/assets/yk-dictionary-v783-overlay.js','utf8'),ctx);vm.runInContext(dictionary,ctx);
 assert.equal(elems.get('dictionarySearch').value,'免許');assert.match(elems.get('dictionaryResults').innerHTML,/လိုင်စင်/);
 assert(html.includes('yk-dictionary-runtime-v7863.js?v=7863-v7911'));
});
console.log('TOTAL',tests.filter(t=>t.pass).length+'/'+tests.length);
if(tests.some(t=>!t.pass))process.exitCode=1;
