/** v7.84.1: lossless public output tree. Netlify publishes dist/, not source QA files.
 * Does not move or edit backend, identity, exam, payment, dictionary QA, or YKCR files.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync,rmSync,copyFileSync,readdirSync} from 'node:fs';
import {relative,resolve,dirname,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {packDictionary} from './_dictionary-packer-v7841.mjs';
import {lazyDictionaryHTML} from './_dictionary-lazy-v7863.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=join(root,'dist');
const preview=process.argv.includes('--preview-allow-missing-generated-bundle');
const reads=p=>readFileSync(join(root,p),'utf8');
const publicRoots=['index.html','video-class.html','login.html','dashboard.html','admin-dashboard.html',
  'student-dashboard.html','member-dashboard.html','dictionary-reports.html',
  'manifest.webmanifest','robots.txt','sitemap.xml','service-worker.js','yk-192.png','yk-512.png'];
const legacyAssets=new Set([
  'yk-dictionary-v768.js','yk-dictionary-v769.js','yk-dictionary-v770.js','yk-dictionary-v772.js',
  'yk-dictionary-v774.js','yk-dictionary-v778.js',
  'yk-site-auth-v757.js','yk-site-auth-v758.js','yk-brand-icon-v778.png',
  'jlpt-chokuzen-bank-v750.json','jlpt-native-mock-v752.json',
  'yk-dashboard-v758.css','yk-horizontal-white-v778.png',
  'jlpt-n1/n1-cover.jpg','jlpt-n1/n1-reflection-v754.png',
  'jlpt-n2/n2-cover.jpg','jlpt-n2/n2-reflection-v754.png',
  'jlpt-n3/n3-cover.jpg','jlpt-n3/n3-reflection-v754.png',
  'jlpt-n4/n4-cover.jpg','jlpt-n4/n4-reflection-v754.png',
  'jlpt-n5/n5-cover.jpg','jlpt-n5/n5-reflection-v754.png'
]);
function walk(dir){
  if(!existsSync(dir))return [];
  return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
}
const study=walk(join(root,'study')).filter(x=>x.endsWith('.html')).map(x=>relative(root,x));
const assetPaths=walk(join(root,'assets')).map(x=>relative(join(root,'assets'),x).split(sep).join('/'));
// Both HTML and assets are scanned: an archive asset must not be omitted when still referenced.
const publicText=[...publicRoots,...study,...assetPaths.map(x=>'assets/'+x)].filter(x=>/\.(?:html|js|css|json|xml|webmanifest)$/.test(x)&&existsSync(join(root,x)))
 .map(x=>({file:x,text:reads(x)}));
for(const unused of legacyAssets){
  if(!assetPaths.includes(unused))throw Error(`Missing expected legacy asset: ${unused}`);
  const uses=publicText.filter(x=>x.file!=='assets/'+unused&&(x.text.includes('assets/'+unused)||x.text.includes(unused)));
  if(uses.length)throw Error(`Refusing to exclude used asset ${unused}, referenced by ${uses.map(x=>x.file).join(', ')}`);
}
const keep=assetPaths.filter(x=>!legacyAssets.has(x));
if(!existsSync(join(root,'assets/identity.bundle.js'))&&!preview)
  throw Error('esbuild identity.bundle.js missing; run npm run build (do not deploy partial output)');
const dictionary='assets/yk-dictionary-v778-complete-draft.js';
const packed=packDictionary(reads(dictionary));
rmSync(out,{recursive:true,force:true});
const copy=path=>{const dest=join(out,path);mkdirSync(dirname(dest),{recursive:true});copyFileSync(join(root,path),dest)};
for(const path of [...publicRoots,...study,...keep.map(x=>'assets/'+x)]){
 if(path===dictionary)continue;
 copy(path);
}
// Cache-bust the packed transport only in deploy output. The source HTML remains
// byte-compatible with v7.84 test assertions and existing source workflows.
const publicHome=join(out,'index.html');
const beforeHome=readFileSync(publicHome,'utf8');
const afterHome=beforeHome.replace('/assets/yk-dictionary-v778-complete-draft.js?v=778qa20261105',
  '/assets/yk-dictionary-v778-complete-draft.js?v=7841packed');
if(afterHome===beforeHome)throw Error('Dictionary src cache-bust location changed');
const optimized=lazyDictionaryHTML(afterHome);
writeFileSync(publicHome,optimized.html,'utf8');
writeFileSync(join(out,'assets/yk-dictionary-runtime-v7863.js'),optimized.code,'utf8');
mkdirSync(dirname(join(out,dictionary)),{recursive:true});
writeFileSync(join(out,dictionary),packed.code,'utf8');
const report={version:'7.86.4',source_files:assetPaths.length,archived_nonpublished_assets:legacyAssets.size,
  published_assets:keep.length,public_html_pages:publicRoots.filter(x=>x.endsWith('.html')).length+study.length,
  dictionary_words:packed.words.length,
  original_dictionary_bytes:Buffer.byteLength(reads(dictionary)),
  deployed_dictionary_bytes:Buffer.byteLength(packed.code),
  lazy_dictionary_runtime_bytes:Buffer.byteLength(optimized.code),
  published_homepage_bytes:Buffer.byteLength(optimized.html),
  includes_identity_bundle:existsSync(join(out,'assets/identity.bundle.js')),
  excluded_archival_root_files:true};
console.log(JSON.stringify(report,null,2));
