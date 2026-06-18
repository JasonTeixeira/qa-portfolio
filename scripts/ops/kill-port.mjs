#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const port = String(process.argv[2] ?? process.env.PORT ?? '3042');

if (!/^\d+$/.test(port)) {
  console.error(`Invalid port: ${port}`);
  process.exit(1);
}

let output = '';
try {
  output = execFileSync('lsof', ['-ti', `tcp:${port}`], { encoding: 'utf8' }).trim();
} catch {
  output = '';
}

const pids = output.split(/\s+/).filter(Boolean);
for (const pid of pids) {
  try {
    process.kill(Number(pid), 'SIGTERM');
    console.log(`Stopped process ${pid} on port ${port}`);
  } catch (error) {
    console.error(`Failed to stop process ${pid} on port ${port}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

if (pids.length === 0) {
  console.log(`No process listening on port ${port}`);
}
