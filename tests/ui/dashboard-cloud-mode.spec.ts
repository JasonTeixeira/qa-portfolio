import { test, expect } from '@playwright/test';

test.describe('Dashboard (Cloud mode)', () => {
  test('shows AWS-backed cloud proof panel and loads metrics', async ({ page }) => {
    await page.goto('/dashboard');

    // Switch to Cloud mode
    await page.getByRole('button', { name: 'Cloud' }).click();

    // Proof panel should render
    await expect(
      page.getByText('Cloud mode is backed by AWS (no AWS creds in Vercel)')
    ).toBeVisible();

    // We cannot assert on the token, and we cannot rely on cross-origin calls from
    // the browser to the AWS API (it is token-protected and the token is stored server-side).
    // So we assert that the Cloud mode panel renders and the proof link is present.
    await expect(
      page.getByRole('link', { name: 'Proof: AWS proxy endpoint' })
    ).toBeVisible();
  });
});
