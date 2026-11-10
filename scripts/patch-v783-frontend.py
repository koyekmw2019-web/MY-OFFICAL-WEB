from pathlib import Path
p=Path(__file__).resolve().parent.parent/'index.html'
s=p.read_text(encoding='utf-8')
def change(old,new,ct=1):
 global s
 a=s.count(old)
 if a!=ct:raise AssertionError(f'Expected {ct} instances, got {a}: {old[:100]}')
 s=s.replace(old,new)

change('<script src="/assets/yk-dictionary-v778-complete-draft.js?v=778qa20261105"></script>',
       '<script src="/assets/yk-dictionary-v778-complete-draft.js?v=778qa20261105"></script>\n<script src="/assets/yk-dictionary-v783-overlay.js?v=783qa20261109"></script>')

css='''<style id="dictionary-v783-quality-ui">
/* v7.83 additions only: preserve the existing premium cards and dark palette. */
.dictionary-jp ruby{ruby-align:center;line-height:1.75}
.dictionary-jp rt{font-size:.53em;color:#ed9da4;letter-spacing:.02em}
.dict-v783-example{padding:12px 13px;margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.025)}
.dict-v783-example b{display:block;font-size:11px;color:#d4a9ad;margin-bottom:5px;letter-spacing:.045em}
.dict-v783-example .dict-v783-ja{font-size:14px;line-height:2.3;color:#fff;overflow-wrap:anywhere}
.dict-v783-example ruby{ruby-align:center}.dict-v783-example rt{font-size:.6em;color:#bcbec6}
.dict-v783-example .dict-v783-my{display:block;color:#c6c6ca;font-size:13px;line-height:1.9;margin-top:6px}
.dict-v783-example .dict-v783-draft{display:block;font-size:10px;color:#919199;margin-top:7px}
.dict-v783-review{font-size:11px;color:#b8a786;margin-top:8px;line-height:1.7}
.dict-action-row{flex-wrap:wrap}.dict-action-row .dict-v783-report{margin-left:auto;color:#e8aab1;border-color:#663a40;background:#26161a}
.dict-action-row .dict-v783-report:hover{border-color:#ed8f9d;background:#392026}
.dict-report-dialog{color:#fff;border:1px solid #444;border-radius:24px;background:linear-gradient(150deg,#19191b,#09090b);padding:0;width:min(520px,calc(100vw - 28px));max-height:88vh;box-shadow:0 24px 90px #000b}
.dict-report-dialog::backdrop{background:rgba(0,0,0,.75);backdrop-filter:blur(5px)}
.dict-report-form{padding:23px;display:grid;gap:13px;max-height:85vh;overflow:auto}
.dict-report-form h3{font-size:21px;margin:0}.dict-report-form p{color:#aaa;font-size:12px;line-height:1.7;margin:0}
.dict-report-form label{display:grid;gap:6px;font-size:12px;color:#c5c5cc;font-weight:700}
.dict-report-form select,.dict-report-form input,.dict-report-form textarea{box-sizing:border-box;width:100%;font:inherit;font-size:14px;color:#fff;background:#131316;border:1px solid #39393d;border-radius:11px;padding:11px 12px;min-width:0;line-height:1.6}
.dict-report-form textarea{min-height:84px;resize:vertical}.dict-report-form .dict-report-actions{display:flex;gap:10px;flex-wrap:wrap}
.dict-report-form button{border:1px solid #45454a;border-radius:12px;padding:11px 14px;font:inherit;font-size:13px;font-weight:800;background:#1d1d21;color:#fff;cursor:pointer}
.dict-report-form button[type=submit]{background:#fff;color:#111;flex:1}.dict-report-form button:disabled{opacity:.45;cursor:wait}
.dict-report-status{font-size:12px;color:#c7c7ca;min-height:18px}.dict-report-status.error{color:#fb9ea9}.dict-report-status.success{color:#a4eac5}
@media(max-width:560px){.dict-report-form{padding:18px}.dict-action-row .dict-v783-report{margin-left:0}}
</style>'''
change('</style><meta name="description"',css+'</style><meta name="description"') if False else None
# Insert independent CSS immediately before closing head; no existing stylesheet removed.
change('</head>',css+'\n</head>')

