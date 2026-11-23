/* v7.65 Learning graph math. No fake scores; use existing exam-my-activity only. */
(function(global){
'use strict';
const maxByType=Object.freeze({truck:50,taxi:50,bus:50,car:95,motorcycle:95,moped:48,maintenance:45});
function maxFor(type){const t=String(type||'').toLowerCase();return /^jlpt_n[1-5]$/.test(t)?180:(maxByType[t]??null)}
function normalize(attempt){
  if(!attempt||attempt.status!=='submitted'||attempt.score_verified!==true)return null;
  const max=maxFor(attempt.exam_type),value=Number(attempt.score);
  if(!max||attempt.score===null||attempt.score===undefined||!Number.isFinite(value)||value<0||value>max)return null;
  return Math.round(1000*value/max)/10;
}
function series(attempts,examType='all'){
  const list=Array.isArray(attempts)?attempts:[];
  return list.filter(a=>examType==='all'||a.exam_type===examType).filter(a=>normalize(a)!==null)
    .sort((a,b)=>new Date(a.submitted_at||a.started_at||0)-new Date(b.submitted_at||b.started_at||0))
    .slice(-8).map(a=>({score:normalize(a),date:a.submitted_at||a.started_at||null,examType:String(a.exam_type||'')}));
}
function types(attempts){return [...new Set((Array.isArray(attempts)?attempts:[]).map(x=>String(x.exam_type||'')))].filter(Boolean).sort()}
const api=Object.freeze({maxFor,normalize,series,types});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
global.YKLearningScoreV765=api;
})(typeof window!=='undefined'?window:globalThis);
