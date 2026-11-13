/** v7.87.8: pure CRM validation; no PII collection from public visitors. */
export const COURSES=Object.freeze(['truck','taxi','bus','general']);
export const SOURCES=Object.freeze(['facebook','youtube','google','website','referral','manual','other']);
export const CHANNELS=Object.freeze(['messenger','email','phone','other']);
export const STATES=Object.freeze(['new','contacted','interested','enrolled','closed']);
const present=s=>typeof s==='string'&&s.trim().length>0;
const clean=(s,max,needed)=>{
 if(typeof s!=='string'||s.length>max*2)return null;
 const v=s.trim();
 return (v.length<=max&&(!needed||v.length>0)&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))?v:null;
};
const jstNow=()=>{const f=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'});
 const p=Object.fromEntries(f.formatToParts(new Date()).filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;
};
export function dateOk(s){
 if(s===null||s==='')return true;
 if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const ms=Date.parse(s+'T00:00:00Z');if(!Number.isFinite(ms)||new Date(ms).toISOString().slice(0,10)!==s)return false;
 const now=Date.parse(jstNow()+'T00:00:00Z');
 return ms>=now-3*366*86400000&&ms<=now+3*366*86400000;
}
export function validateLead(body){
 if(!body||typeof body!=='object'||Array.isArray(body))return {ok:false,error:'Invalid lead'};
 const name=clean(body.name,120,true),contact=clean(body.contact,180,true),notes=clean(body.notes??'',1000,false);
 const studentCode=body.studentCode===null||body.studentCode===''?null:clean(body.studentCode,80,true);
 if(!name||!contact||notes===null||studentCode===null&&body.studentCode!==null&&body.studentCode!==''&&body.studentCode!==undefined)return {ok:false,error:'Invalid name, contact, notes or student reference'};
 if(studentCode!==null&&!/^[A-Za-z0-9_-]{1,80}$/.test(studentCode))return {ok:false,error:'Invalid student code reference'};
 if(!COURSES.includes(body.course)||!SOURCES.includes(body.source)||!CHANNELS.includes(body.channel)||!STATES.includes(body.status||'new'))return {ok:false,error:'Invalid course, source, channel or status'};
 const date=body.followUpDate??null;if(!dateOk(date))return {ok:false,error:'Invalid follow-up date'};
 return {ok:true,value:{name,contact,notes,studentCode,course:body.course,source:body.source,channel:body.channel,status:body.status||'new',followUpDate:date||null}};
}
export function validId(v){const id=Number(v);return Number.isSafeInteger(id)&&id>0?id:null;}
