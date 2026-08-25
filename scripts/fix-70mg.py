#!/usr/bin/env python3
"""Relabel the caffeine figure on the opening frames: 70mg -> 100mg.

The KZ product is 100 mg a pouch — it is what the catalogue sells and what the
KZ tin render says — while this render sequence is of the 70 mg SKU. Frames
0-35 are the ones where the lid face is readable.

The tin bobs and rises: its content bbox moves ~115px vertically by frame 29,
so a fixed rectangle would only ever hit frame 0. The label is tracked from the
previous frame's position by normalised cross-correlation over a small window.

Usage:
    python3 scripts/fix-70mg.py --preview   # frame 0 only, writes a comparison
    python3 scripts/fix-70mg.py             # all 36 frames, saved in place
"""
from __future__ import annotations

import argparse
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

FRAMES = 'public/animation/frames'
FIRST, LAST = 0, 35
# Read off a zoomed grid on frame 0.
BOX = (216, 483, 280, 523)
ANGLE = -14.0            # the label sits at roughly this slant
FONT_CANDIDATES = [
    '/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/Library/Fonts/Arial Bold.ttf',
]


def font_path() -> str:
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            return p
    raise SystemExit('no usable font found; edit FONT_CANDIDATES')


def frame_path(n: int) -> str:
    return f'{FRAMES}/energy_web__{n:05d}.webp'


def ncc(a: np.ndarray, b: np.ndarray) -> float:
    """Normalised cross-correlation of two equal-shaped float arrays."""
    a = a - a.mean()
    b = b - b.mean()
    d = math.sqrt(float((a * a).sum()) * float((b * b).sum()))
    return float((a * b).sum() / d) if d > 1e-6 else -1.0


def track(gray: np.ndarray, template: np.ndarray, guess: tuple[int, int],
          radius: int = 26) -> tuple[int, int, float]:
    """Best top-left for `template` near `guess`."""
    th, tw = template.shape
    gh, gw = gray.shape
    best = (-2.0, guess)
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            x, y = guess[0] + dx, guess[1] + dy
            if x < 0 or y < 0 or x + tw > gw or y + th > gh:
                continue
            score = ncc(template, gray[y:y + th, x:x + tw])
            if score > best[0]:
                best = (score, (x, y))
    return best[1][0], best[1][1], best[0]


def smooth_fill(patch: np.ndarray) -> np.ndarray:
    """Replace a patch with a smooth interpolation of its own border.

    A flat average would read as a sticker on a gradient; relaxing the interior
    towards the edges keeps the lid's shading running through the repair.
    """
    out = patch.astype(np.float32).copy()
    h, w = out.shape[:2]
    inner = np.zeros((h, w), bool)
    inner[2:-2, 2:-2] = True

    for _ in range(160):
        blur = out.copy()
        blur[1:-1, 1:-1] = (
            out[:-2, 1:-1] + out[2:, 1:-1] + out[1:-1, :-2] + out[1:-1, 2:]
        ) / 4.0
        out[inner] = blur[inner]
    return np.clip(out, 0, 255).astype(np.uint8)


def measure_lines(region: np.ndarray) -> tuple[dict, dict] | None:
    """Find the two printed lines inside the region: the figure and its caption.

    Sizing the replacement from the box would be guesswork; sizing it from the
    ink it replaces is not. On frame 0 this reads 42x19 for the figure and
    53x9 for the caption, which is what the new label is matched to.
    """
    lum = region.mean(2)
    ink = lum > (np.median(lum) + 7)
    rows = ink.sum(1)
    dense = np.nonzero(rows > 4)[0]
    if dense.size < 6:
        return None

    # Split the two lines at the widest vertical gap between dense rows.
    gaps = np.diff(dense)
    cut = int(dense[int(np.argmax(gaps))]) if gaps.size and gaps.max() > 1 else None
    if cut is None:
        return None

    out = []
    for a, b in ((dense[0], cut + 1), (cut + 1, dense[-1] + 1)):
        band = ink[a:b]
        ys, xs = np.nonzero(band)
        if xs.size == 0:
            return None
        out.append({'x': int(xs.min()), 'y': int(a),
                    'w': int(xs.max() - xs.min() + 1), 'h': int(b - a)})
    return out[0], out[1]


