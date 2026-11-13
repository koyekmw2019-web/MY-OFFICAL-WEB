/* v7.87.10 — Original trilingual JLPT grammar library, all 509 entries authored.
 * Each entry has 2 original Japanese examples with Myanmar and English translations.
 * Independent original content; not a certified official JLPT syllabus.
 * This is a separate page and DOES NOT modify exam scoring/access or old state.
 */
(()=>{'use strict';
 if(!document.getElementById('yk879App'))return;
 const LV=['N5','N4','N3','N2','N1'];
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // Curated word readings, not a claim of official level placement.
 // Grade is the approximate level of the word for this user-facing reading aid:
 // 0=N5 ... 4=N1. Values are intentionally conservative.
 const R={
 '日本語':['にほんご',0],'毎日':['まいにち',0],'今日':['きょう',0],'明日':['あした',0],'昨日':['きのう',0],
 '学校':['がっこう',0],'先生':['せんせい',0],'学生':['がくせい',0],'友達':['ともだち',0],
 '家族':['かぞく',0],'仕事':['しごと',0],'本':['ほん',0],'音楽':['おんがく',0],
 '雨':['あめ',0],'朝':['あさ',0],'昼':['ひる',0],'夜':['よる',0],
 '日本':['にほん',0],'旅行':['りょこう',1],'食事':['しょくじ',1],'散歩':['さんぽ',1],
 '写真':['しゃしん',0],'試験':['しけん',1],'電話':['でんわ',0],'新しい':['あたらしい',0],
 '食べ':['たべ',0],'飲み':['のみ',0],'見':['み',0],'行':['い',0],'来':['き',0],
 '読':['よ',0],'聞':['き',0],'買':['か',0],'作':['つく',0],
 '毎朝':['まいあさ',1],'運動':['うんどう',1],'経験':['けいけん',2],
 '理由':['りゆう',2],'方法':['ほうほう',2],'参加':['さんか',2],'準備':['じゅんび',1],
 '勉強':['べんきょう',0],'宿題':['しゅくだい',0],'教室':['きょうしつ',0],
 '始':['はじ',1],'終':['お',1],'休':['やす',0],
 '財布':['さいふ',2],'食':['た',0],'朝ご飯':['あさごはん',0],
 '一緒':['いっしょ',0],'気温':['きおん',2],'約束':['やくそく',2],
 '説明':['せつめい',2],'景色':['けしき',2],'人口':['じんこう',2],
 '増加':['ぞうか',2],'交通量':['こうつうりょう',3],'技術':['ぎじゅつ',2],
 '需要':['じゅよう',3],'市場':['しじょう',3],'拡大':['かくだい',3],
 '研究':['けんきゅう',2],'調査':['ちょうさ',2],'発表':['はっぴょう',1],
 '留学生活':['りゅうがくせいかつ',3],'理解':['りかい',2],
 '故郷':['ふるさと',2],'感謝':['かんしゃ',2],'貴重':['きちょう',3],
 '重要':['じゅうよう',2],'大切':['たいせつ',1],'努力':['どりょく',2],
 '成功':['せいこう',2],'信頼':['しんらい',3],'関係':['かんけい',2],
 '計画':['けいかく',2],'中止':['ちゅうし',2],'予定':['よてい',1],
 '事故':['じこ',2],'道路':['どうろ',2],'閉鎖':['へいさ',3],
 '台風':['たいふう',2],'健康':['けんこう',2],'能力':['のうりょく',2],
 '企業':['きぎょう',3],'社員':['しゃいん',2],'建物':['たてもの',2],
 '郵便局':['ゆうびんきょく',1],'買い物':['かいもの',0],
 '黒':['くろ',0],'服':['ふく',0],'桜':['さくら',1],
 '大阪':['おおさか',0],'京都':['きょうと',0],'東京':['とうきょう',0],
 '全部':['ぜんぶ',1],'質問':['しつもん',1],'先':['さき',1],
 '長':['なが',0],'時間':['じかん',0],'一番':['いちばん',0],
 '若':['わか',1],'素晴':['すば',2],'閉':['し',1],
 '故':['こ',3],'郷':['きょう',3],'余儀':['よぎ',4],
 '皮切':['かわき',4], '発見':['はっけん',2],
 '会議':['かいぎ',2],'資料':['しりょう',2],
 '将来':['しょうらい',2], '全員':['ぜんいん',1], '多':['おお',0],
 '社会':['しゃかい',1], '結果':['けっか',1],'相手':['あいて',1]
 };
 const words=Object.keys(R).sort((a,b)=>b.length-a.length);
 const hasKanji=s=>/[\u3400-\u9fff]/.test(s);
 function rubyPart(s,level,mode){
  const idx=Math.max(0,LV.indexOf(level));let result='',i=0;
  while(i<s.length){let hit='';for(const w of words){if(s.startsWith(w,i)){hit=w;break}}
   if(!hit){result+=esc(s[i]);i++;continue}
   const [reading,grade]=R[hit];
   const show=mode==='all'||(mode==='auto'&&grade>=idx);
   result+=show&&hasKanji(hit)?`<ruby>${esc(hit)}<rt>${esc(reading)}</rt></ruby>`:esc(hit);
   i+=hit.length;
  }
  return result;
 }
 function decorate(s,target,level,mode){
  if(!target||!s.includes(target))return rubyPart(s,level,mode);
  // Highlight every instance of the actual grammar form, not the whole sentence.
  return s.split(target).map((piece,i)=>i===0?rubyPart(piece,level,mode):`<mark class="yk879-grammar-mark">${rubyPart(target,level,mode)}</mark>`+rubyPart(piece,level,mode)).join('');
 }
 function grammarUrl(level){return `/assets/yk-v7879-grammar-${level.toLowerCase()}.json?v=78710`}
 const query=new URLSearchParams(location.search);
 let level=LV.includes(query.get('level'))?query.get('level'):'N5';
 let filter='all',search='',furi='auto',selected=null,items=[],controller=0;
 const cache=new Map();
 const stateKey='yk_grammar_v7879_device';
 function readState(){try{const p=JSON.parse(localStorage.getItem(stateKey)||'{}');return p&&typeof p==='object'?p:{}}catch{return {}}}
 let saved=readState();
 const itemSaved=id=>!!saved[id]?.saved;
 const itemDone=id=>!!saved[id]?.done;
 function updateState(id,key){const info=items.find(x=>x.id===id);if(!info||info.status!=='draft')return;saved[id]={...saved[id],[key]:!saved[id]?.[key]};try{localStorage.setItem(stateKey,JSON.stringify(saved))}catch{};render()}
 function setUrl(){try{const u=new URL(location.href);u.searchParams.set('level',level);history.replaceState(null,'',u)}catch{}}
 async function load(next){level=next;selected=null;items=[];setUrl();const serial=++controller;
  $('yk879Grid').innerHTML='<div class="yk879-msg">Loading Grammar Library…</div>';
  $('yk879Detail').innerHTML='<div class="yk879-msg">Select a grammar pattern to see its lesson.</div>';
  try{if(cache.has(level))items=cache.get(level);else{const r=await fetch(grammarUrl(level),{cache:'force-cache'});if(!r.ok)throw Error('HTTP '+r.status);const data=await r.json();if(!Array.isArray(data.items)||data.level!==level)throw Error('Invalid grammar data');items=data.items;cache.set(level,items)}if(serial!==controller)return;
   const target=query.get('grammar');const first=items.find(x=>x.id===target&&x.status==='draft')||items.find(x=>x.status==='draft');selected=first?.id||null;render();
  }catch(e){if(serial===controller){$('yk879Grid').innerHTML='<div class="yk879-msg">Grammar data could not load. Please check connection and retry.</div>';
    $('yk879Detail').innerHTML='<button class="yk879-btn" id="yk879Retry">↻ Retry</button>';$('yk879Retry').addEventListener('click',()=>load(level))}}
 }
 function renderList(){
  const q=search.trim().toLocaleLowerCase();const visible=items.filter(x=>(filter==='all'||x.status===filter||filter==='saved'&&itemSaved(x.id))&&(!q||`${x.title} ${x.meaningJa||''} ${x.meaningMy||''} ${x.meaningEn||''}`.toLocaleLowerCase().includes(q)));
  const drafts=items.filter(x=>x.status==='draft').length;
  $('yk879Totals').textContent=`JLPT ${level} · ${items.length} patterns · ${drafts} original lessons`;
  $('yk879Grid').innerHTML=visible.length?visible.map(x=>`<button type="button" class="yk879-row${selected===x.id?' active':''}" data-id="${esc(x.id)}" aria-pressed="${selected===x.id}"><span class="yk879-row-num">${x.index}</span><span class="yk879-row-label" lang="ja">${esc(x.title)}</span><span class="yk879-row-status ${x.status==='draft'?'ready':'pending'}">${x.status==='draft'?'Lesson':'Review needed'}</span></button>`).join(''):'<div class="yk879-msg">No matching grammar items.</div>';
  $('yk879LevelBtns').querySelectorAll('[data-level]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.level===level)));
  $('yk879FilterBtns').querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
  $('yk879FuriBtns').querySelectorAll('[data-furi]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.furi===furi)));
 }
 function renderDetail(){
  const node=$('yk879Detail');let x=items.find(t=>t.id===selected);
  if(!x){node.innerHTML='<div class="yk879-msg">Choose a grammar pattern on the left.</div>';return}
  const top=`<div class="yk879-detail-top"><span class="yk879-level-tag">JLPT ${esc(level)}</span><span class="yk879-note">${x.status==='draft'?'Original trilingual lesson':'Review needed'}</span></div><h2 class="yk879-grammar-title" lang="ja">${esc(x.title)}</h2>`;
  if(x.status!=='draft'){node.innerHTML=top+`<div class="yk879-review"><strong>Content review needed · 内容確認中</strong><p>ဒီ Grammar ရဲ့ Japanese / Myanmar / English ရှင်းလင်းချက်နဲ့ 例文 တွေကို မစစ်ရသေးပါ။ မှားယွင်းတဲ့ သင်ခန်းစာ မတင်မိစေဖို့ ခေါင်းစဉ်ကိုပဲ ဖော်ပြထားပါတယ်။</p><p>The explanation and examples have not been verified yet. This entry is listed for coverage, not published as a complete lesson.</p></div>`;return}
  const ex=x.examples.map((e,i)=>`<article class="yk879-example"><div class="yk879-example-n">例文 ${String(i+1).padStart(2,'0')}</div><p class="yk879-example-ja" lang="ja">${decorate(e.ja,e.highlight,level,furi)}</p><div class="yk879-trans-my" lang="my">${esc(e.my)}</div><div class="yk879-trans-en" lang="en">${esc(e.en)}</div></article>`).join('');
  node.innerHTML=top+`<section class="yk879-meaning"><h3>意味 · Meaning · အဓိပ္ပာယ်</h3><div class="yk879-meaning-row"><small>日本語</small><p lang="ja">${esc(x.meaningJa)}</p></div><div class="yk879-meaning-row"><small>မြန်မာ</small><p lang="my">${esc(x.meaningMy)}</p></div><div class="yk879-meaning-row"><small>English</small><p lang="en">${esc(x.meaningEn)}</p></div></section><section class="yk879-connection"><h3>接続 · Formation · ဆက်စပ်ပုံ</h3><p lang="ja">${esc(x.formation)}</p></section><section class="yk879-examples"><h3>例文 · Examples</h3>${ex}</section><div class="yk879-actions"><button type="button" data-action="saved" data-id="${esc(x.id)}" class="yk879-btn">${itemSaved(x.id)?'★ Bookmarked':'☆ Bookmark'}</button><button type="button" data-action="done" data-id="${esc(x.id)}" class="yk879-btn primary">${itemDone(x.id)?'✓ Learned':'✓ Mark learned'}</button></div><p class="yk879-local-note">Grammar Library progress is saved on this browser only. Existing JLPT cloud progress and exam scores are not changed.</p>`;
 }
 function render(){renderList();renderDetail()}
 $('yk879LevelBtns').addEventListener('click',e=>{const b=e.target.closest('[data-level]');if(b&&LV.includes(b.dataset.level)&&b.dataset.level!==level){search='';$('yk879Search').value='';load(b.dataset.level)}});
 $('yk879FilterBtns').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b){filter=b.dataset.filter;render()}});
 $('yk879FuriBtns').addEventListener('click',e=>{const b=e.target.closest('[data-furi]');if(b){furi=b.dataset.furi;render()}});
 $('yk879Search').addEventListener('input',e=>{search=e.target.value;renderList()});
 $('yk879Grid').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b){selected=b.dataset.id;render();if(matchMedia('(max-width:760px)').matches)$('yk879Detail').scrollIntoView({block:'start',behavior:'smooth'})}});
 $('yk879Detail').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&['saved','done'].includes(b.dataset.action))updateState(b.dataset.id,b.dataset.action)});
 load(level);
})();
