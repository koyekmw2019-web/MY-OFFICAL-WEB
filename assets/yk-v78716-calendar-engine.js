/** YE KUN v7.87.16 — private-to-device study-goal and calendar calculations.
 * NO API calls; existing JLPT Grammar Practice sessions are the only automatic activity source.
 * Manual completions are SELF-REPORTED and NEVER count as grammar questions or official scores.
 */
import {cleanState,dayKey,LEVELS,STORAGE_KEY} from './yk-v78714-engine.js';
export const GOALS_KEY='yk_study_calendar_v78716_v1';
export const FOCUS=['grammar','vocabulary','kanji','reading','listening','review'];
const ALLOWED_DAILY=[5,10,20],DAY_MS=86400000;
const has=(a,x)=>a.includes(x);
const text=(v,max=140)=>String(typeof v==='string'?v:'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
export function dateFromKey(key){
 if(typeof key!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(key))return null;
 const [year,month,date]=key.split('-').map(Number);
 if(year<2000||year>2100)return null;
 const d=new Date(year,month-1,date,12,0,0,0);
 return d.getFullYear()===year&&d.getMonth()===month-1&&d.getDate()===date?d:null;
}
export function dateKey(d){return dayKey(d)}
export function offsetDay(key,offset){const d=dateFromKey(key);if(!d||!Number.isSafeInteger(offset)||Math.abs(offset)>3700)throw Error('Invalid day');d.setDate(d.getDate()+offset);return dateKey(d)}
export function monday(key){const d=dateFromKey(key);if(!d)throw Error('Invalid day');return offsetDay(key,-((d.getDay()+6)%7))}
export function cleanGoals(input){
 const src=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
 const plans={};
 const raw=src.plans&&typeof src.plans==='object'&&!Array.isArray(src.plans)?src.plans:{};
 for(const [key,v] of Object.entries(raw)){
  if(Object.keys(plans).length>=400)break;
  if(!dateFromKey(key)||!v||typeof v!=='object'||Array.isArray(v))continue;
  const focus=has(FOCUS,v.focus)?v.focus:'grammar';
  const level=has(LEVELS,v.level)?v.level:'N5';
  plans[key]={focus,level,note:text(v.note),manualDone:v.manualDone===true};
 }
 return {version:1,dailyQuestions:has(ALLOWED_DAILY,src.dailyQuestions)?src.dailyQuestions:10,
  weeklyDays:Number.isInteger(src.weeklyDays)&&src.weeklyDays>=1&&src.weeklyDays<=7?src.weeklyDays:3,
  targetLevel:has(LEVELS,src.targetLevel)?src.targetLevel:'N3',
  targetDate:dateFromKey(src.targetDate)?src.targetDate:'',plans};
}
export function updateGoals(source,changes){const v=cleanGoals(source),c=changes&&typeof changes==='object'?changes:{};
 return cleanGoals({...v,dailyQuestions:c.dailyQuestions??v.dailyQuestions,weeklyDays:c.weeklyDays??v.weeklyDays,
  targetLevel:c.targetLevel??v.targetLevel,targetDate:c.targetDate===undefined?v.targetDate:c.targetDate});
}
export function scheduleDay(source,day,entry){
 if(!dateFromKey(day))throw Error('Invalid date');
 const v=cleanGoals(source);if(!v.plans[day]&&Object.keys(v.plans).length>=400)throw Error('Calendar limit reached');
 v.plans[day]={focus:has(FOCUS,entry?.focus)?entry.focus:'grammar',level:has(LEVELS,entry?.level)?entry.level:v.targetLevel,
  note:text(entry?.note),manualDone:v.plans[day]?.manualDone===true};return cleanGoals(v);
}
export function unscheduleDay(source,day){if(!dateFromKey(day))throw Error('Invalid date');const v=cleanGoals(source);delete v.plans[day];return v}
export function setManualDone(source,day,done,today=dayKey()){
 if(!dateFromKey(day)||!dateFromKey(today)||day>today)throw Error('Cannot mark a future day completed');
 const v=cleanGoals(source);if(!v.plans[day])throw Error('Save a study plan first');v.plans[day].manualDone=done===true;return cleanGoals(v);
}
export function studyDays(rawGoals,rawPractice){
 const goal=cleanGoals(rawGoals),practice=cleanState(rawPractice),days=new Map();
 for(const s of practice.sessions){
  if(!dateFromKey(s.day))continue;
  const old=days.get(s.day)||{day:s.day,questions:0,sessions:0,manualDone:false,planned:false,focus:null,level:null};
  old.questions+=s.count;old.sessions++;days.set(s.day,old);
 }
 for(const [key,plan] of Object.entries(goal.plans)){
  const old=days.get(key)||{day:key,questions:0,sessions:0,manualDone:false,planned:false,focus:null,level:null};
  old.planned=true;old.manualDone=plan.manualDone;old.focus=plan.focus;old.level=plan.level;days.set(key,old);
 }
 for(const row of days.values()){
  row.studyDone=row.questions>0||row.manualDone;
  row.goalMet=row.questions>=goal.dailyQuestions; // Grammar questions ONLY; manual check-in cannot satisfy this metric.
  row.manuallyOnly=row.manualDone&&row.questions===0;
 }
 return days;
}
export function weekProgress(rawGoals,rawPractice,today=dayKey()){
 const goal=cleanGoals(rawGoals),days=studyDays(goal,rawPractice);const from=monday(today);
 const dates=Array.from({length:7},(_,i)=>offsetDay(from,i)),done=dates.filter(x=>x<=today&&days.get(x)?.studyDone).length;
 const automatic=dates.filter(x=>x<=today&&(days.get(x)?.questions||0)>0).length;
 const grammarQuestions=dates.reduce((n,x)=>n+(x<=today?days.get(x)?.questions||0:0),0);
 return {start:from,end:dates[6],done,target:goal.weeklyDays,met:done>=goal.weeklyDays,
  automatic,manualOnly:done-automatic,grammarQuestions};
}
export function streak(rawGoals,rawPractice,today=dayKey()){
 const days=studyDays(rawGoals,rawPractice);let cursor=today;
 if(!days.get(cursor)?.studyDone)cursor=offsetDay(cursor,-1);
 let count=0;while(count<400&&days.get(cursor)?.studyDone){count++;cursor=offsetDay(cursor,-1)}return count;
}
export function monthGrid(month,rawGoals,rawPractice){
 if(typeof month!=='string'||!/^\d{4}-\d{2}$/.test(month)||!dateFromKey(month+'-01'))throw Error('Invalid calendar month');
 const goal=cleanGoals(rawGoals),days=studyDays(goal,rawPractice),first=monday(month+'-01');
 const year=Number(month.slice(0,4)),mon=Number(month.slice(5,7));
 return Array.from({length:42},(_,i)=>{const key=offsetDay(first,i),row=days.get(key);
  return {day:key,inMonth:key.slice(0,7)===month,date:Number(key.slice(-2)),
   planned:row?.planned||false,manualDone:row?.manualDone||false,studyDone:row?.studyDone||false,
   grammarQuestions:row?.questions||0,goalMet:row?.goalMet||false,focus:row?.focus||null,level:row?.level||null};
 });
}
export function targetDays(rawGoals,today=dayKey()){
 const g=cleanGoals(rawGoals);if(!g.targetDate||!dateFromKey(today))return null;
 // UTC dates for day-only arithmetic, not local DST-sensitive timestamps.
 const [y,m,d]=g.targetDate.split('-').map(Number),[ty,tm,td]=today.split('-').map(Number);
 return Math.round((Date.UTC(y,m-1,d)-Date.UTC(ty,tm-1,td))/DAY_MS);
}
export {STORAGE_KEY};
