#!/usr/bin/env python3
"""Apply safe UI-only JLPT enhancements on a verified EXISTING official site checkout.
Requires a GitHub Desktop working directory containing current main index.html.
This script deliberately refuses to run if expected anchors differ, and never
changes SQL, auth, Netlify functions, DB or payment endpoints.
"""
import re
import sys
from pathlib import Path
from shutil import copy2
from datetime import datetime

ROOT=Path(__file__).resolve().parents[1]
if not (ROOT/'index.html').exists():
    print('ERROR: Place the contents of this patch ZIP in your existing GitHub website folder FIRST.');sys.exit(2)

def replace_once(s,old,new,label):
    count=s.count(old)
    if count!=1: raise ValueError(f'{label}: expected ONE anchor, found {count}; no changes have been applied.')
    return s.replace(old,new,1)

def patch_index(s):
    if '/* YK88 UX patch */' in s:
        print('Already patched: index.html');return s
    s=replace_once(s,'<a class="yk82-pill" href="/study/jlpt-learning.html">Open All Lessons ↗</a>','', 'Remove duplicate CTA')
    s=replace_once(s,'<a class="yk821-hub-open" href="/study/jlpt-learning.html">Start Learning ↗</a>',
        '<a class="yk821-hub-open" href="/study/jlpt-learning.html">Open All Lessons ↗</a>', 'Move CTA below')
    guide='STUDYING WITH YE KUN students can use the exams free after Student Verification while their course access is active. Non-students can purchase an exam practice plan through View Plans.'
    old='<span id="examAccessTextV728">One free attempt per exam type · Student verification or paid access is available.</span>'
    new=old+f'<p id="yk88AccessGuide" hidden>{guide}</p>'
    s=replace_once(s,old,new,'Add guest access guide')
    s,n=re.subn(r'<div class="exam-plan-mini" id="examPlanMiniV739">.*?</div>', '', s, count=1, flags=re.S)
    if n!=1:raise ValueError('Remove duplicate Exam Plans box: anchor missing')
    s=replace_once(s,'const user=await currentUser();if(a)a.textContent=user?',
       "const user=await currentUser();const guide=$('#yk88AccessGuide');if(guide)guide.hidden=Boolean(user);if(a)a.textContent=user?",'Guest only visibility')
    a=s.index('function planModal(){')
    b=s.index('async function checkout(',a)
    # Retain the existing checkout() handler; only the modal presentation is changed.
    s=s[:a]+'''function planModal(){
  const cards=Object.entries(PLANS).map(([k,p])=>`<button type="button" class="exam-plan-card-v728" data-plan="${k}" aria-label="${p.name} ¥${p.price.toLocaleString()}"><small>${p.name}</small><b>¥${p.price.toLocaleString()}</b><span>Select to purchase this plan</span></button>`).join('');
  const o=overlay(`<div class="exam-v728-modal-head"><h3>💳 Exam Plans</h3><button class="exam-v728-close">✕</button></div><p class="yk88-plan-instruction">To buy a plan, select the plan you want below. Then follow the bank transfer steps.</p><div class="exam-plans-v728">${cards}</div><div class="exam-backend-note-v728">Access begins only after an Admin approves the payment receipt.</div>`);
  $$('[data-plan]',o).forEach(c=>c.onclick=()=>checkout(c.dataset.plan));
}
''' + s[b:]
    # The existing V7.37 text-node localization handles both initial language and switching.
    extra='''/* YK88 UX patch */
Object.assign(V737_TEXT.my,{
 'Open All Lessons ↗':'သင်ခန်းစာအားလုံး ဖွင့်ရန် ↗',
 'STUDYING WITH YE KUN students can use the exams free after Student Verification while their course access is active. Non-students can purchase an exam practice plan through View Plans.':'STUDYING WITH YE KUN သင်တန်းသားဖြစ်ပါက Student Verify ဖြင့် အတည်ပြုပြီး သင်တန်းသက်တမ်းရှိနေစဉ် စာမေးပွဲများကို အခမဲ့ အသုံးပြုနိုင်ပါတယ်။ သင်တန်းသားမဟုတ်ပါက စာမေးပွဲလေ့ကျင့်ရန် View Plans မှ Plan ကို ရွေးချယ်ဝယ်ယူနိုင်ပါတယ်။',
 'To buy a plan, select the plan you want below. Then follow the bank transfer steps.':'Plan ဝယ်ယူရန် အောက်ပါ Plan များထဲမှ မိမိလိုချင်သော Plan ကို နှိပ်ပြီး ရွေးချယ်ပါ။ ထို့နောက် ဘဏ်ငွေလွှဲရန် လမ်းညွှန်ချက်များအတိုင်း ဆက်လုပ်ပါ။',
 'Select to purchase this plan':'ဒီ Plan ကို ဝယ်ယူရန် နှိပ်ပါ',
 'Access begins only after an Admin approves the payment receipt.':'ငွေလွှဲပြေစာကို Admin က အတည်ပြုပြီးမှသာ Access စတင်အသုံးပြုနိုင်ပါမယ်။'
});
Object.assign(V737_TEXT.ja,{
 'Open All Lessons ↗':'すべてのレッスンを開く ↗',
 'STUDYING WITH YE KUN students can use the exams free after Student Verification while their course access is active. Non-students can purchase an exam practice plan through View Plans.':'STUDYING WITH YE KUN の受講生は在籍期間内に学生認証をすると試験を無料で利用できます。受講生以外の方は「View Plans」から練習用プランを購入できます。',
 'To buy a plan, select the plan you want below. Then follow the bank transfer steps.':'購入したいプランを下から選択し、銀行振込の案内に従って手続きを進めてください。',
 'Select to purchase this plan':'このプランを選んで購入',
 'Access begins only after an Admin approves the payment receipt.':'振込明細を管理者が承認した後にアクセスが有効になります。'
});
'''
    s=replace_once(s,'const V737_ORIGINAL_ATTR = new WeakMap();',extra+'const V737_ORIGINAL_ATTR = new WeakMap();','Localize new text')
    s=replace_once(s,'</head>','<link rel="stylesheet" href="/assets/yk88-index-ux.css?v=1">\n</head>','Load index CSS')
    return s

