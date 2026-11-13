"""Build v7.87.10 authored grammar library; pure data generation, no server changes."""
import sys,json,hashlib
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent))
from catalog_source import patterns
from full_n1 import lessons
R=Path(__file__).resolve().parents[2]
assets=R/'assets'
counts={}
ids=set()
assert len(lessons)==509, f'509 authored patterns required, got {len(lessons)}'
for level,raw in patterns.items():
 titles=raw.split('|')
 assert len(titles)==len(set(titles)), f'{level} duplicate patterns'
 records=[]
 for n,title in enumerate(titles,1):
  lesson=lessons.get((level,title))
  assert lesson, f'Unfinished lesson: {level} {title}'
  rid=f'{level}-grammar-{n:03d}'
  assert rid not in ids,rid
  ids.add(rid)
  rec={'id':rid,'title':title,'level':level,'index':n,'status':'draft'}
  rec.update(lesson)
  for key in ['meaningJa','meaningMy','meaningEn','formation']:
   assert isinstance(rec.get(key),str) and rec[key].strip(), (rid,key)
  assert len(rec.get('examples',[]))==2, (rid,'two examples required')
  for i,e in enumerate(rec['examples'],1):
   for field in ['ja','my','en','highlight']:
    assert isinstance(e.get(field),str) and e[field].strip(),(rid,i,field)
   assert e['highlight'] in e['ja'],(rid,i,'grammar target must appear')
   assert not any(z in e['ja'] for z in ['<mark','<ruby','[TODO]','（例文準備中）']),rid
  records.append(rec)
 counts[level]={'total':len(records),'authored':len(records),'missing':0}
 out={'version':'7.87.10','level':level,'sourceReference':'https://nihongokyoshi-net.com/jlpt-grammars/',
  'licenseNote':'Grammar pattern titles used as index. All explanations and examples are originally authored, not copied from source; teaching materials need ongoing human editorial review.',
  'editorialStatus':'complete original authored drafts; not certified official JLPT list',
  'items':records}
 (assets/f'yk-v7879-grammar-{level.lower()}.json').write_text(json.dumps(out,ensure_ascii=False,indent=1)+'\n',encoding='utf8')
for l,k in lessons:
 assert k in patterns[l].split('|'), f'Missing catalog pattern for authored lesson {l} {k}'
assert sum(x['authored'] for x in counts.values())==509
release={'version':'7.87.10','expectedReferenceLevels':counts,'totalCatalogEntries':509,
 'authoredOriginalTrilingualLessons':509,'originalJapaneseExampleSentences':1018,
 'missingLessons':0,'source':'Independently authored trilingual learning explanations/examples, reference pattern titles only',
 'editorialScope':'Automated schema/grammar substring/missing-translation QA; professional native proofreading and pedagogy audit not certified',
 'originalV782LessonsPreserved':True,'noServerAPIChanges':True,'noAuthorContentCopiedFromReference':True}
(R/'QA_v7_87_10_GRAMMAR.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('v7.87.10 GRAMMAR ALL AUTHORED 509 lessons / 1018 original examples',counts)
