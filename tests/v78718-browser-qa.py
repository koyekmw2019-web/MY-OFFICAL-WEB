"""Synthetic UI sanity checks for v7.87.18. Never passes as live Netlify QA."""
import tempfile, pathlib, subprocess, json, os
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
TYPES=('truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n5','jlpt_n4','jlpt_n3','jlpt_n2','jlpt_n1')
PRICE='1 Week ¥1,000 · 1 Month ¥2,000<br>3 Months ¥3,000 · 1 Year ¥5,000'
PAGE='''<!doctype html><html lang="my"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>*{box-sizing:border-box}body{background:#09090b;color:#f4f4f7;font-family:"Noto Sans Myanmar",system-ui,sans-serif;padding:12px;margin:0}main{max-width:480px;margin:auto}.exam-access-card,.exam-plan-mini{border:1px solid #404044;background:#151516;border-radius:24px;padding:20px;margin:16px 0}.exam-access-main{display:flex;gap:16px}.exam-access-icon{font-size:24px}.exam-access-copy b{display:block;font-size:23px}.exam-access-copy span{font-size:14px;color:#d1d1d5}.exam-access-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}.exam-access-actions button{background:#fff;border:0;border-radius:16px;min-height:45px}.exam-access-actions button:last-child{grid-column:span 2}.exam-plan-mini{line-height:1.7}.exam-plan-mini button{padding:12px}.exam-v728-overlay{position:fixed;inset:0;background:#000a;overflow:auto;padding:18px}.exam-v728-modal{background:#121215;border:1px solid #38383c;padding:20px;border-radius:24px;max-width:480px;margin:0 auto}.exam-plan-card-v728{padding:15px;border:1px solid #414146;border-radius:14px;margin:8px 0;cursor:pointer}.exam-plan-card-v728 small,.exam-plan-card-v728 b,.exam-plan-card-v728 span{display:block}.exam-plan-card-v728 b{font-size:23px;margin:8px 0}.exam-backend-note-v728{background:#211d16;border-radius:14px;padding:14px}.exam-v728-modal-head{display:flex;justify-content:space-between}</style>
</head><body><main><nav><button id="my" onclick="selectLang('my')">မြန်မာ</button><button id="en" onclick="selectLang('en')">English</button><button id="ja" onclick="selectLang('ja')">日本語</button></nav>
<section class="exam-access-card"><div class="exam-access-main"><div class="exam-access-icon">🔐</div><div class="exam-access-copy"><b id="examAccessTitleV728">Guest Access</b><span id="examAccessTextV728">One free attempt per exam type · Student verification or paid access is available.</span></div></div>
<div class="exam-access-actions"><button>Login / Register</button><button>Student Verify</button><button id="examPlansV728">View Plans</button></div></section>
<div class="exam-plan-mini"><b id="examPlanMiniTitleV739">Exam Plans</b><p id="examPlanMiniTextV739">__PRICE__</p><button id="examPlansMiniV728">Choose Plan</button></div></main>
<script>const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const V737_TEXT={my:{},ja:{}};
function v737TranslateBase(base,lang){let m;if(lang==='en')return base;const d=V737_TEXT[lang]||{};if(Object.prototype.hasOwnProperty.call(d,base)) return d[base];return base;}
const V737_ORIGINAL_TEXT = new WeakMap();
const PLANS={week:{name:'1 Week',price:1000,days:7},month:{name:'1 Month',price:2000,days:30},"3months":{name:'3 Months',price:3000,days:90},year:{name:'1 Year',price:5000,days:365}};
function statusText(s,user){if(!user)return {state:'guest',icon:'🔐',t:'Guest Access',x:'Login / Register required · One free attempt per exam type.'};return {state:'member'};}
function setAccessButtonsV739(s,user,state){const miniText=$('#examPlanMiniTextV739');if(miniText)miniText.innerHTML='__PRICE__';}
let lastPlan='';function checkout(k){lastPlan=k;document.body.dataset.chosenPlan=k;}
function overlay(content){const o=document.createElement('div');o.className='exam-v728-overlay';o.innerHTML='<div class="exam-v728-modal">'+content+'</div>';document.body.appendChild(o);return o;}
function v737Localize(root=document,lang=document.documentElement.lang){const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walk.nextNode()){const n=walk.currentNode,raw=n.nodeValue||'',trim=raw.trim();if(!trim)continue;if(!V737_ORIGINAL_TEXT.has(n))V737_ORIGINAL_TEXT.set(n,trim);const base=V737_ORIGINAL_TEXT.get(n);const translated=v737TranslateBase(base,lang);if(translated!==base||lang==='en')n.nodeValue=translated;}}
function planModal(){const cards=Object.entries(PLANS).map(([k,p])=>`<div class="exam-plan-card-v728" data-plan="${k}"><small>${p.name}</small><b>¥${p.price.toLocaleString()}</b><span>Access starts on Admin approval date</span></div>`).join('');const o=overlay(`<div class="exam-v728-modal-head"><h3>💳 Exam Plans</h3><button class="exam-v728-close">✕</button></div><div class="exam-plans-v728">${cards}</div><div class="exam-backend-note-v728">Bank Transfer only. After transfer, upload your receipt. Access begins when Admin approves the request.</div>`);$$('[data-plan]',o).forEach(c=>c.onclick=()=>checkout(c.dataset.plan));v737Localize(o);return o;}
function syncStatus(){const s=statusText(null,null);$('#examAccessTitleV728').textContent=s.t;$('#examAccessTextV728').textContent=s.x;setAccessButtonsV739(null,null,s.state);v737Localize(document);}
function selectLang(lang){document.documentElement.lang=lang;document.querySelectorAll('[data-my]').forEach(el=>{const t=el.getAttribute('data-'+lang);if(t!==null)el.textContent=t;});syncStatus();}
$('#examPlansV728').addEventListener('click',planModal);$('#examPlansMiniV728').addEventListener('click',planModal);syncStatus();
</script></body></html>'''.replace('__PRICE__',PRICE)
with tempfile.TemporaryDirectory(prefix='yk-v78718-browser-') as tmp:
 base=pathlib.Path(tmp);dist=base/'dist';dist.mkdir()
 for p in ('mock-exams.html',*(f'exams/{k}.html' for k in TYPES)):
  f=dist/p;f.parent.mkdir(exist_ok=True);f.write_text(PAGE)
 for name in ('index.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html','login.html'):
  (dist/name).write_text('<html><head></head><body></body></html>')
 asset=dist/'assets/yk-v78718-exam-access.css';asset.parent.mkdir(exist_ok=True);asset.write_bytes((ROOT/'assets/yk-v78718-exam-access.css').read_bytes())
 proc=subprocess.run(['node',str(ROOT/'scripts/build-v78718-exam-access-copy.mjs')],cwd=base,capture_output=True,text=True)
 assert proc.returncode==0,(proc.stderr or proc.stdout)
 proc=subprocess.run(['node',str(ROOT/'tests/v78718-release.mjs')],cwd=base,capture_output=True,text=True)
 assert proc.returncode==0,(proc.stderr or proc.stdout)
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for width,height in [(390,844),(1280,850)]:
   page=browser.new_page(viewport={'width':width,'height':height})
   page.set_content((dist/'mock-exams.html').read_text(), wait_until='load')
   page.add_style_tag(content=(ROOT/'assets/yk-v78718-exam-access.css').read_text())
   assert 'ဧည့်သည်အသုံးပြုခွင့်' in page.locator('#examAccessTitleV728').inner_text(),width
   assert 'စာမေးပွဲအမျိုးအစားတစ်ခုစီကို အခမဲ့ ၁ ကြိမ်' in page.locator('#examAccessTextV728').inner_text(),width
   assert '၁ ပတ်' in page.locator('#examPlanMiniTextV739').inner_text(),width
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),width
   page.locator('#examPlansV728').click()
   assert len(page.locator('.exam-plan-card-v728').all())==4
   assert 'Admin အတည်ပြုပြီး' in page.locator('.exam-plan-card-v728 span').first.inner_text()
   assert 'Screenshot' in page.locator('.exam-backend-note-v728').inner_text()
   page.locator('[data-plan="month"]').click()
   assert page.locator('body').get_attribute('data-chosen-plan')=='month'
   page.locator('.exam-v728-overlay').evaluate('(el)=>el.remove()')
   page.locator('#en').click()
   assert 'Log in or register' in page.locator('#examAccessTextV728').inner_text()
   page.locator('#ja').click()
   assert '試験種別' in page.locator('#examAccessTextV728').inner_text()
   page.locator('#my').click()
   assert 'ဧည့်သည်အသုံးပြုခွင့်' in page.locator('#examAccessTitleV728').inner_text()
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2')
   page.close()
  browser.close()
 print('PASS v78718-browser-qa: synthetic mobile 390px/desktop 1280px, guest text, 3 languages, price mini, plan click, no overflow')
