#!/usr/bin/env python3
"""QA only: source-derived CTA DOM + mobile flex rules + adversarial late CSS.
Not a full page, live site or physical Android test.
"""
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

source = Path('scripts/build-v7876-jlpt-ui-fix05.mjs').read_text()
match = re.search(r"const newCTA='([^']+)';", source)
assert match, 'Missing generated CTA HTML'
cta = match.group(1)
assert 'display:block!important;text-align:center!important' in cta
assert '<span' not in cta and '↗' not in cta
css = Path('assets/yk88-jlpt-ui-fix05.css').read_text()

base_css = """
* { box-sizing: border-box; }
body { margin:0; background:#09090a; color:white; font-family:Inter,'Noto Sans Myanmar','Noto Sans JP',sans-serif; }
#study-hub { margin:10px; padding:18px; border-radius:30px; background:#131116; }
#studyHubGridV733 { display:grid; grid-template-columns:1fr; gap:14px; }
#yk82Hub { padding:14px; border-radius:24px; background:#371e2a; }
.yk821-hub-welcome{display:flex;align-items:center;gap:16px;min-height:132px;overflow:hidden;border:1px solid #694454;border-radius:18px;background:#251d25;margin:14px 0 16px;padding:0 18px 0 0}
.yk821-hub-people{width:182px;min-width:182px;height:132px;position:relative; background:#51303c;}
.yk821-hub-copy{flex:1;min-width:0;}
.yk821-hub-open{flex:none;white-space:nowrap;color:#fff!important;text-decoration:none!important;display:inline-flex;padding:11px 16px;border:1px solid #eb7f88;border-radius:12px;background:linear-gradient(105deg,#b72e40,#e25a62);font-size:12px;font-weight:800}
@media(max-width:900px){.yk821-hub-open{padding:10px}.yk821-hub-welcome{gap:10px}}
@media(max-width:640px){.yk821-hub-welcome{flex-wrap:wrap;padding:12px 13px;min-height:0;gap:7px}.yk821-hub-people{order:2;width:126px;min-width:126px;height:101px}.yk821-hub-copy{order:1;flex-basis:100%}.yk821-hub-open{order:3;flex:1}}
/* Deliberately simulate unknown later author stylesheet that forces left text. */
#yk82Hub .yk821-hub-welcome > a.yk821-hub-open {
  display:inline-flex!important;
  justify-content:flex-start!important;
  text-align:left!important;
}
"""
html = f'''<!doctype html><html lang="my"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
<section class="study-hub-v7" id="study-hub"><div class="study-hub-grid" id="studyHubGridV733">
<div class="yk82-panel" id="yk82Hub"><div class="yk821-hub-welcome">
<div class="yk821-hub-copy"><strong>JLPT Learning Center Pro</strong><p>ဂျပန်စာ လေ့လာကြမယ်။</p></div>
<div class="yk821-hub-people">Student &amp; Teacher images</div>{cta}
</div></div></div></section></body></html>'''
labels = {'my': 'သင်ခန်းစာအားလုံးဖွင့်ရန်', 'en': 'Open All Lessons', 'ja': 'すべてのレッスンを開く'}
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None, args=['--no-sandbox'] if Path('/usr/bin/chromium').exists() else [])
    for width in (320, 360, 390, 430, 720):
        page = browser.new_page(viewport={'width':width,'height':850})
        page.set_content(html)
        page.add_style_tag(content=base_css)
        page.add_style_tag(content=css)
        for lang, label in labels.items():
            page.locator('a.yk821-hub-open').evaluate('(e,v) => e.textContent=v', label)
            result = page.evaluate('''() => {
               const a = document.querySelector('a.yk821-hub-open');
               const w = document.querySelector('.yk821-hub-welcome');
               const range = document.createRange(); range.selectNodeContents(a);
               const tr=range.getBoundingClientRect(), ar=a.getBoundingClientRect(), wr=w.getBoundingClientRect();
               const st=getComputedStyle(a);
               return {display:st.display,align:st.textAlign,centerDiff:Math.abs(tr.left+tr.width/2-ar.left-ar.width/2),
                  textW:tr.width,contentW:a.clientWidth,textLineRects:range.getClientRects().length,
                  buttonW:ar.width,outerW:wr.width,scrollW:document.documentElement.scrollWidth,viewport:innerWidth};
            }''')
            assert result['display']=='block', result
            assert result['align']=='center', result
            assert result['centerDiff']<2, result
            assert result['textLineRects']==1, result
            assert result['textW']<=result['contentW']+1, result
            assert result['scrollW']<=width, result
            if width<=640:
                assert result['buttonW']>=result['outerW']-34, result
            print(f'PASS {width}px {lang}: text center error {result["centerDiff"]:.2f}px, one line, link block')
        page.close()
    browser.close()
print('PASS source-derived CTA browser regression; actual full site still untested')
