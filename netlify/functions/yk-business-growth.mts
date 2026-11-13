/** v7.87.7: Admin-only aggregate reporting + manually confirmed accounting entries.
 * Not an enrollment payment provider; no alteration of existing exam or student records.
 * Dashboard deliberately DOES NOT calculate visitor->enrollment conversion without cohort data.
 */
import { getDatabase } from '@netlify/database';
import { requireAdmin, asResponse } from './_shared/auth.mts';
const respond=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const types=new Set(['confirmed_inquiries','enrollment_revenue','marketing_expense']);
const courses=new Set(['truck','taxi','bus','general']);
const source=(v:unknown)=>typeof v==='string'&&/^[a-z0-9][a-z0-9_-]*$/i.test(v)&&v.length<=48?v.toLowerCase():'unknown';
const count=(x:unknown)=>Number.isFinite(Number(x))?Math.max(0,Number(x)):0;
const dateValid=(s:unknown)=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s};
export default async(req:Request)=>{
  try{
    if(!['GET','POST','DELETE'].includes(req.method))return respond({error:'Method not allowed'},405);
    await requireAdmin();
    const db=getDatabase();
    if(req.method==='POST'||req.method==='DELETE'){
      if(req.headers.get('origin')!==new URL(req.url).origin)return respond({error:'Origin not allowed'},403);
      if(!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')||''))return respond({error:'JSON expected'},415);
      const size=Number(req.headers.get('content-length')||0);
      if(size>2048)return respond({error:'Too large'},413);
      const body:any=await req.json().catch(()=>null);
      if(req.method==='DELETE'){
        const id=Number(body?.id);
        if(!Number.isSafeInteger(id)||id<=0)return respond({error:'Invalid entry ID'},400);
        const removed=await db.sql<any>`DELETE FROM yk_growth_manual_entries WHERE id=${id} RETURNING id`;
        return respond({ok:removed.length===1,deleted:removed.length});
      }
      if(!body||!types.has(body.entryType)||!courses.has(body.course)||!dateValid(body.entryDay))return respond({error:'Invalid entry'},400);
      const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
      const jst=Object.fromEntries(parts.filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,x.value]));
      const currentDay=Date.parse(jst.year+'-'+jst.month+'-'+jst.day+'T00:00:00Z');
      const day=Date.parse(body.entryDay+'T00:00:00Z');
      if(day>currentDay||day<currentDay-3*366*86400000)return respond({error:'Choose a date from the last 3 years'},400);
      const units=Number(body.units),amount=Number(body.amountYen);
      if(!Number.isSafeInteger(units)||units<1||units>100||!Number.isSafeInteger(amount)||amount<0||amount>100000000)return respond({error:'Invalid count or amount'},400);
      if(body.entryType==='confirmed_inquiries'&&amount!==0)return respond({error:'Inquiry cannot be revenue'},400);
      if(body.entryType!=='confirmed_inquiries'&&units!==1)return respond({error:'Enter one revenue/cost record per save'},400);
      if(body.entryType==='marketing_expense'&&amount===0)return respond({error:'Marketing expense must be positive'},400);
      await db.sql`INSERT INTO yk_growth_manual_entries(entry_type,course,event_source,units,amount_yen,entry_day)
        VALUES (${body.entryType},${body.course},${source(body.source)},${units},${amount},${body.entryDay}::date)`;
      return respond({ok:true});
    }
    const daysString=new URL(req.url).searchParams.get('days')||'30';
    if(!['7','30','90'].includes(daysString))return respond({error:'Invalid range'},400);
    const days=Number(daysString);
    const [clicks,manual,students,examPayments,clickTotals,manualTotals,recentEntries]=await Promise.all([
      db.sql<any>`SELECT course,event_source,COUNT(*)::int clicks FROM yk_growth_click_events
        WHERE (created_at AT TIME ZONE 'Asia/Tokyo')::date >= (NOW() AT TIME ZONE 'Asia/Tokyo')::date - (${days}::int-1)
        GROUP BY course,event_source ORDER BY clicks DESC LIMIT 150`,
      db.sql<any>`SELECT entry_type,course,event_source,SUM(units)::int units,COALESCE(SUM(amount_yen),0)::bigint amount_yen
        FROM yk_growth_manual_entries WHERE entry_day >= (NOW() AT TIME ZONE 'Asia/Tokyo')::date - (${days}::int-1)
        GROUP BY entry_type,course,event_source ORDER BY entry_type,units DESC LIMIT 150`,
      db.sql<any>`SELECT COUNT(*)::int total,
        COUNT(*) FILTER (WHERE status='active' AND CURRENT_DATE BETWEEN class_start AND expire_date)::int active
        FROM exam_students`,
      db.sql<any>`SELECT COUNT(*) FILTER (WHERE status='approved')::int approved_count,
        COALESCE(SUM(amount_yen) FILTER (WHERE status='approved'),0)::bigint approved_amount_yen
        FROM exam_payment_requests WHERE deleted_at IS NULL AND approved_at >= NOW()-(${days}::int*INTERVAL '1 day')`,
      db.sql<any>`SELECT COUNT(*)::int total FROM yk_growth_click_events WHERE
        (created_at AT TIME ZONE 'Asia/Tokyo')::date >= (NOW() AT TIME ZONE 'Asia/Tokyo')::date - (${days}::int-1)`,
      db.sql<any>`SELECT entry_type,SUM(units)::int units,COALESCE(SUM(amount_yen),0)::bigint amount_yen
        FROM yk_growth_manual_entries WHERE entry_day >= (NOW() AT TIME ZONE 'Asia/Tokyo')::date - (${days}::int-1)
        GROUP BY entry_type`,
      db.sql<any>`SELECT id,entry_type,course,event_source,units,amount_yen,entry_day::text AS entry_day
        FROM yk_growth_manual_entries ORDER BY created_at DESC,id DESC LIMIT 30`
    ]);
    const lines=manual.map((r:any)=>({kind:String(r.entry_type),course:String(r.course),source:String(r.event_source),units:count(r.units),amountYen:count(r.amount_yen)}));
    const roll=(name:string)=>lines.filter(r=>r.kind===name).reduce((v,r)=>({count:v.count+r.units,amount:v.amount+r.amountYen}),{count:0,amount:0});
    const totalFor=(kind:string)=>{const r=manualTotals.find((x:any)=>x.entry_type===kind);return {count:count(r?.units),amount:count(r?.amount_yen)}};
    const income=totalFor('enrollment_revenue'),spend=totalFor('marketing_expense'),inquiries=totalFor('confirmed_inquiries');
    const clickItems=clicks.map((r:any)=>({course:String(r.course),source:String(r.event_source),clicks:count(r.clicks)}));
    return respond({periodDays:days,updatedAt:new Date().toISOString(),timezone:'Asia/Tokyo',
      visitorCount:null,confirmedWebsiteConversions:null,
      clicks:{total:count(clickTotals[0]?.total),rows:clickItems},
      manual:{inquiries:inquiries.count,enrollments:income.count,revenueYen:income.amount,
        marketingExpenseYen:spend.amount,afterRecordedMarketingYen:income.amount-spend.amount,rows:lines,
        recent:recentEntries.map((r:any)=>({id:Number(r.id),kind:String(r.entry_type),course:String(r.course),source:String(r.event_source),units:count(r.units),amountYen:count(r.amount_yen),day:String(r.entry_day)}))},
      students:{total:count(students[0]?.total),active:count(students[0]?.active),scope:'all_time_current_records_not_campaign_attributed'},
      examAccessPayments:{approvedCount:count(examPayments[0]?.approved_count),approvedRequestAmountYen:count(examPayments[0]?.approved_amount_yen),includedInClassRevenue:false},
      caveats:['Click counts are anonymous non-unique, may include repeat/bot traffic. Not confirmed inquiries.',
        'Manual inquiries and sales are owner-entered records, not verified against payment or YKCR.',
        'Visitors and campaign conversion rates are unavailable; manual entries and clicks may not share a cohort.',
        'After-recorded-marketing is NOT net profit; other costs and tax are excluded.']});
  }catch(e){
    if(e instanceof Response)return asResponse(e);
    console.error('Business growth analytics unavailable',e);
    return respond({error:'Growth analytics unavailable. Apply the v7.87.7 database migration and check Netlify logs.'},503);
  }
};
