"""Offline Chromium integration checks for generated v7.91.2 pages.
All Identity and API responses are synthetic. Non-local traffic and all API
writes are blocked. Run from repository root after npm run build.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
from collections import Counter
from threading import Thread
from urllib.parse import urlparse
import json, shutil, os
from playwright.sync_api import sync_playwright

DIST = Path("dist").resolve()
assert (DIST / "admin-dashboard.html").is_file()
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
    def copyfile(self, source, outputfile):
        try: super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError): pass
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Quiet, directory=str(DIST)))
Thread(target=server.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{server.server_port}"
student = dict(student_code="SYN-001", name="Synthetic Learner", class_name="TRUCK", class_start="2026-01-01", expire_date="2099-01-01", access_state="active")
attempts = [dict(exam_type="truck", status="submitted", score=35, score_verified=True, passed=True, submitted_at="2026-11-25T09:00:00Z"),
            dict(exam_type="jlpt_n5", status="submitted", score=90, score_verified=True, passed=True, submitted_at="2026-11-26T09:00:00Z")]
learning = {"mistakes":[dict(exam_type="truck",question_text="Synthetic truck question",correct_answer="Synthetic answer",explanation_ja="合成説明",explanation_my="မြန်မာရှင်းလင်းချက်",missed_count=3),
                        dict(exam_type="taxi",question_text="Synthetic taxi question",correct_answer="Other answer",explanation_ja="説明",explanation_my="ရှင်းလင်းချက်",missed_count=2)],
            "announcements":[dict(title="Synthetic notice",body="Synthetic announcement",language="my",created_at="2026-11-26")], "attempts":attempts}
pass_count=0
def capture(page,name):
    folder=os.environ.get("YK7912_SCREENSHOT_DIR")
    if folder:
        Path(folder).mkdir(parents=True,exist_ok=True)
        page.screenshot(path=str(Path(folder)/(name+".png")), full_page=True, animations="disabled")
def check(label, condition):
    global pass_count
    assert condition, label
    pass_count+=1
    print("PASS",label,flush=True)
def open_section(page,section):
    locator=page.locator(f'nav.yk7912-tiles a[href="#{section}"]')
    locator.click()
    page.wait_for_function(f"document.getElementById('{section}').open")
def no_overflow(page):
    return page.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
def setup(browser, role, width=390, error=False):
    c=browser.new_context(viewport={"width":width,"height":844},service_workers="block")
    c.add_init_script("localStorage.setItem('yk_lang','en')")
    calls=Counter();writes=[];errs=[]
    status=dict(authenticated=True,email="synthetic@example.invalid",roles=["admin"] if role=="admin" else [],student=None,linkedStudent=None,paid=None,pendingPayment=None,freeUsedTypes=["truck"])
    if role=="student":status.update(student=student,linkedStudent=student)
    if role=="paid":status.update(paid={"expires_at":"2099-01-01T00:00:00Z"})
    if role=="expired-paid":status.update(linkedStudent={**student,"access_state":"expired","expire_date":"2026-01-01"},paid={"expires_at":"2099-01-01T00:00:00Z"})
    if role=="expired":status.update(linkedStudent={**student,"access_state":"expired","expire_date":"2026-01-01"})
    if role=="pending":status.update(pendingPayment={"id":1})
    if role=="scheduled":status.update(linkedStudent={**student,"access_state":"scheduled","class_start":"2099-01-01"})
    identity={"id":"synthetic-"+role,"email":status["email"],"roles":["admin"] if role=="client-admin" else status["roles"]} if role!="guest" else None
    def route(r):
        path=urlparse(r.request.url).path
        if not r.request.url.startswith(BASE+"/"):return r.abort()
        if path=="/assets/identity.bundle.js":
            return r.fulfill(content_type="application/javascript",body=f"""window.YKIdentity={{getUser:async()=>sessionStorage.getItem('logged-out')?null:{json.dumps(identity)}, logout:async()=>sessionStorage.setItem('logged-out','1'), handleCallback:async()=>null}};
