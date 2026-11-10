/** Public-only dictionary transport: reconstruct every original word object unchanged.
 * Source-of-truth asset is kept verbatim for editorial QA and rollback.
 * This is a lossless wire-format transform, NOT a translation rewrite.
 */
const TABLE_KEYS=['levels','sources','quality','source_names','translation_review_status','translation_source'];
const REQUIRED=['jp','reading','level','mm','en','quality','levels','sources','source_names'];
const OPTIONAL=['translation_review_status','translation_source'];

export function parseSourceDictionary(source){
  const m=source.match(/window\.YK_DICTIONARY_V778\s*=\s*(\[[\s\S]*\])\s*;\s*$/);
  if(!m)throw Error('Unexpected source dictionary assignment. Refusing to optimize.');
  const data=JSON.parse(m[1]);
  if(!Array.isArray(data)||data.length!==8542)throw Error('Dictionary size mismatch');
  return data;
}
export function packDictionary(source){
  const words=parseSourceDictionary(source);
  const tables=Object.fromEntries(TABLE_KEYS.map(k=>[k,[]]));
  const maps=Object.fromEntries(TABLE_KEYS.map(k=>[k,new Map()]));
  function intern(k,v){
    if(v===undefined)return -1;
    const key=JSON.stringify(v);
    if(!maps[k].has(key)){
      maps[k].set(key,tables[k].length);
      tables[k].push(v);
    }
    return maps[k].get(key);
  }
  const extras={};
  const rows=words.map((w,i)=>{
    for(const key of REQUIRED)if(!Object.hasOwn(w,key))throw Error(`Missing ${key} at ${i}`);
    const rest={};
    for(const [k,v] of Object.entries(w))if(!REQUIRED.includes(k)&&!OPTIONAL.includes(k))rest[k]=v;
    if(Object.keys(rest).length)extras[i]=rest;
    return [w.jp,w.reading,w.level,w.mm,w.en,
      intern('quality',w.quality),intern('levels',w.levels),intern('sources',w.sources),
      intern('source_names',w.source_names),intern('translation_review_status',w.translation_review_status),
      intern('translation_source',w.translation_source)];
  });
  const J=x=>JSON.stringify(x);
  const code=`/* v7.84.1: lossless packed dictionary transport (8,542 words). Original QA source retained in repository. */\n`+
  `window.YK_DICTIONARY_V778=(()=>{const t=${J(tables)},r=${J(rows)},x=${J(extras)};\n`+
  `return r.map((v,i)=>{const o={jp:v[0],reading:v[1],level:v[2],levels:t.levels[v[6]].slice(),sources:t.sources[v[7]].slice(),mm:v[3],en:v[4],quality:t.quality[v[5]],source_names:t.source_names[v[8]].slice()};`+
  `if(v[9]!==-1)o.translation_review_status=t.translation_review_status[v[9]];`+
  `if(v[10]!==-1)o.translation_source=t.translation_source[v[10]];`+
  `if(x[i])Object.assign(o,x[i]);return o});})();\n`;
  return {code,words};
}
