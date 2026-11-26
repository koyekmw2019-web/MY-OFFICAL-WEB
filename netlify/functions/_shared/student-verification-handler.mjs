// FIX06-B verification flow; storage failures fail closed.
// Uses original FIX06-A validation and credential verification unchanged.
import { studentText } from './student-validation.mts';
import { verifyCode } from './security.mts';
import { verifyWithLimit } from './student-rate-policy.mjs';
const outcome=(status,body)=>({status,body});
const json=(status,body,retryAfter)=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...(retryAfter?{'Retry-After':String(retryAfter)}:{})}});
async function checkStudent(tx,user,studentCode,verificationCode){
 const student=await tx.findStudent(studentCode);
 if(!student||typeof student.verification_code_hash!=='string'||!/^[0-9a-f]{32}:[0-9a-f]{64}$/i.test(student.verification_code_hash)||!verifyCode(verificationCode,student.verification_code_hash)) return outcome(403,{error:'Verification failed'});
 if(student.status!=='active') return outcome(403,{error:'Student access is inactive'});
 if(student.linked_user_id&&student.linked_user_id!==user.id) return outcome(409,{error:'This student record is already linked to another account'});
 // PostgreSQL adapter preserves the FIX06-A conditional UPDATE and uses a
 // savepoint for the known linked_user_id unique constraint conflict.
 const result=await tx.linkStudent(student,user);
 if(result.kind==='account-conflict') return outcome(409,{error:'This account is already linked to a student record'});
 if(result.kind==='conflict') return outcome(409,{error:'Student verification conflict; please retry'});
 if(result.kind!=='linked'||!result.student) throw Error('Unexpected link result');
 const linked=result.student;
 return outcome(200,{ok:true,student:{studentCode:linked.student_code,name:linked.name,className:linked.class_name,classStart:linked.class_start,expireDate:linked.expire_date}});
}
export function makeVerificationHandler({requireUser,store}){
 return async req=>{
  if(req.method!=='POST')return json(405,{error:'Method not allowed'});
  let user;
  try{user=await requireUser();}catch(e){if(e instanceof Response&&e.status===401)return json(401,{error:'Unauthorized'});return json(503,{error:'Student verification unavailable'},5);}
  if(!user)return json(401,{error:'Unauthorized'});
  let body;
  try{body=await req.json();}catch{return json(400,{error:'Invalid request'});}
  const studentCode=studentText(body?.studentCode,256),verificationCode=studentText(body?.verificationCode,256);
  if(!studentCode||!verificationCode)return json(400,{error:'Student ID and verification code are required'});
  try{
   const result=await verifyWithLimit(store,user,studentCode,tx=>checkStudent(tx,user,studentCode,verificationCode));
   return json(result.status,result.body,result.retryAfter);
  }catch{return json(503,{error:'Student verification unavailable'},5);}
 };
}
