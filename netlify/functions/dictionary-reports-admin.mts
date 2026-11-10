import { getDatabase } from '@netlify/database';
import { verifyRequestOrigin } from '@netlify/identity';
import { requireAdmin,asResponse } from './_shared/auth.mts';
const reply=(d:unknown,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const statuses=new Set(['pending','approved','rejected','needs_review']);

export default async function(req:Request){
 try{
  const admin=await requireAdmin();
  const db=getDatabase();
  if(req.method==='GET'){
    const status=new URL(req.url).searchParams.get('status')||'pending';
    if(status!=='all'&&!statuses.has(status))return reply({error:'Invalid filter'},400);
    const rows=await db.sql<any>`SELECT id,word_id,jp,reading,reported_meaning,issue_type,suggested_meaning,details,status,review_note,reported_at,reviewed_at
      FROM yk_dictionary_reports WHERE (${status}='all' OR status=${status}) ORDER BY reported_at DESC LIMIT 150`;
    return reply({reports:rows});
  }
  if(req.method!=='POST')return reply({error:'Method not allowed'},405);
  verifyRequestOrigin(req);
  const raw=await req.text();
  if(Buffer.byteLength(raw,'utf8')>8192)return reply({error:'Payload too large'},413);
  const data=JSON.parse(raw);
  const id=Number(data?.id), action=String(data?.action||''), reviewNote=String(data?.note||'').trim(), approvedMeaning=String(data?.approvedMeaning||'').trim();
  if(!Number.isSafeInteger(id)||id<1||!['approve','reject','needs_review'].includes(action)||reviewNote.length>1000||approvedMeaning.length>500)return reply({error:'Invalid review'},400);
  if(action==='approve'&&!approvedMeaning)return reply({error:'Enter the approved Myanmar meaning'},400);
  const client=await db.pool.connect();
  try{
   await client.query('BEGIN');
   const row=await client.query('SELECT id,word_id,jp,reading,status FROM yk_dictionary_reports WHERE id=$1 FOR UPDATE',[id]);
   const current=row.rows[0];
   if(!current){await client.query('ROLLBACK');return reply({error:'Report not found'},404)}
   if(current.status!=='pending'&&current.status!=='needs_review'){
    await client.query('ROLLBACK');return reply({error:'Report already reviewed'},409);
   }
   const status=action==='approve'?'approved':action==='reject'?'rejected':'needs_review';
   if(action==='approve'){
    await client.query(`INSERT INTO yk_dictionary_overrides (word_id,jp,reading,mm,source_report_id,approved_by)
      VALUES($1,$2,$3,$4,$5,$6)
      ON CONFLICT(word_id) DO UPDATE SET mm=EXCLUDED.mm,source_report_id=EXCLUDED.source_report_id,approved_by=EXCLUDED.approved_by,approved_at=NOW()`,
      [current.word_id,current.jp,current.reading,approvedMeaning,id,admin.id]);
   }
   await client.query(`UPDATE yk_dictionary_reports SET status=$1,review_note=$2,reviewer_id=$3,reviewed_at=CASE WHEN $1='needs_review' THEN NULL ELSE NOW() END WHERE id=$4`,[status,reviewNote,admin.id,id]);
   await client.query('COMMIT');
   return reply({ok:true,status,liveOverride:action==='approve'});
  }catch(err){try{await client.query('ROLLBACK')}catch{}throw err}finally{client.release()}
 }catch(err){return asResponse(err)}
}
