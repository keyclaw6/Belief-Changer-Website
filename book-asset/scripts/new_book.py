#!/usr/bin/env python3
"""Create a new books/<slug> folder from the 00-template source.

Copies the template's book.json, content.json, and optional logo. The cover is
either copied from --cover or left as a reminder to drop one in. Does not
compile HTML — edit headlines and writing first, then run build_book.py.
"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from lib import (  # noqa: E402
    BOOK_ASSET,
    TEMPLATE_SLUG,
    book_dir,
    dump_json,
    load_json,
    validate_slug,
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("slug", help="new book slug, e.g. sugar")
    parser.add_argument("--title", help="working title written into book.json and content.meta")
    parser.add_argument("--cover", help="path to a textless 2:3 cover image to copy in")
    parser.add_argument("--force", action="store_true", help="overwrite an existing books/<slug>")
    args = parser.parse_args()

    slug = validate_slug(args.slug)
    if slug == TEMPLATE_SLUG:
        raise SystemExit("refusing to overwrite the 00-template book")

    src = book_dir(TEMPLATE_SLUG)
    dest = book_dir(slug)
    if dest.exists():
        if not args.force:
            raise SystemExit(f"{dest} already exists (pass --force to replace)")
        shutil.rmtree(dest)
    dest.mkdir(parents=True)

    book = load_json(src / "book.json")
    content = load_json(src / "content.json")
    title = args.title or slug.replace("-", " ").title()

    book["slug"] = slug
    book["title"] = title
    book["caseColor"] = None
    book["caseLuminance"] = None
    book["notes"] = (
        f"Cloned from {TEMPLATE_SLUG}. Replace cover, headlines, and writing, "
        "then run: python3 book-asset/scripts/build_book.py " + slug
    )

    content["meta"]["title"] = title
    if isinstance(content.get("frontCover"), dict):
        content["frontCover"]["title"] = title
    if isinstance(content.get("spine"), dict):
        content["spine"]["title"] = title.upper()
    if content.get("pages") and isinstance(content["pages"][0], dict):
        content["pages"][0]["title"] = title

    cover_name = book.get("cover") or "cover.webp"
    if args.cover:
        cover_src = Path(args.cover).expanduser().resolve()
        if not cover_src.exists():
            raise SystemExit(f"cover not found: {cover_src}")
        suffix = cover_src.suffix.lower() or ".webp"
        cover_name = f"cover{suffix}"
        shutil.copy2(cover_src, dest / cover_name)
        book["cover"] = cover_name
    else:
        # Leave a named slot so the agent knows what to drop in.
        book["cover"] = "cover.webp"
        (dest / "COVER_REQUIRED.txt").write_text(
            "Drop a textless 2:3 cover here as cover.webp (or update book.json cover).\n"
            "Prefer an accepted file from ../../assets/covers/. Never invent a new cover look.\n"
        )

    if (src / "logos").is_dir():
        shutil.copytree(src / "logos", dest / "logos")

    dump_json(dest / "book.json", book)
    dump_json(dest / "content.json", content)

    print(f"created {dest.relative_to(BOOK_ASSET.parent)}")
    print("next:")
    print(f"  1. put a textless 2:3 cover at {dest.relative_to(BOOK_ASSET.parent)}/{book['cover']}")
    print(f"  2. rewrite {dest.relative_to(BOOK_ASSET.parent)}/content.json headlines and pages")
    print(f"  3. python3 book-asset/scripts/build_book.py {slug}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
