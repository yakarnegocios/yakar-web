"""Version the shared stylesheet by content so releases cannot mix cached CSS."""
from pathlib import Path
import hashlib
import re

root = Path(__file__).resolve().parents[1]
version = hashlib.sha256((root / "css/styles.css").read_bytes()).hexdigest()[:12]
for name in ("index.html", "metodo.html", "integridad.html", "privacidad.html", "reclamaciones.html"):
    page = root / name
    content, count = re.subn(r'href="css/styles\.css(?:\?v=[^"\s]*)?"', f'href="css/styles.css?v={version}"', page.read_text())
    if count != 1:
        raise ValueError(f"Expected one shared stylesheet in {name}; found {count}")
    page.write_text(content)
print(f"Shared CSS version: {version}")
