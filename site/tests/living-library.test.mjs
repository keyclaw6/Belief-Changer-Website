import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const tsx = readFileSync(new URL('../src/components/home/LivingLibrary.tsx', import.meta.url), 'utf8')

test('vote counts format with the explicit route locale (SSR/CSR identical)', () => {
  // Regression: bare toLocaleString() formats in the browser locale and
  // hydration-mismatches whenever it differs from the server (e.g. ar-EG).
  assert.ok(!/\.toLocaleString\(\s*\)/.test(tsx), 'no bare toLocaleString() calls')
  assert.match(tsx, /\.toLocaleString\(locale\)/)
})