modal='''<dialog id="dictionaryReportModal" class="dict-report-dialog" aria-labelledby="dictReportTitle">
  <form id="dictionaryReportForm" class="dict-report-form">
    <h3 id="dictReportTitle">⚑ Report Translation Error</h3>
    <p>STUDYING WITH YE KUN · စကားလုံးမှားယွင်းမှုကို အကြောင်းကြားပါ။ Admin က စစ်ဆေးပြီးမှ Dictionary ပြင်ဆင်မယ်။</p>
    <p id="dictReportWord" style="color:#fff;font-weight:800"></p>
    <p id="dictReportCurrent"></p>
    <label>Issue Type / အမှားအမျိုးအစား
      <select name="issueType" required><option value="wrong_meaning">မြန်မာအဓိပ္ပာယ် မှားနေသည်</option><option value="reading">Furigana / Reading မှားနေသည်</option><option value="example">Example Sentence မှားနေသည်</option><option value="missing_meaning">ဘာသာပြန် လိုအပ်သည်</option><option value="other">အခြား</option></select>
    </label>
    <label>Correct Myanmar Meaning (optional)
      <input name="suggestedMeaning" maxlength="500" placeholder="မှန်ကန်သော အဓိပ္ပာယ်ကို ရေးပေးပါ" autocomplete="off" />
    </label>
    <label>Explanation / ရှင်းပြချက်
      <textarea name="details" maxlength="1000" placeholder="ဘယ်နေရာမှားနေသလဲ ရှင်းပြပေးပါ"></textarea>
    </label>
    <div aria-hidden="true" style="display:none"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
    <div id="dictReportStatus" class="dict-report-status" aria-live="polite"></div>
    <div class="dict-report-actions"><button type="button" id="dictReportCancel">Cancel</button><button type="submit" id="dictReportSend">Send Report</button></div>
  </form>
</dialog>'''
change('<div class="dictionary-empty" id="dictionaryEmpty">No matching terms found.</div>\n</div>\n</section>',
       '<div class="dictionary-empty" id="dictionaryEmpty">No matching terms found.</div>\n</div>\n'+modal+'\n</section>')

hook='''
  // v7.83: apply small, traceable edits after merging the original glossary.
  // Stable headword+reading keys decouple Favorites from Myanmar translation edits.
  const v783Patch=window.YK_DICTIONARY_V783_PATCH || {patches:[],legacy:[]};
  const byWord=new Map((v783Patch.patches||[]).map(p=>[String(p.jp||'')+'¦'+String(p.reading||''),p]));
  const legacyByWord=new Map((v783Patch.legacy||[]).map(p=>[String(p.jp||''),p]));
  for (const t of terms) {
    const p=byWord.get(String(t.jp||'')+'¦'+String(t.reading||'')) || legacyByWord.get(String(t.jp||''));
    if(!p) continue;
    if(typeof p.mm==='string'&&p.mm!==t.mm){t._v783_original_mm=t.mm||'';t.mm=p.mm;}
    for(const key of ['example_ja','example_my','example_ruby','example_review_status','translation_review_status','qa_note']){
      if(p[key]!==undefined)t[key]=p[key];
    }
  }
'''
change('  const input = document.getElementById(\'dictionarySearch\');',hook+'\n  const input = document.getElementById(\'dictionarySearch\');')

