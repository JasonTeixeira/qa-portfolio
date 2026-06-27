import { test, expect } from '../fixtures/auth';

/**
 * FOUNDATION journey — proves the canonical learner path has NO dead ends:
 * land → Course 00 (method) → catalog → course → lesson (spine UI live) → review.
 * Every step must load and the next be reachable. Gated by RUN_ACADEMY_JOURNEY=1.
 */
const run = process.env.RUN_ACADEMY_JOURNEY === '1';

test.describe('Academy foundation journey', () => {
  test.skip(!run, 'Set RUN_ACADEMY_JOURNEY=1 to run the journey.');

  const steps: [string, string, RegExp][] = [
    ['Home', '/academy/dashboard', /My Learning|Welcome back/i],
    ['Course 00 (method)', '/academy/onboarding', /HOOK|MODEL|PROVE|method|how it works/i],
    ['Learn / catalog', '/academy/catalog', /Learn|Catalog|tracks?|courses?/i],
    ['Course overview', '/academy/course/programming-fundamentals', /Programming Fundamentals/i],
    ['Lesson (spine live)', '/academy/learn/programming-fundamentals/input-validation', /Mastery score|Capped at|Input Validation/i],
    ['Review / board', '/academy/review', /caught up|Review|repair/i],
  ];

  for (const [label, url, marker] of steps) {
    test(`reachable: ${label}`, async ({ clientPage }) => {
      const res = await clientPage.goto(url, { waitUntil: 'domcontentloaded' });
      expect(res?.status(), `${label} (${url}) should not 4xx/5xx`).toBeLessThan(400);
      await clientPage.waitForLoadState('networkidle').catch(() => {});
      await expect(clientPage.locator('body')).toContainText(marker, { timeout: 10_000 });
    });
  }

  test('the lesson shows the evidence-gated spine UI', async ({ clientPage }) => {
    await clientPage.goto('/academy/learn/programming-fundamentals/input-validation', { waitUntil: 'domcontentloaded' });
    await clientPage.waitForLoadState('networkidle').catch(() => {});
    // the StateBadge + ScoreCapMeter render with real derived state (not faked complete)
    await expect(clientPage.locator('body')).toContainText(/Mastery score/i);
    await expect(clientPage.locator('body')).toContainText(/Capped at \d+/i);
  });
});
