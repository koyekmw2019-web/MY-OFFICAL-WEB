"""Headless browser inspection of the synthetic v7.87.20 exam modal fixture.
No live user account, Netlify deployment or real network is exercised.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
path=Path(sys.argv[1]).resolve()
for width,height in [(320,740),(390,844),(1280,800)]:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
        html=path.read_text()
        css=(path.parent/'assets'/'yk-v78720-mobile-fixes.css').read_text()
        html=html.replace('</head>',f'<style>{css}</style></head>')
        page.set_content(html,wait_until='domcontentloaded')
        page.wait_for_selector('.exam-plan-card-v728')
        assert page.locator('.exam-plan-card-v728').count()==4
        assert page.locator('[data-plan="week"]').get_attribute('role')=='button'
        assert page.locator('[data-plan="week"]').get_attribute('tabindex')=='0'
        total=page.evaluate('document.documentElement.scrollWidth')
        assert total<=width+1, f'mobile horizontal overflow: viewport {width}, content {total}'
        modal=page.locator('.exam-v728-modal')
        assert modal.evaluate('(el)=>el.scrollHeight>0')
        page.locator('[data-plan="week"]').focus()
        page.keyboard.press('Enter')
        assert page.locator('#selection').inner_text()=='week'
        page.locator('[data-plan="month"]').focus()
        page.keyboard.press('Space')
        assert page.locator('#selection').inner_text()=='month'
        page.locator('[data-plan="year"]').click()
        assert page.locator('#selection').inner_text()=='year'
        # Multi-language UI labels in synthetic example must keep plan card tap targets.
        page.locator('#language').select_option('my')
        assert page.locator('html').get_attribute('lang')=='my'
        page.locator('#language').select_option('ja')
        assert page.locator('html').get_attribute('lang')=='ja'
        browser.close()
print('PASS v78720-browser-qa: 320/390/1280px, keyboard Enter/Space, click, mobile overflow, language selector (synthetic fixture)')
