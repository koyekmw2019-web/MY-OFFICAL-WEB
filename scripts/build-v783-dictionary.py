#!/usr/bin/env python3
"""Deterministic v7.83 dictionary editorial overlay + all-entry automated risk audit.
Base v7.78 remains immutable for backwards-compatible integrity tests.
No automated check is treated as expert-level translation approval.
"""
from pathlib import Path
import csv, json, re, collections
from v783_curated_data import EXAMPLE_LINES, CORRECTION_LINES

ROOT=Path(__file__).resolve().parent.parent
BASE=json.loads((ROOT/'DICTIONARY_v7_78_FULL_CATALOG.json').read_text('utf-8'))
assert len(BASE)==8542


def lines(data):
    out=[]
    for line in data.splitlines():
        if not line.strip(): continue
        parts=[v.strip() for v in line.split(' ^ ')]
        if len(parts)!=3 or not all(parts): raise ValueError('Malformed curated line: '+line)
        out.append(parts)
    return out


def plain(sentence):
    return re.sub(r'\[([^:\]]+):([^\]]+)\]',lambda m:m.group(1),sentence)

examples=lines(EXAMPLE_LINES)
corrections=lines(CORRECTION_LINES)
assert len({x[0] for x in examples})==len(examples),'Duplicate example'
assert len({x[0] for x in corrections})==len(corrections),'Duplicate correction'
C={jp:(mm,note) for jp,mm,note in corrections}
E={jp:(ruby,mm) for jp,ruby,mm in examples}
# Several headwords also exist at other readings with different meanings.
PREFERRED={'今日':'きょう','来る':'くる','夜':'よる','不便':'ふべん','準備':'じゅんび','経験':'けいけんする','運転':'うんてんする'}

output=[];patches=[];seen_words=set();qa=[];change_rows=[]
for i,item in enumerate(BASE):
    e=dict(item)
    jp=e['jp'];reading=e.get('reading','')
    key=f'{jp}¦{reading}'
    patch={'jp':jp,'reading':reading}
    selected=jp not in PREFERRED or PREFERRED[jp]==reading
    changed=False
    if jp in C and selected:
        new,reason=C[jp]
        if e['mm']!=new:
            change_rows.append([i,jp,reading,e['mm'],new,reason,'editorial_draft_not_expert_verified'])
            e['mm']=new
            patch['mm']=new
            patch['qa_note']=reason
            e['qa_note_v783']=reason
            e['quality']='v783_targeted_editorial_draft'
            e['translation_review_status']='editorial_draft_v783_not_expert_verified'
            changed=True
    if jp in E and selected:
        ruby,my=E[jp]
        if ('[' in ruby) != (':' in ruby): raise ValueError(ruby)
        for match in re.finditer(r'\[([^:\]]+):([^\]]+)\]',ruby):
            if not re.fullmatch(r'[ぁ-ゖァ-ヿー・\s]+',match.group(2)):
                raise ValueError('Bad ruby pronunciation: '+ruby)
        # Keep original Japanese/Myanmar examples if any, except where enhanced with explicit reading.
        ja=plain(ruby)
        if not e.get('example_ja') or not e.get('example_my'):
            e['example_ja']=ja;e['example_my']=my;e['example_ruby']=ruby
            e['example_review_status']='original_educational_draft_v783'
            patch.update(example_ja=ja,example_my=my,example_ruby=ruby,example_review_status=e['example_review_status'])
            changed=True
        elif e.get('example_ja')==ja:
            e['example_ruby']=ruby
            patch['example_ruby']=ruby
            changed=True
    if changed:
        patches.append(patch)
    seen_words.add(jp)
    flags=[]
    if e.get('translation_review_status')=='review_required':flags.append('machine_translation_review_required')
    if e.get('quality','').find('draft')>=0:flags.append('draft_not_expert_verified')
    if re.search(r'[\uac00-\ud7af]',e['mm']):flags.append('foreign_script_korean')
    if re.search(r'\ufffd|\x00',e['mm']):flags.append('encoding_corruption')
    if re.search(r'[A-Za-z]{4,}',e['mm']):flags.append('embedded_english')
    if re.search(r'[ァ-ヿぁ-ゖ]',e['mm']):flags.append('japanese_in_myanmar_gloss_check_context')
    if len(e['mm'])>180:flags.append('long_translation_review')
    if not e['mm'].strip():flags.append('empty_translation')
    if not e.get('example_ja') or not e.get('example_my'):flags.append('example_not_yet_added')
    qa.append([i,jp,reading,e.get('level',''),e.get('quality',''),e.get('translation_review_status',''),';'.join(flags)])
    output.append(e)

# Legacy dictionary content has headwords not present in the 8542-entry JLPT catalog.
# These are runtime-only previews, never falsely counted as verified catalog examples.
legacy=[]
for jp in sorted((set(E)|set(C))-seen_words):
    d={'jp':jp}
    if jp in C:
        d.update(mm=C[jp][0],qa_note=C[jp][1],translation_review_status='editorial_draft_v783_not_expert_verified')
    if jp in E:
        ruby,my=E[jp]
        d.update(example_ja=plain(ruby),example_my=my,example_ruby=ruby,example_review_status='original_educational_draft_v783')
    legacy.append(d)

# Runtime patches are applied to the existing 8542 entries without replacing the baseline asset.
metadata={
    'version':'7.83',
    'catalog_entries':len(output),
    'translations_blank':sum(not v['mm'].strip() for v in output),
    'automated_audited':len(output),
    'machine_translation_review_required':sum(v.get('translation_review_status')=='review_required' for v in output),
    'targeted_meaning_corrections':len(change_rows),
    'examples_with_bilingual_sentences':sum(bool(v.get('example_ja') and v.get('example_my')) for v in output),
    'original_v783_examples':sum(v.get('example_review_status')=='original_educational_draft_v783' for v in output),
    'legacy_example_additions':sum('example_ja' in v for v in legacy),
    'legacy_gloss_corrections':sum('mm' in v for v in legacy),
    'qa_flags_not_human_verification':True,
    'all_translations_expert_verified':False,
    'uncorrected_draft_entries_remain':True,
}
(ROOT/'DICTIONARY_v7_83_FULL_CATALOG.json').write_text(json.dumps(output,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
with (ROOT/'DICTIONARY_v7_83_QA_FLAGS.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f);w.writerow(['index','jp','reading','level','quality','review_status','automated_flags']);w.writerows(qa)
with (ROOT/'DICTIONARY_v7_83_CORRECTIONS.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f);w.writerow(['index','jp','reading','old_mm','new_mm','reason','review_status']);w.writerows(change_rows)
(ROOT/'QA_v7_83_DICTIONARY.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
asset='/* v7.83 non-destructive dictionary overlays: 8,542 automated QA flags, editorial drafts not certified. */\nwindow.YK_DICTIONARY_V783_PATCH='+json.dumps({'patches':patches,'legacy':legacy,'metrics':metadata},ensure_ascii=False,separators=(',',':'))+';\n'
(ROOT/'assets/yk-dictionary-v783-overlay.js').write_text(asset,encoding='utf-8')
print(json.dumps(metadata,ensure_ascii=False,indent=2));print('patches',len(patches),'legacy',len(legacy))
