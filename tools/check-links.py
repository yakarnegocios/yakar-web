"""Check local paths, HTML anchors and duplicate IDs without contacting send endpoints."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import json

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if "id" in values:
            self.ids.append(values["id"])
        for attr in ("href", "src"):
            if values.get(attr):
                self.links.append(values[attr])

pages = {}
for name in ("index.html", "metodo.html", "integridad.html", "privacidad.html", "reclamaciones.html"):
    page = Page()
    page.feed((ROOT / name).read_text())
    pages[name] = page
errors, external, count = [], set(), 0
for name, page in pages.items():
    if len(page.ids) != len(set(page.ids)):
        errors.append(f"{name}: ID duplicado")
    for link in page.links:
        url = urlparse(link)
        if url.scheme in ("https", "http"):
            external.add(link)
            continue
        if url.scheme or link.startswith("//"):
            continue
        target = unquote(url.path) or name
        if not (ROOT / target).is_file():
            errors.append(f"{name}: no existe {link}")
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f"{name}: ancla inexistente {link}")
        count += 1
print(json.dumps({"internal_references_checked": count, "errors": errors, "external_urls": sorted(external)}, ensure_ascii=False, indent=2))
raise SystemExit(bool(errors))
