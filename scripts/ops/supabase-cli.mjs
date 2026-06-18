#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const localBin = resolve('node_modules/.bin/supabase');
const candidates = existsSync(localBin)
  ? [localBin]
  : ['/opt/homebrew/bin/supabase', '/usr/local/bin/supabase', 'supabase'];

let lastError = null;
for (const command of candidates) {
  const result = spawnSync(command, process.argv.slice(2), {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });

  if (result.error) {
    lastError = result.error;
    if (result.error.code === 'ENOENT') continue;
    console.error(`Failed to run Supabase CLI: ${result.error.message}`);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

console.error(
  `Supabase CLI not found. Install it locally or globally. Last error: ${lastError?.message ?? 'not available'}`,
);
process.exit(1);
