import { defineConfig } from '@playwright/test'
import chromium from '@sparticuz/chromium'
const portable = process.platform === 'linux' && !process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.mjs', workers: 1, timeout: 90000,
  expect: { timeout: 15000 }, fullyParallel: false,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:3100', viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure', trace: 'off',
    launchOptions: portable ? { executablePath: await chromium.executablePath(), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] } : { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE },
  },
  webServer: { command: 'node scripts/serve-prod.mjs 3100', url: 'http://127.0.0.1:3100/en', reuseExistingServer: false, timeout: 30000 },
})
