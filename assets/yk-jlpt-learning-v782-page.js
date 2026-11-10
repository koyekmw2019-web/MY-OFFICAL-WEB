/* v7.82 JLPT Learning Center: original lessons, bookmarked reading/listening, daily practice. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),S=window.YKJLPTStateV782;
 if(!$('yk82Content')||!S)return;
 const fmt=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const sections=['vocabulary','grammar','kanji','reading','listening'];
 const names={vocabulary:'Vocabulary · 単語 · ဝေါဟာရ',grammar:'Grammar · 文法 · သဒ္ဒါ',kanji:'Kanji · 漢字 · ခန်းဂျီး',reading:'Reading · 読解 · ဖတ်ရှုခြင်း',listening:'Listening · 聴解 · နားထောင်ခြင်း'};
 let data=null,level='N5',tab='vocabulary',session=null,feedback={},speakingId=null,readingUpgrade=null,readingFilter='all';
 const params=new URLSearchParams(location.search);
 let selectedLevel=S.LEVELS.includes(params.get('level'))?params.get('level'):null;
 let selectedSection=[...sections,'saved','daily'].includes(params.get('section'))?params.get('section'):null;
 function updateUrl(){try{const u=new URL(location.href);u.searchParams.set('level',level);u.searchParams.set('section',tab);history.replaceState(null,'',u)}catch{}}
 const entries=()=>data?.levels?.[level]||{};
 function allItems(){return sections.flatMap(cat=>(entries()[cat]||[]).map(item=>({...item,category:cat})))}
 const mapById=()=>new Map(allItems().map(item=>[item.id,item]));
 function dateLocal(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
 function renderStats(){const state=S.snapshot(),p=S.progress(state,data,level),b=S.bookmarks(state).filter(x=>x.startsWith(level+'-')).length;
  $('yk82Stats').innerHTML=`<div class="yk82-stat"><strong>${p.completed}/${p.total}</strong><small>Completed Lessons</small></div><div class="yk82-stat"><strong>${p.percent}%</strong><small>Level Progress</small></div><div class="yk82-stat"><strong>${b}</strong><small>Bookmarks</small></div>`;
  $('yk82AsideProgress').innerHTML=`<div><strong>JLPT ${level} · ${p.percent}%</strong><div class="yk82-progress-line"><div class="yk82-progress-fill" style="width:${p.percent}%"></div></div><p class="yk82-sub">${p.completed} / ${p.total} သင်ခန်းစာ လေ့လာပြီး</p></div><p class="yk82-sub">Daily Practice: ${state.dailyRuns.filter(x=>x.level===level).length} completed sessions</p>`;
  $('yk82SyncStatus').textContent=S.getScope()==='guest'?'Progress သိမ်းဆည်းမှု: ဒီ Browser မှာသာ (Guest) · Login ဝင်လျှင် Account သီးသန့် သိမ်းပါမယ်။':(S.isCloud()?'Account Progress: Browser + Netlify Cloud Sync ချိတ်ဆက်ပြီး။':'Account Progress: ဒီ Browser မှာသိမ်းထားပြီး · Cloud Sync မရသေးပါ။');
 }
 function commonActions(item){return `<div class="yk82-actions"><button class="yk82-action" type="button" data-action="bookmark" data-id="${fmt(item.id)}" aria-pressed="${S.isSaved(item.id)}">${S.isSaved(item.id)?'★ Saved':'☆ Bookmark'}</button><button class="yk82-action" type="button" data-action="complete" data-id="${fmt(item.id)}" aria-pressed="${S.isDone(item.id)}">${S.isDone(item.id)?'✓ Learned':'✓ Mark learned'}</button></div>`}
 function quiz(item,daily=false){const id=item.id,chosen=feedback[id],disabled=chosen!==undefined;return `<div class="yk82-quiz"><p>${fmt(item.question)}</p><div class="yk82-choices">${item.options.map((value,i)=>`<button type="button" class="yk82-choice ${disabled?(i===item.answer?'ok':i===chosen?'no':''):''}" data-action="answer" data-id="${fmt(id)}" data-choice="${i}" ${disabled?'disabled':''}>${String.fromCharCode(65+i)}. ${fmt(value)}</button>`).join('')}</div>${disabled?`<p class="yk82-feedback" role="status">${chosen===item.answer?'✓ မှန်ပါတယ်':'✕ မမှန်သေးပါ'} · ${fmt(item.explanation)}</p>`:''}</div>`}
 function itemHtml(item){const type=item.category||item.id.split('-')[1],head=`<div class="yk82-eyebrow">JLPT ${level} · ${fmt(names[type]||type)}</div>`;
  if(type==='vocabulary')return `<article class="yk82-lesson">${head}<h3 lang="ja">${fmt(item.word)}</h3><div class="yk82-read" lang="ja">${fmt(item.reading)}</div><p class="yk82-mm">${fmt(item.meaning)}</p><div class="yk82-sentence"><div lang="ja">${fmt(item.example)}</div><div class="yk82-mm">${fmt(item.exampleMy)}</div></div>${commonActions(item)}</article>`;
  if(type==='grammar')return `<article class="yk82-lesson">${head}<h3 lang="ja">${fmt(item.title)}</h3><p class="yk82-mm">${fmt(item.meaning)}</p><div class="yk82-sentence" lang="ja">${fmt(item.example)}<div class="yk82-mm">${fmt(item.exampleMy)}</div></div><p class="yk82-note">💡 ${fmt(item.note)}</p>${commonActions(item)}</article>`;
  if(type==='kanji')return `<article class="yk82-lesson">${head}<h3 lang="ja" style="font-size:43px">${fmt(item.character)}</h3><div class="yk82-read" lang="ja">${fmt(item.reading)}</div><p class="yk82-mm">${fmt(item.meaning)}</p><div class="yk82-sentence">${item.words.map(w=>`<div>${fmt(w)}</div>`).join('')}</div>${commonActions(item)}</article>`;
  if(type==='reading'){
    const spec=readingUpgrade?.levels?.[level]?.techniques?.find(x=>x.id===item.readingType);
    const tag=spec?`<div class="yk822-reading-meta"><span>${fmt(spec.label)} · ${fmt(spec.mm)}</span><span>オリジナル · 約${[...item.passage.replace(/\s/g,'')].length}字 · 1問</span></div><p class="yk822-teacher-tip">💡 ${fmt(spec.description)}</p>`:`<div class="yk822-reading-meta"><span>Original Reading Practice · STUDYING WITH YE KUN</span></div>`;
    return `<article class="yk82-lesson full" data-reading-type="${fmt(item.readingType||'classic')}">${head}<h3>${fmt(item.title)}</h3>${tag}<blockquote lang="ja">${fmt(item.passage)}</blockquote>${quiz(item)}${commonActions(item)}</article>`;
   }
  if(type==='listening')return `<article class="yk82-lesson full">${head}<h3>${fmt(item.title)}</h3><p class="yk82-sub">🎧 Japanese TTS နားထောင်ပြီး အဖြေရွေးပါ။</p><div class="yk82-actions"><button class="yk82-action primary" data-action="speak" data-id="${fmt(item.id)}" type="button">▶ Listen (日本語)</button><button class="yk82-action" data-action="transcript" data-id="${fmt(item.id)}" type="button">Show Transcript</button></div><p class="yk82-playing" id="yk82AudioStatus-${fmt(item.id)}" aria-live="polite"></p><blockquote lang="ja" id="yk82Transcript-${fmt(item.id)}" hidden>${fmt(item.script)}</blockquote>${quiz(item)}${commonActions(item)}</article>`;
  return '';
 }
 function renderReadingTools(){
   const el=$('yk822ReadingTools');if(!el)return;el.hidden=tab!=='reading';if(el.hidden)return;
   const specs=readingUpgrade?.levels?.[level]?.techniques||[];
   const start=`<div class="yk822-section-title"><div><span class="yk82-eyebrow">READING STUDIO · STUDYING WITH YE KUN</span><h3>読解のコツ · Reading Technique</h3><p class="yk82-sub">JLPT ${level} · အမျိုးအစားရွေးပြီး စာပိုဒ်ဖတ်၊ မေးခွန်းဖြေ၊ မြန်မာအဖြေရှင်းလင်းချက်ကို ကြည့်ပါ။</p></div><img src="/assets/characters/teacher-v7821.webp" loading="lazy" width="251" height="319" alt="Teacher character showing reading tips"></div>`;
   const official=`<div class="yk822-official-row"><span>📘 <strong>Old Question Reading</strong><small>Official JLPT sample questions · JLPT の公式問題例</small></span><a href="https://www.jlpt.jp/samples/sampleindex.html" target="_blank" rel="noopener noreferrer" aria-label="Open official JLPT sample question webpage">Official Samples ↗</a></div><p class="yk822-copyright-note">公式問題は転載していません。· မူရင်း JLPT မေးခွန်းဟောင်းတွေကို မကူးယူထားပါ။ Official Site မှာ သွားကြည့်နိုင်ပါတယ်။</p>`;
   const controls=`<div class="yk822-filter-tools"><button type="button" data-reading-filter="all" aria-pressed="${readingFilter==='all'}">All · အားလုံး</button><button type="button" data-reading-filter="classic" aria-pressed="${readingFilter==='classic'}">Existing Lessons</button></div>`;
   const types=specs.map(x=>{const count=(entries().reading||[]).filter(r=>r.readingType===x.id).length;return `<button type="button" class="yk822-method" data-reading-filter="${fmt(x.id)}" aria-pressed="${readingFilter===x.id}"><span class="yk822-method-icon">読</span><span><strong lang="ja">${fmt(x.label)} · ${fmt(x.mm)}</strong><small>${fmt(x.description)}</small><em>${fmt(x.tip)} · ${count} original practice${count===1?'':'s'}</em></span><span aria-hidden="true">›</span></button>`}).join('');
   el.innerHTML=start+official+(specs.length?controls+`<div class="yk822-method-grid">${types}</div><p class="yk822-copyright-note">練習問題はSTUDYING WITH YE KUN のオリジナルです。掲載文章は公式試験と同じ文字数・設問数を保証しません。</p>`:'<p class="yk82-sub">Reading Technique の追加データが読み込めませんでした。既存レッスンは引き続き使えます。</p>');
  }
 function drawLessons(){const selected=entries()[tab]||[],savedIds=S.bookmarks(S.snapshot());let items=selected.map(x=>({...x,category:tab}));if(tab==='reading'&&readingFilter!=='all')items=items.filter(x=>(x.readingType||'classic')===readingFilter);if(tab==='saved')items=allItems().filter(x=>savedIds.includes(x.id));
  $('yk82Content').innerHTML=items.length?`<p class="yk82-sub">${fmt(names[tab]||'⭐ Bookmarks')} · ${items.length} items · STUDYING WITH YE KUN original materials</p><div class="yk82-list">${items.map(itemHtml).join('')}</div>`:`<div class="yk82-empty">ဒီ Level မှာ Bookmark မရှိသေးပါ။ ☆ Bookmark ခလုတ်နဲ့ သိမ်းနိုင်ပါတယ်။</div>`;
 }
 const hash=t=>[...t].reduce((a,c)=>(Math.imul(a,31)+c.charCodeAt(0))>>>0,7);
 function questionPool(){const selected=entries(),p=[];
  for(const v of selected.vocabulary){const others=selected.vocabulary.filter(x=>x.id!==v.id).map(x=>x.meaning);p.push({id:v.id,question:`「${v.word}（${v.reading}）」 ရဲ့ မြန်မာအဓိပ္ပာယ်ကို ရွေးပါ။`,right:v.meaning,others,explanation:v.example+' = '+v.exampleMy})}
  for(const g of selected.grammar){const others=selected.grammar.filter(x=>x.id!==g.id).map(x=>x.meaning);p.push({id:g.id,question:`「${g.title}」 ရဲ့ သဒ္ဒါအဓိပ္ပာယ်ကို ရွေးပါ။`,right:g.meaning,others,explanation:g.example+' = '+g.exampleMy})}
  for(const k of selected.kanji){const others=selected.kanji.filter(x=>x.id!==k.id).map(x=>x.meaning);p.push({id:k.id,question:`漢字「${k.character}」 ရဲ့ အဓိပ္ပာယ်က ဘာလဲ။`,right:k.meaning,others,explanation:k.words.join(' ／ ')})}
  for(const cat of ['reading','listening'])for(const q of selected[cat])p.push({id:q.id,question:q.question,right:q.options[q.answer],others:q.options.filter((_,i)=>i!==q.answer),explanation:q.explanation,passage:cat==='reading'?q.passage:null,script:cat==='listening'?q.script:null});
  return p;
 }
 function buildDaily(count){const pool=questionPool(),day=dateLocal();let chosen=pool.sort((a,b)=>hash(day+level+a.id)-hash(day+level+b.id)).slice(0,count).map(q=>{
   const choices=[q.right,...q.others].filter((v,i,all)=>all.indexOf(v)===i).slice(0,4);
   const sorted=choices.sort((a,b)=>hash(day+q.id+a)-hash(day+q.id+b));return {...q,options:sorted,answer:sorted.indexOf(q.right)};
  });return {level,day,count,chosen,answers:{},done:false};
 }
 function drawDaily(){const recent=S.snapshot().dailyRuns.filter(x=>x.level===level).sort((a,b)=>b.finishedAt-a.finishedAt).slice(0,4);
  let html=`<h3>Daily Practice · JLPT ${level}</h3><p class="yk82-sub">ဒီနေ့ Level အလိုက် Vocabulary / Grammar / Kanji / Reading / Listening မေးခွန်းတွေကို လေ့ကျင့်ပါ။ Paid Exam Attempt မဟုတ်ပါ။</p><div class="yk82-daily-controls">${[5,10,20].map(n=>`<button type="button" class="yk82-action primary" data-action="daily-start" data-count="${n}">${n} Questions</button>`).join('')}</div>`;
  if(session&&session.level===level){const a=Object.keys(session.answers).length;html+=`<div class="yk82-daily-summary">${session.day} · ${a} / ${session.count} answered ${session.done?'· COMPLETE':''}</div><div class="yk82-list">`;
   for(const q of session.chosen){const selected=session.answers[q.id],answered=selected!==undefined;
    html+=`<div class="yk82-dailypick"><h3>${fmt(q.question)}</h3>${q.passage?`<p lang="ja">${fmt(q.passage)}</p>`:''}${q.script?`<div class="yk82-actions"><button class="yk82-action" type="button" data-action="daily-speak" data-id="${fmt(q.id)}">▶ Listen</button><button class="yk82-action" type="button" data-action="daily-transcript" data-id="${fmt(q.id)}">Show Transcript</button></div><div class="yk82-playing" id="yk82AudioStatus-${fmt(q.id)}"></div><blockquote lang="ja" hidden id="yk82Transcript-${fmt(q.id)}">${fmt(q.script)}</blockquote>`:''}<div class="yk82-choices">${q.options.map((ans,i)=>`<button type="button" class="yk82-choice ${answered?(i===q.answer?'ok':i===selected?'no':''):''}" data-action="daily-answer" data-id="${fmt(q.id)}" data-choice="${i}" ${answered?'disabled':''}>${String.fromCharCode(65+i)}. ${fmt(ans)}</button>`).join('')}</div>${answered?`<p class="yk82-feedback">${selected===q.answer?'✓ မှန်ပါတယ်':'✕ မမှန်ပါ'} · ${fmt(q.explanation)}</p>`:''}</div>`;
   }html+='</div>';
   if(session.done){const correct=session.chosen.filter(q=>session.answers[q.id]===q.answer).length;html+=`<div class="yk82-daily-summary" role="status"><b>${correct} / ${session.count} correct</b> · Daily Practice ပြီးဆုံးပါပြီ။ (Official JLPT Score မဟုတ်ပါ)</div>`}
  }
  html+=`<div class="yk82-daily-summary"><b>Recent Practice</b>${recent.length?recent.map(x=>`<p>${fmt(x.day)} · ${x.count} questions · ${x.correct} correct</p>`).join(''):'<p>မေးခွန်း မဖြေရသေးပါ။</p>'}</div>`;
  $('yk82Content').innerHTML=html;
 }
 function render(){if(!data)return;
  $('yk82Title').textContent=`JLPT ${level} — ${tab==='daily'?'Daily Practice':tab==='saved'?'Bookmarks':names[tab]}`;
  document.querySelectorAll('#yk82Levels [data-level]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.level===level)));
  document.querySelectorAll('#yk82Tabs [data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
  renderStats();renderReadingTools();const dl=$('yk82DictionaryAllLink');if(dl)dl.href=`/?jlpt_vocab=${level}#driving-dictionary`;if(tab==='daily')drawDaily();else drawLessons();updateUrl();
 }
 const getAudio=(id)=>{const t=mapById().get(id);if(t?.script)return t.script;if(session){return session.chosen.find(x=>x.id===id)?.script||''}return ''};
 function speech(id){const text=getAudio(id),status=$('yk82AudioStatus-'+id);if(!text)return;
  if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){if(status)status.textContent='ဒီ Device မှာ Japanese TTS မရပါ။ Show Transcript ကိုသုံးနိုင်ပါတယ်။';return}
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=level==='N5'?.83:level==='N4'?.87:.93;const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>v.lang.toLowerCase().startsWith('ja'))||null;u.onstart=()=>{if(status)status.textContent='▶ Japanese TTS playing…'};u.onend=()=>{if(status)status.textContent='✓ Audio finished'};u.onerror=()=>{if(status)status.textContent='အသံမရပါ။ Show Transcript ကိုနှိပ်ပါ။'};speechSynthesis.speak(u)}catch{if(status)status.textContent='Japanese TTS မရပါ။'}
 }
 function setTab(next){if(![...sections,'saved','daily'].includes(next))return;tab=next;if(next!=='daily')session=null;feedback={};render()}
 function setLevel(next){if(!S.LEVELS.includes(next))return;level=next;readingFilter='all';session=null;feedback={};S.setLevel(next);render()}
 $('yk82Levels').addEventListener('click',event=>{const el=event.target.closest('[data-level]');if(el)setLevel(el.dataset.level)});
 $('yk82Tabs').addEventListener('click',event=>{const el=event.target.closest('[data-tab]');if(el)setTab(el.dataset.tab)});
 $('yk822ReadingTools')?.addEventListener('click',event=>{const b=event.target.closest('button[data-reading-filter]');if(!b||tab!=='reading')return;readingFilter=b.dataset.readingFilter;renderReadingTools();drawLessons()});
 $('yk82DailyShortcut').onclick=()=>setTab('daily');$('yk82SavedShortcut').onclick=()=>setTab('saved');
 $('yk82Content').addEventListener('click',event=>{
  const b=event.target.closest('button[data-action]');if(!b)return;const action=b.dataset.action,id=b.dataset.id;
  if(action==='bookmark'){S.toggleSaved(id);drawLessons();return}
  if(action==='complete'){S.markDone(id);drawLessons();return}
  if(action==='answer'){
   if(feedback[id]!==undefined)return;
   feedback[id]=Number(b.dataset.choice);render();return;
  }
  if(action==='transcript'||action==='daily-transcript'){const node=$('yk82Transcript-'+id);if(node){node.hidden=!node.hidden;b.textContent=node.hidden?'Show Transcript':'Hide Transcript'}return}
  if(action==='speak'||action==='daily-speak'){speech(id);return}
  if(action==='daily-start'){session=buildDaily(Number(b.dataset.count));drawDaily();return}
  if(action==='daily-answer'){
   if(!session||session.done||session.answers[id]!==undefined)return;
   const choice=Number(b.dataset.choice);session.answers[id]=choice;
   if(Object.keys(session.answers).length===session.chosen.length){session.done=true;const correct=session.chosen.filter(q=>session.answers[q.id]===q.answer).length;S.addDaily({day:session.day,level,count:session.count,correct,finishedAt:Date.now()})}
   drawDaily();renderStats();return;
  }
 });
 S.subscribe(()=>{if(data)renderStats()});
 async function start(){try{
   const response=await fetch('/assets/jlpt-learning-v782-content.json',{cache:'default'});if(!response.ok)throw Error('HTTP '+response.status);data=await response.json();
   try{const ext=await fetch('/assets/jlpt-reading-v7822-upgrade.json',{cache:'default'});if(!ext.ok)throw Error('HTTP '+ext.status);readingUpgrade=await ext.json();
    for(const lv of S.LEVELS){const extra=readingUpgrade?.levels?.[lv]?.exercises;if(Array.isArray(extra))data.levels[lv].reading.push(...extra)}
   }catch(error){readingUpgrade=null;console.warn('Reading supplement unavailable; retaining base lessons',error)}
   await S.init();level=selectedLevel||S.snapshot().lastLevel;tab=selectedSection||'vocabulary';render();
   window.addEventListener('yk-identity-ready',()=>void S.init());
   setTimeout(()=>{if(window.YKIdentity)void S.init()},1600);
  }catch(err){$('yk82Content').innerHTML='<div class="yk82-empty">Lesson data မဖွင့်နိုင်ပါ။ Internet Connection ကို စစ်ပြီး Reload လုပ်ပါ။ ('+fmt(err?.message)+')</div>'}
 }
 start();
})();
