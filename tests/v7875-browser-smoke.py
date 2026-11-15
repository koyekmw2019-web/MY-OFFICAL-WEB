"""Optional localhost browser smoke with no production API calls.
Test after creating synthetic dist fixture. Uses Chromium and localhost HTTP only.
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
from threading import Thread
import os, json

DIST=Path(__file__).resolve().parents[1]/'dist'
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
os.chdir(DIST)
server=ThreadingHTTPServer(('127.0.0.1',0),Quiet)
thread=Thread(target=server.serve_forever,daemon=True);thread.start()
url=f'http://127.0.0.1:{server.server_address[1]}'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for width in [360,390,430,720,721]:
   for reduced in ([False,True] if width==390 else [False]):
    ctx=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce' if reduced else 'no-preference')
    # Store whether page reveal received actual ViewTransition instance.
    ctx.add_init_script('''
    window.__received = {revealed:false, swapped:false, viewTransition:false};
    addEventListener('pagereveal',e=>{window.__received.revealed=true;window.__received.viewTransition=!!e.viewTransition;});
    addEventListener('pageswap',e=>{try{sessionStorage.setItem('yk-v7875-pageswap',e.viewTransition?'yes':'no')}catch{} });
    ''')
    page=ctx.new_page()
    page.goto(url+'/index.html')
    page.wait_for_load_state('load')
    applied=page.evaluate('''() => {
      const e=document.querySelector('#yk-mobile-nav'); const s=getComputedStyle(e);
      return {name:s.viewTransitionName, support:CSS.supports('view-transition-name','yk-v7875-tab-bar')};
    }''')
    page.locator('#yk-mobile-nav a[data-tab="exam"]').click()
    page.wait_for_url('**/mock-exams.html')
    page.wait_for_timeout(80)
    arrival=page.evaluate('window.__received')
    page.locator('#yk-mobile-nav a[data-tab="video"]').click()
    page.wait_for_url('**/video-class.html')
    page.wait_for_timeout(80)
    arrival2=page.evaluate('window.__received')
    expected=width<=720 and not reduced
    actual=bool(arrival['viewTransition'])
    actual2=bool(arrival2['viewTransition'])
    assert actual==expected, f'Home→Exam {width}px, reduced={reduced}: expected {expected}, got {arrival}'
    assert actual2==expected, f'Exam→Video {width}px, reduced={reduced}: expected {expected}, got {arrival2}'
    # Animation opt-in disabled on desktop/reduced motion.
    assert (applied['name']=='yk-v7875-tab-bar') == expected, f'Nav named view {width}px reduced={reduced}: {applied}'
    row={'width':width,'reducedMotion':reduced,'viewTransitionHomeExam':actual,'viewTransitionExamVideo':actual2,'navName':applied['name'],'result':'PASS'}
    results.append(row)
    print(json.dumps(row))
    ctx.close()
  browser.close()
finally:
 server.shutdown();server.server_close()
print('PASS Chromium cross-document mobile page transition checks: '+str(len(results))+' scenarios')
