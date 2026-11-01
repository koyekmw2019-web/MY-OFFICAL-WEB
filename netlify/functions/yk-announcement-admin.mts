import {getDatabase} from "@netlify/database";
import {requireAdmin,asResponse} from "./_shared/auth.mts";
export default async(req:Request)=>{try{
 await requireAdmin();const db=getDatabase();
 if(req.method==="GET")return Response.json({announcements:await db.sql<any>`SELECT id,title,body,language,published,created_at FROM yk_announcements ORDER BY created_at DESC LIMIT 60`});
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 const data=await req.json(), title=String(data.title||'').trim().slice(0,160),body=String(data.body||'').trim().slice(0,4000),lang=String(data.language||'all');
 if(!title||!body||!['all','my','ja','en'].includes(lang))return Response.json({error:'Invalid announcement'},{status:400});
 const rows=await db.sql<any>`INSERT INTO yk_announcements(title,body,language) VALUES(${title},${body},${lang}) RETURNING id`;
 return Response.json({ok:true,id:rows[0].id});
 }catch(e){return asResponse(e)} };
