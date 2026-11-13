/** v7.87.16 — accessible standalone student study planner. Entirely local. */
import {GOALS_KEY,STORAGE_KEY,FOCUS,cleanGoals,updateGoals,scheduleDay,unscheduleDay,setManualDone,studyDays,monthGrid,weekProgress,streak,targetDays,dateFromKey,dateKey,offsetDay} from './yk-v78716-calendar-engine.js';
import {cleanState} from './yk-v78714-engine.js';
const app=document.getElementById('yk816App');
if(app){
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const T={
 my:{dashboard:'Student Dashboard',practice:'Grammar Practice',title:'My Learning Calendar · လေ့လာရေးပြက္ခဒိန်',intro:'လေ့လာမယ့်နေ့တွေ စီစဉ်ပြီး နေ့စဉ်/အပတ်စဉ် ရည်မှန်းချက်ကို မှတ်သားပါ။ ဒီ Browser ထဲမှာပဲ သိမ်းထားပါတယ်။',todayQuestions:'ဒီနေ့ ဖြေပြီးတဲ့ Grammar မေးခွန်း',weeklyProgress:'ဒီအပတ် လေ့လာခဲ့တဲ့နေ့',streak:'ဆက်တိုက်လေ့လာခဲ့သောနေ့*',targetCountdown:'ကိုယ်ပိုင်ရည်မှန်းနေ့အထိ',settings:'လေ့လာရေးရည်မှန်းချက်',dailyGoal:'တစ်နေ့ Grammar မေးခွန်းရည်မှန်းချက်',weeklyGoal:'တစ်ပတ်လေ့လာမယ့်နေ့',targetLevel:'ရည်မှန်းထားတဲ့ JLPT Level',targetDate:'ကိုယ်တိုင်သတ်မှတ်တဲ့နေ့ (မထည့်လည်းရ)',saveGoals:'ရည်မှန်းချက်သိမ်းရန်',goalNote:'နေ့စဉ် Grammar Goal ကို ပြီးဆုံးထားတဲ့ Grammar Practice Session တွေနဲ့သာ တွက်ပါတယ်။ အပတ်စဉ် Goal မှာ ကိုယ်တိုင်ပြီးစီးကြောင်း မှတ်ထားတဲ့နေ့တွေပါပါတယ်။ ရည်မှန်းနေ့ဟာ Official JLPT Exam Date မဟုတ်ပါ။',calendar:'လေ့လာရေး Calendar',monthHint:'နေ့ရွေးပြီး လေ့လာမယ့်အစီအစဉ်နဲ့ ကိုယ်တိုင်လေ့လာပြီးကြောင်း မှတ်နိုင်ပါတယ်။',planned:'စီစဉ်ထား',studied:'လေ့လာပြီး',grammarMet:'Grammar Goal ပြည့်',dayPlan:'ရွေးထားတဲ့နေ့အတွက် အစီအစဉ်',practiceNow:'Grammar Practice ဖွင့်ရန် ↗',focus:'လေ့လာမယ့်ဘာသာရပ်',planLevel:'ဒီနေ့အတွက် JLPT Level',note:'လေ့လာရေးမှတ်ချက် (မထည့်လည်းရ)',savePlan:'နေ့အတွက်အစီအစဉ်သိမ်းရန်',removePlan:'အစီအစဉ်ဖျက်ရန်',checkIn:'လေ့လာပြီးပြီ ✓ (ကိုယ်တိုင်မှတ်)',undoCheck:'ပြီးစီးမှု ပြန်ဖယ်ရန်',disclaimer:'* Study Streak မှာ Grammar Practice Session ပြီးဆုံးမှုနဲ့ ကိုယ်တိုင်မှတ်ထားတဲ့ လေ့လာရေးနေ့တွေ ပါပါတယ်။ Data က ဒီ Browser ထဲမှာပဲရှိပြီး ဖုန်း/Browser မျှသုံးသူတွေနဲ့ ရောနိုင်ပါတယ်။ YKCR၊ Payment၊ Exam Score နဲ့ Cloud Data ကို မထိပါ။ အလိုအလျောက် Reminder မပို့ပါ။',questionSuffix:'ခု',sessions:'Grammar Sessions',manual:'ကိုယ်တိုင်ပြီးစီးကြောင်း မှတ်ထားသည်',notManual:'ကိုယ်တိုင်ပြီးစီးမှု မမှတ်ရသေး',noPlan:'အစီအစဉ် မသိမ်းထားသေး',planSaved:'နေ့အတွက်အစီအစဉ် သိမ်းပြီးပါပြီ။',goalsSaved:'ရည်မှန်းချက် သိမ်းပြီးပါပြီ။',removed:'အစီအစဉ် ဖယ်ရှားပြီးပါပြီ။',marked:'လေ့လာပြီးကြောင်း မှတ်သားပြီးပါပြီ။',unmarked:'ကိုယ်တိုင်ပြီးစီးမှုကို ပြန်ဖယ်ပြီးပါပြီ။',saveError:'ဒီ Browser မှာ Data သိမ်းမရပါ။ Storage Setting ကို စစ်ပါ။',dateError:'မှန်ကန်တဲ့ရက်စွဲကို ရွေးပါ။',future:'နောက်လာမယ့်နေ့ကို ပြီးစီးတယ်လို့ မမှတ်နိုင်ပါ။',notPlanned:'ပြီးစီးကြောင်း မမှတ်ခင် အစီအစဉ် သိမ်းပါ။',targetPast:'ရည်မှန်းနေ့ ကျော်သွားပြီ',targetToday:'ဒီနေ့ရည်မှန်းနေ့',days:'ရက်',prev:'အရင်လ',next:'နောက်လ',today:'ဒီနေ့',focusGrammar:'Grammar',focusVocabulary:'Vocabulary',focusKanji:'Kanji',focusReading:'Reading',focusListening:'Listening',focusReview:'အမှားပြန်လေ့လာရန်'},
 en:{dashboard:'Student Dashboard',practice:'Grammar Practice',title:'My Learning Calendar',intro:'Plan study days, set personal goals and see what you have actually completed in this browser.',todayQuestions:'Grammar questions completed today',weeklyProgress:'Study days this week',streak:'Consecutive study days*',targetCountdown:'Days to personal target',settings:'Your Study Goals',dailyGoal:'Daily grammar-question target',weeklyGoal:'Weekly study days target',targetLevel:'Personal JLPT goal level',targetDate:'Personal target date (optional)',saveGoals:'Save Study Goals',goalNote:'Daily grammar goals count only completed Grammar Practice sessions. Weekly study days include your self-reported check-ins. Your target date is NOT an official JLPT exam date.',calendar:'Study Calendar',monthHint:'Choose a date to plan a lesson or mark a self-reported study day.',planned:'Planned',studied:'Study day',grammarMet:'Grammar goal met',dayPlan:'Selected Day Plan',practiceNow:'Open Grammar Practice ↗',focus:'Study focus',planLevel:'Planned JLPT level',note:'Study note (optional)',savePlan:'Save Day Plan',removePlan:'Remove Plan',checkIn:'Mark Studied (Self-report)',undoCheck:'Undo Check-in',disclaimer:'* Study streak combines completed Grammar Practice sessions and self-reported study check-ins. Data stays in THIS browser, may be visible to others using it, and is not synced to YKCR, payment, exam scores or cloud records. Automatic reminders are not sent.',questionSuffix:'questions',sessions:'Grammar sessions',manual:'Self-reported completion',notManual:'No manual check-in',noPlan:'No plan saved for this date',planSaved:'Day plan saved.',goalsSaved:'Study goals saved.',removed:'Plan removed.',marked:'Self-reported study day saved.',unmarked:'Self-reported check-in removed.',saveError:'Could not save in this browser. Check your storage settings.',dateError:'Choose a valid date.',future:'Future dates cannot be marked completed.',notPlanned:'Save a plan before marking it completed.',targetPast:'Target date passed',targetToday:'Personal target is today',days:'days',prev:'Previous month',next:'Next month',today:'Today',focusGrammar:'Grammar',focusVocabulary:'Vocabulary',focusKanji:'Kanji',focusReading:'Reading',focusListening:'Listening',focusReview:'Review'},
 ja:{dashboard:'受講生ダッシュボード',practice:'文法練習',title:'学習カレンダー',intro:'学習予定と個人目標を設定し、このブラウザでの学習記録を確認しましょう。',todayQuestions:'本日完了した文法問題',weeklyProgress:'今週の学習日数',streak:'連続学習日数*',targetCountdown:'個人目標日まで',settings:'学習目標',dailyGoal:'1日の文法問題目標',weeklyGoal:'週の学習日数目標',targetLevel:'個人目標JLPTレベル',targetDate:'個人目標日（任意）',saveGoals:'学習目標を保存',goalNote:'文法の問題数は完了したGrammar Practiceのみで集計します。週の学習日数には自己申告の学習完了も含まれます。目標日は公式JLPT試験日ではありません。',calendar:'学習カレンダー',monthHint:'日付を選んで学習予定や自己申告の学習完了を記録できます。',planned:'予定あり',studied:'学習した日',grammarMet:'文法目標達成',dayPlan:'選択日の学習予定',practiceNow:'文法練習を開く ↗',focus:'学習内容',planLevel:'学習予定JLPTレベル',note:'学習メモ（任意）',savePlan:'日付の予定を保存',removePlan:'予定を削除',checkIn:'学習完了を記録（自己申告）',undoCheck:'自己申告を取り消す',disclaimer:'* 連続学習日数には、完了したGrammar Practiceと自己申告の学習日が含まれます。データはこのブラウザ内に保存され、共用端末では他の利用者にも見える場合があります。YKCR・決済・模擬試験の得点・クラウド記録には反映されません。自動リマインダーも送信しません。',questionSuffix:'問',sessions:'文法練習セッション',manual:'自己申告で学習済み',notManual:'自己申告なし',noPlan:'この日の予定は未登録です',planSaved:'学習予定を保存しました。',goalsSaved:'学習目標を保存しました。',removed:'予定を削除しました。',marked:'学習済みと記録しました。',unmarked:'自己申告を取り消しました。',saveError:'このブラウザに保存できません。ストレージ設定を確認してください。',dateError:'正しい日付を選んでください。',future:'未来の日付は学習済みにできません。',notPlanned:'先に学習予定を保存してください。',targetPast:'目標日は過ぎました',targetToday:'今日が個人目標日です',days:'日',prev:'前月',next:'翌月',today:'今日',focusGrammar:'文法',focusVocabulary:'語彙',focusKanji:'漢字',focusReading:'読解',focusListening:'聴解',focusReview:'復習'}
 };
 const DAYS={my:['တနင်္လာ','အင်္ဂါ','ဗုဒ္ဓဟူး','ကြာသပတေး','သောကြာ','စနေ','တနင်္ဂနွေ'],en:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],ja:['月','火','水','木','金','土','日']};
 function getStored(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}
 let goals=cleanGoals(getStored(GOALS_KEY)),practice=cleanState(getStored(STORAGE_KEY));
 let language='my';try{const l=localStorage.getItem('yk_lang');if(T[l])language=l}catch{}
 let selected=dateKey(new Date()),month=selected.slice(0,7);
 const today=()=>dateKey(new Date()), L=k=>T[language][k]||k;
 function persist(){try{localStorage.setItem(GOALS_KEY,JSON.stringify(goals));return true}catch{return false}}
 function notice(id,message){$(id).textContent=message}
 function locale(){return {my:'my-MM',en:'en-US',ja:'ja-JP'}[language]}
 function formatDay(key){const d=dateFromKey(key);if(!d)return key;try{return new Intl.DateTimeFormat(locale(),{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(d)}catch{return key}}
 function focusLabel(name){return L({grammar:'focusGrammar',vocabulary:'focusVocabulary',kanji:'focusKanji',reading:'focusReading',listening:'focusListening',review:'focusReview'}[name]||'focusGrammar')}
 function fillSettings(){$('yk816Daily').value=String(goals.dailyQuestions);$('yk816Weekly').value=String(goals.weeklyDays);$('yk816TargetLevel').value=goals.targetLevel;$('yk816TargetDate').value=goals.targetDate}
 function overview(){const t=today(),days=studyDays(goals,practice),d=days.get(t),week=weekProgress(goals,practice,t);
  $('yk816TodayQuestions').textContent=(d?.questions||0)+' / '+goals.dailyQuestions;
  $('yk816WeeklyDays').textContent=week.done+' / '+week.target;
  $('yk816Streak').textContent=String(streak(goals,practice,t));
  const remain=targetDays(goals,t);$('yk816TargetCount').textContent=remain===null?'—':remain<0?L('targetPast'):remain===0?'0':String(remain);
 }
 function calendar(){
  const js=new Date(Number(month.slice(0,4)),Number(month.slice(5,7))-1,1,12);let title=month;
  try{title=new Intl.DateTimeFormat(locale(),{year:'numeric',month:'long'}).format(js)}catch{}
  $('yk816MonthLabel').textContent=title;
  $('yk816Weekdays').innerHTML=DAYS[language].map(w=>`<span>${esc(w)}</span>`).join('');
  const t=today(),grid=monthGrid(month,goals,practice);
  $('yk816Days').innerHTML=grid.map(d=>{
   const label=`${d.day}; ${d.planned?L('planned')+'; ':''}${d.studyDone?L('studied')+'; ':''}${d.grammarQuestions} ${L('questionSuffix')}`;
   return `<button type="button" data-day="${d.day}" class="${d.inMonth?'':'outside'} ${d.day===selected?'is-selected':''} ${d.day===t?'is-today':''}" aria-pressed="${d.day===selected}" aria-label="${esc(label)}"><span class="yk816-date-num">${d.date}</span><span class="yk816-date-marks">${d.planned?'<i class="yk816-dot planned"></i>':''}${d.studyDone?'<i class="yk816-dot done"></i>':''}${d.goalMet?'<i class="yk816-dot met"></i>':''}</span>${d.grammarQuestions?`<span class="yk816-day-questions">${d.grammarQuestions} Q</span>`:'<span class="yk816-day-questions">&nbsp;</span>'}</button>`;
  }).join('');
 }
 function detail(){const plan=goals.plans[selected],d=studyDays(goals,practice).get(selected);
  $('yk816SelectedDate').textContent=formatDay(selected);
  $('yk816Focus').value=plan?.focus||'grammar';$('yk816PlanLevel').value=plan?.level||goals.targetLevel;
  $('yk816PlanNote').value=plan?.note||'';
  $('yk816Remove').disabled=!plan;
  $('yk816Done').disabled=!plan||selected>today();
  $('yk816Done').textContent=plan?.manualDone?L('undoCheck'):L('checkIn');
  $('yk816Done').setAttribute('aria-pressed',String(plan?.manualDone===true));
  $('yk816SelectedStats').innerHTML=`<strong>${d?.questions||0} ${esc(L('questionSuffix'))}</strong><p>${esc(L('sessions'))}: ${d?.sessions||0}</p><p>${esc(plan?focusLabel(plan.focus)+' · '+plan.level:L('noPlan'))}</p><p>${esc(plan?.manualDone?L('manual'):L('notManual'))}</p>`;
 }
 function translate(){document.documentElement.lang=language;app.querySelectorAll('[data-i]').forEach(el=>{const k=el.dataset.i;if(T[language][k])el.textContent=T[language][k]});
  app.querySelectorAll('button[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===language)));
  $('yk816Prev').setAttribute('aria-label',L('prev'));$('yk816Next').setAttribute('aria-label',L('next'));
  $('yk816Focus').querySelectorAll('option').forEach(opt=>opt.textContent=focusLabel(opt.value));
 }
 function paint(){translate();overview();calendar();detail()}
 function setLang(lang){if(!T[lang])return;const note=$('yk816PlanNote').value;language=lang;try{localStorage.setItem('yk_lang',lang)}catch{}paint();$('yk816PlanNote').value=note}
 function moveMonth(delta){const [y,m]=month.split('-').map(Number),d=new Date(y,m-1+delta,1,12);if(d.getFullYear()<2000||d.getFullYear()>2100)return;month=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;calendar()}
 app.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b||!app.contains(b))return;
  if(b.dataset.lang){setLang(b.dataset.lang);return}
  if(b.id==='yk816Prev'){moveMonth(-1);return}
  if(b.id==='yk816Next'){moveMonth(1);return}
  if(b.dataset.day&&dateFromKey(b.dataset.day)){
   selected=b.dataset.day;month=selected.slice(0,7);calendar();detail();notice('yk816PlanStatus','');return;
  }
  if(b.id==='yk816Remove'){
   try{goals=unscheduleDay(goals,selected);const ok=persist();paint();notice('yk816PlanStatus',ok?L('removed'):L('saveError'))}catch{notice('yk816PlanStatus',L('dateError'))}return;
  }
  if(b.id==='yk816Done'){
   try{const target=!goals.plans[selected]?.manualDone;goals=setManualDone(goals,selected,target,today());const ok=persist();paint();notice('yk816PlanStatus',ok?(target?L('marked'):L('unmarked')):L('saveError'))}
   catch{notice('yk816PlanStatus',selected>today()?L('future'):L('notPlanned'))}return;
  }
 });
 $('yk816GoalForm').addEventListener('submit',e=>{
  e.preventDefault();const date=$('yk816TargetDate').value;if(date&&!dateFromKey(date)){notice('yk816GoalStatus',L('dateError'));return}
  goals=updateGoals(goals,{dailyQuestions:Number($('yk816Daily').value),weeklyDays:Number($('yk816Weekly').value),targetLevel:$('yk816TargetLevel').value,targetDate:date});
  const ok=persist();paint();fillSettings();notice('yk816GoalStatus',ok?L('goalsSaved'):L('saveError'));
 });
 $('yk816PlanForm').addEventListener('submit',e=>{
  e.preventDefault();try{goals=scheduleDay(goals,selected,{focus:$('yk816Focus').value,level:$('yk816PlanLevel').value,note:$('yk816PlanNote').value});
   const ok=persist();paint();notice('yk816PlanStatus',ok?L('planSaved'):L('saveError'))}
  catch{notice('yk816PlanStatus',L('dateError'))}
 });
 window.addEventListener('storage',e=>{
  if(e.key===GOALS_KEY)goals=cleanGoals(getStored(GOALS_KEY));
  else if(e.key===STORAGE_KEY)practice=cleanState(getStored(STORAGE_KEY));
  else if(e.key==='yk_lang'&&T[e.newValue])language=e.newValue;
  else return;
  paint();fillSettings();
 });
 window.addEventListener('focus',()=>{practice=cleanState(getStored(STORAGE_KEY));overview();calendar();detail()});
 fillSettings();paint();
}
