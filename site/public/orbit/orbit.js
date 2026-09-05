import * as THREE from 'three';
import { createAtmosphere } from './atmosphere.js';
import { orbitLabels } from './locale.js';
import { instanceRing } from './instance-ring.js';
import { createBookShadows } from './shadows.js';
import { dampedStep, pixelDelta, shortestDelta, buildRingOrder } from './motion.js';
import {
  configureRenderer,
  createStudioLights,
  createSharedResources,
  createClosedBook,
  createReaderBook,
  settle,
} from './book-engine.js';

/* ------------------------------------------------------------------ const */

const N = matchMedia('(max-width: 720px)').matches ? 56 : 80;
const RING_R = 94;
const RING_TILT = THREE.MathUtils.degToRad(11);
const PRESENT_OUT = 36;
const PRESENT_LIFT = 3.8; // presented slot hovers slightly above the ring plane
const BOOK_SCALE = 1.0;
const SPIN_DUR = 560;
const FLIP_DUR = 300;
const PULL_DUR = 700;
const RETURN_DUR = 760;
const HOVER_LIFT = 2.2;
const IDLE_MS = 10000;
/* Wheel: idle gesture → exactly 1 book. Scroll while busy → ring-only multi. */
const GESTURE_MS = 100;        // coalesce one trackpad flick into one commit
const BURST_SLOT_DIV = 200;    // deltaY per extra ring slot while mid-browse
const BURST_MAX = 8;
const QUEUE_MAX = 1;           // never stack flip animations from scroll
const BOOT_BATCH = 4;
const BOOT_REVEAL_AT = 10;

/* Orbit framing is computed, not hand-placed: the FAR arc of the ring stays in
   frame at any aspect while the near arc sweeps past the frame edges — the
   circle reads large and the presented cover sits close, lower-center. */
const CAM_ELEV = THREE.MathUtils.degToRad(12);   // camera elevation above the ring plane
const CAM_FILL = 0.82;                          // fraction of each frustum axis the ring may fill
const BOUND_FAR_COS = 0.15;                     // slots with cos(phi) <= this bound the fit
const CAM_ORBIT = {
  pos: new THREE.Vector3(0, 36, 148),
  /* look.y sits below the ring center: the near rim dips RING_TILT·RING_R
     below y=0, and the presented front book must stay fully in frame. */
  look: new THREE.Vector3(0, -5, 0),
  fov: 32,
};
const CAM_INSPECT = {
  pos: new THREE.Vector3(0, 26, 201),
  look: new THREE.Vector3(0, 18, 100),
  fov: 34,
};
const CAM_INSPECT_CLOSE = {
  pos: new THREE.Vector3(0, 21, 141),
  look: new THREE.Vector3(0, 18, 101),
  fov: 30,
};
const RING_Y_ORBIT = 6;
const RING_Y_INSPECT = 59;
const RING_SCALE_INSPECT = 0.72;
const RING_Z_INSPECT = -50;
const ringInspectX = () => camera.aspect < .8 ? 24 : 54;
const RING_TILT_INSPECT = -.42;
const ringInspectScale = () => camera.aspect < .8 ? .42 : RING_SCALE_INSPECT;
const ringInspectY = () => camera.aspect < .8 ? 48 : RING_Y_INSPECT;

/* Inspect rig: the pulled-out book sits centered on the camera axis at every
   aspect (owner: "the book I selected more in center of the screen"). The
   shift rig stays so narrow aspects could re-aim if ever needed. */
const INSPECT_BOOK_X = 0;
const INSPECT_BOOK_X_NARROW = 0;
/* The open cover swings left of the spine, so an open spread reads left-heavy.
   Glide the held book right in proportion to cover-open so the OPEN spread is
   centered too (closed book stays dead center). */
const INSPECT_OPEN_SHIFT = 12;
let inspectBookX = INSPECT_BOOK_X;
function applyInspectShift() {
  const t = clamp01((1.25 - camera.aspect) / 0.45);
  inspectBookX = lerp(INSPECT_BOOK_X, INSPECT_BOOK_X_NARROW, t);
  CAM_INSPECT.pos.x = lerp(0, inspectBookX, t);
  CAM_INSPECT.look.x = lerp(0, inspectBookX, t);
  CAM_INSPECT_CLOSE.pos.x = lerp(0, inspectBookX, t);
  CAM_INSPECT_CLOSE.look.x = lerp(0, inspectBookX, t);
  // Reserve the lower portrait region for the compact information panel.
  CAM_INSPECT.pos.z = lerp(201, 230, t);
  CAM_INSPECT_CLOSE.pos.z = lerp(141, 143, t);
  CAM_INSPECT.look.y = lerp(18, 5, t);
  CAM_INSPECT_CLOSE.look.y = lerp(18, 6, t);
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Boot instrumentation (QA): phase timestamps from module start. */
const BOOT_T0 = performance.now();
window.__orbitPerf = { t0: BOOT_T0, books: [] };

const params = new URLSearchParams(location.search);
const EMBED = params.get('embed') === '1';
const LOCALE = (params.get('locale') || 'en').replace(/[^a-z-]/gi, '') || 'en';
if (EMBED) document.documentElement.classList.add('embed');
const labels = orbitLabels(LOCALE);
const heroCopy = {
  en: ['A little clarity.', 'A different life.', 'Free books for the beliefs that hold you back.'],
  da: ['Lidt mere klarhed.', 'Et anderledes liv.', 'Gratis bøger om de overbevisninger, der holder dig tilbage.'],
  ar: ['قليل من الوضوح.', 'حياة مختلفة.', 'كتب مجانية عن المعتقدات التي تعيقك.'],
}[LOCALE] || ['A little clarity.', 'A different life.', 'Free books for the beliefs that hold you back.'];
document.querySelector('#hero-heading .first').textContent = heroCopy[0];
document.querySelector('#hero-heading .second').textContent = heroCopy[1];
document.getElementById('hero-subtitle').textContent = heroCopy[2];
document.documentElement.lang = LOCALE;

/* Embed wheel-trap fix: the parent (ShelfStage) reports how much of the hero
   iframe is on screen. Mostly out of view → release the wheel so the page
   scrolls, and pause idle auto-advance. */
let heroVisible = true;
window.addEventListener('message', (event) => {
  if (event.origin !== location.origin) return;
  const d = event.data;
  if (d && typeof d === 'object' && d.type === 'orbit-hero-visibility') {
    const v = !!d.visible;
    if (v !== heroVisible) {
      heroVisible = v;
      invalidate();
    }
  }
});


const stage = document.getElementById('stage');
const bootEl = document.getElementById('boot');
const liveEl = document.getElementById('live');
const panelEl = document.getElementById('panel');
const panelTitle = document.getElementById('panel-title');
const panelPromise = document.getElementById('panel-promise');
const panelMeta = document.getElementById('panel-meta');
const panelRead = document.getElementById('panel-read');
const panelBack = document.getElementById('panel-back');
const navPrev = document.getElementById('nav-prev');
const navNext = document.getElementById('nav-next');
const scrollDown = document.getElementById('scroll-down');
const caption = document.getElementById('caption');
const captionTitle = document.getElementById('caption-title');
const captionMeta = document.getElementById('caption-meta');
const openButton = document.getElementById('open-book');
const readerTools = document.getElementById('reader-tools');
const previewEnd = document.createElement('a'); previewEnd.id='preview-end'; previewEnd.hidden=true; readerTools.append(previewEnd);
let previewContent={}; let linkPress=null;
const coverButton = document.getElementById('toggle-cover');
const autoButton = document.getElementById('auto-browse');

for (const [id, key] of Object.entries({ 'open-book':'explore', 'auto-browse':'auto', 'toggle-cover':'open', 'reset-book':'reset', 'panel-read':'read', 'panel-back':'back' })) document.getElementById(id).textContent = labels[key];
for (const [id, key] of Object.entries({ 'nav-prev':'previous', 'nav-next':'next', 'page-prev':'previousPage', 'page-next':'nextPage', 'scroll-down':'below', 'reader-tools':'controls' })) document.getElementById(id).setAttribute('aria-label', labels[key]);
let autoBrowse = false;
let captionKey = '';
let readerToolsKey = '';
function updateCaption() {
  const meta = currentMeta();
  const key = `${frontIndex}|${state}|${bootReady}`;
  if (key === captionKey) return;
  captionKey = key;
  caption.hidden = !bootReady || !['orbit', 'presenting'].includes(state);
  captionTitle.textContent = meta?.title || '';
  captionMeta.textContent = `${String(frontIndex + 1).padStart(2, '0')} / ${N} · ${labels.hint}`;
  openButton.disabled = state !== 'orbit';
}
function updateReaderTools() {
  const held = reader && reader.group.visible && ['inspecting', 'reading'].includes(state);
  readerTools.hidden = !held;
  if (!held) { document.documentElement.classList.remove('is-reading'); return; }
  const st = reader.getState();
  previewEnd.hidden=st.cover<.99 || st.turned!==5 || st.turning>=0;
  const key = `${st.cover > 0.5}|${st.cover >= 0.99}|${st.turned}|${st.turning}`;
  document.documentElement.classList.toggle('is-reading', st.cover > 0.08);
  if (key === readerToolsKey) return;
  readerToolsKey = key;
  coverButton.textContent = st.cover > 0.5 ? labels.close : labels.open;
  document.getElementById('page-prev').disabled = st.cover < 0.99 || st.turned === 0 || st.turning >= 0;
  document.getElementById('page-next').disabled = st.cover < 0.99 || st.turned === 5 || st.turning >= 0;
}
openButton.addEventListener('click', () => openFront());
autoButton.addEventListener('click', () => {
  autoBrowse = !autoBrowse && !reducedMotion;
  autoButton.setAttribute('aria-pressed', String(autoBrowse));
  autoButton.textContent = autoBrowse ? labels.pause : labels.auto;
  noteInteract(); invalidate();
});
coverButton.addEventListener('click', () => { noteInteract(); reader?.openCover(reader.getState().cover < 0.5); invalidate(); });
for (const [id, direction] of [['page-prev', -1], ['page-next', 1]]) {
  document.getElementById(id).addEventListener('click', () => { noteInteract(); reader?.turnTo(reader.getState().turned + direction); invalidate(); });
}
document.getElementById('reset-book').addEventListener('click', resetSpinPose);
if (/^(ar|he|fa|ur)/i.test(LOCALE)) document.documentElement.dir = 'rtl';

function announce(msg) {
  liveEl.textContent = '';
  requestAnimationFrame(() => { liveEl.textContent = msg; });
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function mod(i, n) { return ((i % n) + n) % n; }

/* ------------------------------------------------------------------ renderer */

const canvas = document.createElement('canvas');
canvas.setAttribute('aria-label', 'Interactive ring of hardcover books. Use arrow keys to browse, Enter to open the front book, Escape to return.');
canvas.setAttribute('role', 'group');
canvas.tabIndex = 0;
stage.insertBefore(canvas, bootEl.nextSibling);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: true });
configureRenderer(renderer, THREE);
renderer.setClearColor(0x000000, 0);
let contextLost = false;
canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault(); contextLost = true;
  parent.postMessage({ type: 'orbit-context-lost' }, location.origin);
});
canvas.addEventListener('webglcontextrestored', () => {
  contextLost = false; applyTheme(); invalidate();
  parent.postMessage({ type: 'orbit-ready' }, location.origin);
});

