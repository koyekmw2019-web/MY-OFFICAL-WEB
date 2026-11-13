/** v7.87.17 — Admin-only, read-only enrollment pipeline and follow-up insights.
 * Uses the existing v7.87.8 yk_enrollment_leads table. NO new DB migration,
 * no public form, no contact-message automation, no YKCR/payment writes.
 */
import {getDatabase} from '@netlify/database';
import {requireAdmin,asResponse} from './_shared/auth.mts';
import {periodDays,aggregateCohort,summarizeFollowups} from './_shared/yk-crm-insights-v78717.mjs';
const respond=(body:unknown,status=200)=>Response.json(body,{status,headers:{
 'Cache-Control':'private, no-store, max-age=0','Vary':'Cookie','X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'no-referrer'
}});
export default async(req:Request)=>{
 try{
  if(req.method!=='GET')return respond({error:'Method not allowed'},405);
  await requireAdmin(); // Important: auth before DB access or private data.
  const u=new URL(req.url),days=periodDays(u.searchParams.get('days'));
  if(days===null)return respond({error:'Invalid period. Use 7, 30, 90, or all.'},400);
  const db=getDatabase();
  const [cohortRows,followupStats,dueRows]=await Promise.all([
   db.sql<any>`SELECT course,lead_source,status,COUNT(*)::int AS n FROM yk_enrollment_leads
     WHERE (${days}::int=0 OR (created_at AT TIME ZONE 'Asia/Tokyo')::date >=
       (NOW() AT TIME ZONE 'Asia/Tokyo')::date - (${days}::int-1))
     GROUP BY course,lead_source,status`,
   db.sql<any>`SELECT
       COUNT(*) FILTER (WHERE followup_date < (NOW() AT TIME ZONE 'Asia/Tokyo')::date)::int overdue,
       COUNT(*) FILTER (WHERE followup_date = (NOW() AT TIME ZONE 'Asia/Tokyo')::date)::int today,
       COUNT(*) FILTER (WHERE followup_date > (NOW() AT TIME ZONE 'Asia/Tokyo')::date AND
         followup_date <= (NOW() AT TIME ZONE 'Asia/Tokyo')::date + 7)::int next_7_days,
       COUNT(*) FILTER (WHERE followup_date IS NULL)::int unscheduled
     FROM yk_enrollment_leads WHERE status IN ('new','contacted','interested')`,
   db.sql<any>`SELECT id,prospect_name,course,lead_source,status,
       followup_date::text AS followup_date FROM yk_enrollment_leads
     WHERE status IN ('new','contacted','interested')
       AND followup_date <= (NOW() AT TIME ZONE 'Asia/Tokyo')::date
     ORDER BY followup_date ASC,id ASC LIMIT 20`
  ]);
  const cohort=aggregateCohort(cohortRows);
  const followups=summarizeFollowups(followupStats[0]);
  return respond({asOf:new Date().toISOString(),timezone:'Asia/Tokyo',periodDays:days||null,
   cohortBasis:'created_at_in_selected_period__current_status_as_of_now',
   statusSource:'admin_entered_crm_only',
   cohort,followups:{...followups,scope:'all_active_leads_irrespective_of_selected_period',
    dueSample:dueRows.map((r:any)=>({id:Number(r.id),name:String(r.prospect_name),
      course:String(r.course),source:String(r.lead_source),status:String(r.status),
      date:String(r.followup_date)})),sampleLimit:20},
   caveats:[
    'CRM source and status are owner-entered; enrolled status does not prove class payment or YKCR verification.',
    'Current status for leads created within the selected period is a snapshot, not a historical event funnel.',
    'Due follow-ups cover all active leads regardless of selected period; this list has up to 20 rows.',
    'Anonymous website CTA clicks and separate manual business ledger are not joined to CRM leads.',
    'No visitor counts, campaign conversion rate, class net profit, or automated Messenger contact.'
   ]});
 }catch(e){
  if(e instanceof Response)return asResponse(e);
  console.error('Admin enrollment insights unavailable',e);
  return respond({error:'Enrollment insights unavailable. Check admin access and v7.87.8 CRM migration.'},503);
 }
};
