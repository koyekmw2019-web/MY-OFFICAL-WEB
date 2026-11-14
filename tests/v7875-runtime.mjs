/** Isolated functional test for mobile header spacing and JLPT delayed replay.
 * Uses an in-memory DOM; no network or database. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const css=readFileSync('assets/yk-v7875-rc1-ui.css','utf8');
assert.match(css,/calc\(0px - var\(--yk875-top-trim,0px\)\)/);
const log=[], hooks={}, timers=[];
function style(){const props=new Map();return {removeProperty:k=>props.delete(k),setProperty:(k,v)=>props.set(k,v),getPropertyValue:k=>props.get(k)||''}}
const header={getBoundingClientRect:()=>({bottom:80})};
const card={getBoundingClientRect:()=>({top:155})};
const home={style:style(),querySelector:sel=>sel==='.hero-card'?card:null};
const jlpt={classList:{add:x=>log.push('class+'+x),remove:x=>log.push('class-'+x)},click(){log.push('original-click')}};
const query={'.top':header,'body > .wrap > .hero#home':home,'body.yk787-exam-page .wrap > #online-mock-exam':null,'#examPanel.active':null};
const document={readyState:'complete',fonts:{ready:Promise.resolve()},querySelector:sel=>query[sel]||null,addEventListener:(name,fn)=>{(hooks[name]??=[]).push(fn)}};
const window={scrollY:0,innerHeight:844,matchMedia:q=>({matches:q.includes('max-width')}),addEventListener(){},setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length}};
const context={document,window,location:{hash:''},requestAnimationFrame:fn=>fn(),Number};
vm.runInNewContext(readFileSync('assets/yk-v7875-rc1-ui.js','utf8'),context);
assert.equal(home.style.getPropertyValue('--yk875-top-trim'),'61px','measured 75px gap -> 14px');
const evt={target:{closest:sel=>sel==='#ykMenuJLPTV7864'?jlpt:null},button:0,defaultPrevented:false,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false,
 preventDefault:()=>log.push('prevent'),stopImmediatePropagation:()=>log.push('stop')};
hooks.pointerdown[0](evt);assert(log.includes('class+yk875-jlpt-pressed'));
hooks.click[0](evt);assert(!log.includes('original-click'),'original click is delayed for visible feedback');
assert(timers.some(t=>t.ms===170));timers.find(t=>t.ms===170).fn();assert(log.includes('original-click'));
// Reduced motion: no delayed intercept and no new animation.
const hooksReduce={};const rdoc={...document,addEventListener:(n,fn)=>{(hooksReduce[n]??=[]).push(fn)}};
const rwin={...window,matchMedia:q=>({matches:true})};
// The mobile query stays true and reduced motion is true for this context.
vm.runInNewContext(readFileSync('assets/yk-v7875-rc1-ui.js','utf8'),{...context,document:rdoc,window:rwin});
let prevented=false;
hooksReduce.click[0]({...evt,preventDefault:()=>{prevented=true}});
assert.equal(prevented,false,'reduced-motion selection bypasses delayed click');
console.log('PASS v7.87.5-rc1 isolated runtime: 14px gap, touch feedback, original click replay and reduced-motion');
