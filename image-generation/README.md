# Image Generation Workspace

This directory is the single entrypoint for generating new visual assets. It contains
the image-specific skills, exact accepted prompts, reference-image pointers, and
operating process. It contains no image-generation client or API integration: the
agent doing the work supplies image-generation and vision capabilities.

Production assets do not live here. Accepted files stay in `../assets/covers/` and
`../assets/site/`, then enter the website through its normal asset path.

## Read in this order

1. For a front cover, read `covers/SKILL.md`, then
   `covers/references/gallery.md`.
2. For non-cover website imagery, read `site-imagery/SKILL.md`, then
   `site-imagery/references/gallery.md`.
3. Follow the selected skill verbatim. The cover prompt structure and anchor process
   remain sacred.

Paths inside each instruction file are relative to that file's own directory.

## Accepted-image record

Every newly accepted image gets a Markdown entry in the selected skill's
`references/gallery.md`. Do not create JSON generation records. Record:

- production asset path and SHA-256;
- generation date and acceptance status;
- image-generation model, endpoint, size, quality, and other settings;
- exact prompt, without rewriting or summarizing it;
- every reference-image path and SHA-256;
- vision/interpreting model used for QA;
- concise visual QA result and the owner's decision.

The gallery entry and the production asset together are the provenance record. Never
overwrite an accepted asset or its exact prompt. A revision receives a new recorded
generation and is promoted only after review.

## Cover-to-book boundary

The image model produces a flat, textless front-cover asset only. Spine and back
textures are derived by `../scripts/derive-surfaces.py`; localized title typography is
added by code; book geometry, materials, light, and physical presentation belong to the
3D book renderer. Never ask an image model to reinterpret an accepted cover as a book.
