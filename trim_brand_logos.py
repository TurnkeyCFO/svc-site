"""Trim white/transparent borders off the per-brand logos so they render
at full visual size inside the brand-card logo plate."""
from PIL import Image, ImageChops
from pathlib import Path

DIR = Path(__file__).parent / "docs" / "assets" / "brands"

def trim(img: Image.Image, pad: int = 12) -> Image.Image:
    """Crop near-white + transparent margins, leaving `pad` px of breathing room."""
    img = img.convert("RGBA")
    # Build a mask: pixel is "content" if alpha>16 AND not near-white
    px = img.load()
    w, h = img.size
    # Use difference-against-white on the RGB, gated by alpha
    rgb = Image.new("RGB", img.size, (255, 255, 255))
    rgb.paste(img, mask=img.split()[3])  # composite onto white via alpha
    diff = ImageChops.difference(rgb, Image.new("RGB", img.size, (255, 255, 255)))
    bbox = diff.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(w, x1 + pad); y1 = min(h, y1 + pad)
    return img.crop((x0, y0, x1, y1))

for name in ["tkcfo.png", "tkweb.png", "tkai.png", "tkseo.png", "tkdesign.png"]:
    p = DIR / name
    if not p.exists():
        print(f"skip {name}")
        continue
    out = trim(Image.open(p))
    out.save(p, optimize=True)
    print(f"{name}: -> {out.size}")
print("done")
