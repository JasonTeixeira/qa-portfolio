import { test, expect } from '../fixtures/auth';

/**
 * Phase 1 — academy habit-loop e2e.
 *
 * Proves the login wall holds and that the habit core (daily-goal ring, streak,
 * level/XP) plus the spaced-review queue actually render for an authenticated
 * learner. Assertions are structural — they verify the wiring is live without
 * pinning volatile, run-to-run state (XP totals, streak length) that would make
 * the suite flaky.
 *
 * Runs against a live server with seeded users:
 *   PW_BASE_URL=http://127.0.0.1:3040 npm run test:e2e:local -- tests/e2e/academy-habit.spec.ts
 */

const DASHBOARD = '/academy/dashboard';

test.describe('Academy habit loop', () => {
  test('login wall: signed-out learners cannot reach the dashboard', async ({ page }) => {
    await page.goto(DASHBOARD);
    // Middleware gates the academy product behind login.
    expect(page.url()).toContain('/login');
  });

  test('habit core renders for an authenticated learner', async ({ clientPage }) => {
    await clientPage.goto(DASHBOARD);

    await expect(clientPage.getByText('My Learning').first()).toBeVisible();

    // The Today panel — the habit core surfaced. Labels are deterministic.
    await expect(clientPage.getByText('Daily goal', { exact: true })).toBeVisible();
    await expect(clientPage.getByText('Streak', { exact: true })).toBeVisible();
    await expect(clientPage.getByText(/^Level \d+$/)).toBeVisible();

    // The daily-goal ring shows an honest percentage (0–100%).
    await expect(clientPage.getByText(/^\d{1,3}%$/).first()).toBeVisible();
  });

  test('spaced-review queue renders a due card or the caught-up state', async ({ clientPage }) => {
    await clientPage.goto('/academy/review');

    const body = (await clientPage.locator('body').innerText()).toLowerCase();
    expect(body).toContain('spaced review');
    // Either a gradeable card is offered, or the learner is caught up — both valid.
    expect(body).toMatch(/reveal|caught up|review complete/);
  });
});