def draw_slanted(img: Image.Image, text: str, size: int, colour: tuple[int, int, int],
                 alpha: int, left: int, mid_y: int) -> None:
    """Draw `text` at the label's slant, left-aligned on `left`, centred on `mid_y`.

    Rendered upright, rotated, then placed by the ink it actually produces —
    aligning on the layer instead would drift with the glyphs' bearings.
    """
    fnt = ImageFont.truetype(font_path(), size)
    pad = 30
    lay = Image.new('RGBA', (int(len(text) * size) + pad * 2, size * 3 + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text((pad, pad), text, font=fnt, fill=(*colour, alpha))
    lay = lay.rotate(-ANGLE, resample=Image.BICUBIC, expand=True)

    bbox = lay.getbbox()
    if bbox is None:
        return
    img.alpha_composite(lay, (left - bbox[0], mid_y - (bbox[1] + bbox[3]) // 2))


def process(n: int, guess: tuple[int, int], template: np.ndarray | None,
            save: bool) -> tuple[tuple[int, int], np.ndarray, Image.Image, Image.Image]:
    im = Image.open(frame_path(n)).convert('RGBA')
    arr = np.array(im)
    gray = np.asarray(im.convert('L'), dtype=np.float32)

    if template is None:
        x0, y0, x1, y1 = BOX
        template = gray[y0:y1, x0:x1].copy()
        pos, score = (x0, y0), 1.0
    else:
        x, y, score = track(gray, template, guess)
        pos = (x, y)

    th, tw = template.shape
    x0, y0 = pos
    x1, y1 = x0 + tw, y0 + th
    before = im.copy()

    region = arr[y0:y1, x0:x1, :3]
    # The lettering is lighter paint than the lid around it.
    lum = region.mean(2)
    ink = lum > (np.median(lum) + 7)
    colour = tuple(int(v) for v in region[ink].mean(0)) if ink.any() else (210, 190, 240)

    lines = measure_lines(region.astype(float))
    arr[y0:y1, x0:x1, :3] = smooth_fill(region)
    out = Image.fromarray(arr)

    if lines is not None:
        figure, caption = lines
        # 0.78: the measured height bounds slanted glyphs, so the upright cap
        # height that reproduces it is a little smaller than the box.
        draw_slanted(out, '100mg', max(9, int(figure['h'] * 0.78)), colour, 175,
                     x0 + figure['x'], y0 + figure['y'] + figure['h'] // 2)
        draw_slanted(out, 'caffeine', max(6, int(caption['h'] * 0.95)), colour, 150,
                     x0 + caption['x'], y0 + caption['y'] + caption['h'] // 2)

    if save:
        out.save(frame_path(n), 'WEBP', quality=92, method=6)
    return pos, template, before, out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview', action='store_true',
                    help='frame 0 only, write a before/after and change nothing')
    args = ap.parse_args()

    if not os.path.isdir(FRAMES):
        print(f'run from the project root: {FRAMES} not found', file=sys.stderr)
        return 1

    guess = (BOX[0], BOX[1])
    template = None

    if args.preview:
        _, _, before, after = process(0, guess, None, save=False)
        z = 6
        crop = (BOX[0] - 24, BOX[1] - 24, BOX[2] + 24, BOX[3] + 24)
        w, h = crop[2] - crop[0], crop[3] - crop[1]
        sheet = Image.new('RGB', (w * z * 2 + 30, h * z + 26), (32, 27, 36))
        d = ImageDraw.Draw(sheet)
        for i, (label, img) in enumerate((('было', before), ('стало', after))):
            bg = Image.new('RGBA', img.size, (32, 27, 36, 255))
            bg.alpha_composite(img)
            tile = bg.convert('RGB').crop(crop).resize((w * z, h * z), Image.NEAREST)
            sheet.paste(tile, (i * (w * z + 30), 26))
            d.text((i * (w * z + 30) + 4, 6), label, fill=(255, 255, 0))
        sheet.save('/tmp/fix70-preview.png')
        print('preview -> /tmp/fix70-preview.png (кадры не изменены)')
        return 0

    for n in range(FIRST, LAST + 1):
        pos, template, _, _ = process(n, guess, template, save=True)
        guess = pos
        print(f'  frame {n:02d}/{LAST} -> метка в ({pos[0]}, {pos[1]})')
    print('готово')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
