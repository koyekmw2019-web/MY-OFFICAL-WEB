import { getDatabase } from "@netlify/database";
import { requireUser, asResponse } from "./_shared/auth.mts";
const json=(data:any,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
export default async (req:Request)=>{try{
 const user=await requireUser(), db=getDatabase();
 if(req.method==="GET"){
  const mistakes=await db.sql<any>`SELECT id,exam_type,question_text,correct_answer,user_answer,explanation_ja,explanation_my,missed_count,last_missed FROM yk_learning_mistakes WHERE user_id=${user.id} ORDER BY last_missed DESC LIMIT 150`;
  const announcements=await db.sql<any>`SELECT id,title,body,language,created_at FROM yk_announcements WHERE published=TRUE ORDER BY created_at DESC LIMIT 12`;
  const attempts=await db.sql<any>`SELECT exam_type,score,passed,submitted_at FROM exam_attempts WHERE user_id=${user.id} AND status='submitted' ORDER BY submitted_at DESC LIMIT 100`;
  return json({mistakes,announcements,attempts});
 }
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 const body=await req.json().catch(()=>({}));
 if(body.action==="mistakes"){
   const attemptId=Number(body.attemptId);
   if(!Number.isSafeInteger(attemptId)||attemptId<=0)return json({error:"Invalid attempt"},400);
   const attempts=await db.sql<any>`SELECT exam_type,status FROM exam_attempts WHERE id=${attemptId} AND user_id=${user.id} LIMIT 1`;
   if(!attempts.length||attempts[0].status!=="submitted")return json({error:"Exam must be submitted first"},403);
   const entries=body.entries;
   if(!Array.isArray(entries)||entries.length>100)return json({error:"Invalid entries"},400);
   let saved=0;
   for(const item of entries){
    if(!item||typeof item.question!=='string'||typeof item.key!=='string'||typeof item.correct!=='string')continue;
    const key=item.key.slice(0,180),q=item.question.slice(0,4000),correct=item.correct.slice(0,1000),answer=String(item.answer??'').slice(0,1000),ja=String(item.ja??'').slice(0,4000),my=String(item.my??'').slice(0,4000);
    if(!key||!q||!correct)continue;
    await db.sql`INSERT INTO yk_learning_mistakes (user_id,exam_type,question_key,question_text,correct_answer,user_answer,explanation_ja,explanation_my)
      VALUES (${user.id},${attempts[0].exam_type},${key},${q},${correct},${answer},${ja},${my})
      ON CONFLICT(user_id,exam_type,question_key) DO UPDATE SET missed_count=yk_learning_mistakes.missed_count+1,last_missed=NOW(),user_answer=EXCLUDED.user_answer,correct_answer=EXCLUDED.correct_answer,explanation_ja=EXCLUDED.explanation_ja,explanation_my=EXCLUDED.explanation_my`;
    saved++;
   }
   return json({ok:true,saved});
 }
 return json({error:"Unknown action"},400);
 }catch(e){return asResponse(e)} };
