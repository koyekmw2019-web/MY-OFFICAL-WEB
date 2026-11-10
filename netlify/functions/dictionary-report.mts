import { createHash } from 'node:crypto';
import { getDatabase } from '@netlify/database';
import { asResponse } from './_shared/auth.mts';

const response = (data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const ISSUE_TYPES = new Set(['wrong_meaning','missing_meaning','reading','example','other']);
const MAX_BODY = 8192;

export default async function(req: Request) {
  if(req.method!=='POST') return response({error:'Method not allowed'},405);
  try {
    const origin=req.headers.get('origin');
    // Require a real same-site browser request; do not open this write API to other origins.
    if(!origin || origin!==new URL(req.url).origin) return response({error:'Invalid request origin'},403);
    if(!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')||'')) return response({error:'JSON required'},415);
    const raw=await req.text();
    if(Buffer.byteLength(raw,'utf8')>MAX_BODY) return response({error:'Report too large'},413);
    let data:any;
    try {data=JSON.parse(raw)} catch {return response({error:'Invalid JSON'},400)}
    if(!data || typeof data!=='object' || Array.isArray(data))return response({error:'Invalid report'},400);
    if(data.website) return response({ok:true},200); // honeypot: silently discard automated spam
    const jp=String(data.jp||'').trim();
    const reading=String(data.reading||'').trim();
    const wordId=String(data.wordId||'').trim();
    const reportedMeaning=String(data.reportedMeaning||'').trim();
    const suggestedMeaning=String(data.suggestedMeaning||'').trim();
    const details=String(data.details||'').trim();
    const issueType=String(data.issueType||'');
    if(!jp || jp.length>120 || reading.length>120 || wordId!==`${jp}¦${reading}` || wordId.length>250 || !ISSUE_TYPES.has(issueType))return response({error:'Invalid dictionary word or issue'},400);
    if(!details && !suggestedMeaning)return response({error:'Please describe the problem or suggest a meaning'},400);
    if(reportedMeaning.length>500||suggestedMeaning.length>500||details.length>1000)return response({error:'Text exceeds limit'},400);
    // Never persist the raw visitor IP. Salt is scoped to the deployment if available.
    const ip=(req.headers.get('x-nf-client-connection-ip')||req.headers.get('x-forwarded-for')||'unavailable').split(',')[0].trim();
    const salt=process.env.DICTIONARY_REPORT_SALT || process.env.NETLIFY_SITE_ID || 'v783-dictionary-feedback';
    const hash=createHash('sha256').update(`${salt}:${ip}`).digest('hex');
    const db=getDatabase();
    const recent=await db.sql<any>`SELECT COUNT(*)::int AS n FROM yk_dictionary_reports WHERE reporter_hash=${hash} AND reported_at>NOW()-INTERVAL '24 hours'`;
    if(Number(recent[0]?.n||0)>=6)return response({error:'Daily report limit reached. Please try tomorrow.'},429);
    const same=await db.sql<any>`SELECT id FROM yk_dictionary_reports WHERE reporter_hash=${hash} AND word_id=${wordId} AND status IN ('pending','needs_review') AND reported_at>NOW()-INTERVAL '7 days' LIMIT 1`;
    if(same.length)return response({ok:true,alreadyReported:true});
    await db.sql`INSERT INTO yk_dictionary_reports(word_id,jp,reading,reported_meaning,issue_type,suggested_meaning,details,reporter_hash)
      VALUES(${wordId},${jp},${reading},${reportedMeaning},${issueType},${suggestedMeaning},${details},${hash})`;
    return response({ok:true});
  } catch(err) {return asResponse(err)}
}
