import { getDatabase } from '@netlify/database';
import { requireUser, asResponse } from './_shared/auth.mts';
import { sectionDurations, initialDeadline, maxCheckpointBytes, isValidSnapshot, checkpointGraceSeconds } from './_shared/exam-autosave.mts';

/** Server-authoritative phase, deadline and compare-and-swap checkpoint revision. */
export default async (req:Request) => {
 try {
  if(req.method!=='GET' && req.method!=='POST')return new Response('Method not allowed',{status:405});
  const user=await requireUser();
  let payload:any={};
  if(req.method==='POST'){
    const raw=await req.text();
    if(raw.length>maxCheckpointBytes)return Response.json({error:'Checkpoint too large'},{status:413});
    try{payload=JSON.parse(raw)}catch{return Response.json({error:'Invalid JSON'},{status:400})}
  } else payload={attemptId:new URL(req.url).searchParams.get('attemptId')};
  const id=Number(payload.attemptId);
  if(!Number.isSafeInteger(id)||id<=0)return Response.json({error:'Invalid attempt ID'},{status:400});
  const db=getDatabase();
  const [attempt]=await db.sql<any>`SELECT id,exam_type,started_at,status FROM exam_attempts WHERE id=${id} AND user_id=${user.id} LIMIT 1`;
  if(!attempt)return Response.json({error:'Attempt not found'},{status:404});
  if(attempt.status!=='started')return Response.json({error:'Attempt already finished',status:attempt.status},{status:409});
  const durations=sectionDurations[attempt.exam_type];
  if(!durations)return Response.json({error:'Unsupported exam type'},{status:400});
  const getCurrent=async()=>{
    const rows=await db.sql<any>`SELECT phase_index,ends_at,snapshot,saved_at,version FROM exam_attempt_checkpoints WHERE attempt_id=${id} AND user_id=${user.id}`;
    return rows[0]??null;
  };
  const shape=(c:any)=>({phase:c?.phase_index??0,endsAt:new Date(c?.ends_at??initialDeadline(attempt.exam_type,attempt.started_at)).toISOString(),version:c?.version??0,snapshot:c?.snapshot??null,savedAt:c?.saved_at??null});
  const conflict=async(error='stale_checkpoint')=>Response.json({error,...shape(await getCurrent())},{status:409});
  const current=await getCurrent();
  if(req.method==='GET')return Response.json({ok:true,attemptId:id,type:attempt.exam_type,...shape(current)});
  const {snapshot,phase,baseVersion}=payload;
  if(!isValidSnapshot(snapshot)||snapshot.type!==attempt.exam_type)return Response.json({error:'Invalid checkpoint'},{status:400});
  const engine=attempt.exam_type.startsWith('jlpt_')?'jlpt':
    ['truck','taxi','bus'].includes(attempt.exam_type)?'driving':
    attempt.exam_type==='maintenance'?'maintenance':'license';
  if(snapshot.engine!==engine)return Response.json({error:'Exam engine mismatch'},{status:400});
  const next=Number(phase);
  if(!Number.isSafeInteger(next)||next<0)return Response.json({error:'Invalid phase'},{status:400});
  if(next>=durations.length){if(current&&next>current.phase_index+1)return conflict('invalid_phase');return Response.json({error:'Invalid phase'},{status:400})}
  if((engine==='jlpt'&&Number(snapshot.phase)!==next)||(engine!=='jlpt'&&next!==0))return Response.json({error:'Phase mismatch'},{status:400});
  if(current && (next<current.phase_index||next>current.phase_index+1))return conflict('invalid_phase');
  if(!current && next!==0)return conflict('invalid_phase');
  if(current && (!Number.isSafeInteger(baseVersion)||baseVersion!==current.version))return conflict();
  const phaseNow=current?.phase_index??0;
  const currentDeadline=new Date(current?.ends_at??initialDeadline(attempt.exam_type,attempt.started_at));
  const advance=Boolean(current&&next===phaseNow+1);
  // A transition is never allowed after the grace window. No free section extension.
  if(Date.now()>currentDeadline.getTime()+checkpointGraceSeconds*1000) {
    await db.sql`UPDATE exam_attempts SET status='abandoned' WHERE id=${id} AND user_id=${user.id} AND status='started'`;
    return Response.json({error:'time_expired',...shape(current)},{status:409});
  }
  const deadline=advance?new Date(Math.min(Date.now(),currentDeadline.getTime())+durations[next]*60000):currentDeadline;
  const canonical=deadline.toISOString();
  const snapshotText=JSON.stringify(snapshot);
  if(snapshotText.length>maxCheckpointBytes)return Response.json({error:'Snapshot too large'},{status:413});
  let updated:any[];
  if(!current){
    updated=await db.sql<any>`INSERT INTO exam_attempt_checkpoints
      (attempt_id,user_id,exam_type,phase_index,ends_at,snapshot,saved_at,version)
      VALUES(${id},${user.id},${attempt.exam_type},${next},${canonical},${snapshotText}::jsonb,NOW(),1)
      ON CONFLICT(attempt_id) DO NOTHING RETURNING phase_index,ends_at,snapshot,saved_at,version`;
  }else{
    updated=await db.sql<any>`UPDATE exam_attempt_checkpoints SET
       phase_index=${next},ends_at=${canonical},snapshot=${snapshotText}::jsonb,
       saved_at=NOW(),version=version+1
      WHERE attempt_id=${id} AND user_id=${user.id} AND version=${baseVersion}
        AND (phase_index=${next} OR phase_index+1=${next})
        AND NOW()<=ends_at + INTERVAL '60 seconds'
      RETURNING phase_index,ends_at,snapshot,saved_at,version`;
  }
  if(!updated.length)return conflict();
  return Response.json({ok:true,attemptId:id,...shape(updated[0])});
 }catch(e){return asResponse(e)}
};
