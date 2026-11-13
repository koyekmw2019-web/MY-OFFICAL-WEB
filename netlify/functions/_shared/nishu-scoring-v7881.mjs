/** Auditable server-only 2026 第二種練習: 90x1 + 5x2 (each 3/3 correct), 90/100 pass. */
import {nishuAnswers} from './nishu-key-v7881.mts';
const validBool=x=>x===null||typeof x==='boolean';
const reject=s=>{throw Error('Invalid nishu checkpoint: '+s)};
export function scoreNishuSnapshot(s){
 if(!s||s.version!==1||s.type!=='nishu'||s.engine!=='nishu'||s.phase!==0||
 !Number.isSafeInteger(s.index)||s.index<0||s.index>94||
 !Array.isArray(s.refs)||s.refs.length!==95||!Array.isArray(s.answers)||s.answers.length!==95)reject('shape');
 const ordinary=nishuAnswers.text,visual=nishuAnswers.visual;
 if(Object.keys(ordinary).length!==90||Object.keys(visual).length!==5)reject('private bank count');
 if(new Set(s.refs).size!==95)reject('duplicate refs');
 let written=0,illustrations=0,subitems=0;
 for(let i=0;i<90;i++){
  const id=s.refs[i],entry=typeof id==='string'?ordinary[id]:null;
  if(!entry)reject('ordinary ref');
  const a=s.answers[i];if(!validBool(a))reject('ordinary answer');
  if(a===entry.a)written++;
 }
 for(let i=90;i<95;i++){
  const id=s.refs[i],entry=typeof id==='string'?visual[id]:null;
  if(!entry)reject('visual ref');
  const a=s.answers[i];if(!Array.isArray(a)||a.length!==3||a.some(v=>!validBool(v)))reject('visual triplet');
  const correctlyMarked=a.filter((v,j)=>v!==null&&v===entry.a[j]).length;
  subitems+=correctlyMarked;
  if(correctlyMarked===3)illustrations+=2;
 }
 const score=written+illustrations;
 return {score,passed:score>=90,sections:{written,illustrations},correct:written+illustrations/2,count:95};
}