def patch_study(s):
    if 'yk88-jlpt-ux.css' in s:
        print('Already patched: JLPT page');return s
    s=replace_once(s,'<a class="yk821-button-secondary" href="#yk82Title">Explore Lessons ↘</a>',
       '<a class="yk821-button-secondary" href="#yk82Title">Explore Lessons <small>သင်ခန်းစာများကို ကြည့်ရန်</small></a>', 'Explore Lessons translation')
    # Same-size bilingual daily / explore buttons; keep original daily JS button ID.
    art_start=s.index('  <div class="yk821-hero-art"')
    art_end=s.index('\n</section>',art_start)
    s=s[:art_start]+s[art_end:]
    s=replace_once(s,'</head>','<link rel="stylesheet" href="/assets/yk88-jlpt-ux.css?v=1">\n</head>','Load JLPT UX CSS')
    return s

def patch_lesson_js(s):
    if 'yk88-grammar-card' in s:
        print('Already patched: grammar cards');return s
    a=s.index("  if(type==='grammar')return")
    b=s.index("\n  if(type==='kanji')",a)
    new='''  if(type==='grammar'){
    const detail=`/study/jlpt-grammar-detail.html?level=${encodeURIComponent(level)}&id=${encodeURIComponent(item.id)}`;
    return `<article class="yk82-lesson yk88-grammar-card"><a class="yk88-grammar-link" href="${detail}" aria-label="JLPT ${level} ${fmt(item.title)} Grammar detail">${head}<h3 lang="ja">${fmt(item.title)}</h3><p class="yk82-mm">${fmt(item.meaning)}</p><div class="yk82-sentence" lang="ja">${fmt(item.example)}<div class="yk82-mm">${fmt(item.exampleMy)}</div></div><p class="yk82-note">💡 ${fmt(item.note)}</p></a>${commonActions(item)}</article>`;
  }'''
    return s[:a]+new+s[b:]

def main():
    files={'index.html':patch_index,'study/jlpt-learning.html':patch_study,'assets/yk-jlpt-learning-v782-page.js':patch_lesson_js}
    result={}
    for p,fn in files.items():
        file=ROOT/p
        if not file.is_file():raise ValueError(f'Expected file missing: {p}')
        old=file.read_text(encoding='utf-8')
        result[p]=(old,fn(old))
    if '--check' in sys.argv:
        print('PASS: source anchors verified; patch can apply without modifying files.');return
    stamp=datetime.now().strftime('%Y%m%d-%H%M%S')
    backup=ROOT.parent/(ROOT.name+'_YK88_BACKUP_'+stamp)
    for p,(old,new) in result.items():
        if old==new:continue
        (backup/p).parent.mkdir(parents=True,exist_ok=True)
        (backup/p).write_text(old,encoding='utf8')
        (ROOT/p).write_text(new,encoding='utf8')
        print('UPDATED:',p)
    print('PASS: UI patch applied. Existing database, server, login, payment endpoints and YKCR files were not touched.')
    print('Check npm test/build, then Deploy Preview before main branch merge. Backup:',backup)

if __name__=='__main__':
    try:main()
    except Exception as exc:
        print('SAFETY STOP:',exc);sys.exit(1)
