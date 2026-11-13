/** v7.87.14 pure engine and 509-content practice coverage tests. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEVELS,EXPECTED_COUNTS,STORAGE_KEY,normalizeAnswer,validGrammarId,cleanState,grade,addSession,summarize,dayKey,cloze,mcqByItem,makeDeck} from '../assets/yk-v78714-engine.js';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const bank=json('assets/yk-v78714-choice-bank.json').items;
assert.equal(bank.length,40);
assert.equal(new Set(bank.map(x=>x.id)).size,40);
assert.equal(STORAGE_KEY,'yk_grammar_mastery_v78714_v1');
assert(!validGrammarId('some_free_attempt'));
assert.equal(normalizeAnswer(' て　から '),'てから');
let total=0,exCount=0;
for(const lv of LEVELS){
 const items=json(`assets/yk-v7879-grammar-${lv.toLowerCase()}.json`).items;
 assert.equal(items.length,EXPECTED_COUNTS[lv]);total+=items.length;
 for(const item of items){
  assert(validGrammarId(item.id));assert.equal(item.level,lv);
  for(const e of item.examples){
   const c=cloze(item,item.examples.indexOf(e));assert(c.prompt.includes('＿＿'),item.id);
   assert(!c.prompt.includes('<script>'));assert.equal(c.answer,e.highlight);
   assert(c.meaning.my&&c.meaning.en&&c.meaning.ja);
   exCount++;
  }
 }
 const subset=bank.filter(x=>x.level===lv);
 assert.equal(subset.length,8);
 const choices=mcqByItem(items,subset);
 assert.equal(choices.length,8);assert(choices.every(x=>x.options.length===4&&new Set(x.options).size===4));
 const original=makeDeck({items,bank:subset,mode:'recall',count:20,date:'2026-11-12'});
 assert.equal(original.length,20);assert.equal(new Set(original.map(x=>x.id)).size,20);
 const mcq=makeDeck({items,bank:subset,mode:'choice',count:10,date:'2026-11-12'});
 assert.equal(mcq.length,8,'Do not synthesize extra unreviewed multiple-choice questions');
 assert(mcq.every(x=>x.kind==='choice'&&x.options.includes(x.answer)));
 const nextDay=makeDeck({items,bank:subset,mode:'recall',count:20,date:'2026-11-13'});
 assert.notDeepEqual(original.map(x=>x.id),nextDay.map(x=>x.id));
 let state=cleanState({});state=grade(state,items[0].id,false);state=grade(state,items[1].id,true);
 assert.equal(summarize(state,lv).weak,1);assert.equal(summarize(state,lv).practiced,2);
 const review=makeDeck({items,bank:subset,state,mode:'review',count:5,date:'2026-11-12'});
 assert.equal(review.length,1);assert.equal(review[0].id,items[0].id);
 const day=makeDeck({items,bank:subset,state,mode:'daily',count:5,date:'2026-11-12'});
 assert.equal(day[0].id,items[0].id,'Weak grammar gets priority in the daily session');
 state=grade(state,items[0].id,true);assert.equal(summarize(state,lv).weak,0);
 state=addSession(state,{day:'2026-11-12',level:lv,mode:'review',count:1,correct:1,finishedAt:Date.now()});
 assert.equal(state.sessions.length,1,'Short review sessions must be persisted');
}
assert.equal(total,509);assert.equal(exCount,1018);
assert.equal(new Set(bank.map(x=>x.level)).size,5);
let dirty={records:{'N5-grammar-001':{attempts:3,correct:999,wrong:50,streak:5,updatedAt:1},hack:{attempts:1,correct:1}},sessions:[{day:'junk',level:'N5',mode:'daily',count:5,correct:5,finishedAt:1}]};
const safe=cleanState(dirty);assert.deepEqual(Object.keys(safe.records),['N5-grammar-001']);assert.equal(safe.records['N5-grammar-001'].correct,3);assert.equal(safe.sessions.length,0);
assert.equal(dayKey(new Date('2026-11-12T12:00:00')), '2026-11-12');
console.log('PASS v78714-engine: 509 original items, 1,018 cloze examples, 40 curated MCQs, no automatically synthesized distractors, review/daily prioritization, per-device progress & session validation');
