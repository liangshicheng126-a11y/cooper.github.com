#!/usr/bin/env python3
"""Render physical accordion mockups from WOTT 10-panel flat artwork.

Sources (in public/photos/posters/):
  - Untitled.png                          → dark-lifestyle
  - WOTT_十折页_工程样品 (1).png           → orange-compute
  - WOTT｜本地影音体验服务｜A4十页折页（双方案）.png → lime-localplay

Outputs:
  public/photos/posters/wott-mockups/
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
POSTERS = ROOT / "public" / "photos" / "posters"
PANELS = ROOT / "assets" / "wott-brochure-panels"
OUT = POSTERS / "wott-mockups"

SOURCES = {
    "dark-lifestyle": POSTERS / "Untitled.png",
    "orange-compute": POSTERS / "WOTT_十折页_工程样品 (1).png",
    "lime-localplay": POSTERS / "WOTT｜本地影音体验服务｜A4十页折页（双方案）.png",
}


def split_strip(im: Image.Image, n: int = 10) -> list[Image.Image]:
    w, h = im.size
    pw = w // n
    return [im.crop((i * pw, 0, (i + 1) * pw if i < n - 1 else w, h)) for i in range(n)]


def split_grid(im: Image.Image, cols: int = 5, rows: int = 2) -> list[Image.Image]:
    w, h = im.size
    pw, ph = w // cols, h // rows
    panels: list[Image.Image] = []
    for r in range(rows):
        for c in range(cols):
            box = (
                c * pw,
                r * ph,
                (c + 1) * pw if c < cols - 1 else w,
                (r + 1) * ph if r < rows - 1 else h,
            )
            panels.append(im.crop(box))
    return panels


def export_panels(key: str, panels: list[Image.Image]) -> None:
    d = PANELS / key
    d.mkdir(parents=True, exist_ok=True)
    for i, p in enumerate(panels, 1):
        p.convert("RGBA").save(d / f"{i:02d}.png")
    panels[0].convert("RGBA").save(d / "cover.png")
    preview = panels[0].convert("RGB")
    preview.thumbnail((900, 1200), Image.Resampling.LANCZOS)
    preview.save(d / "cover-preview.jpg", quality=92)


def perspective_coeffs(src_pts, dst_pts):
    matrix = []
    for (x, y), (u, v) in zip(dst_pts, src_pts):
        matrix.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        matrix.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    a = np.asarray(matrix, dtype=np.float64)
    b = np.asarray([c for p in src_pts for c in p], dtype=np.float64)
    return tuple(np.linalg.lstsq(a, b, rcond=None)[0].tolist())


def warp_quad(img: Image.Image, quad, out_size):
    w, h = img.size
    src = [(0, 0), (w, 0), (w, h), (0, h)]
    coeffs = perspective_coeffs(src, quad)
    return img.transform(
        out_size,
        Image.Transform.PERSPECTIVE,
        coeffs,
        Image.Resampling.BICUBIC,
        fillcolor=(0, 0, 0, 0),
    )


def desk_bg(size, style: str = "oak") -> Image.Image:
    w, h = size
    yy = np.linspace(0, 1, h)[:, None]
    xx = np.linspace(0, 1, w)[None, :]
    split = 0.58
    wall = yy < split
    if style == "oak":
        wall_c = np.array([236, 232, 226])
        desk_c = np.array([186, 152, 118])
        grain = 1 + 0.04 * np.sin((xx * w / 11 + yy * 3) * 2 * np.pi)
    elif style == "slate":
        wall_c = np.array([228, 228, 232])
        desk_c = np.array([72, 74, 80])
        grain = 1 + 0.03 * np.sin((xx * w / 9) * 2 * np.pi)
    else:
        wall_c = np.array([245, 242, 238])
        desk_c = np.array([210, 205, 198])
        grain = 1 + 0.015 * np.random.randn(h, w)

    arr = np.zeros((h, w, 3), dtype=np.float32)
    for c in range(3):
        arr[:, :, c] = np.where(wall, wall_c[c], desk_c[c] * grain)
    light = 0.85 + 0.25 * np.exp(-((xx - 0.35) ** 2) / 0.25 - ((yy - 0.2) ** 2) / 0.35)
    arr *= light[:, :, None]
    band = np.exp(-((yy - split) ** 2) / 0.0008) * 18
    return Image.fromarray(np.clip(arr - band[:, :, None], 0, 255).astype(np.uint8))


def shade_panel(img: Image.Image, amount: float = 0.18) -> Image.Image:
    arr = np.asarray(img).astype(np.float32)
    hh, ww = arr.shape[:2]
    xx = np.linspace(0, 1, ww)[None, :]
    yy = np.linspace(0, 1, hh)[:, None]
    shade = (1.0 - amount * xx + 0.06 * (1 - xx)) * (
        1.0 + 0.05 * np.exp(-((yy - 0.12) ** 2) / 0.05)
    )
    arr[:, :, :3] = np.clip(arr[:, :, :3] * shade[:, :, None], 0, 255)
    return Image.fromarray(arr.astype(np.uint8))


def accordion_quads(n, pw, ph, origin, fold_deg=34, yaw_deg=12):
    fold = np.deg2rad(fold_deg)
    yaw = np.deg2rad(yaw_deg)
    half_span = pw * np.cos(fold)
    depth_amp = pw * np.sin(fold) * 0.55
    x0, y0 = origin
    quads = []
    cursor_x = 0.0

    def project(x, y, z):
        z_cam = 900 + z + x * np.sin(yaw)
        scale = 900 / z_cam
        xp = x0 + (x * np.cos(yaw) + 0.45 * z) * scale
        yp = y0 - y * scale - 0.62 * z * scale
        return (xp, yp)

    for i in range(n):
        if i % 2 == 0:
            z_l, z_r = 0.0, depth_amp
            bright = True
        else:
            z_l, z_r = depth_amp, 0.0
            bright = False
        bl = project(cursor_x, 0, z_l)
        br = project(cursor_x + half_span, 0, z_r)
        tr = project(cursor_x + half_span, ph, z_r)
        tl = project(cursor_x, ph, z_l)
        quads.append({"quad": [tl, tr, br, bl], "bright": bright})
        cursor_x += half_span
    return quads


def render_desk(panels, name: str, style: str = "oak", fold_deg: float = 34):
    target_h = 920
    pw = int(target_h * panels[0].width / panels[0].height)
    panels = [p.resize((pw, target_h), Image.Resampling.LANCZOS) for p in panels]
    pad_l, pad_t, pad_r, pad_b = 220, 180, 280, 260
    probe = accordion_quads(len(panels), pw, target_h, (0, 0), fold_deg=fold_deg)
    xs = [p[0] for q in probe for p in q["quad"]]
    ys = [p[1] for q in probe for p in q["quad"]]
    w = int(max(xs) - min(xs) + pad_l + pad_r)
    h = int(max(ys) - min(ys) + pad_t + pad_b)
    quads = accordion_quads(len(panels), pw, target_h, (pad_l, h - pad_b), fold_deg=fold_deg)
    xs = [p[0] for q in quads for p in q["quad"]]
    ys = [p[1] for q in quads for p in q["quad"]]
    if max(xs) + 80 > w:
        w = int(max(xs) + pad_r)
    if min(ys) < 40:
        h = int(h + (40 - min(ys)))
        quads = accordion_quads(len(panels), pw, target_h, (pad_l, h - pad_b), fold_deg=fold_deg)

    canvas = desk_bg((w, h), style=style).convert("RGBA")
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    bottoms = [pt for q in quads for pt in (q["quad"][2], q["quad"][3])]
    minx = min(p[0] for p in bottoms) - 30
    maxx = max(p[0] for p in bottoms) + 40
    maxy = max(p[1] for p in bottoms)
    sd.ellipse([minx, maxy - 25, maxx, maxy + 55], fill=(0, 0, 0, 90))
    canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(28)))

    for q, panel in zip(quads, panels):
        shaded = shade_panel(panel, amount=0.12 if q["bright"] else 0.32)
        shaded = ImageEnhance.Brightness(shaded).enhance(1.03 if q["bright"] else 0.88)
        ed = ImageDraw.Draw(shaded)
        ed.line([(1, 0), (1, target_h)], fill=(255, 255, 255, 200), width=2)
        ed.line([(pw - 2, 0), (pw - 2, target_h)], fill=(210, 210, 210, 180), width=2)
        ps = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(ps).polygon([(x + 10, y + 16) for x, y in q["quad"]], fill=(0, 0, 0, 50))
        canvas = Image.alpha_composite(canvas, ps.filter(ImageFilter.GaussianBlur(14)))
        canvas = Image.alpha_composite(canvas, warp_quad(shaded, q["quad"], (w, h)))

    final = ImageEnhance.Contrast(canvas.convert("RGB")).enhance(1.05)
    final = final.filter(ImageFilter.UnsharpMask(radius=1.3, percent=90, threshold=2))
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{name}-accordion-desk.jpg"
    final.save(dest, quality=94, optimize=True)
    print("wrote", dest)


def render_cover_stack(panels, name: str, tone: str = "warm"):
    cover = panels[0].convert("RGBA")
    target_h = 1100
    pw = int(target_h * cover.width / cover.height)
    cover = cover.resize((pw, target_h), Image.Resampling.LANCZOS)
    peeks = [panels[min(2, len(panels) - 1)], panels[min(5, len(panels) - 1)], panels[-1]]
    peeks = [p.resize((pw, target_h), Image.Resampling.LANCZOS) for p in peeks]
    w, h = int(pw * 2.2), int(target_h * 1.35)
    style = "slate" if tone == "cool" else "oak"
    canvas = desk_bg((w, h), style=style).convert("RGBA")
    cx, cy = w * 0.38, h * 0.12

    def rect_quad(x, y, ww, hh, skew=0, tip=0):
        return [(x + tip, y), (x + ww + tip * 0.2, y + skew), (x + ww, y + hh + skew), (x, y + hh)]

    def drop_shadow(quad, blur=28, opacity=90):
        shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(shadow).polygon([(x + 18, y + 28) for x, y in quad], fill=(0, 0, 0, opacity))
        return shadow.filter(ImageFilter.GaussianBlur(blur))

    for i, p in enumerate(reversed(peeks)):
        offset = (len(peeks) - i) * 14
        q = rect_quad(cx + offset, cy - offset * 0.3, pw, target_h, skew=6 + i * 2, tip=-i * 3)
        canvas = Image.alpha_composite(canvas, drop_shadow(q, blur=18, opacity=40))
        strip = Image.new("RGBA", (pw, target_h), (0, 0, 0, 0))
        avg = tuple(int(v) for v in np.asarray(p.convert("RGB")).mean(axis=(0, 1)))
        ImageDraw.Draw(strip).rectangle([pw - 18, 0, pw, target_h], fill=avg + (255,))
        strip.paste(p.crop((pw - 40, 0, pw, target_h)), (pw - 40, 0))
        canvas = Image.alpha_composite(canvas, warp_quad(strip, q, (w, h)))

    q = rect_quad(cx, cy, pw, target_h, skew=4, tip=0)
    canvas = Image.alpha_composite(canvas, drop_shadow(q, blur=30, opacity=80))
    thick = cover.copy()
    ImageDraw.Draw(thick).rectangle([pw - 6, 0, pw, target_h], fill=(245, 245, 245, 255))
    canvas = Image.alpha_composite(canvas, warp_quad(shade_panel(thick, 0.1), q, (w, h)))
    final = canvas.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.1, percent=70, threshold=2))
    dest = OUT / f"{name}-cover-stack.jpg"
    final.save(dest, quality=93, optimize=True)
    print("wrote", dest)


def main() -> None:
    configs = [
        ("dark-lifestyle", "strip", "oak", 34, "warm"),
        ("orange-compute", "strip", "slate", 33, "cool"),
        ("lime-localplay", "grid", "concrete", 35, "warm"),
    ]
    for key, kind, style, fold, tone in configs:
        src = Image.open(SOURCES[key]).convert("RGBA")
        panels = split_strip(src) if kind == "strip" else split_grid(src)
        export_panels(key, panels)
        render_desk(panels, key, style=style, fold_deg=fold)
        render_cover_stack(panels, key, tone=tone)


if __name__ == "__main__":
    main()
