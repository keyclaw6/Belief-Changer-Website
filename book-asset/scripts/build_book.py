#!/usr/bin/env python3
"""Compile a books/<slug> source folder into products/<slug>-{reader,shelf}.html.

The compiled HTML is a self-contained Three.js book. Shared materials and the
runtime engine come from the gold 00-template products; only BK.book, cover
art, logos, and window.BOOK_CONTENT change per title.
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from lib import (  # noqa: E402
    BOOK_ASSET,
    TEMPLATE_SLUG,
    book_dir,
    dump_json,
    file_to_data_url,
    load_json,
    product_path,
    replace_js_assign,
    sample_case_from_cover,
    validate_content,
    validate_slug,
)

VARIANTS = ("reader", "shelf")
SHELF_DROP = ("endpaper_color", "headband_color", "page_edge_scan")


def compile_variant(slug: str, variant: str, book: dict, content: dict, cover_url: str, logos: dict) -> Path:
    template = product_path(TEMPLATE_SLUG, variant)
    if not template.exists():
        raise SystemExit(f"missing gold product {template}")
    html = template.read_text(encoding="utf-8")

    from lib import parse_js_assign

    assets_obj, _, _ = parse_js_assign(html, "BK.assetsPerf")
    if variant == "shelf":
        for key in SHELF_DROP:
            assets_obj.pop(key, None)

    built = {
        "slug": slug,
        "variant": variant,
        "quality": book.get("quality"),
        "cover": {
            "image": cover_url,
            "caseColor": book["caseColor"],
            "caseLuminance": book["caseLuminance"],
        },
        "layout": book.get("layout"),
        "logos": logos,
        "builtAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
    }

    html = replace_js_assign(html, "BK.book", built)
    html = replace_js_assign(html, "window.BOOK_CONTENT", content)
    if variant == "shelf":
        html = replace_js_assign(html, "BK.assetsPerf", assets_obj)

    title = (content.get("meta") or {}).get("title") or slug
    html = html.replace("<title>The Craft of Attention</title>", f"<title>{title}</title>", 1)

    dest = product_path(slug, variant)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(html, encoding="utf-8")
    return dest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("slug", help="books/<slug> to compile")
    parser.add_argument(
        "--variant",
        choices=(*VARIANTS, "both"),
        default="both",
        help="which product to emit (default: both)",
    )
    parser.add_argument(
        "--rebuild-template",
        action="store_true",
        help="allow overwriting the gold 00-template products",
    )
    args = parser.parse_args()
    slug = validate_slug(args.slug)
    src = book_dir(slug)
    if not src.is_dir():
        raise SystemExit(f"no book at {src}")
    if slug == TEMPLATE_SLUG and not args.rebuild_template:
        raise SystemExit(
            "refusing to overwrite the gold 00-template products "
            "(pass --rebuild-template only if you mean to)"
        )

    book_path = src / "book.json"
    content_path = src / "content.json"
    if not book_path.exists() or not content_path.exists():
        raise SystemExit(f"{src} needs book.json and content.json")

    book = load_json(book_path)
    content = load_json(content_path)
    errors = validate_content(content, slug=slug)
    if errors:
        print("content.json failed validation:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 2

    cover_name = book.get("cover") or "cover.webp"
    cover_path = src / cover_name
    if not cover_path.exists():
        raise SystemExit(f"cover not found: {cover_path}")

    if not book.get("caseColor") or book.get("caseLuminance") is None:
        hex_color, lum = sample_case_from_cover(cover_path)
        book["caseColor"] = hex_color
        book["caseLuminance"] = lum
        dump_json(book_path, book)
        print(f"sampled caseColor={hex_color} caseLuminance={lum}")

    cover_url = file_to_data_url(cover_path)
    logos = {}
    for name, rel in (book.get("logos") or {}).items():
        logo_path = src / rel
        if not logo_path.exists():
            raise SystemExit(f"logo {name} missing at {logo_path}")
        logos[name] = file_to_data_url(logo_path)

    variants = VARIANTS if args.variant == "both" else (args.variant,)
    for variant in variants:
        dest = compile_variant(slug, variant, book, content, cover_url, logos)
        print(f"wrote {dest.relative_to(BOOK_ASSET)} ({dest.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
