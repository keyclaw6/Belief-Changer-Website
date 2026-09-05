window.BK = window.BK || {};
BK.text = (() => {

  /* ------------------------------------------------------------- defaults */
  const DEFAULTS = {
    cover: {
      x: 0.115,            // left margin, fraction of board width
      w: 0.760,            // measure available for wrapping
      align: 'left',
      eyebrow:  { fy: 0.115, size: 0.0130, font: 'bodyMedium', tracking: 0.165, upper: true, opacity: 0.80 },
      title:    { fy: 0.180, size: 0.0640, font: 'display', lineHeight: 1.06 },
      rule:     { gap: 0.022, w: 0.125, thickness: 0.0016, opacity: 0.55 },
      subtitle: { gap: 0.030, size: 0.0225, font: 'displayItalic', lineHeight: 1.30, opacity: 0.88 },
      author:   { fy: 0.918, size: 0.0158, font: 'bodyMedium', tracking: 0.105, upper: true },
      edition:  { fy: 0.951, size: 0.0112, font: 'body', opacity: 0.70 },
    },
    spine: {
      // Fractions of the spine's own length (the board height) measured from the
      // head, and of the spine width across the rounded back.
      title:  { fy: 0.500, size: 0.0300, font: 'display', tracking: 0.045, upper: true },
      author: { fy: 0.500, size: 0.0150, font: 'bodyMedium', tracking: 0.075, upper: true,
                across: 0.30, opacity: 0.85 },
      mark:   { fy: 0.940, size: 0.0130, font: 'bodyMedium', tracking: 0.10, upper: true, opacity: 0.75 },
      readDown: true,      // title reads head-to-tail when the book lies face up
    },
    /* Page printing. Margins are fractions of the page's width and height; the
       gutter margin is always the bound edge, whichever screen side that lands
       on. Type sizes are fractions of the page height, so they scale with the
       book rather than with a pixel canvas. */
    page: {
      gutter: 0.132, fore: 0.098, top: 0.082, bottom: 0.930,
      kicker:  { size: 0.0125, font: 'bodyMedium', tracking: 0.150, upper: true, opacity: 0.68 },
      title:   { size: 0.0335, font: 'display', lineHeight: 1.20 },
      rule:    { gap: 0.019, w: 0.112, thickness: 0.0011, opacity: 0.42 },
      body:    { size: 0.0208, font: 'body', lineHeight: 1.52, paraGap: 0.0165, opacity: 0.94 },
      folio:   { size: 0.0140, font: 'body', opacity: 0.62 },
      runHead: { size: 0.0098, font: 'bodyMedium', tracking: 0.135, upper: true, opacity: 0.42 },
      titleGap: 0.030,   // below the kicker
      bodyGap:  0.026,   // below the rule
      /* ---- front-matter page types (content.type) ---- */
      /* "title" — centred title page. fy positions are fractions of page height
         from the head, so the block sits in the upper-middle area. The stack is
         recentred as a group by titlePage.centerFy (see buildPage). */
      titlePage: {
        centerFy: 0.460,                     // vertical centre of the whole stack
        title:    { size: 0.052, font: 'display', lineHeight: 1.14 },
        subtitle: { size: 0.0195, font: 'displayItalic', lineHeight: 1.30, opacity: 0.90 },
        rule:     { gap: 0.020, w: 0.110, thickness: 0.0011, opacity: 0.42 },
        author:   { size: 0.0155, font: 'bodyMedium', tracking: 0.110, upper: true },
        imprint:  { size: 0.0108, font: 'body', opacity: 0.70 },
        logo:     { w: 0.150, gap: 0.020 },  // logo width as a fraction of page width
        gaps:     { subtitle: 0.022, rule: 0.020, author: 0.038, imprint: 0.024, logo: 0.020 },
      },
      /* "copyright" — small imprint lines, flush to the foot of the text block
         (vAlign: 'bottom' by default; 'center' stacks them about the middle). */
      copyright: {
        size: 0.0108, font: 'body', lineHeight: 1.55, paraGap: 0.012, opacity: 0.88,
        vAlign: 'bottom',
      },
      /* "toc" — a heading plus one line per entry; the page number is a second
         mesh right-aligned at the fore-edge margin. Set leader:true to add a
         dotted leader rule between them. */
      toc: {
        heading:    { size: 0.0260, font: 'display' },
        headGap:    0.034,
        entry:      { size: 0.0165, font: 'body', opacity: 0.94 },
        entryGap:   0.014,
        num:        { size: 0.0165, font: 'bodyMedium', opacity: 0.90 },
        leader:     true, thickness: 0.0012, opacity: 0.50, dot: 0.0050, dotGap: 0.013, inset: 0.010,
      },
      /* "section" — a centred divider: optional kicker, a large centred line,
         and a short optional subtitle. Recentred as a group by section.centerFy. */
      section: {
        centerFy: 0.470,
        kicker:   { size: 0.0115, font: 'bodyMedium', tracking: 0.170, upper: true, opacity: 0.66 },
        title:    { size: 0.0440, font: 'display', lineHeight: 1.16 },
        subtitle: { size: 0.0180, font: 'displayItalic', lineHeight: 1.32, opacity: 0.88 },
        rule:     { w: 0.080, thickness: 0.0011, opacity: 0.40 },
        gaps:     { kicker: 0.024, rule: 0.020, subtitle: 0.022 },
      },
      /* A small centred image. `w` is a fraction of page width; the height keeps
         the artwork's aspect. fy places it from the head when the owning type
         does not position it. Ink z-clearance is handled by the deform lift. */
      logo: { w: 0.150 },
    },
  };

  const merge = (base, over) => {
    if (!over) return base;
    const out = Array.isArray(base) ? base.slice() : { ...base };
    for (const [k, v] of Object.entries(over)) {
      out[k] = v && typeof v === 'object' && !Array.isArray(v) ? merge(base[k] || {}, v) : v;
    }
    return out;
  };

  /* --------------------------------------------------------------- factory */
  function create(THREE, troika, ctx) {
    const { D, fonts, printColor, envMap, quality } = ctx;
    const L = merge(DEFAULTS, ctx.layout);

    /* Typesetting is tracked per block and never allowed to block the load
       forever: a font that fails to parse should cost one missing line, not the
       whole book. `BK.text.diag` names anything still outstanding. */
    const pending = new Set();
    const diag = (BK.text && BK.text.diag) || (BK.textDiag = { outstanding: [], done: [] });
    function track(label, promise) {
      const entry = { label, t0: performance.now() };
      diag.outstanding.push(entry);
      const tracked = Promise.resolve(promise).finally(() => {
        entry.ms = Math.round(performance.now() - entry.t0);
        diag.done.push(entry);
        if (diag.done.length > 100) diag.done.shift();
        const i = diag.outstanding.indexOf(entry);
        if (i >= 0) diag.outstanding.splice(i, 1);
        pending.delete(tracked);
      });
      pending.add(tracked);
      return tracked;
    }

    const SDF = (quality && quality.sdfGlyphSize) || 64;
    /* Ink sits in front of the surface it is printed on. -6 clears the cover
       decal's -2 with room to spare at grazing angles. */
    const PRINT_DEPTH_OFFSET = -6;
    /* Two different inks. Case printing has to stay legible against whatever the
       cover art happens to be, so it flips light on a dark case (`printColor`).
       Page printing never flips: the paper is cream no matter what the case is
       bound in, so page ink is always dark. Sharing one colour between them made
       a black-covered book print cream text on cream paper. */
    const PAGE_INK = (ctx.pageInk !== undefined) ? ctx.pageInk : 0x2a2620;
    /* ?inkDebug=1 draws page ink unlit, red and with the depth test off, which
       shows exactly where the deform is putting glyphs when they go missing. */
    const INK_DEBUG = (ctx.debugInk !== undefined) ? !!ctx.debugInk : false;
    const NO_DEFORM = !!ctx.noDeform;
    /* Page ink carries no depth bias at all: the shader puts it geometrically
       in front of the paper, so behaviour no longer varies by GPU. */
    const PAGE_DEPTH_OFFSET = 0;

    /* One material per surface, shared by every string on it, so a whole cover
       is a handful of draw calls rather than one per line. */
    /* Note: do NOT set polygonOffset here. troika overwrites polygonOffset,
       polygonOffsetFactor and polygonOffsetUnits on the derived material from
       its own `depthOffset` property on every sync, so the only offset that
       survives is the one set through PRINT_DEPTH_OFFSET below. The cover
       decal it sits on carries -2, so the printing has to beat that or the
       board paints straight over it. */
    /* The same ink reads differently depending on which case face it sits on.
       The front cover faces up into the key light, so the title there renders
       bright; the spine faces sideways (-X), away from that light, so the very
       same `printColor` used to render measurably dimmer and more yellow — the
       "eggshell / paper-coloured" spine the user reported. There is no colour
       divergence (both materials are byte-identical); the gap is pure
       orientation lighting. To make the spine read as the same ink as the cover
       title, the spine print gets a small self-illumination floor set to the ink
       colour. `printColor` stays the single source of truth for the ink on both
       faces; only the spine exposure is compensated. */
    const SPINE_EMISSIVE = 0.45;
    function printMaterial(emissiveIntensity = 0) {
      const m = new THREE.MeshStandardMaterial({
        color: printColor,
        roughness: 0.60, metalness: 0,
        envMap: envMap || null, envMapIntensity: 0.30,
        transparent: true, depthWrite: false,
      });
      if (emissiveIntensity > 0) {
        m.emissive = new THREE.Color(printColor);
        m.emissiveIntensity = emissiveIntensity;
      }
      return m;
    }
    const matCoverPrint = printMaterial(0);
    const matSpinePrint = printMaterial(SPINE_EMISSIVE);

    const fontURL = (role) => (fonts[role] || fonts.body || fonts.display).url;

    /* A single line or wrapped block. Returns the troika mesh; its measured
       height is available through `.geometry.boundingBox` once synced. */
    function makeText(spec, str, material, opts = {}) {
      const t = new troika.Text();
      t.text = spec.upper ? String(str).toUpperCase() : String(str);
      t.font = fontURL(spec.font);
      t.fontSize = spec.size * D.boardH;
      t.lineHeight = spec.lineHeight || 1.15;
      t.letterSpacing = spec.tracking || 0;
      t.sdfGlyphSize = SDF;
      t.material = material;
      t.color = opts.color !== undefined ? opts.color : printColor;
      t.fillOpacity = spec.opacity !== undefined ? spec.opacity : 1;
      t.anchorX = opts.anchorX || 'left';
      t.anchorY = opts.anchorY || 'top';
      if (opts.maxWidth) t.maxWidth = opts.maxWidth;
      t.curveRadius = 0;
      t.depthOffset = opts.depthOffset !== undefined ? opts.depthOffset : PRINT_DEPTH_OFFSET;
      t.castShadow = false;
      t.receiveShadow = false;
      t.frustumCulled = false;
      // Each mesh carries its own typesetting promise so later layout steps can
      // wait on exactly the block they depend on, not on the whole page.
      t.__synced = new Promise((res) => t.sync(res));
      track(opts.label || spec.font || 'text', t.__synced);
      return t;
    }

    /* Height of a synced block, for flowing the next element under it. troika's
       blockBounds is the laid-out line box, which is what leading should follow;
       the geometry bounding box is only the ink and would creep upward. */
    const blockHeight = (t) => {
      const info = t.textRenderInfo;
      if (info && info.blockBounds) return Math.abs(info.blockBounds[3] - info.blockBounds[1]);
      const b = t.geometry && t.geometry.boundingBox;
      return b ? Math.abs(b.max.y - b.min.y) : t.fontSize * t.lineHeight;
    };

    /* ------------------------------------------------------------ the cover
       Added as a child of the front decal plane, so it inherits the board's
       transform for free and follows the cover as it opens. Plane-local axes:
       x right, y up, z out of the printed face. */
    function buildCover(plane, content) {
      const g = new THREE.Group();
      g.name = 'coverPrint';
      const pw = plane.geometry.parameters.width;
      const ph = plane.geometry.parameters.height;
      const LIFT = 0.012;
      const X = (fx) => -pw / 2 + fx * pw;
      const Y = (fy) => ph / 2 - fy * ph;
      const c = L.cover;
      const measure = c.w * pw;
      const x0 = X(c.x);

      const add = (t, y) => { t.position.set(x0, y, LIFT); g.add(t); return t; };

      if (content.eyebrow) add(makeText(c.eyebrow, content.eyebrow, matCoverPrint), Y(c.eyebrow.fy));

      let flow = Y(c.title.fy);
      let title = null;
      if (content.title) {
        title = add(makeText(c.title, content.title, matCoverPrint, { maxWidth: measure }), flow);
      }

      /* The rule and the subtitle flow under the title, so a one-line title and
         a three-line title both look deliberate. */
      track('cover:flow', (title ? title.__synced : Promise.resolve()).then(async () => {
        if (!title) return;
        let y = title.position.y - blockHeight(title) - c.rule.gap * ph;
        if (c.rule.w > 0) {
          const rule = new THREE.Mesh(
            new THREE.PlaneGeometry(c.rule.w * pw, c.rule.thickness * ph),
            new THREE.MeshStandardMaterial({
              color: printColor, roughness: 0.6, metalness: 0,
              transparent: true, opacity: c.rule.opacity, depthWrite: false,
              polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
            }),
          );
          rule.position.set(x0 + c.rule.w * pw / 2, y, LIFT);
          rule.castShadow = false;
          g.add(rule);
        }
        y -= c.subtitle.gap * ph;
        if (content.subtitle) {
          const s = makeText(c.subtitle, content.subtitle, matCoverPrint, { maxWidth: measure });
          s.position.set(x0, y, LIFT);
          g.add(s);
          await s.__synced;
        }
      }));

      if (content.author) add(makeText(c.author, content.author, matCoverPrint), Y(c.author.fy));
      if (content.edition) add(makeText(c.edition, content.edition, matCoverPrint), Y(c.edition.fy));

      plane.add(g);
      return g;
    }

    /* ------------------------------------------------------------ the spine
       The backstrip is a rounded arc rebuilt every frame, so the printing is a
       group re-seated each frame on the arc's apex. Across the glyph height the
       arc falls away by about 0.2 mm, far less than the decal lift, so flat
       quads sit on it cleanly with no cylindrical warp needed. */
    function buildSpine(parent, content) {
      const g = new THREE.Group();
      g.name = 'spinePrint';
      g.matrixAutoUpdate = false;
      const s = L.spine;
      const zh = D.boardH / 2;
      const Z = (fy) => zh - fy * D.boardH;   // head at +z

      const place = (t, fy, across) => {
        // Inside the group: x runs along the spine's length, y across its width.
        t.position.set(Z(fy), (across || 0) * D.bookH, 0);
        g.add(t);
        return t;
      };

      if (content.title)
        place(makeText(s.title, content.title, matSpinePrint,
          { anchorX: 'center', anchorY: 'middle' }), s.title.fy, s.title.across);
      if (content.author)
        place(makeText(s.author, content.author, matSpinePrint,
          { anchorX: 'center', anchorY: 'middle' }), s.author.fy, s.author.across);
      if (content.mark)
        place(makeText(s.mark, content.mark, matSpinePrint,
          { anchorX: 'center', anchorY: 'middle' }), s.mark.fy, s.mark.across);

      parent.add(g);
      return g;
    }

    /* Re-seat the spine group from the live arc. `frame` is the apex position
       and its outward normal, in book space. */
    const _m = new THREE.Matrix4();
    const _out = new THREE.Vector3();
    const _len = new THREE.Vector3();
    const _up = new THREE.Vector3();
    function seatSpine(g, frame, readDown) {
      if (!g) return;
      _out.set(frame.nx, frame.ny, 0).normalize();            // out of the spine
      _len.set(0, 0, readDown ? 1 : -1);                      // along the title
      _up.crossVectors(_out, _len).normalize();               // across the back
      _m.makeBasis(_len, _up, _out);
      _m.setPosition(frame.x, frame.y, frame.z || 0);
      g.matrix.copy(_m);
      g.matrixWorldNeedsUpdate = true;
    }

    /* ======================================================== page printing
       Ink on a page is the same glyph geometry as the cover, but its vertices
       are placed by sampling the leaf's own deformed centre surface. The leaf
       already computes that surface on the CPU every frame — it has to, to build
       its own mesh — so the printing costs one small float texture per leaf and
       a grid lookup per glyph vertex.

       Because the surface is the single source of truth, a page lying flat and a
       page mid-turn are the same code path. There is no static/moving mode, no
       bake, and nothing to cross-fade: the text simply is where the paper is. */

    const GRID_DEFS = `
      uniform sampler2D uPagePos;
      uniform sampler2D uPageNrm;
      uniform vec2 uPageGrid;    // (nu+1, nv+1)
      uniform vec4 uPageRect;    // x0, y0, width, height of the page in text space
      uniform vec2 uPageOrigin;  // where this block sits on the page
      uniform float uPageMirror; // 1.0 when the sheet is read from its far side
      uniform float uPageHalf;   // half a paper thickness
      uniform float uPageShell;  // +1 on shell 0 (pos + nrm*h), -1 on shell 1
      uniform float uPageLift;   // how far the ink floats off its own sheet

      /* The ink has to lie on the *paper*, not near it. The leaf tessellates
         every grid cell into two triangles, [a,b,c] and [a,c,d] with the diagonal
         running a->c, and the GPU interpolates each linearly. A bilinear sample
         of the same corners is a different surface inside the cell, and with rows
         0.58 units apart that difference dwarfed a 40 µm lift — which is why the
         paper used to swallow the text at some angles.

         So reconstruct the surface exactly: build the shell position at each of
         the four corners, then interpolate across the same triangle the GPU would
         have used. The ink then sits a true uPageLift off the paper and nothing
         else, so the lift can be far smaller than the gap between two leaves. */
      struct BkSurface { vec3 p; vec3 n; };

      BkSurface bkPageSurface(vec2 g) {
        vec2 inv = 1.0 / uPageGrid;
        vec2 t = g * (uPageGrid - 1.0);
        vec2 f = fract(t);
        vec2 c = (floor(t) + 0.5) * inv;

        vec3 pa = texture2D(uPagePos, c).xyz;
        vec3 pb = texture2D(uPagePos, c + vec2(inv.x, 0.0)).xyz;
        vec3 pc = texture2D(uPagePos, c + inv).xyz;
        vec3 pd = texture2D(uPagePos, c + vec2(0.0, inv.y)).xyz;
        vec3 na = texture2D(uPageNrm, c).xyz;
        vec3 nb = texture2D(uPageNrm, c + vec2(inv.x, 0.0)).xyz;
        vec3 nc = texture2D(uPageNrm, c + inv).xyz;
        vec3 nd = texture2D(uPageNrm, c + vec2(0.0, inv.y)).xyz;

        float s = uPageShell * uPageHalf;
        vec3 sa = pa + na * s, sb = pb + nb * s;
        vec3 sc = pc + nc * s, sd = pd + nd * s;

        BkSurface o;
        if (f.y <= f.x) {              // triangle a, b, c
          o.p = sa + (sb - sa) * (f.x - f.y) + (sc - sa) * f.y;
          o.n = na + (nb - na) * (f.x - f.y) + (nc - na) * f.y;
        } else {                       // triangle a, c, d
          o.p = sa + (sc - sa) * f.x + (sd - sa) * (f.y - f.x);
          o.n = na + (nc - na) * f.x + (nd - na) * (f.y - f.x);
        }
        o.n = normalize(o.n) * uPageShell;   // outward from this sheet's face
        return o;
      }
      /* Page space -> grid space. u runs root (bound edge) to fore-edge, and the
         grid's j index counts from the head, so v is flipped on the way in.
         Mirroring u for the far-side sheet flips the mapping once; viewing that
         sheet from behind flips it again, so the glyphs read correctly. */
      vec2 bkPageGrid(vec3 p) {
        /* The block's position on the page is a uniform rather than a mesh
           transform: this shader already returns a final position in the leaf's
           own space, so a mesh translation on top of it would be applied twice. */
        float u = (p.x + uPageOrigin.x - uPageRect.x) / uPageRect.z;
        float v = (p.y + uPageOrigin.y - uPageRect.y) / uPageRect.w;
        u = mix(u, 1.0 - u, uPageMirror);
        return vec2(clamp(u, 0.0, 1.0), clamp(1.0 - v, 0.0, 1.0));
      }
      vec3 bkPageNormal(vec3 p) {
        return bkPageSurface(bkPageGrid(p)).n;
      }
      vec3 bkPagePosition(vec3 p) {
        BkSurface s = bkPageSurface(bkPageGrid(p));
        return s.p + s.n * uPageLift;
      }
    `;

    /* One float texture pair per leaf, refreshed only when that leaf moves. */
    function pageSurface(leaf) {
      const nu = leaf.nu, nv = leaf.nv;
      const w = nu + 1, h = nv + 1;
      const n = w * h;
      const posData = new Float32Array(n * 4);
      const nrmData = new Float32Array(n * 4);
      const mk = (data) => {
        const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.FloatType);
        t.minFilter = t.magFilter = THREE.NearestFilter;   // bilinear is done in GLSL
        t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
        t.generateMipmaps = false;
        t.needsUpdate = true;
        return t;
      };
      const posTex = mk(posData), nrmTex = mk(nrmData);
      function refresh() {
        const p = leaf.pos, q = leaf.nrm;
        for (let k = 0, s = 0, d = 0; k < n; k++, s += 3, d += 4) {
          posData[d] = p[s]; posData[d + 1] = p[s + 1]; posData[d + 2] = p[s + 2];
          nrmData[d] = q[s]; nrmData[d + 1] = q[s + 1]; nrmData[d + 2] = q[s + 2];
        }
        posTex.needsUpdate = true;
        nrmTex.needsUpdate = true;
      }
      refresh();
      return { posTex, nrmTex, grid: new THREE.Vector2(w, h), refresh };
    }

    /* The same surface shape for a page that is not a leaf: the block cap
       (page 11). The cap mesh is a flat grid that still follows the block's
       cover-driven relax deformation (05-app.js updatePage11), so the texture
       starts flat and offers deform(): given the same per-u displacement the
       mesh just received, the ink keeps riding exactly on the paper instead of
       sinking under it the moment the stack bulges. The layout mirrors how a
       leaf rests on the block: pos.x = x0 + W*u, pos.z = (j/nv - 0.5)*H (row 0
       at the head, z = -H/2), outward normal +y. */
    function flatSurface(W, H, x0, y0, nu = 1, nv = 1) {
      const w = nu + 1, h = nv + 1;
      const posData = new Float32Array(w * h * 4);
      const nrmData = new Float32Array(w * h * 4);
      const mk = (data) => {
        const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.FloatType);
        t.minFilter = t.magFilter = THREE.NearestFilter;   // bilinear is done in GLSL
        t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
        t.generateMipmaps = false;
        t.needsUpdate = true;
        return t;
      };
      const posTex = mk(posData), nrmTex = mk(nrmData);
      function deform(fn) {
        for (let j = 0; j < h; j++) {
          for (let i = 0; i < w; i++) {
            const k = (j * w + i) * 4;
            const d = fn ? fn(i / nu) : null;
            posData[k] = x0 + W * (i / nu) + (d ? d.dx : 0);
            posData[k + 1] = y0 + (d ? d.dy : 0);
            posData[k + 2] = ((j / nv) - 0.5) * H;
            nrmData[k + 1] = 1;
          }
        }
        posTex.needsUpdate = true;
        nrmTex.needsUpdate = true;
      }
      deform(null);
      return { posTex, nrmTex, grid: new THREE.Vector2(w, h), deform, refresh() {} };
    }

    /* A material for one block of printing on one sheet. Blocks differ only in
       uniform values, so they all share a single compiled program; a material
       per block costs no extra draw call, since each block is its own mesh
       either way. */
    function pageMaterial(surface, rect, mirror, shell, halfThickness, lift) {
      const m = new THREE.MeshStandardMaterial({
        color: INK_DEBUG ? 0xff0000 : PAGE_INK, roughness: 0.74, metalness: 0,
        envMap: envMap || null, envMapIntensity: 0.10,
        transparent: true, depthWrite: false,
        depthTest: !INK_DEBUG,
      });
      if (INK_DEBUG) m.toneMapped = false;
      const u = {
        uPagePos:   { value: surface.posTex },
        uPageNrm:   { value: surface.nrmTex },
        uPageGrid:  { value: surface.grid },
        uPageRect:  { value: new THREE.Vector4(rect.x, rect.y, rect.w, rect.h) },
        uPageOrigin:{ value: new THREE.Vector2(0, 0) },
        uPageMirror:{ value: mirror ? 1 : 0 },
        uPageHalf:  { value: halfThickness },
        uPageShell: { value: shell === 1 ? -1 : 1 },
        uPageLift:  { value: lift },
      };
      m.userData.pageUniforms = u;
      m.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, u);
        if (NO_DEFORM) return;   // ?noDeform=1 leaves glyphs in text-local space
        shader.vertexShader = GRID_DEFS + shader.vertexShader
          .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = bkPageNormal(position);')
          .replace('#include <begin_vertex>', 'vec3 transformed = bkPagePosition(position);');
      };
      m.customProgramCacheKey = () => 'bk-page-deform';
      return m;
    }

    /* Lay out one printed page. Returns the group (a child of the leaf mesh) and
       resolves once every block has been typeset and flowed.

       `content.type` dispatches the arrangement:
         chapter   (default) kicker + title + rule + flowing paragraphs
         title     centred title page (title, subtitle, rule, author, imprint, logo)
         copyright small imprint lines, flush to the foot (or centre) of the block
         toc       a heading plus one line per {title,page} entry, number at the fore
         section   centred divider (optional kicker, large line, optional subtitle)
         blank     intentionally empty (folio/running head still print)
       Every string — whatever the type — is a troika mesh whose vertices are
       placed by the same surface-sampling shader, so a centred divider and a
       dense paragraph deform identically with the leaf. New types add only
       arrangement, never new materials. */
    function buildPage(leafMesh, surface, opts) {
      const { W, H, content, mirror, pageNumber, runningHead } = opts;
      /* Per-page layout overrides: a page's `layout` deep-merges over the book's
         global page layout for this page only, so a sparse title page and a
         dense chapter page coexist in one book. */
      const P = (content && content.layout) ? merge(L.page, content.layout) : L.page;
      /* With the mapping mirrored, page-space x = 0 is the fore-edge and x = W is
         the bound edge, so the wider gutter margin swaps sides with it. */
      const gutterRight = opts.gutterRight !== undefined ? opts.gutterRight : !!mirror;
      const g = new THREE.Group();
      g.name = 'pagePrint';
      // The text lives in page space: x from the bound edge to the fore-edge,
      // y from the tail up to the head. The shader turns that into 3D.
      const rect = { x: 0, y: 0, w: W, h: H };
      /* The sheet this page prints on: shell 0 is pos + nrm*h and carries the
         odd page, shell 1 is pos - nrm*h and carries the even one, matching
         mapLeafShellToAtlas. The shader reconstructs that shell exactly, so the
         only free number left is how far the ink floats off the paper.

         That lift must be SMALLER than the gap between two leaves (a paper
         thickness, 0.0125), or the ink of the sheet underneath pokes up through
         the sheet on top of it — which is what appeared the instant a page was
         grabbed and the leaf below came into play. */
      const mats = [];
      const newMat = () => {
        const m = pageMaterial(surface, rect, mirror, opts.shell,
          opts.halfThickness, opts.inkLift);
        mats.push(m); return m;
      };
      /* Blocks never carry a mesh transform; their place on the page lives in
         uPageOrigin so the deform is applied exactly once. */
      const seat = (obj, x, y) => {
        obj.position.set(0, 0, 0);
        obj.material.userData.pageUniforms.uPageOrigin.value.set(x, y);
      };

      const gut = P.gutter * W, fore = P.fore * W;
      // The bound edge is page-space x = 0 for both sheets. Which screen side
      // that lands on flips with `mirror`, so the wider gutter margin follows.
      const xLeft = gutterRight ? fore : gut;
      const measure = W - gut - fore;
      const yTop = H - P.top * H;
      const yBot = H - P.bottom * H;

      /* Page ink takes NO depth bias at all. It is lifted off its own sheet
         geometrically, and sheets are one paper thickness apart, so any polygon
         offset lets buried leaves punch through the pages above them — which is
         exactly what happened, and it behaved differently on a software
         rasteriser than on a real GPU, masking the bug. */
      const mkPage = (spec, str, o = {}) =>
        makeText(spec, str, newMat(),
          { maxWidth: measure, label: 'page' + pageNumber, depthOffset: PAGE_DEPTH_OFFSET,
            color: PAGE_INK, ...o });

      /* ---- shared placement helpers ---------------------------------------
         Everything is seated through uPageOrigin (never a mesh transform), so
         the deform shader is applied exactly once. `align` comes from the spec
         unless overridden, and can be 'left' | 'center' | 'right'. */
      const cxBlock = xLeft + measure / 2;              // text-block centre
      const alignX = (a) => (a === 'center' ? cxBlock : a === 'right' ? xLeft + measure : xLeft);
      const anchorFor = (a) => (a === 'center' || a === 'right' ? a : 'left');
      const pageAlign = P.align || 'left';

      const addText = (spec, str, o = {}) => {
        const a = o.align || spec.align || pageAlign;
        const t = mkPage(spec, str, { ...o, anchorX: anchorFor(a), maxWidth: o.maxWidth !== undefined ? o.maxWidth : measure });
        seat(t, o.x !== undefined ? o.x : alignX(a), o.y !== undefined ? o.y : yTop);
        g.add(t);
        return t;
      };
      /* A horizontal rule, in page space so it bends with the sheet. */
      const addRule = (wFrac, thicknessFrac, opacity, x, y) => {
        const w = wFrac * W, th = thicknessFrac * H;
        const rule = new THREE.Mesh(new THREE.PlaneGeometry(w, th, 10, 1), newMat());
        rule.material.opacity = opacity;
        rule.geometry.translate(w / 2, 0, 0);
        seat(rule, x, y);
        rule.castShadow = false;
        rule.frustumCulled = false;
        g.add(rule);
        return rule;
      };

      const type = (content.type || 'chapter').toLowerCase();
      const meta = (window.BOOK_CONTENT && window.BOOK_CONTENT.meta) || {};
      const blocks = [];        // chapter flow blocks (kept for the classic path)
      const flow = [];          // generic vertically-flowed items for new types
      const H1 = H;             // alias for readability in gap math

      /* ---------------- chapter (default, backward compatible) ------------ */
      if (type === 'chapter') {
        if (content.kicker) blocks.push({ t: mkPage(P.kicker, content.kicker), gap: P.titleGap * H });
        if (content.title)  blocks.push({ t: mkPage(P.title, content.title), rule: true });
        for (const para of (content.paragraphs || []))
          blocks.push({ t: mkPage(P.body, para), gap: P.body.paraGap * H, body: true });
        for (const b of blocks) { seat(b.t, xLeft, yTop); g.add(b.t); }
      }

      /* ---------------- title page ---------------------------------------- */
      else if (type === 'title') {
        const T = P.titlePage;
        // Collect what exists, measure it, then centre the whole stack about
        // centerFy so a short page and a tall page both read as deliberate.
        const items = [];
        if (content.logo)  items.push({ kind: 'logo', h: 0 });            // height set after load
        if (content.title) items.push({ kind: 'text', spec: T.title, str: content.title });
        if (content.subtitle) items.push({ kind: 'text', spec: T.subtitle, str: content.subtitle });
        items.push({ kind: 'rule', spec: T.rule });
        if (content.author)  items.push({ kind: 'text', spec: T.author, str: content.author });
        if (content.imprint) items.push({ kind: 'text', spec: T.imprint, str: content.imprint });
        flow.push({ titleStack: items, spec: T });
      }

      /* ---------------- copyright / imprint ------------------------------- */
      else if (type === 'copyright') {
        const C = P.copyright;
        const lines = content.lines || content.paragraphs || [];
        for (let i = 0; i < lines.length; i++) {
          flow.push({ spec: { size: C.size, font: C.font, lineHeight: C.lineHeight, opacity: C.opacity, align: C.align || 'left' },
            str: lines[i], gap: (i < lines.length - 1 ? C.paraGap : 0) * H1, kind: 'copy' });
        }
        flow.vAlign = C.vAlign || 'bottom';
      }

      /* ---------------- table of contents --------------------------------- */
      else if (type === 'toc') {
        const T = P.toc;
        if (content.title) flow.push({ spec: T.heading, str: content.title, gap: T.headGap * H1, kind: 'tocHead', align: T.heading.align || pageAlign });
        for (const e of (content.toc || [])) {
          flow.push({ kind: 'tocEntry', entry: e, spec: T.entry, num: T.num, gap: T.entryGap * H1 });
        }
      }

      /* ---------------- section divider ----------------------------------- */
      else if (type === 'section') {
        const S = P.section;
        const items = [];
        if (content.kicker)   items.push({ kind: 'text', spec: S.kicker, str: content.kicker });
        if (content.title)    items.push({ kind: 'text', spec: S.title, str: content.title });
        items.push({ kind: 'rule', spec: S.rule });
        if (content.subtitle) items.push({ kind: 'text', spec: S.subtitle, str: content.subtitle });
        flow.push({ sectionStack: items, spec: S });
      }

      /* ---------------- blank ---------------------------------------------- */
      else if (type === 'blank') {
        // nothing but the folio/running head below
      }

      /* ---------------- folio + running head (all types) ------------------
         Display pages (title, section, blank) suppress the folio and running
         head by default, as a real book does; set folio:true / runHead:true to
         force them back on. Chapter, copyright and toc keep them. */
      const showFolio = content.folio !== undefined ? content.folio !== false
        : !(type === 'title' || type === 'section' || type === 'blank');
      const showRunHead = content.runHead !== undefined ? content.runHead !== false
        : !(type === 'title' || type === 'section' || type === 'blank');
      if (pageNumber !== undefined && showFolio) {
        const f = mkPage(P.folio, String(pageNumber).padStart(2, '0'),
          { anchorX: gutterRight ? 'left' : 'right', maxWidth: 0 });
        seat(f, gutterRight ? fore : W - fore, yBot);
        g.add(f);
      }
      if (runningHead && showRunHead) {
        const r = mkPage(P.runHead, runningHead, { anchorX: 'center', maxWidth: 0 });
        seat(r, W / 2, yBot);
        g.add(r);
      }

      /* A small centred logo. The image is a MeshStandardMaterial textured
         plane, seated through uPageOrigin like the text, so it is sampled by
         the same deform grid and lifts with the paper. It is given its own
         material and a touch more lift than the glyph ink so it never z-fights
         the SDF glyphs that share the leaf. */
      let logoMesh = null;
      if (content.logo && opts.logoTexture) {
        const lw = (P.logo && P.logo.w ? P.logo.w : 0.15) * W;
        const img = opts.logoTexture.image;
        const aspect = img && img.width ? img.height / img.width : 1;
        const lh = lw * aspect;
        const lg = new THREE.PlaneGeometry(lw, lh, 8, 8);
        /* Page space runs y-up-from-tail, texture v runs down-from-top, so the
           plane would show the artwork upside down. Flip v to right it. */
        {
          const uv = lg.attributes.uv;
          for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
          uv.needsUpdate = true;
        }
        const lm = pageMaterial(surface, rect, mirror, opts.shell, opts.halfThickness,
          (opts.inkLift || 0.0025) + 0.0012);   // logo sits just above the glyph ink
        lm.map = opts.logoTexture;
        lm.color = new THREE.Color(0xffffff);
        lm.transparent = true;
        lm.depthWrite = false;
        lm.roughness = 0.82; lm.metalness = 0;
        mats.push(lm);
        logoMesh = new THREE.Mesh(lg, lm);
        logoMesh.castShadow = false; logoMesh.receiveShadow = false;
        logoMesh.frustumCulled = false;
        // Hidden until a stacked type (title/section) seats it; a bare "logo"
        // on any other type is placed generically below.
        logoMesh.visible = false;
        // Geometry is centred on its own origin, so uPageOrigin is the logo's
        // centre — matching the anchorX/anchorY 'center' used for the text.
        logoMesh.userData.h = lh;
        logoMesh.userData.w = lw;
        g.add(logoMesh);
      }

      leafMesh.add(g);

      /* ---------------- flow ----------------------------------------------
         Chapter keeps its original left-to-right column flow. The centred and
         stacked types measure their blocks first, then seat each item. */
      track('page' + pageNumber + ':flow', (async () => {
        /* A logo on a non-stacked type (chapter, toc, copyright, blank) is not
           part of any measured stack, so seat it generically: centred on the
           text block at page.logo.fy (fraction of page height from the head). */
        if (logoMesh && !flow.find((f) => f.titleStack || f.sectionStack)) {
          const fy = (P.logo && P.logo.fy !== undefined) ? P.logo.fy : 0.30;
          seat(logoMesh, cxBlock, H - fy * H);
          logoMesh.visible = true;
        }
        if (type === 'chapter') {
          await Promise.all(blocks.map((b) => b.t.__synced));
          let y = yTop;
          for (const b of blocks) {
            b.t.material.userData.pageUniforms.uPageOrigin.value.set(xLeft, y);
            y -= blockHeight(b.t);
            if (b.rule) {
              y -= P.rule.gap * H;
              addRule(P.rule.w, P.rule.thickness, P.rule.opacity, xLeft, y);
              y -= P.bodyGap * H;
            } else {
              y -= b.gap || 0;
            }
            if (y < yBot) {
              b.t.visible = false;
              if (!b.t.__overflowNoted) {
                b.t.__overflowNoted = true;
                console.warn(
                  `[book3d] page ${pageNumber}: content overflows the text block; ` +
                  `a trailing ${b.body ? 'paragraph' : 'block'} was dropped. ` +
                  `Shorten it, or lower page.body.size / tighten page.body.lineHeight in book.json.`
                );
              }
            }
          }
          return;
        }

        /* ---- stacked centred types: title & section ----
           Build every text block, measure it, then seat the whole stack so its
           vertical centre lands on centerFy (a fraction of page height from the
           head). anchorY 'middle' + anchorX 'center' means a single uniform set
           positions each block; the stack math works in centre coordinates. */
        const stack = flow.find((f) => f.titleStack || f.sectionStack);
        if (stack) {
          const isTitle = !!stack.titleStack;
          const S = stack.spec;
          const items = (isTitle ? stack.titleStack : stack.sectionStack).filter((it) =>
            it.kind !== 'rule' || (isTitle ? (content.title || content.subtitle) : content.title));
          const built = [];
          for (const it of items) {
            if (it.kind === 'text') {
              const t = mkPage(it.spec, it.str, { anchorX: 'center', anchorY: 'middle', maxWidth: measure });
              g.add(t);
              built.push({ it, t, h: 0 });
            } else if (it.kind === 'rule') {
              built.push({ it, t: null, h: 0 });
            } else if (it.kind === 'logo') {
              built.push({ it, t: null, h: logoMesh ? logoMesh.userData.h : 0 });
            }
          }
          await Promise.all(built.filter((b) => b.t).map((b) => b.t.__synced));
          for (const b of built) if (b.t) b.h = blockHeight(b.t);
          /* Gap after item i (before item i+1). */
          const gapAfter = (b, next) => {
            if (!next) return 0;
            const gmap = S.gaps;
            if (isTitle) {
              if (b.it.kind === 'logo') return gmap.logo * H1;
              if (next.it.kind === 'rule') return gmap.rule * H1;
              if (next.it.spec === S.subtitle) return gmap.subtitle * H1;
              if (next.it.spec === S.author) return gmap.author * H1;
              if (next.it.spec === S.imprint) return gmap.imprint * H1;
              return gmap.rule * H1;
            }
            if (b.it.kind === 'text' && b.it.spec === S.kicker) return gmap.kicker * H1;
            if (next.it.kind === 'rule') return gmap.rule * H1;
            if (next.it.kind === 'text' && next.it.spec === S.subtitle) return gmap.subtitle * H1;
            return gmap.rule * H1;
          };
          let total = 0;
          for (let i = 0; i < built.length; i++) total += built[i].h + gapAfter(built[i], built[i + 1]);
          // page-space y of the stack centre, measured up from the tail.
          const target = H - S.centerFy * H;
          let yC = target + total / 2;   // centre of the first item
          for (let i = 0; i < built.length; i++) {
            const b = built[i];
            if (b.it.kind === 'logo' && logoMesh) {
              seat(logoMesh, cxBlock, yC);
              logoMesh.visible = true;
            } else if (b.t) {
              b.t.material.userData.pageUniforms.uPageOrigin.value.set(cxBlock, yC);
            } else if (b.it.kind === 'rule') {
              addRule(b.it.spec.w, b.it.spec.thickness, b.it.spec.opacity, cxBlock - b.it.spec.w * W / 2, yC);
            }
            yC -= b.h / 2 + gapAfter(b, built[i + 1]) + (built[i + 1] ? built[i + 1].h / 2 : 0);
          }
          return;
        }

        /* ---- copyright: bottom (or centre) aligned lines ----
           anchorY 'top' means the uniform y is the top of the block; the stack
           grows downward from a computed start so the last line sits at yBot. */
        if (type === 'copyright') {
          const C = P.copyright;
          const built = [];
          for (const f of flow) {
            if (f.kind !== 'copy') continue;
            const t = mkPage(f.spec, f.str, { anchorX: anchorFor(f.spec.align), anchorY: 'top', maxWidth: measure });
            g.add(t);
            built.push({ f, t, h: 0 });
          }
          await Promise.all(built.map((b) => b.t.__synced));
          for (const b of built) b.h = blockHeight(b.t);
          let total = 0;
          for (let i = 0; i < built.length; i++) total += built[i].h + (built[i].f.gap || 0);
          let y = (C.vAlign === 'center') ? (yTop + yBot) / 2 + total / 2 : yBot + total;
          for (const b of built) {
            const a = b.f.spec.align || 'left';
            b.t.material.userData.pageUniforms.uPageOrigin.value.set(alignX(a), y);
            y -= b.h + (b.f.gap || 0);
          }
          return;
        }

        /* ---- table of contents ---- */
        if (type === 'toc') {
          const T = P.toc;
          const built = [];
          for (const f of flow) {
            if (f.kind === 'tocHead') {
              const t = mkPage(f.spec, f.str, { anchorX: anchorFor(f.align), maxWidth: measure });
              g.add(t); built.push({ f, t, h: 0 });
            } else if (f.kind === 'tocEntry') {
              const titleT = mkPage(f.spec, f.entry.title, { anchorX: 'left', maxWidth: measure * 0.78 });
              g.add(titleT);
              let numT = null;
              if (f.entry.page !== undefined && f.entry.page !== null && f.entry.page !== '') {
                numT = mkPage(f.num, String(f.entry.page), { anchorX: 'right', maxWidth: 0 });
                g.add(numT);
              }
              built.push({ f, t: titleT, n: numT, h: 0 });
            }
          }
          await Promise.all(built.map((b) => Promise.all([b.t.__synced, b.n ? b.n.__synced : Promise.resolve()])));
          for (const b of built) b.h = blockHeight(b.t);
          let y = yTop;
          for (const b of built) {
            const x = (b.f.kind === 'tocHead') ? alignX(b.f.align) : xLeft;
            b.t.material.userData.pageUniforms.uPageOrigin.value.set(x, y);
            if (b.n) b.n.material.userData.pageUniforms.uPageOrigin.value.set(xLeft + measure, y);
            // dotted leader between title end and number
            if (b.n && T.leader) {
              const info = b.t.textRenderInfo;
              const titleW = info && info.blockBounds ? Math.abs(info.blockBounds[2] - info.blockBounds[0]) : measure * 0.5;
              const numInfo = b.n.textRenderInfo;
              const numW = numInfo && numInfo.blockBounds ? Math.abs(numInfo.blockBounds[2] - numInfo.blockBounds[0]) : 0;
              const startX = xLeft + titleW + T.inset * W;
              const endX = xLeft + measure - numW - T.inset * W;
              const leadW = endX - startX;
              if (leadW > W * 0.02) {
                const step = (T.dot + T.dotGap) * W;
                const count = Math.max(1, Math.floor(leadW / step));
                // Build a single strip of dot quads in one geometry.
                const geo = new THREE.BufferGeometry();
                const pos = [];
                const idx = [];
                const dw = T.dot * W, dh = T.thickness * H;
                for (let k = 0; k < count; k++) {
                  const bx = startX + k * step;
                  const base = k * 4;
                  pos.push(bx, 0, 0, bx + dw, 0, 0, bx + dw, -dh, 0, bx, -dh, 0);
                  idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
                }
                geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
                geo.setIndex(idx);
                const dots = new THREE.Mesh(geo, newMat());
                dots.material.opacity = T.opacity;
                dots.castShadow = false; dots.frustumCulled = false;
                // seat near the entry's baseline so the dots sit on the text line
                seat(dots, 0, y - b.h * 0.72);
                g.add(dots);
              }
            }
            y -= b.h + (b.f.gap || 0);
            if (y < yBot) {
              b.t.visible = false;
              if (b.n) b.n.visible = false;
              if (!b.t.__overflowNoted) {
                b.t.__overflowNoted = true;
                console.warn(`[book3d] page ${pageNumber}: toc overflows the text block; an entry was dropped.`);
              }
            }
          }
          return;
        }
      })());

      return { group: g, materials: mats };
    }

    return {
      buildCover, buildSpine, seatSpine, buildPage, pageSurface, flatSurface,
      materials: { cover: matCoverPrint, spine: matSpinePrint },
      layout: L,
      diag,
      ready: (timeoutMs = 9000) => Promise.race([
        (async () => { for (let i = 0; i < 4 && pending.size; i++) await Promise.all([...pending]); })(),
        new Promise((r) => setTimeout(() => {
          if (diag.outstanding.length) {
            console.warn('[text] typesetting still outstanding:',
              diag.outstanding.map((e) => e.label).join(', '));
          }
          r();
        }, timeoutMs)),
      ]),
      /* Swapping content re-typesets in place; the atlas is shared, so a new
         book costs only the glyphs it introduces. */
      retypeset(group, specs) {
        const jobs = [];
        group.traverse((o) => {
          if (o.isMesh && o.text !== undefined && specs[o.name]) {
            o.text = specs[o.name];
            jobs.push(new Promise((r) => o.sync(r)));
          }
        });
        return Promise.all(jobs);
      },
    };
  }

  return { create, DEFAULTS };
})();
