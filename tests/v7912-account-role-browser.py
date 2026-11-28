"""Synthetic-only role popup integration. Every non-local request and every
non-GET API request is blocked. No identity or customer accounts touched."""
import asyncio,json,os,shutil
from pathlib import Path
from collections import Counter
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from functools import partial
from urllib.parse import urlparse
from playwright.async_api import async_playwright
D=Path('dist').resolve()
assert (D/'mock-exams.html').is_file(), 'Run npm run build first'
class Q(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
 def copyfile(self,s,o):
  try:super().copyfile(s,o)
  except(BrokenPipeError,ConnectionResetError):pass
srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Q,directory=str(D)));Thread(target=srv.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{srv.server_port}'
async def main():
 results=[];fail=[];sem=asyncio.Semaphore(4)
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  async def case(kind,w,path='/mock-exams.html'):
   async with sem:
    c=await b.new_context(viewport={'width':w,'height':844},is_mobile=w<=720,has_touch=w<=720,service_workers='block')
    await c.add_init_script("localStorage.setItem('yk_lang','en')")
    p=await c.new_page();calls=Counter();writes=[];errors=[];dialogs=[]
    p.on('pageerror',lambda e:errors.append(str(e)))
    async def dialog(d):dialogs.append(d.message);await d.dismiss()
    p.on('dialog',dialog)
    user={'id':'syn-qa','email':'qa@example.invalid','roles':['admin'] if kind in ('client-admin','error','malformed','wrong-email','unauth','legacy-deny') else []}
    server={'roles':[] if kind in ('client-admin','legacy-deny') else ['admin'],'authenticated':True,'email':user['email'],'student':None,'paid':None,'freeUsedTypes':[]}
    state={'slow':False,'bad':False,'malformed':False,'wrong':False,'unauth':False}
    gate=asyncio.Event()
    async def route(r):
     path=urlparse(r.request.url).path
     if not r.request.url.startswith(base+'/'):return await r.abort()
     if path=='/assets/identity.bundle.js':
      return await r.fulfill(status=200,content_type='application/javascript',body=f"""window.YKIdentity={{getUser:async()=>sessionStorage.getItem('logout')?null:sessionStorage.getItem('switch')?{{id:'different',email:'other@example.invalid',roles:['admin']}}:{json.dumps(user)},logout:async()=>sessionStorage.setItem('logout','1'),handleCallback:async()=>null}};window.dispatchEvent(new Event('yk-identity-ready'));""")
     if path.startswith('/.netlify/functions/'):
      ep=path.split('/')[-1];calls[ep]+=1
      if r.request.method!='GET':writes.append(ep);return await r.fulfill(status=405,json={'error':'Offline test'})
      if ep=='exam-status':
       if state['slow']:await gate.wait()
       d={**server}
       if state['malformed']:d['roles']='admin'
       if state['wrong']:d['email']='other@example.invalid'
       if state['unauth']:d['authenticated']=False
       return await r.fulfill(status=503 if state['bad'] else 200,json={'error':'QA unavailable'} if state['bad'] else d)
      fixtures={'exam-my-activity':{'attempts':[],'payments':[]},'exam-admin-payments':{'payments':[]},'exam-admin-overview':{'students':{'active':0,'total':0},'payments':{'pending':0},'attempts':{'submitted':0},'ykcr':{'received':0}},'exam-admin-analytics':{'periodDays':30,'students':{'active':0,'total':0},'payments':{'pending':0},'exams':{'passRate':0},'ykcr':{}}}
      return await r.fulfill(status=200 if ep in fixtures else 404,json=fixtures.get(ep,{'error':'not mocked'}))
     return await r.continue_()
    await c.route('**/*',route)
    try:
     await p.goto(base+path,wait_until='domcontentloaded')
     await p.wait_for_function("document.querySelector('#examAccessTitleV728')?.innerText.includes('Access')",timeout=8000)
     await p.wait_for_function("document.getElementById('examAccountV735')?.textContent.includes('My Account')",timeout=10000)
     await p.wait_for_timeout(200)
     if kind=='legacy-deny':
      await p.evaluate("window.YKExamAccess.adminDashboard()")
      assert dialogs and 'could not be verified' in dialogs[-1]
      assert not await p.locator('#adminCsv').is_visible() and not calls['exam-admin-payments']
     elif kind=='legacy-allow':
      await p.evaluate("window.YKExamAccess.adminDashboard()")
      await p.locator('#adminCsv').wait_for(timeout=8000)
      assert calls['exam-admin-payments']==1
     else:
      state['bad']=kind=='error';state['malformed']=kind=='malformed';state['wrong']=kind=='wrong-email';state['unauth']=kind=='unauth'
      state['slow']=kind in ('pending','switch','logout','identity-event','close-reopen')
      await p.locator('#examAccountV735').click()
      role=p.locator('#yk09AccountRole');await role.wait_for()
      if state['slow']:
       assert await role.get_attribute('aria-busy')=='true'
       assert not await p.locator('#openAdminV735').is_visible()
       if kind=='switch':await p.evaluate("sessionStorage.setItem('switch','1')")
       if kind=='logout':await p.locator('#authLogout').click()
       if kind=='identity-event':await p.evaluate("window.dispatchEvent(new CustomEvent('yk-identity-callback',{detail:{type:'email_change'}}))")
       if kind=='close-reopen':await p.locator('#examV728Overlay .exam-v728-close').click()
       state['slow']=False;gate.set()
      if kind in ('logout','identity-event','close-reopen'):
       await p.wait_for_function("!document.querySelector('#examV728Overlay')?.classList.contains('open')")
       await p.wait_for_timeout(150)
       assert not await p.locator('#openAdminV735').is_visible()
       if kind=='close-reopen':
        server['roles']=[]
        await p.locator('#examAccountV735').click()
        await p.wait_for_function("document.querySelector('#yk09AccountRole')?.getAttribute('aria-busy')==='false'")
        assert (await role.inner_text())=='member'
      else:
       await p.wait_for_function("document.querySelector('#yk09AccountRole')?.getAttribute('aria-busy')==='false'",timeout=10000)
       if kind in ('error','malformed','wrong-email','unauth','switch'):
        assert await p.locator('#yk09AccountRetry').is_visible()
        assert not await p.locator('#openAdminV735').is_visible()
        assert (await p.locator('#yk09AccountEmail').inner_text())=='—'
        if kind=='error':
         state['bad']=False
         await p.locator('#yk09AccountRetry').click()
         await p.locator('#openAdminV735').wait_for()
         assert await p.locator('#yk09AccountEmail').inner_text()==user['email']
       elif kind=='client-admin':
        assert (await role.inner_text())=='member'
        assert not await p.locator('#openAdminV735').is_visible()
       else:
        assert (await role.inner_text())=='admin',(await role.inner_text())
        assert await p.locator('#openAdminV735').is_visible()
        if kind=='downgrade':
         server['roles']=[]
         await p.locator('#openAdminV735').click()
         await p.wait_for_function("document.querySelector('#yk09AccountRole')?.getAttribute('aria-busy')==='false'")
         assert (await role.inner_text())=='member' and not await p.locator('#openAdminV735').is_visible()
         assert urlparse(p.url).path==path
        if kind=='navigate':
         await p.locator('#openAdminV735').click()
         await p.wait_for_url('**/admin-dashboard.html')
     assert not writes,writes
     assert not errors,errors
     results.append((kind,w,path));print('PASS',kind,w,path,flush=True)
    except Exception as e:fail.append((kind,w,path,repr(e)));print('FAIL',kind,w,path,repr(e)[:900],flush=True)
    finally:state['slow']=False;gate.set();await c.close()
  cases=[(x,w,'/mock-exams.html') for w in [390,1440] for x in ['client-admin','server-admin','error','pending','downgrade']]+[(x,390,'/mock-exams.html') for x in ['malformed','wrong-email','unauth','switch','logout','identity-event','close-reopen','navigate','legacy-deny','legacy-allow']]+[(x,390,pa) for x,pa in [('client-admin','/exams/truck.html'),('server-admin','/exams/taxi.html'),('server-admin','/exams/jlpt_n5.html'),('error','/exams/car.html')]]
  await asyncio.gather(*(case(*a) for a in cases));await b.close()
 if os.environ.get('YK7912_ACCOUNT_ROLE_RESULTS'):
  Path(os.environ['YK7912_ACCOUNT_ROLE_RESULTS']).write_text(json.dumps({'pass':results,'fail':fail},indent=2))
 print('TOTAL',len(results),'PASS',len(fail),'FAIL',flush=True);return bool(fail)
raise SystemExit(asyncio.run(main()))
