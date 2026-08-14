# book-asset

Photoreal hardcover for the Belief Changer site. The engine is finished. New titles are data.

**Start at [`SKILL.md`](SKILL.md)** — agentskills.io format, the operating loop for minting a book from a cover, headlines, and writing.

```
books/<slug>/     source (cover + content.json)
scripts/          new_book.py · validate_book.py · build_book.py
products/         compiled <slug>-reader.html and <slug>-shelf.html
```

`00-template` is the gold book (`The Craft of Attention`). Copy it; do not rebuild Three.js.

```bash
python3 book-asset/scripts/new_book.py sugar \
  --title "The Sugar Trap" \
  --cover assets/covers/01-sugar.png
# rewrite book-asset/books/sugar/content.json
python3 book-asset/scripts/validate_book.py sugar
python3 book-asset/scripts/build_book.py sugar
```
