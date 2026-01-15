import { defineConfig, devices } from '@playwright/test';

// Use a different port than Lighthouse CI (which uses 4173) to avoid conflicts.
const baseURL = process.env.PW_BASE_URL || 'http://127.0.0.1:4174';

export default defineConfig({
  testDir: './tests/ui',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && PORT=4174 node scripts/serve-prod.mjs',
    url: baseURL,
    // Avoid reusing a potentially stale/broken server from a previous run.
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
