"""Read-only headless browser QA against a LOCAL SYNTHETIC EXAM PAGE, not Netlify."""
import json, base64, re
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'scripts/yk-v7881-nishu-page.html').read_text()
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
html=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',html)
css=(root/'assets/yk-v7881-nishu.css').read_text()
html=html.replace('</head>','<style>'+css+'</style></head>')
cover=base64.b64encode((root/'assets/yk-v7881-nishu-book-cover.jpg').read_bytes()).decode()
html=html.replace('/assets/yk-v7881-nishu-book-cover.jpg','data:image/jpeg;base64,'+cover)
bank=json.loads((root/'assets/yk-v7881-nishu-questions.json').read_text())
for scene in bank['visual']:
 original_svg=root/(scene['image'].lstrip('/'))
 scene['image']='data:image/svg+xml;base64,'+base64.b64encode(original_svg.read_bytes()).decode()
mockautosave='window.YKExamAutoSaveV761=(()=>{let snapshot;return {activate:async()=>({snapshot:null,endsAt:new Date(Date.now()+50*60000).toISOString(),readOnly:false}),save:(s)=>{snapshot=s;return true},flush:async()=>true,afterRender:()=>{},onConflict:()=>{},discardOnSubmit:()=>{}}})();'
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,390,1280]:
  page=browser.new_page(viewport={'width':width,'height':844 if width<500 else 920},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  page.evaluate("window.fetch=async(url,options)=>{const u=String(url);let out={};if(u.includes('questions.json'))out=window.__bank;else if(u.includes('exam-status'))out={authenticated:true,email:'student@example.test'};else if(u.includes('exam-access'))out={allowed:true,mode:'free',attemptId:1001};else if(u.includes('exam-attempt-submit'))out={ok:true,score:90,passed:true,scoreVerified:true};else if(u.includes('exam-nishu-history'))out={ok:true,results:[{attemptId:8,score:93,passed:true,verified:true,submittedAt:'2026-11-13T00:00:00Z'}]};else if(u.includes('exam-nishu-review'))out={ok:true,score:90,text:{},visual:{}};else out={ok:true};return new Response(JSON.stringify(out),{status:200,headers:{'content-type':'application/json'}})};")
  page.evaluate('(d)=>window.__bank=d',bank)
  page.add_script_tag(content=mockautosave)
  page.add_script_tag(content=(root/'assets/yk-v7881-nishu.js').read_text())
  assert page.locator('h1').inner_text().startswith('普通第二種免許')
  assert page.locator('.nishu-book').count()==1
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),f'overflow intro {width}'
  page.locator('#nishu-history-button').click()
  page.wait_for_selector('.nishu-history-list li',timeout=4000)
  assert '93 / 100' in page.locator('.nishu-history-list li').first.inner_text()
  page.locator('#nishu-start').click()
  page.wait_for_selector('#examPanel:not(.nishu-hidden)',timeout=8000)
  assert '1 / 95' in page.locator('#nishu-position').inner_text()
  page.locator('.nishu-choice').first.click()
  page.locator('#nishu-next').click()
  assert '2 / 95' in page.locator('#nishu-position').inner_text()
  page.locator('[data-lang="ja"]').click()
  assert page.locator('#nishu-next').inner_text()=='次の問題'
  page.locator('#nishu-furigana').click()
  assert 'ON' in page.locator('#nishu-furigana').inner_text()
  page.locator('[data-lang="my"]').click()
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),f'overflow exam {width}'
  if width==390:
   page.screenshot(path='/mnt/data/yk_v7881_mobile_preview.png',full_page=True)
   # Walk all the way through the 95-question UI; the new final five are illustrated triplets.
   for _ in range(89):page.locator('#nishu-next').click()
   assert '91 / 95' in page.locator('#nishu-position').inner_text()
   assert page.locator('.nishu-visual-item').count()==3
   assert page.locator('.nishu-image').get_attribute('src').startswith('data:image/svg+xml')
   for _ in range(4):page.locator('#nishu-next').click()
   assert '95 / 95' in page.locator('#nishu-position').inner_text()
   assert page.locator('#nishu-submit').is_visible()
   page.on('dialog',lambda dialog:dialog.accept())
   page.locator('#nishu-submit').click()
   page.wait_for_selector('#nishu-result:not(.nishu-hidden)',timeout=7000)
   assert '90 / 100' in page.locator('#nishu-grade').inner_text()

  if width==1280:page.screenshot(path='/mnt/data/yk_v7881_desktop_preview.png',full_page=True)
  assert not errors,errors
  print('PASS synthetic mobile browser',width,'px: intro, start, answer, next, language, furigana, overflow, no JS errors')
  page.close()
 browser.close()
