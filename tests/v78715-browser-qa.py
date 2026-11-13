"""Chromium synthetic DOM/CSS QA, with mocked localStorage and local JSON fetch.
No actual site, account, Netlify API or network route was tested.
"""
from pathlib import Path
import json,re,os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
def read(p):return (ROOT/p).read_text()
def trim(html):
 return re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',re.sub(r'<script\b[^>]*\bsrc=[^>]*></script>','',html))
def stripmodule(s):
 s=re.sub(r'^import\s*\{[^;]+?\}\s*from\s*[\'\"][^\'\"]+[\'\"];?\s*','',s,flags=re.M)
 return s.replace('export const ','const ').replace('export function ','function ')
# Each synthetic page executes only its own module entrypoint.
core=stripmodule(read('assets/yk-v78714-engine.js'))+'\n'+stripmodule(read('assets/yk-v78715-insights-engine.js'))+'\n'
insights=core+stripmodule(read('assets/yk-v78715-insights.js'))
practice=core+stripmodule(read('assets/yk-v78715-tracker.js'))+stripmodule(read('assets/yk-v78714-practice.js'))
student=core+stripmodule(read('assets/yk-v78714-student.js'))+stripmodule(read('assets/yk-v78715-student.js'))
assert 'import {' not in insights and 'import {' not in practice and 'import {' not in student
catalog={lv.upper():json.loads(read(f'assets/yk-v7879-grammar-{lv}.json')) for lv in ('n1','n2','n3','n4','n5')}
bank=json.loads(read('assets/yk-v78714-choice-bank.json'))
now=__import__('time').time_ns()//1000000
records={'N5-grammar-001':{'attempts':3,'correct':0,'wrong':3,'streak':0,'lastCorrect':False,'updatedAt':now-25000},
'N5-grammar-002':{'attempts':1,'correct':0,'wrong':1,'streak':0,'lastCorrect':False,'updatedAt':now-35000},
'N5-grammar-003':{'attempts':2,'correct':2,'wrong':0,'streak':2,'lastCorrect':True,'updatedAt':now-1100}}
evidence={'version':1,'records':records,'sessions':[]}
events=[{'id':'N5-grammar-001','correct':False,'method':'self','mode':'recall','at':now-10000},
        {'id':'N5-grammar-002','correct':False,'method':'choice','mode':'choice','at':now-15000}]
init_js='''({catalog,bank,state,events})=>{
 const map=new Map([['yk_lang','my'],['yk_grammar_mastery_v78714_v1',JSON.stringify(state)],['yk_grammar_insights_v78715_v1',JSON.stringify(events)]]);
 Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)}});
 window.fetch=async url=>{const s=String(url),level=s.match(/yk-v7879-grammar-(n[1-5])\\.json/);
  if(level)return new Response(JSON.stringify(catalog[level[1].toUpperCase()]));
  if(s.includes('yk-v78714-choice-bank'))return new Response(JSON.stringify(bank));
  return new Response('not found',{status:404});};
 }'''
args={'catalog':catalog,'bank':bank,'state':evidence,'events':events}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('YK_CHROMIUM_PATH') or '/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in (390,1280):
  page=browser.new_page(viewport={'width':width,'height':844},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(trim(read('study/jlpt-grammar-insights.html')))
  page.add_style_tag(content=read('assets/yk-v78715-insights.css'))
  page.evaluate(init_js,args)
  page.add_script_tag(content=insights)
  page.locator('.yk815-item').first.wait_for(timeout=8000)
  assert page.locator('.yk815-item').count()==2,errors
  assert '3/35' in page.locator('#yk815Stats').inner_text()
  assert '2' in page.locator('#yk815TrendMeta').inner_text()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),width
  page.locator('[data-lang="en"]').click()
  assert 'My Grammar Weakness Insights' in page.locator('h1').inner_text()
  assert 'Repeated mistakes' in page.locator('#yk815Rec').inner_text()
  page.locator('[data-lang="ja"]').click();assert '苦手文法' in page.locator('h1').inner_text()
  page.locator('[data-lang="my"]').click();assert 'Grammar အားနည်းချက်' in page.locator('h1').inner_text()
  page.locator('#yk815Overview button[data-level="N3"]').click()
  assert 'Practice မှတ်တမ်းမရှိသေး' in page.locator('#yk815Rec').inner_text()
  page.locator('#yk815Overview button[data-level="N5"]').click()
  page.locator('.yk815-item').first.wait_for(timeout=8000)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
  assert not errors,errors
  print(f'PASS synthetic insights {width}px: evidence, 3 languages, 5 levels, empty history, no overflow')
  page.close()
 page=browser.new_page(viewport={'width':390,'height':844})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(trim(read('study/jlpt-grammar-practice.html')))
 page.add_style_tag(content=read('assets/yk-v78714-practice.css'))
 page.evaluate(init_js,args)
 page.add_script_tag(content=practice)
 page.locator('#yk814Start').click();page.locator('#yk814Typed').wait_for(timeout=5000)
 page.locator('#yk814Typed').fill('間違った答え');page.locator('[data-action="check"]').click()
 got=page.evaluate('JSON.parse(localStorage.getItem("yk_grammar_insights_v78715_v1"))')
 assert len(got)==3 and got[-1]['method']=='typed' and got[-1]['correct'] is False,got
 page.locator('[data-action="next"]').click();page.locator('[data-action="reveal"]').click();page.locator('[data-action="self-right"]').click()
 got=page.evaluate('JSON.parse(localStorage.getItem("yk_grammar_insights_v78715_v1"))')
 assert len(got)==4 and got[-1]['method']=='self' and got[-1]['correct'] is True,got
 assert not errors,errors
 print('PASS synthetic practice: typed exact-match and self-ratings recorded separately (browser-local)')
 page.close()
 for role in ('student','admin','member'):
  page=browser.new_page(viewport={'width':390,'height':844})
  page.set_content(f'<html lang="my"><body data-dashboard="{role}"><div id="dashboardBody"><div id="yk84StudentBody"></div></div></body></html>')
  page.add_style_tag(content=read('assets/yk-v78714-student.css')+read('assets/yk-v78715-student.css'))
  page.evaluate(init_js,args)
  page.add_script_tag(content=student)
  if role=='student':
   page.locator('#yk815Student').wait_for(timeout=5000)
   assert page.locator('#yk815Student a').get_attribute('href').startswith('/study/jlpt-grammar-insights.html')
  else:assert page.locator('#yk815Student').count()==0
  print('PASS synthetic role:',role)
  page.close()
 browser.close()
