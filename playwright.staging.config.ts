import { defineConfig, devices } from '@playwright/test'

import { validateStagingPreviewTarget } from './lib/staging/preview-target.mjs'

const baseURL = validateStagingPreviewTarget(process.env.STAGING_BASE_URL ?? '').origin
if (!process.env.STAGING_BYPASS_SECRET?.trim()) {
  throw new Error('STAGING_BYPASS_SECRET is required for protected staging browser proof.')
}

export default defineConfig({
  testDir: './tests/accessibility-performance',
  testMatch: 'accessibility-performance.spec.ts',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [{ name: 'staging-mobile-chromium', use: { ...devices['Desktop Chrome'] } }],
})
