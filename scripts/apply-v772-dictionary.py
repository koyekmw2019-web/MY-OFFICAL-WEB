#!/usr/bin/env python3
"""Rebuild the v7.72 dictionary from untouched v7.70 source plus curated draft CSV.

No machine translation and no inferred glosses; only explicit Japanese+reading matches.
Previous glosses are never overwritten. Source mismatches are flagged, not silently fixed.
"""
import csv, json, pathlib, collections, re
ROOT=pathlib.Path(__file__).resolve().parents[1]
src=ROOT/'DICTIONARY_v7_70_FULL_CATALOG.json'
translations=ROOT/'translations/v7_72_curated_glosses.csv'
items=json.loads(src.read_text(encoding='utf-8'))
by_key={}
with translations.open(encoding='utf-8-sig',newline='') as f:
 for row in csv.DictReader(f):
  key=(row['jp'],row['reading'])
  if key in by_key:raise ValueError('Duplicate translation: '+str(key))
  mm=row['myanmar_gloss'].strip()
  if not mm or not re.search(r'[\u1000-\u109F]',mm):raise ValueError('Not a Burmese gloss: '+str(key))
  by_key[key]=(mm,row['provenance'])
assert len(items)==8542
assert len({(x['jp'],x['reading']) for x in items})==len(items)
# These are source mismatches, not translation corrections; the source English is kept unmodified.
warnings={
 ('と','と'):"Source English 'door' conflicts with Japanese particle と; the entry may have intended 戸（と）. Meaning needs source review.",
 ('金','きん'):"Source English says 'Friday', but 金（きん） is gold/metal; Friday is 金曜日（きんようび）. Source review needed.",
 ('日','にち'):"Source English says 'Sunday', but 日（にち） means day/date; Sunday is 日曜日（にちようび）. Source review needed.",
 ('渡りる','わたる'):"Likely source typo: 渡りる is not the usual dictionary form; check 渡る（わたる）.",
 ('大家','おおや'):"Source English describes an influential family, while 大家（おおや） usually means landlord. Context review needed.",
}
filled=[]; carried=0
for x in items:
 key=x['jp'],x['reading']
 if key in by_key:
  if not x.get('mm','').strip():
   x['mm'],x['quality']=by_key[key]
   filled.append(key)
  else: carried+=1
 if key in warnings:
  warn=warnings[key]
  # Keep old warnings, if any
  current=x.get('reading_warning')
  if current and current is not True: warn=str(current)+' | '+warn
  x['reading_warning']=warn
absent=sorted(set(by_key)-{(x['jp'],x['reading']) for x in items})
if absent:raise ValueError('Nonexistent source terms: '+repr(absent[:20]))
by_level={}
for level in ['N5','N4','N3','N2','N1']:
 xs=[x for x in items if x['level']==level];by_level[level]={
  'total':len(xs), 'with_gloss':sum(bool(x['mm'].strip()) for x in xs),
  'pending':sum(not bool(x['mm'].strip()) for x in xs),
  'v772_new':sum(x['quality'] in ('n5_curated_draft_v772','additional_curated_draft_v772') for x in xs)
 }
new_count=sum(v['v772_new'] for v in by_level.values())
if new_count<800:raise ValueError('Unexpected underfill '+str(new_count))
assert by_level['N5']['pending']==0
for x in items:
 if x['quality']=='verified_v768':assert x['mm']
for k in [('恋する','こいする'),('恋愛','れんあい'),('恋しい','こいしい'),('失恋','しつれん')]:
 assert k in filled
out=ROOT/'DICTIONARY_v7_72_FULL_CATALOG.json'
out.write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'assets/yk-dictionary-v772.js').write_text(
 '/* v7.72: 8542-source vocabulary; Japanese→Burmese curated draft progress, not fully reviewed. */\n'
 'window.YK_DICTIONARY_V772='+json.dumps(items,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
with (ROOT/'DICTIONARY_v7_72_REMAINING_QUEUE.csv').open('w',encoding='utf-8-sig',newline='') as f:
 writer=csv.writer(f);writer.writerow(['level','jp','reading','english_source','myanmar_gloss','source_warning'])
 for x in items:
  if not x['mm'].strip():writer.writerow([x['level'],x['jp'],x['reading'],x['en'],'',x.get('reading_warning') or ''])
with (ROOT/'DICTIONARY_v7_72_LEVEL_SUMMARY.csv').open('w',encoding='utf-8-sig',newline='') as f:
 writer=csv.writer(f);writer.writerow(['level','total','with_gloss','pending','new_v772'])
 for level,info in by_level.items():writer.writerow([level,info['total'],info['with_gloss'],info['pending'],info['v772_new']])
status={
 'version':'7.72','scope':'N5 full draft + selected N1–N3 glossary; NOT all glossary completed',
 'total':len(items),'new_v772':new_count,
 'retained_prior_glosses':sum(bool(x['mm'].strip()) for x in json.loads(src.read_text(encoding='utf8'))),
 'with_gloss':sum(bool(x['mm'].strip()) for x in items),
 'pending':sum(not bool(x['mm'].strip()) for x in items),
 'by_level':by_level,'human_review_all_complete':False,
 'english_source_modified':False,'source_jp_reading_modified':False,
 'meaning_source_conflicts_flagged':len(warnings),
 'existing_glosses_skipped_for_preservation':carried,
 'method':'Burmese draft glosses authored entry-by-entry, with explicit Japanese & reading keys; NO bulk machine guesses',
 'production_verified':False,
}
(ROOT/'DICTIONARY_v7_72_QA_SUMMARY.json').write_text(json.dumps(status,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(status,ensure_ascii=False,indent=2))
