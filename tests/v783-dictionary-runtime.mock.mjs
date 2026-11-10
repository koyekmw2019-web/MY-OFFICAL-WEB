/** v7.83 browser-independent DOM/runtime smoke; does not substitute for real browser QA. */
import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
const read=x=>fs.readFileSync(x,'utf8');
const html=read('index.html');const start=html.indexOf('<script>',html.indexOf('<!-- ===== V7.18 Dictionary pronunciation restore:'))+8;
const code=html.slice(start,html.indexOf('</script>',start));
class Element{
 constructor(id){this.id=id;this.listeners={};this.value='';this.innerHTML='';this.textContent='';this.dataset={};this.style={};this.hidden=false;this.disabled=false;this.className='';this.open=false;this.classList={toggle:()=>{}};this.elements={suggestedMeaning:{value:''},details:{value:''}}}
 addEventListener(type,fn){this.listeners[type]=fn}
 querySelectorAll(){return []}
 reset(){this.elements.suggestedMeaning.value='';this.elements.details.value=''}
 showModal(){this.open=true}
 close(){this.open=false}
}
const ids=['dictionarySearch','dictionaryResults','dictionaryEmpty','dictionaryToolsV7','dictFavMode','dictRecentV7','dictCountV7','dictionaryLoadMore','dictionaryReportModal','dictionaryReportForm','dictReportStatus','dictReportSend','dictReportWord','dictReportCurrent','dictReportCancel'];
const elems=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
const key='yekun_dictionary_favorites_v7';const store=new Map([[key,JSON.stringify(['v769¦免許¦めんきょ'])]]);
const calls=[];
const win={};const document={getElementById:id=>elems[id]||null,querySelectorAll:()=>[]};
const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
const fetch=async (url,opts={})=>{
 calls.push([url,opts]);
 if(url.includes('dictionary-overrides'))return {ok:true,json:async()=>({overrides:[]})};
 if(url.includes('dictionary-report'))return {ok:true,json:async()=>({ok:true})};
 throw new Error('Unexpected API '+url);
};
class FakeFormData{constructor(){this.data={issueType:'wrong_meaning',suggestedMeaning:'လက်ခံနိုင်သော အဓိပ္ပာယ်',details:'Test report',website:''}}get(k){return this.data[k]||''}}
const ctx=vm.createContext({window:win,document,localStorage,fetch,FormData:FakeFormData,console,setTimeout(){},clearTimeout(){},navigator:{},SpeechSynthesisUtterance:function(){}});
vm.runInContext(read('assets/yk-dictionary-v778-complete-draft.js'),ctx);
vm.runInContext(read('assets/yk-dictionary-v783-overlay.js'),ctx);
vm.runInContext(code,ctx);
assert(elems.dictionarySearch.listeners.input,'No search listener');
elems.dictionarySearch.value='免許';elems.dictionarySearch.listeners.input();
assert(elems.dictionaryResults.innerHTML.includes('လိုင်စင်'),'Corrected meaning not visible');
assert(elems.dictionaryResults.innerHTML.includes('dict-v783-report'),'Report button not visible');
assert(elems.dictionaryResults.innerHTML.includes('★ Saved'),'Legacy favorite not migrated');
const fav=JSON.parse(store.get(key));assert(fav.includes('v783¦免許¦めんきょ'));
elems.dictionarySearch.value='学校';elems.dictionarySearch.listeners.input();
assert(elems.dictionaryResults.innerHTML.includes('例文 · Japanese / Myanmar'));
assert(elems.dictionaryResults.innerHTML.includes('<ruby>学校<rt>がっこう</rt></ruby>'));
const k=elems.dictionaryResults.innerHTML.match(/data-term-key="([^"]+)"/)[1];
const target={closest:sel=>sel==='.dictionary-item'?{dataset:{termKey:k}}:sel==='[data-action]'?{dataset:{action:'report'}}:null};
await elems.dictionaryResults.listeners.click({target});
assert(elems.dictionaryReportModal.open,'Report dialog not opened');
assert(elems.dictReportWord.textContent.includes('学校'),'Wrong word in report dialog');
let prevented=false;
await elems.dictionaryReportForm.listeners.submit({preventDefault:()=>prevented=true});
assert(prevented);const sent=calls.find(x=>x[0].includes('dictionary-report'));
assert(sent&&sent[1].method==='POST');
assert.equal(JSON.parse(sent[1].body).wordId,'学校¦がっこう');
assert(elems.dictReportStatus.textContent.includes('Report လက်ခံရရှိ'),'Success feedback missing');
console.log('PASS v7.83 Dictionary runtime mocked: search, corrected meaning, ruby, bilingual example, favorite migration, report opening and posting');
