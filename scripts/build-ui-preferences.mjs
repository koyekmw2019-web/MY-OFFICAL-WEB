/** Build-time presentation injection. Base: YE KUN main PR #5 merge.
 * Injects UI preference stylesheet + local interaction into public dist HTML only.
 * Does not touch source HTML, Netlify Functions, migrations or user data.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dist=resolve('dist');
const codeNames=['yk-ui-preferences.css','yk-ui-preferences.js'];
for(const name of codeNames)assert(existsSync(join(dist,'assets',name)),`Missing published /assets/${name}`);
const head=`<script id="yk-ui-theme-init">try{document.documentElement.setAttribute('data-yk-ui-theme',localStorage.getItem('yk_ui_theme')==='light'?'light':'dark')}catch{document.documentElement.setAttribute('data-yk-ui-theme','dark')}</script><link rel="stylesheet" href="/assets/yk-ui-preferences.css?v=1">`;
const tail=`<script defer src="/assets/yk-ui-preferences.js?v=1"></script>`;
function walk(d){return readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.name.endsWith('.html')?[join(d,e.name)]:[])}
const files=walk(dist);
assert(files.length>=22,`Expected 22+ HTML pages; found ${files.length}`);
for(const file of files){
 let s=readFileSync(file,'utf8');
 assert.equal(s.split('</head>').length-1,1,`${file} head boundary changed`);
 assert.equal(s.split('</body>').length-1,1,`${file} body boundary changed`);
 assert(s.includes('id="yk-mobile-nav"'),`${file} original 5-tab navigation missing`);
 assert(!s.includes('yk-ui-preferences.css')&&!s.includes('yk-ui-preferences.js'),`${file} preferences already injected`);
 s=s.replace('</head>',head+'</head>').replace('</body>',tail+'</body>');
 writeFileSync(file,s,'utf8');
}
console.log(`PASS UI preferences injected into ${files.length} public pages without modifying source HTML`);
