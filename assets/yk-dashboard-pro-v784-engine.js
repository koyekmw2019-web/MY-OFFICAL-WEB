/* v7.84 — pure, testable recommendation & chart logic. No invented score data. */
(function(global){
'use strict';
const sections=['vocabulary','grammar','kanji','reading','listening'];
const levelPattern=/^N[1-5]$/;
const maxScores={truck:50,taxi:50,bus:50,car:95,motorcycle:95,moped:48,maintenance:45};
const percent=x=>x===null?'—':`${Number(x).toFixed(1).replace(/\.0$/,'')}%`;
const friendly=t=>String(t||'').replace(/^jlpt_/,'JLPT ').replaceAll('_',' ').toUpperCase();
const ratio=(numerator,denominator)=>denominator?Math.round(numerator*1000/denominator)/10:null;
function verifiedScore(a){
 if(!a || a.status!=='submitted' || a.score_verified!==true || !Number.isFinite(Number(a.score)) || a.score===null || a.score===undefined)return null;
 const type=String(a.exam_type||''),max=/^jlpt_n[1-5]$/.test(type)?180:maxScores[type];
 const score=Number(a.score);return max&&score>=0&&score<=max?ratio(score,max):null;
}
function examSummary(attempts){
 const groups=new Map();
 for(const a of Array.isArray(attempts)?attempts:[]){const p=verifiedScore(a);if(p===null)continue;
  const k=String(a.exam_type||'');if(!groups.has(k))groups.set(k,{type:k,count:0,sum:0,passed:0});
  const group=groups.get(k);group.count++;group.sum+=p;if(a.passed===true)group.passed++;
 }
 return [...groups.values()].map(g=>({...g,average:Math.round(g.sum*10/g.count)/10,passRate:ratio(g.passed,g.count)}))
  .sort((a,b)=>a.average-b.average||b.count-a.count);
}
function learningCoverage(state,content){
 const level=levelPattern.test(state?.lastLevel)?state.lastLevel:'N5';
 const completed=new Set(Array.isArray(state?.completed)?state.completed:[]),groups=content?.levels?.[level]||{};
 return sections.map(section=>{
  const lessons=Array.isArray(groups[section])?groups[section]:[];
  const total=lessons.length,done=lessons.filter(x=>completed.has(x.id)).length;
  return {section,level,done,total,percent:ratio(done,total)};
 }).filter(x=>x.total>0).sort((a,b)=>a.percent-b.percent||sections.indexOf(a.section)-sections.indexOf(b.section));
}
function examWeakness(attempts){return examSummary(attempts).filter(x=>x.count>=2 && x.average<70).slice(0,3)}
function recommendations({attempts=[],mistakes=[],state={},content=null,mistakesAvailable=true,progressAvailable=true}={}){
 const exams=examSummary(attempts),coverage=progressAvailable?learningCoverage(state,content):[];
 const missed=mistakesAvailable&&Array.isArray(mistakes)?mistakes
   .filter(x=>x && Number(x.missed_count)>0 && typeof x.exam_type==='string' && x.exam_type.length<50)
   .map(x=>({...x, missed_count:Math.max(1,Number(x.missed_count)||1)}))
   .sort((a,b)=>b.missed_count-a.missed_count).slice(0,50):[];
 const byExam=new Map();for(const m of missed){const t=m.exam_type;const old=byExam.get(t)||{type:t,totalMisses:0,questions:0};old.totalMisses+=Number(m.missed_count);old.questions++;byExam.set(t,old)}
 const mistakesByExam=[...byExam.values()].sort((a,b)=>b.totalMisses-a.totalMisses).slice(0,3);
 const focus=[];
 for(const e of mistakesByExam)focus.push({kind:'mistakes',title:`${friendly(e.type)} · Wrong Answer Review`,why:`${e.questions} saved question(s) · ${e.totalMisses} misses`,href:'#yk760Content',priority:0,examType:e.type});
 for(const w of examWeakness(attempts))focus.push({kind:'exam',title:`${friendly(w.type)} · Mock Exam Review`,why:`${percent(w.average)} average across ${w.count} verified attempts`,href:'/mock-exams.html',priority:1,examType:w.type});
 const lessonFocus=coverage.filter(c=>c.percent<100).slice(0,3);
 for(const c of lessonFocus)focus.push({kind:'coverage',title:`JLPT ${c.level} · ${c.section[0].toUpperCase()+c.section.slice(1)}`,why:`${c.done}/${c.total} lessons completed · study coverage (not a test score)`,href:`/study/jlpt-learning.html?level=${encodeURIComponent(c.level)}&section=${encodeURIComponent(c.section)}`,priority:2,section:c.section});
 const run=(Array.isArray(state?.dailyRuns)?state.dailyRuns:[]).filter(x=>x&&Number.isFinite(Number(x.correct))&&Number(x.count)>0),recent=run.slice(-10);
 const sum=recent.reduce((a,r)=>({count:a.count+Number(r.count),correct:a.correct+Number(r.correct)}),{count:0,correct:0});
 return {exams,weakExams:examWeakness(attempts),coverage,practiceAccuracy:ratio(sum.correct,sum.count),practiceCount:recent.length,
  mistakeFocus:mistakesByExam,mistakeQuestions:missed.length,focus:focus.sort((a,b)=>a.priority-b.priority).slice(0,5),
  sourceStatus:{mistakesAvailable,progressAvailable,verifiedExams:exams.reduce((n,x)=>n+x.count,0)}};
}
function series(rows,field,days,now=new Date()){
 // Date-only series uses calendar labels in JST. The backend supplies date strings.
 const map=new Map((Array.isArray(rows)?rows:[]).map(x=>[String(x.day).slice(0,10),Number(x[field]||0)]));
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const parts=today.split('-').map(Number),midnight=Date.UTC(parts[0],parts[1]-1,parts[2]);
 return Array.from({length:days},(_,i)=>{
  const day=new Date(midnight-(days-1-i)*86400000).toISOString().slice(0,10);
  return {day,value:Math.max(0,map.get(day)||0)};
 });
}
const api=Object.freeze({verifiedScore,examSummary,learningCoverage,examWeakness,recommendations,series,ratio,percent,friendly});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
global.YKDashboardProEngineV784=api;
})(typeof window==='undefined'?globalThis:window);
