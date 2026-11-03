from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
entries=json.loads((root/'DICTIONARY_v7_74_FULL_CATALOG.json').read_text())
assert len(entries)==8542
(root/'assets/yk-dictionary-v774.js').write_text('/* v7.74: curated N1 translation continuation; incomplete, needs review. */\nwindow.YK_DICTIONARY_V774='+json.dumps(entries,ensure_ascii=False,separators=(',',':'))+';\n')
