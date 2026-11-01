import { getDatabase } from '@netlify/database';
import { requireUser, asResponse } from './_shared/auth.mts';
import { examScoreRules, sectionDurations, checkpointGraceSeconds } from './_shared/exam-autosave.mts';
import { evaluateSnapshot } from './_shared/exam-score-v763.mts';

/** v7.63 — only server-recomputed practice results can be persisted.
 * Client score, passed, and section totals are never trusted. */
export default async (req:Request)=>{
 try {
  if(req.method!=='POST')return new Response('Method not allowed',{status:405});
  const user=await requireUser();
  const body=await req.json();
  const id=Number(body.attemptId);
  if(!Number.isSafeInteger(id)||id<=0)return Response.json({error:'Invalid attempt'},{status:400});
  const db=getDatabase();
  const [attempt]=await db.sql<any>`SELECT id,exam_type,started_at,status,score,passed,score_verified FROM exam_attempts
     WHERE id=${id} AND user_id=${user.id} LIMIT 1`;
  if(!attempt)return Response.json({error:'Attempt not found'},{status:404});
  if(attempt.status==='submitted')return Response.json({ok:true,alreadySubmitted:true,
       score:attempt.score,passed:attempt.passed,scoreVerified:attempt.score_verified});
  if(attempt.status!=='started')return Response.json({error:'Attempt is no longer active'},{status:409});
  const rule=examScoreRules[attempt.exam_type];
  if(!rule)return Response.json({error:'Unknown exam type'},{status:400});
  if(Date.now()-new Date(attempt.started_at).getTime() < rule.minimumElapsedSeconds*1000)
    return Response.json({error:'Attempt submitted too soon'},{status:409});

  // Mandatory checkpoint: no browser-provided 180/180 can substitute for saved answers.
  const [cp]=await db.sql<any>`SELECT phase_index,ends_at,snapshot,version FROM exam_attempt_checkpoints
    WHERE attempt_id=${id} AND user_id=${user.id} LIMIT 1`;
  if(!cp)return Response.json({error:'missing_checkpoint',hint:'Save and sync your exam before submitting.'},{status:409});
  const finalPhase=(sectionDurations[attempt.exam_type]?.length??1)-1;
  if(cp.phase_index!==finalPhase)return Response.json({error:'unfinished_sections'},{status:409});
  const deadline=new Date(cp.ends_at).getTime();
  if(!Number.isFinite(deadline)||Date.now()>deadline+checkpointGraceSeconds*1000)
    return Response.json({error:'time_expired',hint:'Submission window ended.'},{status:409});
  let result;
  try{result=evaluateSnapshot(attempt.exam_type,cp.snapshot)}
  catch(e){return Response.json({error:'invalid_checkpoint',detail:String((e as Error).message)},{status:422})}
  const onLastQuestion=cp.snapshot?.index === (attempt.exam_type.startsWith('jlpt_') ? 19 : result.count-1);
  // Earlier submit is legal only when the server timer has expired (automatic submit).
  if(!onLastQuestion && Date.now()<deadline)
    return Response.json({error:'exam_not_finished',hint:'Finish the final question or wait for the timer.'},{status:409});
  if(attempt.exam_type.startsWith('jlpt_') && Date.now()<deadline &&
     !(Array.isArray(cp.snapshot?.audioDone)&&cp.snapshot.audioDone.includes(19)))
    return Response.json({error:'listening_not_finished'},{status:409});
  if(!Number.isSafeInteger(result.score)||result.score<0||result.score>rule.max)
    return Response.json({error:'Server scoring error'},{status:500});
  // A stale browser result must not overwrite the authoritative score.
  if(body.score!==undefined && body.score!==null && body.score!==result.score)
    return Response.json({error:'score_mismatch',scoreVerified:false,
      hint:'Saved answers and displayed score differ. Refresh the exam and retry.'},{status:409});

  // Atomic conditions protect against concurrent request, expiration, and missing checkpoint.
  const updated=await db.sql<any>`UPDATE exam_attempts a SET status='submitted',score=${result.score},
    passed=${result.passed},score_verified=TRUE,submitted_at=NOW()
    WHERE a.id=${id} AND a.user_id=${user.id} AND a.status='started'
      AND EXISTS (SELECT 1 FROM exam_attempt_checkpoints c
        WHERE c.attempt_id=a.id AND c.user_id=${user.id}
          AND c.phase_index=${finalPhase} AND c.version=${cp.version}
          AND NOW() <= c.ends_at + INTERVAL '60 seconds')
    RETURNING a.id`;
  if(!updated.length)return Response.json({error:'submission_conflict_or_expired'},{status:409});

  // Existing optional review data: accepted only for matched checkpoint question IDs.
  // These descriptions are from the browser and are not considered server-verified.
  try {
   const mistakes=body.mistakes;
   if(Array.isArray(mistakes)&&mistakes.length<=100&&JSON.stringify(mistakes).length<110000){
    const snapshot=cp.snapshot, known=new Set<string>();
    if(snapshot?.engine==='maintenance'&&Array.isArray(snapshot.items)){
      for(const q of snapshot.items)if(typeof q?.q==='string')known.add(q.q.slice(0,180));
    }else if(snapshot?.engine==='jlpt'&&Array.isArray(snapshot.stages)){
      for(const stage of snapshot.stages)if(Array.isArray(stage))for(const q of stage)
        if(typeof q?.id==='string')known.add(q.id.slice(0,180));
    }
    for(const m of mistakes){
      if(!m||typeof m.key!=='string'||!known.has(m.key.slice(0,180))||typeof m.question!=='string'||typeof m.correct!=='string')continue;
      const k=m.key.slice(0,180),q=m.question.slice(0,4000),correct=m.correct.slice(0,1000),
        answer=String(m.answer??'').slice(0,1000),ja=String(m.ja??'').slice(0,4000),my=String(m.my??'').slice(0,4000);
      if(!q||!correct)continue;
      await db.sql`INSERT INTO yk_learning_mistakes(user_id,exam_type,question_key,question_text,correct_answer,user_answer,explanation_ja,explanation_my)
        VALUES(${user.id},${attempt.exam_type},${k},${q},${correct},${answer},${ja},${my})
        ON CONFLICT(user_id,exam_type,question_key) DO UPDATE SET
        missed_count=yk_learning_mistakes.missed_count+1,last_missed=NOW(),user_answer=EXCLUDED.user_answer`;
    }
   }
  }catch(e){console.error('Optional mistake history insert failed',e)}
  await db.sql`DELETE FROM exam_attempt_checkpoints WHERE attempt_id=${id} AND user_id=${user.id}`;
  return Response.json({ok:true,score:result.score,passed:result.passed,scoreVerified:true,
       kind:'server-recalculated-practice-result',sections:result.sections});
 }catch(e){return asResponse(e)}
};
