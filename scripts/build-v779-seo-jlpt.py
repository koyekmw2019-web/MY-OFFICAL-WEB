from pathlib import Path
import re, json, html, collections
root=Path(__file__).resolve().parents[1]
p=root/'index.html'
s=p.read_text('utf-8')
# SEO: preserve exactly the existing homepage title and visible branding.
assert s.count('<title>YE KUN Official Website | YE LINN OO</title>')==1
base='https://yekun-mryethemenstyle.netlify.app/'
old_desc='YE KUN (YE LINN OO) Official Website — Japan Lifestyle • SSW Driving • Career Support • Study Resources for Myanmar learners in Japan.'
new_desc='YE KUN Official Website (YE LINN OO): JLPT N1–N5 模擬試験, Japanese–Myanmar dictionary, 特定技能・自動車運送業 (SSW Tokutei Gino) Truck/Taxi/Bus, 運送業テキスト, 自動車整備・運転免許 mock exams. STUDYING WITH YE KUN.'
assert old_desc in s
s=s.replace(old_desc,new_desc)
# Make the existing JSON-LD accurately describe *existing* topics. Preserve WebSite and Person identities.
pattern=r'(<script type="application/ld\+json">)(.*?)(</script>)'
m=re.search(pattern,s,re.S)
assert m
obj=json.loads(m.group(2))
website=next(x for x in obj['@graph'] if x['@type']=='WebSite')
page=next(x for x in obj['@graph'] if x['@type']=='WebPage')
for x in (website,page):x['description']=new_desc
# Topic map is based on present sections and exam cards; no assertion of official accreditation.
topics=[
 '日本語能力試験 JLPT N1 N2 N3 N4 N5 模擬試験',
 'JLPT mock exam and Japanese language practice',
 '日本語単語・文法・漢字・読解・聴解',
 'Japanese–Myanmar dictionary / 日本語ミャンマー語辞書',
 '特定技能 SSW TOKUTEI GINO 自動車運送業',
 '特定技能トラック・タクシー・バス 試験対策',
 '運送業テキスト・トラック運送業テキスト・タクシー運送業テキスト・バス運送業テキスト',
 'SSW Mock Exam and Truck Taxi Bus practice',
 '自動車整備 特定技能',
 '運転免許 学科試験・普通自動車・二輪・原付',
 'Japan driving license practice',
 '日本語学習 ミャンマー語 / Japanese learning for Myanmar learners',
 'Japan lifestyle and career support'
]
page['keywords']=topics
page['mentions']=[{'@type':'Thing','name':label} for label in topics]
page['hasPart']=[
 {'@type':'WebPageElement','name':'STUDY HUB — SSW and JLPT N5–N1','url':base+'#study-hub','description':'Study topics and quick links for SSW transport, driving licenses and JLPT N5–N1.'},
 {'@type':'WebPageElement','name':'JLPT Mock Exam N1–N5','url':base+'#jlpt-exam-center','description':'Original JLPT practice questions for N5, N4, N3, N2 and N1, including a learning-mode listening phase.'},
 {'@type':'WebPageElement','name':'SSW Tokutei Gino and driving mock exams','url':base+'#online-mock-exam','description':'Practice for truck, taxi, bus, auto maintenance, ordinary car, motorcycle and moped.'},
 {'@type':'WebPageElement','name':'Japanese–Myanmar dictionary','url':base+'#driving-dictionary','description':'Japanese vocabulary with Myanmar glosses and JLPT N5–N1 filters.'},
 {'@type':'WebPageElement','name':'Transport textbook resources','url':base+'#study-resources','description':'Truck, Taxi and Bus transport textbook requests and study resources.'}
]
# Give the educational project its own identity without changing the publisher or main personal brand.
obj['@graph'].append({'@type':'Organization','@id':base+'#studying-with-ye-kun',
   'name':'STUDYING WITH YE KUN','url':base+'#study-hub',
   'description':'Independent Japanese-language and driving/SSW study material and practice by YE KUN. Not an official JLPT examination provider.'})
