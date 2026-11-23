/* YE KUN v7.56 — JLPT-format ranges, minimums, and total thresholds.
   Proportional correctness ESTIMATE only; never represent it as official IRT score. */
(function(g){
'use strict';
const PASS={N1:100,N2:90,N3:95,N4:90,N5:80};
const NAMES={language:'言語知識（文字・語彙・文法）',reading:'読解',listening:'聴解',combined:'言語知識・読解'};
const EXPECTED={vocabulary:36,grammar:24,reading:20,listening:20};
function calculate(level,results){
 if(!Object.prototype.hasOwnProperty.call(PASS,level))throw Error('Unsupported level');
 if(!Array.isArray(results))throw Error('Invalid results');
 const counts={vocabulary:0,grammar:0,reading:0,listening:0},good={vocabulary:0,grammar:0,reading:0,listening:0};
 for(const r of results){const sec=r?.q?.section;if(!Object.prototype.hasOwnProperty.call(counts,sec))throw Error('Unknown section');counts[sec]++;if(r.correct===true)good[sec]++}
 for(const sec of Object.keys(EXPECTED))if(counts[sec]!==EXPECTED[sec])throw Error('Question bank mismatch '+sec);
 const mk=(id,correct,count,max,min)=>{const score=Math.round(max*correct/count);return {id,name:NAMES[id],correct,total:count,score,max,min,met:score>=min}};
 const listening=mk('listening',good.listening,counts.listening,60,19);
 const sections=['N1','N2','N3'].includes(level)?[
  mk('language',good.vocabulary+good.grammar,counts.vocabulary+counts.grammar,60,19),
  mk('reading',good.reading,counts.reading,60,19),listening
 ]:[mk('combined',good.vocabulary+good.grammar+good.reading,counts.vocabulary+counts.grammar+counts.reading,120,38),listening];
 const total=sections.reduce((a,b)=>a+b.score,0),correct=Object.values(good).reduce((a,b)=>a+b,0);
 const passMark=PASS[level],totalMet=total>=passMark,sectionsMet=sections.every(s=>s.met);
 return {level,total,max:180,passMark,totalMet,sectionsMet,pass:totalMet&&sectionsMet,sections,correct,questionCount:results.length,accuracy:Math.round(100*correct/results.length),kind:'practice-proportional-estimate-not-IRT'};
}
g.YKJLPTScoringV755={calculate,passMarks:PASS,version:'v7.56'};
})(typeof window!=='undefined'?window:globalThis);
