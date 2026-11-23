"""Run against build:menu-qa with local Chromium and synthetic Identity."""
import functools
import json
import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

root = Path('dist-menu-qa').resolve()
out = Path(os.getenv('QA_EVIDENCE', 'menu-evidence')).resolve()
out.mkdir(exist_ok=True)

class QuietServer(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(root)))
threading.Thread(target=server.serve_forever, daemon=True).start()
origin = 'http://127.0.0.1:' + str(server.server_port)
results = []
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=os.getenv('QA_CHROMIUM', '/usr/bin/chromium'), args=['--no-sandbox'])
    for width, height in [(1440,900),(390,844),(320,640)]:
        for member in [False,True]:
            ctx = browser.new_context(viewport=dict(width=width,height=height),is_mobile=width<721,has_touch=width<721,service_workers='block')
            errors, blocked = [], set()
            def guard(route):
                u=urlsplit(route.request.url)
                if u.netloc!=urlsplit(origin).netloc or u.path.startswith(('/api/','/.netlify/')):
                    blocked.add(u.hostname+u.path)
                    route.abort()
                elif u.path=='/assets/identity.bundle.js':
                    value="{email:'qa@example.invalid',id:'qa-synthetic',name:'QA Member',roles:[]}" if member else 'null'
                    route.fulfill(content_type='text/javascript',body=f"window.YKIdentity={{getUser:async()=>sessionStorage.signedOut?null:{value},logout:async()=>{{sessionStorage.signedOut='yes'}}}};dispatchEvent(new Event('yk-identity-ready'));")
                else:
                    route.continue_()
            ctx.route('**/*',guard)
            p=ctx.new_page()
            p.set_default_timeout(4000)
            p.on('pageerror', lambda e: errors.append(str(e)))
            p.on('dialog',lambda d:d.accept())
            p.goto(origin+'/mock-exams.html', wait_until='domcontentloaded')
            nav=p.locator('#yk-mobile-nav')
            assert [s.strip() for s in nav.locator('[data-tab]').all_text_contents()]==['Home','EXAM','Video','Dictionary','Menu']
            trigger=p.locator('#menuToggle' if width>720 else '#ykocBottomMenu')
            drawer=p.locator('#siteMenu')
            for closing in ['button','keyboard']:
                at=p.url
                trigger.click()
                p.wait_for_selector('body.menu-open')
                assert p.url==at and drawer.count()==1
                assert drawer.evaluate("e=>parseFloat(getComputedStyle(e).transitionDuration)>0")
                p.wait_for_timeout(350)
                p.wait_for_function("Math.abs(document.querySelector('#siteMenu').getBoundingClientRect().right-innerWidth)<2")
                box=drawer.bounding_box()
                assert abs(box['x']+box['width']-width)<2,(width,box,p.evaluate("({w:innerWidth,scroll:document.body.scrollWidth,viewport:visualViewport.width})"))
                assert p.locator('#moreMember' if member else '#moreGuest').is_visible()
                if member: assert p.locator('#moreMemberName').inner_text()=='QA Member'
                if width<=720: assert drawer.bounding_box()['height']<=nav.bounding_box()['y']+1
                if closing=='button':
                    p.screenshot(path=out/f'menu-{width}-{"member" if member else "guest"}.png')
                    p.locator('#moreSettingsButton').click()
                    p.locator('[data-more-lang=ja]').click()
                    assert p.locator('html').get_attribute('lang')=='ja'
                    p.locator('[data-more-lang=en]').click()
                    assert p.locator('html').get_attribute('lang')=='en'
                    p.locator('#moreDark').click()
                    assert p.locator('html').get_attribute('data-yk-ui-theme')=='light'
                    if width==390:
                        p.screenshot(path=out/f'settings-light-{"member" if member else "guest"}.png')
                    p.locator('#menuClose').click()
                else:p.keyboard.press('Escape')
                p.wait_for_selector('body.menu-open',state='detached')
            p.reload(wait_until='domcontentloaded')
            assert p.locator('html').get_attribute('data-yk-ui-theme')=='light'
            trigger.click()
            p.locator('#siteMenu a[href="/study/japanese-myanmar-dictionary.html"]').click()
            p.wait_for_url('**/study/japanese-myanmar-dictionary.html')
            p.locator('#ykDrawerOpen' if width>720 else '#ykocBottomMenu').click()
            p.wait_for_timeout(350)
            assert drawer.is_visible()
            p.locator('#menuClose').click()
            if width<=720: nav.locator('[data-tab=exam]').click()
            else:
                p.locator('#ykDrawerOpen').click()
                p.locator('.shortcut[href="/mock-exams.html"]').click()
            p.wait_for_url('**/mock-exams.html')
            if member:
                trigger.click()
                p.locator('#moreLogout').click()
                p.wait_for_function("sessionStorage.signedOut==='yes'")
                p.wait_for_timeout(500)
                trigger.click()
                p.locator('#moreGuest').wait_for(state='visible')
                p.keyboard.press('Escape')
            p.locator('#yk-second-type-qa-card a').click()
            p.locator('#startSecond').click()
            assert p.locator('#licenseTimer').inner_text() in ('50:00','49:59')
            if width in (390,1440) and not member:
                keys=p.evaluate("state.questions.map(id=>mapText.has(id)?mapText.get(id).answer:mapScenes.get(id).statements.map(s=>s.answer))")
                assert len(keys)==95
                for i,answer in enumerate(keys):
                    if isinstance(answer,list):
                        for j,v in enumerate(answer):
                            if i==90 and j==0:v=not v
                            p.locator(f'[data-sub="{j}"][data-choice="{str(v).lower()}"]').click()
                    else:p.locator(f'[data-choice="{str(answer).lower()}"]').click()
                    p.locator('#nextQ').click()
                    if i==5:
                        p.reload(wait_until='domcontentloaded')
                        p.locator('#startSecond').click()
                        assert p.evaluate('state.i')==6
                        assert p.evaluate('state.questions.length')==95
                assert p.locator('.score').inner_text()=='98/100'
                p.locator('#reviewToggle').click()
                assert p.locator('.review-item').count()==1
                p.screenshot(path=out/f'exam-review-{width}.png')
            if width<=720 and not member:
                nav.locator('[data-tab=home]').click()
                p.wait_for_url('**/#home')
                nav.locator('[data-tab=video]').click()
                p.wait_for_url('**/video-class.html')
                nav.locator('[data-tab=menu]').click()
                p.locator('a[data-drawer-label=create]').click()
                p.wait_for_url('**/login.html?return=*#signupForm')
                p.locator('#viewSignup').wait_for(state='visible')
                assert p.evaluate("new URLSearchParams(location.search).get('return')")=='/video-class.html'
            results.append(dict(width=width,member=member,page_errors=errors,blocked_paths=sorted(blocked)))
            print(width,member,errors,flush=True)
            (out/'browser.json').write_text(json.dumps(results,indent=2))
            assert not errors,errors
            ctx.close()
    browser.close()
server.shutdown()
