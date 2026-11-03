/* v7.67 — Learning Analytics 2.0: reviewed, account-scoped data only.
   Data source: exam-my-activity (latest 50 attempts), optional yk-learning mistakes.
   No client-side synthetic scores or extra exam attempts. */
(function(global){
'use strict';
const periods=Object.freeze({all:null,7:7,30:30,90:90});
function timestamp(row){const t=Date.parse(row?.submitted_at||row?.started_at||'');return Number.isFinite(t)?t:null}
function inPeriod(row,period,now=Date.now()){
 if(period==='all'||!Object.hasOwn(periods,String(period)))return true;
 const t=timestamp(row),days=periods[String(period)];
 return t!==null && t<=now && t>=now-days*86400000;
}
function scope(attempts,type='all',period='all',now=Date.now()){
 return (Array.isArray(attempts)?attempts:[]).filter(a=>a &&
   (type==='all'||String(a.exam_type)===type) && inPeriod(a,String(period),now));
}
function verified(attempts,type='all',period='all',now=Date.now(),scores=global.YKLearningScoreV765){
 if(!scores||typeof scores.normalize!=='function')return [];
 return scope(attempts,type,period,now).filter(a=>scores.normalize(a)!==null && timestamp(a)!==null)
  .sort((a,b)=>timestamp(a)-timestamp(b)).map(a=>({...a,percent:scores.normalize(a)}));
}
function round(value){return Math.round(value*10)/10}
function summarize(attempts,type='all',period='all',now=Date.now(),scores=global.YKLearningScoreV765){
 const selected=scope(attempts,type,period,now),rows=verified(attempts,type,period,now,scores);
 const avg=rows.length?round(rows.reduce((n,a)=>n+a.percent,0)/rows.length):null;
 const passRate=rows.length?round(rows.filter(x=>x.passed===true).length*100/rows.length):null;
 const last=rows.slice(-3),prev=rows.slice(-6,-3);
 // A change metric is meaningful only for the same exam type and 3+3 verified results.
 const change=type!=='all' && last.length===3 && prev.length===3
   ?round(last.reduce((n,a)=>n+a.percent,0)/3-prev.reduce((n,a)=>n+a.percent,0)/3):null;
 return {attemptCount:selected.length,verifiedCount:rows.length,average:avg,passRate,passedCount:rows.filter(x=>x.passed===true).length,
  best:rows.length?Math.max(...rows.map(x=>x.percent)):null,change,rows,chartRows:rows.slice(-12),
  exclusions:selected.filter(x=>x.status==='submitted').length-rows.length};
}
function types(attempts){return [...new Set((Array.isArray(attempts)?attempts:[]).map(x=>String(x?.exam_type||'')).filter(Boolean))].sort((a,b)=>a.localeCompare(b))}
function performanceByType(attempts,period='all',now=Date.now(),scores=global.YKLearningScoreV765){
 return types(attempts).map(type=>({type,...summarize(attempts,type,period,now,scores)}))
  .filter(x=>x.verifiedCount>0).sort((a,b)=>b.verifiedCount-a.verifiedCount||b.average-a.average).slice(0,8);
}
function reviewPriorities(mistakes,type='all',limit=3){
 return (Array.isArray(mistakes)?mistakes:[]).filter(m=>m&&typeof m.question_text==='string'&&m.question_text.trim()&&
   (type==='all'||String(m.exam_type||'')===type))
   .map(m=>({...m,missed_count:Math.max(1,Number(m.missed_count)||1)}))
   .sort((a,b)=>b.missed_count-a.missed_count||Date.parse(b.last_missed||0)-Date.parse(a.last_missed||0))
   .slice(0,limit);
}
const api=Object.freeze({timestamp,inPeriod,scope,verified,summarize,types,performanceByType,reviewPriorities});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
global.YKLearningAnalyticsV767=api;
})(typeof window!=='undefined'?window:globalThis);
