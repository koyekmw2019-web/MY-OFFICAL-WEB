"""Renders ONLY the JLPT card component. Does not claim a live/full-site browser test."""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
soup=BeautifulSoup((root/'index.html').read_text('utf8'),'html.parser')
styles='\n'.join(x.get_text() for x in soup.find_all('style') if x.get('id') in ['v754-jlpt-premium-cards-css','v779-jlpt-card-localization'])
assert 'v779-jlpt-card-localization' not in styles  # text does not include style id, only rules
cards=[soup.find('article',id='jlpt-exam-'+l) for l in ['n5','n4','n3','n2','n1']]
assert all(cards)
markup='\n'.join(str(c) for c in cards)
base='''*{box-sizing:border-box}html,body{margin:0}body{background:#090909;color:#fff;font-family:Arial,"Noto Sans Myanmar","Noto Sans JP",sans-serif;padding:16px}button{cursor:pointer}'''
html='<!doctype html><html lang="my"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+base+styles+'</style></head><body><main class="jlpt-grid-v745">'+markup+'</main></body></html>'
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,size in [('desktop',{'width':1440,'height':900}),('mobile',{'width':390,'height':844})]:
  page=browser.new_page(viewport=size,device_scale_factor=1)
  page.set_content(html,wait_until='load',timeout=15000)
  for lang in ['my','en','ja']:
   page.evaluate("lang=>{ document.documentElement.lang=lang; document.querySelectorAll('[data-my]').forEach(el=>{const t=el.getAttribute('data-'+lang);if(t!==null)el.textContent=t;})}",lang)
   for lv in ['n5','n4','n3','n2','n1']:
    card=page.locator('#jlpt-exam-'+lv)
    assert card.locator('.jlpt-card-mm-v779').is_visible()
    assert card.locator('.jlpt-card-cta-mm-v779').inner_text().strip()=='စာမေးပွဲ စတင်မည်'
    assert card.locator('button[data-exam-v728="jlpt_'+lv+'"]').count()==1
  page.evaluate("lang=>{document.documentElement.lang=lang;document.querySelectorAll('[data-my]').forEach(el=>{const t=el.getAttribute('data-'+lang);if(t!==null)el.textContent=t;})}",'en')
  page.locator('#jlpt-exam-n1').scroll_into_view_if_needed()
  box=page.locator('#jlpt-exam-n1').bounding_box()
  assert box and box['width']>100
  assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'),'unexpected horizontal overflow'
  out=Path('/mnt/data')/f'YEKUN_v7_79_JLPT_{device}.png'
  page.locator('#jlpt-exam-n1').screenshot(path=str(out),animations='disabled',timeout=15000)
  results.append({'device':device,'card_width':round(box['width']),'screenshot':str(out),'lang_switches':'my,en,ja'})
  page.close()
 browser.close()
print('PASS isolated JLPT card browser test:',results)
