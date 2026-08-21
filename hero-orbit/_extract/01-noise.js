
/* 01-noise.js */
/* ---- noise.js ---- */
/* Procedural noise utilities. No dependencies. */
window.BK = window.BK || {};
window.BOOK_VERSION = "19.0-performance-pass";
BK.noise = (() => {
  function hash2i(x, y, seed) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10);

  // 2D value noise
  function value2(x, y, seed = 0) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = smooth(xf), v = smooth(yf);
    const a = hash2i(xi, yi, seed), b = hash2i(xi + 1, yi, seed);
    const c = hash2i(xi, yi + 1, seed), d = hash2i(xi + 1, yi + 1, seed);
    return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
  }

  // 2D gradient (perlin-ish) noise, smoother lobes than value noise
  function grad2(x, y, seed = 0) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = smooth(xf), v = smooth(yf);
    const g = (ix, iy, dx, dy) => {
      const a = hash2i(ix, iy, seed) * 6.2831853;
      return Math.cos(a) * dx + Math.sin(a) * dy;
    };
    const n00 = g(xi, yi, xf, yf);
    const n10 = g(xi + 1, yi, xf - 1, yf);
    const n01 = g(xi, yi + 1, xf, yf - 1);
    const n11 = g(xi + 1, yi + 1, xf - 1, yf - 1);
    return (
      ((n00 + (n10 - n00) * u) * (1 - v) + (n01 + (n11 - n01) * u) * v) * 0.5 + 0.5
    );
  }

  function fbm(x, y, oct = 5, lac = 2.0, gain = 0.5, seed = 0, fn = value2) {
    let a = 0.5, f = 1, sum = 0, norm = 0;
    for (let i = 0; i < oct; i++) {
      sum += a * fn(x * f, y * f, seed + i * 131);
      norm += a;
      f *= lac;
      a *= gain;
    }
    return sum / norm;
  }

  // Ridged fbm, good for fibres
  function ridged(x, y, oct = 4, seed = 0) {
    let a = 0.5, f = 1, sum = 0, norm = 0;
    for (let i = 0; i < oct; i++) {
      const n = 1 - Math.abs(grad2(x * f, y * f, seed + i * 77) * 2 - 1);
      sum += a * n * n;
      norm += a;
      f *= 2;
      a *= 0.5;
    }
    return sum / norm;
  }

  return { hash2i, value2, grad2, fbm, ridged, smooth };
})();

