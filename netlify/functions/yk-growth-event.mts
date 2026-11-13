/** v7.87.7: Record anonymous *clicks only* on existing class inquiry links.
 * NEVER records names, emails, IPs, Identity IDs, cookies, UA or referrer URLs.
 * Metrics are indicative click counts, never unique visitors or confirmed leads.
 */
import { getDatabase } from '@netlify/database';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const courses=new Set(['truck','taxi','bus','general']);
const paths=new Set(['/study/ssw-truck.html','/study/ssw-taxi.html','/study/ssw-bus.html','/video-class.html',
  '/study/ssw-truck','/study/ssw-taxi','/study/ssw-bus','/video-class']);
const slug=(v:unknown,max=48,fallback='none')=>typeof v==='string'&&/^[a-z0-9][a-z0-9_-]*$/i.test(v)&&v.length<=max?v.toLowerCase():fallback;
export default async (req:Request)=>{
  if(req.method!=='POST')return json({error:'Method not allowed'},405);
  // Netlify previews and production both use their actual same-origin host.
  const host=new URL(req.url).origin;
  if(req.headers.get('origin')!==host || (req.headers.get('sec-fetch-site')&&!['same-origin','none'].includes(req.headers.get('sec-fetch-site')!)))
    return json({error:'Origin not allowed'},403);
  if(!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')||''))return json({error:'JSON expected'},415);
  const size=Number(req.headers.get('content-length')||0);
  if(size>2048)return json({error:'Event too large'},413);
  const body:any=await req.json().catch(()=>null);
  if(!body||body.event!=='class_cta_click'||!courses.has(body.course)||!paths.has(body.page))return json({error:'Invalid event'},400);
  const source=slug(body.source,48,'direct'),medium=slug(body.medium,48,'none'),campaign=slug(body.campaign,64,'none');
  try{
    const db=getDatabase();
    await db.sql`INSERT INTO yk_growth_click_events(event_type,course,event_source,event_medium,event_campaign,page_path)
      VALUES ('class_cta_click',${body.course},${source},${medium},${campaign},${body.page})`;
    return new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});
  }catch(e){console.error('Growth click event unavailable',e);return json({error:'Click measurement unavailable'},503);}
};
