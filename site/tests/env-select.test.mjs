import test from 'node:test'
import assert from 'node:assert/strict'
import { selectEnvAsset, envDefaultEnabled, ENV_ASSETS, ENV_NIGHT_MOBILE_PENDING } from '../public/orbit/env-select.js'

test('desktop selects genuine day/night plates, never a shared fallback', () => {
  assert.equal(selectEnvAsset({ mobile: false, dark: false }), ENV_ASSETS.dayDesktop)
  assert.equal(selectEnvAsset({ mobile: false, dark: true }), ENV_ASSETS.nightDesktop)
  assert.notEqual(ENV_ASSETS.dayDesktop, ENV_ASSETS.nightDesktop)
})

test('mobile uses its own portrait plates including a genuine night-mobile', () => {
  assert.equal(selectEnvAsset({ mobile: true, dark: false }), ENV_ASSETS.dayMobile)
  assert.equal(selectEnvAsset({ mobile: true, dark: true }), ENV_ASSETS.nightMobile)
  assert.equal(ENV_NIGHT_MOBILE_PENDING, false)
})

test('environment defaults on; only ?env=0 forces the baseline', () => {
  assert.equal(envDefaultEnabled(''), true)
  assert.equal(envDefaultEnabled('?env=1'), true)
  assert.equal(envDefaultEnabled('?env=0'), false)
  assert.equal(envDefaultEnabled('?locale=ar'), true)
})
