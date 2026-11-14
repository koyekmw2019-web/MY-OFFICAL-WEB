"""Local headless Chromium UI smoke; no network, secrets or production data."""
from pathlib import Path
from playwright.sync_api import sync_playwright
script=Path(__file__).parents[1].joinpath('assets/yk-v7875-rc1-ui.js').read_text()
css=Path(__file__).parents[1].joinpath('assets/yk-v7875-rc1-ui.css').read_text()
base_css='''<style>
body { margin:0; padding-top:80px; background:#111; color:white }
.top {position:fixed;top:0;height:80px;background:#111;width:100%;z-index:4}
.wrap {padding-top:40px}
.hero {padding-top:40px}
.hero-card {height:120px;background:#333;border:1px solid #555}
#online-mock-exam{margin-top:50px;padding-top:30px;}
.site-menu {display:block}.site-menu-nav>a{display:flex;padding:20px;background:#111;color:#fff;border:1px solid #333}
</style>'''
def html(page):
 content = '<section class="hero" id="home"><div class="hero-card">YE KUN</div></section>' if page=='home' else '<section id="online-mock-exam" class="section reveal"><div class="kicker">ONLINE EXAM CENTER</div><div id="examPanel"></div></section>'
 cls=' class="yk787-exam-page"' if page=='exam' else ''
 return f'''<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">{base_css}</head>
 <body{cls}><div class="top">Navigation</div><div class="wrap">{content}</div>
 <nav class="site-menu"><div class="site-menu-nav"><a class="yk864-menu-link yk864-menu-jlpt" id="ykMenuJLPTV7864" href="#yk82Hub"><span class="yk864-menu-icon">JLPT</span></a></div></nav><div id="yk82Hub"></div>
 <script>document.querySelector('#ykMenuJLPTV7864').addEventListener('click',()=>{{window.__originalClick=(window.__originalClick||0)+1;}});</script>
 </body></html>'''
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--no-first-run','--disable-gpu'])
 for width in [360,390,430,720,721]:
  for kind in ['home','exam']:
   context=browser.new_context(viewport={'width':width,'height':844},has_touch=True,is_mobile=True,reduced_motion='no-preference')
   page=context.new_page();page.set_content(html(kind),wait_until='domcontentloaded');page.add_style_tag(content=css);page.add_script_tag(content=script)
   page.wait_for_timeout(70)
   selector='.hero-card' if kind=='home' else '#online-mock-exam .kicker'
   data=page.evaluate('''selector=>({header:document.querySelector('.top').getBoundingClientRect().bottom,
   content:document.querySelector(selector).getBoundingClientRect().top})''',selector)
   gap=data['content']-data['header']
   if width<=720: assert 12<=gap<=17,(width,kind,data)
   else: assert gap>=40,(width,kind,data)
   if width==390 and kind=='home':
    page.locator('#ykMenuJLPTV7864').click(no_wait_after=True)
    page.wait_for_timeout(40)
    before=page.evaluate('window.__originalClick||0')
    page.wait_for_timeout(230)
    after=page.evaluate('window.__originalClick||0')
    assert before==0 and after==1,(before,after)
   context.close()
 # Reduced motion: instant activation, no artificial time delay.
 context=browser.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
 page=context.new_page();page.set_content(html('home'),wait_until='domcontentloaded');page.add_style_tag(content=css);page.add_script_tag(content=script)
 page.locator('#ykMenuJLPTV7864').click(no_wait_after=True)
 assert page.evaluate('window.__originalClick||0')==1,'reduced motion click must be immediate'
 context.close(); browser.close()
 print('PASS Chromium: Home+Exam spacing at 360/390/430/720px, desktop 721px unchanged, JLPT touch + reduced motion')
