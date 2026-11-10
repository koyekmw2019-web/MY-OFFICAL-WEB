import { getDatabase } from '@netlify/database';
import { requireUser, asResponse } from './_shared/auth.mts';
const types=new Set(['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n1','jlpt_n2','jlpt_n3','jlpt_n4','jlpt_n5']);
const privateHeaders={'Cache-Control':'private, no-store'};
const json=(body:any,status=200)=>Response.json(body,{status,headers:privateHeaders});
function futureDate(s:any){
 if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const date=new Date(s+'T00:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===s;
}
export default async(req:Request)=>{
 try{
  const user=await requireUser();
  const url=new URL(req.url);let type=url.searchParams.get('exam_type');
  let body:any={};
  if(req.method==='POST'){body=await req.json().catch(()=>({}));type=body.exam_type;}
  if(req.method!=='GET'&&req.method!=='POST')return json({error:'Method not allowed'},405);
  if(!types.has(String(type||'')))return json({error:'Invalid exam type'},400);
  const db=getDatabase();
  if(req.method==='POST'){
   // User-chosen target dates are planning inputs, not official exam announcements.
   if(!futureDate(body.target_date))return json({error:'Invalid target date'},400);
   const dateParts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
   const v=Object.fromEntries(dateParts.filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,x.value]));
   const nowJst=`${v.year}-${v.month}-${v.day}`;
   const days=(Date.parse(body.target_date+'T00:00:00Z')-Date.parse(nowJst+'T00:00:00Z'))/86400000;
   if(!Number.isInteger(days)||days<0||days>1096)return json({error:'Choose a date within the next 3 years'},400);
   await db.sql`INSERT INTO exam_coach_target_dates(user_id,exam_type,target_date) VALUES(${user.id},${type},${body.target_date}::date)
     ON CONFLICT(user_id,exam_type) DO UPDATE SET target_date=EXCLUDED.target_date,updated_at=NOW()`;
   return json({ok:true,targetDate:body.target_date});
  }
  const recent=await db.sql<any>`SELECT a.id,a.exam_type,a.score,a.passed,a.submitted_at,c.topic_stats
   FROM exam_attempts a JOIN exam_coach_topic_results c ON c.attempt_id=a.id AND c.user_id=a.user_id AND c.exam_type=a.exam_type
   WHERE a.user_id=${user.id} AND a.exam_type=${type} AND a.status='submitted' AND a.score_verified=TRUE
   ORDER BY a.submitted_at DESC LIMIT 1`;
  const dates=await db.sql<any>`SELECT target_date::text AS target_date FROM exam_coach_target_dates
   WHERE user_id=${user.id} AND exam_type=${type} LIMIT 1`;
  const r=recent[0];
  return json({examType:type,targetDate:dates[0]?.target_date||null,analysis:r?{
    attemptId:Number(r.id),examType:r.exam_type,score:Number(r.score),passed:r.passed===true,
    submittedAt:r.submitted_at,source:'verified_server_checkpoint',topics:Array.isArray(r.topic_stats)?r.topic_stats:(typeof r.topic_stats==='string'?JSON.parse(r.topic_stats):[])
  }:null, note:'Older exams lack archived checkpoint topic evidence. A new verified exam is required for topic analysis.'});
 }catch(e){
  if(e instanceof Response)return asResponse(e);
  console.error('exam coach request failed',e);
  return json({error:'Coaching data unavailable. Check whether database migration has been applied.'},503);
 }
};
