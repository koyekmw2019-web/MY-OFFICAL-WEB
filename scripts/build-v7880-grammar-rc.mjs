/** v7.88.0 RC1 guarded editorial / progress preflight, NOT a stable release. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve('dist'), here=resolve('.');
const files={
 fixes:join(root,'assets/yk-grammar-v7880-targeted-corrections.json'),
 content:join(root,'assets/jlpt-learning-v782-content.json'),
 detail:join(root,'assets/yk88-grammar-details.json'),
 listJS:join(root,'assets/yk-jlpt-learning-v782-page.js'),
 detailJS:join(root,'assets/yk88-grammar-detail.js'),
 listHTML:join(root,'study/jlpt-learning.html'),
 detailHTML:join(root,'study/jlpt-grammar-detail.html'),
 client:join(root,'assets/yk-jlpt-learning-v782-state.js'),
 server:join(here,'netlify/functions/jlpt-learning-progress.mts')
};
for(const [n,p] of Object.entries(files))assert(existsSync(p),`Missing v7.88.0 RC asset ${n}: ${p}`);
const read=p=>readFileSync(p,'utf8');
const changes=JSON.parse(read(files.fixes));
const content=JSON.parse(read(files.content));
const detail=JSON.parse(read(files.detail));
assert.equal(changes.version,'7.88.0-rc1-targeted-corrections');
assert.equal(content.version,'7.87.8-qa-reference-inventory-complete');
assert.equal(detail.version,content.version);
assert.equal(detail.editorialQAVersion,'7.87.9-qa-editorial-revision');
assert.equal(Object.keys(detail.items).length,524);
const counts={N5:40,N4:81,N3:137,N2:139,N1:127};
for(const [level,n] of Object.entries(counts)){
 const rows=content.levels?.[level]?.grammar;
 assert.equal(rows?.length,n,`${level} count mismatch`);
 assert.deepEqual(rows.map(x=>x.id),Array.from({length:n},(_,i)=>`${level}-g-${i+1}`),`${level} IDs changed`);
}
const seen=new Set();let repairCount=0;
for(const fix of changes.corrections){
 const {level,title,fields}=fix;
 assert(!seen.has(level+title),`Duplicate correction ${title}`);seen.add(level+title);
 const matches=content.levels?.[level]?.grammar?.filter(r=>r.title===title)||[];
 assert.equal(matches.length,1,`Expected exactly one ${level} ${title}`);
 const item=matches[0],more=detail.items[item.id];
 assert(more,`Missing original detail ${item.id}`);
 const all=[{ja:item.example,my:item.exampleMy,en:more.originalEnglish,focus:more.originalFocus},...more.more];
 if(fix.expectedLastExample)assert.equal(all[2].ja,fix.expectedLastExample,`Old Japanese sentence changed for ${title}`);
 if(fix.expectedExample)assert(all.some(e=>e.ja===fix.expectedExample),`Old sentence changed for ${title}`);
 for(const k of ['formation','explanationJa','explanationMy','explanationEn'])if(fields[k]!==undefined){
  assert(typeof fields[k]==='string'&&fields[k].trim(),`Invalid ${title}.${k}`);
  more[k]=fields[k];
  if(k==='formation')item.note=fields[k];
  if(k==='explanationMy')item.meaning=fields[k];
 }
 if(fields.examples){
  assert.equal(fields.examples.length,3,`${title} examples count`);
  for(const e of fields.examples)assert(e.length===4&&e.every(x=>typeof x==='string'&&x.trim())&&e[0].includes(e[3]),`Invalid ${title} example`);
  const [first,...rest]=fields.examples;
  item.example=first[0];item.exampleMy=first[1];
  more.originalEnglish=first[2];more.originalFocus=first[3];
  more.more=rest.map(e=>({ja:e[0],my:e[1],en:e[2],focus:e[3]}));
 }
 repairCount++;
}
assert.equal(repairCount,5);
// An existing limit of 500 silently loses learned/bookmarked IDs after content growth.
const client=read(files.client),server=read(files.server);
for(const [key,src] of [['client',client],['server',server]]){
 assert(src.includes('2000'),`v7.88.0 source capacity patch must be applied BEFORE npm run build: ${key}`);
 assert(!src.includes('length<500')&&!src.includes('slice(0,500)')&&!src.includes('uniq(v.completed,500)'),`${key} still has old cap`);
}
let listJS=read(files.listJS),detailJS=read(files.detailJS);
let listHTML=read(files.listHTML),detailHTML=read(files.detailHTML);
const replaceOnce=(s,old,next,desc)=>{
 assert.equal(s.split(old).length-1,1,`Expected one ${desc}; duplicate or prior version mismatch`);
 return s.replace(old,next);
};
for(const name of ['listJS','detailJS']){
 let s=name==='listJS'?listJS:detailJS;
 const old='7879editorialqa1',next='7880rc1audited';
 const targets=name==='listJS'?['/assets/jlpt-learning-v782-content.json?v='+old]:[
  '/assets/jlpt-learning-v782-content.json?v='+old,
  '/assets/yk88-grammar-details.json?v='+old
 ];
 for(const t of targets)s=replaceOnce(s,t,t.replace(old,next),`${name} cache`);
 if(name==='listJS')listJS=s;else detailJS=s;
}
listHTML=replaceOnce(listHTML,'/assets/yk-jlpt-learning-v782-page.js?v=7879editorialqa1',
 '/assets/yk-jlpt-learning-v782-page.js?v=7880rc1audited','study script cache');
detailHTML=replaceOnce(detailHTML,'/assets/yk88-grammar-detail.js?v=7879editorialqa1',
 '/assets/yk88-grammar-detail.js?v=7880rc1audited','detail script cache');
for(const key of ['listHTML','detailHTML']){
 let s=key==='listHTML'?listHTML:detailHTML;
 s=replaceOnce(s,'/assets/yk-jlpt-learning-v782-state.js"',
 '/assets/yk-jlpt-learning-v782-state.js?v=7880rc1capacity"',`${key} state script cache`);
 if(key==='listHTML')listHTML=s;else detailHTML=s;
}
const allIDs=new Set();for(const lv of Object.keys(counts))for(const item of content.levels[lv].grammar){
 assert(!allIDs.has(item.id));allIDs.add(item.id);
 const e=detail.items[item.id];assert(e&&e.formation&&e.explanationMy&&e.explanationEn&&e.explanationJa,`Missing explanation ${item.id}`);
 const ex=[{ja:item.example,my:item.exampleMy,en:e.originalEnglish,focus:e.originalFocus},...e.more];
 assert.equal(ex.length,3,`${item.id} missing 3 examples`);
 for(const row of ex)assert(Object.values(row).every(x=>typeof x==='string'&&x.trim())&&row.ja.includes(row.focus),`Invalid example ${item.id}`);
}
assert.equal(allIDs.size,524);
detail.editorialQAVersion='7.88.0-rc1-targeted-corrections';
detail.editorialStatus='release-NO-GO-full-linguistic-and-integration-QA-pending';
// All validations above happen before any generated-public asset is touched.
const changesOut={
 [files.content]:JSON.stringify(content,null,2)+'\n',
 [files.detail]:JSON.stringify(detail,null,2)+'\n',
 [files.listJS]:listJS,[files.detailJS]:detailJS,
 [files.listHTML]:listHTML,[files.detailHTML]:detailHTML
};
for(const [path,value] of Object.entries(changesOut))writeFileSync(path,value,'utf8');
console.log('PASS v7.88.0 RC1 scoped grammar guard',JSON.stringify({total:524,examples:1572,corrections:repairCount,progressCap:2000,release:'NO-GO'}));