const scene = new THREE.Scene();
scene.background = null;
// Depth cue, themed by applyTheme(): in light mode it stays beyond the ring
// (the void reads pure white); in dark mode it pulls the far side into night.
scene.fog = new THREE.Fog(0xe5e1d8, 1000, 2000);

const camera = new THREE.PerspectiveCamera(CAM_ORBIT.fov, 1, 2, 800);
const camLook = CAM_ORBIT.look.clone();
camera.position.copy(CAM_ORBIT.pos);
camera.lookAt(camLook);

const ringCenter = new THREE.Vector3(0, RING_Y_ORBIT, 0);
const studio = createStudioLights(THREE, scene, ringCenter, renderer);
const atmosphere = createAtmosphere(THREE, renderer, scene, camera);
const focusPoint = new THREE.Vector3();

const ringGroup = new THREE.Group();
ringGroup.position.set(0, RING_Y_ORBIT, 0);
ringGroup.rotation.x = RING_TILT;
scene.add(ringGroup);

/* Grounding: a faint radial-shadow pool just below the standing books' bases.
   One textured plane, no shadow-map cost; parented to ringGroup so the inspect
   framing (scale/lift/recede) carries it along automatically. */
const contactShadow = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 24, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0,0,0,0.19)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.12)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(RING_R * 3.1, RING_R * 3.1),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      depthWrite: false,
      opacity: 0.20,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -BOOK_SCALE * 11.3;
  mesh.renderOrder = -1;
  return mesh;
})();
ringGroup.add(contactShadow);
const grounding = createBookShadows(THREE, scene, ringGroup, N);

const detailRoot = new THREE.Group();
scene.add(detailRoot);
const detailSpin = new THREE.Group();
detailRoot.add(detailSpin);

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const _v = new THREE.Vector3();

/* Canonical world bounds of the composition: the FAR arc of the ring (slots
   with cos(phi) <= BOUND_FAR_COS) plus the front slot presented (present=1).
   The near arc intentionally overflows the frame edges — the circle reads
   large and the camera sits close to the presented book. Derived analytically
   from the first mounted book's real host-local bbox, so the camera fit is
   exact before every slot exists — the presented book must never clip. */
let orbitBounds = null;
let bookLocalBox = null; // Box3 of a closed book in its host's local space

function measureBookLocalBox(slot) {
  if (bookLocalBox || !slot?.host) return;
  slot.host.updateMatrixWorld(true);
  const world = new THREE.Box3().setFromObject(slot.closed.group);
  if (world.isEmpty()) return;
  const inv = slot.host.matrixWorld.clone().invert();
  bookLocalBox = world.clone().applyMatrix4(inv);
}

let orbitFitCorners = null; // real per-slot world corners (an AABB would invent phantom corners)

function analyticOrbitBounds() {
  if (!bookLocalBox) return null;
  const box = new THREE.Box3();
  const corners = [];
  const mRing = new THREE.Matrix4().compose(
    new THREE.Vector3(0, RING_Y_ORBIT, 0),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(RING_TILT, 0, 0)),
    new THREE.Vector3(1, 1, 1),
  );
  const mLocal = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const s = new THREE.Vector3(BOOK_SCALE, BOOK_SCALE, BOOK_SCALE);
  const pos = new THREE.Vector3();
  const corner = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    const present = i === 0 ? 1 : 0;
    const phi = phiOf(i, 0);
    if (present === 0 && Math.cos(phi) > BOUND_FAR_COS) continue; // near arc overflows on purpose
    const radial = RING_R + present * PRESENT_OUT;
    pos.set(radial * Math.sin(phi), present * PRESENT_LIFT, radial * Math.cos(phi));
    e.set(-.30 * present, yawAt(phi, present), 0, 'YXZ');
    q.setFromEuler(e);
    s.setScalar(BOOK_SCALE * (1 + present * .25));
    mLocal.compose(pos, q, s);
    const mWorld = _abM.multiplyMatrices(mRing, mLocal);
    for (const x of [bookLocalBox.min.x, bookLocalBox.max.x])
      for (const y of [bookLocalBox.min.y, bookLocalBox.max.y])
        for (const z of [bookLocalBox.min.z, bookLocalBox.max.z]) {
          corner.set(x, y, z).applyMatrix4(mWorld);
          box.expandByPoint(corner);
          corners.push(corner.clone());
        }
  }
  if (box.isEmpty()) return null;
  orbitFitCorners = corners;
  return box;
}
const _abM = new THREE.Matrix4();

function fitOrbitCamera() {
  camera.clearViewOffset();
  if (camera.aspect < 0.8) {
    CAM_ORBIT.fov = 38;
    CAM_ORBIT.look.set(0, -1, RING_R + PRESENT_OUT - 15);
    const distance = 20 / Math.tan(THREE.MathUtils.degToRad(19)) / camera.aspect;
    CAM_ORBIT.pos.set(0, 10, CAM_ORBIT.look.z + distance);
    camera.fov = CAM_ORBIT.fov;
    camera.updateProjectionMatrix();
    return;
  }
  CAM_ORBIT.fov = 32;
  camera.fov = 32;
  camera.updateProjectionMatrix();
  const vfov = THREE.MathUtils.degToRad(CAM_ORBIT.fov);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const b = orbitBounds;
  if (!b) {
    // Pre-boot analytic estimate (only seen behind the boot overlay). Far-arc
    // half-width: the widest far slots sit at x ≈ ±RING_R.
    const semiMajor = RING_R + BOOK_SCALE * 8 + 2;
    const semiMinor = RING_R * Math.sin(RING_TILT + CAM_ELEV) + BOOK_SCALE * 21 / 2 + 2;
    const distH = semiMajor / Math.tan((hfov / 2) * CAM_FILL);
    const distV = semiMinor / Math.tan((vfov / 2) * CAM_FILL);
    const d = Math.max(distH, distV);
    CAM_ORBIT.pos.set(
      0,
      CAM_ORBIT.look.y + d * Math.sin(CAM_ELEV),
      d * Math.cos(CAM_ELEV),
    );
    return;
  }
  const look = _fitLook.set(0, -23, 0);
  const corners = orbitFitCorners || [];
  const worstAt = distance => {
    camera.position.set(0, look.y + distance * Math.sin(CAM_ELEV), distance * Math.cos(CAM_ELEV));
    camera.lookAt(look); camera.updateMatrixWorld(true);
    let worst = 0;
    for (const corner of corners) {
      const p = _fitV.copy(corner).project(camera);
      if (p.z < -1 || p.z > 1) return 100;
      worst = Math.max(worst, Math.abs(p.x) / 1.035, p.y > 0 ? p.y / .80 : -p.y / .86);
    }
    return worst;
  };
  let lo = RING_R + PRESENT_OUT + 18, hi = 700;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (worstAt(mid) > 1) lo = mid; else hi = mid;
  }
  const d = hi * 1.085;
  CAM_ORBIT.pos.set(look.x, look.y + d * Math.sin(CAM_ELEV), look.z + d * Math.cos(CAM_ELEV));
  CAM_ORBIT.look.copy(look);
  camera.position.copy(CAM_ORBIT.pos);
  camLook.copy(CAM_ORBIT.look);
  camera.lookAt(camLook);
}
const _fitLook = new THREE.Vector3();
const _fitV = new THREE.Vector3();
const _fitCorners = [];

function resize() {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
  fitOrbitCamera();
  applyInspectShift();
  invalidate();
}

/* ------------------------------------------------------------------ state */

let state = 'orbit';
let ringAngle = 0;
let frontIndex = 0;
let targetFront = 0;
let anim = null; // { kind, t0, dur, ... }
let stepQueue = []; // signed slot deltas (may be multi-slot)
let frontPresent = 1; // 0..1 presentation of logical front (orbit idle = 1)
let bootReady = false;
let readBias = 0;
let inspectZoom = 0; // 0 default inspect framing → 1 closer

let hoverFront = false;
let hoverLift = 0;
let hoverIndex = -1;
const hoverAmounts = new Float32Array(N);
const hoverTilt = new THREE.Vector2(), hoverTiltTarget = new THREE.Vector2();
let gestureAcc = 0;
let gestureTimer = null;
let pendingBurst = 0; // signed multi-slot coalesce awaiting flush
let wheelRelease = false;
let stageFullyInView = true;
let lastInteract = performance.now();
let tabHidden = document.hidden;

let reader = null;
let sceneDirty = true; // render-on-demand: set on any state/pose/camera change
let frameHandle = 0;
let idleTimer = null;
function scheduleFrame() {
  if (bootReady && !frameHandle) frameHandle = requestAnimationFrame(frame);
}
function invalidate() { sceneDirty = true; scheduleFrame(); }
addEventListener('orbit-invalidate', invalidate);



