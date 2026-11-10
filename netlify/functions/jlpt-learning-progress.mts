import { getDatabase } from "@netlify/database";
import { requireUser, asResponse } from "./_shared/auth.mts";
const json=(x:unknown,status=200)=>Response.json(x,{status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
const validId=(x:unknown)=>typeof x==="string"&&/^N[1-5]-[vgkrl]-\d{1,4}$/.test(x);
function sanitize(raw:any){
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw new Error("Invalid state");
 const completed=[...new Set((Array.isArray(raw.completed)?raw.completed:[]).filter(validId))].slice(0,500);
 const bookmarkTimestamps:Record<string,number>={};
 if(raw.bookmarkTimestamps && typeof raw.bookmarkTimestamps==="object" && !Array.isArray(raw.bookmarkTimestamps)){
  for(const [key,val] of Object.entries(raw.bookmarkTimestamps)){
   if(validId(key)&&typeof val==="number"&&Number.isFinite(val)&&Math.abs(val)<9000000000000&&Object.keys(bookmarkTimestamps).length<500)bookmarkTimestamps[key]=Math.trunc(val);
  }
 }
 const dailyRuns=(Array.isArray(raw.dailyRuns)?raw.dailyRuns:[]).filter((x:any)=>x&& /^\d{4}-\d{2}-\d{2}$/.test(String(x.day))&&/^N[1-5]$/.test(String(x.level))&&[5,10,20].includes(x.count)&&Number.isInteger(x.correct)&&x.correct>=0&&x.correct<=x.count).slice(-180).map((x:any)=>({day:x.day,level:x.level,count:x.count,correct:x.correct,finishedAt:Math.trunc(Number(x.finishedAt)||0)}));
 const lastLevel=/^N[1-5]$/.test(String(raw.lastLevel))?raw.lastLevel:"N5";
 const lastLevelAt=Number.isFinite(raw.lastLevelAt)?Math.trunc(raw.lastLevelAt):0;
 const updatedAt=Number.isFinite(raw.updatedAt)?Math.trunc(raw.updatedAt):0;
 return {completed,bookmarkTimestamps,dailyRuns,lastLevel,lastLevelAt,updatedAt};
}
function mergeStates(oldRaw:any,newRaw:any){
 const a=sanitize(oldRaw||{}),b=sanitize(newRaw||{});
 const completed=[...new Set([...a.completed,...b.completed])].slice(0,500);
 const bookmarkTimestamps:Record<string,number>={};
 for(const id of new Set([...Object.keys(a.bookmarkTimestamps),...Object.keys(b.bookmarkTimestamps)])){
  const older=a.bookmarkTimestamps[id]||0,newer=b.bookmarkTimestamps[id]||0;
  bookmarkTimestamps[id]=Math.abs(newer)>=Math.abs(older)?newer:older;
 }
 const runs=new Map<string,any>();
 for(const x of [...a.dailyRuns,...b.dailyRuns]){
  const key=`${x.day}:${x.level}:${x.count}`,old=runs.get(key);
  if(!old||x.finishedAt>=old.finishedAt)runs.set(key,x);
 }
 const dailyRuns=[...runs.values()].sort((x,y)=>x.finishedAt-y.finishedAt).slice(-180);
 const lastLevel=b.lastLevelAt>=a.lastLevelAt?b.lastLevel:a.lastLevel;
 return {completed,bookmarkTimestamps,dailyRuns,lastLevel,lastLevelAt:Math.max(a.lastLevelAt,b.lastLevelAt),updatedAt:Math.max(a.updatedAt,b.updatedAt)};
}
export default async(req:Request)=>{
 try{
  if(req.method!=="GET"&&req.method!=="POST")return json({error:"Method not allowed"},405);
  const user=await requireUser();const db=getDatabase();
  if(req.method==="GET"){
   const rows=await db.sql<any>`SELECT state FROM yk_jlpt_learning_progress WHERE user_id=${user.id} LIMIT 1`;
   return json({state:rows[0]?.state??{}});
  }
  const raw=await req.text();if(raw.length>120000)return json({error:"State too large"},413);
  let parsed:any;try{parsed=JSON.parse(raw)}catch{return json({error:"Invalid JSON"},400)}
  const incoming=sanitize(parsed?.state);
  const existing=await db.sql<any>`SELECT state FROM yk_jlpt_learning_progress WHERE user_id=${user.id} LIMIT 1`;
  const clean=mergeStates(existing[0]?.state||{},incoming);
  const jsonState=JSON.stringify(clean);
  await db.sql`INSERT INTO yk_jlpt_learning_progress (user_id,state,client_updated_at)
    VALUES (${user.id},CAST(${jsonState} AS jsonb),${clean.updatedAt})
    ON CONFLICT(user_id) DO UPDATE SET state=EXCLUDED.state,client_updated_at=EXCLUDED.client_updated_at,updated_at=NOW()`;
  return json({ok:true});
 }catch(e){return asResponse(e)}
};
