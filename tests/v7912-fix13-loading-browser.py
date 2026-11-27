"""Offline Chromium regression for Home and all legacy exam loaders.
No real login, personal records, external traffic or writes."""
import asyncio, json, os, shutil
from pathlib import Path
from collections import Counter
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from urllib.parse import urlparse
from playwright.async_api import async_playwright
D=Path('dist').resolve()
E=Path(os.environ.get('YK_FIX13_EVIDENCE','../evidence')).resolve();E.mkdir(parents=True,exist_ok=True)
class Q(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
 def copyfile(self,s,o):
  try:super().copyfile(s,o)
  except (BrokenPipeError,ConnectionResetError):pass
srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Q,directory=str(D)))
Thread(target=srv.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{srv.server_port}'
student={'name':'Synthetic QA','class_name':'TRUCK','expire_date':'2099-01-01','student_code':'SYN-001','class_start':'2026-01-01','access_state':'active'}
results=[];fails=[]
async def main():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  sem=asyncio.Semaphore(3)
  async def fixture(width,role,delay='none',reduced='no-preference',theme='dark'):
   c=await b.new_context(viewport={'width':width,'height':844},is_mobile=width<=720,has_touch=width<=720,service_workers='block',reduced_motion=reduced)
   await c.add_init_script("localStorage.setItem('yk_lang','en');window.addEventListener('error',e=>{if(e.message)window.__qaErrs=(window.__qaErrs||[]).concat(e.message)});")
   p=await c.new_page();gate=asyncio.Event();writes=[];calls=Counter();state={'error':False}
   status={'authenticated':True,'email':'fixture@example.invalid','roles':['admin'] if role=='admin' else [],'student':student if role=='student' else None,'paid':{'expires_at':'2099-01-01T00:00:00Z'} if role=='paid' else None,'freeUsedTypes':['truck'] if role=='member' else [],'linkedStudent':None}
   user=None if role=='guest' else {'id':'synthetic-only','email':status['email'],'roles':status['roles']}
   async def route(r):
    path=urlparse(r.request.url).path
    if not r.request.url.startswith(BASE+'/'):return await r.abort()
    if r.request.method!='GET':writes.append(path);return await r.fulfill(status=405,json={'error':'offline test'})
    if path=='/assets/identity.bundle.js':
     if delay=='boot':await gate.wait()
     js=f"window.YKIdentity={{getUser:async()=>({json.dumps(user)}),handleCallback:async()=>null,logout:async()=>null}};window.dispatchEvent(new Event('yk-identity-ready'));"
     return await r.fulfill(content_type='application/javascript',body=js)
    if path.startswith('/.netlify/functions/'):
     ep=path.split('/')[-1];calls[ep]+=1
     if delay=='status' and ep in ('exam-status','exam-my-activity'):await gate.wait()
     if state['error'] and ep=='exam-status':return await r.fulfill(status=503,json={'error':'synthetic unavailable'})
     payload={'exam-status':status,'exam-my-activity':{'attempts':[],'payments':[]},'yk-learning':{'mistakes':[],'announcements':[]},'dictionary-overrides':{'overrides':[]},'jlpt-learning-progress':{'progress':[]}}
     return await r.fulfill(status=200,json=payload.get(ep,{}))
    if delay=='dictionary' and path.endswith('yk-dictionary-runtime-v7863.js'):await gate.wait()
    return await r.continue_()
   await c.route('**/*',route)
   return c,p,gate,writes,calls,state
  async def verify(cond,msg):
   assert cond,msg
  async def home_case(w,role,delay,reduced='no-preference',theme='dark',error=False,timeout=False):
   label=f'Home {w} {role} {delay} {reduced} {theme}'+(' error' if error else '')+(' timeout' if timeout else '')
   async with sem:
    c,p,gate,writes,calls,state=await fixture(w,role,delay,reduced,theme)
    state['error']=error
    try:
     await p.goto(BASE+'/',wait_until='commit' if delay=='boot' else 'domcontentloaded')
     sk=p.locator('#yk7913HomeSkeleton')
     if delay!='none':
      await sk.wait_for(state='visible',timeout=10000)
      if theme=='light':await p.evaluate("document.documentElement.dataset.ykUiTheme='light'")
      assert await sk.locator('.yk791-sk-row').count()==3
      assert await sk.locator('.yk791-sk-circle').first.evaluate("e=>getComputedStyle(e).animationName")==('none' if reduced=='reduce' else 'yk791Shimmer')
      assert not await p.locator('#yk790MobileHome').is_visible()
      if w==390 and role=='member' and delay=='status' and reduced=='no-preference' and theme=='dark' and not error and not timeout:await p.screenshot(path=str(E/'home-mobile-pending.png'))
      if w==1440:await p.screenshot(path=str(E/'home-pc-pending.png'))
      if timeout:
       await sk.wait_for(state='hidden',timeout=18000)
       assert await p.locator('#yk791HomeRetry').is_visible()
       gate.set();await p.wait_for_timeout(150)
       assert await p.locator('#yk791HomeRetry').is_visible()
       await p.locator('#yk791HomeRetry').click()
      else:gate.set()
     await sk.wait_for(state='hidden',timeout=16000)
     if w<=720:
      await p.locator('#yk790MobileHome').wait_for(timeout=10000)
      assert await p.locator('#yk790MobileHome').get_attribute('data-yk-home-loading')=='false'
      assert await p.locator('.yk790-welcome').evaluate("e=>getComputedStyle(e,'::before').content")== 'none'
      if error:
       assert await p.locator('#yk791HomeRetry').is_visible()
       state['error']=False;await p.locator('#yk791HomeRetry').click()
       await p.wait_for_function("document.querySelector('#yk790MobileHome').dataset.ykHomeLoading==='false' && document.querySelector('#yk791HomeRetry').hidden")
      assert await p.locator('#yk790Membership').get_attribute('data-yk-access-state')==role, (await p.locator('#yk790Membership').get_attribute('data-yk-access-state'),role)
      assert await p.locator('#yk790QuickSearch input').is_visible()
      if delay=='none':
       await p.evaluate("location.hash='#driving-dictionary'")
       await p.wait_for_function("!document.body.classList.contains('yk790-mobile-home')")
       assert not await sk.is_visible()
       await p.evaluate("location.hash='#home'")
       await p.locator('#yk790MobileHome').wait_for()
     else:
      assert await p.locator('body > .wrap').is_visible()
      assert not await p.locator('#yk790MobileHome').is_visible()
     assert not writes,writes
     assert not await p.evaluate('window.__qaErrs||[]'),await p.evaluate('window.__qaErrs||[]')
     assert await p.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
     results.append(label);print('PASS',label,flush=True)
    except Exception as ex:
     fails.append(label+': '+str(ex));print('FAIL',label,str(ex)[:400],flush=True)
    finally:gate.set();await c.close()
  async def exam_case(path,w,role,error=False,reduced='no-preference',timeout=False):
   label=f'Exam {path} {w} {role} {reduced}'+(' error' if error else '')+(' timeout' if timeout else '')
   async with sem:
    c,p,gate,writes,calls,state=await fixture(w,role,'status' if role!='guest' else 'boot',reduced)
    state['error']=error
    try:
     await p.goto(BASE+path,wait_until='commit' if role=='guest' else 'domcontentloaded')
     sk=p.locator('.yk791-exam-skeleton');await sk.wait_for(state='visible',timeout=10000)
     card=p.locator('#online-mock-exam .yk-approved-access')
     assert await card.get_attribute('aria-busy')=='true'
     assert await sk.locator('.yk791-sk-circle').first.evaluate("e=>getComputedStyle(e).animationName")==('none' if reduced=='reduce' else 'yk791Shimmer')
     assert not await card.locator('.exam-access-main').is_visible()
     if path=='/exams/truck.html' and w==390:await p.screenshot(path=str(E/'truck-loading.png'))
     if not timeout:gate.set()
     await sk.wait_for(state='hidden',timeout=16000)
     expected='error' if error or timeout else ('member-used' if role=='member' else role)
     assert await card.get_attribute('data-yk-access-state')==expected,(await card.get_attribute('data-yk-access-state'),expected)
     if error or timeout:
      assert await p.locator('#yk791AccessRetry').is_visible()
      gate.set()
      state['error']=False;await p.locator('#yk791AccessRetry').click()
      await p.wait_for_function("document.querySelector('.yk-approved-access').dataset.ykAccessState==='member-used'")
     assert await card.get_attribute('aria-busy')=='false'
     assert await p.locator('.exam-launch-v728:visible').count()>=1
     assert not writes,writes
     assert not await p.evaluate('window.__qaErrs||[]'),await p.evaluate('window.__qaErrs||[]')
     results.append(label);print('PASS',label,flush=True)
    except Exception as ex:
     fails.append(label+': '+str(ex));print('FAIL',label,str(ex)[:400],flush=True)
    finally:gate.set();await c.close()
  async def browse_case(path,w):
   label=f'Browse {path} {w}'
   async with sem:
    c,p,gate,writes,calls,state=await fixture(w,'guest')
    try:
     await p.goto(BASE+path,wait_until='domcontentloaded')
     await p.wait_for_timeout(350)
     assert await p.locator('body').is_visible()
     assert not await p.locator('#yk7913HomeSkeleton:visible').count()
     assert not await p.locator('.yk791-exam-skeleton:visible').count()
     assert not writes,writes
     assert not await p.evaluate('window.__qaErrs||[]'),await p.evaluate('window.__qaErrs||[]')
     results.append(label);print('PASS',label,flush=True)
    except Exception as ex:
     fails.append(label+': '+str(ex));print('FAIL',label,str(ex)[:400],flush=True)
    finally:gate.set();await c.close()
  async def pending_case(path,w,role,reduced='no-preference',dictionary=False,error=False):
   label=f'Pending {path} {w} {role} {reduced}'+(' error' if error else '')
   async with sem:
    c,p,gate,writes,calls,state=await fixture(w,role,'dictionary' if dictionary else 'status',reduced)
    state['error']=error
    try:
     await p.goto(BASE+path,wait_until='domcontentloaded')
     if dictionary:
      elem=p.locator('#dictionaryResults[aria-busy="true"] > .dictionary-empty[role="status"]')
      await elem.wait_for(state='visible')
      assert await elem.evaluate("e=>getComputedStyle(e,'::after').animationName")==('none' if reduced=='reduce' else 'yk07Shimmer')
      assert not await p.locator('#yk7913HomeSkeleton').is_visible()
      gate.set()
      await p.wait_for_function("!document.querySelector('#dictionaryResults').hasAttribute('aria-busy')")
      await p.locator('#dictionaryResults').wait_for(state='visible')
     else:
      elem=p.locator('#dashboardBody > .yk07-skeleton')
      await elem.wait_for(state='visible')
      assert await elem.locator('.yk07-sk-heading').first.evaluate("e=>getComputedStyle(e).animationName")==('none' if reduced=='reduce' else 'yk07Shimmer')
      gate.set();await elem.wait_for(state='hidden')
      if error:
       assert await p.locator('#dashMessage.error').is_visible()
      else:
       await p.locator('#dashboardBody .yk7912-tiles').wait_for(state='visible')
     assert not writes,writes
     assert not await p.evaluate('window.__qaErrs||[]'),await p.evaluate('window.__qaErrs||[]')
     results.append(label);print('PASS',label,flush=True)
    except Exception as ex:
     fails.append(label+': '+str(ex));print('FAIL',label,str(ex)[:400],flush=True)
    finally:gate.set();await c.close()
  homes=[(1440,'guest','boot'),(390,'guest','boot'),(320,'guest','none'),(390,'member','status'),(430,'student','status'),(390,'admin','status'),(390,'paid','status'),(390,'member','status','reduce'),(390,'member','status','no-preference','light'),(390,'member','status','no-preference','dark',True),(390,'member','status','no-preference','dark',False,True)]
  paths=['/mock-exams.html']+['/exams/'+x.name for x in sorted((D/'exams').glob('*.html'))]
  roles=['member','guest','admin','student','paid']
  exams=[(path,w,roles[i%len(roles)]) for i,path in enumerate(paths) for w in (390,1440)]+[('/exams/truck.html',390,'member',True),('/exams/bus.html',390,'member',False,'reduce'),('/exams/truck.html',390,'member',False,'no-preference',True)]
  other=['/'+str(q.relative_to(D)) for q in sorted(D.rglob('*.html')) if str(q.relative_to(D))!='index.html' and str(q.relative_to(D)) not in [x.lstrip('/') for x in paths]]
  pending=[('/member-dashboard.html',390,'member'),('/student-dashboard.html',1440,'student','reduce'),('/admin-dashboard.html',390,'admin'),('/member-dashboard.html',1440,'member','no-preference',False,True),('/?yk_dictionary_q=%E6%A8%AA%E6%96%AD%E6%AD%A9%E9%81%93#driving-dictionary',390,'guest','no-preference',True),('/?yk_dictionary_q=%E6%A8%AA%E6%96%AD%E6%AD%A9%E9%81%93#driving-dictionary',1440,'guest','reduce',True)]
  # All generated browsing/auth/second-exam/dashboard routes receive smoke checks.
  if os.environ.get('YK_FIX13_ONLY_PENDING'):
   await asyncio.gather(*(pending_case(*x) for x in pending))
  else:await asyncio.gather(*(home_case(*x) for x in homes),*(exam_case(*x) for x in exams),*(browse_case(p,w) for p in other for w in (390,1440)),*(pending_case(*x) for x in pending))
  await b.close()
 (E/'loading-test-results.json').write_text(json.dumps({'pass':results,'fail':fails},indent=2))
 print('TOTAL',len(results),'PASS',len(fails),'FAIL',flush=True)
 return bool(fails)
raise SystemExit(asyncio.run(main()))