resize();
addEventListener('resize', () => {
  resize();
  if (state === 'orbit' || state === 'presenting') orbitCameraNow();
  else if (reader && !anim) { reader.group.scale.setScalar(detailTargetPose().scale); inspectCameraNow(); applyRingFraming(1); }
  invalidate();
});

/* ------------------------------------------------------------------ theme */

/* Dark mode = gallery night: a warm lamp above the ring is the only key, the
   void goes near-black, and a faint warm pool grounds the books. The parent
   (ShelfStage) posts `orbit-theme`; standalone follows prefers-color-scheme. */
const DARK_BG = 0x151816;
let sceneDark = matchMedia('(prefers-color-scheme: dark)').matches;

// Warm museum spotlight. Kept in the scene from boot at intensity 0 so the
// shader compiles once and toggling never hitches. In dark mode it hangs
// above the *selected* book (updateLamp) and is the ONLY light source: real
// distance falloff (decay 2, intensity in candela) so books fade darker the
// farther they sit from the pool of light.
const lamp = new THREE.SpotLight(0xffe6c0, 0, 0, 0.62, 0.85, 2);
const readingFill = new THREE.DirectionalLight(0xf2f5ff,.85);
scene.add(readingFill,readingFill.target);
lamp.position.set(0, 120, 190);
lamp.target.position.set(0, RING_Y_ORBIT, 0);
scene.add(lamp, lamp.target);

// Dark-mode counterpart of the contact shadow: a faint warm light pool that
// sits under the selected book (positioned by updateLamp).
const glowPool = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 20, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,205,150,0.30)');
  grad.addColorStop(0.55, 'rgba(255,190,130,0.15)');
  grad.addColorStop(1, 'rgba(255,180,120,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 70),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.55,
      fog: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -BOOK_SCALE * 11.34;
  mesh.renderOrder = -1;
  mesh.visible = false;
  return mesh;
})();
ringGroup.add(glowPool);

function applyTheme() {
  const dark = sceneDark;
  const bg = new THREE.Color(dark ? DARK_BG : 0xe5e1d8);
  atmosphere.setTheme(dark);
  scene.background = null;
  renderer.setClearColor(0x000000, 0);
  if (scene.fog) {
    scene.fog.color.copy(bg);
    scene.fog.near = 1000;
    scene.fog.far = 2000;
  }
  // Dark = night gallery: the lamp is the only key. The studio rig drops to a
  // whisper (rim/hemi just enough that the ring reads as faint silhouettes).
  studio.sun.intensity = dark ? .95 : 2.15;
  studio.fill.intensity = dark ? .7 : .85;
  studio.rim.intensity = dark ? .8 : .65;
  studio.hemi.intensity = dark ? 1.0 : 1.15;
  studio.hemi.groundColor.set(dark ? 0x8d887f : 0xa09b90);
  scene.environmentIntensity = dark ? .30 : .36;
  readingFill.intensity=dark ? .85 : .65;
  lamp.intensity = dark ? 7000 : 0;
  contactShadow.visible = !dark;
  grounding.setDark(dark);
  glowPool.visible = dark;
  document.documentElement.classList.toggle('scene-dark', dark);
}

/* The dark-mode lamp hangs above the selected book: the presented slot while
   browsing, the held volume while inspecting. Called from the frame loop so
   it tracks spins, pulls and returns. While a book is held the light pool on
   the ring behind goes out — the lamp follows the held volume alone. */
const _lampAim = new THREE.Vector3();
function updateLamp() {
  const held =
    (state === 'inspecting' || state === 'reading' || state === 'pullingOut' || state === 'returning') &&
    reader && reader.group.visible;
  if (held) {
    _lampAim.copy(detailRoot.position);
    glowPool.visible = false;
  } else if (slots[frontIndex]) {
    _lampAim.copy(slotWorldPose(frontIndex, 1).pos);
    glowPool.visible = true;
    const phi = phiOf(frontIndex);
    const radial = RING_R + PRESENT_OUT;
    glowPool.position.set(
      radial * Math.sin(phi),
      -BOOK_SCALE * 11.34,
      radial * Math.cos(phi),
    );
  } else {
    return;
  }
  lamp.target.position.copy(_lampAim);
  lamp.position.set(_lampAim.x * 0.3, _lampAim.y + 95, _lampAim.z + 50);
}

window.addEventListener('message', (event) => {
  if (event.origin !== location.origin) return;
  const d = event.data;
  if (d && typeof d === 'object' && d.type === 'orbit-theme') {
    sceneDark = !!d.dark;
    applyTheme();
    invalidate();
  }
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  sceneDark = e.matches;
  applyTheme();
  invalidate();
});
applyTheme();

let detailSpinVel = new THREE.Vector3();
let detailDragging = false;
let coverDragging = false;
let pageDragging = false;
let coverDragStartX = 0;
let coverDragStartY = 0, coverDragAxis = null;
let activePointerId = null, pendingPageT = null;
const touchPoints = new Map();
let pinch = null;
const inspectPan = new THREE.Vector2();
let coverDragStart = 0;
let coverClick = null; // { x, y, t } — a quick tap on the book toggles the cover
let pageDragAxis = null;
let rotateDrag = null; // { x, y, vx, vy } — smoothed per-event deltas → release inertia
let spinReset = null;  // { x0, y0, t0 } — double-click glide back to neutral pose

const slots = []; // { meta, closed, host, present, visible }

function currentMeta() {
  return slots[frontIndex]?.meta;
}

function setState(next) {
  state = next;
  invalidate();
  syncChrome();
  document.documentElement.classList.toggle('is-inspecting', next !== 'orbit' && next !== 'presenting');
  if (EMBED) parent.postMessage({ type:'orbit-state', state:next }, location.origin);
}

function syncChrome() {
  const browsing = state === 'orbit' || state === 'presenting';
  navPrev.hidden = !browsing;
  navNext.hidden = !browsing;
  navPrev.disabled = !browsing || !canBrowse();
  navNext.disabled = !browsing || !canBrowse();
  scrollDown.hidden = !browsing;
  canvas.style.touchAction = browsing ? 'pan-y' : 'none';
  updateCaption();
}

function canBrowse() {
  return (state === 'orbit' || state === 'presenting') && bootReady && stepQueue.length < QUEUE_MAX;
}

function noteInteract() {
  lastInteract = performance.now();
}

function queueDepthAhead() {
  return stepQueue.length;
}

function durationScale() {
  const q = queueDepthAhead();
  if (q >= 4) return 0.35;
  if (q >= 2) return 0.48;
  if (q >= 1) return 0.65;
  return 1;
}

function applyCameraPose(pos, look, fov) {
  camera.filmOffset = 0;
  camera.position.copy(pos);
  camLook.copy(look);
  camera.lookAt(camLook);
  if (fov != null && Math.abs(camera.fov - fov) > 1e-4) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  invalidate();
}

function orbitCameraNow() {
  applyCameraPose(CAM_ORBIT.pos, CAM_ORBIT.look, CAM_ORBIT.fov);
  applyHeroView(1);
}
function applyHeroView(amount) {
  if (amount < 0.001) camera.clearViewOffset();
  else {
    const w = stage.clientWidth, h = stage.clientHeight;
    camera.setViewOffset(w, h, 0, -h * (camera.aspect < .8 ? -.015 : .09) * amount, w, h);
  }
}


const _inspectPos = new THREE.Vector3(), _inspectLook = new THREE.Vector3(), _safeVertex = new THREE.Vector3();
function inspectCameraNow(zoom = inspectZoom) {
  applyHeroView(0);
  const z = clamp01(zoom);
  const pos = _inspectPos.lerpVectors(CAM_INSPECT.pos, CAM_INSPECT_CLOSE.pos, z);
  const look = _inspectLook.lerpVectors(CAM_INSPECT.look, CAM_INSPECT_CLOSE.look, z);
  pos.z += readBias * (camera.aspect < 0.8 ? 8 : 18) * (1-z);
  pos.x += inspectPan.x; look.x += inspectPan.x;
  pos.y += inspectPan.y; look.y += inspectPan.y;
  // Conservative front-depth bound over every physical board/leaf, in world space.
  // Only test physical geometry; SDF glyph bounds are shader-deformed.
  if(reader?.group.visible) {
    reader.group.updateWorldMatrix(true,true);
    let front=-Infinity;
    for(const mesh of reader.hitMeshes){const a=mesh.geometry.attributes.position;
      for(let i=0;i<a.count;i++){_safeVertex.fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld);front=Math.max(front,_safeVertex.z);}
    }
    pos.z=Math.max(pos.z,front+10);
  }
  if (camera.aspect < 0.8) look.y += 13 * readBias;
  const fov = lerp(CAM_INSPECT.fov, CAM_INSPECT_CLOSE.fov, z);
  applyCameraPose(pos, look, fov);
}

function applyRingFraming(tInspect) {
  const t = clamp01(tInspect);
  ringGroup.position.x = lerp(0,ringInspectX(),t);
  ringGroup.position.y = lerp(RING_Y_ORBIT, ringInspectY(), t);
  ringGroup.position.z = lerp(0, RING_Z_INSPECT, t);
  const s = lerp(1, ringInspectScale(), t);
  ringGroup.scale.setScalar(s);
  ringGroup.rotation.x = lerp(RING_TILT, RING_TILT_INSPECT, t);
  invalidate();
}

function stageFillsViewport() {
  if (EMBED) return heroVisible;
  const r = stage.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  return r.top < vh * 0.55 && r.bottom > vh * 0.35;
}

function phiOf(i, angle = ringAngle) {
  const raw = angle + (i / N) * Math.PI * 2;
  const signed = Math.atan2(Math.sin(raw), Math.cos(raw));
  const opening = .18 * Math.tanh(signed / .055) * Math.exp(-Math.abs(signed) / .46);
  return raw + opening;
}

function edgeYaw(phi) {
  // −X (spine) → ring center: Ry(phi − π/2) maps local −X inward at slot phi
  return phi - Math.PI / 2;
}

