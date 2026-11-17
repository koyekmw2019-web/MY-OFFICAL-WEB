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