old='''  const keyOf = t => t._v769 ? ['v769',t.jp||'',t.reading||''].join('¦') : [t.jp||'',t.reading||'',t.mm||''].join('¦');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));'''
new='''  const keyOf = t => ['v783',t.jp||'',t.reading||''].join('¦');
  const oldKeysOf = t => [
    ['v769',t.jp||'',t.reading||''].join('¦'),
    [t.jp||'',t.reading||'',t.mm||''].join('¦'),
    [t.jp||'',t.reading||'',t._v783_original_mm||''].join('¦')
  ];
  // Migration is one-time and non-destructive for existing saved Favorites.
  // Keep matching either historical key format, even if a gloss was corrected.
  const migratedFavorites = new Set();
  for(const t of terms){
    if(favorites.has(keyOf(t)) || oldKeysOf(t).some(k=>favorites.has(k)))migratedFavorites.add(keyOf(t));
  }
  if([...favorites].length && (migratedFavorites.size!==favorites.size || [...favorites].some(k=>!k.startsWith('v783¦')))){
    favorites=migratedFavorites;saveJSON(FAV_KEY,[...favorites]);
  }
  const termByKey = new Map(terms.map(t=>[keyOf(t),t]));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const wordId = t => [t.jp||'',t.reading||''].join('¦');
  const rubyWord = t => t.reading && /[一-龯々ヶ]/.test(t.jp||'') && /^[ぁ-ゖァ-ヿー・\s]+$/.test(t.reading||'')
    ? `<ruby>${esc(t.jp)}<rt>${esc(t.reading)}</rt></ruby>`
    : esc(t.jp)+(t.reading?` <span class="dictionary-reading">${esc(t.reading)}</span>`:'');
  const rubySentence = t => {
    if(!t.example_ruby)return esc(t.example_ja||'');
    const source=String(t.example_ruby);
    const rx=/\\[([^\\]:]+):([^\\]]+)\\]/g;
    let result='',last=0,m;
    while((m=rx.exec(source))){
      result+=esc(source.slice(last,m.index));
      result+=`<ruby>${esc(m[1])}<rt>${esc(m[2])}</rt></ruby>`;
      last=rx.lastIndex;
    }
    return result+esc(source.slice(last));
  };'''
change(old,new)

change('''<div class="dictionary-jp">${esc(t.jp)}${t.reading ? ` <span class="dictionary-reading">${esc(t.reading)}</span>` : ''}</div>''',
       '''<div class="dictionary-jp">${rubyWord(t)}</div>''')

old='''${t.example_ja ? `<div class="dict-v768-example"><span>例文</span> ${esc(t.example_ja)}${t.example_my?`<small>${esc(t.example_my)}</small>`:''}</div>` : ''}'''
new='''${t.translation_review_status==='editorial_draft_v783_not_expert_verified'?'<div class="dict-v783-review">မြန်မာအဓိပ္ပာယ် ပြင်ဆင်ထားသည် · Expert Review လိုအပ်နေဆဲ</div>':''}
          ${t.example_ja ? `<div class="dict-v783-example"><b>例文 · Japanese / Myanmar</b><div class="dict-v783-ja" lang="ja">${rubySentence(t)}</div>${t.example_my?`<div class="dict-v783-my" lang="my">${esc(t.example_my)}</div>`:''}${t.example_review_status==='original_educational_draft_v783'?'<small class="dict-v783-draft">Original educational example · Editorial review in progress</small>':''}</div>` : ''}'''
change(old,new)

change('''<button type="button" class="dict-mini-btn" data-action="copy">Copy</button>''',
       '''<button type="button" class="dict-mini-btn" data-action="copy">Copy</button>
            <button type="button" class="dict-mini-btn dict-v783-report" data-action="report" aria-label="Report Translation Error">⚑ Report Error</button>''')

change('''    const t = terms.find(x => keyOf(x) === k);''','''    const t = termByKey.get(k);''')

change('''    if(action === 'speak'){''','''    if(action === 'report'){
      openDictionaryReport(t);
      return;
    }

    if(action === 'speak'){''')

