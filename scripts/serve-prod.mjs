import { spawn } from 'node:child_process';

const port = process.env.PORT || '4173';

// Use the local Next.js binary (no network / npx download).
const child = spawn('./node_modules/.bin/next', ['start', '-p', port], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port },
});

// Help Playwright/Lighthouse detect readiness.
console.log(`ready - serving Next.js at http://127.0.0.1:${port}`);

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));

