/** Regenerate the private Netlify grading map when PUBLIC v7.62-style question banks change.
 * Run on TRUSTED source only: the script evaluates locally owned JS bank declarations.
 * Usage: node scripts/regenerate-exam-answer-key-v763.mjs [--check]
 * Never upload the generated .mts file to the publish/assets folder. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(root+'/index.html','utf8');
const source=(start,end)=>{const a=html.indexOf(start),b=html.indexOf(end,a);if(a<0||b<0)throw Error('Question bank markers not found: '+start);return html.slice(a,b)};
const R=(word)=>word;
const driving=new Function('R',source('  const commonTheory=[','  const BOOKMARK_KEY=')+';return bank;')(R);
const license=new Function(source('const rules=[','const LicenseExam=')+';return licenseBanks;')();
const maintenance=new Function(source('const maintenanceTheoryPairs=[','const AutoMaintenanceExam=')+';return {maintenanceTheory,maintenanceTasks};')();
const js=readFileSync(root+'/assets/jlpt-native-mock-bank-v752.js','utf8');
const jlpt=JSON.parse(js.slice(js.indexOf('= ')+2).trim().replace(/;$/,''));
const data={version:763,
 jlpt:Object.fromEntries(jlpt.questions.map(q=>[q.id,{level:q.level,section:q.section,answer:q.answer}])),
 driving:Object.fromEntries(Object.entries(driving).map(([k,b])=>[k,{t:b.theory.map(q=>q.a),p:b.practical.map(q=>({a:q.a,visual:!!q.visual}))}])),
 license:Object.fromEntries(Object.entries(license).map(([k,b])=>[k,b.items.map(q=>({a:q.a,id:q.id}))])),
 maintenance:{theory:Object.fromEntries(maintenance.maintenanceTheory.map(q=>[q.q,q.a])),
 practical:Object.fromEntries(maintenance.maintenanceTasks.flatMap(t=>t.qs.map(q=>[q.q,q.a])))}};
const text='// Derived solely from v7.62 bundled original practice banks. Private Netlify Function source.\n// Regenerate together with client banks when questions change. Never place this file in published assets.\nexport const key = '+JSON.stringify(data)+' as const;\n';
const output=root+'/netlify/functions/_shared/exam-answer-key-v763.mts';
if(process.argv.includes('--check')) {
 if(readFileSync(output,'utf8')!==text){console.error('Answer key has drifted from public question bank. Regenerate and review.');process.exit(1)}
 console.log('PASS answer key matches public source bank');
}else{writeFileSync(output,text);console.log('Regenerated '+output)}
