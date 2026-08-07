#!/usr/bin/env python3
"""
derive-surfaces.py — Belief Changer cover pipeline.

For every front-cover texture in assets/covers/ (per covers-manifest.json):
  1. Sample the ground: mean color of the clean upper strip (top 12%) -> groundHex.
  2. Extract the vertical gradient trend from the clean upper region (top 38%),
     extrapolate it over full cover height.
  3. Measure photographic grain (residual std) in the clean region and re-apply
     matched Gaussian grain so derived surfaces feel like the same print.
  4. Render seamless spine (256x1536) and back (1024x1536) textures.
  5. Compute overlay ink (charcoal on light grounds, bone on deep) from ground
     luminance and verify against the manifest.

Outputs: assets/covers/derived/{slug}-spine.png / {slug}-back.png,
         covers-manifest.json updated in place (groundHex, overlayInkComputed).

Run from the kit root:  python3 scripts/derive-surfaces.py
"""
import json, os, sys
from PIL import Image

try:
    import numpy as np
except ImportError:
    np = None

KIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COVERS = os.path.join(KIT, 'assets', 'covers')
DERIVED = os.path.join(COVERS, 'derived')
MANIFEST = os.path.join(COVERS, 'covers-manifest.json')

BACK_W, BACK_H = 1024, 1536
SPINE_W = 256

def rel_luminance(rgb):
    def chan(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (chan(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def derive(front_path, slug):
    im = Image.open(front_path).convert('RGB')
    W, H = im.size
    if np is None:
        sys.exit('numpy required for grain synthesis; pip install numpy')
    arr = np.asarray(im, dtype=np.float64)

    clean_h = int(H * 0.38)
    clean = arr[:clean_h]                       # clean upper region (pure ground)
    row_means = clean.mean(axis=(1,))           # per-row mean color (clean_h, 3)

    # ground hex from top 12%
    top = arr[:int(H * 0.12)]
    ground = top.mean(axis=(0, 1))
    ground_hex = '#{:02X}{:02X}{:02X}'.format(*(int(round(v)) for v in ground))

    # linear gradient trend per channel over the clean rows, extrapolated to full height
    ys = np.arange(clean_h)
    full_ys = np.arange(BACK_H) * (H / BACK_H)  # map derived rows to source-height scale
    grad = np.empty((BACK_H, 3))
    for ch in range(3):
        slope, intercept = np.polyfit(ys, row_means[:, ch], 1)
        # damp the extrapolated slope beyond the sampled region so the bottom
        # doesn't overshoot: full strength inside, 40% strength beyond.
        vals = np.where(full_ys <= clean_h,
                        intercept + slope * full_ys,
                        intercept + slope * clean_h + 0.4 * slope * (full_ys - clean_h))
        grad[:, ch] = vals

    # grain: residual std of the clean region after removing the row means
    residual = clean - row_means[:, None, :]
    grain_std = float(residual.std())

    rng = np.random.default_rng(hash(slug) % (2**32))
    def render(w, h):
        base = np.repeat(grad[None, :, :], w, axis=0).transpose(1, 0, 2)  # (h, w, 3)
        noise = rng.normal(0.0, grain_std, size=(h, w, 3))
        out = np.clip(base + noise, 0, 255).astype(np.uint8)
        return Image.fromarray(out, 'RGB')

    os.makedirs(DERIVED, exist_ok=True)
    render(SPINE_W, BACK_H).save(os.path.join(DERIVED, f'{slug}-spine.png'))
    render(BACK_W, BACK_H).save(os.path.join(DERIVED, f'{slug}-back.png'))

    # pick overlay ink by actual WCAG contrast ratio against both candidates
    CHARCOAL = (0x2F, 0x34, 0x37)
    BONE = (0xF5, 0xF1, 0xE8)
    Lg = rel_luminance(ground)
    def cr(ink_rgb):
        Li = rel_luminance(ink_rgb)
        hi, lo = max(Lg, Li), min(Lg, Li)
        return (hi + 0.05) / (lo + 0.05)
    ink = 'charcoal' if cr(CHARCOAL) >= cr(BONE) else 'bone'
    return ground_hex, ink, grain_std, cr(CHARCOAL), cr(BONE)

def main():
    with open(MANIFEST) as f:
        manifest = json.load(f)
    print(f"{'slug':<14}{'groundHex':<11}{'ink':<10}{'CR-charcoal':<13}{'CR-bone':<9}{'grain σ'}")
    for book in manifest['books']:
        path = os.path.join(COVERS, book['file'])
        hexv, ink, g, crc, crb = derive(path, book['slug'])
        book['groundHex'] = hexv
        book['overlayInk'] = ink            # contrast-correct ink is authoritative
        book['overlayInkComputed'] = ink
        print(f"{book['slug']:<14}{hexv:<11}{ink:<10}{crc:<13.2f}{crb:<9.2f}{g:.2f}")
    manifest['derived'] = 'assets/covers/derived/{slug}-spine.png · {slug}-back.png'
    with open(MANIFEST, 'w') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print('\nmanifest updated:', MANIFEST)

if __name__ == '__main__':
    main()
