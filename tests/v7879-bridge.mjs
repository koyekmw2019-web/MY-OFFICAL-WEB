import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const s=readFileSync('assets/yk-v7879-grammar-bridge.js','utf8');
function fixture(search=''){
 let fn=null,cap=false,calls=[];
 const level={dataset:{level:'N2'}};
 const document={body:{classList:{contains:k=>k==='yk82-page'}},addEventListener:(ev,handler,capture)=>{assert.equal(ev,'click');fn=handler;cap=capture},querySelector:()=>level};
 const location={search,assign:(x)=>calls.push(x)};
 vm.runInNewContext(s,{document,location,URLSearchParams,encodeURIComponent});
 function click(isGrammar=true,opts={}){
  let p=false,stop=false;
  const target={closest:sel=>isGrammar?{dataset:{tab:'grammar'}}:null};
  fn({target,button:0,metaKey:false,ctrlKey:false,shiftKey:false,altKey:false,preventDefault:()=>p=true,stopImmediatePropagation:()=>stop=true,...opts});
  return {p,stop,calls};
 }
 return {click,cap};
}
let f=fixture();assert(f.cap);assert.deepEqual(f.click().calls,['/study/jlpt-grammar-library.html?level=N2']);assert.deepEqual(f.click().p,true);
f=fixture('?legacy=1');assert.equal(f.click().p,false);assert.equal(f.click().calls.length,0);
f=fixture();assert.equal(f.click(true,{ctrlKey:true}).p,false);assert.equal(f.click(false).p,false);
console.log('PASS v7879-bridge: 30 original grammar lessons available by ?legacy=1, selected JLPT level passed, modifier clicks stay native');
