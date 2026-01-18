#!/usr/bin/env node
/*
  Production verification for interview-grade confidence.

  Checks:
  - Dashboard is reachable (HTML)
  - /api/quality snapshot mode returns a valid snapshot
  - /api/quality aws mode returns a valid snapshot and proves the AWS proxy path

  Usage:
    node scripts/verify-prod.mjs

  Env overrides:
    SITE_URL=https://sageideas.dev
*/

const SITE_URL = process.env.SITE_URL || 'https://sageideas.dev';

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`OK: ${msg}`);
}

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: controller.signal,
      headers: {
        'user-agent': 'qa-portfolio-prod-verify/1.0',
        ...(opts.headers || {}),
      },
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

function expect(condition, message) {
  if (!condition) fail(message);
}

function validateQualitySnapshot(payload, modeLabel) {
  expect(payload && typeof payload === 'object', `${modeLabel}: response is not an object`);
  expect(payload.summary && typeof payload.summary === 'object', `${modeLabel}: missing summary`);
  // generatedAt lives at the top-level in our schema (not under summary)
  expect(typeof payload.generatedAt === 'string', `${modeLabel}: generatedAt missing`);
  expect(Array.isArray(payload.projects), `${modeLabel}: projects is not an array`);
  expect(payload.projects.length > 0, `${modeLabel}: projects array is empty`);
}

async function main() {
  console.log(`Verifying production at ${SITE_URL}`);

  // small retry helper for transient edge conditions
  async function retry(fn, { attempts = 3, delayMs = 500 } = {}) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
    throw lastErr;
  }

  // 1) Dashboard
  {
    const url = `${SITE_URL}/dashboard`;
    const res = await fetchWithTimeout(url);
    expect(res.ok, `/dashboard not OK (status ${res.status})`);
    const text = await res.text();
    expect(text.includes('Quality Dashboard'), `/dashboard HTML missing expected title text`);
    ok('/dashboard reachable');
  }

  // 2) Snapshot mode
  {
    const url = `${SITE_URL}/api/quality?mode=snapshot`;
    const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } });
    expect(res.ok, `/api/quality snapshot not OK (status ${res.status})`);
    const json = await res.json();
    validateQualitySnapshot(json, 'snapshot');
    ok('/api/quality?mode=snapshot valid');
  }

  // 3) AWS mode
  {
    const url = `${SITE_URL}/api/quality?mode=aws`;
    const json = await retry(async () => {
      const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`/api/quality aws not OK (status ${res.status})`);
      return res.json();
    });
    validateQualitySnapshot(json, 'aws');

    const source = json?.debug?.source ? String(json.debug.source) : '';
    expect(
      source === 'aws-proxy',
      `aws: expected debug.source === 'aws-proxy'; got: ${source || '(missing)'} (notes: ${json?.summary?.notes || ''})`
    );

    ok('/api/quality?mode=aws valid and confirms aws-proxy source');
  }
}

main().catch((e) => {
  fail(e instanceof Error ? e.message : String(e));
});
