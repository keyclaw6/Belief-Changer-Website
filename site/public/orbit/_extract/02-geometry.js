
/* 02-geometry.js */
/* ---- geometry.js ---- */
/* Procedural geometry builders. */
window.BK = window.BK || {};
BK.geom = (() => {

  /* Sweep a closed 2D profile along z with rounded rims at both ends.
     profile: [{x,y,seg}] in CCW order (x right, y up).
     uvFn(px, py, z, seg, tAlong) -> [u,v]
     Returns BufferGeometry with one group per distinct seg (plus 'cap'). */
  function sweep(THREE, opts) {
    const { profile: input, zHalf, rim = 0.03, rimSegs = 4, zSegs = 1, uvFn } = opts;

    /* ---- 1. de-duplicate the profile.
       Callers build profiles by pushing a corner point and then a fillet whose
       first or last point is that same corner, so consecutive points were
       exactly coincident. Every such pair swept into a zero-width column of
       zero-area triangles: four pairs on a board produced 72 of them. Keep the
       later point of a coincident run so a new face's first column belongs to
       that face's material group. */
    const profile = [];
    for (let i = 0; i < input.length; i++) {
      const p = input[i], q = input[(i + 1) % input.length];
      if (Math.hypot(q.x - p.x, q.y - p.y) > 1e-7) profile.push(p);
    }
    const n = profile.length;

    // signed area to establish orientation
    let area = 0;
    for (let i = 0; i < n; i++) {
      const a = profile[i], b = profile[(i + 1) % n];
      area += a.x * b.y - b.x * a.y;
    }
    const ccw = area > 0;

    /* ---- 2. inward normal per point, plus the largest inset that point can
       take before the offset folds back through itself. Nothing in the shipped
       profiles asks for more than its corners can give, but a rim wider than a
       corner radius used to be silently allowed. */
    const inward = [], insetCap = new Array(n).fill(Infinity);
    for (let i = 0; i < n; i++) {
      const p = profile[(i - 1 + n) % n], c = profile[i], q = profile[(i + 1) % n];
      const acc = [0, 0];
      for (const [a, b] of [[p, c], [c, q]]) {
        let dx = b.x - a.x, dy = b.y - a.y;
        const L = Math.hypot(dx, dy) || 1;
        dx /= L; dy /= L;
        // left normal for CCW is inward
        acc[0] += ccw ? -dy : dy;
        acc[1] += ccw ? dx : -dx;
      }
      const L = Math.hypot(acc[0], acc[1]) || 1;
      inward.push([acc[0] / L, acc[1] / L]);

      let ax = c.x - p.x, ay = c.y - p.y, bx = q.x - c.x, by = q.y - c.y;
      const la = Math.hypot(ax, ay) || 1, lb = Math.hypot(bx, by) || 1;
      ax /= la; ay /= la; bx /= lb; by /= lb;
      const turn = Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
      const sTurn = Math.abs(Math.sin(turn / 2));
      if ((ccw ? turn > 0 : turn < 0) && sTurn > 1e-9) insetCap[i] = 0.9 * (Math.min(la, lb) / (2 * sTurn));
    }

    // z rings: rim rings + flat rings + rim rings
    const rings = [];
    for (let k = rimSegs; k >= 0; k--) {
      const a = (k / rimSegs) * Math.PI / 2;
      rings.push({ z: -(zHalf - rim) - rim * Math.sin(a), inset: rim * (1 - Math.cos(a)) });
    }
    for (let k = 1; k < zSegs; k++) {
      rings.push({ z: -(zHalf - rim) + (2 * (zHalf - rim)) * (k / zSegs), inset: 0 });
    }
    for (let k = 0; k <= rimSegs; k++) {
      const a = (k / rimSegs) * Math.PI / 2;
      rings.push({ z: (zHalf - rim) + rim * Math.sin(a), inset: rim * (1 - Math.cos(a)) });
    }
    const R = rings.length;

    const insetAt = (r, i) => Math.min(rings[r].inset, insetCap[i]);
    const ringX = (r, i) => profile[i].x + inward[i][0] * insetAt(r, i);
    const ringY = (r, i) => profile[i].y + inward[i][1] * insetAt(r, i);

    // distance travelled around the base profile, in the profile's own units.
    // uvFn receives it directly, so a caller can write a plain unwrap.
    const sAlong = [0];
    for (let i = 1; i <= n; i++) {
      const a = profile[i - 1], b = profile[i % n];
      sAlong.push(sAlong[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
    }

    const pos = [], uv = [], idx = [];
    const emit = (x, y, z, seg, s) => {
      pos.push(x, y, z);
      uv.push(...(uvFn ? uvFn(x, y, z, seg, s) : [s, z]));
    };
    for (let r = 0; r < R; r++) {
      for (let i = 0; i < n; i++) emit(ringX(r, i), ringY(r, i), rings[r].z, profile[i].seg, sAlong[i]);
    }

    // side quads grouped by segment
    const groups = [];
    let gStart = 0, gSeg = profile[0].seg;
    const pushGroup = (end, seg) => groups.push({ start: gStart, count: end - gStart, seg });
    for (let i = 0; i < n; i++) {
      const seg = profile[i].seg;
      if (seg !== gSeg) { pushGroup(idx.length, gSeg); gStart = idx.length; gSeg = seg; }
      for (let r = 0; r < R - 1; r++) {
        const a = r * n + i, b = r * n + ((i + 1) % n);
        const c = (r + 1) * n + ((i + 1) % n), d = (r + 1) * n + i;
        idx.push(a, b, c, a, c, d);
      }
    }
    pushGroup(idx.length, gSeg);

    /* ---- 3. end caps, zipped rather than fanned.
       A fan from the cross-section centroid across a long thin section makes
       every triangle a sliver — 6785:1 on a board — and interpolating normals
       or texture coordinates across those slivers is what made the cloth
       unusable on the head and tail faces. Instead the loop is split at one
       extreme of its dominant axis and at the point half a perimeter away, so
       the two chains carry equal arc length; the chains are then resampled to a
       common count and paired, giving quads that span the short direction.
       Caps always own their vertices, so the flat end face never averages its
       normals into the rounded rim. */
    /* ---- 3. end caps.
       V19 fanned each cap from the cross-section centroid. Across a
       14.4 x 0.29 cm section every one of those 42 triangles was a sliver, up
       to 6785:1, and interpolating normals or texture coordinates over slivers
       that all radiate from one hub is what made the cloth unusable on the head
       and tail faces.

       A genuinely thin section is now laddered instead: the ring is split at its
       two extremes along its dominant axis, and the two resulting chains are
       paired station by station. The pairing parameter is distance travelled
       along the dominant axis, not arc length — pairing by arc length shears the
       ladder whenever the two chains differ in length, which tilts the rungs and
       pushes the corner triangles outside the outline. Measured along x the two
       chains travel exactly the same distance, so the rungs stay square across
       the section.

       Sections that are not thin keep the fan. Their dominant axis is a poor
       pairing parameter — the text block's fore edge is deliberately dented
       inward and barely advances in x while it spans the whole block in y — and
       a fan over a 6:1 section was never the problem.
       Caps always own their vertices, so a flat end face never averages its
       normals into the rounded rim. */
    const buildCap = (r, sign) => {
      const px = [], py = [];
      for (let i = 0; i < n; i++) { px.push(ringX(r, i)); py.push(ringY(r, i)); }
      const spanX = Math.max(...px) - Math.min(...px), spanY = Math.max(...py) - Math.min(...py);
      const z = rings[r].z;
      const start = idx.length;
      const tri = (a, b, c) => {
        const ux = pos[b * 3] - pos[a * 3], uy = pos[b * 3 + 1] - pos[a * 3 + 1];
        const vx = pos[c * 3] - pos[a * 3], vy = pos[c * 3 + 1] - pos[a * 3 + 1];
        const cz = ux * vy - uy * vx;
        if (Math.abs(cz) < 1e-12) return;
        if ((sign > 0) === (cz > 0)) idx.push(a, b, c); else idx.push(a, c, b);
      };
      const done = () => groups.push({ start, count: idx.length - start, seg: 'cap' });

      if (Math.min(spanX, spanY) / Math.max(spanX, spanY, 1e-9) >= 0.10) {
        let cx = 0, cy = 0;
        for (let i = 0; i < n; i++) { cx += px[i]; cy += py[i]; }
        cx /= n; cy /= n;
        const ringBase = pos.length / 3;
        for (let i = 0; i < n; i++) emit(px[i], py[i], z, 'cap', sAlong[i]);
        const ci = pos.length / 3;
        emit(cx, cy, z, 'cap', 0);
        for (let i = 0; i < n; i++) tri(ci, ringBase + i, ringBase + ((i + 1) % n));
        return done();
      }

      /* Ladder the two sides together with a merge walk. Both chains keep every
         one of their own ring vertices, so the cap boundary is the ring exactly:
         it cannot leave a hairline gap against the side wall, and it cannot bulge
         past the silhouette. Advancing whichever side lags along the dominant
         axis keeps the rungs square rather than shearing them, which is what a
         resampled pairing did — and resampling also skipped the fore edge
         entirely, because a vertical run advances the dominant axis by nothing. */
      const dom = spanX >= spanY ? px : py;
      let i0 = 0, i1 = 0;
      for (let i = 1; i < n; i++) { if (dom[i] < dom[i0]) i0 = i; if (dom[i] > dom[i1]) i1 = i; }
      const chain = (dir) => {
        const out = [];
        let i = i0;
        for (let guard = 0; guard <= n; guard++) { out.push(i); if (i === i1) break; i = (i + dir + n) % n; }
        return out;
      };
      const A = chain(1), B = chain(-1);
      const base = pos.length / 3;
      for (let i = 0; i < n; i++) emit(px[i], py[i], z, 'cap', sAlong[i]);
      const V = (i) => base + i;
      let ia = 0, ib = 0;
      let guard = 0;
      while ((ia < A.length - 1 || ib < B.length - 1) && guard++ < 4 * n) {
        const canA = ia < A.length - 1, canB = ib < B.length - 1;
        const advanceA = canA && (!canB || dom[A[ia + 1]] <= dom[B[ib + 1]]);
        if (advanceA) { tri(V(A[ia]), V(A[ia + 1]), V(B[ib])); ia++; }
        else { tri(V(A[ia]), V(B[ib + 1]), V(B[ib])); ib++; }
      }
      return done();
    };
    buildCap(0, -1);
    buildCap(R - 1, 1);

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    // merge groups that share a seg id, preserving order
    const order = [];
    for (const gr of groups) if (!order.includes(gr.seg)) order.push(gr.seg);
    let mi = 0;
    g.userData.segIndex = {};
    for (const seg of order) {
      for (const gr of groups) if (gr.seg === seg) g.addGroup(gr.start, gr.count, mi);
      g.userData.segIndex[seg] = mi++;
    }
    g.computeVertexNormals();
    return g;
  }

  /* Arc of points from angle a0 to a1 about (cx,cy) with radius r. */
  function arcPts(cx, cy, r, a0, a1, steps, seg) {
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (a1 - a0) * (i / steps);
      out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), seg });
    }
    return out;
  }

  /* Rounded corner fillet between three points (quadratic-ish). */
  function fillet(p0, p1, p2, r, steps, seg) {
    const v1 = [p0.x - p1.x, p0.y - p1.y], v2 = [p2.x - p1.x, p2.y - p1.y];
    const l1 = Math.hypot(...v1) || 1, l2 = Math.hypot(...v2) || 1;
    const a = [p1.x + v1[0] / l1 * r, p1.y + v1[1] / l1 * r];
    const b = [p1.x + v2[0] / l2 * r, p1.y + v2[1] / l2 * r];
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * p1.x + t * t * b[0];
      const y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * p1.y + t * t * b[1];
      out.push({ x, y, seg });
    }
    return out;
  }

  /* ---- Text block: convex spine, concave fore-edge, genuinely sharp corners ---- */
  function textBlock(THREE, P) {
    const { pageW, blockT, pageH, yBot, spineBulge, foreDent } = P;
    const yTop = yBot + blockT;
    const pts = [];
    const NB = 30, NF = 26;
    const dentAt = (q) => foreDent * Math.sin(Math.PI * q);
    const bulgeAt = (q) => spineBulge * Math.sin(Math.PI * q);

    /*
       Use one unique vertex at every x/y corner. V17 inserted tiny fillets and
       then inserted the same corner again, producing zero-length profile edges
       that the sweep triangulated into the visible upper fin. The lower fillets
       also created the soft shoulder under the block. This profile keeps only
       the intended curved spine and concave fore-edge; all four face junctions
       are explicit, sharp, non-duplicated vertices.
    */
    pts.push({ x: 0, y: yBot, seg: 'bottomPage' });
    pts.push({ x: pageW, y: yBot, seg: 'foreEdge' });
    for (let i = 1; i < NF; i++) {
      const q = i / NF;
      pts.push({ x: pageW - dentAt(q), y: yBot + blockT * q, seg: 'foreEdge' });
    }
    pts.push({ x: pageW, y: yTop, seg: 'topPage' });
    pts.push({ x: 0, y: yTop, seg: 'spineFace' });
    for (let i = 1; i < NB; i++) {
      const q = 1 - i / NB;
      pts.push({ x: -bulgeAt(q), y: yBot + blockT * q, seg: 'spineFace' });
    }

    return sweep(THREE, {
      profile: pts,
      zHalf: pageH / 2,
      // Almost-square head and tail edges. A microscopic bevel prevents duplicate
      // sweep rings without recreating V17's visibly rounded lower shoulder.
      rim: 0.008, rimSegs: 2, zSegs: 10, splitCaps: true,
      uvFn: (x, y, z, seg) => {
        const ty = Math.max(0, Math.min(1, (y - yBot) / blockT));
        if (seg === 'foreEdge' || seg === 'spineFace') return [ty, (z + pageH / 2) / pageH];
        if (seg === 'cap') return [ty, Math.max(0, Math.min(1, (x + spineBulge) / (pageW + spineBulge)))];
        if (seg === 'topPage') return [x / pageW, (z + pageH / 2) / pageH];
        if (seg === 'bottomPage') return [x / pageW, 1 - (z + pageH / 2) / pageH];
        return [ty, (z + pageH / 2) / pageH];
      },
    });
  }

  /* ---- The text block, built as individual sheets of paper ----------------
     Rounding and backing means every leaf is the same length but its bound edge
     is pushed out by the spine curve, which is exactly why the fore-edge of a
     rounded book is concave. Leaves are gathered into signatures with a slightly
     wider gap between gatherings, and each one carries a little jitter and
     waviness so the fore-edge is never a machined plane. */
  function leafStackFull(THREE, P) {
    const {
      pageW, pageH, blockT, yBot, spineBulge,
      count = 260, xs = 8, zs = 5, sig = 8, fill = 0.66,
    } = P;
    const hash = (i, s) => {
      let h = Math.imul(i | 0, 374761393) ^ Math.imul(s | 0, 668265263);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };
    const nx = xs + 1, nz = zs + 1;
    const perV = 2 * nx * nz + 4 * nz + 4 * nx;
    const perI = 2 * xs * zs * 6 + 2 * zs * 6 + 2 * xs * 6;
    const pos = new Float32Array(count * perV * 3);
    const uv = new Float32Array(count * perV * 2);
    const idx = new Uint32Array(count * perI);
    let vp = 0, ip = 0, vbase = 0;

    // gaps: uniform inside a gathering, wider where two gatherings meet
    const gaps = new Float32Array(count);
    let gsum = 0;
    for (let k = 0; k < count; k++) {
      const g = (k % sig === 0 ? 2.1 : 1.0) + hash(k, 3) * 0.35;
      gaps[k] = g; gsum += g;
    }
    const unit = blockT / gsum;

    let yCur = yBot;
    for (let k = 0; k < count; k++) {
      const pitch = gaps[k] * unit;
      const leafT = pitch * fill;
      const y0 = yCur + (pitch - leafT) * 0.5;
      const y1 = y0 + leafT;
      yCur += pitch;
      const yc = (y0 + y1) * 0.5;
      const bulge = spineBulge * Math.sin(Math.PI * ((yc - yBot) / blockT));
      const xS = -bulge;
      const xF = pageW - bulge + (hash(k, 7) - 0.5) * 0.022;
      // a leaf is never perfectly flat
      const wAmp = 0.0035 + hash(k, 11) * 0.006;
      const wPh = hash(k, 13) * 6.283;
      const wFq = 1.0 + hash(k, 17) * 1.6;
      const fAmp = 0.004 + hash(k, 23) * 0.010;

      const wave = (u, v) =>
        wAmp * Math.sin(wPh + v * Math.PI * wFq) * Math.sin(Math.PI * Math.min(1, u * 1.4));
      const foreOf = (v) => xF + fAmp * Math.sin(wPh * 1.7 + v * Math.PI * 1.3);

      const put = (x, y, z, u, v) => {
        pos[vp * 3] = x; pos[vp * 3 + 1] = y; pos[vp * 3 + 2] = z;
        uv[vp * 2] = u; uv[vp * 2 + 1] = v;
        return vp++;
      };
      const quad = (a, b, c, d) => {
        idx[ip++] = a; idx[ip++] = b; idx[ip++] = c;
        idx[ip++] = a; idx[ip++] = c; idx[ip++] = d;
      };

      // top and bottom surfaces
      const top = vbase, bot = vbase + nx * nz;
      for (let side = 0; side < 2; side++) {
        for (let j = 0; j < nz; j++) {
          const v = j / zs;
          const z = (v - 0.5) * pageH;
          const xf = foreOf(v);
          for (let i = 0; i < nx; i++) {
            const u = i / xs;
            const x = xS + (xf - xS) * u;
            const w = wave(u, v);
            put(x, (side === 0 ? y1 : y0) + w, z, u, v);
          }
        }
      }
      for (let j = 0; j < zs; j++) {
        for (let i = 0; i < xs; i++) {
          const a = top + j * nx + i;
          quad(a, a + 1, a + nx + 1, a + nx);
          const b = bot + j * nx + i;
          quad(b, b + nx, b + nx + 1, b + 1);
        }
      }
      // fore-edge and spine rims
      for (const [i0, out] of [[xs, 1], [0, -1]]) {
        const s = vp;
        for (let j = 0; j < nz; j++) {
          const v = j / zs;
          const z = (v - 0.5) * pageH;
          const xf = foreOf(v);
          const x = xS + (xf - xS) * (i0 / xs);
          const w = wave(i0 / xs, v);
          put(x, y1 + w, z, v, 1);
          put(x, y0 + w, z, v, 0);
        }
        for (let j = 0; j < zs; j++) {
          const a = s + j * 2;
          if (out > 0) quad(a, a + 1, a + 3, a + 2);
          else quad(a, a + 2, a + 3, a + 1);
        }
      }
      // head and tail rims
      for (const [j0, out] of [[zs, 1], [0, -1]]) {
        const s = vp;
        const v = j0 / zs;
        const z = (v - 0.5) * pageH;
        const xf = foreOf(v);
        for (let i = 0; i < nx; i++) {
          const u = i / xs;
          const x = xS + (xf - xS) * u;
          const w = wave(u, v);
          put(x, y1 + w, z, u, 1);
          put(x, y0 + w, z, u, 0);
        }
        for (let i = 0; i < xs; i++) {
          const a = s + i * 2;
          if (out > 0) quad(a, a + 2, a + 3, a + 1);
          else quad(a, a + 1, a + 3, a + 2);
        }
      }
      vbase = vp;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, vp * 3), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv.subarray(0, vp * 2), 2));
    g.setIndex(new THREE.BufferAttribute(idx.subarray(0, ip), 1));
    g.computeVertexNormals();
    g.userData.topY = yCur;
    return g;
  }

  /* Interior leaves are only ever seen along their three exposed edges, so they
     are built as a band that follows the perimeter rather than a whole sheet.
     Modelling the full surface put ~260 layers of overdraw across the entire
     footprint of the book and cost about eighteen seconds a frame; the visible
     result is identical. Only the outermost few leaves are built whole. */
  function leafStack(THREE, P) {
    const {
      pageW, pageH, blockT, yBot, spineBulge,
      count = 260, xs = 8, zs = 5, sig = 8, fill = 0.88,
      band = 0.55, fullEnds = 2,
    } = P;
    const hash = (i, s) => {
      let h = Math.imul(i | 0, 374761393) ^ Math.imul(s | 0, 668265263);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };
    const pos = [], uv = [], idx = [];
    const layerQ = [], leafU = [], leafJitter = [];
    const gaps = new Float32Array(count);
    let gsum = 0;
    for (let k = 0; k < count; k++) {
      const g = (k % sig === 0 ? 1.55 : 1.0) + hash(k, 3) * 0.30;
      gaps[k] = g; gsum += g;
    }
    const unit = blockT / gsum;

    let yCur = yBot;
    for (let k = 0; k < count; k++) {
      const pitch = gaps[k] * unit;
      const leafT = pitch * fill;
      const y0 = yCur + (pitch - leafT) * 0.5;
      const y1 = y0 + leafT;
      yCur += pitch;
      const yc = (y0 + y1) * 0.5;
      const bulge = spineBulge * Math.sin(Math.PI * ((yc - yBot) / blockT));
      const xS = -bulge;
      const xF = pageW - bulge + (hash(k, 7) - 0.5) * 0.020;
      const len = xF - xS;
      const wAmp = pitch * (0.12 + hash(k, 11) * 0.30);
      const wPh = hash(k, 13) * 6.283;
      const wFq = 1.0 + hash(k, 17) * 1.6;
      const fAmp = 0.004 + hash(k, 23) * 0.009;
      const wave = (u, v) =>
        wAmp * Math.sin(wPh + v * Math.PI * wFq) * Math.sin(Math.PI * Math.min(1, u * 1.4));
      const foreOf = (v) => xF + fAmp * Math.sin(wPh * 1.7 + v * Math.PI * 1.3);
      const X = (u, v) => xS + (foreOf(v) - xS) * u;
      const Z = (v) => (v - 0.5) * pageH;
      const full = k < fullEnds || k >= count - fullEnds;
      const q = (yc - yBot) / blockT;
      const jitter = hash(k, 29) - 0.5;
      const base = pos.length / 3;
      const put = (x, y, z, a, b, uMeta = a) => {
        pos.push(x, y, z); uv.push(a, b);
        layerQ.push(q); leafU.push(uMeta); leafJitter.push(jitter);
      };
      const quad = (a, b, c, d) => { idx.push(a, b, c, a, c, d); };

      if (full) {
        const nx = xs + 1, nz = zs + 1;
        const top = base, bot = base + nx * nz;
        for (let side = 0; side < 2; side++)
          for (let j = 0; j < nz; j++) {
            const v = j / zs;
            for (let i = 0; i < nx; i++) {
              const u = i / xs;
              put(X(u, v), (side === 0 ? y1 : y0) + wave(u, v), Z(v), u, v);
            }
          }
        for (let j = 0; j < zs; j++)
          for (let i = 0; i < xs; i++) {
            const a = top + j * nx + i, b = bot + j * nx + i;
            quad(a, a + nx, a + nx + 1, a + 1);   // up
            quad(b, b + 1, b + nx + 1, b + nx);   // down
          }
        // rims
        for (const [u0, out] of [[1, 1], [0, -1]]) {
          const s = pos.length / 3;
          for (let j = 0; j <= zs; j++) {
            const v = j / zs, w = wave(u0, v);
            put(X(u0, v), y1 + w, Z(v), v, 1, u0);
            put(X(u0, v), y0 + w, Z(v), v, 0, u0);
          }
          for (let j = 0; j < zs; j++) {
            const a = s + j * 2;
            if (out > 0) quad(a, a + 2, a + 3, a + 1); else quad(a, a + 1, a + 3, a + 2);
          }
        }
        for (const [v0, out] of [[1, 1], [0, -1]]) {
          const s = pos.length / 3;
          for (let i = 0; i <= xs; i++) {
            const u = i / xs, w = wave(u, v0);
            put(X(u, v0), y1 + w, Z(v0), u, 1);
            put(X(u, v0), y0 + w, Z(v0), u, 0);
          }
          for (let i = 0; i < xs; i++) {
            const a = s + i * 2;
            if (out > 0) quad(a, a + 1, a + 3, a + 2); else quad(a, a + 2, a + 3, a + 1);
          }
        }
      } else {
        // perimeter band: head edge -> fore edge -> tail edge
        const uB = Math.min(0.45, band / len);
        const vB = Math.min(0.45, band / pageH);
        const st = [];
        for (let i = 0; i <= xs; i++) st.push([i / xs, 0]);
        for (let j = 1; j <= zs; j++) st.push([1, j / zs]);
        for (let i = 1; i <= xs; i++) st.push([1 - i / xs, 1]);
        const s0 = pos.length / 3;
        for (const [u, v] of st) {
          const ui = Math.min(u, 1 - uB), vi = Math.min(Math.max(v, vB), 1 - vB);
          const wo = wave(u, v), wi = wave(ui, vi);
          put(X(u, v), y1 + wo, Z(v), u, v);          // outer top
          put(X(ui, vi), y1 + wi, Z(vi), ui, vi);     // inner top
          put(X(ui, vi), y0 + wi, Z(vi), ui, vi);     // inner bottom
          put(X(u, v), y0 + wo, Z(v), u, v);          // outer bottom
        }
        for (let i = 0; i < st.length - 1; i++) {
          const a = s0 + i * 4, b = s0 + (i + 1) * 4;
          quad(a + 0, a + 1, b + 1, b + 0);   // top flange, faces up
          quad(a + 3, b + 3, b + 2, a + 2);   // bottom flange, faces down
          quad(a + 0, b + 0, b + 3, a + 3);   // outer rim, faces out
          quad(a + 1, a + 2, b + 2, b + 1);   // inner rim, faces into the gap
        }
        // close the two open ends near the spine
        for (const [i, sgn] of [[0, -1], [st.length - 1, 1]]) {
          const a = s0 + i * 4;
          if (sgn < 0) quad(a + 3, a + 2, a + 1, a + 0);
          else quad(a + 0, a + 1, a + 2, a + 3);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    g.attributes.position.setUsage(THREE.DynamicDrawUsage);
    g.userData.topY = yCur;
    g.userData.basePosition = new Float32Array(g.attributes.position.array);
    g.userData.layerQ = new Float32Array(layerQ);
    g.userData.leafU = new Float32Array(leafU);
    g.userData.leafJitter = new Float32Array(leafJitter);
    return g;
  }

  /* ---- Board: thin rounded slab, cloth-wrapped ----
     Local frame: origin at the joint-side outer corner, +x outward along the
     board, +y into the book (board thickness), z along page height. */
  function board(THREE, P) {
    const { w, t, h, cornerR } = P;
    const pts = [];
    const r = Math.min(cornerR, t * 0.45);
    /* Span the two long faces instead of crossing each of them with a single
       14.3 cm quad column. Nothing about the shape changes — these are points
       on the same straight line — but the swept quads become reasonably
       proportioned and the end caps inherit enough columns to be well formed. */
    const SPAN = 1.8;
    const run = (x0, x1, y, seg) => {
      const k = Math.max(1, Math.round(Math.abs(x1 - x0) / SPAN));
      for (let i = 0; i < k; i++) pts.push({ x: x0 + (x1 - x0) * (i / k), y, seg });
    };
    // outer face (y=0), from joint side outward
    run(0.0, w - r, 0, 'outer');
    pts.push({ x: w - r, y: 0, seg: 'outer' });
    pts.push(...fillet({ x: w - r, y: 0 }, { x: w, y: 0 }, { x: w, y: r }, r, 4, 'outer'));
    pts.push({ x: w, y: r, seg: 'foreEdge' });
    pts.push({ x: w, y: t - r, seg: 'foreEdge' });
    pts.push(...fillet({ x: w, y: t - r }, { x: w, y: t }, { x: w - r, y: t }, r, 4, 'foreEdge'));
    run(w - r, 0.0, t, 'inner');
    pts.push({ x: 0.0, y: t, seg: 'inner' });
    // joint-side edge, slightly rounded
    pts.push(...fillet({ x: 0.06, y: t }, { x: -0.02, y: t * 0.5 }, { x: 0.06, y: 0 }, 0.05, 4, 'jointEdge'));

    return sweep(THREE, {
      profile: pts,
      zHalf: h / 2,
      rim: 0.055, rimSegs: 5, zSegs: 8,
      /* A plain unwrap of one continuous piece of cloth wrapped around a rigid
         board. u is the real distance travelled around the board's perimeter,
         v the real distance along its height, both expressed in the same unit
         so the weave keeps a single density on every surface: broad faces,
         fore-edge, joint, rims and the head/tail turn-in alike. sAlong is
         supplied by the sweep as true perimeter distance, which is only
         meaningful now that the profile has no coincident points. */
      uvFn: (x, y, z, seg, sAlong) => {
        if (seg === 'cap') return [x / w, z > 0 ? 1 + y / h : -y / h];
        return [sAlong / w, (z + h / 2) / h];
      },
    });
  }

  /* ---- Case spine: a flexible strip of constant arc length ----
     Built each frame from (betaBack, phi, betaFront) at the current opening. */
  function spineStrip(THREE, P) {
    const { steps, zSpans = 6 } = P;
    /* V20.1 rail layout. The backstrip used to be two rails in z, so each of
       its faces was a single quad 21.66 cm tall by half a millimetre wide —
       3477:1. The arc is now sampled a little more coarsely (the chord error is
       5 microns either way) and the height is spanned properly, which brings the
       worst triangle on the case into the same range as everything else.
       Per station: outer levels 0..zSpans, inner levels, then two duplicates of
       the inner rails carrying the head/tail edge's own texture coordinate.
       Sharing those with the inner surface pinned v to 0 and 1 and smeared one
       texel of cloth across the whole thickness of the strip. */
    const RAILS = 2 * (zSpans + 1) + 2;
    const pos = new Float32Array((steps + 1) * RAILS * 3);
    const uv = new Float32Array((steps + 1) * RAILS * 2);
    const idx = [];
    const io = zSpans + 1, eTop = 2 * (zSpans + 1), eBot = eTop + 1;
    for (let i = 0; i < steps; i++) {
      const a = i * RAILS, b = (i + 1) * RAILS;
      for (let k = 0; k < zSpans; k++) {
        // outer surface
        idx.push(a + k, a + k + 1, b + k + 1, a + k, b + k + 1, b + k);
        // inner surface
        idx.push(a + io + k + 1, a + io + k, b + io + k, a + io + k + 1, b + io + k, b + io + k + 1);
      }
      // head edge (z = +zh) and tail edge (z = -zh)
      idx.push(a + zSpans, a + eTop, b + eTop, a + zSpans, b + eTop, b + zSpans);
      idx.push(a + eBot, a + 0, b + 0, a + eBot, b + 0, b + eBot);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.userData.steps = steps;
    g.userData.zSpans = zSpans;
    g.userData.rails = RAILS;
    return g;
  }

  /* Given the case parameters at opening angle, produce the spine centre-line
     and the resulting front-board placement. Everything is arc-length exact. */
  function caseKinematics(P, alpha) {
    const {
      jointX, arcLen, closedPhi, grooveW = 0.55, dip = 0.075,
      maxAlpha = Math.PI,
    } = P;
    // A front-cover opening is deliberately asymmetric. The back joint and the
    // rounded backstrip stay close to their closed geometry; the front groove
    // absorbs nearly all of the visible articulation. betaF is allowed to pass
    // through zero because it is a signed crease angle, not a bend magnitude.
    const total = Math.PI - alpha;
    const k = Math.max(0, Math.min(1, alpha / Math.max(1e-6, maxAlpha)));
    const relax = k * k * (3 - 2 * k);
    const closedBeta = (Math.PI - closedPhi) * 0.5;
    const betaB = closedBeta * (1 - 0.018 * relax);
    // The backstrip still changes much less than the joint, but its upper/front
    // end releases visibly instead of remaining a mathematically perfect arc.
    const phi = closedPhi * (1 - 0.102 * relax);
    const betaF = total - betaB - phi;

    const pts = [];
    // back groove: from the back board's spine edge in to the joint
    const gs = 6;
    for (let i = 0; i <= gs; i++) {
      const t = i / gs;
      const d = dip * Math.sin(Math.PI * t);
      pts.push({ x: jointX + grooveW * (1 - t), y: d });
    }
    // spine arc
    let th = Math.PI - betaB;
    let px = jointX, py = 0;
    const STEPS = 44;
    const ds = arcLen / STEPS;
    // Redistribute the remaining curvature rather than treating the backstrip
    // as a perfect circular arc at every opening angle. The lower/back half is
    // almost unchanged. The upper shoulder carries slightly less curvature and
    // visibly straightens, while a small amount of bend is retained right at
    // the front fold so the cloth still turns naturally into the groove.
    const sm = (x) => {
      x = Math.max(0, Math.min(1, x));
      return x * x * (3 - 2 * x);
    };
    const cw = new Float32Array(STEPS);
    let csum = 0;
    for (let i = 0; i < STEPS; i++) {
      const u = (i + 0.5) / STEPS;
      const shoulder = sm((u - 0.55) / 0.16) * (1 - sm((u - 0.87) / 0.10));
      const frontFold = sm((u - 0.87) / 0.13);
      const w = 1 + relax * (-0.10 * shoulder + 0.05 * frontFold);
      cw[i] = Math.max(0.20, w); csum += cw[i];
    }
    for (let i = 0; i < STEPS; i++) {
      const dPhi = -phi * (cw[i] / csum);
      const tm = th + dPhi * 0.5;
      px += Math.cos(tm) * ds; py += Math.sin(tm) * ds;
      th += dPhi;
      pts.push({ x: px, y: py });
    }
    const frontJoint = { x: px, y: py };
    const boardDir = th - betaF;
    // front groove: from the joint out to the front board's spine edge
    const cx = Math.cos(boardDir), cy = Math.sin(boardDir);
    const nx = Math.sin(boardDir), ny = -Math.cos(boardDir);
    for (let i = 1; i <= gs; i++) {
      const t = i / gs;
      const d = dip * Math.sin(Math.PI * t);
      pts.push({ x: px + cx * grooveW * t + nx * d, y: py + cy * grooveW * t + ny * d });
    }
    const frontBoard = { x: px + cx * grooveW, y: py + cy * grooveW };

    // tangent angle per station, from central differences
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      pts[i].th = Math.atan2(b.y - a.y, b.x - a.x);
    }
    return { pts, phi, betaB, betaF, frontJoint, frontBoard, boardDir, grooveW, relax };
  }

  return { sweep, arcPts, fillet, textBlock, leafStack, leafStackFull, board, spineStrip, caseKinematics };
})();

