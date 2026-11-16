"""Fix05.3 synthetic Chromium smoke with source-derived mobile flex layout.
This explicitly reproduces the old narrow-right-column CTA regression.
Not a real-phone/full website/Netlify functional test.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
root = Path(__file__).resolve().parents[1]
css = (root/'assets/yk88-jlpt-ui-fix05.css').read_text(encoding='utf8')
js = root/'assets/yk88-jlpt-ui-fix05.js'
builder = (root/'scripts/build-v7876-jlpt-ui-fix05.mjs').read_text(encoding='utf8')
critical = builder.split('const criticalCSS=`<style id="yk88-fix053-critical">',1)[1].split('</style>`;',1)[0]
# Based on actual original v7.82.1 responsive .yk821-hub-welcome CSS;
# Fix05.2 failed because .yk821-hub-open inherited flex:1.
base = '''
* {box-sizing:border-box} body {margin:0;background:#09090a;color:#fff;font-family:Inter,"Noto Sans Myanmar",system-ui,sans-serif}
#study-hub {margin:26px 0 10px;padding:20px;border-radius:30px;background:#111}
#studyHubGridV733{display:grid;grid-template-columns:1fr;gap:14px}
.study-hub-more-wrap{display:flex;justify-content:center;margin-top:14px}
#studyHubMoreV733 {width:100%;border-radius:999px;min-height:60px;padding:12px;background:#202022;color:white;border:1px solid #444;font-size:14px}
.yk82-panel{margin-top:24px;padding:15px;background:#311e29;border:1px solid #543b49;border-radius:24px;}
.yk821-hub-welcome{display:flex;align-items:center;gap:16px;min-height:132px;overflow:hidden;border:1px solid #694454;border-radius:18px;background:#251d25;margin:14px 0 16px;padding:0 18px 0 0}
.yk821-hub-people{width:182px;min-width:182px;height:132px;position:relative}
.yk821-hub-copy{flex:1;min-width:0}
.yk821-hub-open{flex:none;white-space:nowrap;color:#fff!important;text-decoration:none!important;display:inline-flex;padding:11px 16px;border:1px solid #eb7f88;border-radius:12px;background:linear-gradient(105deg,#b72e40,#e25a62);font-size:12px;font-weight:800}
@media(max-width:900px){.yk821-hub-open{padding:10px}.yk821-hub-welcome{gap:10px}}
@media(max-width:640px){
 .yk821-hub-welcome{flex-wrap:wrap;padding:12px 13px;min-height:0;gap:7px}
 .yk821-hub-people{order:2;width:126px;min-width:126px;height:101px}
 .yk821-hub-copy{order:1;flex-basis:100%}
 .yk821-hub-open{order:3;flex:1}
}
#online-mock-exam{padding:31px 12px}
.kicker{font-size:13px;letter-spacing:.16em;font-weight:900;color:#aaa}
.title{font-size:clamp(1.9rem,4vw,3rem);font-weight:950;line-height:1.12;margin:5px 0 18px}
.exam-hub{position:relative;border:1px solid #393939;border-radius:28px;padding:24px;background:linear-gradient(145deg,#171717,#090909)}
.exam-v728-access{display:grid;grid-template-columns:1fr;gap:14px;margin:16px 0 20px}
.exam-access-card{border:1px solid #444;background:#222;border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:16px}
.exam-access-main{display:flex;gap:13px;align-items:center}
.exam-access-icon{width:48px;height:48px;flex:0 0 auto;background:#eee;border-radius:16px;display:grid;place-items:center}
.exam-access-copy{min-width:0}.exam-access-copy b{display:block;font-size:17px}.exam-access-copy span{display:block;font-size:12px;color:#bbb}
.exam-access-actions{display:flex;flex-wrap:wrap;gap:9px}
.exam-access-actions button{min-height:44px;background:#292929;color:white;border:1px solid #444;border-radius:12px}
'''
home = '''<!doctype html><html lang="my"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
<div style="height:72px">YK HEADER</div><section class="study-hub-v7" id="study-hub"><div class="study-hub-grid" id="studyHubGridV733">
<div class="study-hub-more-wrap"><button id="studyHubMoreV733">View More · Study Hub &amp; JLPT ↓</button></div>
<div class="yk82-panel" id="yk82Hub"><div style="min-height:180px">STUDYING WITH YE KUN · JLPT Learning Center Pro</div>
<div class="yk821-hub-welcome"><div class="yk821-hub-copy"><b>今日も一緒に勉強しましょう！</b><p>ဒီနေ့လည်း အတူတူ ဂျပန်စာလေ့လာကြမယ်။ N5–N1 Level ရွေးပြီး စတင်နိုင်ပါတယ်။</p></div>
<div class="yk821-hub-people" style="background:#51303c">Student &amp; Teacher images</div>
<a class="yk821-hub-open" href="/study/jlpt-learning.html"><span class="yk88-cta-label">သင်ခန်းစာအားလုံးဖွင့်ရန်</span></a>
</div></div></div></section></body></html>'''
exam = '''<!doctype html><html lang="my"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
<div style="height:72px">YK HEADER</div><section id="online-mock-exam">
<div class="kicker">ONLINE EXAM CENTER</div>
<div class="title">STUDYING WITH YE KUN · စာမေးပွဲစင်တာ</div>
<div class="exam-hub"><div class="exam-v728-access"><div class="exam-access-card">
<div class="exam-access-main"><div class="exam-access-icon">🔐</div><div class="exam-access-copy"><b id="examAccessTitleV728">Guest Access</b><span>Student verification or paid access</span></div></div>
<p id="yk88AccessGuide">STUDYING WITH YE KUN သင်တန်းသားဖြစ်ပါက Student Verify ဖြင့် စာမေးပွဲကို အခမဲ့အသုံးပြုနိုင်ပါတယ်။</p>
<div class="exam-access-actions"><button id="examStudentVerifyV728">Student Verify</button><button id="examPlansV728">View Plans</button></div>
</div></div></div></section></body></html>'''
detail='''<!doctype html><html lang="my"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body class="yk82-page yk88-detail-page" style="margin:0;background:#09090a"><header class="yk82-top"><div class="yk82-top-inner"><nav class="yk82-top-links">Study Hub Dictionary Mock Exam</nav></div></header><main class="yk82-main"><article id="yk88GrammarDetail" class="yk82-block yk88-detail"><div class="yk88-detail-actions"><button id="yk88Bookmark" class="yk88-button" aria-pressed="false">☆ Bookmark · သိမ်းရန်</button><button id="yk88Learned" class="yk88-button yk88-button-primary">✓ Mark learned · လေ့လာပြီး</button></div><a class="yk88-back" href="/study/jlpt-learning.html?level=N5&section=grammar#yk82Title">← JLPT N5 Grammar စာရင်းသို့ ပြန်သွားရန်</a></article></main></body></html>'''
widths=[320,360,390,430,720]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width in widths:
        page=browser.new_page(viewport={'width':width,'height':850},device_scale_factor=1)
        page.set_content(home)
        page.add_style_tag(content=base)
        page.add_style_tag(content=css)
        page.add_style_tag(content=critical)
        for language,label in [('my','သင်ခန်းစာအားလုံးဖွင့်ရန်'),('en','Open All Lessons'),('ja','すべてのレッスンを開く')]:
            page.locator('.yk88-cta-label').evaluate('(e,v)=>e.textContent=v',label)
            measured=page.evaluate('''() => {
              const a=document.querySelector('.yk821-hub-open'), span=a.querySelector('span'), welcome=document.querySelector('.yk821-hub-welcome'), people=document.querySelector('.yk821-hub-people');
              const ar=a.getBoundingClientRect(),wr=welcome.getBoundingClientRect(),pr=people.getBoundingClientRect();
              const range=document.createRange();range.selectNodeContents(span);const rects=Array.from(range.getClientRects());
              const tr=range.getBoundingClientRect();
              const b=document.querySelector('#studyHubMoreV733').getBoundingClientRect();const panel=document.querySelector('#yk82Hub').getBoundingClientRect();
              const section=document.querySelector('#study-hub').getBoundingClientRect();
              return {aW:ar.width,wW:wr.width,aTop:ar.top,peopleBottom:pr.bottom,bottom:ar.bottom, welcomeBottom:wr.bottom,centerDiff:Math.abs((tr.left+tr.width/2)-(ar.left+ar.width/2)),lines:rects.length,spanW:span.scrollWidth,insideW:a.clientWidth,
                flexBasis:getComputedStyle(a).flexBasis,flexGrow:getComputedStyle(a).flexGrow,whiteSpace:getComputedStyle(span).whiteSpace,
                scrollW:document.documentElement.scrollWidth,viewport:innerWidth,
                gap:panel.top-b.bottom,topSpace:b.top-section.top};}''')
            assert measured['scrollW']<=width,measured
            assert measured['centerDiff']<2,measured
            assert measured['lines']==1,measured  # Critical: no vertical Burmese glyph stacking
            assert measured['spanW']<=measured['insideW']+1,measured
            if width<=640:
                assert measured['flexBasis']=='100%', measured
                assert measured['flexGrow']=='0',measured
                assert measured['aW']>=measured['wW']-30,measured
                assert measured['aTop']>=measured['peopleBottom']-1,measured
                assert measured['bottom']<=measured['welcomeBottom']+1,measured
                assert measured['gap']<=12,measured
                assert measured['topSpace']<=32,measured
            print('PASS HOME',width,language,'CTA full-row, one-line, visual center, space compact')
        page.close()
        page=browser.new_page(viewport={'width':width,'height':850})
        page.set_content(exam)
        page.add_style_tag(content=base)
        page.add_style_tag(content=css)
        ex=page.evaluate('''() => {
          const t=document.querySelector('#online-mock-exam .title').getBoundingClientRect(), a=document.querySelector('.exam-v728-access').getBoundingClientRect();
          return {gap:a.top-t.bottom,viewport:innerWidth,scrollW:document.documentElement.scrollWidth,accessText:document.querySelector('#examAccessTitleV728').textContent,verify:!!document.querySelector('#examStudentVerifyV728'),plans:!!document.querySelector('#examPlansV728'),intro:!!document.querySelector('.exam-v728-subtitle')};}''')
        assert not ex['intro'] and ex['gap']<=65 and ex['scrollW']<=width,ex
        assert ex['verify'] and ex['plans'] and ex['accessText']=='Guest Access',ex
        print('PASS EXAM',width,'Access next to heading, long intro removed, controls intact')
        page.close()
        page=browser.new_page(viewport={'width':width,'height':850})
        page.set_content(detail)
        page.add_style_tag(content=base)
        page.add_style_tag(content=css)
        page.add_script_tag(path=str(js))
        page.wait_for_function("document.querySelectorAll('.yk88-detail-actions > .yk88-button').length===3")
        metrics=page.evaluate('''() => { const a=[...document.querySelectorAll('.yk88-detail-actions >.yk88-button')].map(x=>x.getBoundingClientRect());return {tops:a.map(r=>r.top),widths:a.map(r=>r.width),scrollW:document.documentElement.scrollWidth};}''')
        assert max(metrics['tops'])-min(metrics['tops'])<2 and max(metrics['widths'])-min(metrics['widths'])<2 and metrics['scrollW']<=width,metrics
        print('PASS DETAIL',width,'3 action buttons stay aligned')
        page.close()
    browser.close()
print('PASS Fix05.3 synthetic Chromium responsive checks: 5 widths, 3 languages and 3 screen types')
