/** QA: Dedicated JLPT grammar detail view. No exam/payment/backend changes. */
(() => {
  'use strict';
  const root = document.getElementById('yk88GrammarDetail');
  const state = window.YKJLPTStateV782;
  if (!root || !state) return;
  const params = new URLSearchParams(location.search);
  const level = /^N[1-5]$/.test(params.get('level') || '') ? params.get('level') : 'N5';
  const id = params.get('id') || '';
  const back = `/study/jlpt-learning.html?level=${encodeURIComponent(level)}&section=grammar#yk82Title`;
  document.getElementById('yk88BackTop').href = back;
  const safe = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function markSentence(sentence, target) {
    const text = String(sentence || ''), t = String(target || '');
    const pos = t ? text.indexOf(t) : -1;
    if (pos < 0) return safe(text);
    return safe(text.slice(0,pos)) + `<mark class="yk88-pattern-mark">${safe(t)}</mark>` + safe(text.slice(pos+t.length));
  }

  // v7.87.7: Manual reading dictionary; no guess-based readings or external API.
  const YK7877_READINGS=[["話し合った","はなしあった"],["運動不足","うんどうぶそく"],["天気予報","てんきよほう"],["一生懸命","いっしょうけんめい"],["個人情報","こじんじょうほう"],["経験豊富","けいけんほうふ"],["黒ずくめ","くろずくめ"],["赤ちゃん","あかちゃん"],["日本語","にほんご"],["新しい","あたらしい"],["朝ご飯","あさごはん"],["昼ご飯","ひるごはん"],["晩ご飯","ばんごはん"],["夏休み","なつやすみ"],["誕生日","たんじょうび"],["一日中","いちにちじゅう"],["一時間","いちじかん"],["日本人","にほんじん"],["授業中","じゅぎょうちゅう"],["話し合","はなしあ"],["大きい","おおきい"],["小さい","ちいさい"],["教科書","きょうかしょ"],["説明書","せつめいしょ"],["図書館","としょかん"],["郵便局","ゆうびんきょく"],["買い物","かいもの"],["説明文","せつめいぶん"],["寝不足","ねぶそく"],["運動量","うんどうりょう"],["引っ越","ひっこ"],["働き続","はたらきつづ"],["考え方","かんがえかた"],["一度も","いちども"],["生活費","せいかつひ"],["延長戦","えんちょうせん"],["食べ物","たべもの"],["読み方","よみかた"],["作り方","つくりかた"],["行き方","いきかた"],["三年間","さんねんかん"],["大丈夫","だいじょうぶ"],["金曜日","きんようび"],["三時間","さんじかん"],["二十分","にじゅっぷん"],["話し方","はなしかた"],["水曜日","すいようび"],["大学生","だいがくせい"],["日本","にほん"],["毎日","まいにち"],["毎朝","まいあさ"],["毎晩","まいばん"],["勉強","べんきょう"],["仕事","しごと"],["友達","ともだち"],["友人","ゆうじん"],["今日","きょう"],["昨日","きのう"],["明日","あした"],["今月","こんげつ"],["来月","らいげつ"],["来年","らいねん"],["去年","きょねん"],["読者","どくしゃ"],["食事","しょくじ"],["朝食","ちょうしょく"],["夕食","ゆうしょく"],["休日","きゅうじつ"],["休み","やすみ"],["高い","たかい"],["安い","やすい"],["寒い","さむい"],["暑い","あつい"],["大雨","おおあめ"],["歯磨","はみが"],["歯を","はを"],["毎週","まいしゅう"],["週末","しゅうまつ"],["行事","ぎょうじ"],["帰国","きこく"],["来日","らいにち"],["京都","きょうと"],["東京","とうきょう"],["大阪","おおさか"],["文化","ぶんか"],["映画","えいが"],["時計","とけい"],["果物","くだもの"],["中止","ちゅうし"],["一日","いちにち"],["千円","せんえん"],["時間","じかん"],["写真","しゃしん"],["授業","じゅぎょう"],["電話","でんわ"],["会議","かいぎ"],["言葉","ことば"],["試験","しけん"],["復習","ふくしゅう"],["電気","でんき"],["学校","がっこう"],["先生","せんせい"],["学生","がくせい"],["家族","かぞく"],["料理","りょうり"],["電車","でんしゃ"],["遅刻","ちこく"],["病院","びょういん"],["簡単","かんたん"],["間違","まちが"],["財布","さいふ"],["一度","いちど"],["夜遅","よるおそ"],["食べ","たべ"],["長い","ながい"],["毎年","まいとし"],["新聞","しんぶん"],["資料","しりょう"],["説明","せつめい"],["図書","としょ"],["部屋","へや"],["見学","けんがく"],["新年","しんねん"],["参加","さんか"],["最初","さいしょ"],["最後","さいご"],["約束","やくそく"],["必要","ひつよう"],["十分","じゅうぶん"],["練習","れんしゅう"],["発音","はつおん"],["日記","にっき"],["計画","けいかく"],["変更","へんこう"],["修正","しゅうせい"],["予定","よてい"],["結果","けっか"],["検査","けんさ"],["問題","もんだい"],["準備","じゅんび"],["返事","へんじ"],["興味","きょうみ"],["紹介","しょうかい"],["旅行","りょこう"],["理由","りゆう"],["事故","じこ"],["道路","どうろ"],["運転","うんてん"],["強風","きょうふう"],["急ぐ","いそぐ"],["心配","しんぱい"],["今度","こんど"],["成功","せいこう"],["失敗","しっぱい"],["努力","どりょく"],["近道","ちかみち"],["集中","しゅうちゅう"],["不足","ふそく"],["運動","うんどう"],["話題","わだい"],["発言","はつげん"],["誤解","ごかい"],["彼女","かのじょ"],["自分","じぶん"],["天気","てんき"],["予報","よほう"],["何度","なんど"],["相談","そうだん"],["報告","ほうこく"],["挨拶","あいさつ"],["お礼","おれい"],["近況","きんきょう"],["引越","ひっこ"],["変化","へんか"],["活動","かつどう"],["研究","けんきゅう"],["記事","きじ"],["育児","いくじ"],["資格","しかく"],["社会","しゃかい"],["会社","かいしゃ"],["就職","しゅうしょく"],["卒業","そつぎょう"],["単語","たんご"],["漢字","かんじ"],["意味","いみ"],["図面","ずめん"],["通学","つうがく"],["状況","じょうきょう"],["希望","きぼう"],["国籍","こくせき"],["経験","けいけん"],["有無","うむ"],["応募","おうぼ"],["年齢","ねんれい"],["選択","せんたく"],["条件","じょうけん"],["承諾","しょうだく"],["情報","じょうほう"],["一方","いっぽう"],["都会","とかい"],["便利","べんり"],["連絡","れんらく"],["訂正","ていせい"],["修理","しゅうり"],["自然","しぜん"],["豊富","ほうふ"],["人気","にんき"],["支援","しえん"],["地域","ちいき"],["仲間","なかま"],["契約","けいやく"],["交渉","こうしょう"],["天候","てんこう"],["延期","えんき"],["判断","はんだん"],["成績","せいせき"],["確認","かくにん"],["手続","てつづ"],["職人","しょくにん"],["技術","ぎじゅつ"],["感動","かんどう"],["景色","けしき"],["祭り","まつり"],["服装","ふくそう"],["全員","ぜんいん"],["一緒","いっしょ"],["試合","しあい"],["停電","ていでん"],["結局","けっきょく"],["本当","ほんとう"],["名前","なまえ"],["結婚","けっこん"],["生活","せいかつ"],["社長","しゃちょう"],["歴史","れきし"],["機会","きかい"],["読書","どくしょ"],["見直","みなお"],["感謝","かんしゃ"],["荷物","にもつ"],["宿題","しゅくだい"],["三冊","さんさつ"],["頑張","がんば"],["合格","ごうかく"],["最中","さいちゅう"],["大切","たいせつ"],["質問","しつもん"],["教室","きょうしつ"],["来週","らいしゅう"],["音楽","おんがく"],["面白","おもしろ"],["上手","じょうず"],["親切","しんせつ"],["曜日","ようび"],["掃除","そうじ"],["全部","ぜんぶ"],["夕方","ゆうがた"],["午後","ごご"],["切符","きっぷ"],["場合","ばあい"],["健康","けんこう"],["書類","しょるい"],["種類","しゅるい"],["着く","つく"],["上着","うわぎ"],["台所","だいどころ"],["一斉","いっせい"],["学ぶ","まなぶ"],["外出","がいしゅつ"],["風邪","かぜ"],["予約","よやく"],["無理","むり"],["提出","ていしゅつ"],["七時","しちじ"],["元気","げんき"],["野菜","やさい"],["笑顔","えがお"],["留学","りゅうがく"],["夜型","よるがた"],["最近","さいきん"],["値段","ねだん"],["今","いま"],["本","ほん"],["読","よ"],["食","た"],["朝","あさ"],["夜","よる"],["日","ひ"],["夏","なつ"],["冬","ふゆ"],["春","はる"],["秋","あき"],["店","みせ"],["雨","あめ"],["川","かわ"],["手","て"],["歯","は"],["家","いえ"],["行","い"],["来","き"],["帰","かえ"],["水","みず"],["中","なか"],["撮","と"],["使","つか"],["泳","およ"],["窓","まど"],["開","あ"],["見","み"],["会","あ"],["座","すわ"],["言","い"],["話","はな"],["週","しゅう"],["出","で"],["消","け"],["書","か"],["待","ま"],["母","はは"],["父","ちち"],["皿","さら"],["並","なら"],["駅","えき"],["乗","の"],["遅","おく"],["間","あいだ"],["熱","ねつ"],["休","やす"],["静","しず"],["難","むずか"],["答","こた"],["作","つく"],["飲","の"],["長","なが"],["買","か"],["守","まも"],["早","はや"],["速","はや"],["教","おし"],["道","みち"],["強","つよ"],["急","いそ"],["覚","おぼ"],["忘","わす"],["抜","ぬ"],["彼","かれ"],["私","わたし"],["友","とも"],["迷","まよ"],["住","す"],["始","はじ"],["止","と"],["働","はたら"],["調","しら"],["探","さが"],["鍵","かぎ"],["変","か"],["考","かんが"],["立","た"],["図","ず"],["時","とき"],["誰","だれ"],["選","えら"],["続","つづ"],["祭","まつ"],["黒","くろ"],["暮","く"],["喜","よろこ"],["声","こえ"],["減","へ"],["増","ふ"],["寝","ね"],["高","たか"],["寒","さむ"],["好","す"],["欲","ほ"],["降","ふ"],["洗","あら"],["遊","あそ"],["前","まえ"],["歩","ある"],["知","し"],["大","おお"],["起","お"],["甘","あま"],["物","もの"],["持","も"],["忙","いそが"],["受","う"],["終","お"],["鳴","な"],["組","く"],["分","わ"],["寂","さび"],["方","かた"],["思","おも"],["紙","かみ"],["昼","ひる"],["切","き"],["役","やく"],["晴","は"],["楽","たの"],["国","くに"],["暇","ひま"],["子","こ"],["傘","かさ"],["外","そと"],["走","はし"],["聞","き"],["薬","くすり"],["暖","あたた"],["涼","すず"],["少","すこ"],["閉","し"],["赤","あか"],["安","やす"],["音","おと"],["伝","つた"],["明","あか"],["入","はい"],["泣","な"],["鳥","とり"],["着","き"],["借","か"],["茶","ちゃ"],["花","はな"],["夢","ゆめ"],["雪","ゆき"],["人","ひと"],["多","おお"],["決","き"],["匂","にお"],["味","あじ"],["広","ひろ"],["気","き"],["落","お"],["飛","と"],["通","とお"],["何","なに"],["壁","かべ"],["机","つくえ"],["上","うえ"],["置","お"],["空","そら"],["暗","くら"],["混","こ"],["次","つぎ"],["押","お"],["咲","さ"],["右","みぎ"],["曲","ま"],["所","ところ"],["靴","くつ"],["履","は"],["字","じ"],["習","なら"],["困","こま"],["猫","ねこ"],["事","こと"],["千","せん"],["白","しろ"],["歌","うた"],["兄","あに"],["町","まち"],["頼","たの"],["小","ちい"],["全","ぜん"],["部","ぶ"],["再","さい"],["一","いち"],["金","きん"],["七","しち"],["三","さん"],["二","に"],["年","ねん"]];
  // v7.87.9 QA reading hardening. Conservative: unknown readings remain plain kanji.
  // Preserve the existing furigana toggle and crimson grammar underline.
  const YK7879_OVERRIDES = Object.entries({
    '一人':'ひとり','二人':'ふたり','三人':'さんにん','大人':'おとな',
    '今年':'ことし','今夜':'こんや','今週':'こんしゅう','来週':'らいしゅう',
    '何時':'なんじ','日曜日':'にちようび','月曜日':'げつようび',
    '一万円':'いちまんえん','一週間':'いっしゅうかん','二十歳':'はたち',
    '出発':'しゅっぱつ','大切':'たいせつ','大変':'たいへん',
    '三十分':'さんじゅっぷん','二十分':'にじゅっぷん',
    '指定':'してい','場所':'ばしょ','安心':'あんしん','泥':'どろ',
    '方法':'ほうほう','一番':'いちばん','星空':'ほしぞら',
    '制度':'せいど','海外':'かいがい','利用':'りよう',
    '会場':'かいじょう','百人':'ひゃくにん','雲':'くも',
    '綿':'わた','湖':'みずうみ','鏡':'かがみ','初心者':'しょしんしゃ',
    '動画':'どうが','公開':'こうかい','責任':'せきにん','途中':'とちゅう',
    '行動':'こうどう','願':'ねが','捨':'す','眠':'ねむ','疲':'つか',
    '反':'はん','悪':'わる','星':'ほし','込':'こ'
  });
  const YK7879_READINGS = [...YK7879_OVERRIDES,...YK7877_READINGS]
    .sort((a,b)=>b[0].length-a[0].length);
  const YK7879_IS_HAN = c => !!c && /[\u3400-\u9fff]/u.test(c);
  function yk7879ResolveReading(token,text,start,defaultReading){
    if(token==='十分'){
      const after=text.slice(start+2);
      const before=text.slice(Math.max(0,start-4),start);
      if(/^(?:おき|だけ|も|間|以内|以上|以下|ほど|ぐらい|待)/u.test(after) || /あと$/u.test(before))return 'じっぷん';
      if(/^(?:に|な|あり|では|以上の)/u.test(after))return 'じゅうぶん';
      return null; // The Kanji alone is ambiguous: never guess in an unknown context.
    }
    if(token.length===1 && YK7879_IS_HAN(token)){
      if(YK7879_IS_HAN(text[start-1])||YK7879_IS_HAN(text[start+1]))return null;
      const tail=text.slice(start);
      if(token==='行'){
        if(/^行(?:う|わ|い|え)/u.test(tail))return 'おこな';
        if(/^行(?:く|き|け|っ|か|こ)/u.test(tail))return 'い';
        return null;
      }
      if(token==='出'){
        if(/^出(?:す|し|さ|せ)/u.test(tail))return 'だ';
        if(/^出(?:る|て|ら|かけ|た)/u.test(tail))return 'で';
        return null;
      }
      if(token==='入'){
        if(/^入(?:れ|れた)/u.test(tail))return 'い';
        if(/^入(?:る|り|った)/u.test(tail))return 'はい';
        return null;
      }
      if(token==='着'){
        if(/^着(?:く|き|い|か)/u.test(tail))return 'つ';
        if(/^着(?:る|た|て|な)/u.test(tail))return 'き';
        return null;
      }
      if(token==='上'){
        if(/^上(?:が|げ)/u.test(tail))return 'あ';
        if(/^上(?:に|で|を|へ|は)/u.test(tail))return 'うえ';
        return null;
      }
      if(token==='変'){
        if(/^変(?:わ|え)/u.test(tail))return 'か';
        if(/^変(?:な|だ|です)/u.test(tail))return 'へん';
        return null;
      }
      if(token==='話'){
        if(/^話(?:す|し|せ|さ)/u.test(tail))return 'はな';
        if(/^話(?:は|が|を|の|に|で|だ|です|ばかり)/u.test(tail))return 'はなし';
        return null;
      }
      if(token==='方'){
        if(/^方がいい/u.test(tail))return 'ほう';
        return null; // 方 can be かた or ほう; show only unambiguous cases.
      }
      if(token==='開' && /^開(?:く|き|かれる)/u.test(tail))return null; // あく／ひらく
      if(token==='空' && /^空(?:く|いて|いた)/u.test(tail))return null; // そら／あく
    }
    return defaultReading;
  }
  function markSentenceWithRuby(e){
    const source=String(e.ja||''),focus=String(e.focus||'');
    function rubyText(text,originalOffset){
      let html='',i=0;
      while(i<text.length){
        const hit=YK7879_READINGS.find(([base])=>text.startsWith(base,i));
        if(!hit){html+=safe(text[i]);i++;continue;}
        const reading=yk7879ResolveReading(hit[0],source,originalOffset+i,hit[1]);
        if(!reading){html+=safe(text[i]);i++;continue;}
        html+='<ruby>'+safe(hit[0])+'<rt>'+safe(reading)+'</rt></ruby>';
        i+=hit[0].length;
      }
      return html;
    }
    if(!focus || !source.includes(focus))return rubyText(source,0);
    let result='',cursor=0;
    while(cursor<source.length){
      const pos=source.indexOf(focus,cursor);
      if(pos<0){result+=rubyText(source.slice(cursor),cursor);break;}
      result+=rubyText(source.slice(cursor,pos),cursor);
      result+='<mark class="yk88-pattern-mark">'+rubyText(focus,pos)+'</mark>';
      cursor=pos+focus.length;
    }
    return result;
  }

  function initFurigana(){
    const btn=root.querySelector('#yk7877Furigana');if(!btn)return;
    const key='yk_jlpt_furigana_v7877_'+level;
    let setting=level==='N5'||level==='N4'||level==='N3'?'on':'off';
    try{const saved=localStorage.getItem(key);if(saved==='on'||saved==='off')setting=saved;}catch{}
    function apply(){root.dataset.furigana=setting;btn.textContent=setting==='on'?'ふりがな ON':'ふりがな OFF';btn.title='読み方を確認できる漢字だけに表示します。';btn.setAttribute('aria-pressed',String(setting==='on'));}
    btn.addEventListener('click',()=>{setting=setting==='on'?'off':'on';try{localStorage.setItem(key,setting)}catch{}apply();});
    apply();
  }

  const error = message => {root.innerHTML = `<h1>Grammar Lesson</h1><p>${safe(message)}</p><a class="yk88-button" href="${back}">← Grammar စာရင်းသို့ ပြန်သွားရန်</a>`};
  const actionLabel = () => {
    const saved = root.querySelector('#yk88Bookmark'), learned = root.querySelector('#yk88Learned');
    if (saved) {saved.textContent = state.isSaved(id) ? '★ Saved · သိမ်းထားပြီး' : '☆ Bookmark · သိမ်းရန်';saved.setAttribute('aria-pressed', String(state.isSaved(id)))}
    if (learned) {learned.textContent = state.isDone(id) ? '✓ Learned · လေ့လာပြီး' : '✓ Mark learned · လေ့လာပြီး';learned.disabled = state.isDone(id)}
  };
  async function load() {
    if (!/^N[1-5]-g-\d+$/.test(id) || !id.startsWith(level + '-')) {error('သင်ခန်းစာ Link မမှန်ပါ။');return}
    try {
      const [r1,r2] = await Promise.all([
        fetch('/assets/jlpt-learning-v782-content.json?v=7880rc1audited'),
        fetch('/assets/yk88-grammar-details.json?v=7880rc1audited')
      ]);
      if (!r1.ok || !r2.ok) throw Error('Lesson content loading failed');
      const content = await r1.json();
      const extras = await r2.json();
      const item = content.levels?.[level]?.grammar?.find(x => x.id === id);
      const more = extras.items?.[id];
      if (!item || !more || !Array.isArray(more.more) || more.more.length < 2) {error('ဒီသင်ခန်းစာအတွက် ရှင်းလင်းချက် မရနိုင်သေးပါ။');return}
      const examples = [{ja:item.example,my:item.exampleMy,en:more.originalEnglish,focus:more.originalFocus},...more.more];
      if (!examples.every(e => e.ja && e.my && e.en && e.focus && e.ja.includes(e.focus))) {error('Example data ကို ထပ်စစ်ဖို့လိုပါတယ်။');return}
      document.title = `JLPT ${level} ${item.title} | STUDYING WITH YE KUN`;
      root.innerHTML = `
        <span class="yk82-eyebrow">STUDYING WITH YE KUN · JLPT ${safe(level)} · GRAMMAR</span>
        <h1 lang="ja">${safe(item.title)}</h1>
        <p class="yk88-meaning">${safe(item.meaning)}</p>
        <section class="yk88-explanation" aria-labelledby="yk88ExplainTitle">
          <div class="yk7877-detail-head"><h2 id="yk88ExplainTitle">Grammar Pattern · 文型</h2><button type="button" id="yk7877Furigana" class="yk7877-furigana" aria-pressed="false">ふりがな</button></div>
          <p class="yk88-formation" lang="ja">${safe(more.formation)}</p>${more.explanationJa?`<p lang="ja" class="yk7877-explain-ja">${safe(more.explanationJa)}</p>`:""}
          <p lang="my">${safe(more.explanationMy)}</p>
          <p lang="en">${safe(more.explanationEn)}</p>
          <p class="yk88-note">💡 ${safe(item.note)}</p>
        </section>
        <section class="yk88-examples" aria-label="Trilingual grammar example sentences">
          <h2>例文 · ဥပမာဝါကျများ · Examples (${examples.length})</h2>
          ${examples.map((e,i) => `<div class="yk88-example"><span class="yk88-example-count">例文 ${i+1}</span><p lang="ja" class="yk88-ja">${markSentenceWithRuby(e)}</p><p lang="my" class="yk88-example-my">${safe(e.my)}</p><p lang="en" class="yk88-example-en">${safe(e.en)}</p></div>`).join('')}
          <p class="yk88-mark-help">အနီရောင် မျဉ်းသားထားတဲ့ စာသားက လေ့လာနေတဲ့ Grammar Pattern ပါ။</p>
        </section>
        <div class="yk88-detail-actions"><button type="button" id="yk88Bookmark" class="yk88-button"></button><button type="button" id="yk88Learned" class="yk88-button yk88-button-primary"></button></div>
        <a class="yk88-back" href="${back}">← JLPT ${safe(level)} Grammar စာရင်းသို့ ပြန်သွားရန်</a>`;
      initFurigana();
      await state.init();
      state.setLevel(level);
      actionLabel();
      root.querySelector('#yk88Bookmark').addEventListener('click', () => {state.toggleSaved(id);actionLabel()});
      root.querySelector('#yk88Learned').addEventListener('click', () => {state.markDone(id);actionLabel()});
      state.subscribe(actionLabel);
      window.addEventListener('yk-identity-ready', () => void state.init());
    } catch(err) {console.warn('Grammar detail unavailable',err);error('Network ပြဿနာကြောင့် Grammar Lesson မဖွင့်နိုင်ပါ။ Reload လုပ်ပြီး ထပ်စမ်းပါ။')}
  }
  void load();
})();
