/* STUDYING WITH YE KUN v7.86.3 — catalog and personal verified practice summaries.
   Presentation only. Server-owned access, payments, attempts and marks remain unchanged. */
(function(global){
'use strict';
const catalog=Object.freeze([
 {type:'truck',category:'ssw',label:'🚚 TRUCK',short:'TRUCK',max:50},
 {type:'taxi',category:'ssw',label:'🚕 TAXI',short:'TAXI',max:50},
 {type:'bus',category:'ssw',label:'🚌 BUS',short:'BUS',max:50},
 {type:'maintenance',category:'ssw',label:'🔧 自動車整備',short:'自動車整備',max:45},
 {type:'car',category:'driving',label:'🚗 普通自動車',short:'普通自動車',max:95},
 {type:'motorcycle',category:'driving',label:'🏍️ 二輪',short:'二輪',max:95},
 {type:'moped',category:'driving',label:'🛵 原付',short:'原付',max:48},
 ...['n5','n4','n3','n2','n1'].map(n=>({type:'jlpt_'+n,category:'jlpt',label:'🇯🇵 JLPT '+n.toUpperCase(),short:'JLPT '+n.toUpperCase(),max:180}))
]);
const supported=new Map(catalog.map(x=>[x.type,x]));
const catNames=Object.freeze({all:'All Exams',ssw:'SSW',driving:'Driving',jlpt:'JLPT'});
function list(category='all') {return catalog.filter(x=>category==='all'||x.category===category);}
function ratio(n,d){return d>0?Math.round(n*1000/d)/10:null;}
function verified(a){
 if(!a || a.status!=='submitted'||a.score_verified!==true)return false;
 const cat=supported.get(String(a.exam_type||''));
 const score=Number(a.score);
 return !!cat&&a.score!==null&&a.score!==undefined&&Number.isFinite(score)&&score>=0&&score<=cat.max;
}
function summarize(attempts,type){
 const cat=supported.get(type)||null;
 const matching=(Array.isArray(attempts)?attempts:[]).filter(x=>x&&x.exam_type===type);
 const submitted=matching.filter(x=>x.status==='submitted');
 const scores=submitted.filter(verified);
 const passKnown=scores.filter(x=>typeof x.passed==='boolean');
 const passed=passKnown.filter(x=>x.passed===true).length;
 const ordered=[...scores].sort((a,b)=>Date.parse(b.submitted_at||b.started_at||0)-Date.parse(a.submitted_at||a.started_at||0));
 const avg=cat&&scores.length?ratio(scores.reduce((s,x)=>s+Number(x.score),0),scores.length*cat.max):null;
 return {type,category:cat?.category||null,max:cat?.max||null,attempts:matching.length,submitted:submitted.length,verified:scores.length,
  excluded:submitted.length-scores.length,averagePercent:avg,passed,passKnown:passKnown.length,passRate:ratio(passed,passKnown.length),
  latest:ordered[0]?{score:Number(ordered[0].score),max:cat.max,percent:ratio(Number(ordered[0].score),cat.max),date:String(ordered[0].submitted_at||'').slice(0,10)}:null};
}
function allSummary(attempts,category='all'){const rows=list(category).map(x=>summarize(attempts,x.type));const used=rows.filter(x=>x.verified>0);
 return {verified:rows.reduce((s,x)=>s+x.verified,0),submitted:rows.reduce((s,x)=>s+x.submitted,0),represented:used.length,totalTypes:catalog.length,
  weakTypes:rows.filter(x=>x.verified>=2&&x.averagePercent!==null&&x.averagePercent<70).sort((a,b)=>a.averagePercent-b.averagePercent),rows};}
function mistakesFor(mistakes,type='all'){
 return (Array.isArray(mistakes)?mistakes:[]).filter(x=>x&&supported.has(String(x.exam_type||''))&&(type==='all'||x.exam_type===type)&&Number(x.missed_count)>0)
 .sort((a,b)=>Number(b.missed_count)-Number(a.missed_count)).slice(0,20);
}
const api=Object.freeze({catalog,catNames,list,summarize,allSummary,mistakesFor,verified,ratio});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
global.YKAllExamsV7863=api;
})(typeof window==='undefined'?globalThis:window);
