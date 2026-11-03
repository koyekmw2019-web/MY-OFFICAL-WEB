from pathlib import Path
import re, json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf8')
src=(root/'assets/yk-dictionary-v772.js').read_text(encoding='utf8')
mark=html.index('<!-- ===== V7.18 Dictionary pronunciation restore')
start=html.index('<script>',mark)+len('<script>')
end=html.index('</script>',start)
code=html[start:end].strip()
assert 'const incomingV769' in code

results={}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [1365,390]:
  page=browser.new_page(viewport={'width':width,'height':844})
  page.on('pageerror',lambda err: print('BROWSER ERROR:',err))
  page.set_content('''<!DOCTYPE html><meta charset="utf-8"><style>body{background:#111;color:#fff;font-family:sans-serif}#dictionaryResults{min-height:100px}.dictionary-item{background:#222;margin:8px;padding:14px}.dictionary-reading{color:#aaa}.dictionary-mm{color:#fff}</style><input id="dictionarySearch"><div id="dictionaryResults"></div><div id="dictionaryEmpty"></div><div id="dictionaryToolsV7"><button data-dict-cat="all">All</button><button data-dict-cat="JLPT N5">N5</button></div><button id="dictFavMode"></button><div id="dictRecentV7"></div><div id="dictCountV7"></div><button id="dictionaryLoadMore"></button>''')
  page.evaluate(src)
  page.evaluate(code)
  page.locator('#dictionarySearch').fill('恋')
  data=page.locator('.dictionary-item').all_text_contents()
  assert len(data)==6, (width,len(data))
  assert all('Translation pending' not in text for text in data), (width,data)
  for word in ['恋する','恋愛','恋しい','失恋','恋人']:
   assert any(word in txt for txt in data), (word, data)
  page.locator('#dictionarySearch').fill('えんぴつ')
  assert page.locator('.dictionary-item').count()>=1
  assert 'ခဲတံ' in page.locator('#dictionaryResults').inner_text()
  page.locator('#dictionarySearch').fill('恋')
  # add favourite & verify after re-render
  first=page.locator('.dictionary-item').first
  first.locator('[data-action="fav"]').click()
  assert 'Saved' in page.locator('.dictionary-item').first.inner_text()
  page.locator('#dictionarySearch').fill('')
  page.locator('#dictionarySearch').fill('恋')
  assert 'Saved' in page.locator('.dictionary-item').first.inner_text()
  # Filter behaviour after search and favourite first-click regression.
  page.locator('#dictionarySearch').fill('')
  page.locator('[data-dict-cat="JLPT N5"]').click()
  visible = page.locator('.dictionary-item').all_text_contents()
  assert len(visible)==200 and not any('Translation pending' in txt for txt in visible),(width,len(visible))
  results[str(width)]={'search_love_results':len(data),'pending_in_screenshot_results':0,'n5_えんぴつ':'ခဲတံ','favourite_first_click_pass':True,'n5_first_200_results_pending':0}
  page.close()
 browser.close()
(root/'QA_v7_72_BROWSER.json').write_text(json.dumps({'isolated_offline_browser_qa':results,'note':'Isolated dictionary DOM; NOT a full deployed site, Netlify or login test'},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(results,ensure_ascii=False,indent=2))
