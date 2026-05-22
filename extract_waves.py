"""Extract transparent pulse-wave PNGs from the TK Services brand backplates.

We take `all.png` (light backplate; all 6 brand colors swirl together) and
`all-dark.png` (dark variant) and:
  1. Crop out the left-side sub-brand badge column AND the center TK lockup
     so we keep only the wave/particles.
  2. Alpha-key the background: near-white -> transparent (light); near-black
     -> transparent (dark). Saturation-preserving so the colored particles
     read at full intensity.
  3. Save as PNG with alpha into assets/.
"""
from PIL import Image
import numpy as np
from pathlib import Path

SRC = Path(r"C:\Users\ricky_j3cdbqw\Downloads\tk service assets")
DST = Path(__file__).parent / "docs" / "assets"
DST.mkdir(parents=True, exist_ok=True)


def remove_logo_region(arr: np.ndarray, *, badge_x_pct=0.28, mark_box=(0.34, 0.28, 0.68, 0.72)) -> np.ndarray:
    """Zero-alpha the left badge column and the center TK lockup so we keep
    only the wave + particle art."""
    h, w = arr.shape[:2]
    # left badge column
    arr[:, : int(w * badge_x_pct), 3] = 0
    # center logo lockup
    x0 = int(w * mark_box[0]); y0 = int(h * mark_box[1])
    x1 = int(w * mark_box[2]); y1 = int(h * mark_box[3])
    arr[y0:y1, x0:x1, 3] = 0
    return arr


def key_light(img: Image.Image) -> Image.Image:
    """Light backplate: lift pure-white to transparent, preserve saturated wave."""
    arr = np.array(img.convert("RGBA"), dtype=np.float32)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    # saturation 0..1
    sat = np.where(maxc > 0, (maxc - minc) / np.maximum(maxc, 1), 0)
    # luminance 0..1
    lum = maxc / 255.0
    # alpha: high where saturation high OR luminance below mid (dark particles)
    # white background: lum ~= 1, sat ~= 0 -> alpha ~= 0
    alpha = np.clip(sat * 2.2 + (1.0 - lum) * 1.4, 0, 1)
    # gentle floor to drop residual fog
    alpha = np.where(alpha < 0.04, 0, alpha)
    arr[..., 3] = (alpha * 255).astype(np.float32)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def key_dark(img: Image.Image) -> Image.Image:
    """Dark backplate: drop near-black to transparent, keep glowing wave."""
    arr = np.array(img.convert("RGBA"), dtype=np.float32)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    maxc = np.maximum(np.maximum(r, g), b)
    lum = maxc / 255.0  # 0..1
    # alpha tracks brightness — black bg -> 0, glowing wave -> 1
    alpha = np.clip((lum - 0.04) * 1.5, 0, 1)
    arr[..., 3] = (alpha * 255).astype(np.float32)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def process(src_name: str, out_name: str, kind: str):
    img = Image.open(SRC / src_name).convert("RGBA")
    out = key_light(img) if kind == "light" else key_dark(img)
    arr = np.array(out)
    arr = remove_logo_region(arr)
    Image.fromarray(arr, "RGBA").save(DST / out_name, optimize=True)
    print(f"wrote {DST / out_name}  size={img.size}")


process("all.png", "wave-all-light.png", "light")
process("all-dark.png", "wave-all-dark.png", "dark")
# also extract each per-brand wave for accent use
for s, kind in [
    ("tkcfo.png", "dark"),
    ("web.png", "dark"),
    ("seo.png", "dark"),
    ("design.png", "dark"),
    ("tkservices.png", "dark"),
    ("cfo - light.png", "light"),
    ("seo-light.png", "light"),
    ("05ef3180-4768-4f56-a3b5-758fb8cfc916.png", "light"),
]:
    out = s.replace(" ", "-").replace(".png", "-wave.png")
    process(s, "brand-" + out, kind)
print("done")
