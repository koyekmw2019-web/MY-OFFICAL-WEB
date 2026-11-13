/* v7.87.12 source/static guards. Full repo build and live backends are separate. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=x=>readFileSync(x,'utf8');
const manifest=JSON.parse(read('package.json'));
assert(['7.87.12','7.87.13','7.87.14','7.87.15','7.87.16','7.87.17','7.87.18','7.87.19','7.87.20','7.87.21','7.88.0-rc.1','7.88.1-rc.1'].includes(manifest.version));
assert(manifest.scripts.build.includes('build-v78712-i18n.mjs'));
assert(manifest.scripts.test.includes('v78712-source.mjs'));
const js=read('assets/yk-v78712-i18n.js');
assert(js.includes('yk_lang')&&js.includes('MutationObserver'));
assert(js.includes('yk879-meaning,.yk879-connection,.yk879-examples'));
assert(js.includes('yk879-grammar-title')&&js.includes('yk82-quiz'));
assert(js.includes('yk-ui-language-v78712'));
assert(!js.includes('fetch(')&&!js.includes('window.location='));
const engine=read('assets/yk-v7879-grammar.js');
assert(engine.includes('yk879-grammar-mark'));
assert(engine.includes('yk_grammar_v7879_device'));
for(const lv of ['n5','n4','n3','n2','n1'])assert(existsSync('assets/yk-v7879-grammar-'+lv+'.json'));
for(const p of ['assets/yk-v7878-admin.js','assets/yk-v7877-growth.js']){
 const s=read(p);assert(s.includes('YKUiLanguageV78712?.t(english)'));
 assert(!s.includes('const ask=english=>ask('));
 assert(s.includes('window.confirm('));
}
assert(existsSync('netlify/functions/_shared/exam-autosave.mts'));
assert(existsSync('netlify/functions/yk-enrollment-crm.mts'));
assert(existsSync('netlify/functions/yk-business-growth.mts'));
console.log('PASS v78712-source: additive i18n, no content/backend rewrite, CRM/business confirmations localized');
