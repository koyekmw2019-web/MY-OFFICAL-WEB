/** STUDYING WITH YE KUN v7.87.14 - Grammar Practice, pure client-side engine.
 * No access to Netlify exam attempts, payment, YKCR or account-scoped learning APIs.
 * All content is independently authored grammar examples; results are self-study, not JLPT scores.
 */
export const LEVELS = Object.freeze(['N5','N4','N3','N2','N1']);
export const EXPECTED_COUNTS = Object.freeze({N5:35,N4:75,N3:135,N2:137,N1:127});
export const STORAGE_KEY = 'yk_grammar_mastery_v78714_v1';
const GRAMMAR_ID = /^N[1-5]-grammar-\d{3}$/;
export const normalizeAnswer = value => String(value??'').normalize('NFKC').replace(/[\s\u3000]/g,'').trim();
export const validGrammarId = id => typeof id==='string' && GRAMMAR_ID.test(id);
const natural=(value,limit=1e6)=>Number.isSafeInteger(value)&&value>=0&&value<=limit?value:0;
export function cleanState(raw){
 const src=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 const records={};
 for(const [id,row] of Object.entries(src.records&&typeof src.records==='object'?src.records:{})){
  if(!validGrammarId(id)||!row||typeof row!=='object')continue;
  if(Object.keys(records).length>=600)break;
  const attempts=natural(row.attempts,10000),correct=Math.min(natural(row.correct,10000),attempts),wrong=attempts-correct;
  records[id]={attempts,correct,wrong,streak:Math.min(natural(row.streak,10000),correct),lastCorrect:row.lastCorrect===true,updatedAt:natural(row.updatedAt,9000000000000)};
 }
 const sessions=(Array.isArray(src.sessions)?src.sessions:[]).filter(s=>s&&/^\d{4}-\d{2}-\d{2}$/.test(s.day)&&LEVELS.includes(s.level)&&['recall','choice','review','daily'].includes(s.mode)&&Number.isSafeInteger(s.count)&&s.count>=1&&s.count<=20&&natural(s.correct,s.count)===s.correct&&natural(s.finishedAt,9000000000000)===s.finishedAt).slice(-180).map(s=>({day:s.day,level:s.level,mode:s.mode,count:s.count,correct:s.correct,finishedAt:s.finishedAt}));
 return {version:1,records,sessions};
}
export function grade(state,id,correct,at=Date.now()){
 if(!validGrammarId(id))throw Error('Unknown grammar ID');
 const obj=cleanState(state),prev=obj.records[id]||{attempts:0,correct:0,streak:0};
 const right=correct===true;
 const attempts=Math.min(10000,prev.attempts+1),success=Math.min(attempts,prev.correct+Number(right));
 obj.records[id]={attempts,correct:success,wrong:attempts-success,streak:right?Math.min(10000,prev.streak+1):0,lastCorrect:right,updatedAt:natural(at,9000000000000)};
 return obj;
}
export function addSession(state,run){
 const data=cleanState(state),v={day:String(run.day),level:run.level,mode:run.mode,count:run.count,correct:run.correct,finishedAt:run.finishedAt};
 return cleanState({...data,sessions:[...data.sessions,v]});
}
export function summarize(state,level=null){
 const s=cleanState(state);let rows=Object.entries(s.records).filter(([id])=>!level||id.startsWith(level+'-'));
 const practiced=rows.filter(([,v])=>v.attempts>0).length,weak=rows.filter(([,v])=>v.wrong>0&&!v.lastCorrect).length;
 const correct=rows.reduce((n,[,v])=>n+v.correct,0),attempts=rows.reduce((n,[,v])=>n+v.attempts,0);
 return {practiced,weak,attempts,correct,accuracy:attempts?Math.round(100*correct/attempts):null};
}
export function dayKey(d=new Date()){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function hash(text){let v=2166136261;for(const c of String(text))v=Math.imul(v^c.charCodeAt(0),16777619)>>>0;return v}
export const rotation=(items,seed)=>[...items].sort((a,b)=>(hash(seed+':'+a.id)-hash(seed+':'+b.id))||a.id.localeCompare(b.id));
export function cloze(item,exampleIndex=0){
 if(!item||!validGrammarId(item.id)||!Array.isArray(item.examples)||!item.examples.length)throw Error('Bad lesson');
 const e=item.examples[exampleIndex%item.examples.length],needle=e.highlight;
 if(typeof needle!=='string'||!needle||typeof e.ja!=='string')throw Error('Missing example/highlight');
 const pos=e.ja.indexOf(needle);
 if(pos<0)throw Error('Answer not present in Japanese example');
 return {id:item.id,level:item.level,exampleIndex:exampleIndex%item.examples.length,prompt:e.ja.slice(0,pos)+'＿＿'+e.ja.slice(pos+needle.length),answer:needle,example:e,meaning:{my:item.meaningMy,en:item.meaningEn,ja:item.meaningJa},title:item.title,formation:item.formation};
}
export function mcqByItem(items,bank){
 const byId=new Map(items.map(x=>[x.id,x]));const out=[];
 for(const q of bank){const item=byId.get(q.id);if(!item)continue;
  const card=cloze(item,q.exampleIndex);
  if(!Array.isArray(q.distractors)||q.distractors.length!==3||new Set([card.answer,...q.distractors]).size!==4)throw Error('Invalid curated choice: '+q.id);
  if(q.distractors.some(x=>!x||typeof x!=='string'||x.length>40))throw Error('Invalid answer option');
  out.push({...card,options:[card.answer,...q.distractors],kind:'choice'});
 }
 return out;
}
export function makeDeck({items,bank=[],state={},mode='recall',count=10,date=dayKey()}){
 if(!Array.isArray(items)||!items.length)throw Error('Grammar level unavailable');
 if(!['recall','choice','review','daily'].includes(mode)||![5,10,20].includes(count))throw Error('Invalid study settings');
 const s=cleanState(state),lv=items[0].level;
 if(!LEVELS.includes(lv)||items.some(x=>x.level!==lv))throw Error('Mixed JLPT levels');
 const b=mcqByItem(items,bank),lookup=new Map(b.map(x=>[x.id,x]));
 if(mode==='choice'&&!b.length)return [];
 const source=mode==='choice'?b:items;
 let sorted=rotation(source,date+':'+lv+':'+mode);
 if(mode==='review')sorted=sorted.filter(x=>s.records[x.id]?.wrong>0);
 if(mode==='daily'||mode==='review')sorted.sort((a,b)=>{
  const aa=s.records[a.id],bb=s.records[b.id];
  const priority=v=>v?.wrong>0&&!v.lastCorrect?100+v.wrong:v?.wrong>0?20+v.wrong:0;
  return priority(bb)-priority(aa);
 });
 // Questions never repeat in a single session. A level shorter than the target count is shorter by design.
 return sorted.slice(0,count).map((x,i)=>{
  const selected=mode==='choice'?x:mode==='daily'&&lookup.has(x.id)&&i%3===0?lookup.get(x.id):cloze(x,hash(date+':'+x.id)%2);
  if(selected.kind==='choice'){
   const ordered=rotation(selected.options.map((v,j)=>({id:String(j),value:v})),date+':'+selected.id);
   return {...selected,options:ordered.map(x=>x.value)};
  }
  return {...selected,kind:'recall'};
 });
}
export function uniqueContentCount(levels){return LEVELS.reduce((n,lv)=>n+(levels?.[lv]?.length||0),0)}
