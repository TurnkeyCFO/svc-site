"""Pad every per-brand logo onto an identical 3:1 canvas with centered content
so all 5 cards render the wordmark at the same visual size."""
from PIL import Image, ImageChops
from pathlib import Path

DIR = Path(__file__).parent / "docs" / "assets" / "brands"
TARGET_W = 1500
TARGET_H = 500  # 3:1 canvas


def trim(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    rgb = Image.new("RGB", img.size, (255, 255, 255))
    rgb.paste(img, mask=img.split()[3])
    diff = ImageChops.difference(rgb, Image.new("RGB", img.size, (255, 255, 255)))
    bbox = diff.getbbox()
    return img.crop(bbox) if bbox else img


def pad_to_3x1(img: Image.Image) -> Image.Image:
    """Scale every logo to a UNIFORM target height so all 5 brand cards read
    the same visual size. Width floats; canvas is 3:1 and centered."""
    img = trim(img)
    iw, ih = img.size
    target_h = int(TARGET_H * 0.86)            # uniform render height ~430px
    max_w    = int(TARGET_W * 0.94)
    scale = target_h / ih
    # If scaling-to-height overshoots width (very wide logos like CFO), back off.
    if iw * scale > max_w:
        scale = max_w / iw
    new_w = int(iw * scale)
    new_h = int(ih * scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (255, 255, 255, 0))
    x = (TARGET_W - new_w) // 2
    y = (TARGET_H - new_h) // 2
    canvas.paste(img, (x, y), img)
    return canvas


for name in ["tkcfo.png", "tkweb.png", "tkai.png", "tkseo.png", "tkdesign.png"]:
    p = DIR / name
    if not p.exists():
        print(f"skip {name}")
        continue
    out = pad_to_3x1(Image.open(p))
    out.save(p, optimize=True)
    print(f"{name}: -> {out.size}")
print("done")
