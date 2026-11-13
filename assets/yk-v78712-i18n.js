/* v7.87.12: scoped UI-only language consistency layer.
 * Existing homepage, Login, Video and Dashboard localization remain the owners.
 * Do not translate student content, exam questions, Japanese lessons, account data,
 * user input or branded product names. Persist only the selected UI language.
 */
(()=>{'use strict';
 const supported=['my','en','ja'];
 const dict=Object.freeze({
  // Shared short controls
  'Overview':['အကျဉ်းချုပ်','概要'], 'Exam Analytics':['စာမေးပွဲ စာရင်းအင်း','試験分析'],
  'Payments':['ငွေပေးချေမှုများ','支払い'], 'Business Growth':['လုပ်ငန်းတိုးတက်မှု','事業成長'],
  'Enrollment CRM':['သင်တန်းစုံစမ်းသူ စီမံခန့်ခွဲမှု','受講申込管理'],
  'Announcements':['ကြေညာချက်များ','お知らせ'], 'Announcement Management':['ကြေညာချက် စီမံခန့်ခွဲမှု','お知らせ管理'],
  'Loading…':['ဖတ်နေသည်…','読み込み中…'], 'Loading':['ဖတ်နေသည်','読み込み中'],
  'Loading CRM…':['စုံစမ်းသူစာရင်း ဖတ်နေသည်…','申込者一覧を読み込み中…'],
  'Loading announcements…':['ကြေညာချက်များ ဖတ်နေသည်…','お知らせを読み込み中…'],
  'Retry':['ပြန်စမ်းရန်','再試行'], '↻ Retry':['↻ ပြန်စမ်းရန်','↻ 再試行'],
  'Refresh':['အသစ်ပြန်ဖတ်ရန်','更新'], '↻ Reload':['↻ အသစ်ပြန်ဖတ်ရန်','↻ 再読み込み'],
  '↻ Refresh':['↻ အသစ်ပြန်ဖတ်ရန်','↻ 更新'], '↻ Refresh records':['↻ မှတ်တမ်း ပြန်ဖတ်ရန်','↻ 記録を更新'],
  'Save':['သိမ်းရန်','保存'], 'Cancel':['မလုပ်တော့ပါ','キャンセル'],
  'Edit':['ပြင်ရန်','編集'], 'Delete':['ဖျက်ရန်','削除'], 'Actions':['လုပ်ဆောင်ချက်','操作'],
  'Name':['အမည်','氏名'], 'Status':['အခြေအနေ','状態'], 'Source':['မည်သည့်နေရာမှ','流入元'],
  'Language':['ဘာသာစကား','言語'], 'All':['အားလုံး','すべて'],
  'New':['အသစ်','新規'], 'Contacted':['ဆက်သွယ်ပြီး','連絡済み'],
  'Interested':['စိတ်ဝင်စား','検討中'], 'Enrolled':['သင်တန်းအပ်ပြီး','受講申込済み'],
  'Closed':['ပြီးဆုံး','対応終了'], 'Other':['အခြား','その他'],
  'New inquiry':['စုံစမ်းသူ အသစ်','新規お問い合わせ'],
  'Follow-up date':['ပြန်လည်ဆက်သွယ်မည့်နေ့','次回連絡日'],
  'Follow-ups due':['ပြန်ဆက်သွယ်ရန် ကျန်သူ','要フォローアップ'],
  'Contact channel':['ဆက်သွယ်ရေးနည်းလမ်း','連絡方法'],
  'Contact / Messenger reference':['ဆက်သွယ်ရန် အချက်အလက် / Messenger','連絡先 / Messenger'],
  'Name / Contact':['အမည် / ဆက်သွယ်ရန်','氏名 / 連絡先'],
  'Course / Source':['သင်တန်း / သိရှိလာသည့်နေရာ','講座 / 流入元'],
  'Status / Follow-up':['အခြေအနေ / ပြန်ဆက်သွယ်ရန်','状態 / 次回連絡'],
  'Class / သင်တန်း':['သင်တန်း','講座'],
  'Existing YKCR student ID (optional, unverified reference)':['ရှိပြီးသား YKCR Student ID (မဖြည့်လည်းရ)','既存のYKCR学生ID（任意・未照合）'],
  'Notes / မှတ်ချက်':['မှတ်ချက်','メモ'],
  'Save Lead':['စုံစမ်းသူစာရင်း သိမ်းရန်','お問い合わせを保存'],
  'Update Lead':['စုံစမ်းသူစာရင်း ပြင်ရန်','お問い合わせを更新'],
  'Clear / New':['ရှင်းလင်း / အသစ်','クリア / 新規'],
  'Add / Update Lead':['စုံစမ်းသူ ထည့်ရန် / ပြင်ရန်','お問い合わせの追加 / 更新'],
  'No follow-up':['ပြန်ဆက်သွယ်မည့်နေ့ မသတ်မှတ်ရသေး','次回連絡日なし'],
  'No records in this filter.':['ဒီအခြေအနေမှာ စာရင်းမရှိပါ။','この条件に該当する記録はありません。'],
  'Open this panel to load leads.':['စုံစမ်းသူစာရင်းကြည့်ရန် ဒီအပိုင်းကို ဖွင့်ပါ။','開くとお問い合わせを読み込みます。'],
  'Open to manage announcements.':['ကြေညာချက်များ စီမံရန် ဖွင့်ပါ။','開くとお知らせを管理できます。'],
  'CRM unavailable. Check v7.87.8 migration, admin permissions and Netlify Function logs.':['CRM မရနိုင်သေးပါ။ Database Migration၊ Admin Permission နဲ့ Netlify Logs ကို စစ်ပါ။','CRMを利用できません。移行、管理者権限とNetlifyログをご確認ください。'],
  'Announcement':['ကြေညာချက်','お知らせ'], 'Publish Announcement':['ကြေညာချက်ထုတ်ရန်','お知らせを公開'],
  'Recent announcements':['နောက်ဆုံးကြေညာချက်များ','最近のお知らせ'],
  'No announcements published yet.':['ကြေညာချက် မထုတ်ရသေးပါ။','公開済みのお知らせはありません。'],
  'Announcements unavailable. Please retry.':['ကြေညာချက်များ မဖတ်နိုင်သေးပါ။ ပြန်စမ်းပါ။','お知らせを取得できません。再試行してください。'],
  'Title / ခေါင်းစဉ်':['ခေါင်းစဉ်','タイトル'],
  'Saved ✓':['သိမ်းပြီးပါပြီ ✓','保存しました ✓'],
  'Lead deleted ✓':['စုံစမ်းသူစာရင်း ဖျက်ပြီးပါပြီ ✓','削除しました ✓'],
  'Published ✓':['ကြေညာချက် ထုတ်ပြီးပါပြီ ✓','公開しました ✓'],
  'Publish failed':['ကြေညာချက် မထုတ်နိုင်ပါ','公開に失敗しました'],
  'Could not save':['သိမ်းမရပါ','保存できませんでした'],
  'Could not delete':['ဖျက်မရပါ','削除できませんでした'],
  'Save this inquiry?':['ဒီစုံစမ်းသူကို သိမ်းမလား။','このお問い合わせを保存しますか？'],
  'Update this inquiry?':['ဒီစုံစမ်းသူစာရင်းကို ပြင်မလား။','このお問い合わせを更新しますか？'],
  'Permanently delete this CRM prospect? This does NOT delete an existing YKCR student.':['ဒီစုံစမ်းသူစာရင်းကို အပြီးဖျက်မလား။ ရှိပြီးသား YKCR ကျောင်းသားစာရင်းကို မဖျက်ပါ။','このお問い合わせを完全に削除しますか？既存のYKCR受講生は削除されません。'],
  'Publish this announcement?':['ဒီကြေညာချက်ကို ထုတ်မလား။','このお知らせを公開しますか？'],
  'Save this owner-confirmed business record?':['သင်အတည်ပြုထားတဲ့ လုပ်ငန်းမှတ်တမ်းကို သိမ်းမလား။','確認済み事業記録を保存しますか？'],
  'Delete this manual business entry? This cannot be undone.':['ဒီလုပ်ငန်းမှတ်တမ်းကို အပြီးဖျက်မလား။ ပြန်ယူလို့ မရပါ။','この手入力の事業記録を削除しますか？元に戻せません。'],
  // Admin/student analytics
  'My Learning':['ကျွန်ုပ်၏လေ့လာမှု','学習状況'],
  'My Learning Pro':['ကျွန်ုပ်၏လေ့လာမှု Pro','学習状況 Pro'],
  'Learning Progress Graph':['လေ့လာမှုတိုးတက်မှု ဂရပ်','学習進捗グラフ'],
  'Verified Mock Exam Trend':['အတည်ပြုထားတဲ့ Mock Exam ရလဒ်ပြောင်းလဲမှု','検証済み模試の推移'],
  'Pass Rate by Exam':['စာမေးပွဲအလိုက် အောင်မြင်မှုနှုန်း','試験別合格率'],
  'Exam Pass Rate':['စာမေးပွဲအောင်မြင်မှုနှုန်း','模試合格率'],
  'Active Students':['သက်တမ်းရှိ ကျောင်းသားများ','有効な受講生'],
  'Pending Payments':['စစ်ဆေးရန် ငွေပေးချေမှုများ','確認待ちの支払い'],
  'Practice score trend':['လေ့ကျင့်မှု အမှတ်တိုးတက်မှု','練習スコアの推移'],
  'Verified Results':['အတည်ပြုထားသော ရလဒ်များ','検証済み結果'],
  'Average Score':['ပျမ်းမျှအမှတ်','平均スコア'],
  'Submitted Attempts':['ဖြေဆိုပြီးသောအကြိမ်','提出済み受験回数'],
  'Exam Types Practiced':['လေ့ကျင့်ထားသော စာမေးပွဲအမျိုးအစား','練習した試験の種類'],
  'Exam Areas to Review':['ပြန်လေ့လာသင့်တဲ့ စာမေးပွဲအပိုင်းများ','復習すべき試験分野'],
  'Recommended Next Practice':['နောက်ထပ် လေ့ကျင့်သင့်တဲ့အရာ','次におすすめの練習'],
  'Saved Wrong Answers':['သိမ်းထားသော အဖြေမှားများ','保存した間違い'],
  'Learning Data Notes':['လေ့လာမှု Data မှတ်ချက်','学習データについて'],
  'JLPT Learning Coverage':['JLPT လေ့လာပြီးမှု','JLPT学習範囲'],
  'No verified results yet':['အတည်ပြုထားသော ရလဒ် မရှိသေးပါ','検証済み結果はまだありません'],
  'No verified results yet.':['အတည်ပြုထားသော ရလဒ် မရှိသေးပါ။','検証済み結果はまだありません。'],
  'Choose an exam':['စာမေးပွဲ ရွေးပါ','試験を選択'],
  'Loading admin analytics…':['Admin စာရင်းအင်း ဖတ်နေသည်…','管理分析を読み込み中…'],
  'Loading verified analytics…':['အတည်ပြုထားသော စာရင်းအင်းများ ဖတ်နေသည်…','検証済み分析を読み込み中…'],
  'Loading your exam records…':['မိမိစာမေးပွဲမှတ်တမ်းများ ဖတ်နေသည်…','受験記録を読み込み中…'],
  'Loading exam history…':['စာမေးပွဲမှတ်တမ်း ဖတ်နေသည်…','受験履歴を読み込み中…'],
  'Loading review…':['အမှားပြန်လေ့လာရန် Data ဖတ်နေသည်…','復習データを読み込み中…'],
  'Loading JLPT…':['JLPT Data ဖတ်နေသည်…','JLPTデータを読み込み中…'],
  'Load JLPT lesson progress':['JLPT သင်ခန်းစာတိုးတက်မှု ဖတ်ရန်','JLPT学習進捗を読み込む'],
  'My Study Journey':['ကျွန်ုပ်၏လေ့လာရေးခရီး','私の学習ステップ'],
  'Wrong Answer Review':['အဖြေမှားများ ပြန်လေ့လာရန်','間違いを復習'],
  'Personal Exam Coach':['ကိုယ်ပိုင် Exam Coach','パーソナル試験コーチ'],
  'My Exam Coach':['ကျွန်ုပ်၏ Exam Coach','私の試験コーチ'],
  'Save date':['ရက်စွဲသိမ်းရန်','日付を保存'],
  'Choose a future date within 3 years.':['လာမယ့် ၃ နှစ်အတွင်း ရက်စွဲရွေးပါ။','今後3年以内の日付を選択してください。'],
  // Grammar UI only — Japanese text, English examples, and Burmese/English lesson explanations stay together.
  '← Learning Center':['← Learning Center သို့','← 学習センターへ'],
  'ORIGINAL LESSONS':['မူရင်းသင်ခန်းစာများ','オリジナル教材'],
  'Loading grammar index…':['Grammar စာရင်း ဖတ်နေသည်…','文法一覧を読み込み中…'],
  'Loading Grammar Library…':['Grammar သင်ခန်းစာများ ဖတ်နေသည်…','文法教材を読み込み中…'],
  'Original 30 lessons ↗':['မူလသင်ခန်းစာ ၃၀ ခု ↗','元の30レッスン ↗'],
  'Auto by Level':['Level အလိုက် အလိုအလျောက်','レベル別に自動'],
  'Show Known':['သိထားတဲ့ Furigana အားလုံးပြရန်','登録済みの読みをすべて表示'],
  'Hide':['ဖျောက်ရန်','非表示'],
  'All Lessons':['သင်ခန်းစာအားလုံး','全レッスン'],
  'Bookmarked':['Bookmark ထားသောအရာများ','ブックマーク済み'],
  'Select a grammar pattern.':['လေ့လာမယ့် Grammar ကို ရွေးပါ။','学ぶ文法項目を選んでください。'],
  'Select a grammar pattern to see its lesson.':['ရှင်းလင်းချက်ကြည့်ရန် Grammar ကို ရွေးပါ။','解説を見る文法項目を選んでください。'],
  'Choose a grammar pattern on the left.':['ဘယ်ဘက်စာရင်းထဲက Grammar ကို ရွေးပါ။','左の一覧から文法を選んでください。'],
  'No matching grammar items.':['ကိုက်ညီတဲ့ Grammar မတွေ့ပါ။','一致する文法がありません。'],
  'Grammar data could not load. Please check connection and retry.':['Grammar Data မဖတ်နိုင်ပါ။ Internet စစ်ပြီး ပြန်စမ်းပါ။','文法データを取得できません。通信を確認し再試行してください。'],
  'Original trilingual lesson':['သုံးဘာသာ ရှင်းလင်းချက်','日・ミャンマー・英語の解説'],
  'Lesson':['သင်ခန်းစာ','レッスン'], 'Review needed':['ပြန်စစ်ရန်လိုအပ်','内容確認が必要'],
  'Content review needed · 内容確認中':['ရှင်းလင်းချက် ပြန်စစ်ရန်လိုအပ် · 内容確認中','内容の確認が必要です'],
  '☆ Bookmark':['☆ Bookmark သိမ်းရန်','☆ ブックマーク'],
  '★ Bookmarked':['★ Bookmark သိမ်းပြီး','★ ブックマーク済み'],
  '✓ Mark learned':['✓ လေ့လာပြီးကြောင်း မှတ်သားရန်','✓ 学習済みにする'],
  '✓ Learned':['✓ လေ့လာပြီး','✓ 学習済み'],
  // Common affordances on other pages
  'Grammar Library progress is saved on this browser only. Existing JLPT cloud progress and exam scores are not changed.':['ဒီ Grammar Library ရဲ့ Bookmark နဲ့ လေ့လာပြီးမှုကို ဒီ Browser ထဲမှာသာ သိမ်းထားပါတယ်။ မူလ JLPT Cloud Progress နဲ့ Exam Score ကို မပြောင်းပါ။','文法の学習記録はこのブラウザにのみ保存されます。既存のJLPTクラウド進捗と模試スコアは変更されません。'],
  'Search grammar':['Grammar ရှာရန်','文法を検索'],
  'Search 文法 / မြန်မာ / English':['Grammar ရှာရန် (日本語 / မြန်မာ / English)','文法を検索（日本語・ミャンマー語・英語）'],
  'Your name':['သင့်အမည်','お名前'],
  'Repeat password':['စကားဝှက် ထပ်ထည့်ရန်','パスワードを再入力'],
  '8+ characters':['စာလုံး ၈ လုံးနှင့်အထက်','8文字以上'],
  'Show or hide password':['စကားဝှက် ပြ/ဖျောက်','パスワードの表示切替'],
  'You can browse the website without signing in. Login is required to take mock exams.':['အကောင့်မဝင်ဘဲ Website ကို ကြည့်နိုင်ပါတယ်။ Mock Exam ဖြေဖို့ Login လိုအပ်ပါတယ်။','ログインせずにサイトを閲覧できます。模試の受験にはログインが必要です。'],
  'Login and registration':['Login နှင့် အကောင့်ဖွင့်ခြင်း','ログイン・新規登録'],
  'Free Attempt Used for This Exam':['ဒီစာမေးပွဲအတွက် အခမဲ့အကြိမ်ကို အသုံးပြုပြီးပါပြီ','この試験の無料受験は使用済みです'],
  '✓ Exam Completed':['✓ စာမေးပွဲ ဖြေဆိုပြီး','✓ 受験完了']
 });
 const exact=(base,locale)=>dict[base]?.[locale==='my'?0:locale==='ja'?1:-1]||base;
 function value(base,locale){
  if(locale==='en')return base;
  if(Object.prototype.hasOwnProperty.call(dict,base))return exact(base,locale);
  let m;
  if((m=/^Editing lead #(\d+)$/.exec(base)))return (locale==='my'?'စုံစမ်းသူစာရင်း ပြင်နေသည် #':'編集中 #')+m[1];
  if((m=/^JLPT (N[1-5]) · (\d+) patterns · (\d+) original lessons$/.exec(base)))return locale==='my'?`JLPT ${m[1]} · Grammar ${m[2]} ခု · သင်ခန်းစာ ${m[3]} ခု`:`JLPT ${m[1]} · 文法${m[2]}件 · レッスン${m[3]}件`;
  return base;
 }
 const locale=()=>{let stored='';try{stored=localStorage.getItem('yk_lang')||''}catch{}
   const html=document.documentElement.lang;return supported.includes(html)&&html!=='my'?html:supported.includes(stored)?stored:'my';};
 const current={lang:locale()};
 const original=new WeakMap();
 const originalAttr=new WeakMap();
 const isGrammar=()=>!!document.getElementById('yk879App');
 const ignore='script,style,noscript,template,textarea,input,[contenteditable],ruby,rt,.yk879-meaning,.yk879-connection,.yk879-examples,.yk879-row-label,.yk879-grammar-title,.yk879-translation,.yk878-tablewrap tbody td:first-child,#yk878AnnouncementContent article,.yk877-table tbody,.yk82-quiz,.yk82-sentence,.exam-v728-question,.exam-v728-choices,blockquote';
 const uiTag='button,summary,label,option,a,h1,h2,h3,h4,th,small,.yk879-msg,.yk879-note,.yk879-local-note,.yk879-help,.yk879-legal,.yk879-row-status,.yk879-kicker,.yk879-topnav,.yk878-meta,.yk878-kpi,.yk878-message,.yk84-progress,.yk84-empty,.yk84-caption,.yk84-label,.yk865-date,.yk865-error,.yk82-empty,.yk82-sub,.yk82-note,.exam-v728-modal-head,.yk878-shell p';
 function eligible(node){const p=node?.parentElement;
  if(!p||p.closest(ignore))return false;
  // Homepage strings are owned by v7.37; use this layer only on UI controls/modal headings.
  if(!p.closest(uiTag))return false;
  return true;
 }
 function translateNode(node){if(node?.nodeType!==3||!eligible(node))return;
  const now=node.nodeValue||'';
  let rec=original.get(node);
  if(!rec||now!==rec.last&&now!==rec.source){rec={source:now,last:now};original.set(node,rec);}
  const pre=rec.source.match(/^\s*/)?.[0]||'',post=rec.source.match(/\s*$/)?.[0]||'';
  const key=rec.source.trim(),translated=value(key,current.lang);
  const next=pre+translated+post;
  if(now!==next){rec.last=next;node.nodeValue=next;}
 }
 function applyKeyed(root){if(root.nodeType!==1&&root.nodeType!==9)return;
  const all=(root.matches?.('[data-yk-l12]')?[root]:[]).concat([...root.querySelectorAll?.('[data-yk-l12]')||[]]);
  for(const el of all){const k=el.dataset.ykL12;if(staticPhrases[k])el.textContent=staticPhrases[k][current.lang];}
 }
 const staticPhrases={
  grammarIntro:{my:'ဂျပန် Grammar ကို မြန်မာ၊ English နဲ့ လေ့လာပါ။ Level အလိုက် Furigana ရွေးနိုင်ပြီး 例文 ထဲက Grammar ကို အနီမျဉ်းနဲ့ ပြထားပါတယ်။',en:'Learn Japanese grammar with Myanmar and English explanations. Choose furigana by level and see the grammar pattern underlined in red in each example.',ja:'ミャンマー語と英語の解説で日本語文法を学びましょう。レベル別ふりがなと例文中の赤い下線で確認できます。'},
  grammarDisclaimer:{my:'N5–N1 Grammar သင်ခန်းစာ 509 ခု။ Level သတ်မှတ်ချက်များသည် လေ့လာရေးအတွက်သာဖြစ်ပြီး JLPT တရားဝင်စာရင်း မဟုတ်ပါ။',en:'509 original trilingual grammar lessons across N5–N1. The grouping is for learning purposes and is not an official JLPT syllabus.',ja:'N5～N1のオリジナル文法レッスン509件。レベル分類は学習用であり、公式JLPT出題範囲ではありません。'},
  grammarFuriNote:{my:'သေချာစစ်ထားတဲ့ Kanji ဖတ်ပုံတွေကိုသာ ပြပါတယ်။ Kanji အားလုံးမှာ Furigana မပါနိုင်ပါ။',en:'Only independently verified reading annotations are shown, so not every kanji is annotated.',ja:'確認済みの読み方のみ表示します。すべての漢字にふりがなが付くわけではありません。'},
  grammarLocalNote:{my:'ဒီ Grammar Library ရဲ့ Bookmark နဲ့ လေ့လာပြီးမှုကို ဒီ Browser ထဲမှာသာ သိမ်းထားပါတယ်။ မူလ JLPT Cloud Progress နဲ့ Exam Score ကို မပြောင်းပါ။',en:'Grammar Library progress is saved on this browser only. Existing JLPT cloud progress and exam scores are not changed.',ja:'この文法ライブラリの進捗はこのブラウザにのみ保存されます。既存のJLPTクラウド進捗や模試スコアは変更しません。'},
  grammarReference:{my:'Grammar စာရင်း Reference',en:'Grammar index reference',ja:'文法一覧の参照元'},
  grammarLegal:{my:'Furigana Level သတ်မှတ်ချက်တွေက လေ့လာသူများအတွက် ခန့်မှန်းထားတာဖြစ်ပြီး JLPT တရားဝင် Kanji စာရင်း မဟုတ်ပါ။',en:'Furigana defaults are approximate learner-friendly settings rather than an official JLPT kanji list.',ja:'ふりがなのレベル設定は学習者向けの目安であり、公式JLPT漢字リストではありません。'},
  grammarLegalTail:{my:'ဒီ Website ရဲ့ ရှင်းလင်းချက်နဲ့ 例文 တွေကို Reference မှ တိုက်ရိုက်ကူးယူထားတာ မဟုတ်ပါ။ Bookmark နဲ့ Progress ကို Browser ထဲမှာသာ သိမ်းပါတယ်။',en:'Explanations/examples here are newly authored, not reproduced from the reference. Library bookmarks/learning marks use browser-local storage; existing account learning progress is unchanged.',ja:'解説と例文は独自に作成したもので、参照サイトからの転載ではありません。ブックマークと学習記録はブラウザに保存され、既存のアカウント進捗は変更しません。'}
 };
 function translateAttributes(root){if(root?.nodeType!==1&&root?.nodeType!==9)return;
  const all=(root.matches?.('input[placeholder],button[aria-label]')?[root]:[]).concat([...root.querySelectorAll?.('input[placeholder],button[aria-label]')||[]]);
  for(const el of all){for(const attr of ['placeholder','aria-label']){
   if(!el.hasAttribute(attr))continue;const valueNow=el.getAttribute(attr);
   let previous=originalAttr.get(el)||{};let record=previous[attr];
   if(!record||valueNow!==record.last&&valueNow!==record.source)record={source:valueNow,last:valueNow};
   const wanted=value(record.source,current.lang);
   if(wanted!==valueNow){record.last=wanted;el.setAttribute(attr,wanted);}
   previous[attr]=record;originalAttr.set(el,previous);
  }}
 }
 function scan(root){if(!root)return;applyKeyed(root);translateAttributes(root);
  if(root.nodeType===3){translateNode(root);return;}
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode()))translateNode(node);
 }
 function updateSwitches(){document.querySelectorAll('[data-yk-l12-switch]').forEach(el=>{
    const active=el.dataset.ykL12Switch===current.lang;el.setAttribute('aria-pressed',String(active));el.classList.toggle('active',active);
  });}
 function paint(){scan(document.body);updateSwitches();}
 function setLang(code,persist=false){if(!supported.includes(code))return;
  if(persist){try{localStorage.setItem('yk_lang',code)}catch{};if(document.documentElement.lang!==code)document.documentElement.lang=code;}
  const changed=current.lang!==code;current.lang=code;paint();
  if(changed)document.dispatchEvent(new CustomEvent('yk-ui-language-v78712',{detail:{lang:code}}));
 }
 const pending=new Set();let scheduled=false;
 function flush(){scheduled=false;const parts=[...pending];pending.clear();for(const n of parts)scan(n);updateSwitches();}
 function enqueue(n){pending.add(n);if(!scheduled){scheduled=true;requestAnimationFrame(flush);}}
 // No extra request, no server state or access change. Native language controls keep working.
 document.addEventListener('click',e=>{const target=e.target?.closest?.('[data-yk-l12-switch]');
  if(target){setLang(target.dataset.ykL12Switch,true);return;}
  const old=e.target?.closest?.('[data-yk-lang],[data-lang],.lang-switch button');
  if(old){const code=old.dataset.ykLang||old.dataset.lang||(old.textContent.includes('English')?'en':old.textContent.includes('日本語')?'ja':'my');
   if(supported.includes(code))requestAnimationFrame(()=>setLang(code));}
 });
 const observer=new MutationObserver(mutations=>{for(const m of mutations){
  if(m.type==='attributes'&&m.attributeName==='lang'&&m.target===document.documentElement){const code=document.documentElement.lang;
   if(supported.includes(code)&&code!==current.lang){setLang(code);}
  }else if(m.type==='characterData'){if(m.target.parentElement)enqueue(m.target);}
  else if(m.type==='childList')for(const n of m.addedNodes)enqueue(n);
 }});
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 window.YKUiLanguageV78712=Object.freeze({getLanguage:()=>current.lang,t:en=>value(String(en||''),current.lang),setLanguage:code=>setLang(code,true)});
 setLang(locale(),true);
})();
