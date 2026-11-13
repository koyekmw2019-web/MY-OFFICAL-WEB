"""Offline Chromium student-only widget test. Synthetic dashboard scaffold, not Netlify authentication."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
engine=(ROOT/'assets/yk-v78714-engine.js').read_text().replace('export const ','const ').replace('export function ','function ')
engine='(function(){'+engine+'\nwindow.YK814Engine={LEVELS,EXPECTED_COUNTS,STORAGE_KEY,cleanState,summarize};})();'
student=(ROOT/'assets/yk-v78714-student.js').read_text()
idx=student.index('\nif(document.body?.dataset.dashboard===')
student='const {LEVELS,EXPECTED_COUNTS,STORAGE_KEY,cleanState,summarize}=window.YK814Engine;\n'+student[idx:]
css=(ROOT/'assets/yk-v78714-student.css').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=(os.environ.get('YK_CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None)),args=['--no-sandbox','--disable-dev-shm-usage'])
 for role in ('student','admin','member'):
  page=browser.new_page(viewport={'width':390,'height':844})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(f'<html lang="my"><body data-dashboard="{role}"><main><section id="dashboardBody"><div id="yk84StudentBody"></div></section></main></body></html>')
  page.add_style_tag(content=css)
  page.evaluate('''() => {const map=new Map([['yk_lang','my'],['yk_grammar_mastery_v78714_v1',JSON.stringify({version:1,records:{'N5-grammar-001':{attempts:2,correct:1,wrong:1,streak:0,lastCorrect:false,updatedAt:1}},sessions:[]})]]);
  Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v))}});
  }''')
  page.add_script_tag(content=engine)
  page.add_script_tag(content=student)
  if role=='student':
   page.wait_for_selector('#yk814Student',timeout=5000)
   assert '1/509' in page.locator('#yk814Student').inner_text()
   assert page.locator('#yk814Student a').get_attribute('href')=='/study/jlpt-grammar-practice.html'
   page.evaluate('localStorage.setItem("yk_lang","ja");document.dispatchEvent(new Event("yk-ui-language-v78712"))')
   assert '文法練習の進捗' in page.locator('#yk814Student').inner_text()
   assert page.locator('body').evaluate('(e)=>e.scrollWidth<=window.innerWidth+2')
  else:assert page.locator('#yk814Student').count()==0, 'Student widget leaked to '+role
  assert not errors,errors
  print('PASS synthetic role check:',role)
  page.close()
 browser.close()
