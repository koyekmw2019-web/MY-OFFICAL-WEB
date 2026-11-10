/** v7.86.5 — evidence is derived solely from a previously validated, server-saved checkpoint.
 * No client topic names/scores or unverified mistakes are accepted as verified topic evidence.
 * The caller MUST first call evaluateSnapshot(type, snapshot) successfully.
 */
import { key } from './exam-answer-key-v763.mts';
export type CoachTopic = {id:string,correct:number,total:number};
export function verifiedTopics(type:string,s:any):CoachTopic[]{
  const groups = new Map<string,CoachTopic>();
  const record=(id:string,right:boolean)=>{
    const row=groups.get(id)||{id,correct:0,total:0};
    row.total++;if(right)row.correct++;groups.set(id,row);
  };
  if(/^jlpt_n[1-5]$/.test(type)){
    for(let i=0;i<s.stages.length;i++) for(let j=0;j<s.stages[i].length;j++){
      const q=s.stages[i][j],canonical=(key as any).jlpt[q.id];
      record(canonical.section,s.responses[i][j]!==null && q.order[s.responses[i][j]]===canonical.answer);
    }
  }else if(['truck','taxi','bus'].includes(type)){
    const bank=(key as any).driving[type];
    for(let i=0;i<s.refs.length;i++){
      const [kind,n]=s.refs[i],right=kind==='t'?bank.t[n]:bank.p[n].a;
      record(kind==='t'?'theory':'practical',s.answers[i]!==null&&s.answers[i]===right);
    }
  }else if(type==='maintenance'){
    for(let i=0;i<s.items.length;i++){
      const q=s.items[i],right=(key as any).maintenance[q.kind][q.q];
      record(q.kind,s.answers[i]!==null&&s.answers[i]===right);
    }
  }else if(['car','motorcycle','moped'].includes(type)){
    // License checkpoint has no trusted question-topic tags. Never invent them.
    const bank=(key as any).license[type];
    for(let i=0;i<s.refs.length;i++)record('overall',s.answers[i]!==null&&s.answers[i]===bank[s.refs[i]].a);
  }else throw new Error('Unsupported coaching exam');
  return [...groups.values()].filter(x=>x.total>0);
}
