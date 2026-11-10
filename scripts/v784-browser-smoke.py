#!/usr/bin/env python3
"""Local Chromium UI smoke using fabricated fixture responses, not production auth/DB."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
admin={
 'periodDays':30,'generatedAt':'2026-11-09T10:00:00.000Z','timezone':'Asia/Tokyo',
 'students':{'total':218,'active':165},'payments':{'pending':8,'approved':45,'rejected':3},
 'exams':{'submitted':103,'verified':90,'passed':66,'passRate':73.3,
  'daily':[{'day':'2026-11-07','verified':10,'passed':6,'submitted':11},{'day':'2026-11-08','verified':18,'passed':15,'submitted':22},{'day':'2026-11-09','verified':12,'passed':10,'submitted':13}],
  'byType':[{'type':'truck','submitted':25,'verified':21,'passed':14,'passRate':66.7},{'type':'jlpt_n4','submitted':20,'verified':18,'passed':14,'passRate':77.8}]},
 'ykcr':{'received':250,'inbound24h':7,'inbound7d':35,'lastReceivedAt':'2026-11-09T09:30:00Z','queueStatus':'unknown'},
 'learning':{'accounts':52,'lessonsCompleted':328,'recentlyUpdated':19,'dailyPractice':[{'day':'2026-11-07','sessions':6,'count':60,'correct':48},{'day':'2026-11-08','sessions':9,'count':90,'correct':58},{'day':'2026-11-09','sessions':12,'count':120,'correct':96}]}
}
student={
 '/.netlify/functions/exam-my-activity':{'attempts':[{'status':'submitted','exam_type':'truck','score':25,'score_verified':True,'passed':False},{'status':'submitted','exam_type':'truck','score':30,'score_verified':True,'passed':False},{'status':'submitted','exam_type':'jlpt_n4','score':140,'score_verified':True,'passed':True}]},
 '/.netlify/functions/yk-learning':{'mistakes':[{'exam_type':'truck','question_text':'安全確認を忘れた','missed_count':3,'last_missed':'2026-11-08'}]},
 '/.netlify/functions/jlpt-learning-progress':{'state':{'lastLevel':'N4','completed':['N4-v-1'],'dailyRuns':[{'day':'2026-11-08','count':10,'correct':7}]}},
 '/assets/jlpt-learning-v782-content.json':{'levels':{'N4':{'vocabulary':[{'id':'N4-v-1'},{'id':'N4-v-2'}],'grammar':[{'id':'N4-g-1'}],'kanji':[{'id':'N4-k-1'}],'reading':[{'id':'N4-r-1'}],'listening':[{'id':'N4-l-1'}]},'N5':{'vocabulary':[{'id':'N5-v-1'}]}}},
 '/assets/jlpt-reading-v7822-upgrade.json':{'levels':{'N4':{'exercises':[{'id':'N4-r-2'}]}}}
}

def run(page,role,width):
 page.set_viewport_size({'width':width,'height':844})
 page.set_content(f'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body data-dashboard="{role}"><main class="shell"><h1>{role.title()} Dashboard</h1><div id="dashboardBody"><div id="{"adminStats" if role=="admin" else "myAttempts"}"></div></div></main></body></html>')
 for css in ['assets/yk-dashboard-v759.css','assets/yk-dashboard-pro-v784.css']:
  page.add_style_tag(content=(root/css).read_text())
 data={'/.netlify/functions/exam-admin-analytics':admin} if role=='admin' else student
 page.evaluate('''data => {window.fetch=async (path)=>{
   const key=String(path).split('?')[0];
   const obj=data[key];if(!obj)return {ok:false,status:404,json:async()=>({error:'Unknown fixture'})};
   return {ok:true,status:200,json:async()=>structuredClone(obj)};
 }}''',data)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_script_tag(content=(root/'assets/yk-dashboard-pro-v784-engine.js').read_text())
 page.add_script_tag(content=(root/'assets/yk-dashboard-pro-v784.js').read_text())
 page.wait_for_selector('#yk84'+('Admin' if role=='admin' else 'Student')+' .yk84-kpis',timeout=10000)
 print(role,width,'METRICS=',page.locator('.yk84-metric').count(),'GRAPH=',page.locator('.yk84-bars').count(),'ACTION=',page.locator('.yk84-action').count(),'HORIZONTAL_SCROLL=',page.evaluate('document.documentElement.scrollWidth>window.innerWidth'))
 assert not errors,errors
 assert page.locator('.yk84-metric').count()==4
 assert not page.evaluate('document.documentElement.scrollWidth>window.innerWidth'),'horizontal overflow'
 if role=='admin':
  assert '73.3%' in page.locator('#yk84AdminBody').inner_text()
  page.locator('#yk84AdminPeriod').select_option('7')
  page.wait_for_function("document.getElementById('yk84AdminBody').getAttribute('aria-busy')==='false'")
  assert page.locator('.yk84-bars').count()==2
  assert 'Not connected' in page.locator('#yk84AdminBody').inner_text()
 else:
  assert page.locator('.yk84-action').count()>=2
  assert 'not test weakness' in page.locator('#yk84StudentBody').inner_text()
  page.locator('#yk84StudentLevel').select_option('N5')
  assert 'JLPT N5' in page.locator('#yk84StudentBody').inner_text()
 p=root.parent/f'v784_preview_{role}_{width}.png'
 page.screenshot(path=str(p),full_page=True)
 print('SCREENSHOT',p)

with sync_playwright() as play:
 browser=play.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for role in ['admin','student']:
   page=browser.new_page()
   for width in (1280,390):run(page,role,width)
   page.close()
 finally:browser.close()
print('v784 Browser UI fixtures: 4 PASS')
