# Proposal: Procedural 3D Book Asset Pipeline

We want to build a highly realistic, reusable 3D book for the web. The book should support opening, closing, and turning one page at a time with convincing physical movement.

The proposed workflow is:

1. Generate the detailed book asset procedurally using Blender Python.
2. Run Blender headlessly to execute the Python and create the model.
3. Export the finished reusable asset as GLB.
4. Load the GLB into Three.js.
5. Use Three.js for browser rendering, interaction, page changes, and realtime animation.
6. Reuse the same underlying book asset for multiple books by changing covers, page textures, dimensions, colors, and other parameters.

Blender should therefore be treated as the asset-generation/build system. Three.js should be treated as the runtime.

The browser should not need Blender.

## Asset structure

Do not model the book as hundreds of individually simulated pages.

Instead, construct it from a few logical parts:

- Front cover
- Back cover
- Spine
- Left page block
- Right page block
- Left visible page
- Right visible page
- One active page used during a page turn
- Optional additional loose pages near the active page if needed for realism
- Small physical details such as page edges, stitching, headbands, cover bevels, embossing, and gaps between components

The left and right page blocks represent all pages that are not currently moving.

When a page is turned, adjust the apparent thickness of the two page blocks rather than physically moving every page.

For example:

- Before turning: 120 pages on the right, 80 on the left.
- During the turn: one active page moves independently.
- After turning: 119 pages on the right, 81 on the left.

This should allow books containing hundreds of pages without hundreds of expensive animated meshes.

## Book opening

The book should not simply consist of two rigid halves rotating around one perfectly fixed hinge.

The spine and binding should visibly react as the book opens.

Consider:

- Front and back covers rotating around the binding
- Slight deformation of the spine
- Compression and expansion around the hinge
- Page blocks changing shape as the opening angle changes
- Pages near the spine remaining constrained by the binding
- Natural gaps between covers and paper
- The book not necessarily lying perfectly flat when open
- Different behavior for hardcover versus softcover books

The geometry and rig should make these effects controllable rather than permanently baked into one pose.

## Page turning

The active page is the most important animated component.

A realistic page should not rotate like a rigid plane.

During a page turn, model several simultaneous effects:

- The page lifts first from the outer edge.
- The region near the spine remains constrained.
- The page develops a curved shape as it moves.
- The outer corners can lag slightly behind the center.
- The top and bottom of the page do not need to follow exactly the same path.
- The page can sag slightly under gravity.
- The page becomes more vertical around the middle of the turn.
- The curvature changes throughout the movement.
- The page gradually uncurls as it approaches the opposite page block.
- The final part of the page settles onto the stack rather than stopping abruptly.

Prefer a deterministic rig or procedural deformation over relying entirely on realtime cloth simulation.

A useful representation would expose high-level parameters such as:

- turn progress
- page curl
- curl radius
- page stiffness
- spine resistance
- gravity sag
- upper corner lag
- lower corner lag
- twist
- landing softness
- turn duration

The active page could use approximately 16–32 deformation sections or bones across its width, with sufficient subdivisions vertically to allow slight twisting.

Blender cloth simulation may be used during development to study realistic page motion or generate reference poses, but the final browser animation should preferably use a predictable rig, morph targets, bones, procedural deformation, or a shader rather than a full cloth simulation.

## Layer the realism

Build the asset progressively instead of attempting maximum realism immediately.

### Layer 1 — Basic mechanical book

First make sure these work correctly:

- Covers
- Spine
- Page blocks
- Opening and closing
- One active page
- Basic page turn

Do not add small visual details before the mechanical behavior works.

### Layer 2 — Page deformation

Improve:

- Curl
- Sag
- twist
- corner lag
- transition between page stacks
- realistic contact at the end of the turn

### Layer 3 — Binding behavior

Improve:

- Spine flexibility
- cover hinges
- paper compression near the spine
- page block movement as the book opens
- realistic opening angles

### Layer 4 — Geometry details

Add:

- beveled cover edges
- slightly rounded page corners
- page edge variation
- small gaps between page block and cover
- headbands
- stitching if visible
- cover thickness
- paper thickness
- optional embossed cover details

### Layer 5 — Materials

Create realistic but web-efficient materials for:

- paper
- printed paper
- cloth cover
- leather cover
- cardboard
- page edges

Paper should not look like perfectly smooth white plastic.

Consider subtle roughness, slight color variation, normal maps, and very restrained surface irregularity.

### Layer 6 — Web optimization

