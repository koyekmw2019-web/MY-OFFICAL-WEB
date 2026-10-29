/* YE KUN v7.56 — full-duration JLPT-style original mock.
   N1/N2: language+reading => listening.
   N3/N4/N5: vocabulary => grammar+reading => listening.
   Audio is browser Japanese speech synthesis, not an official recording.
   Scores are proportional estimates, NOT JLPT IRT scaled scores. */
(()=>{
'use strict';
const root=document.getElementById('examPanel');
const bank=window.YKNativeMockBankV752;
if(!root||!bank||!Array.isArray(bank.questions))return;
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const rand=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const names={vocabulary:'文字・語彙',grammar:'文法',reading:'読解',listening:'聴解'};
const plan={N1:[{id:'text',name:'言語知識（文字・語彙・文法）・読解',minutes:110,sections:['vocabulary','grammar','reading']},{id:'listening',name:'聴解',minutes:55,sections:['listening']}],N2:[{id:'text',name:'言語知識（文字・語彙・文法）・読解',minutes:105,sections:['vocabulary','grammar','reading']},{id:'listening',name:'聴解',minutes:50,sections:['listening']}],N3:[{id:'vocabulary',name:'言語知識（文字・語彙）',minutes:30,sections:['vocabulary']},{id:'grammar-reading',name:'言語知識（文法）・読解',minutes:70,sections:['grammar','reading']},{id:'listening',name:'聴解',minutes:40,sections:['listening']}],N4:[{id:'vocabulary',name:'言語知識（文字・語彙）',minutes:25,sections:['vocabulary']},{id:'grammar-reading',name:'言語知識（文法）・読解',minutes:55,sections:['grammar','reading']},{id:'listening',name:'聴解',minutes:35,sections:['listening']}],N5:[{id:'vocabulary',name:'言語知識（文字・語彙）',minutes:20,sections:['vocabulary']},{id:'grammar-reading',name:'言語知識（文法）・読解',minutes:40,sections:['grammar','reading']},{id:'listening',name:'聴解',minutes:30,sections:['listening']}]} ;
const state={session:null,timer:null,completed:false,callback:null};
// Preserve the five existing premium JLPT card designs. Update factual counts only,
// so older 20+5 / 25-question labels do not misrepresent the new exam contents.
function syncCardNumbers(){
 document.querySelectorAll('.jlpt-card-v745').forEach(card=>{
  const counters=card.querySelectorAll('.jlpt-card-metrics-v754 strong');
  if(counters.length>=3){counters[0].textContent='80';counters[1].textContent='20';counters[2].textContent='180'}
  const footer=card.querySelector('.jlpt-card-private-v754');
  if(footer)footer.textContent=footer.textContent.replace(/25\s+ORIGINAL\s+QUESTIONS/gi,'100 ORIGINAL QUESTIONS');
 });
}
syncCardNumbers();

const supported=()=>!!(window.speechSynthesis && window.SpeechSynthesisUtterance);
const clock=t=>`${String(Math.floor(Math.max(0,t)/60)).padStart(2,'0')}:${String(Math.max(0,t)%60).padStart(2,'0')}`;
const stopAudio=()=>{try{window.speechSynthesis?.cancel()}catch(_){}};
const stopTimer=()=>{if(state.timer!==null){clearInterval(state.timer);state.timer=null}};
const scroll=()=>root.scrollIntoView({behavior:'smooth',block:'start'});
const mount=html=>{root.classList.add('active');root.innerHTML=`<div class="yk-native-v750">${html}</div>`};
function prepare(q){const opts=rand(q.options.map((label,index)=>({label,isCorrect:index===q.answer})));return {...q,choices:opts,answerIndex:opts.findIndex(x=>x.isCorrect)}}
function sectionData(s){const p=s.plan[s.phase];return {phase:p,items:s.stages[s.phase],answers:s.responses[s.phase]}}
function fillStages(level){const originals=bank.questions.filter(q=>q.level===level);const groups={};for(const sec of Object.keys(names))groups[sec]=rand(originals.filter(q=>q.section===sec)).map(prepare);
 const expected={vocabulary:36,grammar:24,reading:20,listening:20};
 for(const key of Object.keys(expected))if(groups[key].length!==expected[key])throw Error('Question bank invalid: '+key);
 return plan[level].map(p=>p.sections.flatMap(k=>groups[k]));
}
function start(type,callback){
 if(!/^jlpt_n[1-5]$/.test(type))return;
 if(!supported()){alert('このブラウザーは日本語音声合成に対応していません。 / ဒီ Browser မှာ Japanese Voice မရနိုင်ပါ။');return}
 if(state.session&&!state.completed)return;
 const level=type.split('_')[1].toUpperCase();let stages;
 try{stages=fillStages(level)}catch(e){alert('試験問題の読み込みに失敗しました: '+e.message);return}
 const d=Date.now();
 state.completed=false;state.callback=typeof callback==='function'?callback:null;
 state.session={type,level,plan:plan[level],stages,responses:stages.map(a=>Array(a.length).fill(null)),phase:0,i:0,started:d,endAt:d+plan[level][0].minutes*60*1000,played:new Set(),audioDone:new Set(),audioFailed:new Set(),speaking:false,stageHistory:[]};
 stopTimer();render();scroll();
 state.timer=setInterval(()=>{
  const s=state.session;if(!s||state.completed){stopTimer();return}
  if(!root.querySelector('.yk-native-v750')){complete({score:0,pass:false});state.session=null;stopAudio();return}
  const left=Math.max(0,Math.ceil((s.endAt-Date.now())/1000));
  const timer=root.querySelector('[data-yk-native-timer]');if(timer){timer.textContent=clock(left);timer.classList.toggle('danger',left<=120)}
  if(left===0){if(s.phase===s.plan.length-1)submit(true);else advance(true)}
 },1000);
}
function header(s){
 const {phase,items,answers}=sectionData(s),done=answers.filter(x=>x!==null).length;
 const steps=s.plan.map((p,i)=>`<span class="${i<s.phase?'done':i===s.phase?'current':''}">${i+1} · ${esc(p.name)} ${p.minutes}分</span>`).join('');
 return `<div class="yk-native-bar"><div class="yk-native-title">🇯🇵 JLPT ${esc(s.level)} <span>YE KUN FULL-DURATION ORIGINAL MOCK · 非公式</span></div><div class="yk-native-time" role="timer">⏱ <span data-yk-native-timer>${clock(Math.ceil((s.endAt-Date.now())/1000))}</span></div></div><div class="yk-native-steps">${steps}<span>${s.plan.length+1} · 結果</span></div><div class="yk-native-meta"><span>${esc(phase.name)}</span><span>問題 ${s.i+1}/${items.length}</span><span>回答済み ${done}/${items.length}</span></div><div class="yk-native-progress"><span style="width:${100*done/items.length}%"></span></div>`;
}
function render(){const s=state.session;if(!s||state.completed)return;
 if(Date.now()>=s.endAt){if(s.phase===s.plan.length-1)submit(true);else advance(true);return}
 if(s.plan[s.phase].id==='listening')return renderAudio();
 const {phase,items,answers}=sectionData(s),q=items[s.i],index=s.i;
 const options=q.choices.map((c,n)=>`<button type="button" class="yk-native-opt ${answers[index]===n?'selected':''}" data-choice="${n}" aria-pressed="${answers[index]===n}"><b>${n+1}</b><span>${esc(c.label)}</span></button>`).join('');
 const passage=q.passage?`<div class="yk-native-passage"><b>読解文 / ဖတ်ရန်စာပိုဒ်</b><p>${esc(q.passage)}</p></div>`:'';
 const nav=items.map((v,n)=>`<button type="button" class="yk-native-num ${n===index?'current':''} ${answers[n]!==null?'done':''}" data-jump="${n}" aria-label="Question ${n+1}" ${n===index?'aria-current="step"':''}>${n+1}</button>`).join('');
 const next=s.phase===s.plan.length-2?'🎧 聴解へ進む / Listening':'次の試験科目へ →';
 mount(header(s)+`<div class="yk-native-content"><div class="yk-native-question"><div class="yk-native-section">${esc(names[q.section])}<small>Q${index+1} / ${items.length}</small></div>${passage}<h3>${esc(q.question)}</h3><div class="yk-native-options">${options}</div><div class="yk-native-actions"><button type="button" data-prev ${index===0?'disabled':''}>← 前へ</button><button type="button" class="primary" ${index===items.length-1?'data-advance':'data-next'}>${index===items.length-1?next:'次へ →'}</button></div></div><aside class="yk-native-side"><b>Question Navigator</b><div class="yk-native-number-grid">${nav}</div><div class="yk-native-legend"><span>● 回答済み</span><span>○ 未回答</span></div><button class="yk-native-submit" type="button" data-advance>${next}</button><button type="button" class="yk-native-close" data-quit>✕ 試験を終了</button><p>試験科目を進むと前の科目には戻れません。<br>အပိုင်းကူးပြီးရင် အရင်အပိုင်းကို ပြန်မဖြေနိုင်ပါ။</p></aside></div>`);
 root.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{answers[index]=Number(b.dataset.choice);render()}));
 root.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>{s.i=Number(b.dataset.jump);render()}));
 root.querySelector('[data-prev]')?.addEventListener('click',()=>{s.i=Math.max(0,s.i-1);render()});
 root.querySelector('[data-next]')?.addEventListener('click',()=>{s.i=Math.min(items.length-1,s.i+1);render()});
 root.querySelectorAll('[data-advance]').forEach(b=>b.addEventListener('click',()=>advance(false)));
 root.querySelector('[data-quit]')?.addEventListener('click',quit);
}
function advance(auto){const s=state.session;if(!s||state.completed||s.phase>=s.plan.length-1)return;
 const stage=sectionData(s),blank=stage.answers.filter(a=>a===null).length;
 if(!auto&&!confirm(`次の試験科目に進みますか？ 戻ることはできません。未回答 ${blank} 問。\nနောက်အပိုင်းကို သွားမှာလား။ ပြန်လာလို့မရပါ။ မဖြေရသေး ${blank} ခု။`))return;
 s.stageHistory.push({id:stage.phase.id,completed:Date.now(),timeout:auto});stopAudio();s.phase++;s.i=0;s.speaking=false;s.endAt=Date.now()+s.plan[s.phase].minutes*60*1000;render();scroll();
}
function renderAudio(){const s=state.session;if(!s||state.completed)return;
 const {items,answers}=sectionData(s),i=s.i,q=items[i];
 const played=s.played.has(i),done=s.audioDone.has(i);
 const opts=q.choices.map((o,n)=>`<button type="button" class="yk-native-opt ${answers[i]===n?'selected':''}" data-audio-choice="${n}" aria-pressed="${answers[i]===n}"><b>${n+1}</b><span>${esc(o.label)}</span></button>`).join('');
 mount(header(s)+`<div class="yk-native-content"><div class="yk-native-question"><div class="yk-native-section">🎧 ${esc(q.kind||'聴解')}<small>Listening ${i+1}/${items.length}</small></div><h3>音声を聞いて、最もよい答えを選んでください。<small style="display:block;font-size:13px;color:#bdbdbd">အသံနားထောင်ပြီး အဖြေမှန်ရွေးပါ။</small></h3><div class="yk-native-listening-controls"><button type="button" class="yk-native-audio-btn" data-audio-play ${played&&!s.audioFailed.has(i)?'disabled':''}>${s.speaking?'🔊 再生中…':played?'✓ 再生済み':'▶ 音声を聞く'}</button><div class="yk-native-audio-state" role="status">${s.speaking?'အသံဖတ်နေပါသည်…':done?'音声終了 · အဖြေရွေးပါ':s.audioFailed.has(i)?'音声エラー · ပြန်ဖွင့်ပါ':'音声は原則1回のみ · တစ်ကြိမ်သာ ဖွင့်ပါ'}</div></div><div class="yk-native-options">${opts}</div><div class="yk-native-actions"><span class="yk-native-tip">前の聴解問題へ戻れません。<br>Listening မေးခွန်းဟောင်းကို ပြန်မရပါ။</span>${i===items.length-1?`<button class="primary" type="button" data-final ${!done?'disabled':''}>提出 · အမှတ်တွက်ရန်</button>`:`<button class="primary" type="button" data-audio-next ${!done?'disabled':''}>次の聴解へ →</button>`}</div></div><aside class="yk-native-side"><b>🎧 聴解 — Final Section</b><div class="yk-native-listening-count">${i+1}<small> / ${items.length}</small></div><p>音声はブラウザー音声合成です。公式録音ではありません。<br>ဂျပန်အသံက Browser ဖတ်ပြတဲ့အသံဖြစ်ပြီး JLPT တရားဝင် Recording မဟုတ်ပါ။</p><p>音声スクリプトは提出後にのみ表示されます。<br>စာမေးပွဲဖြေပြီးမှ အသံစာသားကိုကြည့်နိုင်ပါတယ်။</p><button type="button" class="yk-native-close" data-quit>✕ 試験を終了</button></aside></div>`);
 root.querySelector('[data-audio-play]')?.addEventListener('click',playAudio);
 root.querySelectorAll('[data-audio-choice]').forEach(b=>b.addEventListener('click',()=>{answers[i]=Number(b.dataset.audioChoice);renderAudio()}));
 root.querySelector('[data-audio-next]')?.addEventListener('click',()=>{if(!s.audioDone.has(i)||s.speaking)return;s.i=Math.min(items.length-1,s.i+1);renderAudio()});
 root.querySelector('[data-final]')?.addEventListener('click',()=>{if(!s.audioDone.has(i)||s.speaking)return;submit(false)});
 root.querySelector('[data-quit]')?.addEventListener('click',quit);
}
function playAudio(){const s=state.session;if(!s||state.completed||s.plan[s.phase].id!=='listening'||s.speaking||s.audioDone.has(s.i)||!supported())return;
 const i=s.i,q=s.stages[s.phase][i];stopAudio();const u=new SpeechSynthesisUtterance(q.script);
 u.lang='ja-JP';u.rate=['N5','N4'].includes(s.level)?.85:s.level==='N3'?.91:.98;u.pitch=1;u.volume=1;
 try{const voices=window.speechSynthesis.getVoices(),ja=voices.find(v=>/^ja[-_]/i.test(v.lang)||v.lang==='ja');if(ja)u.voice=ja}catch(_){}
 s.speaking=true;s.audioFailed.delete(i);
 u.onstart=()=>{if(s.phase===s.plan.length-1&&s.i===i&&!state.completed){s.played.add(i);const btn=root.querySelector('[data-audio-play]');if(btn){btn.disabled=true;btn.textContent='🔊 再生中…'}}};
 u.onend=()=>{if(state.session!==s||state.completed||s.phase!==s.plan.length-1||s.i!==i)return;s.speaking=false;s.played.add(i);s.audioDone.add(i);renderAudio()};
 u.onerror=()=>{if(state.session!==s||state.completed||s.phase!==s.plan.length-1||s.i!==i)return;s.speaking=false;s.played.delete(i);s.audioFailed.add(i);renderAudio()};
 try{window.speechSynthesis.speak(u)}catch(_){s.speaking=false;s.audioFailed.add(i);renderAudio()}
}
function complete(result){if(state.completed)return;state.completed=true;stopTimer();stopAudio();const cb=state.callback;state.callback=null;if(cb){try{Promise.resolve(cb(result)).catch(()=>{})}catch(_){}}}
function quit(){const s=state.session;if(!s||state.completed)return;
 if(!confirm('終了するとこの受験回数は使用済みになります。\nအခုထွက်ရင် Exam အကြိမ်ရေသုံးပြီးသား ဖြစ်ပါမယ်။'))return;
 complete({score:0,pass:false});state.session=null;root.classList.remove('active');root.innerHTML='';
}
function submit(auto){const s=state.session;if(!s||state.completed||s.phase!==s.plan.length-1)return;
 const stage=sectionData(s);
 if(!auto){const blank=stage.answers.filter(x=>x===null).length;if(blank&&!confirm(`聴解に未回答が${blank}問あります。提出しますか？\nListening မဖြေရသေးတာ ${blank} ခု ရှိပါတယ်။`))return}
 const rows=[];let num=0;
 for(let p=0;p<s.stages.length;p++)for(let j=0;j<s.stages[p].length;j++){const q=s.stages[p][j],chosen=s.responses[p][j];rows.push({q,chosen,correct:chosen===q.answerIndex,number:++num})}
 const scoring=window.YKJLPTScoringV755;if(!scoring){alert('JLPT scoring module missing.');return}
 let mark;try{mark=scoring.calculate(s.level,rows)}catch(e){alert('採点エラー / အမှတ်တွက်ချက်မှု အမှား: '+e.message);return}
 const {correct,total,sections,pass,passMark,accuracy}=mark;complete({score:total,pass});
 const sectionMarkup=sections.map(g=>`<div class="yk-jlpt-score-row" data-yk-jlpt-section="${g.id}"><div class="yk-jlpt-score-row-head"><span>${esc(g.name)}</span><b>${g.score}<span style="color:#aaa"> / ${g.max}</span></b></div><div class="yk-jlpt-score-meter"><span style="width:${100*g.score/g.max}%"></span></div><div class="yk-jlpt-score-note ${g.met?'':'failed'}">${g.met?'✓ 練習基準点到達':'⚠ 練習基準点未達'} · 最低 ${g.min}/${g.max} · ${g.correct}/${g.total} 正解</div></div>`).join('');
 mount(`<div class="yk-native-results" data-yk-jlpt-score="${total}" data-yk-jlpt-pass="${pass}"><div class="yk-native-brow">🇯🇵 JLPT ${esc(s.level)} · YE KUN FULL-DURATION ORIGINAL MOCK</div><div class="yk-jlpt-180-total"><div class="yk-jlpt-180-heading">180点換算（練習用推定） · JLPT အမှတ်ပုံစံ ခန့်မှန်းချက်</div><strong>${total}<span> / 180</span></strong></div><div class="yk-jlpt-180-badge ${pass?'met':'notmet'}">${pass?'✓ 練習基準クリア · လေ့ကျင့်ရေးစံနှုန်းပြည့်':'⚠ 練習基準未達 · စံနှုန်းမပြည့်'}</div><div class="yk-jlpt-guidance"><strong>JLPT ${esc(s.level)} 区分別の基準</strong><div>総合基準：${passMark}/180 ${mark.totalMet?'✓':'✕'} · 得点区分の最低点 ${mark.sectionsMet?'✓':'✕'}</div><div>စုစုပေါင်းအမှတ်နဲ့ အပိုင်းလိုက်အနည်းဆုံးအမှတ် နှစ်ခုလုံး ပြည့်ဖို့လိုပါတယ်။</div></div><div class="yk-jlpt-score-list">${sectionMarkup}</div><p>正解数 ${correct}/${rows.length} · 正答率 ${accuracy}%<br>မေးခွန်း ${rows.length} ခုအနက် ${correct} ခုမှန်ပါတယ်။</p><div class="yk-jlpt-guidance"><strong>※ 公式JLPTの尺度得点・合否ではありません。</strong><div>科目時間はJLPT公表時間に合わせていますが、独自問題です。180点は区分ごとの正答率を比例換算した練習用推定点であり、公式IRT尺度得点や合否を再現しません。聴解はブラウザー合成音声です。</div><div>ဒီ 180 မှတ်က အပိုင်းအလိုက် ဖြေမှန်နှုန်းကနေ တွက်ထားတဲ့ ခန့်မှန်းအမှတ်ပါ။ တရားဝင် JLPT Scaled Score နဲ့ အောင်/မအောင် မဟုတ်ပါ။ Audio က Browser Voice ဖြစ်ပါတယ်။</div>${auto?'<div>時間切れで自動提出されました · အချိန်ပြည့်လို့ အလိုအလျောက်တင်ထားပါတယ်။</div>':''}</div><div class="yk-native-result-actions"><button type="button" class="primary" data-native-review>✕ 間違えた問題 / မှားတဲ့မေးခွန်း (${rows.length-correct})</button><button type="button" data-native-new>↻ 新しい受験 (Access Check)</button><button type="button" data-native-done>閉じる</button></div><div class="yk-native-review" data-native-review-box hidden></div></div>`);
 root.querySelector('[data-native-review]')?.addEventListener('click',()=>review(rows));
 root.querySelector('[data-native-new]')?.addEventListener('click',()=>document.querySelector(`[data-exam-v728="${s.type}"]`)?.click());
 root.querySelector('[data-native-done]')?.addEventListener('click',()=>{root.classList.remove('active');root.innerHTML='';state.session=null});scroll();
}
function review(rows){const host=root.querySelector('[data-native-review-box]');if(!host)return;host.hidden=false;
 const wrong=rows.filter(r=>!r.correct);
 host.innerHTML=wrong.length?wrong.map(r=>{const q=r.q;
 const passage=q.passage?`<div class="yk-native-review-passage">${esc(q.passage)}</div>`:'';
 const audio=q.section==='listening'?`<div class="yk-native-review-passage"><b>🎧 聴解スクリプト (解答後のみ)</b><p>${esc(q.script)}</p></div>`:'';
 const chosen=r.chosen===null?'未回答 / မဖြေထား':`${r.chosen+1}. ${esc(q.choices[r.chosen]?.label)}`;
 return `<article class="yk-native-review-item"><h4>Q${r.number} · ${esc(names[q.section])}</h4>${audio}${passage}${q.section==='listening'?'':`<p>${esc(q.question)}</p>`}<div class="yk-native-review-key"><span>あなたの答え: <b>${chosen}</b></span><span>正解: <b>${q.answerIndex+1}. ${esc(q.choices[q.answerIndex].label)}</b></span></div><div class="yk-native-explain"><div><b>🇯🇵 日本語解説</b><p>${esc(q.explanation_ja)}</p></div><div><b>🇲🇲 မြန်မာဘာသာ</b><p>${esc(q.explanation_my)}</p></div></div></article>`}).join(''):'<div class="yk-native-review-item">🎉 全問正解！ အားလုံးမှန်ပါတယ်။</div>';host.scrollIntoView({behavior:'smooth',block:'start'});
}
window.YKNativeJLPTV750={start,isRunning:()=>!!state.session&&!state.completed,audioSupported:supported,version:'v7.56-full-duration-original-jlpt-style',bankSize:bank.questions.length};
})();
