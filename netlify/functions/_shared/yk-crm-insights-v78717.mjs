/** Pure, input-limited aggregation for owner-entered CRM records only.
 * No visitor attribution, no class-payment verification, no YKCR join.
 */
export const PERIODS=Object.freeze(['7','30','90','all']);
export const STAGES=Object.freeze(['new','contacted','interested','enrolled','closed']);
export const COURSES=Object.freeze(['truck','taxi','bus','general']);
export const SOURCES=Object.freeze(['facebook','youtube','google','website','referral','manual','other']);
const bounded=(n)=>{const x=Number(n);return Number.isSafeInteger(x)&&x>=0?x:0};
export function periodDays(value){const key=value==null?'30':String(value);return PERIODS.includes(key)?(key==='all'?0:Number(key)):null;}
export function aggregateCohort(rows){
 const counts=Object.fromEntries(STAGES.map(s=>[s,0]));
 const byCourse=Object.fromEntries(COURSES.map(s=>[s,{total:0,enrolled:0,interested:0}]));
 const bySource=Object.fromEntries(SOURCES.map(s=>[s,{total:0,enrolled:0,interested:0}]));
 let total=0;
 for(const row of Array.isArray(rows)?rows:[]){
  const stage=String(row.status),course=String(row.course),source=String(row.lead_source),n=bounded(row.n);
  if(!STAGES.includes(stage)||!COURSES.includes(course)||!SOURCES.includes(source))continue;
  counts[stage]+=n;total+=n;byCourse[course].total+=n;bySource[source].total+=n;
  if(stage==='enrolled'){byCourse[course].enrolled+=n;bySource[source].enrolled+=n}
  if(stage==='interested'){byCourse[course].interested+=n;bySource[source].interested+=n}
 }
 // Stage share is current owner-entered CRM status, not paid conversion or marketing attribution.
 return {total,counts,active:counts.new+counts.contacted+counts.interested,
  enrolledStageSharePercent:total?Math.round(counts.enrolled/total*1000)/10:null,
  byCourse,bySource};
}
export function summarizeFollowups(row){return {overdue:bounded(row?.overdue),today:bounded(row?.today),
 next7Days:bounded(row?.next_7_days),unscheduled:bounded(row?.unscheduled)};}
