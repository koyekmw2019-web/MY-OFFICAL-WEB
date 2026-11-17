"""Real Chromium rendering of the isolated furigana/underline snippet, not whole site."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
readings=json.loads((ROOT/'assets/yk-grammar-v7877-furigana-map.json').read_text())
fragment=(ROOT/'scripts/yk-v7879-ruby-renderer.fragment.js').read_text()
css=(ROOT/'assets/yk-grammar-v7877.css').read_text()
html=f'''<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*,*:before,*:after{{box-sizing:border-box}}body{{margin:0;padding:15px;background:#090909;color:white;font:16px/1.8 system-ui,sans-serif}} .yk88-detail{{max-width:720px;margin:auto}}.yk88-example{{background:#141318;border:1px solid #4a3b45;border-radius:18px;padding:18px;margin-bottom:12px}}.yk88-example p.yk88-ja{{font-size:clamp(19px,3.5vw,25px);line-height:2.1;overflow-wrap:break-word;margin:10px 0}}{css}</style></head><body><main id="root" class="yk88-detail" data-furigana="on"><button type="button" id="toggle">ふりがな ON</button><div id="examples"></div></main></body></html>'''
samples=[('あと十分だけ待ってください。','十分'),('バスは十分おきに来ます。','十分'),('二十分も歩きました。','二十分'),('会議を行う。','行う'),('その話を聞きました。','話を'),('彼は大人です。','大人'),('一言謝って済む問題ではありません。','謝って済む')]
script='const YK7877_READINGS='+json.dumps(sorted(readings.items(),key=lambda x:-len(x[0])),ensure_ascii=False)+';const safe=x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;");\n'+fragment+'\nwindow.renderSentence=markSentenceWithRuby;void 0;'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 try:
  cases=0
  for width in [320,390,720]:
   page=browser.new_page(viewport={'width':width,'height':740}, device_scale_factor=1)
   page.set_content(html)
   page.evaluate(script)
   page.evaluate('items => document.querySelector("#examples").innerHTML=items.map(item=>`<div class="yk88-example"><p class="yk88-ja">${window.renderSentence({ja:item[0],focus:item[1]})}</p></div>`).join("")',samples)
   count=page.locator('mark.yk88-pattern-mark').count()
   assert count==len(samples),(width,count)
   assert page.locator('rt').count()>=len(samples),(width,'no ruby')
   for i in range(count):
    color=page.locator('mark').nth(i).evaluate('el=>getComputedStyle(el).textDecorationColor')
    assert color=='rgb(238, 71, 107)',(width,color)
   no_overflow=page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
   assert no_overflow,(width,'overflow')
   page.locator('#root').evaluate('el=>el.dataset.furigana="off"')
   assert page.locator('rt').first.evaluate('el=>getComputedStyle(el).display')=='none',(width,'ruby-off failed')
   page.locator('#root').evaluate('el=>el.dataset.furigana="on"')
   assert page.locator('rt').first.evaluate('el=>getComputedStyle(el).display')!='none',(width,'ruby-on failed')
   if width==390:
    page.screenshot(path=str(ROOT/'QA_RUBY_390.png'),full_page=True)
   cases+=1
   page.close()
  print('PASS isolated Chromium ruby & underline smoke: 3 widths × 7 sentences; 21 examples, 3 toggles (NOT full site).')
 finally: browser.close()
