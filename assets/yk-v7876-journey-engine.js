/* STUDYING WITH YE KUN v7.87.6 — pure, read-only study-journey presentation.
 * No network calls, account mutation, exam submissions or persistent local data.
 * Verified score logic is delegated to the original YKAllExamsV7863 catalog.
 */
(function(global){
'use strict';
const allowed=new Set(['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1']);
const lessonRoutes=Object.freeze({
 truck:'/study/ssw-truck.html',taxi:'/study/ssw-taxi.html',bus:'/study/ssw-bus.html',
 maintenance:'/study/ssw-auto-maintenance.html',car:'/study/driving-license.html',motorcycle:'/study/driving-license.html',moped:'/study/driving-license.html'
});
function lesson(type){
 if(!allowed.has(type))return null;
 if(/^jlpt_n[1-5]$/.test(type))return '/study/jlpt-learning.html?level='+type.slice(-2).toUpperCase()+'&section=daily';
 return lessonRoutes[type];
}
function examUrl(type){return allowed.has(type)?'/exams/'+type+'.html':'/mock-exams.html';}
function model(attempts,type,source=global.YKAllExamsV7863){
 if(!allowed.has(type)||!source?.catalog?.some(x=>x.type===type)||typeof source.verified!=='function')return null;
 const meta=source.catalog.find(x=>x.type===type);
 const rows=Array.isArray(attempts)?attempts:[];
 const stats=source.summarize(rows,type);
 // Dates are required for chronology. Missing/invalid times must not be fabricated.
 const dated=rows.filter(x=>x&&x.exam_type===type&&source.verified(x))
  .map(x=>({time:Date.parse(x.submitted_at||x.started_at||''),score:Number(x.score)}))
  .filter(x=>Number.isFinite(x.time))
  .sort((a,b)=>a.time-b.time).slice(-5)
  .map(x=>({date:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(x.time)),score:x.score,percent:Math.round(x.score/meta.max*100)}));
 const needsReview=stats.verified>=2&&stats.averagePercent!==null&&stats.averagePercent<70;
 return {type,label:meta.short,max:meta.max,summary:stats,points:dated,
   needsReview,lessonUrl:lesson(type),examUrl:examUrl(type),
   guidance:stats.verified===0?'first':needsReview?'review':'continue',
   limitedHistory:true};
}
const api=Object.freeze({types:Object.freeze([...allowed]),lesson,examUrl,model});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
global.YKSmartJourneyV7876=api;
})(typeof window==='undefined'?globalThis:window);
