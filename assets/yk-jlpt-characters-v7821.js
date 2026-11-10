/* v7.82.1 – Character guide interactions. Overlay only; v7.82 lesson state and server logic stay authoritative. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),container=$('yk82Content');
 if(!container)return;
 const img='/assets/characters/';
 const guideTips={
  vocabulary:'新しい単語は例文と一緒に覚えましょう。 · ဝေါဟာရအသစ်ကို ဥပမာစာကြောင်းနဲ့ တွဲမှတ်ပါ။',
  grammar:'文法は短い例文で毎日使ってみましょう。 · သဒ္ဒါကို ဥပမာဝါကျတိုတိုနဲ့ နေ့စဉ်လေ့ကျင့်ပါ။',
  kanji:'漢字は読み方と意味を一緒に学びましょう。 · Kanji ကို အသံထွက်နဲ့ အဓိပ္ပာယ် တွဲမှတ်ပါ။',
  reading:'まず質問を読んでから文章を読みましょう。 · မေးခွန်းကို အရင်ဖတ်ပြီး စာပိုဒ်ကို ဖတ်ပါ။',
  listening:'もう一度聴いて、聞き取れた言葉を確認しましょう。 · အသံကို ထပ်နားထောင်ပြီး ကြားမိတဲ့စကားလုံးတွေကို စစ်ကြည့်ပါ။',
  saved:'大切なレッスンを何度も復習しましょう。 · သိမ်းထားတဲ့ သင်ခန်းစာတွေကို ပြန်လေ့လာကြမယ်။',
  daily:'少しずつ続けることが上達への近道です。 · နေ့တိုင်း နည်းနည်းစီ လေ့ကျင့်တာက အရေးကြီးပါတယ်။'
 };
 function show(kind,title,message){
  const root=$('yk821Reaction');if(!root)return;
  root.dataset.kind=kind;root.hidden=false;
  $('yk821ReactionTitle').textContent=title;
  $('yk821ReactionText').textContent=message;
  const media=$('yk821ReactionImage');if(media)media.src=img+(kind==='retry'?'teacher-v7821.webp':'student-v7821.webp');
 }
 function setTip(section){const target=$('yk821TeacherTip');if(target)target.textContent=guideTips[section]||guideTips.vocabulary}
 function goToSection(type){
  if(type==='daily')$('yk82DailyShortcut')?.click();
  if(type==='saved')$('yk82SavedShortcut')?.click();
  const heading=$('yk82Title');if(heading){try{heading.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}catch{heading.scrollIntoView()}}
 }
 $('yk821StartDaily')?.addEventListener('click',()=>{goToSection('daily');show('neutral','Daily Practice · 今日の練習','သင်ယူထားတာတွေကို မေးခွန်း 5 / 10 / 20 ခုနဲ့ လေ့ကျင့်နိုင်ပါတယ်။')});
 $('yk821ReactionDismiss')?.addEventListener('click',()=>{$('yk821Reaction').hidden=true});
 document.addEventListener('click',ev=>{
  const tab=ev.target.closest?.('#yk82Tabs button[data-tab]');if(tab){setTip(tab.dataset.tab);return}
  const level=ev.target.closest?.('#yk82Levels button[data-level]');if(level){show('neutral','JLPT '+level.dataset.level+' · レベル選択','ဒီ Level အတွက် Vocabulary၊ Grammar၊ Kanji၊ Reading၊ Listening ကို လေ့လာနိုင်ပါတယ်။');return}

 });
 container.addEventListener('click',ev=>{
  const action=ev.target.closest?.('button[data-action]');if(!action)return;
  const what=action.dataset.action,id=action.dataset.id||'',choice=Number(action.dataset.choice);
  setTimeout(()=>{
  if(what==='bookmark'){
    const saved=window.YKJLPTStateV782?.isSaved?.(id);
    show('neutral',saved?'⭐ Bookmark saved!':'Bookmark updated',saved?'ဒီသင်ခန်းစာကို Bookmark ထဲ သိမ်းပြီးပါပြီ။':'ဒီသင်ခန်းစာကို Bookmark မှာ မသိမ်းတော့ပါ။');
  }else if(what==='complete')show('done','Great progress! · よくできました！','သင်ခန်းစာကို လေ့လာပြီးကြောင်း မှတ်တမ်းတင်ထားပါတယ်။ ဆက်လေ့လာကြမယ်။');
  else if(what==='answer'||what==='daily-answer'){
    const correct=Array.from(container.querySelectorAll('.yk82-choice.ok')).some(b=>b.dataset.id===id&&Number(b.dataset.choice)===choice);
    const end=container.textContent.includes('Daily Practice ပြီးဆုံးပါပြီ');
    if(end)show('done','Daily Practice completed! 🎉','ဒီနေ့ လေ့ကျင့်ခန်းပြီးပါပြီ။ အဖြေရှင်းလင်းချက်တွေကို ပြန်ဖတ်ပါ။');
    else if(correct)show('correct','Correct! · 正解です！','အဖြေမှန်ပါတယ်။ ဒီအတိုင်း နောက်တစ်ခုပြီးတစ်ခု ဆက်လေ့ကျင့်ပါ။');
    else show('retry','Review this answer · 復習しましょう','အဖြေရှင်းလင်းချက်ကို ကြည့်ပြီး ပြန်မှတ်သားပါ။ နောက်မေးခွန်းမှာ ဆက်ကြိုးစားကြမယ်။');
  }else if(what==='daily-start')show('neutral','Practice started! · がんばろう！','ဖြေမယ့်မေးခွန်းတွေကို တစ်ခုချင်း ရွေးပြီး အဖြေရှင်းလင်းချက် ဖတ်ကြမယ်။');
  },0);
 },true);
 setTip(new URLSearchParams(location.search).get('section')||'vocabulary');
})();
