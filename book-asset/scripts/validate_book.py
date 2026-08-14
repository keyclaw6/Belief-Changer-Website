#!/usr/bin/env python3
"""Validate a books/<slug> folder without compiling it."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from lib import book_dir, load_json, validate_content, validate_slug  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("slug")
    args = parser.parse_args()
    slug = validate_slug(args.slug)
    src = book_dir(slug)
    if not src.is_dir():
        raise SystemExit(f"no book at {src}")

    book = load_json(src / "book.json")
    content = load_json(src / "content.json")
    errors = validate_content(content, slug=slug)
    cover = src / (book.get("cover") or "cover.webp")
    if not cover.exists():
        errors.append(f"cover missing: {cover.name}")
    for name, rel in (book.get("logos") or {}).items():
        if not (src / rel).exists():
            errors.append(f"logo {name} missing at {rel}")

    if errors:
        print(f"{slug}: {len(errors)} error(s)")
        for err in errors:
            print(f"  - {err}")
        return 2
    print(f"{slug}: ok ({len(content.get('pages', []))} pages, cover {cover.name})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
