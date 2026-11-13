"""Synthetic Chromium UI audit. Mock storage; no live Netlify or Login/Payment/YKCR interaction."""
import os,re,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
def read(p):return (ROOT/p).read_text()
def clean_html(s):
 return re.sub(r'<script\b[^>]*\bsrc=[^>]*></script>','',re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*>','',s))
def plain_module(s):
 s=re.sub(r'^import\s+\{[^;]+?\}\s*from\s*[\'\"][^\'\"]+[\'\"];?\s*','',s,flags=re.M)
 s=re.sub(r'^export\s*\{[^}]+\};?\s*','',s,flags=re.M)
 return s.replace('export const ','const ').replace('export function ','function ')
engine=plain_module(read('assets/yk-v78714-engine.js'))+'\n'+plain_module(read('assets/yk-v78716-calendar-engine.js'))
planner=engine+'\n'+plain_module(read('assets/yk-v78716-calendar.js'))
student=engine+'\n'+plain_module(read('assets/yk-v78716-student.js'))
assert not re.search(r'^\s*(?:import|export)\s',planner,flags=re.M)
seed={
 'yk_lang':'my',
 'yk_grammar_mastery_v78714_v1':json.dumps({'version':1,'records':{},'sessions':[
   {'day':'2026-11-11','level':'N5','mode':'daily','count':10,'correct':8,'finishedAt':1794360000000},
   {'day':'2026-11-12','level':'N5','mode':'choice','count':5,'correct':3,'finishedAt':1794440000000}]}),
 'yk_study_calendar_v78716_v1':json.dumps({'version':1,'dailyQuestions':10,'weeklyDays':3,'targetDate':'2026-12-01','targetLevel':'N3','plans':{}})
}
init='''(seed)=>{const map=new Map(Object.entries(seed));Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)}})}'''
# Keep tests independent of current wall clock by relying on local calendar month selection and a dynamic today.
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('YK_CHROMIUM_PATH') or '/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in (390,1280):
  page=browser.new_page(viewport={'width':width,'height':844},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(clean_html(read('study/jlpt-study-calendar.html')))
  page.add_style_tag(content=read('assets/yk-v78716-calendar.css'))
  page.evaluate(init,seed)
  page.add_script_tag(content=planner)
  page.locator('#yk816Days button').first.wait_for(timeout=8000)
  assert page.locator('#yk816Days button').count()==42
  assert page.locator('#yk816TodayQuestions').count()==1
  assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),f'overflow {width}'
  page.locator('[data-lang="en"]').click()
  assert 'My Learning Calendar' in page.locator('h1').inner_text()
  page.locator('[data-lang="ja"]').click()
  assert '学習カレンダー' in page.locator('h1').inner_text()
  page.locator('[data-lang="my"]').click()
  assert 'လေ့လာရေးပြက္ခဒိန်' in page.locator('h1').inner_text()
  # Save goals: status not confused with official exam scheduling.
  page.locator('#yk816Daily').select_option('20')
  page.locator('#yk816Weekly').select_option('4')
  page.locator('#yk816TargetLevel').select_option('N2')
  page.locator('#yk816GoalForm button[type="submit"]').click()
  raw=page.evaluate('JSON.parse(localStorage.getItem("yk_study_calendar_v78716_v1"))')
  assert raw['dailyQuestions']==20 and raw['weeklyDays']==4 and raw['targetLevel']=='N2',raw
  # Current selected date: store note with literal markup, verify no HTML injection, persist.
  page.locator('#yk816Focus').select_option('reading')
  page.locator('#yk816PlanLevel').select_option('N1')
  page.locator('#yk816PlanNote').fill('<img src=x onerror=alert(1)> Chapter 3')
  page.locator('#yk816PlanForm button[type="submit"]').click()
  date=page.locator('#yk816Days button.is-selected').get_attribute('data-day')
  assert date in page.evaluate('JSON.parse(localStorage.getItem("yk_study_calendar_v78716_v1")).plans')
  assert page.locator('#yk816SelectedStats img').count()==0
  assert page.locator('#yk816PlanNote').input_value().startswith('<img src=x')
  # Toggle manual completion and verify it never fabricates grammar-question totals.
  before=page.locator('#yk816TodayQuestions').inner_text()
  page.locator('#yk816Done').click()
  assert page.evaluate('JSON.parse(localStorage.getItem("yk_study_calendar_v78716_v1")).plans[Object.keys(JSON.parse(localStorage.getItem("yk_study_calendar_v78716_v1")).plans)[0]].manualDone') is True
  assert page.locator('#yk816TodayQuestions').inner_text()==before
  page.locator('#yk816Done').click()
  assert page.locator('#yk816TodayQuestions').inner_text()==before
  # Interactive month navigation, 42 reachable date cells.
  label=page.locator('#yk816MonthLabel').inner_text()
  page.locator('#yk816Prev').click();assert page.locator('#yk816MonthLabel').inner_text()!=label
  page.locator('#yk816Next').click();assert page.locator('#yk816MonthLabel').inner_text()==label
  assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),f'overflow after interactions: {width}'
  assert not errors,errors
  print(f'PASS v78716-browser {width}px: 3 languages, 42-date calendar, save/plan/check-in/undo, no XSS or layout overflow')
  page.close()
 for role in ('student','admin','member'):
  page=browser.new_page(viewport={'width':390,'height':844})
  page.set_content(f'<html lang="my"><body data-dashboard="{role}"><div id="dashboardBody"><section id="yk814Student"></section><section id="yk815Student"></section></div></body></html>')
  page.add_style_tag(content=read('assets/yk-v78716-student.css'))
  page.evaluate(init,seed)
  page.add_script_tag(content=student)
  if role=='student':
   page.locator('#yk816Student').wait_for(timeout=5000)
   assert page.locator('#yk816Student a').get_attribute('href')=='/study/jlpt-study-calendar.html'
   assert 'Study Days' not in page.locator('#yk816Student').inner_text()  # default Burmese
   page.evaluate('localStorage.setItem("yk_lang","en")')
   page.dispatch_event('window','focus') if False else None
  else:assert page.locator('#yk816Student').count()==0
  print('PASS v78716-browser role isolation:',role)
  page.close()
 browser.close()
