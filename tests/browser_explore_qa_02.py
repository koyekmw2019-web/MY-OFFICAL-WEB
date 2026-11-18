"""Local synthetic QA only; this is NOT a live Netlify E2E test."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
guard=(root/'assets/yk88-jlpt-explore-rescue-v7880.js').read_text()
html='''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html {scroll-behavior:auto}body {margin:0;background:#09090b;color:white;font-family:sans-serif}
.yk82-top{position:sticky;top:0;height:72px;background:#171717;z-index:10}
.hero {height:760px;padding:18px}.yk82-main {min-height:1600px}
a{display:inline-block;background:#b22;color:white;padding:15px}#yk82Title{scroll-margin-top:160px}
</style></head><body class="yk82-page"><header class="yk82-top">STUDYING WITH YE KUN</header>
<div class="hero"><a class="yk821-button-secondary" href="#yk82Title">Explore Lessons</a></div>
<main class="yk82-main"><h2 id="yk82Title">JLPT N5 — Lessons</h2><a id="unrelated" href="#other">Another link</a><div style="height:1200px"></div><div id="other">OTHER</div></main>
<script>window.legacy=0;window.unrelated=0;document.addEventListener('click',e=>{
 const l=e.target.closest?.('.yk821-button-secondary[href="#yk82Title"]');
 if(l) {window.legacy++;e.preventDefault();window.scrollTo({top:20,left:0});}
},true); document.getElementById('unrelated').addEventListener('click',()=>window.unrelated++);</script></body></html>'''
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in (320,390,430,768,1200):
  page=browser.new_page(viewport={'width':width,'height':640},reduced_motion='reduce')
  errors=[]
  page.on('pageerror',lambda e: errors.append(str(e)))
  page.set_content(html)
  page.add_script_tag(content=guard)
  page.locator('a.yk821-button-secondary').click()
  page.wait_for_timeout(90)
  result=page.evaluate('''() => ({top:document.getElementById('yk82Title').getBoundingClientRect().top,
    offset:document.querySelector('.yk82-top').getBoundingClientRect().height+16,legacy:window.legacy,scrolled:scrollY})''')
  assert abs(result['top']-result['offset']) < 4, (width,result)
  assert result['legacy']==0, (width,result)
  assert result['scrolled']>300, (width,result)
  page.locator('#unrelated').click()
  assert page.evaluate('window.unrelated')==1
  assert not errors, (width,errors)
  print('PASS local synthetic browser',width,'px · target visible · legacy intercepted · unrelated link intact')
  page.close()
 browser.close()
