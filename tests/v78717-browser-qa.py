"""Synthetic browser QA only. Mocks private admin endpoints; never hits Netlify."""
from pathlib import Path
import os,re,json,datetime
from zoneinfo import ZoneInfo
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
read=lambda p:(ROOT/p).read_text()
today=datetime.datetime.now(ZoneInfo('Asia/Tokyo')).date()
yesterday=(today-datetime.timedelta(days=1)).isoformat()
tomorrow=(today+datetime.timedelta(days=3)).isoformat()
leads=[
 {'id':1,'name':'<img src=x onerror=alert(1)> Name','channel':'messenger','contact':'fb-test','course':'truck','source':'facebook','status':'contacted','followUpDate':yesterday,'notes':'Asked about next class','studentCode':None},
 {'id':2,'name':'Taxi Person','channel':'email','contact':'mail@example.test','course':'taxi','source':'youtube','status':'interested','followUpDate':tomorrow,'notes':'','studentCode':None},
 {'id':3,'name':'Truck Enrolled','channel':'phone','contact':'000-111','course':'truck','source':'facebook','status':'enrolled','followUpDate':yesterday,'notes':'','studentCode':None}
]
cohort={'total':3,'counts':{'new':0,'contacted':1,'interested':1,'enrolled':1,'closed':0},'byCourse':{'truck':{'total':2,'enrolled':1,'interested':0},'taxi':{'total':1,'enrolled':0,'interested':1}},'bySource':{'facebook':{'total':2,'enrolled':1,'interested':0},'youtube':{'total':1,'enrolled':0,'interested':1}}}
dueSample=[{'id':1,'name':leads[0]['name'],'course':'truck','source':'facebook','status':'contacted','date':yesterday}]
insights={'cohort':cohort,'followups':{'overdue':1,'today':0,'next7Days':1,'unscheduled':0,'dueSample':dueSample}}
crm={'leads':leads,'summary':{'counts':{'new':0,'contacted':1,'interested':1,'enrolled':1,'closed':0},'due':1}}
api_init='''({insights,crm})=>{
 window.__ykLanguage='my';window.YKDashboardLanguageV759={getLanguage:()=>window.__ykLanguage};
 window.YKUiLanguageV78712={t:x=>x};
 window.__req=[];
 window.fetch=async(input,init)=>{let url=String(input);window.__req.push(url);
  if(url.includes('yk-enrollment-insights'))return new Response(JSON.stringify(insights),{status:200,headers:{'content-type':'application/json'}});
  if(url.includes('yk-business-growth'))return new Response(JSON.stringify({clicks:{total:12}}),{status:200,headers:{'content-type':'application/json'}});
  if(url.includes('yk-enrollment-crm'))return new Response(JSON.stringify(crm),{status:200,headers:{'content-type':'application/json'}});
  if(url.includes('yk-announcement-admin'))return new Response(JSON.stringify({announcements:[]}),{status:200,headers:{'content-type':'application/json'}});
  return new Response('not mocked',{status:404});};
}'''
base='''<!doctype html><html lang="my"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body data-dashboard="{role}"><header><span id="ykCurrentLanguage">မြန်မာ</span></header><main class="shell"><section id="dashboardBody"><section id="adminStats">Admin verified</section></section></main></body></html>'''
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('YK_CHROMIUM_PATH') or '/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in [390,1280]:
  page=browser.new_page(viewport={'width':width,'height':844},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(base.format(role='admin'))
  page.evaluate(api_init,{'insights':insights,'crm':crm})
  page.add_style_tag(content=read('assets/yk-v7878-admin.css')+read('assets/yk-v78717-admin.css'))
  page.add_script_tag(content=read('assets/yk-v7878-admin.js'))
  page.add_script_tag(content=read('assets/yk-v78717-admin.js'))
  panel=page.locator('#yk817Insights');panel.wait_for(timeout=8000)
  assert page.evaluate('window.__req.length')==0,'Panel must not fetch data before opened'
  panel.locator('summary').click()
  page.locator('#yk817Body .yk817-card').first.wait_for(timeout=8000)
  assert '3' in page.locator('#yk817Body').inner_text()
  assert len(page.locator('#yk817Body .yk817-chartline').all())==4
  assert '12' in page.locator('.yk817-clickrow').inner_text()
  assert 'not' in page.locator('#yk817Body').inner_text().lower() or 'မဟုတ်' in page.locator('#yk817Body').inner_text()
  assert page.locator('#yk817Body img').count()==0,'Potential injection in due lead name'
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'),f'horizontal overflow {width}'
  # CRM can still create/edit, and query filters never erase in-progress form data.
  page.locator('[data-yk817-opencrm]').click()
  page.locator('#yk878LeadForm').wait_for(timeout=5000)
  page.locator('#yk878LeadForm input[name="name"]').fill('Keep my draft')
  assert page.locator('#yk878CRMContent [data-yk878-row]').count()==3
  page.locator('#yk878Search').fill('Taxi')
  assert page.locator('#yk878CRMContent [data-yk878-row]:visible').count()==1
  assert page.locator('#yk878LeadForm input[name="name"]').input_value()=='Keep my draft'
  page.locator('#yk878ResetFilters').click()
  page.locator('#yk878DueOnly').check()
  assert page.locator('#yk878CRMContent [data-yk878-row]:visible').count()==1
  page.locator('#yk878ResetFilters').click()
  page.locator('#yk878CourseFilter').select_option('truck')
  assert page.locator('#yk878CRMContent [data-yk878-row]:visible').count()==2
  assert page.locator('#yk878CRMContent img').count()==0
  # Change language + period on the insights without re-fetching the CRM or deleting the form draft.
  page.evaluate('window.__ykLanguage="en";document.getElementById("ykCurrentLanguage").textContent="English"')
  assert 'Marketing & Enrollment' in page.locator('#yk817Title').inner_text()
  assert 'Name / contact' in page.locator('#yk878Search').get_attribute('placeholder')
  page.locator('#yk817Period').select_option('90')
  page.locator('#yk817Body .yk817-card').first.wait_for(timeout=5000)
  page.evaluate('window.__ykLanguage="ja";document.getElementById("ykCurrentLanguage").textContent="日本語"')
  assert '受講相談' in page.locator('#yk817Title').inner_text()
  assert '氏名' in page.locator('#yk878Search').get_attribute('placeholder')
  page.evaluate('window.__ykLanguage="my";document.getElementById("ykCurrentLanguage").textContent="မြန်မာ"')
  assert 'စုံစမ်းမှု' in page.locator('#yk817Title').inner_text()
  assert 'အမည်' in page.locator('#yk878Search').get_attribute('placeholder')
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2')
  assert not errors,errors
  assert not any('POST' in x for x in page.evaluate('window.__req'))
  print(f'PASS v78717-browser {width}px: admin-only, lazy fetch, real CRM filters, no input loss, languages, safe names, no overflow')
  page.close()
 for role in ('student','member'):
  page=browser.new_page(viewport={'width':390,'height':844})
  page.set_content(base.format(role=role));page.evaluate(api_init,{'insights':insights,'crm':crm})
  page.add_script_tag(content=read('assets/yk-v7878-admin.js'))
  page.add_script_tag(content=read('assets/yk-v78717-admin.js'))
  assert page.locator('#yk817Insights').count()==0
  assert page.evaluate('window.__req.length')==0
  print('PASS v78717-browser role isolation:',role);page.close()
 browser.close()