function yawAt(phi, present) {
  // present=1 → +π/2: cover +Z outward, spine −X on the left when facing camera
  return edgeYaw(phi) + present * (Math.PI / 2 + .10);
}

function applySlotPose(slot, i, angle, present, lift = 0) {
  if (!slot?.host) return;
  const phi = phiOf(i, angle);
  const radial = RING_R + present * PRESENT_OUT;
  slot.host.position.set(radial * Math.sin(phi), present * PRESENT_LIFT + lift, radial * Math.cos(phi));
  slot.host.rotation.set(-.30 * present + (i === frontIndex ? hoverTilt.y : 0), yawAt(phi, present) + (i === frontIndex ? hoverTilt.x : 0), 0, 'YXZ');
  slot.host.scale.setScalar(BOOK_SCALE * (1 + present * .25));
  grounding.updateSlot(i, slot.host.position.x, slot.host.position.z, yawAt(phi, present), present * PRESENT_LIFT + lift, slot.visible);
  slot.present = present;
  invalidate();
  const order = present > 0.35 ? 2 : 0;
  if (slot._order !== order) {
    slot._order = order;
    slot.closed.group.traverse((o) => {
      if (o.isMesh) o.renderOrder = order;
    });
  }
}

function syncTitles() {
  for (let i = 0; i < N; i++) {
    const s = slots[i];
    if (!s) continue;
    const on = i === frontIndex && s.visible && frontPresent > 0.55 && (state === 'orbit' || state === 'presenting');
    s.closed.setTitleVisible(on);
  }
  invalidate();
}

/** Apply ring poses. presentMap: optional { [index]: 0..1 }; default front uses frontPresent. */
function updateAllPoses(presentMap) {
  for (let i = 0; i < N; i++) {
    const s = slots[i];
    if (!s?.visible) continue;
    let p = 0;
    if (presentMap && presentMap[i] != null) p = presentMap[i];
    else if (i === frontIndex) p = frontPresent;
    const lift = hoverAmounts[i];
    applySlotPose(s, i, ringAngle, p, lift);
  }
}

/* ------------------------------------------------------------------ browse — two-phase + queue */

function projectedFront() {
  let idx = frontIndex;
  if (anim && (anim.kind === 'ringSpin' || anim.kind === 'bookFlip')) idx = anim.toFront;
  else if (state === 'presenting') idx = targetFront;
  for (const d of stepQueue) idx = mod(idx + d, N);
  if (pendingBurst) idx = mod(idx + pendingBurst, N);
  return idx;
}

function enqueueSteps(delta) {
  if (!delta || !canBrowse()) return false;
  const d = delta | 0;
  if (!d) return false;
  if (stepQueue.length >= QUEUE_MAX) return false;
  stepQueue.push(d);
  noteInteract();
  pumpBrowse();
  return true;
}

/** One queue entry = one ringSpin (any slot count) + one flip. Never drain loops. */
function enqueueBurst(delta) {
  const d = delta | 0;
  if (!d) return false;
  if (!(state === 'orbit' || state === 'presenting') || !bootReady) return false;
  // Merge any pending single steps into this one multi-slot move
  while (stepQueue.length) pendingBurst += stepQueue.shift();
  pendingBurst += d;
  const maxBurst = BURST_MAX;
  if (Math.abs(pendingBurst) > maxBurst) {
    pendingBurst = Math.sign(pendingBurst) * maxBurst;
  }
  return flushBurst();
}

function flushBurst() {
  if (!pendingBurst) return false;
  if (anim || stepQueue.length) return false; // retry when current move finishes
  if (!(state === 'orbit' || state === 'presenting') || !bootReady) return false;
  const delta = pendingBurst;
  pendingBurst = 0;
  stepQueue.push(delta);
  noteInteract();
  pumpBrowse();
  return true;
}

function pumpBrowse() {
  if (anim) return;
  if (state !== 'orbit' && state !== 'presenting') return;
  if (!stepQueue.length) {
    if (pendingBurst) {
      flushBurst();
      return;
    }
    if (state === 'presenting') setState('orbit');
    syncChrome();
    return;
  }
  const delta = stepQueue.shift();
  beginRingSpin(delta);
  syncChrome();
}

function beginRingSpin(delta) {
  const fromFront = frontIndex;
  const toFront = mod(frontIndex + delta, N);
  const step = (Math.PI * 2) / N;
  const fromAngle = ringAngle;
  const toAngle = ringAngle - delta * step;
  targetFront = toFront;

  // Phase 1: edge-on ring — force every slot to present=0, then only ringAngle moves.
  // Departing fold is the snap into this phase; bookFlip only opens the arriver.
  if (reducedMotion) {
    ringAngle = toAngle;
    frontIndex = toFront;
    frontPresent = 1;
    updateAllPoses({});
    syncTitles();
    announce(slots[frontIndex]?.meta?.title ?? '');
    setState('orbit');
    anim = null;
    pumpBrowse();
    return;
  }

  setState('presenting');
  const slotSpan = Math.max(1, Math.abs(delta));
  const spinScale = slotSpan > 1 ? Math.min(2.4, 0.65 + 0.22 * slotSpan) : 1;
  anim = {
    kind: 'ringSpin',
    t0: performance.now(),
    dur: SPIN_DUR * durationScale() * spinScale,
    fromAngle,
    toAngle,
    fromFront,
    toFront,
  };
}

function beginBookFlip(fromFront, toFront) {
  frontIndex = toFront;
  targetFront = toFront;
  frontPresent = 0;

  if (reducedMotion) {
    frontPresent = 1;
    updateAllPoses({});
    syncTitles();
    announce(slots[frontIndex]?.meta?.title ?? '');
    anim = null;
    setState('orbit');
    pumpBrowse();
    return;
  }

  anim = {
    kind: 'bookFlip',
    t0: performance.now(),
    dur: FLIP_DUR * durationScale(),
    fromFront,
    toFront,
  };
}

function advance(delta = 1) {
  const d = Math.sign(delta);
  if (!d) return false;
  return enqueueSteps(d);
}

function goToIndex(index) {
  if (!canBrowse()) return false;
  const d = shortestDelta(projectedFront(), mod(index, N), N);
  if (!d) {
    if (!anim && !stepQueue.length) openFront();
    return true;
  }
  return enqueueSteps(d);
}

/* ------------------------------------------------------------------ detail */

function slotWorldPose(i, present = 1, canonical = false) {
  const phi = phiOf(i, ringAngle);
  const radial = RING_R + present * PRESENT_OUT;
  const local = new THREE.Object3D();
  local.position.set(radial * Math.sin(phi), present * PRESENT_LIFT, radial * Math.cos(phi));
  local.rotation.set(-.30 * present, yawAt(phi, present), 0, 'YXZ');
  local.scale.setScalar(BOOK_SCALE * (1 + present * .25));
  ringGroup.updateMatrixWorld(true);
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3();
  local.updateMatrix();
  const ringMatrix = canonical ? new THREE.Matrix4().compose(new THREE.Vector3(0,RING_Y_ORBIT,0),new THREE.Quaternion().setFromEuler(new THREE.Euler(RING_TILT,0,0)),new THREE.Vector3(1,1,1)) : ringGroup.matrixWorld;
  const m = new THREE.Matrix4().multiplyMatrices(ringMatrix, local.matrix);
  m.decompose(pos, quat, scl);
  return { pos, quat, scale: scl };
}

function detailTargetPose() {
  // Centered-left, large, fully in frame; ring reads small behind.
  // X pairs with applyInspectShift() so narrow aspects stay in frame.
  const pos = new THREE.Vector3(inspectBookX, 18, 101);
  const quat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(-0.12, 0.18, 0, 'YXZ'),
  );
  return { pos, quat, scale: BOOK_SCALE * lerp(1.55, 1.12, clamp01((1 - camera.aspect) / 0.55)) };
}

let readerTask = Promise.resolve();
function ensureReader(meta) {
  const spec = {
    coverUrl: meta.coverUrl, caseColor: meta.caseColor, caseLuminance: meta.caseLuminance,
    title: meta.title, author: 'Belief Changer', slug: meta.slug,
    overlayInk: meta.overlayInk, promise: meta.promise,
    pages: previewContent[meta.slug]?.[LOCALE]?.pages || previewContent[meta.slug]?.en?.pages,
  };
  const task = readerTask.catch(() => {}).then(async () => {
    if (reader) await reader.rebind(spec);
    else {
      const book = await createReaderBook(THREE, shared, spec);
      book.group.visible = false;
      detailSpin.add(book.group);
      reader = book;
    }
    return reader;
  });
  readerTask = task;
  return task;
}

function showPanel(meta) {
  panelTitle.textContent = meta.title;
  panelPromise.textContent = meta.promise;
  panelMeta.textContent = meta.meta;
  // Prefer site book page: /{locale}/books/{slug}
  const href = `/${LOCALE}/books/${meta.slug}`;
  const preview=previewContent[meta.slug]?.[LOCALE] || previewContent[meta.slug]?.en;
  previewEnd.href=href;previewEnd.textContent=preview?.cta || labels.read;
  previewEnd.setAttribute('aria-label',preview?.cta || labels.read);
  previewEnd.target=EMBED?'_top':'_self';
  panelRead.href = href;
  if (EMBED) panelRead.setAttribute('target', '_top');
  else panelRead.removeAttribute('target');
  panelEl.classList.add('is-open');
  panelEl.inert = false;
  panelEl.setAttribute('aria-hidden', 'false');
}

function hidePanel() {
  panelEl.classList.remove('is-open');
  panelEl.inert = true;
  panelEl.setAttribute('aria-hidden', 'true');
}

