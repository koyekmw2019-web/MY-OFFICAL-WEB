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
        page=browser.new_page(viewport={'width':width,'height':820})
        page.set_content('''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#19161a"><main style="padding:12px 16px"><a class="yk821-hub-open" href="/study/jlpt-learning.html" style="display:block;color:#fff;background:#f04468;border-radius:20px">သင်ခန်းစာအားလုံး ဖွင့်ရန် ↗</a></main></body></html>''')
        page.add_style_tag(path=str(css))
        info=page.evaluate('''() => {const e=document.querySelector('a.yk821-hub-open'),s=getComputedStyle(e);return {justify:s.justifyContent,align:s.alignItems,weight:parseInt(s.fontWeight),font:parseFloat(s.fontSize),scrollW:document.documentElement.scrollWidth}}''')
        assert info['justify']=='center' and info['align']=='center' and info['weight']>=800 and info['font']>=17 and info['scrollW']<=width,info
        page.close()
        print('PASS HOME',width,'px: CTA centered, bigger and bold')
    browser.close()
print('PASS synthetic browser smoke: 15 responsive cases, click states, href retained')
