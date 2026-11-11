/** v7.87.4: additive compatibility for old accepted-version test lists only.
 * No server, database, or exam logic changes. */
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
const version=JSON.parse(readFileSync('package.json','utf8')).version;
assert.equal(version,'7.87.4','Expected 7.87.4 package before validating tests');
let changed=0;
for(const name of readdirSync('tests').filter(x=>x.endsWith('.mjs'))){
 const file=join('tests',name), old=readFileSync(file,'utf8');
 // Match only array endings, never change assertions or test data.
 const next=old.replace(/(['"])7\.87\.[123]\1(\s*\])/g,(m,q,tail)=>
   q + m.slice(1,m.length-tail.length-1) + q + ',' + q + '7.87.4' + q + tail);
 if(next!==old){writeFileSync(file,next,'utf8');changed++}
}
console.log('v7.87.4 accepted-version compatibility:',changed,'test files');
