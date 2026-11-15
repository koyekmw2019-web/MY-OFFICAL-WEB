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
        fetch('/assets/jlpt-learning-v782-content.json'),
        fetch('/assets/yk88-grammar-details.json')
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
          <h2 id="yk88ExplainTitle">Grammar Pattern · 文型</h2>
          <p class="yk88-formation" lang="ja">${safe(more.formation)}</p>
          <p lang="my">${safe(more.explanationMy)}</p>
          <p lang="en">${safe(more.explanationEn)}</p>
          <p class="yk88-note">💡 ${safe(item.note)}</p>
        </section>
        <section class="yk88-examples" aria-label="Trilingual grammar example sentences">
          <h2>例文 · ဥပမာဝါကျများ · Examples (${examples.length})</h2>
          ${examples.map((e,i) => `<div class="yk88-example"><span class="yk88-example-count">例文 ${i+1}</span><p lang="ja" class="yk88-ja">${markSentence(e.ja,e.focus)}</p><p lang="my"><span class="yk88-lang-tag">MY</span>${safe(e.my)}</p><p lang="en"><span class="yk88-lang-tag">EN</span>${safe(e.en)}</p></div>`).join('')}
          <p class="yk88-mark-help">အနီရောင် မျဉ်းသားထားတဲ့ စာသားက လေ့လာနေတဲ့ Grammar Pattern ပါ။</p>
        </section>
        <div class="yk88-detail-actions"><button type="button" id="yk88Bookmark" class="yk88-button"></button><button type="button" id="yk88Learned" class="yk88-button yk88-button-primary"></button></div>
        <a class="yk88-back" href="${back}">← JLPT ${safe(level)} Grammar စာရင်းသို့ ပြန်သွားရန်</a>`;
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