s=s[:m.start()]+m.group(1)+'\n'+json.dumps(obj,ensure_ascii=False,indent=2)+'\n'+m.group(3)+s[m.end():]
# JLPT exam card: persistent Myanmar explanation even when global UI is English/Japanese.
levels={
 'N5':'ဂျပန်စာ စတင်လေ့လာသူများအတွက် အခြေခံစာလုံး၊ ဝေါဟာရ၊ ရိုးရှင်းတဲ့ သဒ္ဒါနဲ့ နေ့စဉ်သုံး စာကြောင်းများကို လေ့ကျင့်နိုင်ပါတယ်။',
 'N4':'အခြေခံဂျပန်စာကို လေ့လာပြီးသူများအတွက် နေ့စဉ်ဘဝ သုံးဝေါဟာရ၊ သဒ္ဒါနဲ့ ရိုးရှင်းတဲ့ စာပိုဒ်ဖတ်ရှုခြင်းကို လေ့ကျင့်နိုင်ပါတယ်။',
 'N3':'အလယ်အလတ် အဆင့်လေ့လာသူများအတွက် လုပ်ငန်းခွင်နဲ့ နေ့စဉ်ဘဝတွင် တွေ့ရသော ဝေါဟာရ၊ သဒ္ဒါနဲ့ စာပိုဒ်များကို လေ့ကျင့်နိုင်ပါတယ်။',
 'N2':'အဆင့်မြင့်သို့ တက်လှမ်းနေသူများအတွက် သတင်း၊ ဆောင်းပါး၊ ရှုပ်ထွေးသော သဒ္ဒါနဲ့ စာပိုဒ်ဖတ်ရှုခြင်းကို လေ့ကျင့်နိုင်ပါတယ်။',
 'N1':'အဆင့်မြင့် ဂျပန်စာလေ့လာသူများအတွက် ခက်ခဲသော ဝေါဟာရ၊ သဒ္ဒါအသုံးအနှုန်းနဲ့ အကြောင်းအရာရှုပ်ထွေးတဲ့ စာပိုဒ်များကို လေ့ကျင့်နိုင်ပါတယ်။'
}
# Existing brief remains: add a second Myanmar-only permanent line. Avoid depending on textContent localization at button parent.
for lv,mm in levels.items():
 pattern=rf'(<article class="exam-category v728 jlpt-card-v745 jlpt-card-v754"[^>]+id="jlpt-exam-{lv.lower()}".*?)(</article>)'
 m=re.search(pattern,s,re.S)
 assert m and len(m.group(1)) < 70000,(lv,'Card not found')
 card=m.group(1)
 brief=re.search(r'(<p class="jlpt-card-brief-v754"[^>]*>.*?</p>)',card,re.S)
 assert brief,('brief missing',lv)
 info=f'\n      <p class="jlpt-card-mm-v779" lang="my">{html.escape(mm)} <span class="jlpt-card-scope-mm-v779">ဝေါဟာရ၊ သဒ္ဒါ၊ ဖတ်ရှုခြင်းနဲ့ နားထောင်ခြင်း မေးခွန်းများကို စမ်းဖြေနိုင်ပါတယ်။</span></p>'
 card=card.replace(brief.group(1),brief.group(1)+info,1)
 # one primary text span localized, one fixed Myanmar second line.
 bp=rf'<button class="exam-launch-v728 jlpt-card-launch-v754" data-exam-v728="jlpt_{lv.lower()}"[^>]+>.*?</button>'
 b=re.search(bp,card,re.S)
 assert b,('button missing',lv)
 button=(f'<button type="button" class="exam-launch-v728 jlpt-card-launch-v754" data-exam-v728="jlpt_{lv.lower()}" '
  f'aria-label="Start JLPT {lv} mock exam">'
  f'<span class="jlpt-card-cta-main-v779" data-en="Start {lv} Mock Exam" data-ja="{lv} 模擬試験を開始" data-my="JLPT {lv} Mock Exam">JLPT {lv} Mock Exam</span>'
  f'<small class="jlpt-card-cta-mm-v779" lang="my">စာမေးပွဲ စတင်မည်</small></button>')
 card=card.replace(b.group(0),button,1)
 s=s[:m.start()]+card+m.group(2)+s[m.end():]
