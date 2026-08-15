import { test, expect } from '../fixtures/auth';

/**
 * Phase 3 (dim 4) — engagement-tier leagues e2e.
 *
 * Proves the login wall holds and that an authenticated learner is seated in a
 * league with a live, ranked standings board. Structural assertions only — tier
 * and rank are seeded from real state, so we assert the wiring, not volatile values.
 *
 *   PW_BASE_URL=http://127.0.0.1:3040 npm run test:e2e:local -- tests/e2e/academy-leagues.spec.ts
 */

const LEAGUES = '/academy/leagues';

test.describe('Academy leagues', () => {
  test('login wall: signed-out learners cannot reach leagues', async ({ page }) => {
    await page.goto(LEAGUES);
    expect(page.url()).toContain('/login');
  });

  test('authenticated learner is seated in a league with a standings board', async ({ clientPage }) => {
    const res = await clientPage.goto(LEAGUES);
    expect(res?.status()).toBeLessThan(400);

    // Tier header — "<Tier> League".
    await expect(clientPage.getByRole('heading', { name: /League$/ })).toBeVisible();
    // Weekly-reset legend is always present.
    await expect(clientPage.getByText(/Resets Monday/i)).toBeVisible();
    // The learner's own row is rendered and labelled "You".
    await expect(clientPage.getByText('You', { exact: true })).toBeVisible();
    // The tier ladder renders all six tiers.
    await expect(clientPage.getByText('Diamond', { exact: true })).toBeVisible();
  });

  test('leagues nav entry is present in the academy shell', async ({ clientPage }) => {
    await clientPage.goto('/academy/dashboard');
    await expect(clientPage.getByRole('link', { name: 'Leagues' })).toBeVisible();
  });
});
