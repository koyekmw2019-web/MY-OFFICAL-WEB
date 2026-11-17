/** QA-only v7.88.0 RC: guarded change to client and server max progress IDs. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const LIMIT=2000;
const once=(s,old,next,label)=>{
  assert.equal(s.split(old).length-1,1,`Expected one ${label}: source changed or already patched`);
  return s.replace(old,next);
};
export function patchClient(s){
  s=once(s,'s.completed=uniq(v.completed,500);',`s.completed=uniq(v.completed,${LIMIT});`,'client completed');
  s=once(s,'Object.keys(s.bookmarkTimestamps).length<500',`Object.keys(s.bookmarkTimestamps).length<${LIMIT}`,'client bookmarks');
  s=once(s,'merged.completed=uniq([...a.completed,...b.completed],500);',`merged.completed=uniq([...a.completed,...b.completed],${LIMIT});`,'client merge');
  return s;
}
export function patchServer(s){
  s=once(s,'.filter(validId))].slice(0,500);',`.filter(validId))].slice(0,${LIMIT});`,'server completed sanitizer');
  s=once(s,'Object.keys(bookmarkTimestamps).length<500',`Object.keys(bookmarkTimestamps).length<${LIMIT}`,'server bookmarks');
  s=once(s,'[...a.completed,...b.completed])].slice(0,500);',`[...a.completed,...b.completed])].slice(0,${LIMIT});`,'server merge');
  return s;
}
export function run(root){
  const c=resolve(root,'assets/yk-jlpt-learning-v782-state.js');
  const s=resolve(root,'netlify/functions/jlpt-learning-progress.mts');
  for(const p of [c,s])assert(existsSync(p),`Missing required source: ${p}`);
  const nextClient=patchClient(readFileSync(c,'utf8'));
  const nextServer=patchServer(readFileSync(s,'utf8'));
  // Both transformations are completed before either write.
  writeFileSync(c,nextClient,'utf8');writeFileSync(s,nextServer,'utf8');
  return {client:c,server:s,limit:LIMIT};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  console.log('QA-only capacity patch',run(process.argv[2]||process.cwd()));
}
