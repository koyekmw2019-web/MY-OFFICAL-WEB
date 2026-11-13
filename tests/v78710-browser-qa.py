"""Chromium fixture UI test, not a production/live Netlify test."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import re, json
root=Path(__file__).parent.parent
html=(root/'study/jlpt-grammar-library.html').read_text()
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
html=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',html)
assets={lv:json.loads((root/f'assets/yk-v7879-grammar-{lv}.json').read_text()) for lv in ('n5','n4','n3','n2','n1')}
expected={'N5':35,'N4':75,'N3':135,'N2':137,'N1':127}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in (390,1280):
  page=browser.new_page(viewport={'width':width,'height':844})
  page.set_content(html)
  page.add_style_tag(path=str(root/'assets/yk-v7879-grammar.css'))
  page.evaluate('''(all) => {
    window.__fetches=[];
    window.fetch = async (url) => {
      window.__fetches.push(String(url));
      const m=String(url).match(/grammar-(n[1-5])\\.json/);
      if (!m) return new Response('{}',{status:404});
      return new Response(JSON.stringify(all[m[1]]), {status:200,headers:{'Content-Type':'application/json'}});
    };
  }''',assets)
  page.add_script_tag(path=str(root/'assets/yk-v7879-grammar.js'))
  page.wait_for_function("() => document.querySelectorAll('.yk879-row').length===35")
  assert '35 patterns' in page.locator('#yk879Totals').inner_text()
  assert page.locator('.yk879-example').count()==2
  assert page.locator('.yk879-grammar-mark').count()>=2
  assert page.locator('.yk879-example ruby').count()>0,'N5 auto furigana should show'
  # Furigana toggle with no loss of grammar underline.
  page.locator('[data-furi="off"]').click()
  assert page.locator('.yk879-example ruby').count()==0
  assert page.locator('.yk879-grammar-mark').count()>=2
  page.locator('[data-furi="all"]').click()
  assert page.locator('.yk879-example ruby').count()>0
  # Bookmark and done saved in browser state.
  page.locator('[data-action="saved"]').click()
  assert 'Bookmarked' in page.locator('[data-action="saved"]').inner_text()
  page.locator('[data-action="done"]').click()
  assert 'Learned' in page.locator('[data-action="done"]').inner_text()
  page.locator('[data-filter="saved"]').click()
  assert page.locator('.yk879-row').count()==1
  page.locator('[data-filter="all"]').click()
  # Check every level loads only when selected and each has 2 examples.
  for level,count in expected.items():
   if level!='N5':
    page.locator(f'[data-level="{level}"]').click()
    page.wait_for_function('(n) => document.querySelectorAll(".yk879-row").length===n',arg=count)
   assert page.locator('.yk879-row').count()==count
   assert page.locator('.yk879-row-status.pending').count()==0
   assert f'{count} original lessons' in page.locator('#yk879Totals').inner_text()
   assert page.locator('.yk879-example').count()==2
   assert page.locator('.yk879-grammar-mark').count()>=2
  assert page.evaluate("() => window.__fetches.length")==5,'Only selected level files requested'
  assert all('?v=78710' in u for u in page.evaluate('window.__fetches'))
  page.locator('#yk879Search').fill('〜あっての')
  assert page.locator('.yk879-row').count()==1
  assert not page.evaluate('document.documentElement.scrollWidth > innerWidth+1'),f'Horizontal overflow at {width}px'
  print(f'PASS Chromium {width}px: 5 levels, 509 authored patterns, lazy JSON, search/bookmark/progress, furigana show/hide, grammar underline, no overflow')
  page.close()
 browser.close()
