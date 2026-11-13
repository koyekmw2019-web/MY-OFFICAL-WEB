"""Real Chromium UI audit against local fixture dist; not a Netlify production test."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, json
root=Path(__file__).parent.parent/'dist'
assert root.exists()
assets={lv:json.loads((root/f'assets/yk-v7879-grammar-{lv}.json').read_text()) for lv in ('n5','n4','n3','n2','n1')}
grammar_html=(root/'study/jlpt-grammar-library.html').read_text()
grammar_html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',grammar_html)
grammar_html=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',grammar_html)
fixture='<!doctype html><html lang="my"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body data-dashboard="admin">\n<div class="yk-l12-languages"><button data-yk-l12-switch="my">မြန်မာ</button><button data-yk-l12-switch="en">English</button><button data-yk-l12-switch="ja">日本語</button></div>\n<main class="shell"><section id="dashboardBody"><div class="yk878-shell"><h3>Add / Update Lead</h3><div class="yk878-kpi"><small>Follow-ups due</small></div>\n<form class="yk878-grid"><label>Follow-up date<input type="date" id="testDate"></label><label>Contact channel<input id="testText" value="MY DATA"></label><button id="save">Save Lead</button>\n<p class="yk878-meta">Open this panel to load leads.</p><input id="loginPlaceholder" placeholder="Your name"></form><div class="yk878-tablewrap"><table><tbody><tr><td><b id="prospectName">New</b></td><td><span id="safeData" lang="en">Save Lead</span></td></tr></tbody></table></div>\n</div></section></main></body></html>'

def stub_local_storage(page):
 page.evaluate("() => { let valid=true;try{window.localStorage.setItem('__yk_probe','x');window.localStorage.removeItem('__yk_probe');}catch(e){valid=false;}\n   if(!valid){const state={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.prototype.hasOwnProperty.call(state,k)?state[k]:null,setItem:(k,v)=>state[k]=String(v),removeItem:k=>delete state[k]}});}}\n")

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in (390,1280):
  page=browser.new_page(viewport={'width':width,'height':844})
  page.set_content(grammar_html)
  stub_local_storage(page)
  page.add_style_tag(path=str(root/'assets/yk-v7879-grammar.css'))
  page.add_style_tag(path=str(root/'assets/yk-v78712-i18n.css'))
  page.evaluate('''(data) => { window.fetch=async url=>{const m=String(url).match(/grammar-(n[1-5])\.json/);return m?new Response(JSON.stringify(data[m[1]]),{status:200}):new Response('{}',{status:404})}; }''',assets)
  page.add_script_tag(path=str(root/'assets/yk-v7879-grammar.js'))
  page.add_script_tag(path=str(root/'assets/yk-v78712-i18n.js'))
  page.wait_for_function("document.querySelectorAll('.yk879-row').length === 35")
  page.wait_for_function("document.querySelector('[data-furi=auto]').textContent.includes('Level') || document.querySelector('[data-furi=auto]').textContent.includes('အလိုအလျောက်')")
  assert 'အလိုအလျောက်' in page.locator('[data-furi="auto"]').inner_text()
  original=page.locator('.yk879-example-ja').first.inner_text()
  originalMy=page.locator('.yk879-trans-my').first.inner_text()
  originalEn=page.locator('.yk879-trans-en').first.inner_text()
  page.locator('[data-yk-l12-switch="en"]').click()
  assert page.locator('[data-yk-l12="grammarIntro"]').inner_text().startswith('Learn Japanese grammar')
  assert 'Auto by Level' in page.locator('[data-furi="auto"]').inner_text()
  page.locator('[data-yk-l12-switch="ja"]').click()
  assert 'レベル別に自動' in page.locator('[data-furi="auto"]').inner_text()
  assert 'ミャンマー語' in page.locator('[data-yk-l12="grammarIntro"]').inner_text()
  page.locator('[data-yk-l12-switch="my"]').click()
  assert 'အလိုအလျောက်' in page.locator('[data-furi="auto"]').inner_text()
  assert page.locator('.yk879-example-ja').first.inner_text()==original
  assert page.locator('.yk879-trans-my').first.inner_text()==originalMy
  assert page.locator('.yk879-trans-en').first.inner_text()==originalEn
  page.locator('[data-action="saved"]').click()
  before=page.evaluate("localStorage.getItem('yk_grammar_v7879_device')")
  page.locator('[data-yk-l12-switch="en"]').click()
  after=page.evaluate("localStorage.getItem('yk_grammar_v7879_device')")
  assert before==after and before
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'),f'Grammar overflow at {width}px'
  page.set_content(fixture)
  stub_local_storage(page)
  page.add_script_tag(path=str(root/'assets/yk-v78712-i18n.js'))
  assert page.locator('#save').inner_text()=='Save Lead','Saved English preference should carry to new page'
  page.locator('[data-yk-l12-switch="my"]').click()
  page.wait_for_function("document.querySelector('#save').textContent.includes('စုံစမ်းသူစာရင်း')")
  assert 'ပြန်လည်ဆက်သွယ်' in page.locator('label').first.inner_text()
  assert page.locator('#loginPlaceholder').get_attribute('placeholder')=='သင့်အမည်'
  assert page.locator('#prospectName').inner_text()=='New','User-entered lead name must stay intact'
  assert page.locator('#safeData').inner_text()=='Save Lead','Content data is not UI'
  page.locator('[data-yk-l12-switch="en"]').click()
  assert page.locator('#save').inner_text()=='Save Lead'
  assert page.locator('#loginPlaceholder').get_attribute('placeholder')=='Your name'
  page.locator('#testText').fill('Untouched user input')
  page.locator('[data-yk-l12-switch="ja"]').click()
  assert page.locator('#save').inner_text()=='お問い合わせを保存'
  assert page.locator('#testText').input_value()=='Untouched user input'
  assert '保存しますか？' in page.evaluate("window.YKUiLanguageV78712.t('Save this inquiry?')")
  print(f'PASS Chromium {width}px: grammar my/en/ja, locale persistence, original bilingual examples, bookmark preservation, admin dynamic labels, user-data isolation')
  page.close()
 browser.close()
