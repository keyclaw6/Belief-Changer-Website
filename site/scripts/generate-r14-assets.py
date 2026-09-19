"""R14 asset generator (Track A final). Derives responsive plates + honest
foreground nosing cutouts from the two immutable R14 masters.

Inputs (NEVER modified, only read):
  site/public/site/a-r14-master-desktop.png  (1536x1024)
  site/public/site/a-r14-master-mobile.png   (941x1672)

Outputs (site/public/responsive/site/):
  a-r14-plate-{768,1280,1536}.webp/.avif     desktop plate renditions
  a-r14-platem-{480,768,941}.webp/.avif      mobile plate renditions
  a-r14-fore.webp                            desktop nosing band (alpha)
  a-r14-forem.webp                           mobile nosing band (alpha)

Nosing contours traced from the served master pixels (see R14-RESULT.md):
  desktop: y_cut(x) = 0.032*x + 743   (1536x1024 px; book base y=768)
  mobile:  y_cut(x) = 0.031*x + 1227  (941x1672 px; book base y=1254)
Alpha is 0 above the contour, ramps to opaque 5px below it (short feather).
Band RGB is the plate RGB through q95 WebP (mean abs diff ~7-10 in the
stone-texture band, perceptually invisible; edges invisible since band RGB
continues the same scene). Bands are positioned over the stage in plate
fractions, and registration is verified by rest-diff measurement plus 2x
contact-crop inspection (see R14-RESULT.md).

Usage: python3 site/scripts/generate-r14-assets.py  (from repo root)
"""
from PIL import Image
import numpy as np
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC_DIR = os.path.join(ROOT, "site", "public", "site")
OUT_DIR = os.path.join(ROOT, "site", "public", "responsive", "site")

DESKTOP_MASTER = os.path.join(SRC_DIR, "a-r14-master-desktop.png")
MOBILE_MASTER = os.path.join(SRC_DIR, "a-r14-master-mobile.png")

DESKTOP_WIDTHS = [768, 1280, 1536]
MOBILE_WIDTHS = [480, 768, 941]

# Nosing bands in plate px (generous margins; edges invisible: RGB == plate).
DESKTOP_BOX = (380, 720, 760, 800)    # fractions of 1536x1024
MOBILE_BOX = (45, 1210, 595, 1280)     # fractions of 941x1672


def cutout(master, slope, intercept, box):
    band = master.convert("RGBA").crop(box)
    w, h = band.size
    a = np.asarray(band).copy()
    xs = np.arange(w, dtype=float) + box[0]
    cut = slope * xs + intercept - box[1]  # contour in band coords
    yy = np.arange(h, dtype=float)[:, None]
    alpha = np.clip((yy - (cut[None, :] - 2)) / 5.0, 0, 1) * 255
    a[:, :, 3] = alpha.astype("uint8")
    return Image.fromarray(a)


def emit_plate(name, img, widths):
    base_w = img.size[0]
    for w in widths:
        target = img if w == base_w else img.resize(
            (w, round(img.size[1] * w / base_w)), Image.LANCZOS
        )
        p = os.path.join(OUT_DIR, "%s-%d.webp" % (name, w))
        target.save(p, "WEBP", quality=86, method=6)
        q = os.path.join(OUT_DIR, "%s-%d.avif" % (name, w))
        target.save(q, "AVIF", quality=50, speed=6)
        print(p, os.path.getsize(p), q, os.path.getsize(q))


def emit_band(name, img):
    p = os.path.join(OUT_DIR, name + ".webp")
    img.save(p, "WEBP", quality=95, method=6)
    print(p, os.path.getsize(p), img.size)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    desktop = Image.open(DESKTOP_MASTER)
    mobile = Image.open(MOBILE_MASTER)
    print("desktop", desktop.size, "mobile", mobile.size)
    emit_plate("a-r14-plate", desktop, DESKTOP_WIDTHS)
    emit_plate("a-r14-platem", mobile, MOBILE_WIDTHS)
    emit_band("a-r14-fore", cutout(desktop, 0.032, 743, DESKTOP_BOX))
    emit_band("a-r14-forem", cutout(mobile, 0.031, 1227, MOBILE_BOX))


if __name__ == "__main__":
    main()