# make lookup robust even with corrected (overlay) meanings
hook2='''
  // v7.83: public reports; users may report as guests, but only the server stores feedback.
  const reportDialog=document.getElementById('dictionaryReportModal');
  const reportForm=document.getElementById('dictionaryReportForm');
  const reportStatus=document.getElementById('dictReportStatus');
  const reportSend=document.getElementById('dictReportSend');
  let reportedTerm=null;
  function openDictionaryReport(t){
    if(!reportDialog || !reportForm)return;
    reportedTerm=t;
    reportForm.reset();
    document.getElementById('dictReportWord').textContent=`${t.jp} (${t.reading||'—'})`;
    document.getElementById('dictReportCurrent').textContent=`လက်ရှိ အဓိပ္ပာယ်: ${t.mm||'—'}`;
    reportStatus.className='dict-report-status';reportStatus.textContent='';
    if(typeof reportDialog.showModal==='function')reportDialog.showModal();else reportDialog.setAttribute('open','');
  }
  document.getElementById('dictReportCancel')?.addEventListener('click',()=>reportDialog?.close());
  reportDialog?.addEventListener('click',e=>{if(e.target===reportDialog)reportDialog.close()});
  reportForm?.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!reportedTerm||!reportSend)return;
    const data=new FormData(reportForm);
    const payload={wordId:wordId(reportedTerm),jp:reportedTerm.jp,reading:reportedTerm.reading||'',reportedMeaning:reportedTerm.mm||'',issueType:data.get('issueType'),suggestedMeaning:String(data.get('suggestedMeaning')||'').trim(),details:String(data.get('details')||'').trim(),website:String(data.get('website')||'')};
    if(!payload.suggestedMeaning&&!payload.details){reportStatus.className='dict-report-status error';reportStatus.textContent='အမှားအကြောင်း သို့မဟုတ် မှန်ကန်တဲ့ အဓိပ္ပာယ် ရေးပေးပါ။';return}
    reportSend.disabled=true;reportStatus.textContent='Sending…';reportStatus.className='dict-report-status';
    try{
      const r=await fetch('/.netlify/functions/dictionary-report',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await r.json().catch(()=>({}));
      if(!r.ok||!result.ok)throw new Error(result.error||'Report service unavailable');
      reportStatus.className='dict-report-status success';
      reportStatus.textContent=result.alreadyReported?'ဒီစကားလုံးအတွက် Report ကို လက်ခံထားပြီးပါပြီ။':'Report လက်ခံရရှိပါပြီ။ Admin စစ်ဆေးပြီးမှ အဓိပ္ပာယ်ပြင်ဆင်ပါမယ်။';
      reportForm.elements.suggestedMeaning.value='';reportForm.elements.details.value='';
    }catch(err){reportStatus.className='dict-report-status error';reportStatus.textContent='Report မပို့နိုင်သေးပါ။ '+(err.message||'Please try again.');}
    finally{reportSend.disabled=false}
  });
  // Fetch only administrator-approved changes, leaving the static dictionary usable offline.
  fetch('/.netlify/functions/dictionary-overrides',{credentials:'same-origin'})
    .then(r=>r.ok?r.json():Promise.reject(new Error('Offline dictionary mode')))
    .then(data=>{
      if(!Array.isArray(data.overrides))return;
      const index=new Map(terms.map(t=>[wordId(t),t]));
      let changed=false;
      for(const record of data.overrides){
        const t=index.get(record.word_id);
        if(t&&typeof record.mm==='string'&&record.mm.trim()&&record.mm!==t.mm){t._v783_original_mm=t._v783_original_mm||t.mm;t.mm=record.mm;t.translation_review_status='admin_approved_override';changed=true}
      }
      if(changed)render();
    }).catch(()=>{});
'''
change('''  renderRecent();
  syncToolState();
  render();
})();''',hook2+'''  renderRecent();
  syncToolState();
  render();
})();''')
p.write_text(s,encoding='utf-8')
print('Index HTML patched',len(s),'Report',s.count('dictionaryReportModal'),'overlay',s.count('yk-dictionary-v783-overlay.js'))
