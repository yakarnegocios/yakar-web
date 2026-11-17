"""Check local paths, HTML anchors and duplicate IDs without contacting send endpoints."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse, unquote
import json

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://yakarnegocios.github.io/yakar-web/"
PREFIX = urlparse(SITE).path

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
for file in sorted([*ROOT.glob("*.html"), *(ROOT / "perspectiva").glob("*.html")]):
    name = file.relative_to(ROOT).as_posix()
    page = Page()
    page.feed((ROOT / name).read_text())
    pages[name] = page
errors, external, count = [], set(), 0
for name, page in pages.items():
    if len(page.ids) != len(set(page.ids)):
        errors.append(f"{name}: ID duplicado")
    for link in page.links:
        url = urlparse(urljoin(SITE + name, link))
        if url.scheme not in ("https", "http"):
            continue
        if url.netloc != urlparse(SITE).netloc or not url.path.startswith(PREFIX):
            external.add(link)
            continue
        target = unquote(url.path[len(PREFIX):])
        if not target or target.endswith("/"):
            target += "index.html"
        if not (ROOT / target).is_file():
            errors.append(f"{name}: no existe {link}")
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f"{name}: ancla inexistente {link}")
        count += 1
print(json.dumps({"internal_references_checked": count, "errors": errors, "external_urls": sorted(external)}, ensure_ascii=False, indent=2))
raise SystemExit(bool(errors))
