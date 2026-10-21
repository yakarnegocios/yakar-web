"""Rebuild web derivatives from the preserved PNG sources (requires Pillow)."""
from pathlib import Path
from PIL import Image, ImageChops

assets = Path(__file__).resolve().parents[1] / "assets"
with Image.open(assets / "yakar-identidad.png") as source:
    if source.size != (1448, 1086):
        raise ValueError("The identity source changed; review the documented web crop first.")
    # The exact area already visible through the former CSS crop at scale 0.35.
    crop = source.crop((620, 149, 1390, 365))
    target = assets / "yakar-logo-web.webp"
    crop.save(target, lossless=True, method=6, icc_profile=source.info.get("icc_profile", b""))
    with Image.open(target) as result:
        assert ImageChops.difference(crop.convert("RGB"), result.convert("RGB")).getbbox() is None

with Image.open(assets / "operacion-yakar.png") as source:
    if source.size != (1536, 1024):
        raise ValueError("The cover source changed; review responsive sizes first.")
    original = source.convert("RGB")
    for width in (768, 1152, 1536):
        resized = original.resize((width, width * 2 // 3), Image.Resampling.LANCZOS) if width != original.width else original
        resized.save(assets / f"operacion-yakar-{width}.webp", quality=84, method=6, icc_profile=source.info.get("icc_profile", b""))
print("Rebuilt lossless web logo and three responsive cover images; PNG sources retained.")