Only after the visual result works, optimize it for realtime rendering.

Consider:

- sensible polygon counts
- texture resolution
- Meshopt or Draco where appropriate
- KTX2/Basis textures where appropriate
- reusable geometry
- GPU instancing where useful
- lazy loading
- avoiding unnecessary individual page meshes

## Blender Python workflow

Create the source asset through Python rather than manual Blender editing wherever practical.

The basic pipeline should look like:

```text
book_generator.py
        ↓
Blender Python / bpy
        ↓
book.blend
        ↓
export
        ↓
book.glb
```

Blender should be executable headlessly, for example:

```bash
blender --background --python book_generator.py
```

The Python script should create or configure the geometry, materials, hierarchy, rig, and export settings.

The generated Blender file may also be saved so it remains inspectable and editable.

The final command should export the web asset as GLB.

Do not use STL for this pipeline.

GLB should preserve the useful scene structure, including geometry, hierarchy, materials, UVs, bones/skinning, morph targets, and animations where appropriate.

## Three.js runtime

Three.js should load the resulting GLB and provide the runtime interaction.

The desired API should eventually be substantially simpler than manipulating raw Blender objects or Three.js meshes.

For example:

```js
const book = new Book({
  model: "/models/book.glb",
  pageCount: 286,
  cover: "/books/example/cover.webp"
});

book.open();
book.close();
book.nextPage();
book.previousPage();
book.goToPage(42);
```

Individual books should ideally share the same master geometry.

A page or book should not require regenerating the GLB unless its physical construction is genuinely different.

Different titles should normally be represented through:

- cover textures
- back-cover textures
- spine textures
- page textures
- number of pages
- page-block thickness
- book dimensions where practical
- material parameters

Page content should preferably remain outside the GLB.

For example:

```text
/models/book.glb

/books/book-a/
    cover.webp
    back.webp
    spine.webp
    page-001.webp
    page-002.webp
    page-003.webp
    ...
```

Only load page textures that are currently visible or likely to become visible soon.

## Multiple books

The final system must support multiple books on the same webpage.

Avoid duplicating expensive geometry unnecessarily.

Ideally:

```text
                     master book GLB
                           |
          +----------------+----------------+
          |                |                |
        Book A           Book B           Book C
          |                |                |
      textures A       textures B       textures C
```

Each instance should have independent state:

- open/closed
- opening angle
- current page
- page-turn animation
- position
- rotation
- scale

The architecture should remain performant with several books visible simultaneously.

## Agent workflow

The AI agent should be able to perform the complete development loop autonomously.

It should:

1. Write or modify the Blender Python.
2. Run Blender headlessly.
3. Export the GLB.
4. Load the asset in the Three.js development environment.
5. Render the result in a browser.
6. Capture screenshots or other visual output.
7. Inspect the output with vision capabilities.
8. Identify visual or mechanical problems.
9. Modify the relevant parameters or code.
10. Repeat until the result is convincing.

Prefer parameterized systems over large amounts of one-off geometry.

For example, instead of hard-coding a specific page animation, expose something conceptually similar to:

```python
page_turn(
    progress=0.55,
    curl=0.62,
    stiffness=0.8,
    spine_resistance=0.9,
    sag=0.12,
    corner_lag=0.08
)
```

The long-term goal should be to create a small reusable Book API or procedural library so later AI agents work with meaningful concepts such as `create_book`, `create_page_rig`, `set_cover`, `turn_page`, and `export_web_glb` rather than repeatedly manipulating low-level Blender operations.

## Proposed development strategy

Do not attempt the final photorealistic version in one generation.

Start with one test book.

First achieve:

1. Correct geometry.
2. Correct opening.
3. Convincing page turning.
4. Reliable GLB export.
5. Correct Three.js playback.
6. Multiple instances.
7. Dynamic page and cover textures.

Then progressively increase realism.

The most important technical prototype is not the cover material or tiny geometric details. It is demonstrating that one page can move convincingly from one stack to the other while the spine, page blocks, and covers react naturally.

Once that system works, visual fidelity can be layered on without changing the overall architecture.

The desired end state is:

```text
AI agent
    ↓
procedural Book system
    ↓
Blender Python
    ↓
high-quality master asset
    ↓
GLB
    ↓
Three.js Book component
    ↓
multiple interactive realistic books in browser
```

The implementation should prioritize visual realism, deterministic behavior, reuse, browser performance, and an architecture that is easy for language-model agents to understand and modify.