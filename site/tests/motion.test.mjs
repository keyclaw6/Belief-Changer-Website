import test from 'node:test'
import assert from 'node:assert/strict'
import { dampedStep, shortestDelta, buildRingOrder, pixelDelta } from '../public/orbit/motion.js'

test('inertia has identical displacement at 30, 60, 120 and 144 Hz', () => {
  const integrate = hz => { let velocity = 4, angle = 0; for (let i = 0; i < hz * 2; i++) { const step = dampedStep(velocity, 1 / hz); velocity = step.velocity; angle += step.delta } return { velocity, angle } }
  const baseline = integrate(60)
  for (const hz of [30, 120, 144]) { const value = integrate(hz); assert.ok(Math.abs(value.angle - baseline.angle) < 1e-12); assert.ok(Math.abs(value.velocity - baseline.velocity) < 1e-12) }
})
test('inertia safely clamps long pauses and invalid time', () => {
  assert.deepEqual(dampedStep(4, 3), dampedStep(4, .05))
  assert.deepEqual(dampedStep(4, NaN), { delta: 0, velocity: 4 })
  assert.deepEqual(dampedStep(4, -1), { delta: 0, velocity: 4 })
})
test('ring is balanced and never repeats adjacent covers at the seam', () => {
  const books = Array.from({ length: 10 }, (_, i) => ({ slug: String(i) }))
  for (const count of [24, 36, 48, 56, 80]) {
    const ring = buildRingOrder(books, count)
    assert.equal(ring.length, count)
    ring.forEach((book, i) => assert.notEqual(book, ring[(i + 1) % count]))
    const counts = books.map(book => ring.filter(b => b === book).length)
    assert.ok(Math.max(...counts) - Math.min(...counts) <= 1)
  }
  assert.throws(() => buildRingOrder([], 36), /empty/)
})
test('shortest path is stable across negative and wrapped indices', () => {
  assert.equal(shortestDelta(0, 35, 36), -1)
  assert.equal(shortestDelta(35, 0, 36), 1)
  assert.equal(shortestDelta(0, 73, 36), 1)
  assert.equal(shortestDelta(0, 0, 0), 0)
})
test('wheel normalizes pixel, line and page delta modes', () => {
  assert.equal(pixelDelta({ deltaY: 4, deltaMode: 1 }), 64)
  assert.equal(pixelDelta({ deltaY: 1, deltaMode: 2 }, 800), 800)
  assert.equal(pixelDelta({ deltaY: 999999, deltaMode: 0 }), 1600)
})
