/** v7.86.4 Countdown rolling schedule regression: time-zone, year boundary and labels. */
import {readFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');
const code=read('assets/yk-jlpt-reading-v7822.js');
let tests=0;
function check(name,fn){fn();console.log(`PASS v7864-countdown ${name}`);tests++;}
function simulate(iso){
 const realDate=Date;
 class Clock extends realDate{
  constructor(...args){super(...(args.length?args:[iso]))}
  static now(){return realDate.parse(iso)}
 }
 const nodes=[{innerHTML:'',setAttribute(k,v){this[k]=v}},{innerHTML:'',setAttribute(k,v){this[k]=v}}];
 const listeners={};let tick;
 const sandbox={Date:Clock,Intl,window:{setInterval(fn,ms){tick=fn;assert.equal(ms,60000)},addEventListener(n,fn){listeners[n]=fn}},document:{hidden:false,querySelectorAll(){return nodes},addEventListener(n,fn){listeners[n]=fn}}};
 vm.runInNewContext(code,sandbox,{filename:'yk-jlpt-reading-v7822.js'});
 assert.equal(nodes[0].innerHTML,nodes[1].innerHTML);
 return {html:nodes[0].innerHTML,label:nodes[0]['aria-label'],listeners,tick,nodes};
}
check('official 2026 December date and JST 26 days from November 10',()=>{
 const x=simulate('2026-11-10T08:00:00Z'); // 17:00 JST
 assert.match(x.html,/>26<small>Days Left/);
 assert.match(x.html,/6 Dec 2026/);
 assert.match(x.html,/Last 30-day review · 11\/6–12\/6/);
 assert.match(x.html,/Official date/);
 assert.match(x.html,/13%/);
});
check('JST midnight changes the day even if UTC date has not yet changed',()=>{
 const before=simulate('2026-11-10T14:59:59Z');
 const after=simulate('2026-11-10T15:00:01Z');
 assert.match(before.html,/>26<small>Days Left/);
 assert.match(after.html,/>25<small>Days Left/);
});
check('December 6 in Tokyo displays exam day',()=>{
 const x=simulate('2026-12-05T15:00:00Z');
 assert.match(x.html,/Exam Day/);
 assert.match(x.html,/width:100%/);
 assert.match(x.html,/Official date/);
});
check('December 7 rolls to July 2027; provisional is not misrepresented as official',()=>{
 const x=simulate('2026-12-06T15:00:00Z');
 assert.match(x.html,/4 Jul 2027/);
 assert.match(x.html,/Tentative · 公式発表待ち/);
 assert.match(x.html,/Last 30-day review · 6\/4–7\/4/);
 assert.match(x.label,/tentative/);
 assert.doesNotMatch(x.html,/2026 JLPT ပြီးဆုံး/);
});
check('July 2027 exam auto-rolls to December 2027',()=>{
 const x=simulate('2027-07-04T15:00:00Z');
 assert.match(x.html,/5 Dec 2027/);
 assert.match(x.html,/Last 30-day review · 11\/5–12\/5/);
});
check('following year rolls and remains not falsely confirmed',()=>{
 const x=simulate('2028-01-01T03:00:00Z');
 assert.match(x.html,/2 Jul 2028/);
 assert.match(x.html,/Tentative/);
});
check('countdown refreshes periodically and on tab resume',()=>{
 const x=simulate('2026-11-10T10:00:00Z');
 assert.equal(typeof x.tick,'function');
 assert.equal(typeof x.listeners.visibilitychange,'function');
 assert.equal(typeof x.listeners.pageshow,'function');
 x.tick();x.listeners.visibilitychange();x.listeners.pageshow();
 assert.match(x.nodes[0].innerHTML,/6 Dec 2026/);
});
check('both pages load the updated asset with cache busting',()=>{
 for(const p of ['index.html','study/jlpt-learning.html']){
  const html=read(p);
  assert.match(html,/yk-jlpt-reading-v7822\.js\?v=7864dynamic/);
  assert.match(html,/yk-jlpt-reading-v7822\.css\?v=7864dynamic/);
  assert.match(html,/Upcoming JLPT exam countdown/);
 }
 assert.match(read('service-worker.js'),/v7864-jlpt-menu-target-dynamic-countdown/);
});
console.log(`v7.86.4 rolling countdown ${tests} PASS / 0 FAIL`);