window.dispatchEvent(new Event('yk-identity-ready'));""")
        if path.startswith("/.netlify/functions/"):
            endpoint=path.split("/")[-1];calls[endpoint]+=1
            if r.request.method!="GET":writes.append(endpoint);return r.fulfill(status=405,content_type="application/json",body='{"error":"blocked by test"}')
            if endpoint=="exam-status":
                return r.fulfill(status=503 if error else 200,json={"error":"Synthetic unavailable"} if error else status)
            fixtures={
                "exam-my-activity":{"attempts":attempts,"payments":[]},
                "exam-admin-overview":{"students":{"total":10,"active":4},"attempts":{"total":20,"submitted":12},"payments":{"pending":1,"approved":2,"rejected":0},"ykcr":{"received":3}},
                "exam-admin-analytics":{"periodDays":30,"students":{"active":4,"total":10},"payments":{"pending":1},"exams":{"passRate":75,"passed":3,"verified":4,"submitted":5},"ykcr":{"inbound24h":1,"received":3},"learning":{}},
                "exam-admin-payments":{"payments":[]},
                "yk-learning":learning,
                "jlpt-learning-progress":{"state":{}},
                "exam-coach":{"analysis":None,"targetDate":None},
            }
            return r.fulfill(status=200 if endpoint in fixtures else 404,json=fixtures.get(endpoint,{"error":"not mocked"}))
        return r.continue_()
    c.route("**/*",route)
    p=c.new_page()
    p.on("pageerror",lambda e:errs.append(str(e)))
    return c,p,calls,writes,errs
def settled(p):
    p.locator("#dashboardBody .yk7912-tiles").wait_for()
    p.wait_for_function("document.getElementById('dashMessage').hidden")
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH") or shutil.which("chromium"),args=["--no-sandbox","--disable-dev-shm-usage"])
    c,p,calls,writes,errs=setup(b,"admin")
    p.goto(BASE+"/dashboard.html");p.wait_for_url("**/admin-dashboard.html");settled(p)
    p.locator("#yk84AdminBody .yk84-kpis").wait_for()
    capture(p,"admin-mobile")
    check("Admin routes to management",p.locator("#yk84Admin").count()==1 and p.locator("#yk7912ProHost").count()==0)
    check("Admin initial overview compact; detailed charts hidden",p.locator("#yk7912AdminGraphs").count()==1 and not p.locator("#yk7912AdminGraphs").is_visible() and p.locator(".yk7912-section:visible").count()==0)
    check("Admin has one overview GET",calls["exam-admin-overview"]==1)
    check("Admin no initial personal API",calls["exam-my-activity"]==0 and calls["yk-learning"]==0 and calls["jlpt-learning-progress"]==0)
    open_section(p,"yk7912Students");check("CSV form retained",p.locator("#csvForm").is_visible())
    open_section(p,"yk7912Payments");check("Payment management retained",p.locator("#paymentList").is_visible() and p.locator("#paymentFilter").is_visible())
    open_section(p,"yk7912AdminAnalytics");check("Analytics charts moved behind tile",p.locator("#yk7912AdminGraphs").is_visible() and p.locator(".yk7912-section:visible").count()==1)
    open_section(p,"yk7912Sync");check("YKCR detail separated from overview",p.locator("#yk7912SyncDetail").is_visible() and not p.locator("#yk7912AdminGraphs").is_visible())
    open_section(p,"yk7912Dictionary");check("Dictionary Reports navigation retained",p.locator('#yk7912Dictionary a[href="/dictionary-reports.html"]').is_visible())
    open_section(p,"yk7912AdminAnnouncements");p.locator("#yk760AnnForm").wait_for()
    check("Admin announcements lazy and no private study review",calls["yk-learning"]==1 and p.locator("#yk7912ReviewHost").count()==0)
    check("Admin mobile has no layout overflow",no_overflow(p))
    p.goto(BASE+"/dashboard.html?view=personal#yk7912Results");p.wait_for_url("**/admin-dashboard.html?view=personal#yk7912Results");settled(p)
    p.locator("#yk84StudentBody .yk84-kpis").wait_for(state="attached")
    check("Admin personal deep link opens results only; no management controls",p.locator("#yk7912Results").evaluate("(e)=>e.open") and p.locator("#csvForm").count()==0 and p.locator("#yk84Admin").count()==0)
    check("Admin no mutations or JS errors",not writes and not errs)
    c.close()
    for role,expected,route in [("student","Unlimited Exam Access","student"),("paid","Paid Access","member"),("expired-paid","Paid Access","student"),("expired","Student Access Not Active","student"),("scheduled","Student Access Not Active","student"),("pending","Payment Pending","member"),("free","Free Exam Access","member"),("client-admin","Free Exam Access","member")]:
        c,p,calls,writes,errs=setup(b,role)
        p.goto(BASE+"/dashboard.html");p.wait_for_url(f"**/{route}-dashboard.html");settled(p)
        check(role+" role-aware My Dashboard",p.locator(".intro h1").inner_text()=="My Dashboard" and p.locator(".yk7912-access h2").inner_text()==expected)
        p.locator("#yk84StudentBody .yk84-kpis").wait_for(state="attached")
        check(role+" shared result request and no eager review",calls["exam-my-activity"]==1 and calls["yk-learning"]==calls["jlpt-learning-progress"]==0)
        check(role+" no admin controls",p.locator("#csvForm").count()==0 and p.locator("#yk84Admin").count()==0 and p.locator("#yk760AnnForm").count()==0)
        check(role+" narrow viewport fits",no_overflow(p))
        if role=="student":
            check("Initial personal UI has no duplicate accordion rows",p.locator(".yk7912-section:visible").count()==0)
            capture(p,"student-mobile")
            open_section(p,"yk7912Learning")
            check("Pro and score trends consolidated",p.locator("#yk84Student").is_visible() and p.locator("#myLearningOverview").count()==1)
            p.locator('[data-yk863-type="truck"]').click();p.locator("#yk865Content").wait_for()
            p.wait_for_function("document.querySelector('#yk865Content').innerText.includes('My planned exam date')")
            check("Exam Coach lazy for selected exam",calls["exam-coach"]==1)
            p.locator('[data-yk7912-review-type="truck"]').click();p.locator("#yk7912MistakeType").wait_for()
            check("One expanded section at time",p.locator(".yk7912-section:visible").count()==1 and not p.locator("#yk7912Learning").is_visible())
            check("Review filtered and single data request",p.locator("#yk7912MistakeType").input_value()=="truck" and calls["yk-learning"]==1)
            p.locator("#yk7912Review .yk760-review details summary").first.click()
            check("Wrong-answer explanations retained",p.locator("#yk7912Review").inner_text().find("မြန်မာရှင်းလင်းချက်")>=0)
            p.locator("#yk7912Review [data-yk760-count='5']").click()
            check("Daily practice remains available",p.locator("#yk760Reveal").is_visible())
            open_section(p,"yk7912Announcements")
            p.locator("#yk7912AnnouncementHost .record").wait_for()
            check("Announcements reuses one request",calls["yk-learning"]==1)
            open_section(p,"yk7912JLPT")
            p.wait_for_selector("#yk82DashboardData .yk82-dashboard-card")
            check("JLPT progress loads on open",calls["jlpt-learning-progress"]>=1)
            check("Expanded sections stay inside mobile width",no_overflow(p))
            p.locator("#ykLanguageToggle").click()
            p.locator('[data-yk-lang="my"]').click()
            p.wait_for_function("document.querySelector('.intro h1').innerText.includes('ကိုယ်ပိုင်')")
            check("Burmese dashboard title and tile translation",p.locator('nav.yk7912-tiles a[href="#yk7912Results"]').inner_text().find("ရလဒ်")>=0)
            p.locator("#ykLanguageToggle").click();p.locator('[data-yk-lang="ja"]').click()
            p.wait_for_function("document.querySelector('.intro h1').innerText.includes('マイダッシュボード')")
            check("Japanese dashboard title",p.locator('nav.yk7912-tiles a[href="#yk7912Results"]').inner_text().find("試験結果")>=0)
            p.locator('.yk-ui-theme-toggle').first.click()
            p.wait_for_function("document.documentElement.getAttribute('data-yk-ui-theme')==='light'")
            check("Light theme on new dashboard shell",p.locator(".yk7912-access").evaluate("(e)=>getComputedStyle(e).backgroundColor")=="rgb(255, 255, 255)" and no_overflow(p))
        if role=="free":
            capture(p,"free-mobile")
            p.goto(BASE+"/admin-dashboard.html");p.wait_for_url("**/member-dashboard.html");settled(p)
            check("Direct admin URL redirects member",p.locator("#adminStats").count()==0 and calls["exam-admin-overview"]==0)
            open_section(p,"yk7912Account")
            check("Free member verification retained",p.locator("#studentForm").is_visible())
        check(role+" no real writes or JS errors",not writes and not errs)
        c.close()
    c,p,calls,writes,errs=setup(b,"free",error=True)
    p.goto(BASE+"/member-dashboard.html");p.locator("#retryDash").wait_for()
    check("Unavailable status fails closed",p.locator(".yk7912-tiles").count()==0 and calls["exam-my-activity"]==0 and calls["yk-learning"]==0)
    c.close()
    c,p,calls,writes,errs=setup(b,"guest")
    p.goto(BASE+"/dashboard.html");p.wait_for_url("**/login.html?return=*")
    check("Guest auth redirects to login",calls["exam-status"]==0)
    c.close()
    for width in [320,1440]:
        c,p,calls,writes,errs=setup(b,"student",width)
        p.goto(BASE+"/student-dashboard.html");settled(p)
        check(f"Personal layout {width}px",no_overflow(p))
        if width==1440: capture(p,"student-desktop")
        c.close()
    b.close()
server.shutdown()
print(f"TOTAL {pass_count} PASS / 0 FAIL")
