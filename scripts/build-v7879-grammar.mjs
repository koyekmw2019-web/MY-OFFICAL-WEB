/** v7.87.9 build-time additive, source-preserving. After v7.87.8 final builder.
 * New grammar page + lazy level JSON are copied by original public builder.
 * Bridge existing grammar tab to the new library; preserve legacy ?legacy=1.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve('dist');
const required=['study/jlpt-grammar-library.html','assets/yk-v7879-grammar.js','assets/yk-v7879-grammar.css','assets/yk-v7879-grammar-bridge.js',...['n5','n4','n3','n2','n1'].map(x=>`assets/yk-v7879-grammar-${x}.json`)];
for(const p of required)assert(existsSync(join(root,p)),`Missing grammar library publish asset ${p}`);
const path=join(root,'study/jlpt-learning.html');
let html=readFileSync(path,'utf8');
assert(html.includes('id="yk82Tabs"')&&html.includes('data-tab="grammar"'),'Original grammar tab missing');
assert(html.includes('yk-jlpt-learning-v782-page.js'),'Original learning engine missing');
assert(!html.includes('yk-v7879-grammar-bridge.js'),'Duplicate grammar bridge');
assert.equal((html.match(/<\/body>/g)||[]).length,1,'Exactly one closing body required');
html=html.replace('</body>','<script defer src="/assets/yk-v7879-grammar-bridge.js?v=7879"></script>\n</body>');
writeFileSync(path,html,'utf8');
console.log('v7.87.9: grammar library and level JSON available; existing 30 lessons preserved; bridge added to grammar tab');
