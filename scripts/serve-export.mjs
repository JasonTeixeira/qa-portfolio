import { spawn } from 'node:child_process';

const port = process.env.PORT || '4173';

const child = spawn('npx', ['http-server', 'out', '-p', port, '--silent'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port },
});

// Help Lighthouse CI detect readiness.
console.log(`ready - serving ./out at http://127.0.0.1:${port}`);

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
