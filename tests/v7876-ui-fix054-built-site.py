#!/usr/bin/env python3
"""Run AFTER npm run build in the COMPLETE repository, not from patch ZIP alone.
Serves the real built dist and inspects actual computed CTA layout in Chromium.
This is NOT a production/Samsung device test.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import http.server, socketserver, threading, sys

root=Path('dist')
if not (root/'index.html').exists():
    sys.exit('NO-GO: dist/index.html missing. Run npm run build in the full repository.')
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(root.resolve()),**kwargs)
    def log_message(self, *_): pass
class Server(socketserver.TCPServer): allow_reuse_address=True
with Server(('127.0.0.1',0),Handler) as srv:
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{srv.server_address[1]}/index.html'
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox'] if Path('/usr/bin/chromium').exists() else [])
        for width in (320,360,390,430):
            context=browser.new_context(viewport={'width':width,'height':820},service_workers='block')
            page=context.new_page()
            page.goto(url,wait_until='domcontentloaded',timeout=30000)
            page.wait_for_selector('#yk82Hub a.yk821-hub-open',timeout=12000)
            for lang,label in {'my':'သင်ခန်းစာအားလုံးဖွင့်ရန်','en':'Open All Lessons','ja':'すべてのレッスンを開く'}.items():
                page.evaluate("(lang) => {if(typeof setLang==='function')setLang(lang);else document.documentElement.lang=lang;}",lang)
                page.wait_for_timeout(300)
                result=page.evaluate('''() => {
                    const a=document.querySelector('#yk82Hub a.yk821-hub-open');
                    const r=document.createRange();r.selectNodeContents(a);
                    const tr=r.getBoundingClientRect(),ar=a.getBoundingClientRect();
                    const st=getComputedStyle(a);
                    return {text:a.textContent.trim(),display:st.display,align:st.textAlign,
                      centerDiff:Math.abs(tr.left+tr.width/2-ar.left-ar.width/2),
                      textW:tr.width,contentW:a.clientWidth,lineRects:r.getClientRects().length,
                      overflow:document.documentElement.scrollWidth>innerWidth};
                }''')
                assert result['text']==label,('NO-GO translation',lang,result)
                assert result['display']=='block' and result['align']=='center',('NO-GO style',width,lang,result)
                assert result['centerDiff']<2 and result['lineRects']==1,('NO-GO center/wrap',width,lang,result)
                assert result['textW']<=result['contentW']+1 and not result['overflow'],('NO-GO clip/overflow',width,lang,result)
                print('PASS actual local build',width,lang,result)
            context.close()
        browser.close()
    srv.shutdown()
print('PASS local built-site check. Real Samsung and Netlify Preview remain unverified.')
