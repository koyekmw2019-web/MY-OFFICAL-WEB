import { randomInt } from 'node:crypto';
import { secondBank } from './ordinary-second-bank.mts';
export const BANK_VERSION = secondBank.version;
const texts = new Map(secondBank.originalItems.map(q=>[q.id,q]));
const scenes = new Map(secondBank.illustrations.map(q=>[q.id,q]));
export const EXAM_TYPE = 'ordinary_second';
const CHAPTER_COUNTS = [[1,13],[4,6],[5,30],[6,9],[7,8],[9,20],[10,3],[11,1]];
function pick(values,n){
  if(values.length<n)throw Error('Not enough questions in the source bank');
  const arr=[...values];
  for(let i=0;i<n;i++){const j=i+randomInt(arr.length-i);[arr[i],arr[j]]=[arr[j],arr[i]];}
  return arr.slice(0,n);
}
export function generateManifest(){
  const selected=[];
  for(const [chapter,count] of CHAPTER_COUNTS)
    selected.push(...pick(secondBank.originalItems.filter(q=>q.chapter===chapter),count));
  const shuffled=pick(selected,selected.length);
  const images=pick(secondBank.illustrations,5);
  const orders=images.map(()=>pick([0,1,2],3));
  return {bankVersion:BANK_VERSION,questionIds:shuffled.map(x=>x.id),
          illustrationIds:images.map(x=>x.id),statementOrders:orders};
}
function parseJson(x){return typeof x==='string'?JSON.parse(x):x;}
export function readManifest(row){
  if(!row||row.bank_version!==BANK_VERSION)throw Error('Unsupported question bank version');
  const questionIds=parseJson(row.question_ids), illustrationIds=parseJson(row.illustration_ids);
  const statementOrders=parseJson(row.statement_orders);
  if(!Array.isArray(questionIds)||questionIds.length!==90||new Set(questionIds).size!==90||
     !questionIds.every(id=>texts.has(id))||!Array.isArray(illustrationIds)||
     illustrationIds.length!==5||new Set(illustrationIds).size!==5||
     !illustrationIds.every(id=>scenes.has(id))||!Array.isArray(statementOrders)||
     statementOrders.length!==5||!statementOrders.every(a=>
       Array.isArray(a)&&a.length===3&&new Set(a).size===3&&
       a.every(i=>Number.isInteger(i)&&i>=0&&i<=2)))
    throw Error('Corrupted ordinary_second manifest');
  return {bankVersion:row.bank_version,questionIds,illustrationIds,statementOrders};
}
const validAnswer=x=>x===null||typeof x==='boolean';
export function validateSnapshot(snapshot,manifest){
  const ids=[...manifest.questionIds,...manifest.illustrationIds];
  if(!snapshot||snapshot.version!==1||snapshot.type!==EXAM_TYPE||
     snapshot.engine!=='license'||!Number.isSafeInteger(snapshot.index)||
     snapshot.index<0||snapshot.index>=95||
     !Array.isArray(snapshot.refs)||snapshot.refs.length!==95||
     snapshot.refs.some((id,i)=>id!==ids[i])||
     !Array.isArray(snapshot.answers)||snapshot.answers.length!==95||
     !snapshot.answers.slice(0,90).every(validAnswer)||
     !snapshot.answers.slice(90).every(arr=>
       Array.isArray(arr)&&arr.length===3&&arr.every(validAnswer)))
    throw Error('Invalid ordinary_second checkpoint');
}
export function gradeSecond(snapshot,manifest){
  validateSnapshot(snapshot,manifest);
  const wrong=[];let score=0,correct=0;
  for(let i=0;i<90;i++){
    const q=texts.get(manifest.questionIds[i]), answer=snapshot.answers[i],ok=answer===q.answer;
    if(ok){score++;correct++;}else wrong.push({
      index:i,id:q.id,kind:'text',jp:q.jp,mm:q.mm,correct:q.answer,
      given:answer,explanationJP:q.explanationJP,explanationMM:q.explanationMM
    });
  }
  for(let s=0;s<5;s++){
    const q=scenes.get(manifest.illustrationIds[s]), given=snapshot.answers[90+s];
    const ok=q.statements.every((statement,i)=>given[i]===statement.answer);
    if(ok){score+=2;correct++;}
    else wrong.push({
      index:90+s,id:q.id,kind:'scene',jp:q.title,mm:q.mm,
      statements:q.statements.map((st,i)=>({
        jp:st.jp,mm:st.mm,correct:st.answer,given:given[i],
        explanationJP:st.explanationJP,explanationMM:st.explanationMM
      })),statementOrder:manifest.statementOrders[s]
    });
  }
  return {score,passed:score>=90,sections:null,correct,count:95,wrong};
}
export function publicQuestions(manifest){
  const questions=manifest.questionIds.map(id=>{
    const q=texts.get(id);return {id:q.id,category:q.category,chapter:q.chapter,jp:q.jp,mm:q.mm};
  });
  const illustrations=manifest.illustrationIds.map(id=>{
    const q=scenes.get(id);
    return {id:q.id,kind:q.kind,title:q.title,mm:q.mm,
      statements:q.statements.map(s=>({jp:s.jp,mm:s.mm}))};
  });
  return {bankVersion:manifest.bankVersion,questions,illustrations,
          refs:[...manifest.questionIds,...manifest.illustrationIds],
          sceneOrder:Object.fromEntries(manifest.illustrationIds.map((id,i)=>[id,manifest.statementOrders[i]]))};
}
