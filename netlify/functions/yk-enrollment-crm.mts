/** STUDYING WITH YE KUN v7.87.8 — Admin-only prospective lead CRM.
 * Not a public inquiry form; does NOT create YKCR students, Identity accounts,
 * exam access, invoices, revenue entries, or send Messenger messages.
 */
import {getDatabase} from '@netlify/database';
import {requireAdmin,asResponse} from './_shared/auth.mts';
import {validateLead,validId} from './_shared/yk-crm-validation-v7878.mjs';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const allowed=new Set(['GET','POST','PUT','DELETE']);
export default async(req:Request)=>{
 try{
  if(!allowed.has(req.method))return reply({error:'Method not allowed'},405);
  await requireAdmin();
  const db=getDatabase();
  if(req.method==='GET'){
   // Show no more than 100 latest leads; all-time counts have an explicit different grain.
   const [leads,summary]=await Promise.all([
    db.sql<any>`SELECT id,prospect_name,contact_channel,contact_reference,course,lead_source,status,
      followup_date::text AS followup_date,notes,student_code,created_at,updated_at
      FROM yk_enrollment_leads ORDER BY updated_at DESC,id DESC LIMIT 100`,
    db.sql<any>`SELECT status,COUNT(*)::int n,
      COUNT(*) FILTER (WHERE followup_date IS NOT NULL AND followup_date<=(NOW() AT TIME ZONE 'Asia/Tokyo')::date
        AND status NOT IN ('enrolled','closed'))::int due
      FROM yk_enrollment_leads GROUP BY status`
   ]);
   return reply({asOf:new Date().toISOString(),listScope:'latest_100_modified',summaryScope:'all_time',
    leads:leads.map((r:any)=>({id:Number(r.id),name:String(r.prospect_name),channel:String(r.contact_channel),
      contact:String(r.contact_reference),course:String(r.course),source:String(r.lead_source),status:String(r.status),
      followUpDate:r.followup_date||null,notes:String(r.notes||''),studentCode:r.student_code||null,
      createdAt:r.created_at,updatedAt:r.updated_at})),
    summary:{counts:Object.fromEntries(summary.map((r:any)=>[String(r.status),Number(r.n)||0])),
      due:summary.reduce((n:number,r:any)=>n+(Number(r.due)||0),0)}});
  }
  // Mutations: authenticated admin + same-origin browser request, JSON only.
  if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Origin not allowed'},403);
  if(!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')||''))return reply({error:'JSON expected'},415);
  if(Number(req.headers.get('content-length')||'0')>6400)return reply({error:'Entry too large'},413);
  const body:any=await req.json().catch(()=>null);
  if(req.method==='DELETE'){
   const id=validId(body?.id);if(!id)return reply({error:'Invalid id'},400);
   const removed=await db.sql<any>`DELETE FROM yk_enrollment_leads WHERE id=${id} RETURNING id`;
   return reply({ok:removed.length===1,removed:removed.length});
  }
  const parsed=validateLead(body);if(!parsed.ok)return reply({error:parsed.error},400);
  const v=parsed.value!;
  if(req.method==='POST'){
   const rows=await db.sql<any>`INSERT INTO yk_enrollment_leads
    (prospect_name,contact_channel,contact_reference,course,lead_source,status,followup_date,notes,student_code)
    VALUES (${v.name},${v.channel},${v.contact},${v.course},${v.source},${v.status},${v.followUpDate}::date,${v.notes},${v.studentCode}) RETURNING id`;
   return reply({ok:true,id:Number(rows[0].id)},201);
  }
  const id=validId(body?.id);if(!id)return reply({error:'Invalid id'},400);
  const rows=await db.sql<any>`UPDATE yk_enrollment_leads SET prospect_name=${v.name},contact_channel=${v.channel},
    contact_reference=${v.contact},course=${v.course},lead_source=${v.source},status=${v.status},
    followup_date=${v.followUpDate}::date,notes=${v.notes},student_code=${v.studentCode},updated_at=NOW()
    WHERE id=${id} RETURNING id`;
  return reply({ok:rows.length===1,id:rows.length?id:null},rows.length?200:404);
 }catch(e){if(e instanceof Response)return asResponse(e);
  console.error('Enrollment CRM request failed',e);
  return reply({error:'CRM unavailable. Check admin role and v7.87.8 database migration.'},503);
 }
};
