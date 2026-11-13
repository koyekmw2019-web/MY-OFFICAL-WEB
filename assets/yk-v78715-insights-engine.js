/** v7.87.15 — evidence-aware device-local grammar review suggestions.
 * Existing v7.87.14 aggregates remain the source of truth; new events add recency/method detail only.
 * Not a diagnostic model, verified score or official JLPT result.
 */
import {LEVELS,EXPECTED_COUNTS,cleanState,validGrammarId} from './yk-v78714-engine.js';
export const INSIGHTS_KEY='yk_grammar_insights_v78715_v1';
export const EVENT_LIMIT=1200;
const DAY=86400000,MODES=new Set(['recall','choice','review','daily']),METHODS=new Set(['typed','choice','self']);
const validTime=x=>Number.isSafeInteger(x)&&x>0&&x<9000000000000;
export function cleanEvents(input){
 const raw=Array.isArray(input)?input:Array.isArray(input?.events)?input.events:[];
 return raw.slice(-EVENT_LIMIT*2).filter(e=>e&&validGrammarId(e.id)&&typeof e.correct==='boolean'&&METHODS.has(e.method)&&MODES.has(e.mode)&&validTime(e.at)).slice(-EVENT_LIMIT).map(e=>({id:e.id,correct:e.correct,method:e.method,mode:e.mode,at:e.at}));
}
export function addInsightEvent(old,event){const ok=cleanEvents([event]);if(ok.length!==1)throw Error('Invalid grammar insight event');return cleanEvents([...cleanEvents(old),ok[0]])}
function nextReview(streak,lastCorrect,updatedAt){if(!validTime(updatedAt))return null;if(!lastCorrect)return updatedAt;return updatedAt+(streak>=4?7:streak>=2?3:1)*DAY}
export function classify(record,now=Date.now()){
 const r=record||{},attempts=Number.isSafeInteger(r.attempts)?Math.max(0,r.attempts):0,wrong=Math.min(attempts,Number.isSafeInteger(r.wrong)?Math.max(0,r.wrong):0),streak=Number.isSafeInteger(r.streak)?Math.max(0,r.streak):0,lastCorrect=r.lastCorrect===true;
 if(!attempts)return {status:'unpracticed',priority:0,dueAt:null,limited:true,attempts,wrong,streak};
 const dueAt=nextReview(streak,lastCorrect,r.updatedAt),due=dueAt!==null&&dueAt<=now;
 let status='monitor',priority=0;
 if(!lastCorrect&&wrong>=2&&attempts>=2){status='repeated';priority=110+Math.min(wrong,20)}
 else if(!lastCorrect&&wrong>=1&&attempts>=2){status='recentError';priority=95}
 else if(!lastCorrect&&wrong>=1){status='oneError';priority=55}
 else if(due){status='due';priority=75+Math.min(wrong,10)}
 else if(lastCorrect&&wrong>0&&streak<2){status='recovering';priority=40+Math.min(wrong,10)}
 else if(attempts<3){status='limited';priority=10}
 return {status,priority,dueAt,limited:attempts<3,attempts,wrong,streak};
}
export function buildInsights(raw,level='N5',events=[],now=Date.now()){
 if(!LEVELS.includes(level))throw Error('Invalid JLPT level');
 const state=cleanState(raw),rows=[],counts={repeated:0,recentError:0,oneError:0,due:0,recovering:0,monitor:0,limited:0,unpracticed:0};
 for(const [id,record] of Object.entries(state.records)){
  if(!id.startsWith(level+'-'))continue;
  const c=classify(record,now);counts[c.status]++;
  rows.push({id,...c,correct:record.correct,lastCorrect:record.lastCorrect===true,updatedAt:record.updatedAt});
 }
 const active=rows.filter(x=>['repeated','recentError','oneError','due','recovering'].includes(x.status));active.sort((a,b)=>b.priority-a.priority||b.wrong-a.wrong||a.id.localeCompare(b.id));
 const fresh=cleanEvents(events).filter(x=>x.id.startsWith(level+'-')&&x.at<=now&&x.at>=now-7*DAY);
 const recent={count:fresh.length,correct:fresh.filter(x=>x.correct).length,selfRated:fresh.filter(x=>x.method==='self').length,autoChecked:fresh.filter(x=>x.method!=='self').length,
 days:Array.from({length:7},(_,i)=>{
  const start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-(6-i));const end=new Date(start);end.setDate(end.getDate()+1);
  const subset=fresh.filter(x=>x.at>=start.getTime()&&x.at<end.getTime());
  return {day:[start.getFullYear(),String(start.getMonth()+1).padStart(2,'0'),String(start.getDate()).padStart(2,'0')].join('-'),attempts:subset.length,correct:subset.filter(x=>x.correct).length};
 })};
 counts.unpracticed=Math.max(0,EXPECTED_COUNTS[level]-rows.length);
 return {level,total:EXPECTED_COUNTS[level],practiced:rows.length,counts,reviewCount:active.length,recommendations:active.slice(0,5),recent};
}
export function allLevelOverview(raw,events=[],now=Date.now()){return LEVELS.map(level=>buildInsights(raw,level,events,now))}
