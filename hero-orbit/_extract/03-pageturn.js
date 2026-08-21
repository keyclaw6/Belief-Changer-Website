
/* 03-pageturn.js */
/* ---- pageturn.js ---- */
/* A sheet of paper attached at the binding.

   The centre-line of every column is built by integrating a tangent angle along
   arc length, so the sheet can bend but can never stretch. That authored curve
   is then relaxed against gravity and the surfaces it can touch, which is what
   produces contact, drape and the soft settle at the end of a turn. */
window.BK = window.BK || {};
BK.page = (() => {

  /* ---- supports: oriented polylines the paper is not allowed to pass ----
     Segment data is flattened up front; this runs inside the innermost loop of
     the solver and used to dominate the frame. */
  function makeSupport(pts, sign = 1) {
    const n = pts.length - 1;
    const s = new Float32Array(n * 7);
    let minx = Infinity, maxx = -Infinity;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const L2 = dx * dx + dy * dy;
      const L = Math.sqrt(L2) || 1e-6;
      const o = i * 7;
      s[o] = a.x; s[o + 1] = a.y;
      s[o + 2] = dx; s[o + 3] = dy;
      s[o + 4] = L2 > 1e-12 ? 1 / L2 : 0;
      s[o + 5] = -dy / L * sign;
      s[o + 6] = dx / L * sign;
      minx = Math.min(minx, a.x, b.x);
      maxx = Math.max(maxx, a.x, b.x);
    }
    return { s, n, minx, maxx };
  }

  // resolves against the deepest violated segment; returns null when clear
  const _hit = [0, 0];
  function pushOut(px, py, sup, skin) {
    if (px < sup.minx - skin || px > sup.maxx + skin) return null;
    const s = sup.s;
    let bestD = Infinity, bnx = 0, bny = 0, hit = false;
    for (let i = 0, o = 0; i < sup.n; i++, o += 7) {
      const inv = s[o + 4];
      if (inv === 0) continue;
      const rx = px - s[o], ry = py - s[o + 1];
      const t = (rx * s[o + 2] + ry * s[o + 3]) * inv;
      if (t < 0 || t > 1) continue;
      const d = rx * s[o + 5] + ry * s[o + 6];
      if (d < skin && d < bestD) { bestD = d; bnx = s[o + 5]; bny = s[o + 6]; hit = true; }
    }
    if (!hit) return null;
    const push = skin - bestD;
    _hit[0] = px + bnx * push;
    _hit[1] = py + bny * push;
    return _hit;
  }

  /* ---- the deformable leaf ---- */
  class Leaf {
    constructor(THREE, opts) {
      this.THREE = THREE;
      this.nu = opts.nu || 150;      // along the page, root -> fore-edge
      this.nv = opts.nv || 60;       // across the page, head -> tail
      this.W = opts.W;               // page length (arc length, constant)
      this.H = opts.H;               // page height
      this.thick = opts.thick || 0.012;
      const nu = this.nu, nv = this.nv;

      this.cx = new Float32Array((nu + 1) * (nv + 1));
      this.cy = new Float32Array((nu + 1) * (nv + 1));
      // Reused lateral-stiffness work buffers. Keeping them on the leaf avoids
      // allocating two large typed arrays on every cursor move.
      this.smoothX = new Float32Array((nu + 1) * (nv + 1));
      this.smoothY = new Float32Array((nu + 1) * (nv + 1));
      this.prev = null;

      const vcount = (nu + 1) * (nv + 1);
      this.pos = new Float32Array(vcount * 3);
      this.nrm = new Float32Array(vcount * 3);
      const uvA = new Float32Array(vcount * 2);
      const uvB = new Float32Array(vcount * 2);
      for (let j = 0; j <= nv; j++) {
        for (let i = 0; i <= nu; i++) {
          const k = j * (nu + 1) + i;
          uvA[k * 2] = i / nu;
          uvA[k * 2 + 1] = 1 - j / nv;
          uvB[k * 2] = 1 - i / nu;
          uvB[k * 2 + 1] = 1 - j / nv;
        }
      }
      const idxF = [], idxB = [];
      for (let j = 0; j < nv; j++) {
        for (let i = 0; i < nu; i++) {
          const a = j * (nu + 1) + i, b = a + 1, c = a + (nu + 1) + 1, d = a + (nu + 1);
          idxF.push(a, b, c, a, c, d);
          idxB.push(a, c, b, a, d, c);
        }
      }

      /* V20 sheet perimeter.
         The two shells alone left the head, fore-edge and tail open, so a leaf
         caught at a grazing angle showed a zero-thickness silhouette. A single
         rail of vertices pushed half a paper thickness outward closes the sheet
         with a rounded edge: front shell -> rim -> back shell. The rail is
         driven by exactly the same centre surface as the shells, so it follows
         every deformation for free, and it reuses the shell vertices, so it
         costs one extra rail rather than a second perimeter loop.
         Traversal is ordered so that tangent = outward x normal, which makes one
         winding rule valid on all three sides. */
      const ribCentre = [], ribInner = [];
      const at = (i, j) => j * (nu + 1) + i;
      for (let i = 0; i <= nu; i++) { ribCentre.push(at(i, 0)); ribInner.push(at(i === nu ? nu - 1 : i, 1)); }
      for (let j = 1; j <= nv; j++) { ribCentre.push(at(nu, j)); ribInner.push(at(nu - 1, j === nv ? nv - 1 : j)); }
      for (let i = nu - 1; i >= 0; i--) { ribCentre.push(at(i, nv)); ribInner.push(at(i, nv - 1)); }
      const ribCount = ribCentre.length;
      const ribBase = vcount * 2;
      const idxR = [];
      for (let k = 0; k + 1 < ribCount; k++) {
        const ca = ribCentre[k], cb = ribCentre[k + 1];
        const fa = ca, fb = cb, ba = ca + vcount, bb = cb + vcount;
        const ma = ribBase + k, mb = ribBase + k + 1;
        idxR.push(fa, fb, mb, fa, mb, ma);
        idxR.push(ma, mb, bb, ma, bb, ba);
      }

      // Front and back remain distinct shells, but share one BufferGeometry and
      // therefore one draw call. The second half of every attribute belongs to
      // the back shell and keeps its mirrored UV orientation.
      const total = vcount * 2 + ribCount;
      const uvAll = new Float32Array(total * 2);
      uvAll.set(uvA, 0);
      uvAll.set(uvB, uvA.length);
      for (let k = 0; k < ribCount; k++) {
        const src = ribCentre[k];
        uvAll[(ribBase + k) * 2] = uvA[src * 2];
        uvAll[(ribBase + k) * 2 + 1] = uvA[src * 2 + 1];
      }
      const index = new Uint32Array(idxF.length + idxB.length + idxR.length);
      index.set(idxF, 0);
      for (let k = 0; k < idxB.length; k++) index[idxF.length + k] = idxB[k] + vcount;
      index.set(idxR, idxF.length + idxB.length);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(total * 3), 3));
      g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(total * 3), 3));
      g.setAttribute('uv', new THREE.BufferAttribute(uvAll, 2));
      g.setIndex(new THREE.BufferAttribute(index, 1));
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
      this.geo = g;
      this.vcount = vcount;
      this.ribCentre = Int32Array.from(ribCentre);
      this.ribInner = Int32Array.from(ribInner);
      this.ribCount = ribCount;
      this.ribBase = ribBase;
      this.frontTriangleCount = idxF.length / 3;
      // Reused per-update work arrays remove allocation/GC spikes while a page
      // is dragged. These used to be recreated every solver call.
      this.workCol = new Float32Array((nu + 1) * 2);
      this.workCur = new Float32Array((nu + 1) * 2);
      this.workState = {};
      this.rowW = new Float32Array(nv + 1);
      this.rowZ = new Float32Array(nv + 1);
      this.uNode = new Float32Array(nu + 1);
      this.uMid = new Float32Array(nu + 1);
      this.rootGuard = new Float32Array(nu + 1);
      this.startDurBase = new Float32Array(nu + 1);
      for (let j = 0; j <= nv; j++) {
        this.rowW[j] = (j / nv) * 2 - 1;
        this.rowZ[j] = (j / nv - 0.5) * this.H;
      }
      for (let i = 0; i <= nu; i++) {
        const u = i / nu;
        this.uNode[i] = u;
        this.uMid[i] = i === 0 ? 0 : (i - 0.5) / nu;
        const rg = Math.max(0, Math.min(1, (u - 0.055) / 0.20));
        this.rootGuard[i] = rg * rg * (3 - 2 * rg);
        this.startDurBase[i] = 0.35 + (0.205 - 0.35) * u;
      }
    }

    /* Integrate one column's centre-line from the tangent-angle profile.
       During the landing phase the flight profile is blended in angle-space
       toward a separately authored gutter-to-board path. Blending tangents
       rather than vertices keeps every segment at its paper arc length and
       prevents a late-stage fold or local reversal. */
    _authored(out, rootX, rootY, phi, A, kExp, extra, targetAngle, targetBlend = 0, state = null) {
      const nu = this.nu, ds = this.W / nu;
      const blendFn = typeof targetBlend === 'function' ? targetBlend : null;
      const blendConst = blendFn ? 0 : Math.max(0, Math.min(1, targetBlend));
      let x = rootX, y = rootY;
      out[0] = x; out[1] = y;
      for (let i = 1; i <= nu; i++) {
        const u = this.uMid[i];
        const g = 1 - Math.pow(1 - u, kExp);
        let th = phi + A * g;
        if (state && state.ripple) {
          const env = Math.sin(Math.PI * Math.min(1, u * 1.15)) * u;
          th += state.ripple * env * Math.sin((state.lateralW || 0) * 3.1 + (state.rippleP || 0) + u * 2.2);
        } else if (extra) th += extra(u);

        let blend = blendFn ? Math.max(0, Math.min(1, blendFn(u))) : blendConst;
        let tt = null;
        if (state && state.fastTarget) {
          const nearGrab = Math.exp(-0.5 * Math.pow((u - state.fastGrabU) / 0.25, 2));
          const startDur = Math.max(0.155,
            this.startDurBase[i] - state.fastActive * state.fastLeverage * nearGrab * this.rootGuard[i] * 0.036);
          const x0 = Math.max(0, Math.min(1, state.fastT / startDur));
          const startW = 1 - x0 * x0 * (3 - 2 * x0);
          const landStart = 0.505 - 0.060 * u + state.fastActive * (1 - nearGrab) * 0.010;
          const lx = Math.max(0, Math.min(1, (state.fastT - landStart) / 0.30));
          const landW = lx * lx * (3 - 2 * lx);
          const den = startW + landW;
          blend = Math.min(1, den);
          const ra = state.fastRightAngles[i];
          let la = state.fastLeftAngles[i];
          while (la - ra > Math.PI) la -= Math.PI * 2;
          while (la - ra < -Math.PI) la += Math.PI * 2;
          tt = den < 1e-8 ? la : ra + (la - ra) * (landW / den);
        } else if (targetAngle && blend > 0) tt = targetAngle(u);

        if (tt !== null && blend > 0) {
          // Wrap the angle difference in constant time. The old while-loop form
          // could lock the main thread if a malformed sample ever became infinite.
          const delta = Math.atan2(Math.sin(tt - th), Math.cos(tt - th));
          th += delta * blend;
        }
        x += Math.cos(th) * ds;
        y += Math.sin(th) * ds;
        out[i * 2] = x; out[i * 2 + 1] = y;
      }
    }

    /* state:
        rootX, rootY   attachment on the block spine
        phi            tangent angle leaving the binding
        A              total extra bend accumulated out to the fore-edge
        kExp           where that bend concentrates (2 = root-loaded cantilever)
        cone           how much more the head/tail edges bend than the centre
        twist          phase lead across the sheet (a turn is never symmetric)
        ripple         amplitude of the travelling flutter
        gravity, stiffRoot, stiffTip, supports, iters                        */
    _updateFastRest(s) {
      const nu = this.nu, nv = this.nv;
      const col = this.workCol;
      this._authored(
        col, s.rootX, s.rootY, s.phi, s.A, s.kExp || 2.0, null,
        s.targetAngle || null, s.targetBlend || 0, s,
      );
      const colsX = this.cx, colsY = this.cy, pos = this.pos, nrm = this.nrm;
      for (let j = 0; j <= nv; j++) {
        const z = this.rowZ[j];
        const row = j * (nu + 1);
        for (let i = 0; i <= nu; i++) {
          const k = row + i;
          colsX[k] = col[i * 2];
          colsY[k] = col[i * 2 + 1];
          pos[k * 3] = col[i * 2];
          pos[k * 3 + 1] = col[i * 2 + 1];
          pos[k * 3 + 2] = z;
        }
      }
      for (let i = 0; i <= nu; i++) {
        const i0 = i > 0 ? i - 1 : i;
        const i1 = i < nu ? i + 1 : i;
        const dx = col[i1 * 2] - col[i0 * 2];
        const dy = col[i1 * 2 + 1] - col[i0 * 2 + 1];
        const L = Math.hypot(dx, dy) || 1;
        const nx = dy / L, ny = -dx / L;
        for (let j = 0; j <= nv; j++) {
          const k = (j * (nu + 1) + i) * 3;
          nrm[k] = nx; nrm[k + 1] = ny; nrm[k + 2] = 0;
        }
      }
      this._commit();
    }

    update(s) {
      if (s.fastRest && !s.columnState) { this._updateFastRest(s); return; }
      const nu = this.nu, nv = this.nv, ds = this.W / nu;
      const col = this.workCol;
      const cur = this.workCur;
      const colsX = this.cx, colsY = this.cy;
      const skin = s.skin !== undefined ? s.skin : this.thick * 0.75;

      for (let j = 0; j <= nv; j++) {
        const w = this.rowW[j];                       // -1 head .. +1 tail
        // The active turn fills one reusable state object per lateral column.
        // This removes dozens of temporary objects and closures from every frame.
        const q = s.columnState ? s.columnState(w, this.workState) : s;
        const ph = (q.twist || 0) * w;
        const coneK = 1 + (q.cone || 0) * (w * w) + (q.skew || 0) * w;
        const A = q.A * coneK + ph;
        const phi = q.phi + (q.phiSkew || 0) * w;
        q.lateralW = w;
        this._authored(
          col, q.rootX, q.rootY, phi, A, q.kExp || 2.0, null,
          q.targetAngle || null, q.targetBlend || 0, q,
        );

        // ---- relax: authored shape + gravity + inextensibility + contact ----
        cur.set(col);
        const IT = q.iters || 10;
        const g = (q.gravity || 0);
        if (q.fastNoContact && !q.supports) {
          // With no collision surfaces, the repeated pull/gravity recurrence has
          // a closed form. Apply its converged displacement once, then use only
          // a couple of arc-length passes instead of 8-14 full solver iterations.
          if (g !== 0) {
            for (let i = 1; i <= nu; i++) {
              const u = this.uNode[i];
              const stiff = (q.stiffRoot ?? 0.85) * (1 - u) + (q.stiffTip ?? 0.35) * u;
              const a = Math.max(1e-5, stiff * 0.5);
              const gain = (1 - Math.pow(1 - a, IT)) / a;
              cur[i * 2 + 1] -= g * u * u * gain;
            }
          }
          const passes = q.constraintPasses ?? 2;
          for (let pass = 0; pass < passes; pass++) {
            for (let i = 0; i < nu; i++) {
              const ax = cur[i * 2], ay = cur[i * 2 + 1];
              let dx = cur[(i + 1) * 2] - ax, dy = cur[(i + 1) * 2 + 1] - ay;
              const L = Math.hypot(dx, dy) || 1e-6;
              const f = ds / L;
              cur[(i + 1) * 2] = ax + dx * f;
              cur[(i + 1) * 2 + 1] = ay + dy * f;
            }
          }
        } else {
          for (let it = 0; it < IT; it++) {
            for (let i = 1; i <= nu; i++) {
              const u = this.uNode[i];
              const stiff = (q.stiffRoot ?? 0.85) * (1 - u) + (q.stiffTip ?? 0.35) * u;
              cur[i * 2] += (col[i * 2] - cur[i * 2]) * stiff * 0.5;
              cur[i * 2 + 1] += (col[i * 2 + 1] - cur[i * 2 + 1]) * stiff * 0.5;
              cur[i * 2 + 1] -= g * u * u;
            }
            for (let pass = 0; pass < 2; pass++) {
              for (let i = 0; i < nu; i++) {
                const ax = cur[i * 2], ay = cur[i * 2 + 1];
                let dx = cur[(i + 1) * 2] - ax, dy = cur[(i + 1) * 2 + 1] - ay;
                const L = Math.hypot(dx, dy) || 1e-6;
                const f = ds / L;
                cur[(i + 1) * 2] = ax + dx * f;
                cur[(i + 1) * 2 + 1] = ay + dy * f;
              }
            }
            if (q.supports) {
              for (let i = 1; i <= nu; i++) {
                for (const sup of q.supports) {
                  const r = pushOut(cur[i * 2], cur[i * 2 + 1], sup, skin);
                  if (r) { cur[i * 2] = r[0]; cur[i * 2 + 1] = r[1]; }
                }
              }
            }
          }
        }
        // one last length pass: contact projection is the last thing applied
        // above and can leave neighbours coincident, which makes the surface
        // normal undefined and renders as black shards
        for (let i = 0; i < nu; i++) {
          const ax = cur[i * 2], ay = cur[i * 2 + 1];
          let dx = cur[(i + 1) * 2] - ax, dy = cur[(i + 1) * 2 + 1] - ay;
          let L = Math.hypot(dx, dy);
          if (L < 1e-7) { dx = 1; dy = 0; L = 1; }   // degenerate: pick a direction
          const f = ds / L;
          cur[(i + 1) * 2] = ax + dx * f;
          cur[(i + 1) * 2 + 1] = ay + dy * f;
        }
        for (let i = 0; i <= nu; i++) {
          const k = j * (nu + 1) + i;
          colsX[k] = cur[i * 2];
          colsY[k] = cur[i * 2 + 1];
        }
      }

      // Cross-sheet bending stiffness. A real page is not a set of independent
      // cloth strips: curvature introduced at the cursor has to spread through
      // the surrounding paper. Diffuse x/y over the full width, including the
      // two free edges, while keeping the common sewn root untouched.
      const sm = s.smooth ?? 2;
      const lateral = Math.max(0, Math.min(0.82, s.lateralStiffness ?? 0.34));
      const scratchX = this.smoothX;
      const scratchY = this.smoothY;
      for (let p = 0; p < sm; p++) {
        scratchX.set(colsX); scratchY.set(colsY);
        for (let j = 0; j <= nv; j++) {
          const ja = j === 0 ? 1 : j - 1;
          const jb = j === nv ? nv - 1 : j + 1;
          for (let i = 1; i <= nu; i++) {
            const k = j * (nu + 1) + i;
            const a = ja * (nu + 1) + i;
            const b = jb * (nu + 1) + i;
            const neighbour = (colsX[a] + colsX[b]) * 0.5;
            const neighbourY = (colsY[a] + colsY[b]) * 0.5;
            scratchX[k] = colsX[k] + (neighbour - colsX[k]) * lateral;
            scratchY[k] = colsY[k] + (neighbourY - colsY[k]) * lateral;
          }
        }
        colsX.set(scratchX); colsY.set(scratchY);
      }

      // write positions
      const pos = this.pos;
      for (let j = 0; j <= nv; j++) {
        const z = this.rowZ[j];
        for (let i = 0; i <= nu; i++) {
          const k = j * (nu + 1) + i;
          pos[k * 3] = colsX[k];
          pos[k * 3 + 1] = colsY[k];
          pos[k * 3 + 2] = z;
        }
      }
      this._normals();
      this._commit();
    }

    _normals() {
      const nu = this.nu, nv = this.nv, pos = this.pos, nrm = this.nrm;
      for (let j = 0; j <= nv; j++) {
        for (let i = 0; i <= nu; i++) {
          const k = j * (nu + 1) + i;
          const i0 = i > 0 ? k - 1 : k, i1 = i < nu ? k + 1 : k;
          const j0 = j > 0 ? k - (nu + 1) : k, j1 = j < nv ? k + (nu + 1) : k;
          const ux = pos[i1 * 3] - pos[i0 * 3];
          const uy = pos[i1 * 3 + 1] - pos[i0 * 3 + 1];
          const uz = pos[i1 * 3 + 2] - pos[i0 * 3 + 2];
          const vx = pos[j1 * 3] - pos[j0 * 3];
          const vy = pos[j1 * 3 + 1] - pos[j0 * 3 + 1];
          const vz = pos[j1 * 3 + 2] - pos[j0 * 3 + 2];
          let nx = uy * vz - uz * vy;
          let ny = uz * vx - ux * vz;
          let nz = ux * vy - uy * vx;
          const L = Math.hypot(nx, ny, nz);
          if (L > 1e-9) {
            nrm[k * 3] = nx / L; nrm[k * 3 + 1] = ny / L; nrm[k * 3 + 2] = nz / L;
          } else if (i > 0) {                       // reuse the neighbour
            const q = k - 1;
            nrm[k * 3] = nrm[q * 3]; nrm[k * 3 + 1] = nrm[q * 3 + 1]; nrm[k * 3 + 2] = nrm[q * 3 + 2];
          } else {
            nrm[k * 3] = 0; nrm[k * 3 + 1] = 1; nrm[k * 3 + 2] = 0;
          }
        }
      }
    }

    /* Two shells half a paper-thickness either side of the centre surface. */
    _commit() {
      const h = this.thick * 0.5;
      const dst = this.geo.attributes.position.array;
      const dn = this.geo.attributes.normal.array;
      const pos = this.pos, nrm = this.nrm, vcount = this.vcount;
      for (let v = 0; v < vcount; v++) {
        const k = v * 3, b = (v + vcount) * 3;
        dst[k] = pos[k] + nrm[k] * h;
        dst[k + 1] = pos[k + 1] + nrm[k + 1] * h;
        dst[k + 2] = pos[k + 2] + nrm[k + 2] * h;
        dn[k] = nrm[k]; dn[k + 1] = nrm[k + 1]; dn[k + 2] = nrm[k + 2];
        dst[b] = pos[k] - nrm[k] * h;
        dst[b + 1] = pos[k + 1] - nrm[k + 1] * h;
        dst[b + 2] = pos[k + 2] - nrm[k + 2] * h;
        dn[b] = -nrm[k]; dn[b + 1] = -nrm[k + 1]; dn[b + 2] = -nrm[k + 2];
      }
      /* Sheet rim: half a paper thickness outward, along the in-plane direction
         away from the neighbouring interior node. The normal is that same
         outward direction, so the shading rolls smoothly from the front shell
         through the rim to the back shell instead of collapsing at a
         zero-thickness silhouette. */
      const rc = this.ribCentre, ri = this.ribInner, rb = this.ribBase * 3;
      for (let k = 0; k < this.ribCount; k++) {
        const c = rc[k] * 3, n0 = ri[k] * 3, o = rb + k * 3;
        let ox = pos[c] - pos[n0], oy = pos[c + 1] - pos[n0 + 1], oz = pos[c + 2] - pos[n0 + 2];
        const d = ox * nrm[c] + oy * nrm[c + 1] + oz * nrm[c + 2];
        ox -= nrm[c] * d; oy -= nrm[c + 1] * d; oz -= nrm[c + 2] * d;
        const L = Math.hypot(ox, oy, oz) || 1;
        ox /= L; oy /= L; oz /= L;
        dst[o] = pos[c] + ox * h;
        dst[o + 1] = pos[c + 1] + oy * h;
        dst[o + 2] = pos[c + 2] + oz * h;
        dn[o] = ox; dn[o + 1] = oy; dn[o + 2] = oz;
      }
      this.geo.attributes.position.needsUpdate = true;
      this.geo.attributes.normal.needsUpdate = true;
    }

    /* Centre-column polyline, used as the support for the next leaf.
       Coarse on purpose: it is only a contact proxy. */
    centreLine(pieces = 12) {
      const nu = this.nu, j = Math.floor(this.nv / 2);
      const out = [];
      for (let p = 0; p <= pieces; p++) {
        const k = j * (nu + 1) + Math.round((p / pieces) * nu);
        out.push({ x: this.cx[k], y: this.cy[k] });
      }
      return out;
    }
  }

  /* ---- the turn itself ----------------------------------------------------
     t: 0 = lying on the right stack, 1 = lying against the opened cover.
     Everything below was tuned by looking at renders of the sheet mid-flight. */
  const ease = (t) => t * t * (3 - 2 * t);

  function turnState(t, cfg, out = null) {
    const { phi0, phi1, A0, A1 } = cfg;
    const state = out || {};
    const clamp01 = (x) => Math.max(0, Math.min(1, x));

    // The fore-edge still leads, but the root finishes its travel before the
    // final contact phase instead of making a last-second catch-up movement.
    const rootT = ease(clamp01((t - 0.15) / 0.74));
    const phi = phi0 + (phi1 - phi0) * rootT;

    // Preserve the broad middle arch, then start paying its temporary bend out
    // before contact. This prevents the fore-edge from arriving with enough
    // residual curvature to curl back underneath the sheet.
    const rawBell = Math.pow(Math.sin(Math.PI * Math.pow(clamp01(t), 1.02)), 0.62);
    const bendRelease = ease(clamp01((t - 0.55) / 0.35));
    const settle = ease(clamp01((t - 0.72) / 0.26));
    const bell = rawBell * (1 - 0.96 * bendRelease);
    const A = A0 + (A1 - A0) * ease(clamp01(t)) + cfg.Apeak * bell;

    // Keep curvature distributed across a broad part of the sheet. The old
    // high exponent concentrated too much bend beside the gutter and produced
    // a sharp local hook even when the total bend was otherwise reasonable.
    const flightK = 1.20 + 0.45 * ease(Math.min(1, t * 1.65));
    const kExp = flightK * (1 - settle) + 1.18 * settle;

    const airborne = Math.sin(Math.PI * clamp01(t)) ** 0.7;
    // A real sheet may lead slightly at one corner, but the old lateral phase
    // offsets were large enough that a side view looked like several separate
    // strips crossing one another. Keep a restrained asymmetry in mid-flight,
    // then remove it before the landing profile begins to take control.
    const untwist = 1 - ease(clamp01((t - 0.56) / 0.24));
    const air = airborne * untwist;
    state.phi = phi; state.A = A; state.kExp = kExp;
    state.cone = 0.012 * air;
    state.twist = 0.006 * air;
    state.skew = 0.002 * air;
    state.phiSkew = 0.0015 * air;
    state.ripple = 0.003 * air;
    state.gravity = 0.004 * air;
    state.stiffRoot = 0.96;
    state.stiffTip = 0.48 + 0.30 * (1 - air);
    return state;
  }

  return { Leaf, makeSupport, turnState, ease };
})();

