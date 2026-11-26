"""Detect accidental loss of the owner-approved NX attribution in public footers."""
from html.parser import HTMLParser
from pathlib import Path

class CreditParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.footer = False
        self.capture = False
        self.texts = []
    def handle_starttag(self, tag, attrs):
        if tag == "footer":
            self.footer = True
        if self.footer and dict(attrs).get("data-nx-attribution") == "initiative":
            self.capture = True
            self.texts.append("")
    def handle_data(self, data):
        if self.capture:
            self.texts[-1] += data
    def handle_endtag(self, tag):
        if tag == "strong":
            self.capture = False
        if tag == "footer":
            self.footer = False

root = Path(__file__).resolve().parents[1]
for page in sorted(root.glob("*.html")):
    parser = CreditParser()
    parser.feed(page.read_text())
    assert parser.texts == ["YAKAR, una iniciativa de NX."], f"Atribución NX ausente o alterada: {page.name}"
    print(f"PASS {page.name}: atribución NX en footer")
