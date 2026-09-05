import { defineConfig } from '@playwright/test'
import chromium from '@sparticuz/chromium'
const portable = process.platform === 'linux' && !process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
const port = Number(process.env.TEST_PORT || 3100)
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.mjs', workers: 1, timeout: 90000,
  expect: { timeout: 15000 }, fullyParallel: false,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: `http://127.0.0.1:${port}`, viewport: portable ? { width: 900, height: 600 } : { width: 1440, height: 900 },
    screenshot: 'only-on-failure', trace: 'off',
    launchOptions: portable ? { executablePath: await chromium.executablePath(), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] } : { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE },
  },
  webServer: { command: `node scripts/serve-prod.mjs ${port}`, url: `http://127.0.0.1:${port}/en`, reuseExistingServer: false, timeout: 30000 },
})
