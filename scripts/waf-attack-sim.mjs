/**
 * Simple "attack simulation" to demonstrate WAF rate limiting.
 *
 * Usage:
 *   node scripts/waf-attack-sim.mjs --url https://api.sageideas.dev/health --requests 2500
 */

import { setTimeout as delay } from 'node:timers/promises';

function arg(name, def) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return def;
  return process.argv[idx + 1] ?? def;
}

const url = arg('--url', 'https://api.sageideas.dev/health');
const requests = Number(arg('--requests', '2500'));
const concurrency = Number(arg('--concurrency', '25'));
const warmup = Number(arg('--warmup', '2'));

if (!Number.isFinite(requests) || requests <= 0) {
  console.error('Invalid --requests');
  process.exit(1);
}

console.log(JSON.stringify({ msg: 'starting', url, requests, concurrency, warmup }));

// small warmup
for (let i = 0; i < warmup; i++) {
  await fetch(url);
  await delay(100);
}

let ok = 0;
let forbidden = 0;
let other = 0;

let next = 0;
async function worker() {
  while (true) {
    const i = next++;
    if (i >= requests) return;
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status === 200) ok++;
      else if (res.status === 403) forbidden++;
      else other++;
    } catch {
      other++;
    }
  }
}

const start = Date.now();
await Promise.all(Array.from({ length: concurrency }, () => worker()));
const ms = Date.now() - start;

console.log(
  JSON.stringify({
    msg: 'done',
    url,
    requests,
    ok,
    forbidden,
    other,
    seconds: Math.round((ms / 1000) * 10) / 10,
  })
);

