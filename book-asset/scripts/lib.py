#!/usr/bin/env python3
"""Shared helpers for the Belief Changer 3D book package."""
from __future__ import annotations

import base64
import json
import mimetypes
import re
from pathlib import Path
from typing import Any

BOOK_ASSET = Path(__file__).resolve().parents[1]
REPO_ROOT = BOOK_ASSET.parent
TEMPLATE_SLUG = "00-template"
PAGE_TYPES = ("chapter", "title", "copyright", "toc", "section", "blank")
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dump_json(path: Path, obj: Any) -> None:
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def parse_js_assign(text: str, name: str) -> tuple[Any, int, int]:
    m = re.search(rf"{re.escape(name)}\s*=\s*", text)
    if not m:
        raise ValueError(f"assignment not found: {name}")
    obj, idx = json.JSONDecoder().raw_decode(text[m.end() :])
    return obj, m.start(), m.end() + idx


def replace_js_assign(text: str, name: str, obj: Any) -> str:
    _, start, end = parse_js_assign(text, name)
    dumped = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    return text[:start] + f"{name} = {dumped}" + text[end:]


def file_to_data_url(path: Path) -> str:
    mime, _ = mimetypes.guess_type(path.name)
    if mime is None:
        suffix = path.suffix.lower()
        mime = {
            ".webp": "image/webp",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".woff": "font/woff",
            ".woff2": "font/woff2",
        }.get(suffix, "application/octet-stream")
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def sample_case_from_cover(path: Path) -> tuple[str, float]:
    """Mean colour of a 4% border ring, plus relative luminance.

    Matches the runtime comment in the compiled book: the case is the cover's
    own ground colour, sampled from the image border so spine and boards match.
    """
    from PIL import Image

    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    bw = max(2, int(min(w, h) * 0.04))
    rs = gs = bs = n = 0
    for y in range(h):
        for x in range(w):
            if x < bw or y < bw or x >= w - bw or y >= h - bw:
                r, g, b = px[x, y]
                rs += r
                gs += g
                bs += b
                n += 1
    r, g, b = rs / n, gs / n, bs / n
    hex_color = "#{:02x}{:02x}{:02x}".format(int(round(r)), int(round(g)), int(round(b)))

    def chan(c: float) -> float:
        c = c / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    lum = 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)
    return hex_color, round(lum, 4)


def book_dir(slug: str) -> Path:
    return BOOK_ASSET / "books" / slug


def product_path(slug: str, variant: str) -> Path:
    return BOOK_ASSET / "products" / f"{slug}-{variant}.html"


def validate_slug(slug: str) -> str:
    if not SLUG_RE.match(slug):
        raise SystemExit(
            f"invalid slug {slug!r}: use lowercase letters, numbers, and single hyphens"
        )
    return slug


def validate_content(content: dict, *, slug: str) -> list[str]:
    errors: list[str] = []
    meta = content.get("meta")
    if not isinstance(meta, dict):
        errors.append("content.meta is required")
    else:
        for key in ("title", "subtitle", "author", "imprint"):
            if not str(meta.get(key) or "").strip():
                errors.append(f"content.meta.{key} is required")

    pages = content.get("pages")
    if not isinstance(pages, list) or len(pages) != 11:
        errors.append(f"content.pages must be a list of exactly 11 pages (got {0 if not isinstance(pages, list) else len(pages)})")
        pages = []

    for i, page in enumerate(pages):
        if not isinstance(page, dict):
            errors.append(f"pages[{i}] must be an object")
            continue
        ptype = (page.get("type") or "chapter").lower()
        if ptype not in PAGE_TYPES:
            errors.append(f"pages[{i}].type {ptype!r} is not one of {', '.join(PAGE_TYPES)}")
        if ptype == "title":
            for key in ("title", "author"):
                if not page.get(key):
                    errors.append(f"pages[{i}] title page needs {key}")
        elif ptype == "copyright":
            lines = page.get("lines") or page.get("paragraphs")
            if not isinstance(lines, list) or not lines:
                errors.append(f"pages[{i}] copyright page needs lines[]")
        elif ptype == "toc":
            toc = page.get("toc")
            if not isinstance(toc, list) or not toc:
                errors.append(f"pages[{i}] toc page needs toc[]")
            else:
                for j, entry in enumerate(toc):
                    if not isinstance(entry, dict) or not entry.get("title"):
                        errors.append(f"pages[{i}].toc[{j}] needs title")
        elif ptype == "section":
            if not page.get("title"):
                errors.append(f"pages[{i}] section page needs title")
        elif ptype == "chapter":
            paras = page.get("paragraphs")
            if not page.get("title"):
                errors.append(f"pages[{i}] chapter page needs title")
            if not isinstance(paras, list) or not paras:
                errors.append(f"pages[{i}] chapter page needs paragraphs[]")
            elif any(not str(p).strip() for p in paras):
                errors.append(f"pages[{i}] has an empty paragraph")

    front = content.get("frontCover")
    if not isinstance(front, dict):
        errors.append("content.frontCover is required")
    else:
        for key in ("title", "author"):
            if not front.get(key):
                errors.append(f"content.frontCover.{key} is required")

    back = content.get("backCover")
    if not isinstance(back, dict):
        errors.append("content.backCover is required")
    else:
        if not back.get("headline"):
            errors.append("content.backCover.headline is required")
        if not isinstance(back.get("paragraphs"), list) or not back.get("paragraphs"):
            errors.append("content.backCover.paragraphs must be a non-empty list")

    spine = content.get("spine")
    if not isinstance(spine, dict):
        errors.append("content.spine is required")
    else:
        for key in ("title", "author"):
            if not spine.get(key):
                errors.append(f"content.spine.{key} is required")

    if slug == TEMPLATE_SLUG:
        return errors
    blob = json.dumps(content, ensure_ascii=False)
    leftovers = []
    for marker in ("The Craft of Attention", "Mara Ellison", "North Window"):
        if marker in blob:
            leftovers.append(marker)
    if leftovers:
        errors.append(
            "new books must replace the template voice; still present: "
            + ", ".join(leftovers)
        )
    return errors
