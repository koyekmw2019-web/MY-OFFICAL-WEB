/* Server-side practice scoring: based on canonical answers bundled with Functions.
 * Important: v7.62 question selection is client-originated; this recalculation prevents
 * arbitrary reported scores but does NOT make the publicly inspectable quiz cheat-proof. */
import { key } from './exam-answer-key-v763.mts';
import { scoreNishuSnapshot } from './nishu-scoring-v7881.mjs';

export type ScoreResult = {score:number, passed:boolean, sections:any, correct:number, count:number};
const invalid = (why:string):never => {throw new Error('Invalid exam checkpoint: '+why)};
const unique = (values:(string|number)[]) => new Set(values).size===values.length;
const integer = (v:any,min:number,max:number) => Number.isInteger(v)&&v>=min&&v<=max;
const answer = (a:any,k:any) => a===null||a===k|| (typeof k==='boolean' ? typeof a==='boolean' : integer(a,0,3));
const marks:Record<string,number>={jlpt_n1:100,jlpt_n2:90,jlpt_n3:95,jlpt_n4:90,jlpt_n5:80};

export function evaluateSnapshot(type:string,s:any):ScoreResult{
 if(!s||s.version!==1||s.type!==type||!Number.isSafeInteger(s.index)||s.index<0)invalid('shape');
 if(type.startsWith('jlpt_')) {
   const level=type.slice(5).toUpperCase();
   const groups:any=(key as any).jlpt;
   const expected=type==='jlpt_n1'||type==='jlpt_n2'?2:3;
   if(s.engine!=='jlpt'||s.phase!==expected-1||!Array.isArray(s.stages)||s.stages.length!==expected||
      !Array.isArray(s.responses)||s.responses.length!==expected)invalid('JLPT phase');
   const secCount:Record<string,number>={vocabulary:0,grammar:0,reading:0,listening:0};
   const good:Record<string,number>={vocabulary:0,grammar:0,reading:0,listening:0};
   const seen:string[]=[];
   for(let p=0;p<expected;p++){
     const qs=s.stages[p],answers=s.responses[p];
     if(!Array.isArray(qs)||!Array.isArray(answers)||qs.length!==answers.length)invalid('JLPT arrays');
     const count=type==='jlpt_n1'||type==='jlpt_n2'?(p===0?80:20):[36,44,20][p];
     if(qs.length!==count)invalid('JLPT section size');
     for(let i=0;i<qs.length;i++){
       const info=qs[i],q=groups[info?.id];
       if(!q||q.level!==level||!Array.isArray(info.order)||info.order.length!==4||
          !unique(info.order)||info.order.some((n:any)=>!integer(n,0,3)))invalid('JLPT question/order');
       const sec=q.section;
       if(!Object.hasOwn(secCount,sec))invalid('JLPT section');
       const stageOK=p===expected-1?sec==='listening':
         expected===2?sec!=='listening':p===0?sec==='vocabulary':sec==='grammar'||sec==='reading';
       if(!stageOK)invalid('JLPT phase question');
       const chosen=answers[i];
       if(chosen!==null&&!integer(chosen,0,3))invalid('JLPT answer');
       seen.push(info.id);secCount[sec]++;
       if(chosen!==null&&info.order[chosen]===q.answer)good[sec]++;
     }
   }
   if(!unique(seen)||seen.length!==100||secCount.vocabulary!==36||secCount.grammar!==24||
      secCount.reading!==20||secCount.listening!==20)invalid('JLPT question coverage');
   const last=s.stages[expected-1].length-1;
   if(!integer(s.index,0,last))invalid('JLPT current index');
   const listening= Math.round(60*good.listening/20);
   const sections=level==='N1'||level==='N2'||level==='N3' ? [
     {id:'language',score:Math.round(60*(good.vocabulary+good.grammar)/60)},
     {id:'reading',score:Math.round(60*good.reading/20)},
     {id:'listening',score:listening}
   ] : [{id:'combined',score:Math.round(120*(good.vocabulary+good.grammar+good.reading)/80)},
        {id:'listening',score:listening}];
   const score=sections.reduce((n,x)=>n+x.score,0);
   const passed=score>=marks[type]&&sections.every(x=>x.score >=(x.id==='combined'?38:19));
   return {score,passed,sections,correct:Object.values(good).reduce((a,b)=>a+b,0),count:100};
 }
 if(['truck','taxi','bus'].includes(type)){
   const b:any=(key as any).driving[type];
   if(s.engine!=='driving'||!Array.isArray(s.refs)||s.refs.length!==50||
      !Array.isArray(s.answers)||s.answers.length!==50||!integer(s.index,0,49))invalid('driving shape');
   const keys:string[]=[];let theory=0,practical=0,visual=0;
   for(let i=0;i<50;i++){
     const [kind,n]=s.refs[i]??[],entry=kind==='t'?b.t:kind==='p'?b.p:null;
     if(!entry||!integer(n,0,entry.length-1)||(i<30?kind!=='t':kind!=='p'))invalid('driving ref');
     keys.push(kind+':'+n);
     const ans=s.answers[i],right=kind==='t'?entry[n]:entry[n].a;
     if(ans!==null&&(kind==='t'?typeof ans!=='boolean':!integer(ans,0,2)))invalid('driving answer');
     if(ans!==null&&ans===right){if(i<30)theory++;else practical++}
     if(kind==='p'&&entry[n].visual)visual++;
   }
   if(!unique(keys)||(type==='truck'&&visual!==8))invalid('driving question composition');
   const score=theory+practical;
   return {score,passed:theory>=18&&practical>=12,sections:{theory,practical},correct:score,count:50};
 }
 if(type==='nishu')return scoreNishuSnapshot(s);
 if(['car','motorcycle','moped'].includes(type)){
   const b:any=(key as any).license[type];const count=type==='moped'?48:95;
   if(s.engine!=='license'||!Array.isArray(s.refs)||s.refs.length!==count||
     !Array.isArray(s.answers)||s.answers.length!==count||!integer(s.index,0,count-1)||!unique(s.refs))invalid('license shape');
   let score=0;
   for(let i=0;i<count;i++){
     const n=s.refs[i];if(!integer(n,0,b.length-1))invalid('license ref');
     const ans=s.answers[i];if(ans!==null&&typeof ans!=='boolean')invalid('license answer');
     if(ans===b[n].a)score++;
   }
   return {score,passed:score >=(type==='moped'?45:90),sections:null,correct:score,count};
 }
 if(type==='maintenance'){
   const b:any=(key as any).maintenance;
   if(s.engine!=='maintenance'||!Array.isArray(s.items)||s.items.length!==45||
     !Array.isArray(s.answers)||s.answers.length!==45||!integer(s.index,0,44))invalid('maintenance shape');
   let theory=0,practical=0;const used:string[]=[];
   for(let i=0;i<45;i++){
     const item=s.items[i],kind=i<30?'theory':'practical',right=b[kind]?.[item?.q];
     if(!item||item.kind!==kind||typeof item.q!=='string'||typeof right==='undefined')invalid('maintenance question');
     used.push(item.q);
     const ans=s.answers[i];
     if(ans!==null&&(kind==='theory'?typeof ans!=='boolean':!integer(ans,0,2)))invalid('maintenance answer');
     if(ans!==null&&ans===right){if(kind==='theory')theory++;else practical++}
   }
   if(!unique(used))invalid('maintenance duplicates');
   const score=theory+practical;
   return {score,passed:theory>=20&&practical>=9,sections:{theory,practical},correct:score,count:45};
 }
 invalid('unsupported exam type');
}
