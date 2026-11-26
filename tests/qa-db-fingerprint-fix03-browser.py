"""Real Chromium form integration on loopback, with synthetic SDK and identity only."""
import json, os, pathlib, subprocess, unittest, urllib.request
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
class BrowserIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=subprocess.Popen(['node',str(ROOT/'tests/qa-db-fingerprint-fix03-browser-fixture.mjs')],stdout=subprocess.PIPE,text=True)
        cls.addClassCleanup(cls.server.stdout.close)
        cls.addClassCleanup(cls.stop_server)
        cls.port=int(cls.server.stdout.readline().strip());cls.base=f'http://127.0.0.1:{cls.port}'
        cls.pw=sync_playwright().start();cls.addClassCleanup(cls.pw.stop)
        kwargs={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('CHROMIUM_PATH'):kwargs['executable_path']=os.environ['CHROMIUM_PATH']
        cls.browser=cls.pw.chromium.launch(**kwargs);cls.addClassCleanup(cls.browser.close)
        print('Chromium version:',cls.browser.version,flush=True)
    @classmethod
    def stop_server(cls):
        cls.server.terminate();cls.server.wait(timeout=10)
    def setUp(self):
        self.context=self.browser.new_context();self.addCleanup(self.context.close);self.page=self.context.new_page()
        self.context.route('**/*',lambda route: route.continue_() if route.request.url.startswith((self.base+'/',f'http://localhost:{self.port}/')) else route.abort())
    def state(self):
        with urllib.request.urlopen(self.base+'/state',timeout=5) as r:return json.load(r)
    def submit(self,path,digest):
        self.page.goto(self.base+path);self.page.locator('input[name=fingerprint]').fill(digest)
        with self.page.expect_navigation() as nav:self.page.locator('button').click()
        status=nav.value.status;data=json.loads(self.page.locator('body').inner_text());return status,data,self.state()
    def test_01_legacy_reproduces_403(self):
        before=self.state();status,data,after=self.submit('/legacy',before['fingerprint']);self.assertEqual(status,403);self.assertEqual(data,{'status':'blocked'});self.assertEqual(after['last']['origin'],'null');self.assertEqual(before['counts'],after['counts'])
    def test_02_fixed_native_form_succeeds(self):
        before=self.state();status,data,after=self.submit('/fixed',before['fingerprint']);self.assertEqual(status,200);self.assertEqual(data,{'status':'verified_normalized_endpoint','endpointMatch':True,'selectExecuted':False,'runtimeUsesPooler':True});self.assertEqual(after['last']['origin'],self.base);self.assertEqual(after['last']['referer'],self.base+'/fixed');self.assertEqual(after['counts']['queries'],before['counts']['queries']);self.assertEqual(after['counts']['client'],before['counts']['client'])
    def test_03_wrong_fingerprint_no_sql(self):
        before=self.state();status,data,after=self.submit('/fixed','0'*64);self.assertEqual(status,409);self.assertEqual(data['status'],'endpoint_mismatch');self.assertEqual(before['counts']['queries'],after['counts']['queries']);self.assertEqual(before['counts']['client'],after['counts']['client'])
    def test_04_cross_origin_form_denied(self):
        before=self.state();self.page.goto(f'http://localhost:{self.port}/attacker')
        with self.page.expect_navigation() as nav:self.page.locator('button').click()
        self.assertEqual(nav.value.status,403);self.assertEqual(json.loads(self.page.locator('body').inner_text()),{'status':'blocked'});after=self.state();self.assertNotEqual(after['last']['origin'],self.base);self.assertEqual(before['counts'],after['counts'])
    def test_05_missing_team_user_denied(self):
        before=self.state();r=self.page.goto(self.base+'/denied');self.assertEqual(r.status,403);self.assertEqual(before['counts'],self.state()['counts'])
if __name__=='__main__':unittest.main(verbosity=2)