async function openFront() {
  if (state !== 'orbit' || anim || stepQueue.length || pendingBurst || !bootReady) return;
  const meta = currentMeta();
  if (!meta || !slots[frontIndex]) return;
  noteInteract();
  setState('pullingOut');
  hoverFront = false;
  inspectZoom = 0; inspectPan.set(0,0);

  const host=slots[frontIndex].host; host.updateWorldMatrix(true,false);
  const from={pos:new THREE.Vector3(),quat:new THREE.Quaternion(),scale:new THREE.Vector3()};
  host.matrixWorld.decompose(from.pos,from.quat,from.scale);
  const to = detailTargetPose();

  slots[frontIndex].visible = false;
  slots[frontIndex].closed.group.visible = false;
  grounding.updateSlot(frontIndex, 0, 0, 0, 0, false);
  syncTitles();

  try { await ensureReader(meta); }
  catch (error) {
    console.error('Could not open book', error);
    slots[frontIndex].visible = slots[frontIndex].closed.group.visible = true;
    setState('orbit'); syncTitles(); announce('This preview could not load. Please try again.');
    return;
  }
  if (state !== 'pullingOut') return;
  readBias = 0;
  reader.setCover(0);
  reader.group.visible = true;
  reader.group.scale.setScalar(from.scale.x);
  detailSpin.rotation.set(0, 0, 0);
  detailSpinVel.set(0, 0, 0);
  spinReset = null;
  detailRoot.position.copy(from.pos);
  detailRoot.quaternion.copy(from.quat);
  invalidate();

  const fromCamPos = camera.position.clone();
  const fromCamLook = camLook.clone();
  const fromCamFov = camera.fov;
  const fromRingX = ringGroup.position.x;
  const fromRingY = ringGroup.position.y;
  const fromRingZ = ringGroup.position.z;
  const fromRingS = ringGroup.scale.x;
  const fromRingTilt = ringGroup.rotation.x;

  if (reducedMotion) {
    detailRoot.position.copy(to.pos);
    detailRoot.quaternion.copy(to.quat);
    reader.group.scale.setScalar(to.scale);
    inspectCameraNow(0);
    applyRingFraming(1);
    setState('inspecting');
    showPanel(meta);
    announce(`${meta.title}. Inspection open.`);
    return;
  }

  anim = {
    kind: 'pull',
    t0: performance.now(),
    dur: PULL_DUR,
    fromPos: from.pos.clone(),
    toPos: to.pos.clone(),
    fromQuat: from.quat.clone(),
    toQuat: to.quat.clone(),
    fromScale: from.scale.x,
    toScale: to.scale,
    fromCamPos,
    toCamPos: CAM_INSPECT.pos.clone(),
    fromCamLook,
    toCamLook: CAM_INSPECT.look.clone(),
    fromCamFov,
    toCamFov: CAM_INSPECT.fov,
    fromRingX,
    fromRingY,
    fromRingZ,
    fromRingS,
    fromRingTilt,
    meta,
  };
}

function stopDetailInput() {
  if(pageDragging) {if(pendingPageT!==null) reader.updateDrag(pendingPageT); reader.endDrag(false);}
  pendingPageT=null; pageDragging=coverDragging=detailDragging=false; activePointerId=null;
  touchPoints.clear(); pinch=null; rotateDrag=null;
  detailSpinVel.set(0,0,0); spinReset=null;
}

async function returnHome() {
  if (state !== 'inspecting' && state !== 'reading' && state !== 'pullingOut') return;
  if (anim?.kind === 'return') return;
  noteInteract();
  hidePanel();

  setState('returning');
  stopDetailInput();
  const fromCover = reader?.getState().cover || 0;

  const to = slotWorldPose(frontIndex, 1, true);
  const fromPos = detailRoot.position.clone();
  const fromQuat = detailRoot.quaternion.clone();
  const fromSpin = detailSpin.quaternion.clone();
  const toSpin = new THREE.Quaternion();

  const fromCamPos = camera.position.clone();
  const fromCamLook = camLook.clone();
  const fromCamFov = camera.fov;
  const fromRingX = ringGroup.position.x;
  const fromRingY = ringGroup.position.y;
  const fromRingZ = ringGroup.position.z;
  const fromRingS = ringGroup.scale.x;
  const fromRingTilt = ringGroup.rotation.x;

  if (reducedMotion) {
    detailRoot.position.copy(to.pos);
    detailRoot.quaternion.copy(to.quat);
    detailSpin.quaternion.identity();
    orbitCameraNow();
    applyRingFraming(0);
    finishReturn();
    return;
  }

  anim = {
    kind: 'return',
    fromCover,
    t0: performance.now(),
    dur: RETURN_DUR,
    fromPos,
    toPos: to.pos.clone(),
    fromQuat,
    toQuat: to.quat.clone(),
    fromSpin,
    toSpin,
    fromScale: reader ? reader.group.scale.x : BOOK_SCALE,
    toScale: BOOK_SCALE * 1.25,
    fromCamPos,
    toCamPos: CAM_ORBIT.pos.clone(),
    fromCamLook,
    toCamLook: CAM_ORBIT.look.clone(),
    fromCamFov,
    toCamFov: CAM_ORBIT.fov,
    fromRingX,
    fromRingY,
    fromRingZ,
    fromRingS,
    fromRingTilt,
  };
}

function finishReturn() {
  if (reader) reader.group.visible = false;
  slots[frontIndex].visible = true;
  slots[frontIndex].closed.group.visible = true;
  frontPresent = 1;
  applySlotPose(slots[frontIndex], frontIndex, ringAngle, 1, 0);
  orbitCameraNow();
  applyRingFraming(0);
  inspectZoom = 0; inspectPan.set(0,0); readBias=0;
  hoverAmounts.fill(0); hoverTilt.set(0,0); hoverTiltTarget.set(0,0); hoverIndex=-1;
  syncTitles();
  setState('orbit');
  openButton.focus({ preventScroll: true });
  announce(`${slots[frontIndex].meta.title}. Back in the orbit.`);
  anim = null;
  invalidate();
}

/* ------------------------------------------------------------------ pointer / input */

