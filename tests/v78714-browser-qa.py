"""Offline Chromium DOM/CSS QA of self-contained v7.87.14 practice UI.
No external site/browser navigation allowed in this environment; mocked JSON fetch.
This DOES NOT constitute production or real-route E2E verification.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,re,os,tempfile
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'study/jlpt-grammar-practice.html').read_text()
html=re.sub(r'<script\b[^>]*\bsrc=[^>]*></script>','',html)
html=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',html)
css=(ROOT/'assets/yk-v78714-practice.css').read_text()
engine=(ROOT/'assets/yk-v78714-engine.js').read_text().replace('export const ','const ').replace('export function ','function ')
engine='(function(){\n'+engine+'\nwindow.YK814Engine={LEVELS,EXPECTED_COUNTS,STORAGE_KEY,normalizeAnswer,cleanState,grade,addSession,summarize,dayKey,makeDeck};\n})();'
script=(ROOT/'assets/yk-v78714-practice.js').read_text()
# v7.87.15 adds an isolated event recorder; this older test stubs it while dedicated
# v78715-browser-qa.py verifies the real recorder and insights behavior.
script=script.replace("import {recordInsightEvent} from './yk-v78715-tracker.js';","const recordInsightEvent=()=>true;")
script=re.sub(r'^import\s*\{[^;]+?\}\s*from\s*[\'\"][^\'\"]+[\'\"];\s*',
              'const {LEVELS,EXPECTED_COUNTS,STORAGE_KEY,normalizeAnswer,cleanState,grade,addSession,summarize,dayKey,makeDeck}=window.YK814Engine;\n',script,count=1,flags=re.M)
assert 'import {' not in script[:250]
catalog={k.upper():json.loads((ROOT/f'assets/yk-v7879-grammar-{k}.json').read_text()) for k in 'n5 n4 n3 n2 n1'.split()}
bank=json.loads((ROOT/'assets/yk-v78714-choice-bank.json').read_text())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=(os.environ.get('YK_CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None)),args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(390,844),(1280,900)]:
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded',timeout=10000)
  page.add_style_tag(content=css)
  page.evaluate('''({catalog,bank})=>{
    const data=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data.get(k)||null,setItem:(k,v)=>{data.set(k,String(v));},removeItem:k=>data.delete(k)}});
    window.fetch=async(url)=>{const s=String(url);if(s.includes('yk-v78714-choice-bank'))return new Response(JSON.stringify(bank));
      const m=s.match(/yk-v7879-grammar-(n[1-5])\\.json/);if(m)return new Response(JSON.stringify(catalog[m[1].toUpperCase()]));
      return new Response('Not found',{status:404});
    };
  }''',{'catalog':catalog,'bank':bank})
  page.add_script_tag(content=engine)
  page.add_script_tag(content=script)
  page.wait_for_selector('#yk814App')
  assert page.locator('html').get_attribute('lang')=='my'
  assert page.locator('[data-lang="my"]').get_attribute('aria-pressed')=='true',errs
  assert page.locator('body').evaluate('(e)=>e.scrollWidth<=window.innerWidth+2'),f'Overflow @ {width}'
  page.locator('[data-mode="recall"]').click()
  page.locator('[data-count="5"]').click()
  page.locator('#yk814Start').click()
  page.wait_for_selector('#yk814Typed',timeout=10000)
  assert page.locator('.yk814-prompt').count()==1
  assert not page.locator('.yk814-grammar-mark').count(),'Answer must not show before reveal'
  page.locator('#yk814Typed').fill('てから')
  page.locator('[data-lang="en"]').click()
  assert page.locator('#yk814Typed').input_value()=='てから','Language change erased typed answer'
  page.locator('[data-lang="my"]').click()
  page.locator('[data-furi="off"]').click()
  assert page.locator('#yk814Typed').input_value()=='てから','Furigana toggle erased typed answer'
  page.locator('[data-action="reveal"]').click()
  page.wait_for_selector('[data-action="self-wrong"]')
  page.locator('[data-action="self-wrong"]').click()
  assert page.locator('.yk814-grammar-mark').count()>0
  page.locator('[data-action="next"]').click()
  assert page.locator('.yk814-prompt').count()==1
  assert page.locator('.yk814-stat').first.locator('strong').inner_text()=='1/509'
  assert page.evaluate('JSON.parse(localStorage.getItem("yk_grammar_mastery_v78714_v1")).records[Object.keys(JSON.parse(localStorage.getItem("yk_grammar_mastery_v78714_v1")).records)[0]].wrong')==1
  assert not page.locator('#yk814Status').inner_text().startswith('Browser storage unavailable')
  page.locator('[data-lang="en"]').click()
  assert page.locator('html').get_attribute('lang')=='en'
  assert page.locator('.yk814-prompt').count()==1
  page.locator('[data-lang="ja"]').click()
  assert page.locator('html').get_attribute('lang')=='ja'
  page.locator('[data-lang="my"]').click()
  assert page.locator('html').get_attribute('lang')=='my'
  assert page.locator('body').evaluate('(e)=>e.scrollWidth<=window.innerWidth+2')
  page.locator('[data-mode="review"]').click()
  page.locator('#yk814Start').click()
  page.wait_for_selector('#yk814Typed')
  page.locator('[data-action="reveal"]').click()
  page.locator('[data-action="self-right"]').click()
  page.locator('[data-action="next"]').click()
  assert page.locator('.yk814-result').count()==1
  page.locator('[data-mode="choice"]').click()
  page.locator('#yk814Start').click()
  page.wait_for_selector('.yk814-choice',timeout=5000)
  assert page.locator('.yk814-choice').count()==4
  page.locator('.yk814-choice').first.click()
  assert page.locator('.yk814-feedback').count()==1
  assert page.locator('.yk814-grammar-mark').count()>0
  # Switch from N5 to N1: level-specific data must load without cross-level questions.
  page.locator('[data-level="N1"]').click()
  page.locator('[data-mode="daily"]').click()
  page.locator('[data-count="5"]').click()
  page.locator('#yk814Start').click()
  page.wait_for_selector('.yk814-qtop',timeout=5000)
  assert 'N1' in page.locator('.yk814-qtop').inner_text()
  assert not errs, f'Browser errors at width {width}: {errs}'
  if width==390:page.screenshot(path=str(Path(tempfile.gettempdir())/'yk_v78714_mobile_preview.png'),full_page=True)
  if width==1280:page.screenshot(path=str(Path(tempfile.gettempdir())/'yk_v78714_desktop_preview.png'),full_page=True)
  print(f'PASS synthetic browser {width}×{height}: recall, reveal, self-grade, weak review, MCQ, 3 languages, local stats, no page overflow')
  page.close()
 browser.close()
