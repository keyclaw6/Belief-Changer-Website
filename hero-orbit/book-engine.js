/**
 * book-engine.js — Orbit hardcover factory (closed shelf + openable reader).
 *
 * Prerequisite (index.html must load before this module):
 *   <script src="./_extract/01-noise.js"></script>
 *   <script src="./_extract/02-geometry.js"></script>
 *   <script src="./_extract/03-pageturn.js"></script>
 * Assumes window.BK.geom and window.BK.page exist.
 *
 * ---------------------------------------------------------------------------
 * LOCAL AXES (gold table pose → orbit rest)
 * ---------------------------------------------------------------------------
 * Gold book (table): Y up; boards in XZ; thickness in Y; spine near X≈0;
 * page width +X; head→tail along ±Z; closed front cover faces +Y (up).
 *
 * Rest transform on the exported `group` (root): only Rx(+π/2).
 *   cover +Y → +Z, spine −X → −X, fore-edge +X → +X, head +Z → +Y.
 *
 * After rest, group-local axes:
 *
 *   −X  spine (→ ring center when edge-on)
 *   +X  fore-edge
 *   +Y  head
 *   +Z  front cover
 *
 * Ring placement: yaw around +Y so local −X (spine) points at the ring center
 * (edge-on). Presentation: quarter-turn about +Y so +Z faces the camera.
 *
 * Inner `book` content is shifted by BOOK_COM_OFFSET (gold cm) so `group`
 * origin ≈ closed-book volume center (orbit detailSpin rotates about the middle
 * of the book, not the spine joint).
 * ---------------------------------------------------------------------------
 */

const MAT_BASE = '../site/public/orbit-materials/';

/** centimetres — identical to gold D */
export const BOOK_DIMS = (() => {
  const D = {
    pageW: 14.6,
    pageH: 21.0,
    blockT: 2.40,
    boardT: 0.285,
    square: 0.33,
    spineBulge: 0.34,
    paper: 0.0125,
    sheets: 260,
  };
  D.grooveW = 0.55;
  D.boardW = D.pageW + D.square - D.grooveW;
  D.leafW = D.pageW - 0.16;
  D.boardH = D.pageH + 2 * D.square;
  D.bookH = 2 * D.boardT + D.blockT;
  D.yBot = D.boardT;
  D.yTop = D.yBot + D.blockT;
  D.jointX = 0.0;
  {
    const c = D.bookH;
    const s = 0.46;
    const R = (s * s + (c / 2) * (c / 2)) / (2 * s);
    D.spineR = R;
    D.spinePhi = 2 * Math.asin((c / 2) / R);
    D.spineArc = R * D.spinePhi;
  }
  return Object.freeze(D);
})();

/** Rest euler (XYZ). Applied with BOOK_REST_SCALE — identity scale. */
export const BOOK_REST_EULER = Object.freeze({ x: Math.PI / 2, y: 0, z: 0 });
export const BOOK_REST_SCALE = Object.freeze({ x: 1, y: 1, z: 1 });
/**
 * Gold-local shift so group origin = closed volume center.
 * Spine at X≈0, boards extend +X → center at boardW/2; thickness 0..bookH → bookH/2.
 */
export const BOOK_COM_OFFSET = Object.freeze({
  x: -BOOK_DIMS.boardW / 2,
  y: -BOOK_DIMS.bookH / 2,
  z: 0,
});

const BOOK_LOOK = {
  cover: { roughness: 0.78, normalScale: 0.115, normalRepeat: [1.55, 1.90] },
  paper: { color: 0xf7f1e5, roughness: 0.97, normalScale: 0.045 },
  stack: { color: 0xf7f1e5, roughness: 0.97 },
  endpaper: { color: 0xffffff, roughness: 0.95 },
  headband: { color: 0xffffff, roughness: 0.86 },
};

const COVER_OPEN = 2.38 + Math.PI / 12;
const SP_STEPS = 32;
const SP_ZSPANS = 6;
const SPINE_RAILS = 2 * (SP_ZSPANS + 1) + 2;
const PAGE_BUMP = 0.14;
const ART_BORDER_FRONT = 0.15;
const ART_BORDER_BACK = 0.52;
const NLEAF = 5;
const NU = 96;
const NV = 36;

/** Verbatim gold settle / pageEase */
export const settle = (x) => {
  if (x >= 1) return 1;
  const e = 1 - Math.pow(1 - x, 2.2);
  return Math.min(1, e - Math.exp(-7 * x) * Math.sin(11 * x) * 0.040 * (1 - x));
};
export const pageEase = (x) => x * x * x * (x * (x * 6 - 15) + 10);

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth01 = (x) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};

function requireBK() {
  const G = window.BK && window.BK.geom;
  if (!G) {
    throw new Error(
      'book-engine: window.BK.geom missing — load _extract/01-noise.js and 02-geometry.js first',
    );
  }
  return G;
}

function requirePage() {
  const PG = window.BK && window.BK.page;
  if (!PG) {
    throw new Error(
      'book-engine: window.BK.page missing — load _extract/03-pageturn.js first',
    );
  }
  return PG;
}

function inkForLuminance(lum, overlayInk) {
  if (overlayInk === 'bone') return '#F5F1E8';
  if (overlayInk === 'charcoal') return '#2F3437';
  return lum > 0.34 ? '#2F3437' : '#F5F1E8';
}

function wrapLines(ctx, text, maxWidth) {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/* ------------------------------------------------------------------ renderer */

export function configureRenderer(renderer, THREE) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  return renderer;
}

/* -------------------------------------------------------------------- lights */

function buildStudioEnv(THREE, renderer) {
  const s = new THREE.Scene();
  // Cooler / white-cyclorama friendly than gold's dark box
  s.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(300, 300, 300),
      new THREE.MeshBasicMaterial({ color: 0xe8eaee, side: THREE.BackSide }),
    ),
  );
  const panel = (w, h, x, y, z, rx, ry, i) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(i) }),
    );
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    s.add(m);
  };
  panel(200, 200, 0, 140, 0, Math.PI / 2, 0, 1.35);
  panel(160, 110, -90, 70, 40, 0, Math.PI * 0.42, 1.85);
  panel(140, 90, 95, 50, -30, 0, -Math.PI * 0.55, 0.95);
  panel(180, 100, 0, 40, 120, 0, Math.PI, 1.15);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(s, 0.04);
  pm.dispose();
  return rt.texture;
}

/**
 * Gold key/fill/rim/hemi intensities and relative offsets; aim at orbit center.
 * @param {object} THREE
 * @param {THREE.Scene} scene
 * @param {THREE.Vector3} aimPoint
 * @param {THREE.WebGLRenderer} [renderer] required for PMREM env
 */
export function createStudioLights(THREE, scene, aimPoint, renderer) {
  const AIM = aimPoint.clone ? aimPoint.clone() : new THREE.Vector3().copy(aimPoint);
  const KEYDIR = new THREE.Vector3(-34, 46, 30).normalize();

  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -26,
    right: 26,
    top: 26,
    bottom: -26,
    near: 5,
    far: 180,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.012;
  sun.shadow.radius = 1.0;
  sun.position.copy(AIM).addScaledVector(KEYDIR, 80);
  sun.target.position.copy(AIM);
  scene.add(sun, sun.target);

  const fill = new THREE.DirectionalLight(0xffffff, 0.82);
  fill.position.copy(AIM).add(new THREE.Vector3(57, 28.8, 40));
  fill.target.position.copy(AIM);

  const rim = new THREE.DirectionalLight(0xffffff, 0.52);
  rim.position.copy(AIM).add(new THREE.Vector3(7, 32.8, -60));
  rim.target.position.copy(AIM);

  const amb = new THREE.HemisphereLight(0xffffff, 0x707070, 0.88);
  scene.add(fill, fill.target, rim, rim.target, amb);

  let envTex = null;
  if (renderer) {
    envTex = buildStudioEnv(THREE, renderer);
    scene.environment = envTex;
    scene.environmentIntensity = 0.68;
  }

  return { sun, fill, rim, hemi: amb, envTex, aim: AIM };
}

/* -------------------------------------------------------------- textures */

async function loadMap(THREE, loader, url, color, repeatX = 1, repeatY = 1, aniso = 4) {
  const tex = await loader.loadAsync(url);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = aniso;
  tex.needsUpdate = true;
  return tex;
}

function makePageEdgeTexture(THREE, scanTex, sheetCount, aniso = 4) {
  const W = 1024;
  const H = 512;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d', { alpha: false });
  if (scanTex && scanTex.image) {
    ctx.drawImage(scanTex.image, 0, 0, W, H);
  } else {
    ctx.fillStyle = '#f3eee1';
    ctx.fillRect(0, 0, W, H);
  }
  let seed = 0x5f3759df;
  const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  ctx.lineCap = 'butt';
  for (let i = 1; i < sheetCount; i++) {
    const x = (i / sheetCount) * W + (rnd() - 0.5) * 0.7;
    const signature = i % 8 === 0;
    const a = signature ? 0.105 + rnd() * 0.025 : 0.038 + rnd() * 0.03;
    ctx.strokeStyle = `rgba(92,82,67,${a})`;
    ctx.lineWidth = signature ? 1.15 : 0.52 + rnd() * 0.28;
    ctx.beginPath();
    const bow = (rnd() - 0.5) * 1.8;
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + bow, H * 0.5, x + bow * 0.25, H);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(248,244,235,0.10)';
  ctx.fillRect(0, 0, W, H);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = Math.min(aniso, 4);
  tex.needsUpdate = true;
  return tex;
}