function setNdc(e) {
  const rect = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function hitsForBrowse() {
  const meshes = [];
  for (const s of slots) {
    if (!s?.visible) continue;
    for (const m of s.closed.hitMeshes) meshes.push(m);
  }
  return meshes;
}

function slotIndexFromObject(obj) {
  let o = obj;
  while (o) {
    if (o.userData && o.userData.slotIndex != null) return o.userData.slotIndex;
    o = o.parent;
  }
  return -1;
}

function updateHover(e) {
  hoverIndex = -1; hoverFront = false; hoverTiltTarget.set(0,0);
  if (state === 'orbit') {
    setNdc(e); raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(hitsForBrowse(), false)[0];
    if (hit) hoverIndex = slotIndexFromObject(hit.object);
    hoverFront = hoverIndex === frontIndex;
    if (hoverFront && !reducedMotion) {
      const local = slots[frontIndex].host.worldToLocal(hit.point.clone());
      hoverTiltTarget.set(THREE.MathUtils.clamp(local.x / 8,-1,1)*.07, THREE.MathUtils.clamp(-local.y/11,-1,1)*.05);
    }
  }
  canvas.style.cursor = hoverIndex >= 0 ? 'pointer' : 'default';
  invalidate();
}

function startPageDrag(e, leaf) {
  if (!leaf || !reader.beginDrag(leaf)) return false;
  invalidate();
  pageDragging = true;
  spinReset = null;
  const rect = canvas.getBoundingClientRect();
  const projected = reader.dragProjection(leaf, camera, rect.width, rect.height);
  pageDragAxis = {...projected, x0:e.clientX, y0:e.clientY, start:leaf.dir > 0 ? 0 : 1, dir:leaf.dir};
  detailSpinVel.set(0,0,0);
  activePointerId = e.pointerId;
  canvas.setPointerCapture(e.pointerId);
  canvas.style.cursor = 'grabbing';
  setState('reading');
  return true;
}

/* Drag-rotate the held book: direct 1:1 while the pointer is down (no
   inertia-lag between hand and book), smoothed velocity handed to the
   inertia integrator on release. Rotation is ALWAYS available — on empty
   space, and on the open book's boards/spine — so no pose is a dead end. */
function startRotate(e) {
  activePointerId = e.pointerId;
  detailDragging = true;
  rotateDrag = { x: e.clientX, y: e.clientY, vx: 0, vy: 0, time: e.timeStamp };
  detailSpinVel.set(0, 0, 0);
  spinReset = null;
  canvas.setPointerCapture(e.pointerId);
  canvas.style.cursor = 'grabbing';
}

function setInspectCursor() {
  canvas.style.cursor =
    state === 'inspecting' || state === 'reading' ? 'grab' : 'default';
}

stage.addEventListener('focusout', () => invalidate());
canvas.addEventListener('pointerleave', () => {
  pendingHover = null; hoverFront = false; hoverIndex = -1; hoverTiltTarget.set(0,0); invalidate();
});

let browsePress = null;
canvas.addEventListener('pointerdown', async (e) => {
  if (e.button != null && e.button !== 0) return;
  noteInteract();
  if (e.pointerType === 'touch' && ['inspecting','reading'].includes(state)) {
    touchPoints.set(e.pointerId, {x:e.clientX,y:e.clientY});
    if (touchPoints.size === 2) {
      if (pageDragging) { if(pendingPageT !== null) reader.updateDrag(pendingPageT); pendingPageT=null; reader.endDrag(false); }
      pageDragging=coverDragging=detailDragging=false; activePointerId=null; rotateDrag=null; detailSpinVel.set(0,0,0);
      const [a,b]=[...touchPoints.values()];
      pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:inspectZoom,x:(a.x+b.x)/2,y:(a.y+b.y)/2,pan:inspectPan.clone()};
      canvas.setPointerCapture(e.pointerId); e.preventDefault(); return;
    }
  }
  if (activePointerId !== null) return;
  setNdc(e);
  raycaster.setFromCamera(ndc, camera);

  if (state === 'inspecting' || state === 'reading') {
    if (!reader || !reader.group.visible) return;
    reader.group.updateMatrixWorld(true);
    const st = reader.getState();
    if (reader.isBusy()) { e.preventDefault(); return; }
    if(reader.previewLinkHit(raycaster)){linkPress={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);e.preventDefault();return;}

    // Cover fully open → three predictable zones:
    //  1. pages (leaf meshes + open page block): drag turns the page —
    //     gold-style pick resolves the leaf and direction from the hit point;
    //  2. boards / spine / fore-edge: drag rotates the book;
    //  3. empty space: drag rotates the book.
    if (st.cover >= 0.99) {
      const leaf = reader.pickLeaf ? reader.pickLeaf(raycaster) : null;
      if (leaf && startPageDrag(e, leaf)) return;
      if (!reader.pickCover(raycaster)) { e.preventDefault(); startRotate(e); return; }
    }

    // Cover closed / half-open on the book: drag scrubs the cover open-shut;
    // a quick tap toggles it (fixes "sometimes opens, sometimes doesn't").
    const hits = raycaster.intersectObjects(reader.hitMeshes, false);
    if (hits.length && reader.pickCover(raycaster)) {
      e.preventDefault();
      activePointerId = e.pointerId; detailSpinVel.set(0,0,0);
      coverDragging = true;
      coverDragStartX = e.clientX; coverDragStartY = e.clientY;
      const rect=canvas.getBoundingClientRect();
      coverDragAxis=reader.dragProjection(null,camera,rect.width,rect.height);
      coverDragStart = st.cover;
      coverClick = { x: e.clientX, y: e.clientY, t: performance.now() };
      spinReset = null;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
      return;
    }

    // Empty space rotates the held book
    e.preventDefault();
    startRotate(e);
    return;
  }

  if (state !== 'orbit' && state !== 'presenting') return;

  const hits = raycaster.intersectObjects(hitsForBrowse(), false);
  if (!hits.length) return;
  const idx = slotIndexFromObject(hits[0].object);
  if (idx < 0) return;
  browsePress = { id: e.pointerId, x: e.clientX, y: e.clientY, index: idx, at: performance.now() };
  if (e.pointerType !== 'touch') canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if(touchPoints.has(e.pointerId)) touchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch && touchPoints.size===2) {
    const [a,b]=[...touchPoints.values()];
    inspectZoom=clamp01(pinch.zoom+Math.log(Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))/Math.max(1,pinch.distance))*.65);
    inspectPan.set(pinch.pan.x-((a.x+b.x)/2-pinch.x)*.045,pinch.pan.y+((a.y+b.y)/2-pinch.y)*.045);
    inspectPan.clamp(new THREE.Vector2(-18,-16),new THREE.Vector2(18,16));
    inspectCameraNow(); invalidate(); return;
  }
  if(activePointerId!==null && activePointerId!==e.pointerId) return;
  if (pageDragging && reader && pageDragAxis) {
    const dx = e.clientX - pageDragAxis.x0;
    const dy = e.clientY - pageDragAxis.y0;
    const d = (dx * pageDragAxis.x + dy * pageDragAxis.y) / pageDragAxis.span;
    const t = clamp01(pageDragAxis.start + d);
    pendingPageT = t;
    invalidate();
    return;
  }
  if (coverDragging && reader) {
    const dx = e.clientX - coverDragStartX;
    const dy=e.clientY-coverDragStartY;
    const next = clamp01(coverDragStart + (dx*coverDragAxis.x+dy*coverDragAxis.y)/coverDragAxis.span);
    reader.setCover(next);
    invalidate();
    setState(next > 0.08 ? 'reading' : 'inspecting');
    return;
  }
  if (detailDragging && rotateDrag) {
    // Direct 1:1 rotation, or Shift-drag to pan the reading surface.
    const dx = e.clientX - rotateDrag.x;
    const dy = e.clientY - rotateDrag.y;
    rotateDrag.x = e.clientX;
    rotateDrag.y = e.clientY;
    if(e.shiftKey) { inspectPan.x-=dx*.045; inspectPan.y+=dy*.045; inspectPan.clamp(new THREE.Vector2(-18,-16),new THREE.Vector2(18,16)); inspectCameraNow(); rotateDrag.time=e.timeStamp; invalidate(); return; }
    detailSpin.rotation.y += dx * 0.0062;
    detailSpin.rotation.x = THREE.MathUtils.clamp(
      detailSpin.rotation.x + dy * 0.0046,
      -0.85,
      0.85,
    );
    const elapsed = Math.max(0.004, Math.min(0.05, (e.timeStamp - rotateDrag.time) / 1000));
    const blend = 1 - Math.exp(-24 * elapsed);
    rotateDrag.vx += (dx / elapsed - rotateDrag.vx) * blend;
    rotateDrag.vy += (dy / elapsed - rotateDrag.vy) * blend;
    rotateDrag.time = e.timeStamp;
    invalidate();
    return;
  }
  if (state === 'orbit' || state === 'presenting') {
    pendingHover = { clientX: e.clientX, clientY: e.clientY };
    scheduleFrame();
    return;
  }
  if ((state === 'inspecting' || state === 'reading') && reader && reader.group.visible) {
    // Cursor affordance: grab over the held book, default over the void.
    setNdc(e);
    raycaster.setFromCamera(ndc, camera);
    reader.group.updateMatrixWorld(true);
    const over = raycaster.intersectObjects(reader.hitMeshes, false);
    canvas.style.cursor = reader.previewLinkHit(raycaster) ? 'pointer' : over.length ? 'grab' : 'default';
  }
});

function endPointer(e, cancelled) {
  if(linkPress?.id===e.pointerId){const p=linkPress;linkPress=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(!cancelled&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<8)previewEnd.click();return;}
  if (browsePress?.id === e.pointerId) {
    const press = browsePress; browsePress = null;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    const dx = e.clientX - press.x, dy = e.clientY - press.y;
    if (!cancelled && Math.hypot(dx, dy) < 10 && performance.now() - press.at < 650) {
      if (press.index === frontIndex && state === 'orbit' && !anim) openFront();
      else goToIndex(press.index);
    } else if (!cancelled && e.pointerType !== 'touch' && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      advance(dx < 0 ? 1 : -1);
    }
    return;
  }
  touchPoints.delete(e.pointerId);
  if(pinch) { pinch=null; activePointerId=null; invalidate(); return; }
  if(activePointerId!==e.pointerId) return;
  activePointerId=null;
  if (pageDragging && reader) {
    pageDragging = false;
    if(pendingPageT!==null) reader.updateDrag(pendingPageT); pendingPageT=null;
    reader.endDrag(!cancelled);
    invalidate();
    if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    const st = reader.getState();
    setState(st.cover > 0.08 || st.turned > 0 ? 'reading' : 'inspecting');
    setInspectCursor();
    return;
  }
  if (coverDragging && reader) {
    coverDragging = false;
    const st = reader.getState();
    const tap =
      !cancelled &&
      coverClick &&
      Math.abs(e.clientX - coverClick.x) + Math.abs(e.clientY - coverClick.y) < 8 &&
      performance.now() - coverClick.t < 400;
    coverClick = null;
    // Tap toggles; a drag commits by where it was released.
    reader.openCover(cancelled ? coverDragStart : tap ? st.cover < 0.5 : st.cover > 0.5);
    invalidate();
    if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    setState(st.cover > 0.08 ? 'reading' : 'inspecting');
    setInspectCursor();
    return;
  }
  if (detailDragging) {
    detailDragging = false;
    if (rotateDrag) {
      // Hand the smoothed drag velocity to the inertia integrator.
      detailSpinVel.set(rotateDrag.vy * 0.0046, rotateDrag.vx * 0.0062, 0);
      if (cancelled || reducedMotion || e.timeStamp - rotateDrag.time > 100) detailSpinVel.set(0, 0, 0);
      detailSpinVel.clampLength(0, 6);
    }
    rotateDrag = null;
    if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    setInspectCursor();
    invalidate();
  }
}
canvas.addEventListener('pointerup', (e) => endPointer(e, false));
canvas.addEventListener('pointercancel', (e) => endPointer(e, true));
canvas.addEventListener('lostpointercapture', (e) => {if(activePointerId===e.pointerId) endPointer(e,true)});

/* Double-tap / double-click: glide the held book back to its neutral pose —
   the guaranteed way home from any rotation the user dragged themselves into.
   Detected manually: preventDefault on pointerdown suppresses native dblclick. */
