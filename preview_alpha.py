"""Composite extracted wave PNGs onto dark + colored bg to verify the alpha channel."""
from PIL import Image
from pathlib import Path

DST = Path(__file__).parent / "docs" / "assets"

for name, bg in [
    ("wave-all-light.png", (10, 10, 20, 255)),
    ("wave-all-dark.png", (250, 247, 242, 255)),
]:
    fg = Image.open(DST / name).convert("RGBA")
    canvas = Image.new("RGBA", fg.size, bg)
    canvas.alpha_composite(fg)
    out = DST.parent / ("_preview_" + name)
    canvas.convert("RGB").save(out, "PNG")
    print(out)
