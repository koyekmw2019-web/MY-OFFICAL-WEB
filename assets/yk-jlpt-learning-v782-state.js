/* v7.82 — separate JLPT learning state; does not touch exam attempts/payment/YKCR. */
(function(global){
 'use strict';
 const LEVELS=['N5','N4','N3','N2','N1'],PREFIX='yk_jlpt_learning_v782:';
 const uniq=(xs,limit)=>[...new Set((Array.isArray(xs)?xs:[]).filter(x=>typeof x==='string' && /^N[1-5]-[vgkrl]-\d{1,4}$/.test(x)))].slice(0,limit);
 const empty=()=>({completed:[],bookmarkTimestamps:{},dailyRuns:[],lastLevel:'N5',lastLevelAt:0,updatedAt:0});
 const clean=(value)=>{
  const s=empty(),v=value&&typeof value==='object'?value:{};
  s.completed=uniq(v.completed,500);
  if(v.bookmarkTimestamps&&typeof v.bookmarkTimestamps==='object'&&!Array.isArray(v.bookmarkTimestamps)){
   for(const [id,t] of Object.entries(v.bookmarkTimestamps)){
    if(/^N[1-5]-[vgkrl]-\d{1,4}$/.test(id) && Number.isFinite(Number(t)) && Math.abs(Number(t))<9000000000000 && Object.keys(s.bookmarkTimestamps).length<500) s.bookmarkTimestamps[id]=Math.trunc(Number(t));
   }
  }
  const daily=Array.isArray(v.dailyRuns)?v.dailyRuns:[];
  s.dailyRuns=daily.filter(x=>x&&/^\d{4}-\d{2}-\d{2}$/.test(String(x.day)) && LEVELS.includes(x.level) && [5,10,20].includes(Number(x.count)) && Number.isSafeInteger(x.correct) && x.correct>=0 && x.correct<=x.count).slice(-180).map(x=>({day:x.day,level:x.level,count:x.count,correct:x.correct,finishedAt:Math.min(Number(x.finishedAt)||0,9000000000000)}));
  s.lastLevel=LEVELS.includes(v.lastLevel)?v.lastLevel:'N5';
  s.lastLevelAt=Number(v.lastLevelAt)||0;s.updatedAt=Number(v.updatedAt)||0;
  return s;
 };
 const merge=(local,cloud)=>{
  const a=clean(local),b=clean(cloud),merged=empty();
  merged.completed=uniq([...a.completed,...b.completed],500);
  for(const id of new Set([...Object.keys(a.bookmarkTimestamps),...Object.keys(b.bookmarkTimestamps)]))merged.bookmarkTimestamps[id]=Math.abs(a.bookmarkTimestamps[id]||0)>=Math.abs(b.bookmarkTimestamps[id]||0)?a.bookmarkTimestamps[id]:b.bookmarkTimestamps[id];
  const runs=new Map();for(const run of [...b.dailyRuns,...a.dailyRuns]){const key=`${run.day}:${run.level}:${run.count}`,old=runs.get(key);if(!old || run.finishedAt>=old.finishedAt)runs.set(key,run)}
  merged.dailyRuns=[...runs.values()].sort((x,y)=>x.finishedAt-y.finishedAt).slice(-180);
  const recent=a.lastLevelAt>=b.lastLevelAt?a:b;merged.lastLevel=recent.lastLevel;merged.lastLevelAt=recent.lastLevelAt;
  merged.updatedAt=Math.max(a.updatedAt,b.updatedAt);
  return clean(merged);
 };
 let current=empty(),scope='guest',cloud=false,syncTimer=null,syncing=false;
 const listeners=new Set();
 const key=()=>PREFIX+scope;
 function emit(){for(const f of listeners){try{f(snapshot())}catch(e){console.error(e)}}}
 function snapshot(){return clean(current)}
 function storageRead(){try{return clean(JSON.parse(localStorage.getItem(key())||'{}'))}catch{return empty()}}
 function storageWrite(){try{localStorage.setItem(key(),JSON.stringify(current))}catch{}}
 async function remote(method,body){const res=await fetch('/.netlify/functions/jlpt-learning-progress',{method,credentials:'same-origin',cache:'no-store',headers:method==='POST'?{'Content-Type':'application/json'}:{},body:body?JSON.stringify({state:body}):undefined});if(!res.ok)throw Error('Cloud unavailable ('+res.status+')');return res.json()}
 async function sync(){if(!cloud||syncing)return;syncing=true;try{await remote('POST',snapshot())}catch(e){cloud=false;emit()}finally{syncing=false}}
 function schedule(){if(!cloud)return;clearTimeout(syncTimer);syncTimer=setTimeout(sync,950)}
 function write(mutator){mutator(current);current.updatedAt=Date.now();current=clean(current);storageWrite();emit();schedule()}
 async function init(){
  let user=null;
  try{user=await global.YKIdentity?.getUser?.()}catch{}
  const next=user&&typeof user.id==='string'&&user.id.length<200?'account:'+user.id:'guest';
  if(scope!==next){scope=next;cloud=false;clearTimeout(syncTimer)}
  current=storageRead();emit();
  if(user){try{const result=await remote('GET');current=merge(current,result.state);storageWrite();cloud=true;emit();schedule()}catch{cloud=false;emit()}}
  return snapshot();
 }
 const progress=(s,content,level)=>{
  const list=content?.levels?.[level]||{};const ids=Object.values(list).flat().filter(v=>v&&v.id).map(x=>x.id),finished=ids.filter(id=>s.completed.includes(id)).length;
  return {completed:finished,total:ids.length,percent:ids.length?Math.round(100*finished/ids.length):0};
 };
 const bookmarks=(s)=>Object.entries(s.bookmarkTimestamps).filter(([,t])=>t>0).map(([id])=>id);
 const api={LEVELS,clean,merge,progress,bookmarks,init,snapshot,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},isSaved(id){return !!(current.bookmarkTimestamps[id]>0)},isDone(id){return current.completed.includes(id)},toggleSaved(id){if(!/^N[1-5]-[vgkrl]-\d+$/.test(id))return;write(s=>{const now=Date.now();s.bookmarkTimestamps[id]=s.bookmarkTimestamps[id]>0?-now:now})},markDone(id){if(!/^N[1-5]-[vgkrl]-\d+$/.test(id))return;write(s=>{if(!s.completed.includes(id))s.completed.push(id)})},setLevel(level){if(!LEVELS.includes(level))return;write(s=>{s.lastLevel=level;s.lastLevelAt=Date.now()})},addDaily(run){write(s=>{s.dailyRuns=merge(s,{dailyRuns:[run]}).dailyRuns})},getScope(){return scope},isCloud(){return cloud}};
 global.YKJLPTStateV782=api;
})(window);
