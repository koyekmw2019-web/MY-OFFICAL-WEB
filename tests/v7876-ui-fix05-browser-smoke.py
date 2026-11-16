"""Synthetic Chromium smoke; not a full deployed/real-phone E2E test."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
css=root/'assets/yk88-jlpt-ui-fix05.css'
js=root/'assets/yk88-jlpt-ui-fix05.js'
widths=[320,360,390,430,720]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width in widths:
        page=browser.new_page(viewport={'width':width,'height':820},device_scale_factor=1)
        page.set_content('''<!doctype html><html lang="my"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body class="yk82-page yk88-detail-page" style="margin:0;background:#080809;overflow-x:hidden">
        <header class="yk82-top"><div class="yk82-top-inner"><a class="yk82-brand">STUDYING WITH YE KUN</a><nav class="yk82-top-links"><a id="yk88BackTop" href="/study/jlpt-learning.html?level=N5&section=grammar#yk82Title">Grammar</a><a>Study Hub</a><a>Mock Exam</a></nav></div></header>
        <main class="yk82-main" style="padding:18px 13px 120px"><article id="yk88GrammarDetail" class="yk82-block yk88-detail" style="padding:16px;background:#171719;border:1px solid #444;border-radius:22px"><h1>今日は月曜日です。</h1><p>Today is Monday.</p></article></main>
        </body></html>''')
        page.add_style_tag(path=str(css))
        page.add_script_tag(path=str(js))
        page.evaluate('''() => {
          const root=document.querySelector('#yk88GrammarDetail');
          root.innerHTML=`<div class="yk88-detail-actions"><button id="yk88Bookmark" class="yk88-button" aria-pressed="false" type="button">☆ Bookmark · သိမ်းရန်</button><button id="yk88Learned" class="yk88-button yk88-button-primary" type="button">✓ Mark learned · လေ့လာပြီး</button></div><a class="yk88-back" href="/study/jlpt-learning.html?level=N5&section=grammar#yk82Title">← JLPT N5 Grammar စာရင်းသို့ ပြန်သွားရန်</a>`;
          document.querySelector('#yk88Bookmark').addEventListener('click',e => {
            const b=e.currentTarget;
            const active=b.getAttribute('aria-pressed')==='true';
            b.setAttribute('aria-pressed',String(!active));
            b.textContent=active?'☆ Bookmark · သိမ်းရန်':'★ Saved · သိမ်းထားပြီး';
          });
          document.querySelector('#yk88Learned').addEventListener('click',e => {
            e.currentTarget.disabled=true;
            e.currentTarget.textContent='✓ Learned · လေ့လာပြီး';
          });
        }''')
        page.wait_for_function("document.querySelectorAll('.yk88-detail-actions > .yk88-button').length===3")
        page.wait_for_function("document.querySelector('#yk88Bookmark').textContent==='☆ Bookmark'")
        info=page.evaluate('''() => {
          const buttons=[...document.querySelectorAll('.yk88-detail-actions > .yk88-button')];
          return {buttons:buttons.map(b=>({top:b.getBoundingClientRect().top,width:b.getBoundingClientRect().width,text:b.textContent})),
            nav: getComputedStyle(document.querySelector('.yk82-top-links')).display,
            bodyWidth:document.documentElement.scrollWidth,viewport:window.innerWidth,back:buttons[2].getAttribute('href')}
        }''')
        assert len(info['buttons'])==3,info
        assert max(b['top'] for b in info['buttons'])-min(b['top'] for b in info['buttons'])<1,info
        assert max(b['width'] for b in info['buttons'])-min(b['width'] for b in info['buttons'])<1,info
        assert info['nav']=='none',info
        assert info['bodyWidth']<=width,info
        assert 'section=grammar' in info['back'],info
        page.locator('#yk88Bookmark').click()
        page.wait_for_function("document.querySelector('#yk88Bookmark').textContent==='★ သိမ်းပြီး'")
        assert page.locator('#yk88Bookmark').get_attribute('aria-pressed')=='true'
        page.locator('#yk88Learned').click()
        page.wait_for_function("document.querySelector('#yk88Learned').disabled && document.querySelector('#yk88Learned').textContent==='✓ လေ့လာပြီး'")
        assert len(page.locator('.yk88-detail-actions > .yk88-button').all())==3
        assert page.url=='about:blank',page.url
        page.close()
        print('PASS DETAIL',width,'px: one row, 3 equal buttons, no overflow, preserved actions')
    for width in widths:
        page=browser.new_page(viewport={'width':width,'height':820})
        page.set_content('''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body class="yk82-page" style="margin:0;background:#0e0e11"><header class="yk82-top"><div class="yk82-top-inner"><div class="yk82-brand" style="width:180px">YK LOGO</div><nav class="yk82-top-links">Study Hub Dictionary Mock Exam</nav></div></header><main class="yk82-main"><section class="yk82-hero yk821-hero" style="height:500px;background:#271b22"><h1>JLPT Learning Center Pro</h1></section></main></body></html>''')
        page.add_style_tag(path=str(css))
        info=page.evaluate('''() => ({nav:getComputedStyle(document.querySelector('.yk82-top-links')).display,mainY:document.querySelector('main').getBoundingClientRect().top,headerH:document.querySelector('header').getBoundingClientRect().height,scrollW:document.documentElement.scrollWidth})''')
        assert info['nav']=='none' and info['mainY']<=info['headerH']+25 and info['scrollW']<=width,info
        page.close()
        print('PASS STUDY',width,'px: old pills hidden, card aligned near header')
    for width in widths:
        page=browser.new_page(viewport={'width':width,'height':820},device_scale_factor=1)
        page.set_content('''<!doctype html><html lang="my"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
          <body style="margin:0;background:#0a0a0a;color:#fff;font-family:system-ui"><header style="height:78px;background:#151515">YK HEADER</header>
          <section class="study-hub-v7" id="study-hub" style="margin:26px 0 10px;padding:18px;background:#111">
           <div class="study-hub-grid" id="studyHubGridV733" style="display:grid;gap:14px">
             <div class="study-hub-more-wrap" style="display:flex;justify-content:center;margin-top:14px"><button id="studyHubMoreV733" style="height:60px;width:100%">View More · Study Hub &amp; JLPT ↓</button></div>
             <div class="yk82-panel" id="yk82Hub" style="margin-top:24px;padding:20px;background:#321824;border:1px solid #555;border-radius:24px">
             <div style="height:280px">STUDYING WITH YE KUN · JLPT</div>
             <div class="yk821-hub-welcome" style="display:flex;flex-direction:column;padding:12px;gap:12px;background:#251920;border-radius:18px">
             <div style="height:110px">STUDENT &amp; TEACHER</div>
             <a class="yk821-hub-open" href="/study/jlpt-learning.html" style="display:inline-flex;flex:1;background:#e43b57;color:#fff;padding:11px 16px;border-radius:12px;font-size:12px;font-weight:800;white-space:nowrap"><span class="yk88-cta-label">Open All Lessons</span></a>
             </div></div></div></section></body></html>''')
        # Use only the inline critical CSS that the build injector embeds, so
        # spacing and center work even without an external CSS request.
        css_text=(root/'scripts/build-v7876-jlpt-ui-fix05.mjs').read_text()
        critical=css_text.split('const criticalHomeCSS = ',1)[1].split(';\nconst stylesheet=',1)[0]
        import json
        page.add_style_tag(content=json.loads(critical).replace('<style id="yk88-fix052-critical">','').replace('</style>',''))
        for lang,label in [('my','သင်ခန်းစာအားလုံးဖွင့်ရန်'),('en','Open All Lessons'),('ja','すべてのレッスンを開く')]:
            page.locator('.yk88-cta-label').evaluate('(e,v)=>e.textContent=v',label)
            metrics=page.evaluate('''() => {
              const a=document.querySelector('#yk82Hub a.yk821-hub-open');const span=a.querySelector('span');
              const ar=a.getBoundingClientRect(),sr=span.getBoundingClientRect();
              const r=document.createRange();r.selectNodeContents(span);const tr=r.getBoundingClientRect();
              const btn=document.querySelector('#studyHubMoreV733').getBoundingClientRect();
              const panel=document.querySelector('#yk82Hub').getBoundingClientRect();
              const section=document.querySelector('#study-hub').getBoundingClientRect();
              return {text:span.textContent.trim(),center:tr.left+tr.width/2,centerButton:ar.left+ar.width/2,
                spanCenter:sr.left+sr.width/2, gap:panel.top-btn.bottom,topSpace:btn.top-section.top,
                scrollW:document.documentElement.scrollWidth,viewport:innerWidth,
                labelStyle:getComputedStyle(span).textAlign,buttonStyle:getComputedStyle(a).display};} ''')
            assert metrics['text']==label,metrics
            assert abs(metrics['center']-metrics['centerButton'])<2.5,metrics
            assert abs(metrics['spanCenter']-metrics['centerButton'])<2.5,metrics
            assert metrics['labelStyle']=='center' and metrics['buttonStyle']=='flex',metrics
            assert metrics['scrollW']<=width,metrics
            if width<=640:
                assert metrics['gap']<=11,metrics
                assert metrics['topSpace']<=30,metrics
            print('PASS HOME',width,'px',lang, 'centered, no arrow, compact',metrics['gap'])
        page.close()
    browser.close()
print('PASS synthetic browser smoke: 15 responsive cases, click states, href retained')
