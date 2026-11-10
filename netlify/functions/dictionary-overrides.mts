import { getDatabase } from '@netlify/database';
import { asResponse } from './_shared/auth.mts';
export default async function(req:Request){
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 try{
  const db=getDatabase();
  const rows=await db.sql<any>`SELECT word_id,jp,reading,mm FROM yk_dictionary_overrides ORDER BY approved_at DESC LIMIT 10000`;
  return Response.json({overrides:rows},{headers:{'Cache-Control':'public,max-age=60,stale-while-revalidate=120','X-Content-Type-Options':'nosniff'}});
 }catch(err){return asResponse(err)}
}
