/** Frame-rate-independent, analytically integrated drag inertia (radians/second). */
export function dampedStep(velocity, dt, friction = 5) {
  dt = Math.max(0, Math.min(0.05, Number.isFinite(dt) ? dt : 0));
  const decay = Math.exp(-friction * dt);
  return { delta: velocity * (1 - decay) / friction, velocity: velocity * decay };
}
export function pixelDelta(event, viewportHeight = 900) {
  const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewportHeight : 1;
  return Math.max(-1600, Math.min(1600, event.deltaY * scale));
}
export function shortestDelta(from, to, count) {
  if (count < 1) return 0;
  let d = ((to - from) % count + count) % count;
  if (d > count / 2) d -= count;
  return d;
}
/** Deterministic balanced fill; no adjacent duplicates, including the seam for this catalog. */
export function buildRingOrder(catalog, count) {
  if (!Array.isArray(catalog) || !catalog.length) throw new Error('The book catalog is empty.');
  const output = Array.from({ length: count }, (_, i) => catalog[i % catalog.length]);
  if (count > 1 && catalog.length > 1 && output[0] === output.at(-1)) {
    for (let j = count - 2; j > 0; j--) {
      const last = output.at(-1), swap = output[j];
      if (swap !== output[0] && swap !== output[count - 2] && last !== output[j - 1] && last !== output[j + 1]) {
        [output[j], output[count - 1]] = [last, swap]; break;
      }
    }
  }
  return output;
}