let lastTapUp = null;
function resetSpinPose() {
  if (state !== 'inspecting' && state !== 'reading') return;
  if (!reader || !reader.group.visible) return;
  noteInteract();
  detailSpinVel.set(0, 0, 0);
  inspectZoom = 0; inspectPan.set(0,0); inspectCameraNow();
  const y = detailSpin.rotation.y;
  spinReset = {
    x0: detailSpin.rotation.x,
    y0: ((y + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI,
    t0: performance.now(),
  };
  invalidate();
}
canvas.addEventListener('dblclick', (e) => {
  e.preventDefault();
  resetSpinPose();
});

/* wheel — gesture-end debounce; never while-loop advances per event */
function commitWheelGesture() {
  gestureTimer = null;
  const acc = gestureAcc;
  gestureAcc = 0;
  if (!acc) return;
  invalidate();
  if (!(state === 'orbit' || state === 'presenting') || !bootReady) return;

  const dir = acc > 0 ? 1 : -1;
  const abs = Math.abs(acc);
  const busy = !!anim || stepQueue.length > 0 || pendingBurst !== 0;

  // Idle: always exactly one book — magnitude must not jump the ring.
  // Trackpad flicks dump huge deltaY; that used to look like 2–4 book hops.
  if (!busy) {
    enqueueSteps(dir);
    return;
  }

  // Already browsing: coalesce into one multi-slot ringSpin + one final flip
  // (no intermediate book flips while the user keeps scrolling).
  const slots = Math.min(BURST_MAX, Math.max(1, Math.round(abs / BURST_SLOT_DIV)));
  enqueueBurst(dir * slots);
}

stage.addEventListener('wheel', (e) => {
  if (reducedMotion || e.ctrlKey || panelEl.contains(e.target) || readerTools.contains(e.target)) return;
  if (EMBED && !e.shiftKey && Math.abs(e.deltaX) <= Math.abs(e.deltaY) && (state === 'orbit' || state === 'presenting')) return;
  if (wheelRelease) return;
  if (!stageFillsViewport()) return;

  // Detail: dolly / zoom the inspection framing — do not browse the ring
  if (state === 'inspecting' || state === 'reading') {
    e.preventDefault();
    noteInteract();
    inspectZoom = clamp01(inspectZoom + pixelDelta(e, innerHeight) * 0.0015);
    inspectCameraNow(inspectZoom);
    return;
  }
  if (state === 'pullingOut' || state === 'returning') {
    e.preventDefault();
    return;
  }
  if (state !== 'orbit' && state !== 'presenting') {
    e.preventDefault();
    return;
  }
  if (!bootReady) {
    e.preventDefault();
    return;
  }
  e.preventDefault();
  noteInteract();
  gestureAcc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : pixelDelta(e, innerHeight);
  if (gestureTimer != null) clearTimeout(gestureTimer);
  gestureTimer = setTimeout(commitWheelGesture, GESTURE_MS);
}, { passive: false });

scrollDown.addEventListener('pointerenter', () => { wheelRelease = true; });
scrollDown.addEventListener('pointerleave', () => { wheelRelease = false; });
scrollDown.addEventListener('click', () => {
  noteInteract();
  if (EMBED) {
    parent.postMessage({ type: 'orbit-scroll-down' }, location.origin);
    return;
  }
  document.getElementById('content').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
});

navPrev.addEventListener('click', () => { noteInteract(); advance(-1); });
navNext.addEventListener('click', () => { noteInteract(); advance(1); });
panelBack.addEventListener('click', () => { returnHome(); });

addEventListener('keydown', (e) => {
  if (e.target && (e.target.isContentEditable || /input|textarea|select/i.test(e.target.tagName))) return;
  if (e.key === 'Enter' && e.target?.closest('a,button')) return;
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    noteInteract();
    if (canBrowse()) advance(-1);
    else if (reader?.getState().cover >= 0.99) { reader.turnTo(reader.getState().turned - 1); invalidate(); }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    noteInteract();
    if (canBrowse()) advance(1);
    else if (reader?.getState().cover >= 0.99) { reader.turnTo(reader.getState().turned + 1); invalidate(); }
  } else if (e.key === 'Enter') {
    if (state === 'orbit' && !anim && !stepQueue.length && !pendingBurst) {
      e.preventDefault();
      openFront();
    }
  } else if (e.key === 'Escape') {
    if (state === 'inspecting' || state === 'reading' || state === 'pullingOut') {
      e.preventDefault();
      returnHome();
    }
  }
});

/* touch: horizontal browse, vertical scroll */
let touch0 = null;
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) return;
  const t = e.touches[0];
  touch0 = { x: t.clientX, y: t.clientY, t: performance.now() };
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (!touch0) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touch0.x;
  const dy = t.clientY - touch0.y;
  touch0 = null;
  if (state !== 'orbit' && state !== 'presenting') return;
  if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
  noteInteract();
  advance(dx < 0 ? 1 : -1);
}, { passive: true });

document.addEventListener('visibilitychange', () => {
  tabHidden = document.hidden;
  if (!tabHidden) invalidate();
});

const io = new IntersectionObserver((entries) => {
  for (const en of entries) {
    if (en.target === stage) { stageFullyInView = en.intersectionRatio >= 0.98; invalidate(); }
  }
}, { threshold: [0, 0.5, 0.98, 1] });
io.observe(stage);

/* ------------------------------------------------------------------ boot books */

let shared;
let closedBatch = null;
let frameStarted = false;

function mountSlot(j, meta, closed) {
  const host = new THREE.Group();
  host.userData.slotIndex = j;
  closed.group.userData.slotIndex = j;
  for (const m of closed.hitMeshes) m.userData.slotIndex = j;
  host.add(closed.group);
  ringGroup.add(host);
  closed.setTitleVisible(false);
  slots[j] = { meta, closed, host, present: 0, visible: true };
  const p = j === frontIndex ? frontPresent : 0;
  applySlotPose(slots[j], j, ringAngle, p, 0);
  measureBookLocalBox(slots[j]);
  invalidate();
}

function revealBoot() {
  if (bootReady) return;
  bootReady = true;
  window.__orbitPerf.reveal = performance.now() - BOOT_T0;
  parent.postMessage({ type: 'orbit-ready' }, location.origin);
  // Precise framing before the first visible frame: fit the real composition
  // (ring + presented front book) so nothing clips at any aspect.
  orbitBounds = analyticOrbitBounds() || orbitBounds;
  fitOrbitCamera();
  orbitCameraNow();
  bootEl.classList.add('is-done');
  setTimeout(() => bootEl.remove(), 420);
  syncChrome();
  invalidate();
  if (!frameStarted) { frameStarted = true; scheduleFrame(); }
}

async function boot() {
  await document.fonts.load('400 16px "DM Sans"');
  await document.fonts.load('600 48px "DM Sans"');
  await document.fonts.ready;

  shared = await createSharedResources(THREE, {
    fontUrl: '/orbit/vendor/fonts/dm-sans-latin-500-normal.woff',
  });
  const [catalog,preview]=await Promise.all([fetch('./_extract/books-meta.json').then(r=>r.json()),fetch('./_extract/preview-content.json').then(r=>r.json())]);
  previewContent=preview;
  const order = buildRingOrder(catalog, N);

  frontIndex = 0;
  targetFront = 0;
  ringAngle = 0;
  frontPresent = 0;
  orbitCameraNow();
  applyRingFraming(0);

  let madeCount = 0;

  async function makeOne(j) {
    const meta = order[j];
    const closed = await createClosedBook(THREE, shared, {
      coverUrl: meta.ringCoverUrl || meta.coverUrl,
      caseColor: meta.caseColor,
      caseLuminance: meta.caseLuminance,
      title: meta.title,
      author: 'Belief Changer',
      slug: meta.slug,
      overlayInk: meta.overlayInk,
      promise: meta.promise,
    });
    mountSlot(j, meta, closed);
    madeCount++;
    if (madeCount === BOOT_REVEAL_AT) {
      syncTitles();
      announce(slots[0]?.meta?.title ?? '');
      revealBoot();
      // Entrance: short spin settle then flip front to face camera
      if (!reducedMotion) {
        setState('presenting');
        anim = {
          kind: 'ringSpin',
          t0: performance.now(),
          dur: 520,
          fromAngle: ringAngle + ((Math.PI * 2) / N) * 0.4,
          toAngle: ringAngle,
          fromFront: 0,
          toFront: 0,
          entrance: true,
        };
      } else {
        frontPresent = 1;
        updateAllPoses({});
        syncTitles();
        setState('orbit');
      }
    }
  }

  for (let i = 0; i < N; i += BOOT_BATCH) {
    const batch = [];
    for (let j = i; j < Math.min(N, i + BOOT_BATCH); j++) batch.push(makeOne(j));
    await Promise.all(batch);
  }

  // Ensure reveal even if N < BOOT_REVEAL_AT
  if (!bootReady) {
    frontPresent = reducedMotion ? 1 : frontPresent;
    updateAllPoses({});
    syncTitles();
    announce(slots[0]?.meta?.title ?? '');
    revealBoot();
    if (!reducedMotion && !anim) {
      setState('presenting');
      anim = {
        kind: 'bookFlip',
        t0: performance.now(),
        dur: FLIP_DUR,
        fromFront: 0,
        toFront: 0,
        entrance: true,
      };
    } else if (reducedMotion) setState('orbit');
  }

  closedBatch = instanceRing(THREE, ringGroup, slots);
  invalidate();
  window.__orbitPerf.prewarm = 'pending';
  setTimeout(() => {
    if (state === 'orbit' && !anim && !tabHidden && heroVisible && shared) {
      ensureReader(currentMeta()).catch(() => {}).finally(() => { window.__orbitPerf.prewarm = 'done'; });
    } else window.__orbitPerf.prewarm = 'skipped';
  }, 1500);
  window.__ORBIT = {
    repairVersion: 'orbit-repair-20260905-1',
    get motionDebug() { return {hoverIndex,hoverAmounts:Array.from(hoverAmounts),hoverTilt:hoverTilt.toArray(),pageDragging,coverDragging,activePointerId,inspectZoom,inspectPan:inspectPan.toArray(),state, sceneDirty, frameScheduled:!!frameHandle, readBias, hoverLift, hoverFront, anim:anim?.kind, velocity:detailSpinVel.toArray(), frame:window.__orbitPerf.renders}; },
    get state() { return state; },
    get frontIndex() { return frontIndex; },
    get ringAngle() { return ringAngle; },
    get reader() { return reader; },
    get queue() { return stepQueue.slice(); },
    get pendingBurst() { return pendingBurst; },
    get N() { return N; },
    get sceneDark() { return sceneDark; },
    advance: (d = 1) => advance(d),
    openFront,
    returnHome,
    goToIndex,
    books: () => slots.map((s) => s && ({ title: s.meta.title, slug: s.meta.slug, meta: s.meta })),
    slots,
    scene,
    renderer,
    atmosphere,
    camera,
    ringGroup,
    get orbitBounds() {
      const b = orbitBounds;
      return b && { min: b.min.toArray().map((v) => +v.toFixed(1)), max: b.max.toArray().map((v) => +v.toFixed(1)) };
    },
    get spinReset() { return spinReset; },
    get lastTapUp() { return lastTapUp; },
    get detailSpin() { return detailSpin; },
  };
}

/* ------------------------------------------------------------------ frame */

let pendingHover = null;
let lastT = performance.now();

