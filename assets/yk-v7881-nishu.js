/* v7.88.1 RC1: independent second-class driving exam.
 * 90 ordinary questions and 5 illustrated sets of 3 true/false judgements.
 * This browser NEVER computes a trusted score, accesses private keys, or extends a server timer.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const l10n={
 my:{correct:'မှန်',wrong:'မှား',text:'စာသားမေးခွန်း',visual:'ပုံမေးခွန်း',skipped:'မဖြေထားသော မေးခွန်း',notice:'မေးခွန်းတစ်ခုစီကို ○ သို့မဟုတ် × ရွေးပါ။',outOfTime:'အချိန်ပြည့်သွားပါပြီ။ အဖြေတင်နေပါတယ်…',completed:'အမှတ်စစ်ပြီးပါပြီ',passed:'အောင်မြင်ပါသည်',failed:'ထပ်လေ့ကျင့်ရန် လိုအပ်ပါသည်',scoreExplain:'ဤအမှတ်သည် လေ့ကျင့်ရေးရလဒ်ဖြစ်ပြီး တရားဝင်လိုင်စင်ရလဒ် မဟုတ်ပါ။',review:'မှားခဲ့သည့်မေးခွန်းများ',noReview:'အဖြေရှင်းလင်းချက် မရရှိသေးပါ။',loading:'စစ်ဆေးနေပါတယ်…',save:'ဖြေဆိုမှုကို သိမ်းနေပါသည်…',login:'စာမေးပွဲဖြေရန် Login ဝင်ပါ။',offline:'အင်တာနက်မရှိလျှင် Server ဖြေဆိုမှုသိမ်း/တင်မရနိုင်ပါ။',image:'ဤပုံသည် အသစ်ရေးဆွဲထားသော လေ့ကျင့်ရေးပုံဖြစ်ပြီး တကယ့်စာမေးပွဲပုံမဟုတ်ပါ။',submit:'အဖြေတင်ပြီး အမှတ်စစ်မှာ သေချာပါသလား။'},
 en:{correct:'True / ○',wrong:'False / ×',text:'Written question',visual:'Illustration question',skipped:'Unanswered',notice:'Select ○ or × for each statement.',outOfTime:'Time is up. Submitting saved answers…',completed:'Graded by server',passed:'Passed',failed:'More practice recommended',scoreExplain:'This is a practice result, not an official licensing result.',review:'Incorrect answers',noReview:'Review not available.',loading:'Checking…',save:'Saving answers…',login:'Log in before starting.',offline:'Internet is required to save and submit server-verified attempts.',image:'Original training schematic, not an actual examination illustration.',submit:'Submit this attempt for scoring?'},
 ja:{correct:'○ 正しい',wrong:'× 誤り',text:'文章問題',visual:'イラスト問題',skipped:'未解答',notice:'各設問の○・×を選択してください。',outOfTime:'時間が終了しました。保存・提出中…',completed:'サーバー採点が完了しました',passed:'合格ライン到達',failed:'復習が必要です',scoreExplain:'練習結果です。公式試験の結果ではありません。',review:'間違えた問題の復習',noReview:'解説を取得できませんでした。',loading:'確認中…',save:'解答を保存しています…',login:'受験前にログインしてください。',offline:'解答保存と正式な採点には通信が必要です。',image:'独自作成の模式図です。実際の試験問題の図ではありません。',submit:'この解答を提出して採点しますか？'}
};
let lang='my',showFurigana=false,bank=null,state=null,attemptId=null,endsAt=0,readonly=false,finished=false,submitting=false,intervalId=null,displayedOutcome=false;
const rubyLex={
 '普通第二種免許':'ふつうだいにしゅめんきょ','道路標識':'どうろひょうしき','道路標示':'どうろひょうじ','横断歩道':'おうだんほどう','交差点':'こうさてん','安全確認':'あんぜんかくにん','歩行者':'ほこうしゃ','乗客':'じょうきゃく','運転者':'うんてんしゃ','制限速度':'せいげんそくど','車間距離':'しゃかんきょり','追越し':'おいこし','一時停止':'いちじていし','信号機':'しんごうき','警察官':'けいさつかん','手信号':'てしんごう','緊急自動車':'きんきゅうじどうしゃ','方向指示器':'ほうこうしじき','進路変更':'しんろへんこう','停止距離':'ていしきょり','乗車定員':'じょうしゃていいん','二次事故':'にじじこ','交通事故':'こうつうじこ','旅客運送':'りょかくうんそう','旅客自動車':'りょかくじどうしゃ','旅客':'りょかく','運転免許':'うんてんめんきょ','自動車':'じどうしゃ','自転車':'じてんしゃ','高速道路':'こうそくどうろ','対向車':'たいこうしゃ','直進車':'ちょくしんしゃ','停止位置':'ていしいち','右左折':'うさせつ','急発進':'きゅうはっしん','急停止':'きゅうていし','急加速':'きゅうかそく','急減速':'きゅうげんそく','急制動':'きゅうせいどう','前方':'ぜんぽう','後方':'こうほう','前後左右':'ぜんごさゆう','左右':'さゆう','発進':'はっしん','道路':'どうろ','運転':'うんてん','確認':'かくにん','必要':'ひつよう','停止':'ていし','速度':'そくど','車両':'しゃりょう','踏切':'ふみきり','交差':'こうさ','信号':'しんごう','保護':'ほご','禁止':'きんし','危険':'きけん','急':'きゅう','乗降':'じょうこう','通行':'つうこう','安全':'あんぜん','注意':'ちゅうい','徐行':'じょこう','右折':'うせつ','左折':'させつ','車道':'しゃどう','歩道':'ほどう','後続車':'こうぞくしゃ','運賃':'うんちん','精算':'せいさん','定員':'ていいん','高齢者':'こうれいしゃ','障害':'しょうがい','衝突':'しょうとつ','雨天':'うてん','夜間':'やかん','悪天候':'あくてんこう','運行':'うんこう','停留所':'ていりゅうじょ','見通し':'みとおし','曲がる':'まがる','曲がり':'まがり','坂道':'さかみち','急な':'きゅうな','荷物':'にもつ','原則':'げんそく','警音器':'けいおんき','横風':'よこかぜ','災害':'さいがい','故障':'こしょう','負傷者':'ふしょうしゃ','応急':'おうきゅう','救護':'きゅうご','歩行':'ほこう','車内':'しゃない','燃料':'ねんりょう','運転席':'うんてんせき','乗車':'じょうしゃ','降車':'こうしゃ'
};
const rubyPattern=new RegExp(Object.keys(rubyLex).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
const t=k=>l10n[lang]?.[k]||l10n.my[k]||k;
const text=(id,value)=>{$(id).textContent=value};
const show=(id,visible)=>$(id).classList.toggle('nishu-hidden',!visible);
function msg(v,isError=false,where='nishu-status'){const n=$(where);n.textContent=v;n.setAttribute('role',isError?'alert':'status')}
function localize(){document.documentElement.lang=lang;document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
 document.querySelectorAll('[data-my][data-en][data-ja]').forEach(el=>el.textContent=el.dataset[lang]||el.dataset.my);
 if(state&&!finished)render();}
function jpInto(node,str){node.replaceChildren();if(!showFurigana){node.textContent=str;return;}
 let pos=0;for(const m of str.matchAll(rubyPattern)){if(m.index>pos)node.append(document.createTextNode(str.slice(pos,m.index)));
 const ruby=document.createElement('ruby'),rt=document.createElement('rt');ruby.append(document.createTextNode(m[0]));rt.textContent=rubyLex[m[0]];ruby.append(rt);node.append(ruby);pos=m.index+m[0].length;}
 if(pos<str.length)node.append(document.createTextNode(str.slice(pos)));
}
function node(tag,cls,content){const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;}
function shuffle(values){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function makeSnapshot(){return {version:1,engine:'nishu',type:'nishu',phase:0,index:0,refs:[...shuffle(bank.text.map(q=>q.id)),...shuffle(bank.visual.map(q=>q.id))],answers:[...Array(90).fill(null),...Array.from({length:5},()=>[null,null,null])]}}
function currentQuestion(){const id=state.refs[state.index];return state.index<90?bank.text.find(q=>q.id===id):bank.visual.find(q=>q.id===id)}
function choice(answer,selected,cb){const b=node('button','nishu-choice',answer?t('correct'):t('wrong'));b.type='button';b.setAttribute('aria-pressed',String(selected===answer));b.disabled=readonly||finished;b.addEventListener('click',()=>{cb(answer);window.YKExamAutoSaveV761?.save(state,0);render();});return b}
function render(){if(!state||!bank)return;const i=state.index,q=currentQuestion();text('nishu-position',`${i+1} / 95 · ${i<90?t('text'):t('visual')}`);$('nishu-progress').style.width=`${(i+1)/95*100}%`;text('nishu-furigana','ふりがな '+(showFurigana?'ON':'OFF'));
 const host=$('nishu-question');host.replaceChildren();if(!q){msg('Question missing / 問題データがありません',true);return;}
 if(i>=90){const lead=node('h2','nishu-question');jpInto(lead,q.jp);host.append(lead);
 const trans=node('p','nishu-translation',q.my);host.append(trans);const im=node('img','nishu-image');im.src=q.image;im.alt=q.jp;im.width=960;im.height=520;im.loading='eager';host.append(im);host.append(node('p','nishu-image-note',t('image')));
 q.questions.forEach((item,j)=>{const part=node('div','nishu-visual-item');part.append(node('span','nishu-badge',`${i+1} – ${j+1}`));const title=node('h3','');jpInto(title,item.jp);part.append(title);if(lang==='my')part.append(node('p','nishu-translation',item.my));
 const choices=node('div','nishu-answer');choices.append(choice(true,state.answers[i][j],v=>state.answers[i][j]=v),choice(false,state.answers[i][j],v=>state.answers[i][j]=v));part.append(choices);host.append(part)});
 } else {const lead=node('h2','nishu-question');jpInto(lead,q.jp);host.append(lead);if(lang==='my')host.append(node('p','nishu-translation',q.my));const choices=node('div','nishu-answer');choices.append(choice(true,state.answers[i],v=>state.answers[i]=v),choice(false,state.answers[i],v=>state.answers[i]=v));host.append(choices);}
 $('nishu-back').disabled=i===0||readonly;show('nishu-next',i<94);show('nishu-submit',i===94);$('nishu-next').disabled=readonly;
 window.YKExamAutoSaveV761?.afterRender();}
function tick(){if(!endsAt||finished)return;const ms=endsAt-Date.now(),seconds=Math.max(0,Math.ceil(ms/1000));text('nishu-timer',`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`);$('nishu-timer').classList.toggle('warning',seconds<=300);
 if(ms<=0&&!submitting){msg(t('outOfTime'));void submit(true)}}
async function api(path,options={}){const response=await fetch('/.netlify/functions/'+path,{credentials:'same-origin',cache:'no-store',...options});const body=await response.json().catch(()=>({}));if(!response.ok){const err=Error(body.error||`HTTP ${response.status}`);err.code=response.status;err.data=body;throw err;}return body;}
async function start(){const button=$('nishu-start');button.disabled=true;msg(t('loading'),false,'nishu-intro-status');try{
 if(!navigator.onLine)throw Error(t('offline'));
 const bankRes=await fetch('/assets/yk-v7881-nishu-questions.json?ykv=7881',{cache:'no-store'});if(!bankRes.ok)throw Error('Question bank unavailable');bank=await bankRes.json();
 if(bank.text?.length!==90||bank.visual?.length!==5)throw Error('Incomplete exam data');
 const status=await api('exam-status');const email=status.email||'anonymous';
 const access=await api('exam-access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({examType:'nishu'})});
 if(!access.allowed)throw Error(access.reason||'Exam access unavailable');attemptId=Number(access.attemptId);
 if(!window.YKExamAutoSaveV761)throw Error('Autosave component unavailable');
 const ctx=await window.YKExamAutoSaveV761.activate(email,attemptId,'nishu');
 readonly=Boolean(ctx.readOnly);endsAt=new Date(ctx.endsAt).getTime();state=ctx.snapshot||makeSnapshot();
 if(state.type!=='nishu'||state.refs?.length!==95||state.answers?.length!==95)throw Error('Saved exam snapshot is invalid');
 if(!ctx.snapshot&&!readonly){window.YKExamAutoSaveV761.save(state,0);if(!await window.YKExamAutoSaveV761.flush())throw Error('Could not initialize saved exam');}
 window.YKExamAutoSaveV761.onConflict(conf=>{msg(conf.error||'Another tab updated the saved exam.',true);readonly=true;render()});
 show('nishu-intro',false);show('examPanel',true);$('examPanel').classList.add('active');render();tick();intervalId=setInterval(tick,1000);
 if(readonly)msg('Another tab owns this exam; read only. / အခြား Tab မှာ Exam ဖွင့်ထားပါတယ်။',true);
 }catch(e){if(e.code===401){location.href='/login.html?return=%2Fexams%2Fnishu.html';return;}
 const m=e.code===402?'Free attempt already used. Choose a plan in Mock Exam Center. / အခမဲ့အကြိမ် အသုံးပြုပြီးပါပြီ။':e.code===409&&e.data?.resumeType?`Resume the unfinished ${e.data.resumeType} exam first. / အရင် Exam ကို ဆက်ဖြေပါ။`:e.message;
 msg(m,true,'nishu-intro-status');}finally{button.disabled=false}}
async function submit(auto=false){if(submitting||finished||!state||readonly)return;
 if(!auto&&!confirm(t('submit')))return;
 submitting=true;$('nishu-submit').disabled=true;$('nishu-next').disabled=true;
 try{if(!await window.YKExamAutoSaveV761.flush())throw Error('Could not sync saved answers. Check your connection.');
 const result=await api('exam-attempt-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({attemptId})});
 if(!result.scoreVerified)throw Error('Server did not verify score');finished=true;clearInterval(intervalId);
 window.YKExamAutoSaveV761.discardOnSubmit();show('examPanel',false);show('nishu-result',true);text('nishu-grade',`${result.score} / 100`);
 $('nishu-grade').className='nishu-grade '+(result.passed?'nishu-score-pass':'nishu-score-fail');text('nishu-result-message',`${result.passed?t('passed'):t('failed')} · ${t('scoreExplain')}`);
 await review(result);
 }catch(e){msg(`${e.message} — ${t('offline')}`,true);$('nishu-submit').disabled=false;$('nishu-next').disabled=false;}finally{submitting=false}}
async function review(result){const host=$('nishu-review');host.replaceChildren(node('h2','',t('review')));try{
 const keys=await api(`exam-nishu-review?attemptId=${attemptId}`);let incorrect=0;
 state.refs.forEach((id,i)=>{const right=i<90?keys.text[id]?.a:keys.visual[id]?.a,ans=state.answers[i];
 const good=i<90?ans!==null&&ans===right:Array.isArray(ans)&&Array.isArray(right)&&ans.every((v,j)=>v!==null&&v===right[j]);
 if(good)return;incorrect++;const q=i<90?bank.text.find(x=>x.id===id):bank.visual.find(x=>x.id===id);if(!q)return;
 const details=node('details','nishu-review'),summary=node('summary','',`${i+1}. ${q.jp}`);details.append(summary);
 if(i<90){details.append(node('p','',`○/×: ${right?'○':'×'} · ${keys.text[id]?.reasonJa||''}`));}
 else{(q.questions||[]).forEach((sub,j)=>{details.append(node('p','',`${j+1}. ${sub.jp} → ${right?.[j]?'○':'×'} · ${keys.visual[id]?.reasonJa?.[j]||''}`))})}
 host.append(details);
 });
 if(!incorrect)host.append(node('p','nishu-score-pass','95問すべて正解しました。'));
 }catch(e){host.append(node('p','nishu-muted',t('noReview')));}}
async function history(){const block=$('nishu-history');block.classList.remove('nishu-hidden');block.replaceChildren(node('p','nishu-muted',t('loading')));
 try{const data=await api('exam-nishu-history');block.replaceChildren();
  if(!Array.isArray(data.results)||!data.results.length){block.append(node('p','nishu-muted',lang==='ja'?'まだ採点履歴はありません。':lang==='en'?'No scored attempts yet.':'ဖြေဆိုမှုမှတ်တမ်း မရှိသေးပါ။'));return;}
  const list=node('ul','nishu-history-list');for(const row of data.results){const li=node('li','');const d=new Date(row.submittedAt);const date=Number.isFinite(d.getTime())?d.toLocaleDateString(lang==='my'?'en-GB':lang):'—';
   const pass=row.passed?(lang==='ja'?'合格ライン':lang==='en'?'Pass':'အောင်မှတ်ရရှိ'):(lang==='ja'?'復習':lang==='en'?'Review':'ပြန်လေ့ကျင့်ရန်');
   li.textContent=`${date} · ${Number.isFinite(Number(row.score))?row.score:'—'} / 100 · ${pass}${row.verified?' ✓':''}`;list.append(li)}block.append(list);
 }catch(e){block.replaceChildren(node('p','nishu-muted',e.code===401?t('login'):e.message));}}
function init(){try{const saved=localStorage.getItem('yk_lang');if(l10n[saved])lang=saved;}catch{}
 document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{lang=b.dataset.lang;try{localStorage.setItem('yk_lang',lang)}catch{}localize()}));
 $('nishu-start').addEventListener('click',start);
 $('nishu-history-button').addEventListener('click',history);
 $('nishu-back').addEventListener('click',()=>{if(!state||state.index<=0)return;state.index--;window.YKExamAutoSaveV761.save(state,0);render()});
 $('nishu-next').addEventListener('click',()=>{if(!state||state.index>=94)return;state.index++;window.YKExamAutoSaveV761.save(state,0);render()});
 $('nishu-furigana').addEventListener('click',()=>{showFurigana=!showFurigana;render()});
 $('nishu-submit').addEventListener('click',()=>submit(false));
 window.addEventListener('online',()=>{if(state&&!finished)msg('Online / 接続が戻りました')});
 localize();}
init();
})();
