/* YE KUN v7.59 — dashboard i18n + dropdown (layout only; auth and backend remain v7.58). */
(()=>{
'use strict';
const picker=document.getElementById('ykDashboardLangPicker');
if(!picker)return;
const langButton=picker.querySelectorAll('[data-yk-lang]');
const current=document.getElementById('ykCurrentLanguage');
const name={my:'မြန်မာ',en:'English',ja:'日本語'};
// The English copy from existing v7.58 is the source; runtime content translated on insertion.
// Format: [မြန်မာ, English, 日本語]. Identity and server-owned names/IDs are never translated.
const entries={
'DASHBOARD':['DASHBOARD','DASHBOARD','ダッシュボード'],
'Language':['ဘာသာစကား','Language','言語'],
'Admin Dashboard':['စီမံခန့်ခွဲသူ Dashboard','Admin Dashboard','管理者ダッシュボード'],
'Student Dashboard':['ကျောင်းသား Dashboard','Student Dashboard','学生ダッシュボード'],
'Member Dashboard':['Member Dashboard','Member Dashboard','会員ダッシュボード'],
'Checking your account and opening the right dashboard…':['အကောင့်ကို စစ်ဆေးပြီး သက်ဆိုင်ရာ Dashboard သို့ ပို့နေပါသည်…','Checking your account and opening the right dashboard…','アカウントを確認してダッシュボードを開いています…'],
'Student Management · CSV Import · Payment Requests · Reports':['ကျောင်းသားစီမံခန့်ခွဲမှု · CSV တင်သွင်းမှု · ငွေပေးချေမှု · Report','Student Management · CSV Import · Payment Requests · Reports','学生管理・CSV取込・支払い申請・レポート'],
'YKCR Student Verification · Exams · Results · Learning Progress':['YKCR ကျောင်းသားအတည်ပြုမှု · စာမေးပွဲ · ရလဒ် · တိုးတက်မှု','YKCR Student Verification · Exams · Results · Learning Progress','YKCR学生認証・試験・成績・学習進捗'],
'Free Exam · Paid Plans · Payment Requests · Exam History':['အခမဲ့စာမေးပွဲ · ငွေပေးချေ Plan · လျှောက်ထားမှု · ဖြေဆိုမှုမှတ်တမ်း','Free Exam · Paid Plans · Payment Requests · Exam History','無料試験・有料プラン・支払い申請・受験履歴'],
'Checking account…':['အကောင့် စစ်ဆေးနေသည်…','Checking account…','アカウント確認中…'],
'Connecting to your account…':['အကောင့်နှင့် ချိတ်ဆက်နေသည်…','Connecting to your account…','アカウントに接続中…'],
'Receipt Review':['ငွေလွှဲပြေစာ စစ်ဆေးရန်','Receipt Review','振込明細を確認'],
'✕ Close':['✕ ပိတ်ရန်','✕ Close','✕ 閉じる'],
'👑 Admin Access':['👑 Admin ခွင့်ပြုချက်','👑 Admin Access','👑 管理者アクセス'],
'✅ Student Verified':['✅ ကျောင်းသားအတည်ပြုပြီး','✅ Student Verified','✅ 学生認証済み'],
'⚠ Student Record Linked · Not Active':['⚠ ကျောင်းသားစာရင်းချိတ်ထားပြီး · သက်တမ်းမရှိ','⚠ Student Record Linked · Not Active','⚠ 学生データ連携済み・無効'],
'👤 Member Access':['👤 Member Access','👤 Member Access','👤 会員アクセス'],
'🎓 Student Management · YKCR Sync':['🎓 ကျောင်းသားစီမံခန့်ခွဲမှု · YKCR Sync','🎓 Student Management · YKCR Sync','🎓 学生管理・YKCR同期'],
'💳 Payment Management':['💳 ငွေပေးချေမှုစီမံခန့်ခွဲမှု','💳 Payment Management','💳 支払い管理'],
'📈 Exam & Student Overview':['📈 စာမေးပွဲနှင့် ကျောင်းသားအခြေအနေ','📈 Exam & Student Overview','📈 試験・学生サマリー'],
'ရှိပြီးသား Student Records နဲ့ YKCR Sync ကိုပဲ အသုံးပြုပါတယ်။ New Student Database မတည်ဆောက်ပါဘူး။':['ရှိပြီးသား ကျောင်းသားစာရင်းနှင့် YKCR Sync ကိုသာ အသုံးပြုပါသည်။ Student Database အသစ်မတည်ဆောက်ပါ။','Uses existing student records and YKCR sync. No new student database is created.','既存の学生データとYKCR同期を使用します。新しい学生DBは作成しません。'],
'Student CSV Import':['ကျောင်းသား CSV တင်သွင်းရန်','Student CSV Import','学生CSV取込'],
'Import Students':['ကျောင်းသားများ တင်သွင်းရန်','Import Students','学生を取り込む'],
'CSV ထဲမှာ Student ID နဲ့ Verification Code ပါရင် မူလအချက်အလက်ကို အသုံးပြုပါမယ်။ Import မလုပ်ခင် CSV မှန်ကန်ကြောင်း စစ်ပါ။':['CSV မှာ Student ID / Verification Code ပါလျှင် မူလတန်ဖိုးကို အသုံးပြုပါမည်။ မတင်မီ CSV ကို စစ်ဆေးပါ။','Existing Student IDs and Verification Codes are reused if present. Check the CSV before importing.','CSVに学生ID・認証コードがあればそのまま使用します。取込前に内容をご確認ください。'],
'Receipt Review · Approve · Reject · Delete · Refresh':['ပြေစာစစ်ဆေး · အတည်ပြု · ငြင်းပယ် · ဖယ်ရှား · ပြန်လည်ဖတ်ရန်','Receipt Review · Approve · Reject · Delete · Refresh','明細確認・承認・却下・削除・更新'],
'Status':['အခြေအနေ','Status','状態'],
'All':['အားလုံး','All','すべて'],
'Pending':['စောင့်ဆိုင်းဆဲ','Pending','承認待ち'],
'Approved':['အတည်ပြုပြီး','Approved','承認済み'],
'Rejected':['ငြင်းပယ်ပြီး','Rejected','却下'],
'↻ Refresh':['↻ ပြန်လည်ဖတ်ရန်','↻ Refresh','↻ 更新'],
'Loading…':['ဖတ်နေသည်…','Loading…','読み込み中…'],
'Loading Payment Requests…':['ငွေပေးချေမှုတောင်းဆိုချက်များ ဖတ်နေသည်…','Loading Payment Requests…','支払い申請を読み込み中…'],
'Loading overview…':['အကျဉ်းချုပ် ဖတ်နေသည်…','Loading overview…','概要を読み込み中…'],
'Student records':['ကျောင်းသားစာရင်း','Student records','学生登録数'],
'Active students':['သက်တမ်းရှိကျောင်းသားများ','Active students','有効な学生'],
'Submitted exams':['တင်သွင်းပြီးစာမေးပွဲ','Submitted exams','提出済み試験'],
'Pending payments':['စောင့်ဆိုင်းဆဲငွေပေးချေမှု','Pending payments','支払い承認待ち'],
'Exam attempts':['ဖြေဆိုမှုအကြိမ်များ','Exam attempts','受験回数'],
'Approved payments':['အတည်ပြုပြီးငွေပေးချေမှု','Approved payments','承認済み支払い'],
'Rejected payments':['ငြင်းပယ်ပြီးငွေပေးချေမှု','Rejected payments','却下済み支払い'],
'YKCR sync events':['YKCR Sync မှတ်တမ်း','YKCR sync events','YKCR同期イベント'],
'No payment requests for this status.':['ဒီအခြေအနေအတွက် ငွေပေးချေမှုတောင်းဆိုချက် မရှိပါ။','No payment requests for this status.','この状態の支払い申請はありません。'],
'◫ Receipt':['◫ ပြေစာ','◫ Receipt','◫ 明細'],
'✓ Approve':['✓ အတည်ပြု','✓ Approve','✓ 承認'],
'✕ Reject':['✕ ငြင်းပယ်','✕ Reject','✕ 却下'],
'🗑 Delete':['🗑 ဖယ်ရှား','🗑 Delete','🗑 削除'],
'🎓 My Student Profile':['🎓 ကျွန်ုပ်၏ကျောင်းသားအချက်အလက်','🎓 My Student Profile','🎓 学生プロフィール'],
'📚 My Exams & Training Access':['📚 ကျွန်ုပ်၏စာမေးပွဲ / သင်တန်း','📚 My Exams & Training Access','📚 試験・受講アクセス'],
'👤 My Account & Exam Access':['👤 အကောင့်နှင့်စာမေးပွဲခွင့်ပြုချက်','👤 My Account & Exam Access','👤 アカウント・受験アクセス'],
'✅ Verify as Student':['✅ ကျောင်းသားအတည်ပြုရန်','✅ Verify as Student','✅ 学生認証'],
'📊 My Exam History':['📊 ကျွန်ုပ်၏စာမေးပွဲမှတ်တမ်း','📊 My Exam History','📊 受験履歴'],
'💳 My Payment History':['💳 ကျွန်ုပ်၏ငွေပေးချေမှုမှတ်တမ်း','💳 My Payment History','💳 支払い履歴'],
'Student verification':['ကျောင်းသားအတည်ပြုမှု','Student verification','学生認証'],
'Exam access':['စာမေးပွဲဖြေဆိုခွင့်','Exam access','受験アクセス'],
'Class expires':['သင်တန်းသက်တမ်းကုန်ဆုံးမည့်နေ့','Class expires','受講期限'],
'Free exam used':['အခမဲ့စာမေးပွဲ အသုံးပြုပြီး','Free exam used','無料受験利用済み'],
'Active':['အသက်ဝင်နေသည်','Active','有効'],
'Unlimited':['အကန့်အသတ်မရှိ','Unlimited','回数無制限'],
'Inactive':['အသက်မဝင်','Inactive','無効'],
'Yes':['ဟုတ်သည်','Yes','はい'],
'No':['မဟုတ်ပါ','No','いいえ'],
'Member':['Member','Member','会員'],
'Account':['အကောင့်','Account','アカウント'],
'Free exam':['အခမဲ့စာမေးပွဲ','Free exam','無料試験'],
'Paid access':['Paid Access','Paid access','有料アクセス'],
'Plan expires':['Plan သက်တမ်းကုန်ဆုံးမည့်နေ့','Plan expires','プランの期限'],
'Not active':['သက်တမ်းမရှိ','Not active','無効'],
'Not Active':['သက်တမ်းမရှိ','Not Active','無効'],
'Used':['အသုံးပြုပြီး','Used','利用済み'],
'1 available':['၁ ကြိမ်ကျန်','1 available','残り1回'],
'Student name':['ကျောင်းသားအမည်','Student name','学生氏名'],
'Student ID':['Student ID','Student ID','学生ID'],
'Class':['အတန်း','Class','クラス'],
'Start date':['စတင်နေ့','Start date','開始日'],
'Expire date':['သက်တမ်းကုန်ဆုံးနေ့','Expire date','有効期限'],
'Email':['Email','Email','メールアドレス'],
'Free attempt':['အခမဲ့ဖြေဆိုခွင့်','Free attempt','無料受験回数'],
'Paid Plan':['Paid Plan','Paid Plan','有料プラン'],
'Payment status':['ငွေပေးချေမှုအခြေအနေ','Payment status','支払い状況'],
'No pending request':['စောင့်ဆိုင်းဆဲတောင်းဆိုမှု မရှိ','No pending request','承認待ち申請なし'],
'Available (one per account)':['အကောင့်တစ်ခုလျှင် ၁ ကြိမ် ရနိုင်','Available (one per account)','1アカウントにつき1回利用可'],
'Already used':['အသုံးပြုပြီး','Already used','利用済み'],
'Start Mock Exam':['Mock Exam စတင်ရန်','Start Mock Exam','模擬試験を始める'],
'Study Hub':['လေ့လာရေး Hub','Study Hub','学習ハブ'],
'Exam / Buy Access':['စာမေးပွဲ / Access ဝယ်ရန်','Exam / Buy Access','受験・アクセス購入'],
'Account Settings':['အကောင့်ဆက်တင်','Account Settings','アカウント設定'],
'Verify Student':['ကျောင်းသားအတည်ပြုရန်','Verify Student','学生認証する'],
'Verification Code':['Verification Code','Verification Code','認証コード'],
'YKCR Student Data နဲ့ချိတ်ထားပါတယ်။ သင်တန်းသက်တမ်းအတွင်း Mock Exams ကို Unlimited ဖြေနိုင်ပါတယ်။':['YKCR ကျောင်းသားဒေတာနဲ့ ချိတ်ထားပြီး သင်တန်းသက်တမ်းအတွင်း Mock Exam ကို အကန့်အသတ်မရှိ ဖြေနိုင်ပါတယ်။','Linked to YKCR student records. Active students have unlimited mock exam access.','YKCR学生データと連携しています。受講期間中は模擬試験を回数無制限で利用できます。'],
'Training Access Card နဲ့ Verification Code အပြည့်အစုံကို Public Dashboard မှာ မပြပါဘူး။':['Training Access Card နှင့် Verification Code အပြည့်ကို Public Dashboard မှာ မပြပါ။','Full training access cards and verification codes are not shown on this dashboard.','受講カードと認証コードの全情報は公開画面に表示しません。'],
'YKCR မှာ စာရင်းရှိတဲ့ Student တွေက ရှိပြီးသား Student ID နဲ့ Verification Code ကို အသုံးပြုနိုင်ပါတယ်။':['YKCR ကျောင်းသားများသည် မူလ Student ID နှင့် Verification Code ကို အသုံးပြုနိုင်ပါတယ်။','YKCR students can use their existing Student ID and Verification Code.','YKCRに登録済みの学生は既存の学生IDと認証コードで確認できます。'],
'No exam attempts yet.':['စာမေးပွဲဖြေဆိုမှုမှတ်တမ်း မရှိသေးပါ။','No exam attempts yet.','受験履歴はありません。'],
'No payment requests yet.':['ငွေပေးချေမှုတောင်းဆိုမှု မရှိသေးပါ။','No payment requests yet.','支払い申請はありません。'],
'Exam':['စာမေးပွဲ','Exam','試験'],
'Score (practice)':['လေ့ကျင့်ရေးအမှတ်','Score (practice)','練習得点'],
'Date':['နေ့စွဲ','Date','日付'],
'Checking YKCR Student ID…':['YKCR ကျောင်းသား ID စစ်ဆေးနေသည်…','Checking YKCR Student ID…','YKCR学生IDを確認中…'],
'Student verified. Opening Student Dashboard…':['ကျောင်းသားအတည်ပြုပြီး၊ Dashboard ဖွင့်နေသည်…','Student verified. Opening Student Dashboard…','学生認証が完了しました。ダッシュボードを開きます…'],
'🔁 Retry':['🔁 ထပ်စမ်းရန်','🔁 Retry','🔁 再試行'],
'↻ Retry':['↻ ထပ်စမ်းရန်','↻ Retry','↻ 再試行'],
'Homepage':['မူလစာမျက်နှာ','Homepage','ホームページ'],
'Overview not available.':['အကျဉ်းချုပ် မရရှိနိုင်ပါ။','Overview not available.','概要を取得できません。'],
};
let lang='my';try{const saved=localStorage.getItem('yk_lang');if(['my','en','ja'].includes(saved))lang=saved;}catch{}
const src=new WeakMap();
function maybeTranslate(node){
 if(!node||node.nodeType!==Node.TEXT_NODE||!node.parentElement)return;
 const par=node.parentElement;
 if(par.closest('script,style,noscript,textarea,input,.yk-dash-dock-logout,.yk-dash-dock-home,.yklogo,.brand,.yk-current-language'))return;
 let rec=src.get(node),content=node.nodeValue;
 if(!rec){rec={original:content,lastTranslated:null};src.set(node,rec)}
 else if(content!==rec.original && content!==rec.lastTranslated){rec.original=content;}
 const trimmed=rec.original.trim();
 const values=entries[trimmed];
 if(!values)return;
 const start=rec.original.match(/^\s*/)?.[0]||'';
 const end=rec.original.match(/\s*$/)?.[0]||'';
 const translated=start+values[{my:0,en:1,ja:2}[lang]]+end;
 rec.lastTranslated=translated;
 if(node.nodeValue!==translated)node.nodeValue=translated;
}
function translateRegion(root){
 if(!root)return;
 const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(tw.nextNode())nodes.push(tw.currentNode);
 nodes.forEach(maybeTranslate);
}
function paint(){
 document.documentElement.lang=lang;
 if(current)current.textContent=name[lang];
 langButton.forEach(b=>b.setAttribute('aria-current',String(b.dataset.ykLang===lang)));
 translateRegion(document.querySelector('main.shell'));
 translateRegion(document.querySelector('.topbar'));
 translateRegion(document.getElementById('receiptDialog'));
}
function setLanguage(next){if(!name[next])return;lang=next;try{localStorage.setItem('yk_lang',lang)}catch{}paint()}
langButton.forEach(button=>button.addEventListener('click',()=>{setLanguage(button.dataset.ykLang);picker.open=false;document.getElementById('ykLanguageToggle')?.focus({preventScroll:true});}));
document.addEventListener('click',e=>{if(picker.open&&!picker.contains(e.target))picker.open=false});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&picker.open){picker.open=false;document.getElementById('ykLanguageToggle')?.focus({preventScroll:true})}});
let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;paint()})});
observer.observe(document.querySelector('main.shell'),{subtree:true,childList:true,characterData:true});
const dialog=document.getElementById('receiptDialog');if(dialog)observer.observe(dialog,{subtree:true,childList:true,characterData:true});
paint();
window.YKDashboardLanguageV759={setLanguage,getLanguage:()=>lang};
})();