function frame(now) {
  frameHandle = 0;
  clearTimeout(idleTimer);
  if (tabHidden || contextLost || (EMBED && !heroVisible)) { lastT = now; return; }

  const dt = Math.min(0.1, (now - lastT) / 1000);
  lastT = now;

  // Render-on-demand: `active` = something moved this frame; sceneDirty =
  // a one-off change landed since the last render. Idle + clean → skip GPU.
  let active = false;
  if (pendingHover) { const point = pendingHover; pendingHover = null; updateHover(point); }

  // Targets change immediately; the actual poses continue easing after leave.
  for(let i=0;i<N;i++) {
    const target=state==='orbit' && hoverIndex===i && !reducedMotion ? (i===frontIndex ? HOVER_LIFT : 1.15) : 0;
    const gap=target-hoverAmounts[i];
    if(Math.abs(gap)>.001) {hoverAmounts[i]+=gap*(1-Math.exp(-12*dt));active=true;}
    else if(hoverAmounts[i]!==target){hoverAmounts[i]=target;active=true;}
  }
  hoverLift=hoverAmounts[frontIndex];
  if(state!=='orbit') hoverTiltTarget.set(0,0);
  if(hoverTilt.distanceTo(hoverTiltTarget)>.0001){hoverTilt.lerp(hoverTiltTarget,1-Math.exp(-12*dt));active=true;}
  else if(!hoverTilt.equals(hoverTiltTarget)){hoverTilt.copy(hoverTiltTarget);active=true;}
  if(pendingPageT!==null && pageDragging){reader.updateDrag(pendingPageT);pendingPageT=null;active=true;}

  if (anim) {
    active = true;
    const u = clamp01((now - anim.t0) / anim.dur);
    const e = settle(u);

    if (anim.kind === 'ringSpin') {
      ringAngle = lerp(anim.fromAngle, anim.toAngle, e);
      const depart = 1 - THREE.MathUtils.smoothstep(u, 0, 0.45);
      const arrive = THREE.MathUtils.smoothstep(u, 0.42, 1);
      frontIndex = anim.toFront;
      frontPresent = arrive;
      updateAllPoses({ [anim.fromFront]: depart, [anim.toFront]: arrive });
      syncTitles();
      if (u >= 1) {
        ringAngle = anim.toAngle;
        frontIndex = targetFront = anim.toFront;
        frontPresent = 1;
        anim = null;
        updateAllPoses({}); syncTitles();
        announce(currentMeta()?.title || '');
        setState('orbit'); pumpBrowse();
      }
    } else if (anim.kind === 'bookFlip') {
      const arriveP = e;
      // Departing already edge-on from ringSpin — only open the arriver.
      // (Entrance: fromFront === toFront; same path.)
      const map = { [anim.toFront]: arriveP };
      frontIndex = anim.toFront;
      frontPresent = arriveP;
      updateAllPoses(map);
      for (let i = 0; i < N; i++) {
        const s = slots[i];
        if (!s) continue;
        s.closed.setTitleVisible(i === anim.toFront && arriveP >= 0.55 && s.visible);
      }
      if (u >= 1) {
        frontIndex = anim.toFront;
        targetFront = anim.toFront;
        frontPresent = 1;
        anim = null;
        updateAllPoses({});
        syncTitles();
        if (slots[frontIndex]) announce(slots[frontIndex].meta.title);
        if (stepQueue.length || pendingBurst) pumpBrowse();
        else setState('orbit');
      }
    } else if (anim.kind === 'pull') {
      applyHeroView(1 - e);
      detailRoot.position.lerpVectors(anim.fromPos, anim.toPos, e);
      detailRoot.quaternion.slerpQuaternions(anim.fromQuat, anim.toQuat, e);
      reader.group.scale.setScalar(lerp(anim.fromScale, anim.toScale, e));
      const camPos = new THREE.Vector3().lerpVectors(anim.fromCamPos, anim.toCamPos, e);
      const camL = new THREE.Vector3().lerpVectors(anim.fromCamLook, anim.toCamLook, e);
      applyCameraPose(camPos, camL, lerp(anim.fromCamFov, anim.toCamFov, e));
      ringGroup.position.x = lerp(anim.fromRingX, ringInspectX(), e);
      ringGroup.position.y = lerp(anim.fromRingY, ringInspectY(), e);
      ringGroup.position.z = lerp(anim.fromRingZ, RING_Z_INSPECT, e);
      ringGroup.scale.setScalar(lerp(anim.fromRingS, ringInspectScale(), e));
      ringGroup.rotation.x = lerp(anim.fromRingTilt, RING_TILT_INSPECT, e);
      if (u >= 1) {
        detailRoot.position.copy(anim.toPos);
        detailRoot.quaternion.copy(anim.toQuat);
        inspectZoom = 0;
        inspectCameraNow(0);
        applyRingFraming(1);
        const meta = anim.meta;
        anim = null;
        setState('inspecting');
        showPanel(meta);
        announce(`${meta.title}. Inspection open.`);
      }
    } else if (anim.kind === 'return') {
      applyHeroView(e);
      reader?.setCover(anim.fromCover * (1-e));
      detailRoot.position.lerpVectors(anim.fromPos, anim.toPos, e);
      detailRoot.quaternion.slerpQuaternions(anim.fromQuat, anim.toQuat, e);
      detailSpin.quaternion.slerpQuaternions(anim.fromSpin, anim.toSpin, e);
      if (reader) reader.group.scale.setScalar(lerp(anim.fromScale, anim.toScale, e));
      const camPos = new THREE.Vector3().lerpVectors(anim.fromCamPos, anim.toCamPos, e);
      const camL = new THREE.Vector3().lerpVectors(anim.fromCamLook, anim.toCamLook, e);
      applyCameraPose(camPos, camL, lerp(anim.fromCamFov, anim.toCamFov, e));
      ringGroup.position.x = lerp(anim.fromRingX, 0, e);
      ringGroup.position.y = lerp(anim.fromRingY, RING_Y_ORBIT, e);
      ringGroup.position.z = lerp(anim.fromRingZ, 0, e);
      ringGroup.scale.setScalar(lerp(anim.fromRingS, 1, e));
      ringGroup.rotation.x = lerp(anim.fromRingTilt, RING_TILT, e);
      if (u >= 1) {
        detailRoot.position.copy(anim.toPos);
        detailRoot.quaternion.copy(anim.toQuat);
        detailSpin.quaternion.copy(anim.toSpin);
        finishReturn();
      }
    }
  } else if (active || sceneDirty) {
    if (state === 'orbit' || state === 'presenting') updateAllPoses({});
  }

  if ((state === 'inspecting' || state === 'reading') && !anim) {
    if (spinReset) {
      const u = clamp01((now - spinReset.t0) / 420);
      const k = settle(u);
      detailSpin.rotation.x = spinReset.x0 * (1 - k);
      detailSpin.rotation.y = spinReset.y0 * (1 - k);
      if (u >= 1) {
        spinReset = null;
        detailSpin.rotation.set(0, 0, 0);
      }
      active = true;
    } else if (!detailDragging && detailSpinVel.lengthSq() > 0) {
      const sx = dampedStep(detailSpinVel.x, dt), sy = dampedStep(detailSpinVel.y, dt);
      detailSpin.rotation.x += sx.delta;
      detailSpin.rotation.y += sy.delta;
      detailSpin.rotation.x = THREE.MathUtils.clamp(detailSpin.rotation.x, -0.85, 0.85);
      detailSpinVel.set(sx.velocity, sy.velocity, 0);
      if (detailSpinVel.lengthSq() < 1e-6) detailSpinVel.set(0, 0, 0);
      active = true;
    }
  }

  if (reader && reader.group.visible) {
    if (reader.update(dt)) active = true;
    if (active || sceneDirty) reader.updateFacing(camera);
    if ((state === 'inspecting' || state === 'reading') && !anim) {
      const cov = reader.getState().cover;
      if (Math.abs(cov - readBias) > 0.001) {
        // Cover already follows a smooth time-based curve. Following its exact
        // progress avoids a long trailing camera drift on slow frame rates.
        readBias = cov;
        inspectCameraNow(); active = true;
      }
      const wantX = inspectBookX + cov * INSPECT_OPEN_SHIFT * reader.group.scale.x / (BOOK_SCALE * 1.55);
      if (Math.abs(detailRoot.position.x - wantX) > 0.001) {
        detailRoot.position.x = wantX;
        active = true;
      }
    }
  }

  if (
    autoBrowse && !hoverFront && !(stage.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) &&
    !reducedMotion &&
    state === 'orbit' &&
    !anim &&
    !stepQueue.length &&
    !pendingBurst &&
    bootReady &&
    stageFullyInView &&
    stageFillsViewport() &&
    !tabHidden &&
    now - lastInteract >= IDLE_MS
  ) {
    lastInteract = now;
    advance(1);
  }

  if (active || sceneDirty) {
    if(sceneDark) updateLamp();
    readingFill.position.copy(camera.position);
    readingFill.target.position.copy(reader?.group.visible ? detailRoot.position : ringCenter);
    // Recheck near-surface safety while rotating, not only when zoom changes.
    if(reader?.group.visible && inspectZoom>0 && !anim && (detailDragging || detailSpinVel.lengthSq()>0 || spinReset)) inspectCameraNow();
  }
  updateCaption();
  updateReaderTools();
  if (active || sceneDirty) grounding.updateDetail(detailRoot.position, reader?.getState().cover || 0, !!reader?.group.visible, sceneDark);

  if (active || sceneDirty) {
    closedBatch?.update();
    if (reader?.group.visible) focusPoint.copy(detailRoot.position);
    else { focusPoint.set(0,PRESENT_LIFT,RING_R+PRESENT_OUT); ringGroup.localToWorld(focusPoint); }
    window.__orbitPerf.scene = atmosphere.render(focusPoint, true);
    window.__orbitPerf.renders = (window.__orbitPerf.renders || 0) + 1;
    sceneDirty = false;
  }
  if (active || anim || sceneDirty) scheduleFrame();
  else if (autoBrowse && !reducedMotion && state === 'orbit' && !hoverFront && heroVisible && !tabHidden && !(stage.contains(document.activeElement) && document.activeElement.matches(':focus-visible'))) {
    idleTimer = setTimeout(invalidate, Math.max(250, IDLE_MS - (performance.now() - lastInteract)));
  }
}

boot().catch((err) => {
  console.error(err);
  if (bootEl.isConnected) bootEl.textContent = 'The 3D preview is unavailable. The library is still free to browse.';
  parent.postMessage({ type: 'orbit-error' }, location.origin);
});
