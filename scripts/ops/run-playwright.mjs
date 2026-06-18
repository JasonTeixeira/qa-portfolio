#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const playwrightBin = resolve('node_modules/.bin/playwright');
const command = existsSync(playwrightBin) ? playwrightBin : 'playwright';
const env = {
  ...process.env,
  PW_BASE_URL: process.env.PW_BASE_URL || process.env.BASE_URL || 'http://localhost:3042',
};

const result = spawnSync(command, process.argv.slice(2), {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(`Failed to run Playwright: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
