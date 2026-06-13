import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  use: {
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'next dev -p 3040',
    url: 'http://localhost:3040',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