function makePageBlockAtlas(THREE, paperTex, edgeTex, aniso = 4) {
  const S = 1024;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d', { alpha: false });
  ctx.drawImage(edgeTex.image, 0, 0, S, S / 2);
  if (paperTex && paperTex.image) ctx.drawImage(paperTex.image, 0, S / 2, S, S / 2);
  else {
    ctx.fillStyle = '#f7f1e5';
    ctx.fillRect(0, S / 2, S, S / 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = aniso;
  tex.needsUpdate = true;
  return tex;
}

export function fitCover(tex, planeAspect) {
  if (!tex || !tex.image) return tex;
  const imgAspect = tex.image.width / tex.image.height;
  if (imgAspect > planeAspect) {
    const r = planeAspect / imgAspect;
    tex.repeat.set(r, 1);
    tex.offset.set((1 - r) / 2, 0);
  } else {
    const r = imgAspect / planeAspect;
    tex.repeat.set(1, r);
    tex.offset.set(0, (1 - r) / 2);
  }
  tex.needsUpdate = true;
  return tex;
}

function bakeFrontTitle(THREE, { title, subtitle, author, ink, caseLum }) {
  const W = 768;
  const H = 1152;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const color = ink || inkForLuminance(caseLum ?? 0.5);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Upper negative space — site cover layout (title ~20% from top)
  ctx.font = '500 108px "DM Sans", system-ui, sans-serif';
  const lines = wrapLines(ctx, title || '', W * 0.82);
  let y = H * 0.2;
  for (const line of lines.slice(0, 3)) {
    ctx.fillText(line, W / 2, y);
    y += 112;
  }
  if (subtitle) {
    ctx.font = '400 30px "DM Sans", system-ui, sans-serif';
    ctx.globalAlpha = 0.88;
    y += 12;
    for (const line of wrapLines(ctx, subtitle, W * 0.72).slice(0, 2)) {
      ctx.fillText(line, W / 2, y);
      y += 38;
    }
    ctx.globalAlpha = 1;
  }
  if (author) {
    ctx.font = '500 22px "DM Sans", system-ui, sans-serif';
    ctx.globalAlpha = 0.8;
    ctx.fillText(String(author).toUpperCase(), W / 2, H * 0.86);
    ctx.globalAlpha = 1;
  }
  // Series mark at foot — letterspace manually
  ctx.font = '500 18px "DM Sans", system-ui, sans-serif';
  ctx.globalAlpha = 0.78;
  const mark = 'BELIEF CHANGER';
  const spaced = mark.split('').join(' ');
  ctx.fillText(spaced, W / 2, H * 0.93);
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function bakeSpineTitle(THREE, { title, ink, caseLum }) {
  const W = 256;
  const H = 1536;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const color = ink || inkForLuminance(caseLum ?? 0.5);
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 42px "DM Sans", system-ui, sans-serif';
  const short = String(title || '').replace(/^The\s+/i, '');
  ctx.fillText(short, 0, 0);
  ctx.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function makePageAtlas(THREE, pages, paperColor, paperOnly = false) {
  const COLS = 4;
  const ROWS = 3;
  // Gold high cell is 768×1104; bump past the old 384×552 placeholders and
  // scale with DPR (capped) so zoomed reader text stays crisp without troika.
  const DPR = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5);
  const PAGE_DESIGN_W = 768;
  const PAGE_DESIGN_H = 1104;
  const PAGE_SCALE = Math.max(0.85, Math.min(1, 0.92 * DPR));
  const CW = Math.round(PAGE_DESIGN_W * PAGE_SCALE);
  const CH = Math.round(PAGE_DESIGN_H * PAGE_SCALE);
  const PAD = Math.max(8, Math.round(14 * PAGE_SCALE));
  const c = document.createElement('canvas');
  c.width = CW * COLS;
  c.height = CH * ROWS;
  const ctx = c.getContext('2d', { alpha: false, desynchronized: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const serif = 'Newsreader, Georgia, "Times New Roman", serif';
  const sans = '"DM Sans", system-ui, sans-serif';

  for (let i = 0; i < 11; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const ox = col * CW;
    const oy = row * CH;
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(PAGE_SCALE, PAGE_SCALE);
    ctx.fillStyle = '#f7f1e5';
    ctx.fillRect(0, 0, PAGE_DESIGN_W, PAGE_DESIGN_H);
    if (paperColor && paperColor.image) {
      ctx.globalAlpha = 0.5;
      ctx.drawImage(paperColor.image, 0, 0, PAGE_DESIGN_W, PAGE_DESIGN_H);
      ctx.globalAlpha = 1;
    }
    // With the gold ink pipeline live the atlas carries paper only: drawing the
    // text here as well would double it (04-text prints the glyphs as geometry).
    if (paperOnly) {
      ctx.restore();
      continue;
    }
    const page = pages[i] || { title: `Page ${i + 1}`, paragraphs: [] };
    const right = i % 2 === 0;
    const inner = 100;
    const outer = 76;
    const x = right ? inner : outer;
    const maxW = PAGE_DESIGN_W - inner - outer;
    const top = 92;
    const bottom = PAGE_DESIGN_H - 80;

    ctx.fillStyle = '#2d2924';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `600 ${Math.round(37)}px ${serif}`;
    let y = top + 58;
    for (const line of wrapLines(ctx, page.title || '', maxW).slice(0, 3)) {
      ctx.fillText(line, x, y);
      y += 45;
    }
    y += 12;
    ctx.strokeStyle = 'rgba(83,72,58,.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 88, y);
    ctx.stroke();
    y += 40;

    ctx.font = `400 24px ${serif}`;
    ctx.fillStyle = '#36312b';
    const paras = page.paragraphs || [page.body || ''];
    for (const para of paras) {
      for (const line of wrapLines(ctx, para, maxW)) {
        if (y > bottom - 38) break;
        ctx.fillText(line, x, y);
        y += 34;
      }
      y += 18;
      if (y > bottom - 38) break;
    }

    ctx.font = `500 16px ${sans}`;
    ctx.fillStyle = 'rgba(45,41,36,.70)';
    ctx.textAlign = right ? 'right' : 'left';
    ctx.fillText(String(i + 1).padStart(2, '0'), right ? PAGE_DESIGN_W - outer : outer, bottom);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;

  function mapUV(index, u, v) {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    const pad = PAD / c.width;
    const padV = PAD / c.height;
    const u0 = (col * CW) / c.width + pad;
    const u1 = ((col + 1) * CW) / c.width - pad;
    const v1 = 1 - (row * CH) / c.height - padV;
    const v0 = 1 - ((row + 1) * CH) / c.height + padV;
    return [u0 + (u1 - u0) * u, v0 + (v1 - v0) * v];
  }
  function unmapUV(index, u, v) {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    const pad = PAD / c.width;
    const padV = PAD / c.height;
    const u0 = (col * CW) / c.width + pad;
    const u1 = ((col + 1) * CW) / c.width - pad;
    const v1 = 1 - (row * CH) / c.height - padV;
    const v0 = 1 - ((row + 1) * CH) / c.height + padV;
    return {
      x: (u - u0) / Math.max(1e-8, u1 - u0),
      y: (v - v0) / Math.max(1e-8, v1 - v0),
    };
  }
  return { texture: tex, mapUV, unmapUV, canvas: c, cellW: CW, cellH: CH };
}

function placeholderPages(title, promise) {
  const t = title || 'Untitled';
  const p = promise || 'A short book about a trap that feels like a need.';
  const pages = [
    { title: t, paragraphs: [p, 'Belief Changer · free to read.'] },
    { title: 'Copyright', paragraphs: [`${t}`, 'Belief Changer. Free forever.'] },
    {
      title: 'Contents',
      paragraphs: ['1. The trap', '2. What it costs', '3. Seeing it clearly', '4. Walking out'],
    },
  ];
  for (let i = 3; i < 11; i++) {
    pages.push({
      title: i === 10 ? 'Colophon' : `Chapter ${i - 2}`,
      paragraphs: [
        p,
        'The craving wears the mask of need. Name it once and it loosens.',
        'Read slowly. The change is in the seeing, not the struggle.',
      ],
    });
  }
  return pages;
}

/* -------------------------------------------------------- shared resources */

function buildStackGeo(THREE, G, D) {
  const stackIndexed = G.textBlock(THREE, {
    pageW: D.pageW,
    pageH: D.pageH,
    blockT: D.blockT,
    yBot: D.yBot,
    spineBulge: D.spineBulge,
    foreDent: D.spineBulge,
  });
  const segIndex = { ...stackIndexed.userData.segIndex };
  let stackGeo = stackIndexed.toNonIndexed();
  stackIndexed.dispose();

  const boundIdx = segIndex.bound;
  const boundVertex = new Uint8Array(stackGeo.attributes.position.count);
  for (const gr of stackGeo.groups) {
    const isBound = gr.materialIndex === boundIdx;
    if (isBound) {
      const end = gr.start + gr.count;
      for (let i = gr.start; i < end; i++) boundVertex[i] = 1;
      gr.materialIndex = 1;
    } else gr.materialIndex = 0;
  }

  const uvStack = stackGeo.attributes.uv.array;
  const pStack = stackGeo.attributes.position.array;
  for (let i = 0; i < stackGeo.attributes.position.count; i += 3) {
    const a = i * 3;
    const b = a + 3;
    const c = a + 6;
    const abx = pStack[b] - pStack[a];
    const aby = pStack[b + 1] - pStack[a + 1];
    const abz = pStack[b + 2] - pStack[a + 2];
    const acx = pStack[c] - pStack[a];
    const acy = pStack[c + 1] - pStack[a + 1];
    const acz = pStack[c + 2] - pStack[a + 2];
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    const L = Math.hypot(nx, ny, nz) || 1;
    const pageFace = Math.abs(ny / L) > 0.72;
    const y0 = pageFace ? 0.0 : 0.5;
    for (let k = 0; k < 3; k++) {
      const vi = i + k;
      if (!boundVertex[vi]) {
        const baseV = Math.max(0, Math.min(1, uvStack[vi * 2 + 1]));
        uvStack[vi * 2 + 1] = y0 + baseV * 0.5;
      }
    }
  }
  stackGeo.attributes.uv.needsUpdate = true;
  stackGeo.computeVertexNormals();
  return stackGeo;
}

function fillSpineClosed(THREE, G, D, spineGeo, spineArtPos, spineArtUV) {
  const kin = G.caseKinematics(
    {
      jointX: D.jointX,
      arcLen: D.spineArc,
      closedPhi: D.spinePhi,
      grooveW: D.grooveW,
      maxAlpha: COVER_OPEN,
    },
    0,
  );
  const pos = spineGeo.attributes.position.array;
  const uv = spineGeo.attributes.uv.array;
  const zh = D.boardH / 2;
  const th = 0.085;
  const src = kin.pts;
  const ns = src.length;
  const cum = new Float64Array(ns);
  cum[0] = 0;
  for (let k = 1; k < ns; k++) {
    cum[k] = cum[k - 1] + Math.hypot(src[k].x - src[k - 1].x, src[k].y - src[k - 1].y);
  }
  const arc = cum[ns - 1] || 1;
  const uScale = 1 / D.boardW;
  let j = 0;
  for (let i = 0; i <= SP_STEPS; i++) {
    const sAt = (i / SP_STEPS) * arc;
    while (j < ns - 2 && cum[j + 1] < sAt) j++;
    const span = cum[j + 1] - cum[j] || 1;
    const f = Math.min(1, Math.max(0, (sAt - cum[j]) / span));
    const a = src[j];
    const b = src[j + 1];
    const pxs = a.x + (b.x - a.x) * f;
    const pys = a.y + (b.y - a.y) * f;
    const pth = a.th + (b.th - a.th) * f;
    const nx = Math.sin(pth);
    const ny = -Math.cos(pth);
    const o = i * SPINE_RAILS;
    const set = (k, x, y, z, u, v) => {
      pos[k * 3] = x;
      pos[k * 3 + 1] = y;
      pos[k * 3 + 2] = z;
      uv[k * 2] = u;
      uv[k * 2 + 1] = v;
    };
    const u = sAt * uScale;
    const vEdge = th / D.boardH;
    const ix = pxs + nx * th;
    const iy = pys + ny * th;
    const io = SP_ZSPANS + 1;
    for (let k = 0; k <= SP_ZSPANS; k++) {
      const fz = k / SP_ZSPANS;
      const z = -zh + 2 * zh * fz;
      set(o + k, pxs, pys, z, u, fz);
      set(o + io + k, ix, iy, z, u, fz);
    }
    set(o + 2 * io, ix, iy, zh, u, 1 + vEdge);
    set(o + 2 * io + 1, ix, iy, -zh, u, -vEdge);
    if (spineArtPos) {
      const ao = i * 6;
      const decal = 0.01;
      spineArtPos[ao] = pxs - nx * decal;
      spineArtPos[ao + 1] = pys - ny * decal;
      spineArtPos[ao + 2] = -zh + 0.36;
      spineArtPos[ao + 3] = pxs - nx * decal;
      spineArtPos[ao + 4] = pys - ny * decal;
      spineArtPos[ao + 5] = zh - 0.36;
      if (spineArtUV) {
        const inset = 0.36 / D.boardH;
        spineArtUV[i * 4] = u;
        spineArtUV[i * 4 + 1] = inset;
        spineArtUV[i * 4 + 2] = u;
        spineArtUV[i * 4 + 3] = 1 - inset;
      }
    }
  }
  spineGeo.attributes.position.needsUpdate = true;
  spineGeo.attributes.uv.needsUpdate = true;
  spineGeo.computeVertexNormals();
  return kin;
}

function headbandGeometry(THREE, D, zSign, relax, stackSpineBaseX, stackDeformAt) {
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const q = 0.025 + 0.95 * (i / 16);
    const y0 = D.yBot + D.blockT * q;
    const d = stackDeformAt(q, 0, relax, 0);
    pts.push(
      new THREE.Vector3(
        stackSpineBaseX(q) + 0.006 + d.dx,
        y0 + d.dy,
        zSign * (D.pageH / 2 - 0.095),
      ),
    );
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.086, 6, false);
}

function stackHelpers(D) {
  const stackSpineBaseX = (q) => -D.spineBulge * Math.sin(Math.PI * clamp01(q));
  function stackSpineOpenX(q) {
    q = clamp01(q);
    const base = stackSpineBaseX(q);
    const anchorQ = 0.55;
    const anchorOpen = stackSpineBaseX(anchorQ) - 0.06;
    const topOpen = -0.205;
    const lineT = clamp01((q - anchorQ) / (1 - anchorQ));
    const straightShoulder = anchorOpen + (topOpen - anchorOpen) * lineT;
    const flatten = smooth01((q - 0.34) / 0.3);
    return base + (straightShoulder - base) * flatten;
  }
  function stackDeformAt(q, u, relax, micro = 0) {
    q = clamp01(q);
    u = clamp01(u);
    const e = clamp01(relax);
    const upper = smooth01((q - 0.26) / 0.74);
    const span = smooth01(u);
    const spineDelta = (stackSpineOpenX(q) - stackSpineBaseX(q)) * e;
    const shear = -e * upper * (0.02 + 0.083 * span);
    const jitterX = e * micro * upper * (0.003 + 0.006 * span);
    const dx = spineDelta + shear + jitterX;
    const dy = e * upper * (0.004 + 0.02 * span) + e * micro * upper * span * 0.0012;
    return { dx, dy };
  }
  return { stackSpineBaseX, stackDeformAt };
}

function coverArtworkMesh(THREE, material, isFront, D) {
  const border = isFront ? ART_BORDER_FRONT : ART_BORDER_BACK;
  const pw = D.boardW - border * 2;
  const ph = D.boardH - border * 2;
  if (isFront && material.map) fitCover(material.map, pw / ph);
  const g = new THREE.PlaneGeometry(pw, ph, 1, 1);
  // Cover photo on UV0 — default UVs read upright/unmirrored after Rx(+π/2) rest.
  const src = g.attributes.uv;
  // Cloth weave for normals uses uv1 at board scale.
  const cloth = src.clone();
  const uv = cloth.array;
  for (let i = 0; i < uv.length; i += 2) {
    uv[i] = 0.5 + (uv[i] - 0.5) * (pw / D.boardW);
    uv[i + 1] = 0.5 + (uv[i + 1] - 0.5) * (ph / D.boardH);
  }
  cloth.needsUpdate = true;
  g.setAttribute('uv1', cloth);
  const m = new THREE.Mesh(g, material);
  m.rotation.x = Math.PI / 2; // local normal −Y: exterior of board / flipped front
  m.position.set(D.boardW / 2, -0.02, 0);
  m.renderOrder = 4;
  m.castShadow = false;
  m.receiveShadow = true;
  m.userData.coverArtwork = isFront ? 'front' : 'back';
  return m;
}

function titleOverlayMesh(THREE, material, D) {
  const border = ART_BORDER_FRONT;
  const pw = D.boardW - border * 2;
  const ph = D.boardH - border * 2;
  const g = new THREE.PlaneGeometry(pw, ph, 1, 1);
  const m = new THREE.Mesh(g, material);
  m.rotation.x = Math.PI / 2;
  m.position.set(D.boardW / 2, -0.028, 0);
  m.renderOrder = 6;
  m.castShadow = false;
  m.receiveShadow = false;
  return m;
}

function applyRestOrient(THREE, root) {
  // Rx(+π/2) only: cover +Y → +Z, head +Z → +Y, spine −X stays −X.
  root.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), BOOK_REST_EULER.x);
  root.scale.set(BOOK_REST_SCALE.x, BOOK_REST_SCALE.y, BOOK_REST_SCALE.z);
}

function applyComOffset(book) {
  book.position.set(BOOK_COM_OFFSET.x, BOOK_COM_OFFSET.y, BOOK_COM_OFFSET.z);
}

/* ---- Troika SDF text (gold parity): titles are polygon meshes, crisp at any
   zoom. Loaded lazily from ./vendor/; falls back to the legacy canvas bake if
   the module or font is unavailable. ---- */
async function buildCoverTitleGroup(THREE, shared, { title, subtitle, author, ink }) {
  if (!shared.troikaReady || !shared.titleFontUrl) return null;
  let troika;
  try {
    troika = await shared.troikaReady;
  } catch {
    return null;
  }
  const Text = troika && (troika.Text || (troika.default && troika.default.Text));
  if (!Text) return null;
  const D = BOOK_DIMS;
  const pw = D.boardW - ART_BORDER_FRONT * 2;
  const ph = D.boardH - ART_BORDER_FRONT * 2;
  const s = pw / 768; // legacy bakeFrontTitle canvas was 768×1152
  const g = new THREE.Group();
  g.name = 'troikaTitle';
  const mk = (str, pxSize, yCanvas, opts = {}) => {
    if (!str) return null;
    const t = new Text();
    t.text = opts.upper ? String(str).toUpperCase() : String(str);
    t.font = shared.titleFontUrl;
    t.fontSize = Math.max(0.14, pxSize * s);
    t.color = ink;
    t.anchorX = 'center';
    t.anchorY = opts.top ? 'top' : 'middle';
    t.maxWidth = pw * 0.84;
    t.lineHeight = opts.lineHeight || 1.08;
    t.letterSpacing = opts.tracking != null ? opts.tracking : 0.01;
    t.sdfGlyphSize = 64;
    t.renderOrder = 6;
    t.userData.isSDFText = true;
    t.depthOffset = -6;
    t.material.depthTest = true;
    // Group-local +Y points toward the cover top; canvas y grows downward.
    t.position.z = 0.012;
    t.position.y = ph / 2 - yCanvas * s;
    g.add(t);
    return t;
  };
  mk(title, 108, 1152 * 0.2 + 40, { top: true, lineHeight: 1.06 });
  if (subtitle) mk(subtitle, 30, 1152 * (0.2 + 0.115) + 60, { lineHeight: 1.3 });
  if (author) mk(String(author).toUpperCase(), 24, 1152 * 0.862);
  mk('BELIEF CHANGER', 19, 1152 * 0.932, { tracking: 0.18 });
  g.userData.isTroikaTitle = true;
  return g;
}

export async function createSharedResources(THREE, opts = {}) {
  const G = requireBK();
  const D = BOOK_DIMS;
  const loader = new THREE.TextureLoader();
  const aniso = 4;

  const [coverNormal, paperColor, endColor, bandColor, pageEdgeScan] = await Promise.all([
    loadMap(THREE, loader, `${MAT_BASE}cover_normal.webp`, false, ...BOOK_LOOK.cover.normalRepeat, aniso),
    loadMap(THREE, loader, `${MAT_BASE}paper_color.webp`, true, D.pageW / 10, D.pageH / 10, aniso),
    loadMap(THREE, loader, `${MAT_BASE}endpaper_color.webp`, true, D.pageW / 10, D.pageH / 10, aniso),
    loadMap(THREE, loader, `${MAT_BASE}headband_color.webp`, true, 3.2, 1.0, aniso),
    loadMap(THREE, loader, `${MAT_BASE}page_edge_scan.webp`, true, 1.0, 1.0, aniso),
  ]);

  const pageEdgeColor = makePageEdgeTexture(THREE, pageEdgeScan, D.sheets, aniso);
  const pageBlockAtlas = makePageBlockAtlas(THREE, paperColor, pageEdgeColor, aniso);

  const boardGeo = G.board(THREE, {
    w: D.boardW,
    t: D.boardT,
    h: D.boardH,
    cornerR: 0.1,
  });
  const stackGeo = buildStackGeo(THREE, G, D);

  const spineGeoClosed = G.spineStrip(THREE, { steps: SP_STEPS, zSpans: SP_ZSPANS });
  const spineArtPosClosed = new Float32Array((SP_STEPS + 1) * 2 * 3);
  const spineArtUVClosed = new Float32Array((SP_STEPS + 1) * 2 * 2);
  const spineArtUV1Closed = new Float32Array((SP_STEPS + 1) * 2 * 2);
  const spineArtIdx = [];
  {
    const inset = 0.36 / D.boardH;
    const SPINE_U = D.spineArc / D.boardW;
    for (let i = 0; i <= SP_STEPS; i++) {
      const f = i / SP_STEPS;
      spineArtUV1Closed.set([f, 1, f, 0], i * 4);
      spineArtUVClosed.set([f * SPINE_U, inset, f * SPINE_U, 1 - inset], i * 4);
      if (i < SP_STEPS) {
        const a = i * 2;
        const b = a + 2;
        spineArtIdx.push(a, a + 1, b + 1, a, b + 1, b);
      }
    }
  }
  const closedKin = fillSpineClosed(THREE, G, D, spineGeoClosed, spineArtPosClosed, spineArtUVClosed);

  const spineArtGeoClosed = new THREE.BufferGeometry();
  spineArtGeoClosed.setAttribute('position', new THREE.BufferAttribute(spineArtPosClosed, 3));
  spineArtGeoClosed.setAttribute('uv', new THREE.BufferAttribute(spineArtUVClosed, 2));
  spineArtGeoClosed.setAttribute('uv1', new THREE.BufferAttribute(spineArtUV1Closed, 2));
  spineArtGeoClosed.setIndex(spineArtIdx);
  spineArtGeoClosed.computeVertexNormals();

  const { stackSpineBaseX, stackDeformAt } = stackHelpers(D);
  const hbGeoP = headbandGeometry(THREE, D, 1, 0, stackSpineBaseX, stackDeformAt);
  const hbGeoM = headbandGeometry(THREE, D, -1, 0, stackSpineBaseX, stackDeformAt);

  const artPlaneW = D.boardW - ART_BORDER_FRONT * 2;
  const artPlaneH = D.boardH - ART_BORDER_FRONT * 2;
  const coverArtGeo = new THREE.PlaneGeometry(artPlaneW, artPlaneH, 1, 1);
  {
    const src = coverArtGeo.attributes.uv;
    coverArtGeo.setAttribute('uv1', src.clone());
    const uv = src.array;
    for (let i = 0; i < uv.length; i += 2) {
      uv[i] = 0.5 + (uv[i] - 0.5) * (artPlaneW / D.boardW);
      uv[i + 1] = 0.5 + (uv[i + 1] - 0.5) * (artPlaneH / D.boardH);
    }
    src.needsUpdate = true;
  }

  const matStack = new THREE.MeshStandardMaterial({
    map: pageBlockAtlas,
    color: BOOK_LOOK.stack.color,
    bumpMap: pageBlockAtlas,
    bumpScale: PAGE_BUMP,
    roughness: 0.972,
    metalness: 0,
    envMapIntensity: 0.13,
  });
  const matBoundEdge = new THREE.MeshStandardMaterial({
    map: pageEdgeColor,
    color: BOOK_LOOK.stack.color,
    bumpMap: pageEdgeColor,
    bumpScale: PAGE_BUMP * 0.8,
    roughness: 0.972,
    metalness: 0,
    envMapIntensity: 0.1,
  });
  const matEnd = new THREE.MeshStandardMaterial({
    map: endColor,
    color: BOOK_LOOK.endpaper.color,
    roughness: BOOK_LOOK.endpaper.roughness,
    metalness: 0,
    envMapIntensity: 0.24,
  });
  const matBand = new THREE.MeshStandardMaterial({
    map: bandColor,
    color: BOOK_LOOK.headband.color,
    roughness: BOOK_LOOK.headband.roughness,
    metalness: 0,
    envMapIntensity: 0.22,
  });
  const matMull = new THREE.MeshStandardMaterial({
    map: pageEdgeColor,
    color: BOOK_LOOK.stack.color,
    roughness: 0.985,
    metalness: 0,
    envMapIntensity: 0.1,
    side: THREE.DoubleSide,
  });

  const shared = {
    textures: {
      coverNormal,
      paperColor,
      endColor,
      bandColor,
      pageEdgeScan,
      pageEdgeColor,
      pageBlockAtlas,
    },
    boardGeo,
    stackGeo,
    spineGeoClosed,
    spineArtGeoClosed,
    coverArtGeo,
    headbandGeoPos: hbGeoP,
    headbandGeoNeg: hbGeoM,
    materials: { matStack, matBoundEdge, matEnd, matBand, matMull },
    closedKin,
    stackSpineBaseX,
    stackDeformAt,
    D,
    G,
  };

  // Troika SDF text (gold parity). Null on any failure → canvas fallback.
  const troikaUrl = opts.troikaUrl || './vendor/troika-three-text.module.js';
  shared.troikaReady = import(/* @vite-ignore */ troikaUrl)
    .then((m) => (m && m.Text ? m : m && m.default && m.default.Text ? m.default : null))
    .catch(() => null);
  shared.titleFontUrl = opts.fontUrl || null;

  return shared;
}

/* Cover textures are shared across slots (the ring repeats the catalog), so
   cache by URL: one network fetch + decode + GPU upload per unique cover.
   Cached textures are never disposed — the set is bounded by the catalog. */
const coverTexCache = new Map();

async function loadCoverTexture(THREE, url, aniso = 6) {
  let p = coverTexCache.get(url);
  if (!p) {
    p = (async () => {
      const loader = new THREE.TextureLoader();
      const tex = await loader.loadAsync(url);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = aniso;
      tex.needsUpdate = true;
      return tex;
    })();
    coverTexCache.set(url, p);
  }
  return p;
}

function makeCaseMaterials(THREE, shared, caseColor) {
  const { coverNormal } = shared.textures;
  const matCase = new THREE.MeshStandardMaterial({
    normalMap: coverNormal,
    normalScale: new THREE.Vector2(BOOK_LOOK.cover.normalScale, BOOK_LOOK.cover.normalScale),
    color: caseColor || '#e8e6e5',
    roughness: BOOK_LOOK.cover.roughness,
    metalness: 0,
    envMapIntensity: 0.52,
  });
  const matCaseSpine = matCase.clone();
  return { matCase, matCaseSpine };
}

function makeFrontArtMaterial(THREE, shared, coverTex) {
  // Photo on UV0. Clone the weave normal onto uv1 so case materials keep UV0.
  if (coverTex) coverTex.channel = 0;
  let artNormal = null;
  if (shared.textures.coverNormal) {
    artNormal = shared.textures.coverNormal.clone();
    artNormal.channel = 1;
  }
  return new THREE.MeshStandardMaterial({
    map: coverTex,
    side: THREE.FrontSide,
    toneMapped: true,
    color: 0xffffff,
    roughness: BOOK_LOOK.cover.roughness,
    metalness: 0,
    envMapIntensity: 0.46,
    normalMap: artNormal,
    normalScale: new THREE.Vector2(BOOK_LOOK.cover.normalScale, BOOK_LOOK.cover.normalScale),
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
}

function makeTitleMaterial(THREE, titleTex) {
  titleTex.channel = 0;
  return new THREE.MeshBasicMaterial({
    map: titleTex,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.FrontSide,
    toneMapped: false,
  });
}

function makeSpineArtMaterial(THREE, spineTex, shared) {
  spineTex.channel = 1;
  return new THREE.MeshStandardMaterial({
    map: spineTex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: true,
    color: 0xffffff,
    roughness: 0.665,
    metalness: 0,
    envMapIntensity: 0.42,
    normalMap: shared.textures.coverNormal,
    normalScale: new THREE.Vector2(0.24, BOOK_LOOK.cover.normalScale),
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
}

function placeClosedCase(book, D, kin, frontBoardPivot, backBoard, frontPaste, backPaste, backArt) {
  frontBoardPivot.position.set(kin.frontBoard.x, kin.frontBoard.y, 0);
  frontBoardPivot.rotation.z = kin.boardDir;
  if (frontPaste) frontPaste.position.set(D.boardW / 2, D.boardT + 0.003, 0);
  if (backPaste) backPaste.position.set(D.boardW / 2 + D.jointX + D.grooveW, D.boardT + 0.003, 0);
  if (backArt) backArt.position.x = D.boardW / 2 + D.jointX + D.grooveW;
  backBoard.position.set(D.jointX + D.grooveW, 0, 0);
}

function simplePastedown(THREE, shared, D) {
  const inset = 0.4;
  const hingeInset = 0.2;
  const pw = D.boardW - inset - hingeInset;
  const ph = D.boardH - inset * 2;
  const g = new THREE.PlaneGeometry(pw, ph, 4, 4);
  const m = new THREE.Mesh(g, shared.materials.matEnd);
  m.rotation.x = -Math.PI / 2;
  m.castShadow = false;
  m.receiveShadow = true;
  return m;
}

/* ----------------------------------------------------------- closed book */

export async function createClosedBook(THREE, shared, opts) {
  const D = shared.D || BOOK_DIMS;
  const {
    coverUrl,
    caseColor = '#e8e6e5',
    caseLuminance = 0.79,
    title = '',
    subtitle = '',
    author = '',
    slug = '',
    overlayInk,
    promise,
  } = opts;

  const root = new THREE.Group();
  root.name = `book-closed-${slug || 'anon'}`;
  applyRestOrient(THREE, root);
  const book = new THREE.Group();
  applyComOffset(book);
  root.add(book);

  const { matCase, matCaseSpine } = makeCaseMaterials(THREE, shared, caseColor);
  const coverTex = await loadCoverTexture(THREE, coverUrl);
  const matFrontArt = makeFrontArtMaterial(THREE, shared, coverTex);

  const ink = inkForLuminance(caseLuminance, overlayInk);
  // Title: troika SDF polygon text (gold parity); canvas bake only as fallback.
  const titleGroup = await buildCoverTitleGroup(THREE, shared, { title, subtitle, author, ink });
  let matTitle = null;
  let titleTex = null;
  let titleOverlay;
  if (titleGroup) {
    titleGroup.rotation.x = Math.PI / 2;
    titleGroup.position.set(D.boardW / 2, -0.028, 0);
    titleOverlay = titleGroup;
  } else {
    titleTex = bakeFrontTitle(THREE, {
      title,
      subtitle,
      author,
      ink,
      caseLum: caseLuminance,
    });
    matTitle = makeTitleMaterial(THREE, titleTex);
    titleOverlay = titleOverlayMesh(THREE, matTitle, D);
  }
  const spineTitleTex = bakeSpineTitle(THREE, { title, ink, caseLum: caseLuminance });
  const matSpineArt = makeSpineArtMaterial(THREE, spineTitleTex, shared);

  const backBoard = new THREE.Mesh(shared.boardGeo, matCase);
  backBoard.castShadow = true;
  backBoard.receiveShadow = true;
  const frontBoard = new THREE.Mesh(shared.boardGeo, matCase);
  frontBoard.castShadow = true;
  frontBoard.receiveShadow = true;

  const frontBoardPivot = new THREE.Group();
  const frontFlip = new THREE.Group();
  frontFlip.rotation.x = Math.PI;
  frontFlip.add(frontBoard);
  frontBoardPivot.add(frontFlip);
  book.add(backBoard, frontBoardPivot);

  const frontPaste = simplePastedown(THREE, shared, D);
  const backPaste = simplePastedown(THREE, shared, D);
  frontFlip.add(frontPaste);
  book.add(backPaste);

  // Cover artwork — unique material, shared plane layout via helper
  const frontArt = coverArtworkMesh(THREE, matFrontArt, true, D);
  frontFlip.add(frontArt, titleOverlay);

  const stack = new THREE.Mesh(shared.stackGeo, [
    shared.materials.matStack,
    shared.materials.matBoundEdge,
  ]);
  stack.castShadow = true;
  stack.receiveShadow = false;
  book.add(stack);

  const spineMesh = new THREE.Mesh(shared.spineGeoClosed, matCaseSpine);
  spineMesh.castShadow = true;
  spineMesh.receiveShadow = true;
  book.add(spineMesh);

  const spineArt = new THREE.Mesh(shared.spineArtGeoClosed, matSpineArt);
  spineArt.renderOrder = 5;
  spineArt.castShadow = false;
  spineArt.receiveShadow = true;
  book.add(spineArt);

  const hb0 = new THREE.Mesh(shared.headbandGeoPos, shared.materials.matBand);
  const hb1 = new THREE.Mesh(shared.headbandGeoNeg, shared.materials.matBand);
  hb0.castShadow = false;
  hb1.castShadow = false;
  book.add(hb0, hb1);

  placeClosedCase(book, D, shared.closedKin, frontBoardPivot, backBoard, frontPaste, backPaste, null);

  const hitMeshes = [frontBoard, backBoard, spineMesh, frontArt, stack];

  const disposables = [matCase, matCaseSpine, matFrontArt, matTitle, matSpineArt, coverTex, titleTex, spineTitleTex];
  // frontArt / titleOverlay use unique PlaneGeometry from helpers
  disposables.push(frontArt.geometry, titleOverlay.geometry);

  function setCaseColor(hex) {
    matCase.color.set(hex);
    matCaseSpine.color.set(hex);
  }

  async function setCoverTexture(url) {
    const next = await loadCoverTexture(THREE, url);
    const old = matFrontArt.map;
    matFrontArt.map = next;
    next.channel = 0;
    const pw = D.boardW - ART_BORDER_FRONT * 2;
    const ph = D.boardH - ART_BORDER_FRONT * 2;
    fitCover(next, pw / ph);
    matFrontArt.needsUpdate = true;
    if (old && old !== next) old.dispose();
  }

  function setTitleVisible(v) {
    titleOverlay.visible = !!v;
    spineArt.visible = !!v;
  }

  function dispose() {
    root.removeFromParent();
    for (const d of disposables) {
      if (d && d.dispose) d.dispose();
    }
  }

  root.userData.slug = slug;
  root.userData.title = title;
  root.userData.kind = 'closed';

  return {
    group: root,
    hitMeshes,
    setCaseColor,
    setCoverTexture,
    setTitleVisible,
    dispose,
    userData: {
      slug,
      title,
      subtitle,
      author,
      promise,
      caseColor,
      caseLuminance,
      coverUrl,
      overlayInk,
    },
  };
}

/* ----------------------------------------------------------- reader book */

function updateSpineDynamic(THREE, G, D, spineGeo, spineArtGeo, spineArtPos, alpha, maxAlpha) {
  const kin = G.caseKinematics(
    {
      jointX: D.jointX,
      arcLen: D.spineArc,
      closedPhi: D.spinePhi,
      grooveW: D.grooveW,
      maxAlpha: maxAlpha,
    },
    alpha,
  );
  const pos = spineGeo.attributes.position.array;
  const uv = spineGeo.attributes.uv.array;
  const artUv = spineArtGeo.attributes.uv.array;
  const zh = D.boardH / 2;
  const th = 0.085;
  const src = kin.pts;
  const ns = src.length;
  const cum = new Float64Array(ns);
  cum[0] = 0;
  for (let k = 1; k < ns; k++) {
    cum[k] = cum[k - 1] + Math.hypot(src[k].x - src[k - 1].x, src[k].y - src[k - 1].y);
  }
  const arc = cum[ns - 1] || 1;
  const uScale = 1 / D.boardW;
  let j = 0;
  for (let i = 0; i <= SP_STEPS; i++) {
    const sAt = (i / SP_STEPS) * arc;
    while (j < ns - 2 && cum[j + 1] < sAt) j++;
    const span = cum[j + 1] - cum[j] || 1;
    const f = Math.min(1, Math.max(0, (sAt - cum[j]) / span));
    const a = src[j];
    const b = src[j + 1];
    const pxs = a.x + (b.x - a.x) * f;
    const pys = a.y + (b.y - a.y) * f;
    const pth = a.th + (b.th - a.th) * f;
    const nx = Math.sin(pth);
    const ny = -Math.cos(pth);
    const o = i * SPINE_RAILS;
    const set = (k, x, y, z, u, v) => {
      pos[k * 3] = x;
      pos[k * 3 + 1] = y;
      pos[k * 3 + 2] = z;
      uv[k * 2] = u;
      uv[k * 2 + 1] = v;
    };
    const u = sAt * uScale;
    const vEdge = th / D.boardH;
    const ix = pxs + nx * th;
    const iy = pys + ny * th;
    const io = SP_ZSPANS + 1;
    for (let k = 0; k <= SP_ZSPANS; k++) {
      const fz = k / SP_ZSPANS;
      const z = -zh + 2 * zh * fz;
      set(o + k, pxs, pys, z, u, fz);
      set(o + io + k, ix, iy, z, u, fz);
    }
    set(o + 2 * io, ix, iy, zh, u, 1 + vEdge);
    set(o + 2 * io + 1, ix, iy, -zh, u, -vEdge);
    const ao = i * 6;
    const decal = 0.01;
    spineArtPos[ao] = pxs - nx * decal;
    spineArtPos[ao + 1] = pys - ny * decal;
    spineArtPos[ao + 2] = -zh + 0.36;
    spineArtPos[ao + 3] = pxs - nx * decal;
    spineArtPos[ao + 4] = pys - ny * decal;
    spineArtPos[ao + 5] = zh - 0.36;
    artUv[i * 4] = u;
    artUv[i * 4 + 2] = u;
  }
  spineGeo.attributes.position.needsUpdate = true;
  spineGeo.attributes.uv.needsUpdate = true;
  spineGeo.computeVertexNormals();
  spineArtGeo.attributes.position.needsUpdate = true;
  spineArtGeo.attributes.uv.needsUpdate = true;
  spineArtGeo.computeVertexNormals();
  return kin;
}

export async function createReaderBook(THREE, shared, options = {}) {
  const G = shared.G || requireBK();
  const PG = requirePage();
  const D = shared.D || BOOK_DIMS;
  const { stackSpineBaseX, stackDeformAt } = shared;

  const root = new THREE.Group();
  root.name = 'book-reader';
  applyRestOrient(THREE, root);
  const book = new THREE.Group();
  applyComOffset(book);
  root.add(book);

  const S = {
    cover: 0,
    coverOpen: COVER_OPEN,
    turned: 0,
    turning: -1,
    t: 0,
    grabU: 0.94,
    grabV: -0.58,
    grabActive: 1,
  };

  let meta = {
    coverUrl: options.coverUrl,
    caseColor: options.caseColor || '#e8e6e5',
    caseLuminance: options.caseLuminance ?? 0.79,
    title: options.title || '',
    subtitle: options.subtitle || '',
    author: options.author || '',
    slug: options.slug || '',
    overlayInk: options.overlayInk,
    promise: options.promise || '',
    pages: options.pages || null,
  };

  const { matCase, matCaseSpine } = makeCaseMaterials(THREE, shared, meta.caseColor);
  let coverTex = meta.coverUrl ? await loadCoverTexture(THREE, meta.coverUrl) : null;
  let matFrontArt = makeFrontArtMaterial(THREE, shared, coverTex);

  const ink = inkForLuminance(meta.caseLuminance, meta.overlayInk);
  // Title: troika SDF polygon text (gold parity); canvas bake only as fallback.
  let matTitle = null;
  let titleTex = null;
  let troikaTitleTexts = null;
  let titleOverlay = await buildCoverTitleGroup(THREE, shared, {
    title: meta.title,
    subtitle: meta.subtitle,
    author: meta.author,
    ink,
  });
  if (titleOverlay) {
    titleOverlay.rotation.x = Math.PI / 2;
    titleOverlay.position.set(D.boardW / 2, -0.028, 0);
    troikaTitleTexts = titleOverlay.children.slice();
  }
  if (!titleOverlay) {
    titleTex = bakeFrontTitle(THREE, {
      title: meta.title,
      subtitle: meta.subtitle,
      author: meta.author,
      ink,
      caseLum: meta.caseLuminance,
    });
    matTitle = makeTitleMaterial(THREE, titleTex);
    titleOverlay = titleOverlayMesh(THREE, matTitle, D);
  }
  let spineTitleTex = bakeSpineTitle(THREE, {
    title: meta.title,
    ink,
    caseLum: meta.caseLuminance,
  });
  let matSpineArt = makeSpineArtMaterial(THREE, spineTitleTex, shared);

  /* Gold printed-page pipeline (04-text): page ink as real SDF geometry riding
     the deforming leaf surfaces — no see-through doubling on the curl, and
     page 11 prints on the stack cap. The canvas atlas degrades to paper-only
     and stays as the no-troika fallback. */
  const FONT_BASE = MAT_BASE.indexOf('/orbit-materials/') === 0
    ? '/fonts/'
    : '../site/public/fonts/';
  let textLayer = null;
  {
    const troikaMod = await shared.troikaReady.catch(() => null);
    const troikaApi = troikaMod && (troikaMod.Text ? troikaMod : troikaMod.default || troikaMod);
    if (troikaApi && typeof window !== 'undefined' && window.BK && window.BK.text) {
      try {
        textLayer = window.BK.text.create(THREE, troikaApi, {
          D,
          fonts: {
            body: { url: FONT_BASE + 'dmsans-400-normal-latin.woff2' },
            bodyMedium: { url: FONT_BASE + 'dmsans-600-normal-latin.woff2' },
            display: { url: FONT_BASE + 'newsreader-400-normal-latin.woff2' },
            displayItalic: { url: FONT_BASE + 'newsreader-400-italic-latin.woff2' },
          },
          printColor: ink,
          envMap: null,
          quality: { sdfGlyphSize: 64, textAniso: 8 },
          layout: null,
        });
      } catch (e) {
        textLayer = null;
      }
    }
  }

  const pages = meta.pages || placeholderPages(meta.title, meta.promise);
  let pageSys = makePageAtlas(THREE, pages, shared.textures.paperColor, !!textLayer);
  const matPageText = new THREE.MeshStandardMaterial({
    map: pageSys.texture,
    color: 0xffffff,
    roughness: BOOK_LOOK.paper.roughness,
    metalness: 0,
    envMapIntensity: 0.14,
    side: THREE.FrontSide,
  });
  if (pageSys.texture) pageSys.texture.anisotropy = Math.max(pageSys.texture.anisotropy || 1, 8);

  // Unique stack clone for deformation
  const stackGeo = shared.stackGeo.clone();
  const stackBaseArray = new Float32Array(stackGeo.attributes.position.array);
  const shellQ = new Float32Array(stackGeo.attributes.position.count);
  const shellU = new Float32Array(stackGeo.attributes.position.count);
  for (let i = 0; i < stackGeo.attributes.position.count; i++) {
    const o = i * 3;
    const x = stackBaseArray[o];
    const y = stackBaseArray[o + 1];
    const q = Math.max(0, Math.min(1, (y - D.yBot) / D.blockT));
    const xS = -D.spineBulge * Math.sin(Math.PI * q);
    const xF = D.pageW - D.spineBulge * Math.sin(Math.PI * q);
    shellQ[i] = q;
    shellU[i] = Math.max(0, Math.min(1, (x - xS) / Math.max(1e-4, xF - xS)));
  }
  stackGeo.attributes.position.setUsage(THREE.DynamicDrawUsage);
  const stack = new THREE.Mesh(stackGeo, [shared.materials.matStack, shared.materials.matBoundEdge]);
  stack.castShadow = true;
  stack.receiveShadow = false;
  stack.userData.pageBlock = true;
  book.add(stack);

  let stackLastRelax = -1;
  function updateStack(relax) {
    const e = clamp01(relax);
    if (Math.abs(e - stackLastRelax) < 1e-5) return;
    stackLastRelax = e;
    const p = stackGeo.attributes.position.array;
    for (let i = 0; i < shellQ.length; i++) {
      const d = stackDeformAt(shellQ[i], shellU[i], e, 0);
      const o = i * 3;
      p[o] = stackBaseArray[o] + d.dx;
      p[o + 1] = stackBaseArray[o + 1] + d.dy;
      p[o + 2] = stackBaseArray[o + 2];
    }
    stackGeo.attributes.position.needsUpdate = true;
    stackGeo.computeVertexNormals();
  }

  const backBoard = new THREE.Mesh(shared.boardGeo, matCase);
  backBoard.castShadow = true;
  backBoard.receiveShadow = true;
  const frontBoard = new THREE.Mesh(shared.boardGeo, matCase);
  frontBoard.castShadow = true;
  frontBoard.receiveShadow = true;
  const frontBoardPivot = new THREE.Group();
  const frontFlip = new THREE.Group();
  frontFlip.rotation.x = Math.PI;
  frontFlip.add(frontBoard);
  frontBoardPivot.add(frontFlip);
  book.add(backBoard, frontBoardPivot);

  const frontPaste = simplePastedown(THREE, shared, D);
  const backPaste = simplePastedown(THREE, shared, D);
  frontFlip.add(frontPaste);
  book.add(backPaste);

  const frontArt = coverArtworkMesh(THREE, matFrontArt, true, D);
  frontFlip.add(frontArt, titleOverlay);

  const backMat = new THREE.MeshStandardMaterial({
    color: meta.caseColor,
    roughness: BOOK_LOOK.cover.roughness,
    metalness: 0,
    envMapIntensity: 0.42,
    normalMap: shared.textures.coverNormal,
    normalScale: new THREE.Vector2(BOOK_LOOK.cover.normalScale, BOOK_LOOK.cover.normalScale),
  });
  const backArt = coverArtworkMesh(THREE, backMat, false, D);
  book.add(backArt);

  const spineGeo = G.spineStrip(THREE, { steps: SP_STEPS, zSpans: SP_ZSPANS });
  const spineMesh = new THREE.Mesh(spineGeo, matCaseSpine);
  spineMesh.castShadow = true;
  spineMesh.receiveShadow = true;
  book.add(spineMesh);

  const spineArtPos = new Float32Array((SP_STEPS + 1) * 2 * 3);
  const spineArtUV = new Float32Array((SP_STEPS + 1) * 2 * 2);
  const spineArtUV1 = new Float32Array((SP_STEPS + 1) * 2 * 2);
  const spineArtIdx = [];
  {
    const inset = 0.36 / D.boardH;
    const SPINE_U = D.spineArc / D.boardW;
    for (let i = 0; i <= SP_STEPS; i++) {
      const f = i / SP_STEPS;
      spineArtUV1.set([f, 1, f, 0], i * 4);
      spineArtUV.set([f * SPINE_U, inset, f * SPINE_U, 1 - inset], i * 4);
      if (i < SP_STEPS) {
        const a = i * 2;
        const b = a + 2;
        spineArtIdx.push(a, a + 1, b + 1, a, b + 1, b);
      }
    }
  }
  const spineArtGeo = new THREE.BufferGeometry();
  spineArtGeo.setAttribute('position', new THREE.BufferAttribute(spineArtPos, 3));
  spineArtGeo.setAttribute('uv', new THREE.BufferAttribute(spineArtUV, 2));
  spineArtGeo.setAttribute('uv1', new THREE.BufferAttribute(spineArtUV1, 2));
  spineArtGeo.setIndex(spineArtIdx);
  const spineArt = new THREE.Mesh(spineArtGeo, matSpineArt);
  spineArt.renderOrder = 5;
  book.add(spineArt);

  const headbandMeshes = [];
  for (const zSign of [1, -1]) {
    const m = new THREE.Mesh(
      headbandGeometry(THREE, D, zSign, 0, stackSpineBaseX, stackDeformAt),
      shared.materials.matBand,
    );
    m.userData.zSign = zSign;
    book.add(m);
    headbandMeshes.push(m);
  }
  let headbandLastRelax = -1;
  function updateHeadbands(relax) {
    if (Math.abs(relax - headbandLastRelax) < 0.018) return;
    headbandLastRelax = relax;
    for (const m of headbandMeshes) {
      const old = m.geometry;
      m.geometry = headbandGeometry(THREE, D, m.userData.zSign, relax, stackSpineBaseX, stackDeformAt);
      old.dispose();
    }
  }

  // Leaves
  const leaves = [];
  function mapLeafShellToAtlas(lf, frontPage, backPage) {
    // Always remap from the Leaf's native UVs — never from a prior atlas pass
    // (rebind used to corrupt pages into blank paper).
    if (!lf._orbitUv0) {
      lf._orbitUv0 = new Float32Array(lf.geo.attributes.uv.array);
    }
    const uv = lf.geo.attributes.uv.array;
    uv.set(lf._orbitUv0);
    for (let shell = 0; shell < 2; shell++) {
      const pageIndex = shell === 0 ? frontPage : backPage;
      const start = shell * lf.vcount;
      for (let v = 0; v < lf.vcount; v++) {
        const k = (start + v) * 2;
        // Gold maps with (1 − u, v) so recto reads LTR with spine on −X.
        const mapped = pageSys.mapUV(pageIndex, 1 - uv[k], uv[k + 1]);
        uv[k] = mapped[0];
        uv[k + 1] = mapped[1];
      }
    }
    for (let k = 0; k < lf.ribCount; k++) {
      const dstK = (lf.ribBase + k) * 2;
      const srcK = lf.ribCentre[k] * 2;
      uv[dstK] = uv[srcK];
      uv[dstK + 1] = uv[srcK + 1];
    }
    lf.geo.attributes.uv.needsUpdate = true;
  }

  const BOOK_BOUNDS = new THREE.Sphere(new THREE.Vector3(5, 5, 0), 40);
  function pinDynamicBounds(g) {
    g.boundingSphere = BOOK_BOUNDS.clone();
    g.computeBoundingSphere = function () { this.boundingSphere = BOOK_BOUNDS.clone(); };
    g.boundingBox = null;
    return g;
  }

  for (let i = 0; i < NLEAF; i++) {
    const lf = new PG.Leaf(THREE, {
      nu: NU,
      nv: NV,
      W: D.leafW,
      H: D.pageH,
      thick: D.paper,
    });
    mapLeafShellToAtlas(lf, i * 2 + 1, i * 2);
    pinDynamicBounds(lf.geo);
    const m = new THREE.Mesh(lf.geo, matPageText);
    m.castShadow = false;
    m.receiveShadow = true;
    m.userData.leafIndex = i;
    m.userData.frontTriangleCount = lf.frontTriangleCount;
    lf.mesh = m;
    book.add(m);
    leaves.push(lf);
  }

  /* ------------------------------------------------------------------ */
  /* GOLD PRINTED-PAGE PIPELINE (04-text)                                */
  /* Ink is real SDF geometry that rides the deforming leaf surfaces, so a */
  /* turning leaf shows no doubled/stretched shell text. Without troika/   */
  /* BK.text the atlas (paper + text) is used as the fallback.            */
  /* ------------------------------------------------------------------ */
  const PAGE11_U = 56, PAGE11_V = 1;
  let page11 = null, page11Geo = null, page11Base = null, capSurface = null;
  let page11LastRelax = Number.NaN;
  {
    page11Geo = new THREE.PlaneGeometry(D.pageW, D.pageH, PAGE11_U, PAGE11_V);
    page11Geo.rotateX(-Math.PI / 2);
    page11Geo.translate(D.pageW / 2, D.yTop, 0);
    page11Base = new Float32Array(page11Geo.attributes.position.array);
    const page11UV = page11Geo.attributes.uv.array;
    for (let i = 0; i < page11Geo.attributes.uv.count; i++) {
      const mapped = pageSys.mapUV(10, page11UV[i * 2], page11UV[i * 2 + 1]);
      page11UV[i * 2] = mapped[0];
      page11UV[i * 2 + 1] = mapped[1];
    }
    page11Geo.attributes.uv.needsUpdate = true;
    page11Geo.attributes.position.setUsage(THREE.DynamicDrawUsage);
    pinDynamicBounds(page11Geo);
    page11 = new THREE.Mesh(page11Geo, matPageText);
    page11.castShadow = true;
    page11.receiveShadow = true;
    book.add(page11);
  }

  function updatePage11(relax) {
    if (!page11) return;
    const e = clamp01(relax);
    if (Math.abs(e - page11LastRelax) < 1e-5) return;
    page11LastRelax = e;
    const p = page11Geo.attributes.position.array;
    for (let i = 0; i < page11Geo.attributes.position.count; i++) {
      const o = i * 3;
      const x0 = page11Base[o];
      const u = clamp01(x0 / D.pageW);
      const d = stackDeformAt(1, u, e, 0);
      p[o] = x0 + d.dx;
      p[o + 1] = page11Base[o + 1] + d.dy;
      p[o + 2] = page11Base[o + 2];
    }
    page11Geo.attributes.position.needsUpdate = true;
    page11Geo.computeVertexNormals();
    if (capSurface) capSurface.deform((u) => stackDeformAt(1, u, e, 0));
  }

  const pageSurfaces = [];
  let pageRecords = [];
  let facingCamera = null;

  function clearPageInk() {
    for (const rec of pageRecords) {
      for (const key of ['shell0', 'shell1']) {
        const b = rec[key];
        if (b && b.group) {
          b.group.removeFromParent();
          b.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
        }
      }
    }
    pageRecords.length = 0;
    pageSurfaces.length = 0;
    capSurface = null;
  }

  function buildPageInk(pages) {
    if (!textLayer) return;
    clearPageInk();
    const runHead = meta.title || '';
    for (let i = 0; i < NLEAF; i++) {
      const lf = leaves[i];
      const surface = textLayer.pageSurface(lf);
      pageSurfaces[i] = surface;
      const common = {
        W: D.leafW, H: D.pageH, surface,
        halfThickness: D.paper * 0.5,
        inkLift: 0.0025,
        runningHead: runHead,
        logoTexture: null,
      };
      const evenPage = i * 2, oddPage = i * 2 + 1;
      const rec = { shell0: null, shell1: null };
      if (pages[evenPage]) rec.shell1 = textLayer.buildPage(lf.mesh, surface,
        { ...common, content: pages[evenPage], pageNumber: evenPage + 1, shell: 1, mirror: false });
      if (pages[oddPage]) rec.shell0 = textLayer.buildPage(lf.mesh, surface,
        { ...common, content: pages[oddPage], pageNumber: oddPage + 1, shell: 0, mirror: true });
      pageRecords.push(rec);
    }
    if (pages[10]) {
      const root0 = { x: -D.spineBulge * 0.55, y: D.yTop - 0.032 };
      capSurface = textLayer.flatSurface(D.pageW, D.pageH, root0.x, D.yTop, Math.max(PAGE11_U, 1), Math.max(PAGE11_V, 1));
      textLayer.buildPage(page11, capSurface, {
        W: D.pageW, H: D.pageH, content: pages[10], pageNumber: 11,
        shell: 0, mirror: false, gutterRight: false,
        halfThickness: 0, inkLift: 0.0025,
        runningHead: runHead,
        logoTexture: null,
      });
      page11LastRelax = Number.NaN;
      updatePage11(KIN ? KIN.relax : 0);
    }
    for (let i = 0; i < NLEAF; i++) updatePageFacing(i);
  }

  function leafInPlay(i) {
    const s = S;
    if (s.turning === i) return true;
    if (s.turned <= 0) return i === 0;
    if (s.turned >= NLEAF) return false;
    return i === s.turned || i + 1 === s.turned;
  }

  function updatePageFacing(i) {
    if (!textLayer) return;
    const cam = facingCamera;
    const rec = pageRecords[i];
    if (!rec) return;
    const lf = leaves[i];
    const mesh = lf.mesh;
    const m = mesh.matrixWorld.elements;
    const viewX = cam ? (cam.position.x - m[12]) * (m[0] * m[5] - m[1] * m[4])
      + (cam.position.y - m[13]) * (m[1] * m[15] - m[11] * m[4])
      + (cam.position.z - m[14]) * (m[11] * m[5] - m[15] * m[1]) : 0;
    const pos = viewX > 0;
    if (rec.shell1) rec.shell1.group.visible = pos && !leafInPlay(i);
    if (rec.shell0) rec.shell0.group.visible = !pos && !leafInPlay(i);
  }

  function refreshLeafText(i) {
    if (!textLayer) return;
    const rec = pageRecords[i];
    if (!rec) return;
    const lf = leaves[i];
    if (rec.shell0 && rec.shell0.group.parent === lf.mesh) rec.shell0.group.visible = lf.pos !== null;
    if (rec.shell1 && rec.shell1.group.parent === lf.mesh) rec.shell1.group.visible = lf.pos !== null;
  }

  function setFacingCamera(cam) {
    facingCamera = cam;
    for (let i = 0; i < NLEAF; i++) updatePageFacing(i);
  }

  let KIN = null;
  let restKey = null;
  let leftSup = null;
  let LOQ = false;
  let anim = null;
  let drag = null;
  let turnLandingCache = null;

  function rootFor(i) {
    const y0 = D.yTop - 0.032 - i * D.paper * 0.98;
    const q = clamp01((y0 - D.yBot) / D.blockT);
    const b = D.spineBulge * Math.sin(Math.PI * q);
    const d = stackDeformAt(q, 0, KIN ? KIN.relax : 0, 0);
    return { x: -b * 0.55 + d.dx, y: y0 + d.dy, q };
  }

  function rightLanding(r, index) {
    const y0 = D.yTop - 0.032 - index * D.paper * 0.98;
    const lift = D.paper * (NLEAF - index) * 0.58;
    const d0 = stackDeformAt(r.q, 0, KIN ? KIN.relax : 0, 0);
    const rise = D.yTop + lift - y0;
    const xy = (u) => {
      u = clamp01(u);
      const d = stackDeformAt(r.q, u, KIN ? KIN.relax : 0, 0);
      return {
        x: r.x + D.leafW * u + (d.dx - d0.dx),
        y: r.y + rise * smooth01(u / 0.085) + (d.dy - d0.dy),
      };
    };
    const angle = (u) => {
      const du = 0.001;
      const a = xy(Math.max(0, u - du));
      const b = xy(Math.min(1, u + du));
      return Math.atan2(b.y - a.y, b.x - a.x);
    };
    const phi = angle(0);
    const endRaw = angle(1);
    const end = phi + Math.atan2(Math.sin(endRaw - phi), Math.cos(endRaw - phi));
    return { phi, A: end - phi, angle, xy };
  }

  function leftLanding(r, rank) {
    const k = KIN;
    const pts = k.pts;
    const n = pts.length;
    const caseT = 0.085;
    const clearance = 0.034 + Math.max(0, rank - 0.5) * D.paper * 1.1;
    const rail = [];
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const th = i === n - 1 ? k.boardDir : p.th;
      const nx = Math.sin(th);
      const ny = -Math.cos(th);
      rail.push({ x: p.x + nx * (caseT + clearance), y: p.y + ny * (caseT + clearance) });
    }
    const c = Math.cos(k.boardDir);
    const sn = Math.sin(k.boardDir);
    const nx = sn;
    const ny = -c;
    const boardOff = D.boardT + 0.07 + Math.max(0, rank - 0.5) * D.paper * 1.08;
    const boardStart = {
      x: k.frontBoard.x + nx * boardOff,
      y: k.frontBoard.y + ny * boardOff,
    };
    const spineStart = 7;
    const spineEnd = n - 7;
    let first = spineStart;
    while (first < spineEnd && rail[first].y < r.y + 0.018) first++;
    const join = Math.min(spineEnd, first + 2);
    const raw = [];
    const p0 = { x: r.x, y: r.y };
    const p3 = rail[join];
    const dist = Math.hypot(p3.x - p0.x, p3.y - p0.y);
    const startTh = pts[first].th;
    const endTh = pts[join].th;
    const clen = Math.max(0.05, Math.min(0.18, dist * 0.8));
    const p1 = { x: p0.x + Math.cos(startTh) * clen, y: p0.y + Math.sin(startTh) * clen };
    const p2 = { x: p3.x - Math.cos(endTh) * clen, y: p3.y - Math.sin(endTh) * clen };
    const cubic = (a, b, c0, d, t) => {
      const m = 1 - t;
      return {
        x: m * m * m * a.x + 3 * m * m * t * b.x + 3 * m * t * t * c0.x + t * t * t * d.x,
        y: m * m * m * a.y + 3 * m * m * t * b.y + 3 * m * t * t * c0.y + t * t * t * d.y,
      };
    };
    for (let j = 0; j < 24; j++) raw.push(cubic(p0, p1, p2, p3, j / 23));
    const rampStart = Math.max(join + 1, Math.min(n - 2, 51));
    for (let i = join + 1; i <= rampStart; i++) raw.push(rail[i]);
    const q0 = raw[raw.length - 1];
    const q3 = { x: boardStart.x + c * 0.45, y: boardStart.y + sn * 0.45 };
    const rampTh = pts[rampStart].th;
    const q1 = { x: q0.x + Math.cos(rampTh) * 0.3, y: q0.y + Math.sin(rampTh) * 0.3 };
    const q2 = { x: q3.x - c * 0.35, y: q3.y - sn * 0.35 };
    for (let j = 1; j < 24; j++) raw.push(cubic(q0, q1, q2, q3, j / 23));
    raw.push({ x: q3.x + c * (D.leafW + 1), y: q3.y + sn * (D.leafW + 1) });
    const cum = [0];
    for (let i = 1; i < raw.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y));
    }
    const pointAt = (s) => {
      if (s <= 0) return raw[0];
      if (s >= cum[cum.length - 1]) return raw[raw.length - 1];
      let lo = 0;
      let hi = cum.length - 1;
      while (lo + 1 < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] <= s) lo = mid;
        else hi = mid;
      }
      const den = cum[lo + 1] - cum[lo] || 1;
      const t = (s - cum[lo]) / den;
      return {
        x: raw[lo].x + (raw[lo + 1].x - raw[lo].x) * t,
        y: raw[lo].y + (raw[lo + 1].y - raw[lo].y) * t,
      };
    };
    const angle = (u) => {
      const s0 = clamp01(u) * D.leafW;
      const eps = 0.075;
      const a = pointAt(Math.max(0, s0 - eps));
      const b = pointAt(Math.min(cum[cum.length - 1], s0 + eps));
      return Math.atan2(b.y - a.y, b.x - a.x);
    };
    const phi = angle(0);
    const endRaw = angle(1);
    const end = phi + Math.atan2(Math.sin(endRaw - phi), Math.cos(endRaw - phi));
    return { phi, A: end - phi, angle, xy: (u) => pointAt(clamp01(u) * D.leafW) };
  }

  function sampleLandingAngles(landing) {
    const out = new Float32Array(NU + 1);
    out[0] = landing.angle(0);
    for (let i = 1; i <= NU; i++) out[i] = landing.angle((i - 0.5) / NU);
    return out;
  }

  function turnLandings(r, idx) {
    const relax = KIN ? KIN.relax : 0;
    const boardDir = KIN ? KIN.boardDir : 0;
    const key = `${idx}|${r.x.toFixed(6)}|${r.y.toFixed(6)}|${relax.toFixed(6)}|${boardDir.toFixed(6)}`;
    if (turnLandingCache && turnLandingCache.key === key) return turnLandingCache;
    const right = rightLanding(r, idx);
    const left = leftLanding(r, idx + 1);
    turnLandingCache = {
      key,
      right,
      left,
      rightAngles: sampleLandingAngles(right),
      leftAngles: sampleLandingAngles(left),
    };
    return turnLandingCache;
  }

  function restRight(r, index) {
    const a = rightLanding(r, index);
    return {
      rootX: r.x,
      rootY: r.y,
      phi: a.phi,
      A: a.A,
      kExp: 1.1,
      targetAngle: a.angle,
      targetBlend: 1,
      cone: 0,
      twist: 0,
      skew: 0,
      phiSkew: 0,
      ripple: 0,
      gravity: 0,
      stiffRoot: 1,
      stiffTip: 1,
      supports: null,
      iters: 0,
      smooth: 0,
      lateralStiffness: 0.3,
      fastRest: true,
      skin: D.paper * 0.6,
    };
  }

  function restLeft(r, rank) {
    const a = leftLanding(r, rank);
    return {
      rootX: r.x,
      rootY: r.y,
      phi: a.phi,
      A: a.A,
      kExp: 1.18,
      targetAngle: a.angle,
      targetBlend: 1,
      cone: 0,
      twist: 0,
      skew: 0,
      phiSkew: 0,
      ripple: 0,
      gravity: 0,
      stiffRoot: 1,
      stiffTip: 1,
      supports: null,
      iters: 0,
      smooth: 0,
      lateralStiffness: 0.3,
      fastRest: true,
      skin: D.paper * 0.6,
    };
  }

  function turning(r, t, sups, idx, apeak, grab = {}) {
    const pair = turnLandings(r, idx);
    const right = pair.right;
    const left = pair.left;
    const cfg = {
      phi0: right.phi,
      phi1: left.phi,
      A0: right.A,
      A1: left.A,
      Apeak: apeak === undefined ? 1.84 : apeak,
    };
    const gu = clamp01(grab.u === undefined ? 0.94 : grab.u);
    const gv = Math.max(-1, Math.min(1, grab.v === undefined ? -0.58 : grab.v));
    const active = grab.active === undefined ? 1 : clamp01(grab.active);
    const leverage = 0.42 + 0.58 * smooth01((gu - 0.18) / 0.82);
    const edgeGrab = smooth01((Math.abs(gv) - 0.15) / 0.85);
    const sigmaW = 0.7 - 0.1 * edgeGrab + 0.025 * (1 - leverage);
    const affinityAt = (w) => Math.exp(-0.5 * Math.pow((w - gv) / sigmaW, 2));
    const localTime = (w) => {
      const flight = Math.pow(Math.sin(Math.PI * clamp01(t)), 0.9);
      const landingUnity = 1 - PG.ease(clamp01((t - 0.68) / 0.24));
      const phase = active * leverage * 0.043 * flight * landingUnity * affinityAt(w);
      return clamp01(t + phase);
    };
    const makeColumnState = (tt, w, out = {}) => {
      const q = PG.turnState(tt, cfg, out);
      const affinity = affinityAt(w);
      const rollAir =
        Math.pow(Math.sin(Math.PI * clamp01(tt)), 1.1) * (1 - PG.ease(clamp01((tt - 0.57) / 0.24)));
      q.A += active * leverage * affinity * 0.026 * rollAir;
      q.targetAngle = null;
      q.targetBlend = 0;
      q.fastTarget = true;
      q.fastT = tt;
      q.fastGrabU = gu;
      q.fastActive = active;
      q.fastLeverage = leverage;
      q.fastRightAngles = pair.rightAngles;
      q.fastLeftAngles = pair.leftAngles;
      q.rippleP = idx * 2.1 + tt * 5.0;
      q.rootX = r.x;
      q.rootY = r.y;
      q.supports = tt < 0.55 ? null : sups;
      q.iters = LOQ ? 8 : 14;
      q.constraintPasses = 2;
      q.fastNoContact = true;
      q.smooth = LOQ ? 2 : 3;
      q.lateralStiffness = 0.56;
      q.skin = D.paper * 0.6;
      return q;
    };
    const st = makeColumnState(t, gv, {});
    st.columnState = (w, out) => makeColumnState(localTime(w), w, out);
    return st;
  }

  function updateBook() {
    const alpha = S.cover * S.coverOpen;
    const kin = updateSpineDynamic(THREE, G, D, spineGeo, spineArtGeo, spineArtPos, alpha, S.coverOpen);
    const caseChanged = kin !== KIN;
    KIN = kin;
    updateStack(kin.relax);
    updateHeadbands(kin.relax);
    updatePage11(kin.relax);

    if (caseChanged) {
      frontBoardPivot.position.set(kin.frontBoard.x, kin.frontBoard.y, 0);
      frontBoardPivot.rotation.z = kin.boardDir;
      frontPaste.position.set(D.boardW / 2, D.boardT + 0.003, 0);
      backPaste.position.set(D.boardW / 2 + D.jointX + D.grooveW, D.boardT + 0.003, 0);
      backArt.position.x = D.boardW / 2 + D.jointX + D.grooveW;
      backBoard.position.set(D.jointX + D.grooveW, 0, 0);
    }

    const key = `${S.cover.toFixed(4)}|${S.turned}|${S.turning >= 0 ? 1 : 0}|${LOQ ? 1 : 0}`;
    if (key !== restKey) {
      restKey = key;
      const c = Math.cos(kin.boardDir);
      const s = Math.sin(kin.boardDir);
      const off = D.boardT + 0.036;
      const ix = kin.frontBoard.x + s * off;
      const iy = kin.frontBoard.y - c * off;
      leftSup = [
        PG.makeSupport(
          [
            { x: ix - c * 1.2, y: iy - s * 1.2 },
            { x: ix + c * D.boardW, y: iy + s * D.boardW },
          ],
          -1,
        ),
        PG.makeSupport(
          [
            { x: -80, y: D.boardT + 0.03 },
            { x: 80, y: D.boardT + 0.03 },
          ],
          1,
        ),
      ];
      for (let i = 0; i < NLEAF; i++) {
        if (i < S.turned) {
          leaves[i].update(restLeft(rootFor(i), i + 1));
          leftSup.push(PG.makeSupport(leaves[i].centreLine(10), 1));
        } else if (i !== S.turning) {
          const rank = i - Math.max(S.turned, S.turning + 1);
          leaves[i].update(restRight(rootFor(i), i, rank));
        }
        refreshLeafText(i);
      }
    }
    if (S.turning >= 0) {
      leaves[S.turning].update(
        turning(rootFor(S.turning), S.t, leftSup, S.turning, undefined, {
          u: S.grabU,
          v: S.grabV,
          active: S.grabActive,
        }),
      );
      refreshLeafText(S.turning);
    }
  }

  // Initial closed pose
  updateBook();
  buildPageInk(pages);

  function setCover(t) {
    anim = null;
    S.cover = clamp01(t);
    if (S.cover < 0.001) {
      S.turned = 0;
      S.turning = -1;
      S.t = 0;
    }
    restKey = null;
    updateBook();
  }

  function openCover(open) {
    const to = typeof open === 'number' ? clamp01(open) : open ? 1 : 0;
    const from = S.cover;
    if (Math.abs(from - to) < 1e-4) return Promise.resolve(S.cover);
    return new Promise((resolve) => {
      anim = {
        t0: performance.now(),
        dur: 900,
        ease: settle,
        apply: (e) => {
          S.cover = from + (to - from) * e;
        },
        onDone: () => {
          S.cover = to;
          LOQ = false;
          restKey = null;
          updateBook();
          resolve(S.cover);
        },
      };
      LOQ = true;
    });
  }

  function turnTo(n) {
    const target = Math.max(0, Math.min(NLEAF, n | 0));
    if (target === S.turned && S.turning < 0 && !anim) return Promise.resolve(S.turned);

    const stepOnce = () =>
      new Promise((resolve) => {
        if (S.cover < 0.999) {
          openCover(true).then(() => resolve(stepOnce()));
          return;
        }
        if (target === S.turned) {
          resolve(S.turned);
          return;
        }
        const forward = target > S.turned;
        if (forward) {
          S.grabU = 0.94;
          S.grabV = -0.58;
          S.grabActive = 1;
          S.turning = S.turned;
          S.t = 0;
          anim = {
            t0: performance.now(),
            dur: 1550,
            ease: pageEase,
            apply: (e) => {
              S.t = e;
            },
            onDone: () => {
              S.turned++;
              S.turning = -1;
              LOQ = false;
              restKey = null;
              updateBook();
              resolve(S.turned);
            },
          };
        } else {
          const i = S.turned - 1;
          S.grabU = 0.94;
          S.grabV = 0.58;
          S.grabActive = 1;
          S.turned--;
          S.turning = i;
          S.t = 1;
          anim = {
            t0: performance.now(),
            dur: 1550,
            ease: pageEase,
            apply: (e) => {
              S.t = 1 - e;
            },
            onDone: () => {
              S.turning = -1;
              LOQ = false;
              restKey = null;
              updateBook();
              resolve(S.turned);
            },
          };
        }
        LOQ = true;
      });

    const run = async () => {
      while (S.turned !== target) {
        if (anim || S.turning >= 0) {
          await new Promise((r) => setTimeout(r, 40));
          continue;
        }
        await stepOnce();
      }
      return S.turned;
    };
    return run();
  }

  function beginDrag(hit) {
    if (!hit || S.cover < 0.99 || anim || S.turning >= 0) return false;
    drag = { ...hit };
    S.grabU = hit.u;
    S.grabV = hit.w;
    S.grabActive = 1;
    S.turning = hit.i;
    S.t = hit.dir > 0 ? 0 : 1;
    if (hit.dir < 0) S.turned = hit.i;
    LOQ = true;
    restKey = null;
    updateBook();
    return true;
  }

  function updateDrag(t) {
    if (!drag) return;
    S.t = clamp01(t);
    updateBook();
  }

  function endDrag(commit) {
    if (!drag) return;
    const d = drag;
    const from = S.t;
    drag = null;
    let to;
    if (commit === false) to = d.dir > 0 ? 0 : 1;
    else if (d.dir > 0) to = from > 0.34 ? 1 : 0;
    else to = from < 0.66 ? 0 : 1;
    anim = {
      t0: performance.now(),
      dur: 300 + 760 * Math.abs(to - from),
      ease: pageEase,
      apply: (e2) => {
        S.t = from + (to - from) * e2;
      },
      onDone: () => {
        S.turned = to >= 0.5 ? d.i + 1 : d.i;
        S.turning = -1;
        LOQ = false;
        restKey = null;
        updateBook();
      },
    };
  }

  function update(_dt) {
    const now = performance.now();
    if (anim) {
      const k = Math.min(1, (now - anim.t0) / anim.dur);
      anim.apply((anim.ease || settle)(k));
      updateBook();
      if (k >= 1) {
        const done = anim.onDone;
        anim = null;
        if (done) done();
      }
      return true;
    }
    return false;
  }

  function setContent(next) {
    if (!next) return;
    if (next.title != null) meta.title = next.title;
    if (next.subtitle != null) meta.subtitle = next.subtitle;
    if (next.author != null) meta.author = next.author;
    if (next.promise != null) meta.promise = next.promise;
    if (next.pages) meta.pages = next.pages;
    const pages2 = meta.pages || placeholderPages(meta.title, meta.promise);
    const oldTex = pageSys.texture;
    pageSys = makePageAtlas(THREE, pages2, shared.textures.paperColor, !!textLayer);
    matPageText.map = pageSys.texture;
    matPageText.needsUpdate = true;
    oldTex.dispose();
    for (let i = 0; i < NLEAF; i++) mapLeafShellToAtlas(leaves[i], i * 2 + 1, i * 2);
    buildPageInk(pages2);
  }

  async function rebind(next) {
    if (!next) return;
    Object.assign(meta, next);
    if (next.caseColor) {
      matCase.color.set(next.caseColor);
      matCaseSpine.color.set(next.caseColor);
      backMat.color.set(next.caseColor);
    }
    if (next.coverUrl) {
      const tex = await loadCoverTexture(THREE, next.coverUrl);
      const old = matFrontArt.map;
      matFrontArt.map = tex;
      tex.channel = 0;
      fitCover(tex, (D.boardW - ART_BORDER_FRONT * 2) / (D.boardH - ART_BORDER_FRONT * 2));
      matFrontArt.needsUpdate = true;
      if (old) old.dispose();
      coverTex = tex;
    }
    const ink2 = inkForLuminance(meta.caseLuminance, meta.overlayInk);
    if (troikaTitleTexts) {
      // Troika titles are live polygon meshes — just re-set their strings.
      const seq = [[meta.title, false]];
      if (meta.subtitle) seq.push([meta.subtitle, false]);
      if (meta.author) seq.push([String(meta.author).toUpperCase(), false]);
      seq.push(['BELIEF CHANGER', false]);
      troikaTitleTexts.forEach((t, i) => {
        if (seq[i]) { t.text = seq[i][0]; t.color = ink2; }
      });
    } else if (matTitle) {
      const nt = bakeFrontTitle(THREE, {
        title: meta.title,
        subtitle: meta.subtitle,
        author: meta.author,
        ink: ink2,
        caseLum: meta.caseLuminance,
      });
      const oldT = matTitle.map;
      matTitle.map = nt;
      matTitle.needsUpdate = true;
      if (oldT) oldT.dispose();
      titleTex = nt;
    }

    const st = bakeSpineTitle(THREE, {
      title: meta.title,
      ink: ink2,
      caseLum: meta.caseLuminance,
    });
    const oldS = matSpineArt.map;
    matSpineArt.map = st;
    st.channel = 1;
    matSpineArt.needsUpdate = true;
    if (oldS) oldS.dispose();
    spineTitleTex = st;

    setContent(next);
    setCover(0);
  }

  function dispose() {
    root.removeFromParent();
    anim = null;
    stackGeo.dispose();
    spineGeo.dispose();
    spineArtGeo.dispose();
    frontArt.geometry.dispose();
    titleOverlay.geometry.dispose();
    backArt.geometry.dispose();
    for (const lf of leaves) lf.geo.dispose();
    for (const m of headbandMeshes) m.geometry.dispose();
    if (page11Geo) page11Geo.dispose();
    clearPageInk();
    matCase.dispose();
    matCaseSpine.dispose();
    matFrontArt.dispose();
    matTitle.dispose();
    matSpineArt.dispose();
    matPageText.dispose();
    backMat.dispose();
    if (coverTex) coverTex.dispose();
    titleTex.dispose();
    spineTitleTex.dispose();
    pageSys.texture.dispose();
  }

  // Leaves + open page block for page-turn hits; boards/cover for cover drag.
  const leafMeshes = leaves.map((l) => l.mesh);
  const hitMeshes = [frontBoard, backBoard, spineMesh, frontArt, stack, ...leafMeshes];

  function synthesizeLeaf(dir, u = 0.85, w = 0) {
    if (dir > 0) {
      if (S.turned >= NLEAF) return null;
      return { dir: 1, i: S.turned, u: clamp01(u), w, shell: 'front' };
    }
    if (S.turned <= 0) return null;
    const i = S.turned - 1;
    return { dir: -1, i, u: clamp01(u), w, shell: 'back' };
  }

  function leafFromHit(h) {
    if (!h || !h.object) return null;
    const index = h.object.userData.leafIndex;
    if (index == null) return null;
    const shell = (h.faceIndex ?? 0) < h.object.userData.frontTriangleCount ? 'front' : 'back';
    const dir = index === S.turned ? 1 : -1;
    if (dir > 0 && (index !== S.turned || index >= NLEAF)) return null;
    if (dir < 0 && index !== S.turned - 1) return null;
    const atlasUV = h.uv || { x: 0.94, y: 0.5 };
    const pageIndex = index * 2 + (shell === 'back' ? 0 : 1);
    const uv = pageSys.unmapUV(pageIndex, atlasUV.x, atlasUV.y);
    // Atlas mapped with (1 − nativeU); recover grab u along spine→fore-edge.
    const u = clamp01(shell === 'back' ? uv.x : 1 - uv.x);
    if (u < 0.08) return null;
    const w = Math.max(-1, Math.min(1, 1 - 2 * uv.y));
    return { dir, i: index, u, w, shell };
  }

  /** Gold-style pick: top right / top left leaves, with synthesize fallbacks. */
  function pickLeaf(raycaster) {
    if (S.cover < 0.99 || anim || S.turning >= 0) return null;
    for (const m of leafMeshes) m.updateMatrixWorld(true);
    stack.updateMatrixWorld(true);

    const candidates = [];
    if (S.turned < NLEAF) candidates.push(leaves[S.turned].mesh);
    if (S.turned > 0) candidates.push(leaves[S.turned - 1].mesh);
    if (candidates.length) {
      const hits = raycaster.intersectObjects(candidates, false);
      if (hits.length) {
        const precise = leafFromHit(hits[0]);
        if (precise) return precise;
        const idx = hits[0].object.userData.leafIndex;
        if (idx === S.turned) return synthesizeLeaf(1);
        if (idx === S.turned - 1) return synthesizeLeaf(-1);
      }
    }

    // Any leaf mesh (not only top) → active top leaf for that stack side.
    const anyLeaf = raycaster.intersectObjects(leafMeshes, false);
    if (anyLeaf.length) {
      const idx = anyLeaf[0].object.userData.leafIndex;
      if (idx != null) {
        if (idx >= S.turned) return synthesizeLeaf(1);
        return synthesizeLeaf(-1);
      }
    }

    // Open page block under the leaves.
    const blockHits = raycaster.intersectObjects([stack], false);
    if (blockHits.length) {
      const pt = blockHits[0].point.clone();
      book.worldToLocal(pt);
      // +X = right (fore-edge) stack; −X / near spine → left if pages turned.
      if (pt.x >= D.pageW * 0.12) return synthesizeLeaf(1);
      if (S.turned > 0) return synthesizeLeaf(-1);
      return synthesizeLeaf(1);
    }
    return null;
  }

  function isPageHit(obj) {
    if (!obj) return false;
    if (obj.userData && (obj.userData.leafIndex != null || obj.userData.pageBlock)) return true;
    return false;
  }

  // The reader lives outside the ring's baked shadow frustum; sampling that
  // map from here only adds stale streaks, never real shading.
  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = false;
      o.receiveShadow = false;
    }
  });

  return {
    group: root,
    hitMeshes,
    openCover,
    setCover,
    turnTo,
    beginDrag,
    updateDrag,
    endDrag,
    update,
    setContent,
    rebind,
    dispose,
    getState: () => ({ ...S }),
    userData: meta,
    leafFromHit,
    pickLeaf,
    synthesizeLeaf,
    isPageHit,
    updateFacing: setFacingCamera,
  };
}
