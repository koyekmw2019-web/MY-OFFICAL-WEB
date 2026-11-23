"""Validate every menu destination without contacting a service."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

class MenuPage(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids, self.tabs, self.links = [], [], []
        self.drawer = self.nav = False
        self.feed(path.read_text())

    def handle_starttag(self, tag, attributes):
        a = dict(attributes)
        element_id = a.get('id')
        if element_id:
            self.ids.append(element_id)
        if tag == 'aside' and element_id == 'siteMenu':
            self.drawer = True
        if tag == 'nav' and element_id == 'yk-mobile-nav':
            self.nav = True
        if self.nav and 'data-tab' in a:
            self.tabs.append(a['data-tab'])
        if (self.drawer or self.nav) and tag == 'a':
            self.links.append(a['href'])

    def handle_endtag(self, tag):
        if tag == 'aside': self.drawer = False
        if tag == 'nav': self.nav = False

root = Path('dist-menu-qa')
pages = {p:MenuPage(p) for p in root.rglob('*.html')}
links = set()
for p, page in pages.items():
    assert all(page.ids.count(i)==1 for i in ('siteMenu','menuBackdrop','menuClose','yk-mobile-nav')), p
    assert page.tabs == ['home','study','exam','video','account'], p
    for link in page.links:
        links.add(link)
        u=urlsplit(link)
        if u.scheme:
            assert link.replace('&','&amp;') in (root/'index.html').read_text() or link in (root/'index.html').read_text(), link
            continue
        dest = p if not u.path else root/(u.path.lstrip('/') or 'index.html')
        assert dest in pages, (p, link)
        assert not u.fragment or u.fragment in pages[dest].ids, (p, link)
print(json.dumps(dict(pages=len(pages),destinations=sorted(links)),indent=2))
