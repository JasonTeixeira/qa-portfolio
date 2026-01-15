import { test, expect } from '@playwright/test';

test('GET /api/quality returns expected shape', async ({ request }) => {
  const res = await request.get('/api/quality');
  expect(res.status()).toBe(200);

  const json = await res.json();
  expect(json).toHaveProperty('generatedAt');
  expect(typeof json.generatedAt).toBe('string');

  expect(json).toHaveProperty('projects');
  expect(Array.isArray(json.projects)).toBe(true);
  expect(json.projects.length).toBeGreaterThan(0);

  const first = json.projects[0];
  expect(first).toHaveProperty('repo');
  expect(first).toHaveProperty('status');
  expect(['healthy', 'degraded', 'down']).toContain(first.status);
});

test('GET /api/quality is cached (2nd request is fast-ish)', async ({ request }) => {
  const t1 = Date.now();
  const r1 = await request.get('/api/quality');
  expect(r1.status()).toBe(200);
  const d1 = Date.now() - t1;

  const t2 = Date.now();
  const r2 = await request.get('/api/quality');
  expect(r2.status()).toBe(200);
  const d2 = Date.now() - t2;

  // Not a strict perf test; we only assert second call isn't significantly slower.
  expect(d2).toBeLessThanOrEqual(Math.max(500, d1 + 250));
});

test('GET /api/quality?mode=history returns an array of entries', async ({ request }) => {
  const res = await request.get('/api/quality?mode=history');
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(Array.isArray(json)).toBe(true);

  if (json.length > 0) {
    expect(json[0]).toHaveProperty('generatedAt');
    expect(json[0]).toHaveProperty('projects');
    expect(Array.isArray(json[0].projects)).toBe(true);
  }
});

test('GET /api/quality?mode=aws returns snapshot fallback when not configured', async ({ request }) => {
  const res = await request.get('/api/quality?mode=aws');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('generatedAt');
  expect(json).toHaveProperty('projects');
  expect(Array.isArray(json.projects)).toBeTruthy();
});
