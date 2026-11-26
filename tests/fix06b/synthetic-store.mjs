// Test-only shared-memory simulation; NOT persistent or distributed storage.
// All transactions serialized globally to model durable atomic behavior; this
// is stronger than per-account locking and cannot establish real PG lock behavior.
export function fixture({time=1_800_000_000_000,students=[]}={}){
 let clock=time, queue=Promise.resolve(), state={events:new Map(),students:new Map(students.map(s=>[s.student_code,structuredClone(s)]))};
 let fault=null; const calls={atomic:0,read:0,lookup:0,link:0,record:0,commit:0};
 const fail=phase=>{if(fault===phase)throw Error('SYNTHETIC_PRIVATE_ERROR');};
 const store={atomic(account,work){
   const run=queue.then(async()=>{
     calls.atomic++;fail('begin');const draft=structuredClone(state);
     const tx={now:async()=>{fail('clock');return clock;},readFailures:async cutoff=>{calls.read++;fail('read');return (draft.events.get(account)||[]).filter(x=>x.at>cutoff);},
       recordFailure:async e=>{calls.record++;fail('record');draft.events.set(account,[...(draft.events.get(account)||[]),structuredClone(e)]);},
       findStudent:async code=>{calls.lookup++;fail('lookup');return structuredClone(draft.students.get(code));},
       linkStudent:async(s,u)=>{calls.link++;fail('link');const row=draft.students.get(s.student_code);if(!row||row.status!=='active'||row.verification_code_hash!==s.verification_code_hash||(row.linked_user_id&&row.linked_user_id!==u.id))return {kind:'conflict'};if([...draft.students.values()].some(r=>r.student_code!==s.student_code&&r.linked_user_id===u.id))return {kind:'account-conflict'};row.linked_user_id=u.id;return {kind:'linked',student:structuredClone(row)};}};
     const result=await work(tx);fail('commit');state=draft;calls.commit++;return result;
   });queue=run.catch(()=>{});return run;
 }};
 return {store,calls,advance:ms=>clock+=ms,setClock:n=>clock=n,setFault:f=>fault=f,snapshot:()=>structuredClone(state)};
}