# Keep card heights neat and the Myan script fully visible, including at mobile widths.
style='''\n<style id="v779-jlpt-card-localization">
/* v7.79: permanent Burmese exam explanation and bilingual action without changing the card grid. */
.jlpt-card-v754 .jlpt-card-mm-v779{display:block;margin:3px 0 10px!important;color:#ceced4;font-size:11px;font-weight:600;line-height:1.9;min-height:0;white-space:normal;overflow:visible;overflow-wrap:anywhere}
.jlpt-card-scope-mm-v779{display:block;margin-top:5px;color:#a9abb1;font-weight:500}
.jlpt-card-v754 .exam-launch-v728.jlpt-card-launch-v754{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:64px;padding:10px 9px;white-space:normal}
.jlpt-card-cta-main-v779{display:block;font-size:12px;font-weight:900;line-height:1.35;overflow-wrap:anywhere}
.jlpt-card-cta-mm-v779{display:block;font-size:11px;font-weight:850;line-height:1.6;color:#373737}
@media(max-width:700px){.jlpt-card-v754 .jlpt-card-mm-v779{font-size:11px;line-height:1.85}.jlpt-card-v754 .exam-launch-v728.jlpt-card-launch-v754{min-height:64px}}
@media(max-width:420px){.jlpt-card-v754 .jlpt-card-mm-v779{font-size:12px;line-height:1.9}}
</style>\n'''
needle='<style id="v757-menu-login-css">'
assert s.count(needle)==1
s=s.replace(needle,style+needle,1)
# Do not rewrite homepage title, ID anchors or backend functions.
assert s.count('YE KUN Official Website | YE LINN OO</title>')==1
assert s.count('jlpt-card-cta-mm-v779" lang="my">စာမေးပွဲ စတင်မည်')==5
p.write_text(s,'utf-8')
# Disclaimer: education branded by STUDYING WITH YE KUN, while the site remains YE KUN Official Website.
js=root/'assets/jlpt-chokuzen-v750.js'
j=js.read_text('utf-8')
assert j.count('YE KUNが作成した')==1 and j.count('YE KUN မှရေးသားထားသော')==1
j=j.replace('※ YE KUNが作成した非公式の学習問題です。','※ STUDYING WITH YE KUNが作成した非公式の学習問題です。')
j=j.replace('YE KUN မှရေးသားထားသော လေ့ကျင့်ရေးမေးခွန်းများဖြစ်သည်။','STUDYING WITH YE KUN မှ ဖန်တီးထားသော လေ့ကျင့်ရေးမေးခွန်းများဖြစ်ပါသည်။')
js.write_text(j,'utf-8')
# Noindex account/login shells; preserve their code and UI.
for name in ['login.html','admin-dashboard.html','student-dashboard.html','member-dashboard.html','dashboard.html']:
 q=root/name
 body=q.read_text('utf-8')
 if not re.search(r'<meta\s+name=["\']robots["\']',body,re.I):
  body=re.sub(r'(<head[^>]*>)',r'\1\n<meta name="robots" content="noindex,follow">',body,count=1,flags=re.I)
 q.write_text(body,'utf-8')
# bump version, PWA service worker (no logo/icon mutation)
package=root/'package.json'
content=package.read_text('utf-8')
assert '"version": "7.78.0"' in content
package.write_text(content.replace('"version": "7.78.0"','"version": "7.79.0"'),'utf-8')
sw=root/'service-worker.js';sw.write_text(sw.read_text('utf-8').replace('yk-official-v7-78-brand-dictionary','yk-official-v7-79-seo-jlpt-cards'),'utf-8')
# Sitemap only one indexable public page currently, so keep a single entry.
smap=root/'sitemap.xml'
smap.write_text(smap.read_text('utf-8').replace('<lastmod>2026-11-03</lastmod>','<lastmod>2026-11-06</lastmod>'),'utf-8')
# Document every keyword category used, with corresponding actual on-page anchor (not new pages).
keywords={'main_title':'YE KUN Official Website | YE LINN OO', 'site_url':base,
 'indexable_urls':[base], 'keyword_groups':[
 {'category':'Brand / official', 'anchor':'/', 'terms':['YE KUN','YE LINN OO','YE KUN Official Website','STUDYING WITH YE KUN']},
 {'category':'JLPT N1-N5', 'anchor':'#jlpt-exam-center', 'terms':['JLPT N1','JLPT N2','JLPT N3','JLPT N4','JLPT N5','JLPT mock exam','JLPT 模擬試験','日本語能力試験','JLPT ミャンマー語']},
 {'category':'Japanese study', 'anchor':'#study-hub','terms':['日本語単語','日本語文法','漢字練習','読解','聴解','vocabulary','grammar','kanji','reading','listening','Japanese for Myanmar']},
 {'category':'Dictionary', 'anchor':'#driving-dictionary','terms':['Japanese Myanmar Dictionary','日本語ミャンマー語辞書','JLPT vocabulary','日本語辞書','Japanese Burmese translation']},
 {'category':'SSW transport', 'anchor':'#online-mock-exam','terms':['SSW TOKUTEI GINO','特定技能','特定技能自動車運送業','SSW Mock Exam','トラック 特定技能','タクシー 特定技能','バス 特定技能']},
 {'category':'Transport textbooks', 'anchor':'#study-resources','terms':['運送業テキスト','トラック運送業テキスト','タクシー運送業テキスト','バス運送業テキスト','Truck Textbook','Taxi Textbook','Bus Textbook']},
 {'category':'Maintenance / License', 'anchor':'#online-mock-exam','terms':['自動車整備 特定技能','普通自動車','二輪','原付','運転免許 模擬試験','Motorcycle License Japan','Driving License Japan']},
 {'category':'Creator support', 'anchor':'/','terms':['Japan Lifestyle','Career Support','Myanmar in Japan']}
 ], 'limitations': ['Keywords tags alone do not create ranking','No new landing pages added; this version preserves the site layout','Google chooses displayed snippets and rankings independently.']}
(root/'SEO_KEYWORD_MAP_v7_79.json').write_text(json.dumps(keywords,ensure_ascii=False,indent=2)+'\n','utf-8')
print('patched',p.stat().st_size,'bytes, cards',len(levels),'and SEO schema topics',len(topics))
